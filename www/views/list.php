<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width = device-width" />
	
	<title>Trip Notes</title>
	<meta name="title" content="Trip Notes" />
	<meta name="description" content="" />
	<meta name="keywords" content="" />
	
	<link href="/css/boilerplate_top.css" rel="stylesheet" type="text/css" />
	<link href="/css/style.css" rel="stylesheet" type="text/css" />
	<link href="/css/boilerplate_bottom.css" rel="stylesheet" type="text/css" />
	
	<script src="/js/Modernizr.js"></script>
	
</head>
<body>

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

	<div id="header">
		<div class="content">
			<div id="tripTitle" class="tripTitle"><?php echo $main->trip['tripName']; ?></div>
			<div id="tripSubtitle" class="tripSubtitle"><?php echo $main->trip['subtitle']; ?></div>
		</div>
	</div>

	<div id="map"></div>

	<div id="body">
		<div class="contentWrapper">
			<div id="locations">
				
			</div>
			<?php
			if ($main->isAdmin) {
				?>
				<a class="add-location-link" href="javascript:void(0)">Add a place</a>
				<?php
			}
			?>
		</div>
	</div>

	<div id="cls">

		<div id="clsLocation" class="location">
			<span class="location-name">$LOCATION$</span>
			<?php
			if ($main->isAdmin) {
				?>
				<a class="delete-location-link" data-id="$LOCATION_ID$" href="javascript:void(0);">X</a>
				<?php
			}
			?>
			<div class="location-notes"></div>
			<div class="add-note">
				<a class="add-note-link" href="javascript:void(0)">Suggest something in $LOCATION$</a>
			</div>
		</div>

		<div id="clsCategory" class="category">
			<div class="category-header">
				<table>
					<tr>
						<td class="category-name">$CATEGORY_NAME$</td>
						<td><span class="middle-grey-line">&nbsp;</span></td>
						<td class="show-hide"><a class="show-hide-link" href="javascript:void(0)">&#47;&#92;</a></td>
					</tr>
				</table>
			</div>
			<ul class="notes-wrapper"></ul>
			<div class="notes-hidden"></div>
		</div>

		<li id="clsNote" class="note">
			<div class="note-text-wrapper">
				<span class="note-text"></span>
			</div>
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
				<a class="note-delete-link" href="javascript:void(0)">x</a>
			</div>
		</li>

		<div id="clsNoteEditor" class="note-editor">
			<div class="note-text-wrapper">
				<div style="padding: 0 22px 0 0;">
					<input type="text" id="txtNoteText" class="txtNoteText" />
				</div>
			</div>
			<div class="note-editor-bottom">
				<label for"txtFromName">from</label>
				<input type="text" id="txtFromName" class="txtFromName" />

				<div class="bottom-right-chunk">
					<label class="category-label" for="selCategory">It's a</label>
					<select name="category" id="selCategory" class="droptrip" style="width:188px">
						<option value="0">[ choose ]</option>
						<option value="1">place to stay</option>
						<option value="2">place to eat</option>
						<option value="3">thing to do</option>
					</select>
					<a class="submit-note-link" href="javascript:void(0)">+</a>
					<a class="cancel-note-link" href="javascript:void(0)">Cancel</a>
				</div>
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

    <script src="/js/jquery/jquery.dd.js"></script>

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

			<?php
			if ($main->isAdmin) {
				?>
				ListAdmin.init();
				<?php
			}
			?>
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