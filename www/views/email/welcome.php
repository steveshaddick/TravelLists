<?php
$emailContent = array();


ob_start();
// ************************************/
// ********** START EDIT **************/
// The Email subject
// $TRIP_NAME$ = the trip name
?>

$TRIP_LOCATION$ Tripnotes created

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

<p>Hi $NAME$,</p>
<p>Your new Tripnote to $TRIP_LOCATION$ has been created.<p>
<p>Use the link below to plan your trip. You can also share the link with friends to get their recommendations of the best places to eat, stay and things to do.</p>
<p><a href="$TRIP_LINK$">$TRIP_LINK$</a></p>
<p>If you have any questions, reply to this email or tweet us at <a href="http://www.twitter.com/maketripnotes">@maketripnotes</a></p>


<p>
Thanks for using Tripnotes, the easiest way to get &amp; organize travel recommendations.<br><br>
Happy travels from Steve, Nathan, and Charles<br/>
hello@maketripnotes.com
</p>

<?php
// ********** END EDIT **************/
// ************************************/
$emailContent['body'] = str_replace(array("\r\n", "\n", "\r"), "", ob_get_clean());




//leave as is
$emailContent['head'] = '<!doctype html><head></head><body>';
$emailContent['foot'] = '</body></html>';
?>