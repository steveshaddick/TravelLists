<?php include(BASE_PATH . 'views/parts/header.php'); ?>


	<div id="body">
		<div class="contentWrapper">
			<div id="landingPage" class="pageContent">
				Trip Notes’ Privacy Policy
				Effective Date: October 31st, 2012

				Trip Notes collects personal information from you, such as name and email address, when you sign up for our service or contact us by email. We also track many of the actions you take on our site in order to improve the service.

				We will not rent, sell, or share your personal information except in accordance with this policy.

				If you no longer choose to use our service, you may delete your account by contacting support@maketripnotes.com.

				Data Privacy
				We understand that the data you send to Trip Notes is confidential and we treat it as such. Access will be restricted to the collaborators you invite, and to certain Trip Notes staff in order to provide support and develop the service.

				Data Storage
				Trip Notes uses third party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run our services. Although Easel owns the code, databases, and all rights to the Easel applications, you retain all rights to your data.

				Cookies
				A cookie is a small amount of data that is sent to your browser from our servers and stored on your computer's hard drive. We use cookies to access information when you sign in, store your preferences, to keep you logged in, and to store a limited amount of behavioral data. You can configure your browser to accept or reject these cookies with the drawback that certain features on the Trip Notes website may not function properly without the aid of cookies.
				E-mail Communications

				Trip Notes is very concerned about your privacy and we will never provide your email address to a third party without your explicit permission. Trip Notes may send out e-mails with Trip Notes-related news, products, offers, surveys or promotions. You may also receive notification e-mails from Trip Notes, which inform you of actions (e.g. Trip Notes created) that have been performed on the site. 

				Third Party Services
				In order to improve the quality of your experience on our site we use several third party services which have access to some of your information including: Olark, Desk.com, Mixpanel, Intercom.io and Google Analytics. For the services that provide an ability to opt out, directions are listed below.

				Opt out of Google Analytics
				Google provides Google Analytics Opt-out Browser Add-on which when installed will prevent your browser from sending any data to Google Analytics.
				When you get a new computer, install a new browser you must reinstall the addon to prevent data from being sent to Google Analytics.

				Non Personally Identifying Information
				From time to time, Trip Notes may release non-personally-identifying information in the aggregate, e.g., by publishing a report on trends in the usage of its website.

				Disclosure
				Easel may disclose personally identifiable information under special circumstances, such as to comply with subpoenas or when your actions violate the Terms of Service of our application.

				Business Transfers
				If Trip Notes, or substantially all of its assets were acquired, or in the unlikely event that Easel goes out of business or enters bankruptcy, user information would be one of the assets that is transferred or acquired by a third party. You acknowledge that such transfers may occur, and that any acquiror of Trip Notes may continue to use your personal information as set forth in this policy.

				Changes to this privacy policy
				We'll let you know about any significant changes by posting e-mailing a notice to any users who have created a Trip Notes page 30 days before they become effective.

				Questions or comments
				If you have questions or comments about this privacy policy, please contact us by email at support@maketripnotes.com.
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