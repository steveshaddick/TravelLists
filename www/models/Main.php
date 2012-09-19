<?php

/**
 */
class Main {

	
	private $mySQL;
	private $basePath;
	
	public function __construct($basePath = '') {
		
		$this->basePath = $basePath;
		$this->mySQL = new MySQLUtility(DB_USERNAME, DB_PASSWORD, MAIN_DB_HOST, MAIN_DB_NAME);
		
	}

	

}

?>