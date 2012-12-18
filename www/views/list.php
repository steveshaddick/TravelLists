<?php include(BASE_PATH . 'views/parts/header.php'); ?>


	<div id="loadBlocker">
		<div class="blockerContent">
			Loading...
		</div>
	</div>

	<div id="modal">
		<div id="modalContent">
			Loading...
		</div>
	</div>
	<div id="body">
		<div class="list-wrapper">
			<header id="header">
				<h1 id="tripTitle" class="trip-title"><?php echo $main->trip['tripName']; ?></h1>
				<span id="tripSubtitle" class="trip-subtitle"><?php echo $main->trip['subtitle']; ?></span>
				<a class="settings-button sprite-button" href="javascript:void(0)" title="Settings">&nbsp;</a>
			</header>

			<section id="tripSettings" class="trip-settings">
				<div class="content">
					<label for="txtTripName">Trip</label> <input id="txtTripName" name="txtTripName" type="text" maxlength="75" value="" />
					<label for="txtTripAuthor">Author</label> <input id="txtTripAuthor" name="txtTripAuthor" type="text" maxlength="75" value="" />
					<label for="txtEmail">Email</label> <input id="txtEmail" name="txtEmail" type="text" maxlength="255" value="" />
					
					<a class="done-button" href="javascript:void(0)">Done</a><br />
				</div>
				
			</section>

			<div id="noticeContainer" class="notice-container">
				<div class="notice up">
					<span class="notice-text"></span>
					<a href="javascript:void(0);" class="x-button sprite-button">&nbsp;</a>
				</div>
			</div>

			<div id="map"></div>

		
			<div class="contentWrapper">
				<section id="locations">
					
				</section>
				<?php
				if ($main->isAdmin) {
					?>
					<a class="add-location-link" href="javascript:void(0)">Add another location</a>
					<?php
				}
				?>
			</div>
		</div>
	</div>

	<div id="cls">

		<div id="clsLocation" class="location">
			<span class="location-name">$LOCATION$ <a class="show-hide-link" href="javascript:void(0)">&#150;</a></span>
			<?php
			if ($main->isAdmin) {
				?>
				<a class="x-button sprite-button" data-id="$LOCATION_ID$" href="javascript:void(0);">&nbsp;</a>
				<?php
			}
			?>
			<div class="location-notes">
				<ul class="notes-wrapper"></ul>
				<div class="notes-hidden"></div>
			</div>
			<div class="add-note">
				<a class="add-note-link" href="javascript:void(0)">Suggest something in $LOCATION$</a>
			</div>
		</div>

		<li id="clsNote" class="note">
			<table>
				<tr>
					<td style="vertical-align:top; padding-top:7px"><span class="note-category">&nbsp;</span></td>
					<td class="note-text-wrapper">
						<span class="note-text"></span>
						<div class="note-link">
							<table>
								<tr>
									<td><a target="_blank"><img class="link-image" src="/images/blank.gif" alt="" /></a></td>
									<td class="link-info">
										<a target="_blank" class="link-title"></a>
										<span class="link-description"></span>
									</td>
								</tr>
							</table>
						</div>
						<div class="note-from"></div>
						<div class="note-delete">
							<a class="x-button sprite-button" href="javascript:void(0)">&nbsp;</a>
						</div>
					</td>
				</tr>
			</table>
			
		</li>

		<div id="clsNoteEditor" class="note-editor">
			<div id="noteEditorBlocker" class="blocker hidden"><div class="blockerContent">Submitting...</div></div>

			<div class="note-text-wrapper">
				<div style="padding: 0 22px 0 0;">
					<input type="text" id="txtNoteText" class="txtNoteText" />
					<label for="txtNoteText" class="note-text-label"></label>
				</div>
			</div>
			
			<div class="note-editor-bottom hidden">
				<div class="category-wrapper">
					<div class="category-selector">
					<select name="category" id="selCategory" class="droptrip" style="width:100px;">
						<option value="0" selected>None</option>
						<option value="2" data-image="/images/icon-food.png">Eat</option>
						<option value="1" data-image="/images/icon-stay.png">Stay</option>
						<option value="3" data-image="/images/icon-poi.png">Do</option>
					</select>
					</div>
					<div class="note-text"></div>
				</div>

				<input type="text" id="txtFromName" class="txtFromName" />
				<label for"txtFromName" class="note-from-label">Your name</label>
				
				<a class="submit-note-link" href="javascript:void(0)">Finished</a>
				<a class="cancel-note-link" href="javascript:void(0)">Cancel</a>

				
				<br class="clear" />
			</div>
		</div>


	<?php
	if ($main->isAdmin) {
		?>

		<?php
	}
	?>
	</div>

	<?php include(BASE_PATH . 'views/parts/footer.php'); ?>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="/js/jquery/jquery-1.8.1.min.js"><\/script>')</script>
    <script src="/js/jquery/jquery-ui-1.9.0.custom.min.js"></script>
    
    <script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>


    <?php
    if ($main->isAdmin) {
    	?>
    	
    	<script src="/js/ListAdmin.js"></script>
    	<?php
    }
    ?>

    <script src="/js/jquery/jquery.cookie.min.js"></script>
    <script src="/js/jquery/jquery.dd.js"></script>
    <script src="/js/json2.js"></script>

	<script src="/js/Main.js"></script>

	<script type="text/javascript">
	
	$(document).ready(
		function() {
			Main.init({
				userAgent: '<?php echo $userAgent; ?>',
				os: '<?php echo $os; ?>',
				a: '<?php echo $ajaxToken; ?>',
				isAdmin: <?php if ($main->isAdmin) { echo 'true'; } else { echo 'false'; } ?>
			});
			Trip.loadTrip({
				lat: <?php echo $main->trip['lat']; ?>,
				lng: <?php echo $main->trip['lng']; ?>
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