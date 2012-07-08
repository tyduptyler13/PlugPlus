  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();


if (localStorage["showNotifications"]==undefined){
	localStorage["showNotifications"]="true";
	notify("Check Plug+ button for new settings.");
}
	
if (localStorage["notificationTimeout"]==undefined){
	notify("Check Plug+ button for new settings.");
	localStorage["notificationTimeout"]=5;
}

function start(){
	$('#timeoutRange').get(0).value = localStorage['notificationTimeout'];
	$('#rangeValue').text($('#timeoutRange').get(0).value);
	$('#timeoutRange').change(function(e) {
		$('#rangeValue').text($('#timeoutRange').get(0).value);
	});
}

function save(){
	
}

function notify(text){
	var img = "icon.png";
	var title = "Plug+";
	if (localStorage["showNotifications"]=="true"){
		var notification = webkitNotifications.createNotification(img,title,text);
		notification.show();
		//fifunja solution
		setTimeout(function() {notification.cancel();}, 5000);
	}
}