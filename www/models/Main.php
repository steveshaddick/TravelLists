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
	private $errorLogger;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;

		require $this->basePath . 'lib/Geocoder.php';
		require $this->basePath . 'lib/ErrorLogger.php';

		$this->errorLogger = new ErrorLogger(ERROR_LOG_PATH);

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

		require_once $this->basePath . 'lib/html2text.php';
		require_once $this->basePath . 'lib/sendgrid-php/SendGrid_loader.php';


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

		$subtitle = 'by '.$userName;
		
		$stmt = $this->db->prepare("INSERT INTO Lists SET adminHash=?, publicHash=?, tripName=?, subtitle=?, userName=?, email=?, lat=?, lng=?, dateCreated='$now'");
		$stmt->execute(array($adminHash, $publicHash, $tripName, $subtitle, $userName, $email, $location['lat'], $location['lng']));

		if (!isset($_SESSION['addedNotes'])) {
			$_SESSION['addedNotes'] = array();
		}

		$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);
		$mail = new SendGrid\Mail();

		$subject = 'Email Subject';

		$html = '<!doctype html><head></head><body>';
		$html .= 'Admin Link: <a href="http://' . SITE_URL . '/list/' . $adminHash . '">http://' . SITE_URL . '/list/' . $adminHash . '</a><br />';
		$html .= 'Public Link: <a href="http://' . SITE_URL . '/list/' . $publicHash . '">http://' . SITE_URL . '/list/' . $publicHash . '</a><br />';
		$html .= '</body></html>';

		//$html = str_replace("<h1>", '<h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:16px;color:#333">', $html);
		//$html = str_replace("<p>", '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7d7d7d; margin-top:10px;">', $html);

		$mail->addTo($data['email']);
		$mail->setFrom("welcome@maketripnotes.com");
		$mail->setSubject($subject);
		$mail->setHtml($html);
		$mail->setText(html2text($html));
		
		$responseRaw = $sendgrid->web->send($mail);
		$response = json_decode($responseRaw);

		if ($response->message != 'success') {
			$this->errorLogger->log(array(
				'error'=>'Email Failed',
				'message'=> $responseRaw,
				'publichash'=>$publicHash)
			);
		}

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
				'lat'=>$row['lat'],
				'lng'=>$row['lng'],
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


	public function addLocation($name) {
		
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];

		$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM Locations WHERE trip_id=?");
		$stmt->execute(array($tripId));
		$row = $stmt->fetch();
		
		$listOrder = $row['total'] + 1;

		$location = Geocoder::getLocation($name);
		if ($location === false) {
			$location = array('lat'=>0, 'lng'=> 0);
		}

		$stmt = $this->db->prepare("INSERT INTO Locations SET trip_id=?, name=?, lat=?, lng=?, listOrder=?");
		$stmt->execute(array($tripId, $name, $location['lat'], $location['lng'], $listOrder));

		$id = $this->db->lastInsertId();

		return array('id'=>$this->db->lastInsertId(), 'name'=>$name, 'lat'=>$location['lat'], 'lng'=>$location['lng'], 'notes'=>array(), 'listOrder'=>$listOrder);
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