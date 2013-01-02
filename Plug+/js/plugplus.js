/* Global data */
PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.data = eventData;
}
PlugSettings = {
	notifications : true, //Global notifications flag
	chatLevel : 1, //0 = no notification, 1 = Only mentions, 2 = mentions and friends, 3 = all
	userLevel : 0, //0 = no notification, 1 = friends, 2 = all
	autoWootDelay : 0, //Seconds to delay woot
	autoWoot : false, //Persistent settings
	autoJoin : false,
	pluglist : false,
	songUpdate : 2, //0 = none, 1 = only friends, 2 = all
	djUpdate: 2, //0 = none, 1 = only friends, 2 = all
	notifyTimeout: 7 //Time in seconds before the notification closes automatically.
}

/* Functions */
PlugPlus = {
	avatarURL : "http://www.plug.dj/images/avatars/thumbs/",
	plugPlusEvent : document.createEvent('Event'),
	getAudience : function(_callback){this.fireEvent(new PlugData("getAudience",{callback:_callback}))},
	getSelf : function(_callback){this.fireEvent(new PlugData("getSelf",{callback:_callback}))},
	fireEvent : function(data){$('#plugEvents').html(JSON.stringify(data));$('#plugPlusEvents').get(0).dispatchEvent(this.plugPlusEvent);},
	updateList : function(users){
		
	},
	loadSettings : function(){this.updateSettings($.parseJSON(localStorage['settings']))},
	updateSettings : function(data){//Preserve defaults if settings are incomplete or non existant.
		for (var setting in PlugSettings){
			try{
				PlugSettings[setting] = data[setting]?data[setting]:PlugSettings[setting];
			} catch (e){
				console.warn("P+ setting \"",setting, "\" appears to be corrupted, incorrectly formatted, or missing. Default value was used.");
			}
		}
	},
	saveSettings : function(){localStorage['settings'] = JSON.stringify(PlugSettings)},
	notify : function(_title, _image, _text){chrome.extension.sendRequest({action:"notify",img:_image, title:_title, text:_text, timeout:PlugSettings.notifyTimeout})},
	settings : 0,
	pluglist : 0,
	autowoot : 0,
	autojoin : 0
}



/* Init */
$(function(){
	if (document.location.pathname=="/" | $('.plugPlus')) return;//Only one instance of plug at a time.
	
	PlugPlus.loadSettings();
	
	//Event
	PlugPlus.plugPlusEvent.initEvent('plugPlusEvent',true,true);

	$("body").append("<div style='display:none;' id=\"plugEvents\" hidden></div>");
	$("body").append("<div style='display:none;' id=\"plugPlusEvents\" hidden></div>");
	
	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#audience').append(data);
		PlugPlus.autojoin = $('#autojoin').attr('id','off');
		PlugPlus.autowoot = $('#autowoot').attr('id','off');
		PlugPlus.settings = $('#settings').attr('id','');
		PlugPlus.pluglist = $('#pluglist').attr('id','');
		PlugPlus.pluglist.click(function(){$('#plugPlusSettings').slideUp();$('#plugPlusList').slideToggle();});
		PlugPlus.settings.click(function(){$('#plugPlusList').slideUp();$('#plugPlusSettings').slideToggle();});
	},"html");
	
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("js/plugInterface.js");
	s.type = "application/javascript";
	document.head.appendChild(s);

	$("#plugEvents")[0].addEventListener("plugEvent",function(){
		var data = $.parseJSON($('#plugEvents').text());//Get data from hidden div.
		switch(data.type){
			case "DJ_ADVANCE":
			case "DJ_UPDATE":
			case "VOTE_UPDATE":
			case "USER_JOIN":
			case "USER_LEAVE":
				break;
			case "CHAT":
			default: console.warn("P+ Notice: Possible error ",data);
		}
		console.log(data);
	});
	
});
