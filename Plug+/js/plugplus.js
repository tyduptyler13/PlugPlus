/* Global data */
Avatars = "http://www.plug.dj/images/avatars/thumbs/";
PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.data = eventData;
}

/* Functions */
PlugPlus = {
	plugPlusEvent : document.createEvent('Event'),
	getAudience : function(_callback){this.fireEvent(new PlugData("getAudience",{callback:_callback}))},
	fireEvent : function(data){$('#plugEvents').html(JSON.stringify(data));$('#plugPlusEvents').get(0).dispatchEvent(this.plugPlusEvent);},
}



/* Init */
$(function(){
	if (document.location.pathname=="/") return;
	
	//Event
	PlugPlus.plugPlusEvent.initEvent('plugPlusEvent',true,true);

	$("body").append("<div style='display:none;' id=\"plugEvents\" hidden></div>");
	$("body").append("<div style='display:none;' id=\"plugPlusEvents\" hidden></div>");
	
	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#audience').append(data);
	},"html");
	
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("js/plugInterface.js");
	s.type = "text/javascript";
	document.head.appendChild(s);

	$("#plugEvents")[0].addEventListener("plugEvent",function(){
		var data = $.parseJSON($('#ppEvents').text());//Get data from hidden div.
		console.log(data);
	});
	
});


