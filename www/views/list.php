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
				<div class="header-content">
					<h1 id="tripTitle" class="trip-title"><?php echo $main->trip['tripName']; ?></h1>
					<span id="tripSubtitle" class="trip-subtitle"><?php echo $main->trip['subtitle']; ?></span>
					<a id="editTripButton" class="edit-trip-link" href="javascript:void(0)"><img src="/images/icon-pencil.png">Edit this trip</a>

					<a id="addLocationButton" class="add-location-button edit-mode edit-off" href="">Add location</a>
					<a id="editDoneButton" class="edit-done-button edit-mode edit-off" href="">Done editing</a>
				</div>
			</header>

			<!--<section id="tripSettings" class="trip-settings">
				<div class="content">
					<label for="txtTripName">Trip</label> <input id="txtTripName" name="txtTripName" type="text" maxlength="75" value="" />
					<label for="txtTripAuthor">Author</label> <input id="txtTripAuthor" name="txtTripAuthor" type="text" maxlength="75" value="" />
					<label for="txtEmail">Email</label> <input id="txtEmail" name="txtEmail" type="text" maxlength="255" value="" />
					
					<a class="done-button" href="javascript:void(0)">Done</a><br />
				</div>
				
			</section>-->

			<div id="noticeContainer" class="notice-container">
				<div class="notice up">
					<span class="notice-text"></span>
					<a href="javascript:void(0);" class="x-button sprite-button">&nbsp;</a>
				</div>
			</div>

			<div id="map"></div>

		
			<div class="contentWrapper">
				<section id="locations"></section>
			</div>
		</div>
	</div>

	<div id="cls">

		<div id="clsLocation" class="location">
			<span class="location-name">$LOCATION$ <a class="show-hide-link hidden" href="javascript:void(0)" title="Collapse">&#150;</a></span>
			<a class="x-button sprite-button delete-location-button edit-mode edit-off" data-id="$LOCATION_ID$" href="javascript:void(0);">&nbsp;</a>
			<div class="location-notes">
				<ul class="notes-wrapper"></ul>
				<div class="notes-hidden"></div>
			</div>
			<div class="add-note">
				<div class="note-editor">
					<div class="blocker hidden"><div class="blockerContent">Submitting...</div></div>

					<div class="note-text-wrapper">
						<div style="padding: 0 22px 0 0;">
							<input type="text" id="txtNoteText_$LOCATION_ID$" class="txtNoteText" placeholder="" />
							<label for="txtNoteText_$LOCATION_ID$" class="note-text-label">Suggest something in $LOCATION$.</label>
						</div>

					</div>

					<div class="category-wrapper"></div>
					<div class="note-editor-bottom"></div>

				</div>
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
							<a class="x-button sprite-button edit-mode edit-off" href="javascript:void(0)">&nbsp;</a>
						</div>
					</td>
				</tr>
			</table>
			
		</li>

		<div id="clsCategorySelector" class="category-selector">
			<select name="category" id="selCategory" class="droptrip" style="width:100px;">
				<option value="0" selected>None</option>
				<option value="2" data-image="/images/icon-food.png">Eat</option>
				<option value="1" data-image="/images/icon-stay.png">Stay</option>
				<option value="3" data-image="/images/icon-poi.png">Do</option>
			</select>
		</div>

		<div id="clsNoteFrom" class="note-from-wrapper">
			<input type="text" id="txtFromName" class="txtFromName" placeholder="Anonymous" />
			<label for"txtFromName" class="note-from-label">Your name</label>
		</div>

		<div id="clsSubmitNote" class="note-submit-wrapper">
			<a id="submitNoteButton" class="submit-note-link" href="javascript:void(0)">Finished</a>
			<a id="cancelNoteButton" class="cancel-note-link" href="javascript:void(0)">Cancel</a>
		</div>

	</div>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="/js/jquery/jquery-1.8.1.min.js"><\/script>')</script>
    <script src="/js/jquery/jquery-ui-1.9.0.custom.min.js"></script>
    
    <script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>


    <script src="/js/jquery/jquery.cookie.min.js"></script>
    <script src="/js/jquery/jquery.dd.js"></script>
    <script src="/js/json2.js"></script>

	<script src="/js/Main.js"></script>

	<script>
	
	$(document).ready(
		function() {
			Main.init({
				userAgent: '<?php echo $userAgent; ?>',
				os: '<?php echo $os; ?>',
				a: '<?php echo $ajaxToken; ?>'
			});
			Trip.loadTrip({
				lat: <?php echo $main->trip['lat']; ?>,
				lng: <?php echo $main->trip['lng']; ?>
			});
		}
	)

	</script>

	<?php include(BASE_PATH . 'views/parts/ga.php'); ?>

</body>
</html>