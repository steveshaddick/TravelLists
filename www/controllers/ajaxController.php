<?php

@session_start();
require_once('../../env/config.php');

require_once BASE_PATH . 'lib/StringUtils.php';
require_once BASE_PATH . 'lib/Encryptor.php';

require_once BASE_PATH . 'models/Main.php' ;
$main = new Main(BASE_PATH);

if ($main->init() !== true) {
	exit();
}

if (!((isset($_POST['token'])) && ($_POST['token'] == $_SESSION['ajaxToken'])))  {
	exit();
}


function returnJSON($arr) {
	
	if (is_array($arr)) {
		$arr['success'] = true;
	} else if ($arr === true) {
		$arr = array('success'=>true);
	} else {
		$arr = array('success'=>false);
	}
	
	return json_encode($arr);
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

	case 'createTrip':

		$arr = $main->createTrip(array(
			'tripName'=>$_POST['tripName'],
			'userName'=>$_POST['name'],
			'email'=>$_POST['email']
			));

		echo returnJSON($arr);
		break;

	case 'loadTrip':
		$arr = $main->loadTrip();
		echo returnJSON($arr);
		break;

	case 'addLocation':
		$arr = $main->addLocation($_POST['location']);

		echo returnJSON($arr);
		break;

	case 'addNote':
		$arr = $main->addNote(array(
			'note'=>$_POST['noteText'],
			'categoryId'=>$_POST['categoryId'],
			'locationId'=>$_POST['locationId']
			));

		echo returnJSON($arr);
		break;


	case 'deleteNote':
		$arr = $main->deleteNote($_POST['noteId']);

		echo returnJSON($arr);
		break;

	case 'deleteLocation':
		$arr = $main->deleteLocation($_POST['locationId']);

		echo returnJSON($arr);
		break;

	case 'saveTrip':

		$arr = $main->saveTrip($_POST);
		echo returnJSON($arr);
		break;

	default:
		echo returnJSON(false);
		break;
}

?>