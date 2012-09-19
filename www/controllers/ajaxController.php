<?php

// Start the session.  Required in order to use $_SESSION
@session_start();
$basePath = realpath(dirname(__FILE__) . "/..") . "/";

require_once($basePath . '../env/Config.php');

require_once($basePath . 'lib/MySQLUtility.php');
require_once($basePath . 'lib/json.php');
require_once $basePath . 'lib/StringUtils.php';
// End required files

// Project specific includes
require_once($basePath . 'models/Main.php');
$main = new Main($basePath);

date_default_timezone_set(TIMEZONE); 

if (isset($_GET['action'])) {
	$action = $_GET['action'];
} else {
	$action = '';
}

if (!((isset($_POST['a'])) && ($_POST['a'] == $_SESSION['ajaxToken'])))  {
	exit();
}

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

// Non-Authenticated pages
switch ($action) {


}

?>