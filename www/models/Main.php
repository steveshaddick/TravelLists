<?php

/**
 */
class Main {

	
	private $db;
	private $basePath;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;

		try {
			$this->db = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=UTF-8',  DB_USERNAME, DB_PASSWORD);
		} catch (PDOException $e) {
			$this->db = null;
		}
	}

	public function createTrip($data) {

		if ($this->db == null) return false;

		$tripName = $data['tripName'];
		$name = $data['userName'];
		$email = Encryptor::encrypt($data['email'], SALT);

		//more validation?

		//TODO: change this to something better, obvs
		$stmt = $this->db->prepare("SELECT hash FROM Lists WHERE hash=? LIMIT 1");
		do {
			$tripHash = randomString(16);
			$stmt->execute(array($tripHash));
			$duplicate = $stmt->fetchAll();
		} while (count($duplicate) !== 0);

		$now = date( 'Y-m-d H:i:s');
		//TODO: duplicate email?

		$stmt = $this->db->prepare("INSERT INTO Users SET name=?, email=?, dateEntered='$now'");
		$stmt->execute(array($name, $email));
		$insertId = $this->db->lastInsertId();

		$stmt = $this->db->prepare("INSERT INTO Lists SET hash=?, name=?, userId=$insertId, dateCreated='$now'");
		$stmt->execute(array($tripHash, $tripName));

		return array('tripHash'=>$tripHash);

	}

	

}

?>