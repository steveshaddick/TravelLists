<?php include(BASE_PATH . 'views/parts/header.php'); ?>

	<div id="loadBlocker">
		<div class="blockerContent">
			Loading...
		</div>
	</div>

	

	<div id="body">
		<div class="home-wrapper">
			

			<section id="lostTripPage" class="home-page page-current">
				<header class="start-header">
					<h1 class="site-title"><a class="none" href="/">Tripnotes</a></h1>
					<span class="site-subtitle">The easiest way to get &amp; organize trip suggestions.</span>
				</header>


				<div class="home-form" style="margin:175px 0;">
					<input id="txtEmail" name="txtEmail" type="text" autofocus="autofocus" maxlength="255" value="" />
					<a class="next-button hidden" style="position:absolute;" href="javascript:void(0)">Submit</a><br />
					<label for="txtEmail">Enter your email address to receive your tripnotes.</label>
				</div>
			</section>

			<section id="sentEmailPage" class="home-page page-right">

				<div class="home-form">
					An email has been sent.
				</div>
			</section>
			
		</div>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="/js/jquery/jquery-1.8.1.min.js"><\/script>')</script>

    <script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>

	<script src="/js/Main.js"></script>

	<script type="text/javascript">
	
	$(document).ready(
		function() {
			Main.init({
				userAgent: '<?php echo $userAgent; ?>',
				os: '<?php echo $os; ?>',
				a: '<?php echo $ajaxToken; ?>'
			});

			Home.init('lost');
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