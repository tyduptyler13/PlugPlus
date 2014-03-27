var icon = chrome.extension.getURL("resources/images/largeIcon.png");

function notify(img, title, text, timeout){
	var opts = {
			type: "basic",
			title: title,
			iconUrl: img,
			message: text
	};
	
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
			
			var data = request.data;
			
			if (data.convert === true && data.image != "undefined" && data.image.indexOf('.png')!=-1){
				data.image = chrome.extension.getURL('/resources/images/' + data.image);
			} else if (!checkURL(data.image)) {
				data.image= icon;
			}
			
			if (data.timeout == undefined || isNaN(data.timeout))
				data.timeout = 7;
			
			try{
				notify(data.image, data.title, data.text, data.timeout);
			} catch (e) {
				//Try again if something goes wrong.
				notify(icon, data.title, data.text, data.timeout);
			}
			
			break;
		default:
			console.warn("Request not defined!");
			break;
		}
	}catch(err){
		console.error("An error occured in the request!", err);
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
