<?php
$emailContent = array();


ob_start();
// ************************************/
// ********** START EDIT **************/
// The Email subject
?>

This is the subject

<?php
$emailContent['subject'] = trim(ob_get_clean());



ob_start();
// ************************************/
// ********** START EDIT **************/
// the message before the list of Trips
?>

<p>You have the following Trips:</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['beforeItems'] = trim(ob_get_clean());




ob_start();
// ************************************/
// ********** START EDIT **************/
// this gets repeated for each Trip. The following values get replaced 
// $TRIP_NAME$ = the trip name
// $TRIP_LINK$ = the url for the trip
?>

<p><strong>$TRIP_NAME$</strong><br />
Public Link: <a href="$TRIP_LINK$">$TRIP_LINK$</a>
</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['tripItem'] = trim(ob_get_clean());




ob_start();
// ************************************/
// ********** START EDIT **************/
// the message after the list
?>

<p>
Thanks,<br />
The TripNote Team<br />
info@maketripnotes.com
</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['afterItems'] = trim(ob_get_clean());




//leave as is
$emailContent['head'] = '<!doctype html><head></head><body>';
$emailContent['foot'] = '</body></html>';
?>