<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<?php
	switch($userAgent) {
		case 'iPhone':
			?>
			
			<meta name="viewport" content="initial-scale = 0.4, width = device-width" />
			
			<?php
			break;
			
		default:
			?>
			
			<meta name="viewport" content="initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, width = device-width" />
			
			<?php
			break;
	}
	?>
	
	<title></title>
	<meta name="title" content="" />
	
	<link href="css/min.css" rel="stylesheet" type="text/css" />
			
</head>
<body>
	
	Custom 404
	
	
	<script type="text/javascript">
	
	<?php
		switch (ENVIRONMENT) {
			case 'production':
				?>
				
				function analytics(pageLocation, subTopic, details) {
					_gaq.push(['_trackEvent',pageLocation, subTopic, details]);
				}
				
				
				var _gaq = _gaq || [];
				_gaq.push(['_setAccount', '<?php echo GOOGLE_ANALYTICS_UA; ?>' ]);
				_gaq.push(['_trackPageview']);
				
				(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();
				
				<?php
				break;
		}
		?>
	</script>
</body>
</html>