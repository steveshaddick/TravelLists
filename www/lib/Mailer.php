<?php

class Mailer {

	public function __construct() {

		include '../www/lib/sendgrid-php/SendGrid_loader.php';
		$sendgrid = new SendGrid(SENDGRID_USER, SENDGRID_PASS);

		$mail = new SendGrid\Mail();

	}


}



?>