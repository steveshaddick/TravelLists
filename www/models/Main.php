<?php

/**
 */
class Main {

	public $tripId;
	public $trip;
	public $locations;
	public $notes;
	public $isEditMode = false;

	private $db;
	private $basePath;
	private $errorLogger;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;

		require $this->basePath . 'lib/Geocoder.php';
		require $this->basePath . 'lib/ErrorLogger.php';

		$this->errorLogger = new ErrorLogger(ERROR_LOG_PATH);

		if (isset($_SESSION['isEditMode'])) {
			$this->isEditMode = $_SESSION['isEditMode'];
		}

	}

	public function init() {

		try {
			$this->db = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=UTF-8',  DB_USERNAME, DB_PASSWORD);
		} catch (PDOException $e) {
			$this->db = null;
			echo $e->getMessage();
			return false;
		}

		return true;
	}

	public function sendEmail($email) {

		require_once $this->basePath . 'lib/html2text.php';
		require_once $this->basePath . 'lib/sendgrid-php/SendGrid_loader.php';
		
		$encryptedEmail = Encryptor::encrypt($email, SALT);
		$stmt = $this->db->prepare("SELECT * FROM Lists WHERE email=?");
		$stmt->execute(array($encryptedEmail));

		if ($stmt->rowCount() > 0) {
			
			$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);
			$mail = new SendGrid\Mail();

			require_once $this->basePath . 'views/email/forgotTrips.php';

			$subject = $emailContent['subject'];

			$html = $emailContent['head'];
			$html .= $emailContent['beforeItems'];
			while($row = $stmt->fetch()) {
				$html .= str_replace(array('$TRIP_NAME$', '$TRIP_LINK$'), array($row['tripName'], 'http://' . SITE_URL . $row['publicHash']), $emailContent['tripItem']);
			}
			$html .= $emailContent['afterItems'];
			$html .= $emailContent['foot'];
			$html = str_replace(array("\r\n", "\n", "\r"), "", $html);

			$mail->addTo($email);
			$mail->setFrom("forgot.trip@maketripnotes.com");
			$mail->setSubject($subject);
			$mail->setHtml($html);
			$mail->setText(html2text($html));
			
			$responseRaw = $sendgrid->web->send($mail);
			$response = json_decode($responseRaw);

			if ($response->message != 'success') {
			}
		} else {
			$message = "no trips";
		}

		return array('message'=>'');

	}

	public function createTrip($data) {

		require_once $this->basePath . 'lib/html2text.php';
		require_once $this->basePath . 'lib/sendgrid-php/SendGrid_loader.php';

		$tripName = trim($data['tripName']);
		$userName = trim($data['userName']);
		$email = Encryptor::encrypt(trim($data['email']), SALT);
		$location = trim($data['location']);

		//more validation?

		if (empty($tripName) || empty($userName) || empty($email)) {
			return false;
		}

		//TODO: change this to something better
		$stmt = $this->db->prepare("SELECT _id FROM Lists WHERE adminHash=? OR publicHash=? LIMIT 1");
		do {
			$adminHash = randomString(20);
			$publicHash = randomString(20);
			$stmt->execute(array($adminHash, $publicHash));
			$duplicate = $stmt->fetchAll();
		} while (count($duplicate) !== 0);

		$now = date( 'Y-m-d H:i:s');

		$tripLocation = Geocoder::getLocation($location);
		if ($tripLocation === false) {
			$tripLocation = array('lat'=>0, 'lng'=> 0);
		}

		$subtitle = 'by '.$userName;
		
		$stmt = $this->db->prepare("INSERT INTO Lists SET adminHash=?, publicHash=?, tripName=?, subtitle=?, userName=?, email=?, lat=?, lng=?, dateCreated='$now'");
		$stmt->execute(array($adminHash, $publicHash, $tripName, $subtitle, $userName, $email, $tripLocation['lat'], $tripLocation['lng']));

		$_SESSION['trip_id'] = $this->db->lastInsertId();

		if (!isset($_SESSION['addedNotes'])) {
			$_SESSION['addedNotes'] = array();
		}

		$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);
		$mail = new SendGrid\Mail();

		require_once $this->basePath . 'views/email/welcome.php';

		$subject = str_replace('$TRIP_NAME$', $tripName, $emailContent['subject']);

		$html = $emailContent['head'];
		$html .= str_replace('$TRIP_LINK$', 'http://' . SITE_URL . $publicHash, $emailContent['body']);
		$html .= $emailContent['foot'];

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

		$this->addLocation($location);

		return array('tripHash'=>$adminHash);

	}

	public function getTripList($id) {

		if (empty($id)) {
			return false;
		}

		$list = $id;


		$stmt = $this->db->prepare("SELECT * FROM Lists WHERE adminHash=? OR publicHash=? LIMIT 1");
		$stmt->execute(array($list, $list));
		$this->trip = $stmt->fetch();

		if ($stmt->rowCount() == 0) {
			return false;
		}

		$_SESSION['trip_id'] = intval($this->trip['_id']);

		$_SESSION['trip'] = array();
		$_SESSION['trip']['tripName'] = $this->trip['tripName'];
		$_SESSION['trip']['tripAuthor'] = $this->trip['userName'];
		 
		
		return true;

	}

	public function fetchTrip($lastLocation = 0 , $lastNote = 0, $lastNotice = 0) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}

		$tripId = $_SESSION['trip_id'];

		$stmt = $this->db->prepare("SELECT * FROM Locations WHERE trip_id=? AND _id > ? ORDER BY listOrder");
		$stmt->execute(array($tripId, $lastLocation));
		
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

		$stmt = $this->db->prepare("SELECT * FROM Notes WHERE trip_id=? AND _id > ? ORDER BY category_id, listOrder");

		$stmt->execute(array($tripId, $lastNote));

		$notes = array();
		while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$note = array(
				'id'=>intval($row['_id']),
				'categoryId'=>$row['category_id'],
				'fromName'=>stripslashes($row['fromName']),
				'note'=>stripslashes($row['note']),
				'locationId'=>$row['location_id'],
				'linkUrl'=>$row['linkUrl'],
				'linkImage'=>$row['linkImage'],
				'linkTitle'=>$row['linkTitle'],
				'linkDescription'=>$row['linkDescription'],
				'linkCheck'=>$row['linkCheck'],
				'listOrder'=>$row['listOrder']
				);


			if ($this->isEditMode) {
				$note['canDelete'] = true;
			} else {
				$note['canDelete'] = (isset($_SESSION['addedNotes'][$row['_id']])) ? true : false;
			}
			if (isset($locationsById[$row['location_id']])) {
				$locationsById[$row['location_id']]['notes'] []= $note;
			} else {
				$notes []= $note;
			}
		}

		$notices = array();

		//TODO: notices
		if ($this->isEditMode) {
			$stmt = $this->db->prepare("SELECT * FROM Notices WHERE trip_id=? AND isSeen=0 AND _id > ? ORDER BY dateAdded");
			$stmt->execute(array($tripId, $lastNotice));

			while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
				$notices []= $row;
			}
		}

		return array('locations'=>$locations, 'notes'=>$notes, 'notices'=>$notices);

	}


	public function addLocation($name) {
		
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		if (!$this->isEditMode) {
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
		

		$stmt = $this->db->prepare("SELECT COUNT(*) as total FROM Notes WHERE trip_id=? AND location_id=? AND category_id=?");
		$stmt->execute(array($tripId, $note['locationId'], $note['categoryId']));
		$row = $stmt->fetch();

		$listOrder = $row['total'] + 1;

		$linkUrl = '';
		$linkTitle ='';
		$linkDescription = '';
		$linkImage = '';
		$nextCheck = 0;

		$note['note'] = preg_replace('/[^http:\/\/]\bwww\./i', ' http://www.', $note['note']);
		if (substr($note['note'],0, 4) == 'www.') {
			$note['note'] = 'http://' . $note['note'];
		}
		preg_match("/(\(?\bhttps?:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|])/", $note['note'], $match);
		if (count($match) > 0) {
			$linkUrl = $match[0];
		}

		if ($linkUrl != '') {

			$stmt = $this->db->prepare("SELECT linkTitle, linkImage, linkDescription, nextCheck FROM LinkMetaData WHERE url=?");
			$stmt->execute(array($linkUrl));
			
			if ($stmt->rowCount() > 0) {
				$row = $stmt->fetch();
				$linkTitle = $row['linkTitle'];
				$linkImage = $row['linkImage'];
				$linkDescription = $row['linkDescription'];
				$nextCheck = $row['nextCheck'];
			}
		}


		$stmt = $this->db->prepare("INSERT INTO Notes SET trip_id=?, location_id=?, category_id=?, fromName=?, note=?, linkUrl=?, linkTitle=?, linkImage=?, linkDescription=?, linkCheck=?, listOrder=?");
		$stmt->execute(array($tripId, $note['locationId'], $note['categoryId'], $note['fromName'], $note['note'], $linkUrl, $linkTitle, $linkImage, $linkDescription, $nextCheck, $listOrder));

		$noteId = $this->db->lastInsertId();

		$_SESSION['addedNotes'][$noteId] = true;
		return array('id'=>$noteId, 'listOrder'=>$listOrder, 'fromName'=>$note['fromName'], 'note'=>$note['note'], 'linkUrl'=>$linkUrl, 'linkTitle'=>$linkTitle, 'linkImage'=>$linkImage, 'linkDescription'=>$linkDescription, 'linkCheck'=>$nextCheck, 'canDelete'=>true);

	}

	public function deleteNote($noteId) {
		if (!isset($_SESSION['trip_id'])) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];
		
		$noteId = intval($noteId);
		if (!$this->isEditMode) {
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
		if (!$this->isEditMode) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];


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
		if (!$this->isEditMode) {
			return false;
		}
		$tripId = $_SESSION['trip_id'];

		foreach ($arr as $key=>$value) {
			switch ($key) {
				case 'tripTitle':
					$stmt = $this->db->prepare("UPDATE Lists SET tripName=? WHERE _id=?");
					$stmt->execute(array($arr['tripTitle'], $tripId));
					break;

				case 'tripSubtitle':
					$stmt = $this->db->prepare("UPDATE Lists SET subtitle=? WHERE _id=?");
					$stmt->execute(array($arr['tripSubtitle'], $tripId));
					break;

				case 'noteOrder':
					$order = 1;
					foreach ($value['notes'] as $note) {
						$stmt = $this->db->prepare("UPDATE Notes SET listOrder=? WHERE _id=?");
						$stmt->execute(array($order, $note));
						$order ++;
					}
					break;
			}
		}


		return true;

	}

	public function checkLink($noteId, $url) {

		require $this->basePath . 'lib/URLMetaData.php';
		
		$metaData = false;
		$nextCheck = time() + (60 * 60 * 24 * 365);
		$updateLink = false;
		
		$stmt = $this->db->prepare("SELECT linkTitle, linkImage, linkDescription, nextCheck FROM LinkMetaData WHERE url=?");
		$stmt->execute(array($url));
		
		if ($stmt->rowCount() == 0) {
			$metaData = URLMetaData::getMetaData($url);
			$updateLink = true;
		
		} else {
			$row = $stmt->fetch();

			$metaData['title'] = $row['linkTitle'];
			$metaData['image'] = $row['linkImage'];
			$metaData['description'] = $row['linkDescription'];
		}

		if ($metaData !== false) {

			$stmt = $this->db->prepare("UPDATE Notes SET linkTitle=?, linkImage=?, linkDescription=?, linkCheck=$nextCheck WHERE _id=?");
			$stmt->execute(array($metaData['title'], $metaData['image'], $metaData['description'], $noteId));

			if ($updateLink) {
				$stmt = $this->db->prepare("INSERT INTO LinkMetaData (url, linkTitle, linkImage, linkDescription, nextCheck) VALUES (?, ?, ?, ?, $nextCheck) ON DUPLICATE KEY UPDATE linkTitle=?, linkImage=?, linkDescription=?, nextCheck=$nextCheck");
				$stmt->execute(array($url, $metaData['title'], $metaData['image'], $metaData['description'], $metaData['title'], $metaData['image'], $metaData['description']));
			}

		} else {
			return false;
		}

		return array('linkTitle'=>$metaData['title'], 'linkImage'=>$metaData['image'], 'linkDescription'=>$metaData['description'], 'linkCheck'=>$nextCheck);

	}

	public function checkEditMode($email) {
		$_SESSION['isEditMode'] = true;
		return true;

		$email = Encryptor::encrypt($email, SALT);
		
		$tripId = $_SESSION['trip_id'];
		$stmt = $this->db->prepare("SELECT _id FROM Lists WHERE email=? AND _id=? LIMIT 1");
		$stmt->execute(array($email, $tripId));
		
		if ($stmt->rowCount() == 0) {
			return false;
		} else {
			$_SESSION['isEditMode'] = true;
			return true;
		}


	}
}

?>