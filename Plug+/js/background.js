  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);
  _gaq.push(['_setCustomVar',2,'Version',chrome.app.getDetails().version]);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

var icon = chrome.extension.getURL("icon.png");
	
function notify(img, title, text, timeout){
	var notification = webkitNotifications.createNotification(img,title,text);
	notification.show();
	if (timeout != 0){
		setTimeout(function() {notification.cancel();}, 1000 * localStorage['notificationTimeout']);
		var _onunload = window.onunload;
		window.onunload = function() {
			notification.cancel();
			_onunload();
		}
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponce) {
	try{
		if (!checkURL(request.img))
			request.img = chrome.extension.getURL("icon.png");
		if (request.timeout == undefined || !isNaN(request.timeout))
			request.timeout = 7;
		if (request.action=="notify"){
			notify(request.img,request.title,request.text,request.timeout);
		} else {
			console.warn("Request not defined!");
		}
	}catch(err){
		console.error("Request variable missing.");
	}
});

if (localStorage["lastVersion"] !== undefined) {
	if (localStorage["lastVersion"] !== chrome.app.getDetails().version) {
		notify(icon,"Update","Plug+ has been updated to " + chrome.app.getDetails().version);
		localStorage["lastVersion"] = chrome.app.getDetails().version;
	} 
} else {
	localStorage["lastVersion"] = chrome.app.getDetails().version;
	notify(icon,"Version","Plug+ is now using version: " + chrome.app.getDetails().version);
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
