//Custom Tracking
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

(function(){
	ga('create', 'UA-32685589-1', 'auto');
	ga('send', 'pageview');
	ga('set', 'dimension1', chrome.app.getDetails().version);
})();


var icon = chrome.extension.getURL("resources/images/largeIcon.png");

function notify(img, title, text, timeout){
	var opts = {
			type: "basic",
			title: title,
			iconUrl: img,
			message: text
	};

	ga('send', 'event', 'notify', 'create');
	
	chrome.notifications.create(text, opts, function(notification){
		if (timeout > 0){
			setTimeout(function() {
				chrome.notifications.clear(notification, function(){});
			}, timeout * 1000);
		}
	});
	
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponce) {
	try{
		switch(request.action){
		case "notify":
			if (!checkURL(request.img))
				request.img = icon;
			if (request.timeout == undefined || isNaN(request.timeout))
				request.timeout = 7;
			notify(request.img,request.title,request.text,request.timeout);
			break;
		default:
			console.warn("Request not defined!");
			break;
		}
	}catch(err){
		console.error("An error occured in the request!", this);
	}
});

/**
 * Standardized request container.
 * @param success {boolean}
 * @param data {Object}
 * @param callback {String}
 * @constructor
 */
function RequestData(success, data, callback){
	this.success = success;
	this.responce = data;
	this.callback = callback;
}
RequestData.prototype.constructor = RequestData;

if (localStorage["lastVersion"] !== undefined) {
	if (localStorage["lastVersion"] !== chrome.app.getDetails().version) {
		notify(icon,"Update","Plug+ has been updated to " + chrome.app.getDetails().version,0);
		localStorage["lastVersion"] = chrome.app.getDetails().version;
	} 
} else {
	localStorage["lastVersion"] = chrome.app.getDetails().version;
	notify(icon,"Version","Plug+ is now using version: " + chrome.app.getDetails().version,0);
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
