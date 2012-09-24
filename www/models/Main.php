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

		$stmt = $this->db->prepare("INSERT INTO Lists SET adminHash=?, publicHash=?, tripName=?, userName=?, email=?, dateCreated='$now'");
		$stmt->execute(array($adminHash, $publicHash, $userName, $email));

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

	

}

?>