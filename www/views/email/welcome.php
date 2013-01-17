<?php
$emailContent = array();


ob_start();
// ************************************/
// ********** START EDIT **************/
// The Email subject
// $TRIP_NAME$ = the trip name
?>

New Tripnote: $TRIP_NAME$

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['subject'] = str_replace(array("\r\n", "\n", "\r"), "", ob_get_clean());



ob_start();
// ************************************/
// ********** START EDIT **************/
// the email body.
// $TRIP_LINK$ = the url for the trip
?>

<p>Thanks for making a new list. Here it is:</p>
<p>Public Link: <a href="$TRIP_LINK$">$TRIP_LINK$</a></p>

<p>
Thanks,<br />
The TripNote Team<br />
info@maketripnotes.com
</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['body'] = str_replace(array("\r\n", "\n", "\r"), "", ob_get_clean());




//leave as is
$emailContent['head'] = '<!doctype html><head></head><body>';
$emailContent['foot'] = '</body></html>';
?>