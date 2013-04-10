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


				<div class="home-form" style="margin:175px 0 100px;">
					<input id="txtTripName" name="txtTripName" type="text" autofocus="autofocus" maxlength="75" value="" />
					<div style="display:inline-block; position:absolute;"><a class="next-button hidden" href="javascript:void(0)">Next</a></div><br />
					<label for="txtTripName">Start by naming your trip.</label>
					
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
						<a class="back-button hidden" href="javascript:void(0)">Back</a>
						<a class="next-button hidden" href="javascript:void(0)">Next</a>
					</div>
				</div>
			</section>

			<section id="locationPage" class="home-page page-right">
				<header class="info-header">
					<span class="trip-title"></span>
					<span class="trip-subtitle"></span><br />
					<span class="email"></span>
				</header>

				<div class="home-form" style="margin:140px 0 0;">

					<input id="txtLocation" name="txtLocation" type="text" placeholder="ex. Bangkok, Thailand" /><br />
					<label for="txtLocation">Lastly, one place we can add to the map of your trip.</label>
					<div style="margin-top:195px">
						<a class="back-button hidden" href="javascript:void(0)">Back</a>
						<a class="create-button hidden" href="javascript:void(0)">Start Planning</a>
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