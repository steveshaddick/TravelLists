<?php

/**
 */
class Main {

	public $tripId;
	public $trip;
	public $locations;
	public $notes;
	public $isAdmin = false;

	private $db;
	private $basePath;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;

		if (isset($_SESSION['isAdmin'])) {
			$this->isAdmin = $_SESSION['isAdmin'];
		}

	}

	public function init() {

		try {
			$this->db = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=UTF-8',  DB_USERNAME, DB_PASSWORD);
		} catch (PDOException $e) {
			$this->db = null;
			return false;
		}

		return true;
	}

	public function createTrip($data) {

		require $this->basePath . 'lib/Geocoder.php';

		$tripName = $data['tripName'];
		$userName = $data['userName'];
		$email = Encryptor::encrypt($data['email'], SALT);

		//more validation?

		//TODO: change this to something better, obvs
		$stmt = $this->db->prepare("SELECT _id FROM Lists WHERE adminHash=? OR publicHash=? LIMIT 1");
		do {
			$adminHash = randomString(20);
			$publicHash = randomString(20);
			$stmt->execute(array($adminHash, $publicHash));
			$duplicate = $stmt->fetchAll();
		} while (count($duplicate) !== 0);

		$now = date( 'Y-m-d H:i:s');

		$location = Geocoder::getLocation($tripName);
		if ($location === false) {
			$location = array('lat'=>0, 'lng'=> 0);
		}

		$stmt = $this->db->prepare("INSERT INTO Lists SET adminHash=?, publicHash=?, tripName=?, userName=?, email=?, lat=?, lng=?, dateCreated='$now'");
		$stmt->execute(array($adminHash, $publicHash, $tripName, $userName, $email, $location['lat'], $location['lng']));

		if (!isset($_SESSION['addedNotes'])) {
			$_SESSION['addedNotes'] = array();
		}

		/*$subject = 'A new subject';

		$html = '<!doctype html><head></head><body>';
		$html .= '<div style="background:#FAFAFA; padding:10px;">';
		$html .= '<div style="max-width:600px">';
		$html .= 'Here is your link: ';
		$html .= '<img style="padding-top:25px;" src="" width="175" height="29" alt="Steve Shaddick" />';
		$html .= '</div>';
		$html .= '</div>';
		$html .= '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7d7d7d; margin-top:10px;">To unsubscribe from this newsletter, go here: <a href="http://www.steveshaddick.com/unsubscribe/%unsub_num%">http://www.steveshaddick.com/unsubscribe/%unsub_num%</a></p>';
		$html .= '</body></html>';

		$html = str_replace("<h1>", '<h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:16px;color:#333">', $html);
		$html = str_replace("<p>", '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7d7d7d; margin-top:10px;">', $html);

		$subs = array();
		foreach ($emails as $email) {
			$mail->addTo($email['email']);

			$subs []= $email['rando'] . "_" .  $email['_id'];
		}

		$mail->setFrom("steve@steveshaddick.com");

		$mail->setSubject($subject);

		$mail->setHtml($html);
		$mail->setText(html2text($html));
		$mail->addSubstitution("%unsub_num%", $subs);
		
		$response = $sendgrid->web->send($mail);*/

		return array('tripHash'=>$adminHash);

	}

	public function getTripList() {

		if (!isset($_GET['id']) || ($_GET['id'] == '')) {
			return false;
		}

		$list = $_GET['id'];


		$stmt = $this->db->prepare("SELECT * FROM Lists WHERE adminHash=? OR publicHash=? LIMIT 1");
		$stmt->execute(array($list, $list));
		$this->trip = $stmt->fetch();

		if ($stmt->rowCount() == 0) {
			return false;
		}

		$this->isAdmin = $_SESSION['isAdmin'] = ($this->trip['adminHash'] == $list);
		$_SESSION['trip_id'] = intval($this->trip['_id']);
		
		return true;

	}

	public function loadTrip() {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}

		$tripId = $_SESSION['trip_id'];

		$stmt = $this->db->prepare("SELECT * FROM Locations WHERE trip_id=? ORDER BY listOrder");
		$stmt->execute(array($tripId));
		
		$locations = array();
		$locationsById = array();
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			
			$location = array(
				'id'=>$row['_id'],
				'name'=>stripslashes($row['name']),
				'listOrder'=>$row['listOrder'],
				'notes'=>array()
				);

			$locations []= $location;
			$locationsById[$row['_id']] = &$locations[count($locations) - 1];
		}

		$stmt = $this->db->prepare("SELECT * FROM Notes WHERE trip_id=? ORDER BY category_id, listOrder");
		$stmt->execute(array($tripId));

		while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$note = array(
				'id'=>$row['_id'],
				'categoryId'=>$row['category_id'],
				'from'=>stripslashes($row['from']),
				'note'=>stripslashes($row['note']),
				'link'=>$row['link'],
				'listOrder'=>$row['listOrder']
				);

			if ($this->isAdmin) {
				$note['canDelete'] = true;
			} else {
				$note['canDelete'] = (isset($_SESSION['addedNotes'][$row['_id']])) ? true : false;
			}

			$locationsById[$row['location_id']]['notes'] []= $note;
		}

		return array('locations'=>$locations);

	}


	public function addLocation($location) {
		
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];

		$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM Locations WHERE trip_id=?");
		$stmt->execute(array($tripId));
		$row = $stmt->fetch();
		
		$listOrder = $row['total'] + 1;

		$stmt = $this->db->prepare("INSERT INTO Locations SET trip_id=?, name=?, listOrder=?");
		$stmt->execute(array($tripId, $location, $listOrder));

		$id = $this->db->lastInsertId();

		return array('id'=>$this->db->lastInsertId(), 'name'=>$location, 'notes'=>array(), 'listOrder'=>$listOrder);
	}

	public function addNote($note) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];
		
		if (!$this->isAdmin) {
			return false;
		}

		$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM Notes WHERE trip_id=? AND location_id=? AND category_id=?");
		$stmt->execute(array($tripId, $note['locationId'], $note['categoryId']));
		$row = $stmt->fetch();

		$listOrder = $row['total'] + 1;


		$stmt = $this->db->prepare("INSERT INTO Notes SET trip_id=?, location_id=?, category_id=?, note=?, listOrder=?");
		$stmt->execute(array($tripId, $note['locationId'], $note['categoryId'], $note['note'], $listOrder));

		$noteId = $this->db->lastInsertId();

		$_SESSION['addedNotes'][$noteId] = true;
		return array('id'=>$noteId, 'listOrder'=>$listOrder, 'canDelete'=>true);

	}

	public function deleteNote($noteId) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];
		
		$noteId = intval($noteId);
		if (!$this->isAdmin) {
			if ($_SESSION['addedNotes'][$noteId] !== true) {
				return false;
			}
		}	

		$stmt = $this->db->prepare("DELETE FROM Notes WHERE trip_id=? AND _id=?");
		if ($stmt->execute(array($tripId, $noteId))) {
			return true;
		} else {
			return false;
		}

	}

	public function deleteLocation($locationId) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];

		if (!$this->isAdmin) {
			return false;
		}

		$stmt = $this->db->prepare("DELETE FROM Notes WHERE trip_id=? AND location_id=?");
		$stmt->execute(array($tripId, $locationId));

		$stmt = $this->db->prepare("DELETE FROM Locations WHERE trip_id=? AND _id=?");
		$stmt->execute(array($tripId, $locationId));

		return true;
	}

	public function saveTrip($arr) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];

		$tripTitle = $arr['tripTitle'];
		$tripSubtitle = $arr['tripSubtitle'];

		$stmt = $this->db->prepare("UPDATE Lists SET tripName=?, subtitle=? WHERE _id=?");
		$stmt->execute(array($tripTitle, $tripSubtitle, $tripId));

		return true;

	}
}

?>