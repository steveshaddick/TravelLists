<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width = device-width" />

	<?php
	if ($view->type == 'list') {
		?>
		<meta name="robots" content="noindex, nofollow" />
		<?php
	}
	?>
	
	<title><?php echo $view->title; ?></title>
	<meta name="description" content="<?php echo $view->description; ?>" />
	
	<link href="/css/boilerplate_top.css" rel="stylesheet" type="text/css" />
	<link href="/css/style.css" rel="stylesheet" type="text/css" />
	<link href="/css/boilerplate_bottom.css" rel="stylesheet" type="text/css" />
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">

	<script src="//use.typekit.net/cyh8uls.js"></script>
	<script >try{Typekit.load();}catch(e){}</script>
	
	<script src="/js/Modernizr.js"></script>
	
</head>

<body>