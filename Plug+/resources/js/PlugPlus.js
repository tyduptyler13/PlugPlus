PlugSettings = {
		notifications : true, //Global notifications flag
		chatLevel : 1, //0 = no notification, 1 = Only mentions, 2 = mentions and friends, 3 = all
		userLevel : 0, //0 = no notification, 1 = friends, 2 = all
		autoWootDelay : 0, //Seconds to delay woot
		autoWoot : false, //Persistent settings
		autoJoin : false,
		pluglist : false,
		songUpdate : 2, //0 = none, 1 = only friends, 2 = all
		djUpdate: 1, //0 = none, 1 = only friends, 2 = all
		notifyTimeout: 7, //Time in seconds before the notification closes automatically. 0 means never timeout.
};


/*************
 * Functions *
 *************/
PlugPlus = function(){

	this.injectApp(function(plug){
		//Anything that requires the interface to be complete goes here.

		plug.button = {
				autowoot : $("#autowoot"),
				autojoin : $("#autojoin"),
				pluglist : $("#pluglist"),
				settings : $(".plugbutton#settings"),
				plugchat : $("#plugchat"),
				plugUpdates : $("#plugupdates")
		};

		$('.plugButton:not(.disabled)').click(function(){
			try{
				var id = $(this).attr('id');
				plug.toggle[id](plug);
			}catch(e){
				console.warn("Plug+: A button has been pressed that does not have a toggle defined!");
			}
		});

		plug.applySettings();
		
		window.addEventListener("message", this.onReceiveMessage);

		console.log("Plug+: Setup complete.");
	});
	//Anything that doesn't need to wait should go here for speed.
	this.loadSettings();

	//$('.PPSetting').change(this.getSettings);



};
PlugPlus.prototype = {

		constructor : PlugPlus,

		injectApp : function(callback){
			console.log("Plug+: Injecting PlugPlusApp.");

			var plug = this;//Keep plug object in scope while using jquery callbacks.

			$.get(chrome.extension.getURL("resources/append.html"), function(data){
				$('body').append(data);

				$.getScript(chrome.extension.getURL("resources/js/PlugPlusApp.js"))
				.done(function(script, status, statusid){
					console.log("Plug+: PlugPlusApp loaded!");
				})
				.fail(function(){
					console.warn("Plug+: PlugPlusApp failed to load!");
				});

				callback(plug);//If this fails then crash. Nothing would work anyways.

			});
		},

		loadSettings : function(){
			try{
				this.updateSettings(JSON.parse(localStorage['PlugPlusSettings']));
			} catch(e) {
				console.warn("Plug+ warning:",e);
				this.updateSettings({});//Pass empty array to reset settings;
				this.saveSettings();
			}
		},

		updateSettings : function(data){//Preserve defaults if settings are incomplete or non existent.
			for (var setting in PlugSettings){
				try{
					PlugSettings[setting] = (data[setting]!=undefined) ? data[setting] : PlugSettings[setting];
				} catch(e) {
					console.warn("Plug+ warning: Setting \"",setting, "\" appears to be corrupted, incorrectly formatted, or missing. Default value was used.");
				}
			}
		},

		applySettings : function(){//Apply settings only if they are true. Default state is false.
			if (PlugSettings.autoJoin){
				this.button.autojoin.switchClass("inactive", "active");
			}
			if (PlugSettings.autoWoot){
				this.button.autowoot.switchClass("inactive", "active");
			}
			if (PlugSettings.pluglist){
				//Not available yet.
			}
			//TODO Reflect changes in settings popup.
		},

		saveSettings : function(){

			localStorage['PlugPlusSettings'] = JSON.stringify(PlugSettings);

			this.sendMessageToApp("settingsChange", null);

		},

		/*
		 * Disabled for now. No use including it.
		 * 
		 * getSettings : function(){

			var s = PlugSettings;

			//Checks
			if ($('#PPAutoWootDelay')[0].valueAsNumber>90)
				$('#PPAutoWootDelay').attr('value',90);
			if ($('#PPAutoWootDelay')[0].valueAsNumber<0)
				$('#PPAutoWootDelay').attr('value',0);
			if ($('#PPNotifyTimeout')[0].valueAsNumber<0)
				$('#PPNotifyTimeout').attr('value',0);
			//Save
			s.notifications = $('#PPNotifications').is(':checked');
			s.chatLevel = $('#PPChatLevel')[0].selectedIndex;
			s.userLevel = $('#PPUserLevel')[0].selectedIndex;
			s.songUpdate = $('#PPSongUpdate')[0].selectedIndex;
			s.djUpdate = $('#PPDJUpdate')[0].selectedIndex;
			s.autoWootDelay = $('#PPAutoWootDelay')[0].valueAsNumber;
			s.notifyTimeout = $('#PPNotifyTimeout')[0].valueAsNumber;

			//Save settings
			this.saveSettings();

			//Show settings saved
			$('#PPSaved').stop(true,false).show(0).fadeOut(2000);
		},

		setSettings : function(){

			var s = PlugSettings;

			$('#PPNotifications').attr('checked',s.notifications);
			$('#PPChatLevel').val(s.chatLevel);
			$('#PPUserLevel').val(s.userLevel);
			$('#PPSongUpdate').val(s.songUpdate);
			$('#PPDJUpdate').val(s.djUpdate);
			$('#PPAutoWootDelay').attr('value',s.autoWootDelay);
			$('#PPNotifyTimeout').attr('value',s.notifyTimeout);

		},*/

		notify : function(_title, _image, _text){
			if (PlugSettings.notifications){
				//TODO
			}
		},

		button : {
			autowoot : null,
			autojoin : null,
			pluglist : null,
			settings : null,
			plugchat : null,
			plugUpdates : null
		},

		sendMessageToApp : function(type, data){
			try{
				var eventData = {from: "plugPlus", type:type, data:data};
				window.postMessage(eventData, "http://plug.dj/*");
			}catch(e){
				console.error("Plug+: An error has occured!", e);
			}
		},

		onReceiveMessage : function(data){
			console.debug(data);//TODO Don't use this yet.
		},

		sendBackgroundMessage : function(type, data){
			//TODO
		},

		receiveBackgroundMessage : function(data){
			//TODO
		},

		toggle : {
			autowoot : function(plug){
				if(PlugSettings.autoWoot){
					PlugSettings.autoWoot = false;
					plug.button.autowoot.switchClass("active", "inactive");
				} else {
					PlugSettings.autoWoot = true;
					plug.button.autowoot.switchClass("inactive", "active");
				}

				plug.saveSettings();
			},
			autojoin : function(plug){
				if(PlugSettings.autoJoin){
					PlugSettings.autoJoin = false;
					plug.button.autojoin.switchClass("active", "inactive");
				} else {
					PlugSettings.autoJoin = true;
					plug.button.autojoin.switchClass("inactive", "active");
				}

				plug.saveSettings();
			}
		}
};


/********
 * Init *
 ********/

function init(){
	if ($('#audience').length>0){
		if (document.location.pathname=="/" || $('.plugPlus').length>0) return;//Only one instance of plug at a time.

		//TODO add var when final.
		plug = new PlugPlus();

	} else {
		setTimeout(init, 250);
	}
}
init();

function isURL(data){
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
	if (urlregex.test(data)) {
		return (true);
	}
	return (false);
}

function convertImage(src, callback){
	var image = document.createElement("img");
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	image.crossOrigin = "Anonymous";
	image.onload = function(){
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0);
		callback(canvas.toDataURL("image/png"));
	};
	image.src = src;
}

