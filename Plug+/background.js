  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);
  _gaq.push(['_setCustomVar',1,'Version',chrome.app.getDetails().version,2]);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

var icon = chrome.extension.getURL("icon.png");

if (localStorage["showNotifications"]==undefined){
	localStorage["showNotifications"]="true";
	notify(icon, "Plug+", "Check Plug+ button for new settings.");
}
	
if (localStorage["notificationTimeout"]==undefined){
	notify(icon, "Plug+", "Check Plug+ button for new settings.");
	localStorage["notificationTimeout"]=5;
}
	
function notify(img, title, text){
	if (localStorage["showNotifications"]=="true"){
		var notification = webkitNotifications.createNotification(img,title,text);
		notification.show();
		//fifunja solution
		setTimeout(function() {notification.cancel();}, 1000 * localStorage['notificationTimeout']);
		var _onunload = window.onunload;
		window.onunload = function() {notification.cancel(); _onunload();}
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponce) {
	if (!checkURL(request.img))
		request.img = chrome.extension.getURL("icon.png");
	if (request.action=="notify"){
		notify(request.img,request.title,request.text);
	}else if (request.action=="getSave"){
		sendResponce({value: localStorage[request.save]});
	}
});

if (localStorage["showNotifications"]=="true") {//One time check every time background starts.
	if (localStorage["lastVersion"] !== undefined) {
		if (localStorage["lastVersion"] !== chrome.app.getDetails().version) {
			notify(icon,"Update","Plug+ has been updated to " + chrome.app.getDetails().version);
			localStorage["lastVersion"] = chrome.app.getDetails().version;
		} 
	} else {
		localStorage["lastVersion"] = chrome.app.getDetails().version;
		notify(icon,"Version","Plug+ is now using version: " + chrome.app.getDetails().version);
	}
}

function checkURL(value) {
	var string = "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!10(?:\\.\\d{1,3}){3})" +
      "(?!127(?:\\.\\d{1,3}){3})" +
      "(?!169\\.254(?:\\.\\d{1,3}){2})" +
      "(?!192\\.168(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host name
      "(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)" +
      // domain name
      "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*" +
      // TLD identifier
      "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:/[^\\s]*)?" +
  "$";
    var urlregex = new RegExp(string,"i");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}
