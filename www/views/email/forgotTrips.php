<?php
$emailContent = array();


ob_start();
// ************************************/
// ********** START EDIT **************/
// The Email subject
?>

Your Tripnotes

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['subject'] = trim(ob_get_clean());



ob_start();
// ************************************/
// ********** START EDIT **************/
// the message before the list of Trips
?>

<p>
Hello traveller,<br><br>
You've made the following Tripnotes:
</p>

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
<a href="$TRIP_LINK$">$TRIP_LINK$</a>
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
Collaborate on Tripnotes together with friends.  All you need to do is send them the Tripnotes link.
<br><br>
Thank you for using Tripnotes,<br/>
If you need any help, please e-mail info@maketripnotes.com
</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['afterItems'] = trim(ob_get_clean());




//leave as is
$emailContent['head'] = '<!doctype html><head></head><body>';
$emailContent['foot'] = '</body></html>';
?>