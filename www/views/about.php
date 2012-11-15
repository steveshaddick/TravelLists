<?php include(BASE_PATH . 'views/parts/header.php'); ?>


	<div id="body">
		<div class="contentWrapper">
			<div id="landingPage" class="pageContent">
				What is Trip Notes?

				Trip Notes is the place to capture and organize your travel ideas by yourself and with others.  Planning a trip can be messy and overwhelming, so we built Trip Notes to help people make sense of their travels and ultimately, have better travels.

				Trip Notes is new, and we'd love your feedback on how to make it better.

				TWITTER @maketripnotes 
				EMAIL hello@maketripnotes.com

				The Team

				The Trip Notes team comprises of three Toronto makers who are curious about the world and passionate in making it better.
			</div>
		</div>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	
	
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