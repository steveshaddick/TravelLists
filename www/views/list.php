<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width = device-width" />
	
	<title>Trip Notes</title>
	<meta name="title" content="Trip Notes" />
	<meta name="description" content="" />
	<meta name="keywords" content="" />
	
	<link href="css/boilerplate_top.css" rel="stylesheet" type="text/css" />
	<link href="css/style.css" rel="stylesheet" type="text/css" />
	<link href="css/boilerplate_bottom.css" rel="stylesheet" type="text/css" />
	
	<script src="js/Modernizr.js"></script>
	
</head>
<body>

	<div id="loadBlocker">
		<div class="blockerContent">
			Loading...
		</div>
	</div>

	<div id="header">
		<div class="tripTitle"><?php echo $this->trip['tripName']; ?></div>
		<div class="tripOwner">by <?php echo $this->trip['userName']; ?></div>
	</div>

	<div id="body">
		<div class="contentWrapper">
			<div id="locations">
				<?php
				foreach ($this->locations as $location) {
					?>
					<span class="locationName"><?php echo $location['name']; ?></span>
					<div class="locationNotes">
						<?php
						foreach ($this->categories[$location['_id']] as $category) {
							?>
							<div class="category">
								<?php
								//Category titles
								switch ($category['category_id']) {
									default:
										break;
								}
								?>
								<div class="notesList">
									<?php
									foreach ($this->notes[$location['_id']][$category['category_id']] as $note) {
										?>
										<div class="note">
											<span class="text"><?php echo $note['note']; ?></span>
											<span class="from"><?php echo $note['from']; ?></span>
										</div>

										<?php
									}
									?>
								</div>
							</div>
							<?php
						}
						?>
					</div>
					
					<div class="addNote">
						<span>Add note to <?php echo $location['name']; ?></span>
					</div>

					<?php
				}
				?>
			</div>
		</div>
	</div>
	
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="/js/jquery/jquery-1.8.1.min.js"><\/script>')</script>

	<script src="/js/Main.js"></script>

	<script type="text/javascript">
	
	$(document).ready(
		function() {
			Main.init({
				userAgent: '<?php echo $userAgent; ?>',
				os: '<?php echo $os; ?>',
				a: '<?php echo $ajaxToken; ?>'
			});
		}
	)
	
	<?php
		switch (ENVIRONMENT) {
			case 'production':
				?>
				
				function analytics(pageLocation, subTopic, details) {
					_gaq.push(['_trackEvent',pageLocation, subTopic, details]);
				}
				
				var _gaq = _gaq || [];
				_gaq.push(['_setAccount', '<?php echo GOOGLE_ANALYTICS_UA; ?>' ]);
				_gaq.push(['_trackPageview', location.pathname + location.search + location.hash]);
				
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