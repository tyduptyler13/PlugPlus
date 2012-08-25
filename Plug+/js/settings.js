//Tracking
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

//Settings code

//Check for undefined settings
if (localStorage["showNotifications"]==undefined){
	localStorage["showNotifications"]="true";
	notify("Check Plug+ button for new settings.");
}
	
if (localStorage["notificationTimeout"]==undefined){
	notify("Check Plug+ button for new settings.");
	localStorage["notificationTimeout"]=5;
}

//Manage settings

$(function(){
	$('#n1').prop('checked', localStorage['showNotifications'] == "true");
	$('#n1').button();
	$('.version').text("v" + chrome.app.getDetails().version); 
	$('#tr').slider({
		range: "min",
		value: localStorage['notificationTimeout'],
		min: 1,
		max: 15,
		slide: function( event, ui){
			$('#rv').text(ui.value+"s");
		}
	});
	$('#rv').text($('#tr').slider("value") + "s");
	$('#submit').button().click(function(){save(); return false;});
});

function save(){
	localStorage['showNotifications'] = $('#n1').prop('checked')==true ? "true" : "false";
	localStorage['notificationTimeout'] = $('#tr').slider('value');
	$('#status').show('slow',function(){$(this).hide(2000)});
}

function notify(text){
	var img = "icon.png";
	var title = "Plug+";
	if (localStorage["showNotifications"]=="true"){
		var notification = webkitNotifications.createNotification(img,title,text);
		notification.show();
		//fifunja solution
		setTimeout(function() {notification.cancel();}, 1000 * localStorage['notificationTimeout']);
	}
}
