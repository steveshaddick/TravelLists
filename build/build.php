<?php

require_once 'JSMin.php';
require_once 'cssmin.php';

$real = isset($_GET['real']) ? intval($_GET['real']) : 0;

if ($real === 1) {
	echo "***FOR REAL !***<br />";
} else {
	echo "**********************TEST************************<br />";
}



$cssFiles = array(
	'/css/min.css' => array(
		"/css/boilerplate_top.css",
		"/css/style.css",
		"/css/boilerplate_bottom.css"
		)
	);

$jsFiles = array(

	'/js/Main.min.js' => array(
		'/js/Main.js'
		)

	);

$processed = array();

//CSS Files
$compressor = new CSSmin();
foreach ($cssFiles as $key=>$files) {
	
	$handle = fopen(".." . $key, "w");
	foreach ($files as $file) {
		$processed [] = $file;
		$content = file_get_contents(".." . $file);
		$content = $compressor->run($content);
		fwrite($handle, $content);
	}
	fclose($handle);
}

//JS files
foreach ($jsFiles as $key=>$files) {
	
	$handle = fopen(".." . $key, "w");
	foreach ($files as $file) {
		$processed [] = $file;
		$content = file_get_contents(".." . $file);
		$content = JSMin::minify($content) . ";";
		fwrite($handle, $content);
	}
	fclose($handle);
}



//Move files over

$ignore = array(
	'.',
	'..',
	'.htaccess',
	'.htpasswd',
	'robots.txt',
	'/build',
	'error_log'
	);


$ignore = array_merge($ignore, $processed);

$devPath = '/homepages/44/d182233238/htdocs/dev_travelnotes';
$wwwPath = '/homepages/44/d182233238/htdocs/travelnotes';

function readDirectory($path) {
	global $ignore;
	global $devPath;
	global $wwwPath;
	global $real;

	if ($handle = opendir($devPath . $path)) {

		$path .= '/';
	    
	    while (false !== ($entry = readdir($handle))) {

	    	//echo "CHECK " . $path . $entry . "<br />";

	        if ((!in_array($path . $entry, $ignore)) && (!in_array($entry, $ignore))) {
	            
	            if (is_dir($devPath . $path . $entry)) {
	            	//echo "reading dir ->";
	            	readDirectory($path . $entry);
	            
	            } else {

	            	$devFile = $devPath . $path . $entry;
	            	$wwwFile = $wwwPath . $path . $entry;

	            	if (!file_exists($wwwFile)) {
	            		if ($real === 1) {
	            			copy($devFile, $wwwFile);
	            		}
	            		echo 'Adding ' . $wwwFile .'<br />';
	            	} else {
	            		if (filesize($devFile) != filesize($wwwFile)) {
	            			if ($real === 1) {
		            			copy($devFile, $wwwFile);
		            		} 
	            			echo "OVERWRITE : " . $wwwFile . ' ' . filesize($devFile) . ' vs '. filesize($wwwFile) . '<br />';
	            		}
	            	}
	            }
	        } else {
	        	//echo "--------IGNORE<br />";
	        }
	    }

	    closedir($handle);
	}
}

readDirectory('');


echo "Done.";


?>