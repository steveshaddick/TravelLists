<?php

@session_start();
require_once('../env/config.php');

require_once BASE_PATH . 'lib/MySQLUtility.php';
require_once BASE_PATH . 'lib/StringUtils.php';
// End required files

// Project specific includes
require_once BASE_PATH . 'models/Main.php' ;
$main = new Main($basePath);

if (isset($_SESSION['ajaxToken'])) {
	$ajaxToken = $_SESSION['ajaxToken'];
} else {
	$ajaxToken = $_SESSION['ajaxToken'] = randomString(12);
}


$userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
if ((strpos($userAgent, 'ipad') !== false) || (strpos($userAgent, 'playbook') !== false)  || ((strpos($userAgent, 'android') !== false ) && (strpos($userAgent, 'mobile') === false ))){
    $userAgent = 'iPad';
} else if ((strpos($userAgent, 'iphone') !== false ) || (strpos($userAgent, 'android') !== false ) || (strpos($userAgent, 'ipod') !== false ) || (strpos($userAgent, 'mobile') !== false ) || (strpos($userAgent, 'blackberry') !== false )){
	$userAgent = 'iPhone';
} else if (strpos($userAgent, 'chrome') !== false) {
	$userAgent = 'chrome';
} else if (strpos($userAgent, 'safari') !== false) {
	$userAgent = 'safari';
} else {
	$userAgent = '';
}

$os = strtolower($_SERVER['HTTP_USER_AGENT']);
if (strpos($os, 'windows')) {
	$os = 'windows';
} else if (strpos($os, 'macintosh')) {
	$os = 'mac';
} else {
	$os = '';
}



if (isset($_GET['action'])) {
	$view = $_GET['action'];
} else {
	$view = '';
}

// Non-Authenticated pages
switch ($view) {
	case 'index':
		
		
		include('../views/index.php');
		exit();
		break;
		
	default:
		include('../views/404.php');
		exit();
		break;
	
}

?>