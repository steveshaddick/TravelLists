<?php include(BASE_PATH . 'views/parts/header.php'); ?>

	<div id="loadBlocker">
		<div class="blockerContent">
			Loading...
		</div>
	</div>

	

	<div id="body">
		<div class="home-wrapper">
			
			<section id="startPage" class="home-page page-current">
				
				<header class="start-header">
					<h1 class="site-title">Tripnotes</h1>
					<span class="site-subtitle">The easiest way to get &amp; organize trip suggestions.</span>
				</header>


				<div class="home-form" style="margin:175px 0;">
					<input id="txtTripName" name="txtTripName" type="text" autofocus="autofocus" maxlength="75" value="" />
					<a class="next-button hidden" style="position:absolute;" href="javascript:void(0)">Next</a><br />
					<label for="txtTripName">Start by naming your trip.</label>
					<br /><br />
					<a style="padding-left: 23px;" href="/lost">Lost your tripnotes?</a>
				</div>

			</section>

			<section id="infoPage" class="home-page page-right">
				<header class="info-header">
					<span class="trip-title"></span>
				</header>

				<div class="home-form" style="margin:50px 0;">
					<input id="txtName" disabled="disabled" type="text" maxlength="75" value="" /><br />
					<label for="txtName">Your name please.</label><br /><br />

					<input id="txtEmail" disabled="disabled" type="email" maxlength="255" value="" /><br />
					<label for="txtEmail">And your email address, only so we can send you a link.</label><br /><br />

					<a class="next-button hidden" href="javascript:void(0)">Next</a>
				</div>
			</section>

			<section id="locationPage" class="home-page page-right">
				<header class="info-header">
					<span class="trip-title"></span>
					<span class="trip-subtitle"></span><br />
					<span class="email"></span>
				</header>

				<div class="home-form" style="margin:50px 0;">
					<div class="floatLeft">
						<input id="txtLocation" name="txtLocation" type="text" placeholder="ex. Bangkok, Thailand" /><br />
						<label for="txtLocation">Lastly, one place we can add to the map of your trip.</label>
					</div>
					<a class="create-button hidden" href="javascript:void(0)">Start Planning</a>
				</div>
			</section>

			<div id="lostTripPage" class="pageContent hidden">
				<div class="overview">
					Enter the email associated with your page.
				</div>

				<div class="tripForm">
					<div class="floatLeft">
						<label for="txtAdminEmail">Email</label><br />
						<input id="txtAdminEmail" disabled="disabled" type="email" maxlength="255" placeholder="email@example.com" value="" /><br />
					</div>
					<br class="clear" />
					<a class="generalButton" href="javascript:void(0)" onclick="Gate.sendEmail();">Send</a>
				</div>
			</div>

			<div id="sentEmailPage" class="pageContent hidden">
				<div class="overview">
				</div>

				<div class="tripForm">
					An email has been sent.
				</div>
			</div>


			
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

			Home.init();
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