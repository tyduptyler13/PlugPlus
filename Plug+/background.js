  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
  
function notify(img, title, text){
	var notification = webkitNotifications.createNotification(img,title,text);
	notification.show();
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponce) {
	console.log("Request made: "+request);
	if (request.action=="notify"){
		notify(request.img,request.title,request.text);
	}else if (request.action=="getSave"){
		sendResponce({value: localStorage[request.save]});
	}
});

if (localStorage["showNotifications"]=="true") {//One time check every time background starts.
	if (localStorage["lastVersion"] !== undefined) {
		if (localStorage["lastVersion"] !== chrome.app.getDetails().version) {
			nofify('icon.png',"Update","Plug+ has been updated!");
			localStorage["lastVersion"] = chrome.app.getDetails().version;
		} 
	} else {
		localStorage["lastVersion"] = chrome.app.getDetails().version;
	}
}