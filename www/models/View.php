<?php

class View {

	public $title;
	public $description;

	public function __construct($action, $main = null) {

		$baseTitle = 'Tripnotes';
		$sep = ' | ';

		switch ($action) {
			case 'index':
				$this->title = $baseTitle;
				break;

			case 'lost':
				$this->title = $baseTitle . $sep . 'Lost Tripnotes?';
				break;

			case 'list':
				$this->title = $baseTitle . $sep . $main->trip['tripName'];
				break;

			case 'about':
				$this->title = $baseTitle . $sep . 'About';
				break;

			case 'privacy-policy':
				$this->title = $baseTitle . $sep . 'Privacy Policy';
				break;

			case 'terms':
				$this->title = $baseTitle . $sep . 'Terms of Use';
				break;

			default:
				$this->title = $baseTitle;
			 	break;
		}

	}
	
}


?>