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
				<div class="addLocation">
					<a class="addLocationLink" href="javascript:void(0)">Add location to trip</a>
				</div>
				<?php
			}
			?>
		</div>
	</div>

	<div id="cls">

		<div id="clsLocation" class="location">
			<span class="locationName">$LOCATION$</span>
			<?php
			if ($main->isAdmin) {
				?>
				<a class="deleteLocationLink" data-id="$LOCATION_ID$" href="javascript:void(0);">delete</a>
				<?php
			}
			?>
			<div class="locationNotes"></div>
			<div class="addNote">
				<a class="addNoteLink" href="javascript:void(0)">Add note to $LOCATION$</a>
			</div>
		</div>

		<div id="clsCategory" class="category">
			<div class="categoryHeader">
				<span class="categoryName">$CATEGORY_NAME$</span><a class="showHide" href="javascript:void(0)">+</a>
			</div>
			<div class="notesWrapper"></div>
		</div>

		<div id="clsNote" class="note">
			<span>$NOTE$</span><a class="deleteNoteLink" href="javascript:void(0)">delete</a>
		</div>

		<div id="addNoteInput" class="addNoteInput">
			<input type="text" id="txtNoteText" class="txtNoteText" />
			<div>
				<div class="noteLink">
					<table>
						<tr>
							<td><img class="link-image" src="/images/blank.gif" alt="" /></td>
							<td><a class="link-title"></a></td>
						<tr>
					</table>
				</div>
				<div>
					<label for="selCategory">It's a</label>
					<select id="selCategory">
						<option value="0">Category</option>
						<option value="1">Food</option>
						<option value="2">Something Else</option>
					</select>
					<a class="submitNoteLink" href="javascript:void(0)">&nbsp;</a>
				</div>
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
	
    <script src="http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false"></script>


    <?php
    if ($main->isAdmin) {
    	?>
    	
    	<script src="/js/ListAdmin.js"></script>
    	<?php
    }
    ?>

	<script src="/js/Main.js"></script>

	<script type="text/javascript">
	
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