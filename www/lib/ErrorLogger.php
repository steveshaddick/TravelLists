<?php

class ErrorLogger {

	private $path;

	public function __construct($path) {
		$this->path = $path;
	}

	public function log($obj) {

		$fp = fopen($this->path . 'error.txt', 'a');
		fwrite($fp, "*****************************\n");
		fwrite($fp, SITE_URL . ' : ' . date('Y-m-d H:i:s') . "\n");
		foreach ($obj as $key=>$value) {
			fwrite($fp, $key .': '.$value . "\n");
		}
		fwrite($fp, "\n");
		fclose($fp);
	}

}



?>