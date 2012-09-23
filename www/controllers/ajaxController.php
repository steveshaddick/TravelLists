<?php

@session_start();
require_once('../env/config.php');

require_once BASE_PATH . 'lib/MySQLUtility.php';
require_once BASE_PATH . 'lib/StringUtils.php';
// End required files

// Project specific includes
require_once BASE_PATH . 'models/Main.php' ;
$main = new Main($basePath);

if (!((isset($_POST['token'])) && ($_POST['token'] == $_SESSION['ajaxToken'])))  {
	exit();
}



if (isset($_GET['action'])) {
	$action = $_GET['action'];
} else {
	$action = '';
}

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

// Non-Authenticated pages
switch ($action) {


}

?>