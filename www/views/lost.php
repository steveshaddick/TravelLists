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
					<div style="display:inline-block; position:absolute; right: 0px;"><a class="next-button hidden"  href="javascript:void(0)">Submit</a></div>
					<label for="txtEmail">Enter your email address to receive your tripnotes.</label>
				</div>
			</section>

			<section id="sentEmailPage" class="home-page page-right">
				<header class="start-header">
					<h1 class="site-title"><a class="none" href="/">Tripnotes</a></h1>
					<span class="site-subtitle">The easiest way to get &amp; organize trip suggestions.</span>
				</header>

				<div class="page-content">
					<p>An email has been sent, go check!</p>

				</div>

			</section>
			
		</div>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	<?php include(BASE_PATH . 'views/parts/bottom-scripts.php'); ?>
	
	<?php include(BASE_PATH . 'views/parts/ga.php'); ?>
	
</body>
</html>