<?php include(BASE_PATH . 'views/parts/header.php'); ?>

<style type="text/css">

body{
color: #151633;
font-family: "chaparral-pro", georgia, serif;
font-size: 24px;
font-weight: 600;
}

.about-header{
	width: 100%;
	max-width: 1250px;
	margin: 0 auto;
	text-align: center;
	margin-top: 50px;
	margin-bottom: 50px;
	}
	
.about-header .site-title {
	  font-family: "pragmatica-web", helvetica, arial, sans-serif;
	  font-weight: 600;
	  font-size: 76px;
	  line-height: 76px;
	  color: #5f5c66;
	}

.about-header .site-subtitle {
	  font-family: "chaparral-pro", georgia, serif;
	  font-size: 23px;
	  line-height: 23px;
	  color: #b8b8b8;
	}
	
#landingPage{
	width: 72%;
	margin: 0px auto;
	padding-bottom: 50px;;
}

.about-header a:link{
	color: #5f5c66;
}

.about-header a:hover{
	text-decoration: none;
}

.about-header a:visited{
	color: #5f5c66;
}


a:link{
	color: #799b28;
}

a:visited{
	color: #799b28;
}
	
a:hover{
	
color: #a5bb77;
text-decoration: underline;
}

</style>

	<div id="body">
		<div class="contentWrapper">
		
		<header class="about-header">
			<h1 class="site-title"><a href="http://dev.maketripnotes.com">Tripnotes</a></h1>
			<span class="site-subtitle">The easiest way to get &amp; organize trip suggestions.</span>
		</header>		
		
		
			<div id="landingPage" class="about-page page-content ">

				<p>Trip Notes is the place to capture and organize travel ideas by yourself and with others.  Planning a trip can be overwhelming, so we built Trip Notes to help people get and organize suggestions.
				</p>
				
				<p>Trip Notes is new, and we'd love your feedback on how to make it better.
				</p>
				
				<img src="../images/icons/twitter-3.png" alt="twitter"> <a href="http://www.twitter.com/maketripnotes">@maketripnotes</a>
				
				<br><br>
				
				<img src="../images/icons/mail.png" alt="email"> <a href="mailto:help@tripnotes.com">
				help@tripnotes.com</a>
				<br><br>
				



			</section>

			</div>
		</div>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	
	<?php include(BASE_PATH . 'views/parts/bottom-scripts.php'); ?>

	<?php include(BASE_PATH . 'views/parts/ga.php'); ?>
			
</body>
</html>