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
	this.event = new Event("plugPlusEvent");
	
};
PlugPlus.prototype = {
		
		constructor : PlugPlus,
		
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
				setTimeout("PlugPlus.button.autojoin.attr('id','on');PlugPlus.autojoin();",1000);//Wait 1 second before sending anything. The event isn't ready.
			}
			if (PlugSettings.autoWoot){
				PlugPlus.button.autowoot.attr('id','on');
				PlugPlus.autowoot();
			}
			if (PlugSettings.pluglist){
				$('#plugPlusSettings').slideUp();
				$('#plugPlusList').slideToggle();
			}
			this.settingsForm.update();
		},
		
		saveSettings : function(){localStorage['PlugPlusSettings'] = JSON.stringify(PlugSettings);},
		notify : function(_title, _image, _text){
			if (PlugSettings.notifications)
				chrome.extension.sendRequest({action:"notify",img:_image, title:_title, text:_text, timeout:PlugSettings.notifyTimeout});
		},
		
		button : {autowoot : 0,autojoin : 0, pluglist : 0, settings : 0, manmode : 0},
		
		convertImage : function(src, callback){
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
		},
		
		sendMessageToApp : function(type, data){
			
		},
		
		onRecieveMessage : function(type, data){
			
		}
};

/* TODO Rewrite this.
 * settingsForm : {
			autoSave : function(){$('.PPSetting').change(this.save);},
			update : function(){
				$('#PPNotifications').attr('checked',PlugSettings.notifications);
				$('#PPChatLevel').val(PlugSettings.chatLevel);
				$('#PPUserLevel').val(PlugSettings.userLevel);
				$('#PPSongUpdate').val(PlugSettings.songUpdate);
				$('#PPDJUpdate').val(PlugSettings.djUpdate);
				$('#PPAutoWootDelay').attr('value',PlugSettings.autoWootDelay);
				$('#PPNotifyTimeout').attr('value',PlugSettings.notifyTimeout);
				$('#PPEBO').attr('checked',PlugSettings.allowBackgroundOverride);
				$('#PPEAO').attr('checked',PlugSettings.allowAvatarOverride);
				$('#PPBO').attr('value', PlugSettings.backgroundOverrideURL);
				$('#PPAAO').val(PlugSettings.audienceOverride);
				$('#PPBAO').val(PlugSettings.boothOverride);
				$('#PPDJAO').val(PlugSettings.djOverride);
			},
			save : function(){
				//Checks
				if ($('#PPAutoWootDelay')[0].valueAsNumber>90)
					$('#PPAutoWootDelay').attr('value',90);
				if ($('#PPAutoWootDelay')[0].valueAsNumber<0)
					$('#PPAutoWootDelay').attr('value',0);
				if ($('#PPNotifyTimeout')[0].valueAsNumber<0)
					$('#PPNotifyTimeout').attr('value',0);
				//Save
				PlugSettings.notifications = $('#PPNotifications').is(':checked');
				PlugSettings.chatLevel = $('#PPChatLevel')[0].selectedIndex;
				PlugSettings.userLevel = $('#PPUserLevel')[0].selectedIndex;
				PlugSettings.songUpdate = $('#PPSongUpdate')[0].selectedIndex;
				PlugSettings.djUpdate = $('#PPDJUpdate')[0].selectedIndex;
				PlugSettings.autoWootDelay = $('#PPAutoWootDelay')[0].valueAsNumber;
				PlugSettings.notifyTimeout = $('#PPNotifyTimeout')[0].valueAsNumber;
				PlugSettings.allowAvatarOverride = $('#PPEAO').is(':checked');
				PlugSettings.allowBackgroundOverride = $('#PPEBO').is(':checked');
				PlugSettings.backgroundOverrideURL = $('#PPBO').val();
				PlugSettings.audienceOverride = $('#PPAAO').val();
				PlugSettings.boothOverride = $('#PPBAO').val();
				PlugSettings.djOverride = $('#PPDJAO').val();

				//Save settings
				PlugPlus.saveSettings();

				//Special Overrides
				PlugPlus.performOverrides();

				//Show settings saved
				$('#PPSaved').stop(true,false).show(0).fadeOut(2000);
			}
		},
 */



/********
 * Init *
 ********/

function init(){
	if ($('#audience').length>0){
		if (document.location.pathname=="/" || $('.plugPlus').length>0) return;//Only one instance of plug at a time.
		
		var plug = new PlugPlus();
		
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



