<?php include(BASE_PATH . 'views/parts/header.php'); ?>

	<div id="loadBlocker">
		<div class="blockerContent">
			Loading...
		</div>
	</div>

	

	<div id="body">
		<div class="home-wrapper">
			

			<section id="locationPage" class="home-page page-current">
				<header class="start-header">
					<h1 class="site-title"><img src="../images/tripnotes@2x.png" width="398" height="88" alt="Tripnotes"></h1>
					<span class="site-subtitle">The easiest way to get &amp; organize trip suggestions.</span>
				</header>

				<div class="home-form" style="margin:140px 0 20px;">

					<input id="txtLocation" name="txtLocation" type="text" placeholder="ex. Bangkok, Thailand" />
					<div style="display:inline-block; position:absolute;">
						<a class="next-button" href="#">Next</a>
					</div>
					<label for="txtLocation">Start with the first place you're going.</label>

				</div>

				<div class="lost-link">
					<a href="/lost">Lost your Tripnotes?</a>
				</div>
			</section>

			<section id="infoPage" class="home-page page-right">
				<header class="info-header">
					<span class="trip-title"></span>
				</header>

				<div class="home-form" style="margin:75px 0 0;">
					<input id="txtName" disabled="disabled" type="text" maxlength="75" value="" /><br />
					<label for="txtName">Your name please.</label>
					<div style="margin-top:80px">&nbsp;</div>
					<input id="txtEmail" disabled="disabled" type="email" maxlength="255" value="" /><br />
					<label for="txtEmail">And your email address, only so we can send you a link.</label>

					<div style="margin-top:50px">
						<a class="back-button hidden" href="#">Back</a>
						<a class="next-button hidden" href="#">Start</a>
					</div>
				</div>
			</section>

			
	
		</div>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	
	<?php include(BASE_PATH . 'views/parts/bottom-scripts.php'); ?>

	<script src="/js/Home.js"></script>
	<script>
	
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

	</script>
	
	<?php include(BASE_PATH . 'views/parts/ga.php'); ?>

</body>
</html>