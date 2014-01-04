/************
 * Settings *
 ************/
var PlugSettings = {
		notifications : true, //Global notifications flag
		requireBlur : true,
		chatLevel : {
			mention : true,
			friend : true,
			mod : true,
			all : false
		},
		userLevel : 1, //0 = no notification, 1 = friends, 2 = all
		autoWootDelay : 5, //Seconds to delay woot
		autoWoot : false, //Persistent settings
		autoJoin : false,
		theme : [],//Future setting. (Theme tracking)
		songUpdate : 2, //0 = none, 1 = only friends, 2 = all
		djUpdate: 1, //0 = none, 1 = only friends, 2 = all
		notifyTimeout: 0, //Time in seconds before the notification closes automatically. 0 means never timeout.
		configVersion : 3 //This gets incremented when a setting is removed or the default values change.
};

/*************
 * Functions *
 *************/
var PlugPlus = function(){

	this.port = null;

	this.injectApp(function(plug){
		//Anything that requires the interface to be complete goes here.

		plug.button = {
				autowoot : $("#autowoot"),
				autojoin : $("#autojoin"),
				pluglist : $("#pluglist"),
				settings : $("#psettings"),
				plugchat : $("#plugchat"),
				plugupdates : $("#plugupdates"),
				hidevideo : $('#hidevideo')
		};

		$('.plugButton:not(.disabled)').click(function(){
			try{
				var id = $(this).attr('id');
				plug.toggle[id](plug);
				ga('send', 'event', 'button', 'clicked', id);
			}catch(e){
				console.warn("Plug+: A button has been pressed that does not have a toggle defined!");
			}
		});

		//Settings stuff

		$('.PPSetting.spinner').spinner();
		$('.PPSetting.check').buttonset();
		$('.PPSetting.radio').buttonset();
		$('.PPSetting.button').button();

		//Theme stuff
		$('#themeControls button').button().click(function(){
			var button = $(this);
			if (button.attr('id') == "themeLeft"){
				$('#plugPlusContent').removeClass("right");
			} else if (button.attr('id') == "themeRight"){
				$('#plugPlusContent').addClass('right');
			}
		});
		$('#themeControls #hideToggle').button();
		$('#hideToggle').next().click(function(){
			if (!$(this).hasClass("ui-state-active")){
				$('#plugPlusContent').addClass('autoHide');
			} else {
				$('#plugPlusContent').removeClass('autoHide');
			}
		});
		$('#themeLeft').button("option", {
			icons: {
				primary : "ui-icon-arrowthickstop-1-w"
			},
			text : false
		});
		$("#themeRight").button("option", {
			icons: {
				primary : "ui-icon-arrowthickstop-1-e"
			},
			text : false
		});

		plug.applySettings();

		console.log("Plug+: Setup complete.");
	});
	//Anything that doesn't need to wait should go here for speed.
	this.loadSettings();

	var scope = this;
	
	window.addEventListener("message", function(message){
		scope.onReceiveMessage(message);
	});



};
PlugPlus.prototype = {

		constructor : PlugPlus,

		injectApp : function(callback){
			console.log("Plug+: Injecting PlugPlusApp.");

			var plug = this;//Keep plug object in scope while using jquery callbacks.

			$.get(chrome.extension.getURL("resources/append.html"), function(data){
				$('#room').append(data);

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
				var settings = JSON.parse(localStorage['PlugPlusSettings']);
				if (settings.configVersion == undefined || settings.configVersion < PlugSettings.configVersion){
					this.updateSettings({});
					this.createDialog("Your settings were using an old format. Please update the settings.", {
						dialogClass : "alert",
						title: "Notice"});
				} else {
					this.updateSettings(settings);
				}
			} catch(e) {
				console.warn("Plug+ warning: ",e);
				this.createDialog("An error occured loading your settings and the default settings were loaded instead.", {
					dialogClass : "alert ui-state-error",
					title: "Notice"});
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
			//Settings form
			if (PlugSettings.notifications){
				$('#PPNotifications').prop('checked', true);
			}
			
			if (PlugSettings.requireBlur){
				$('#PPRequireBlur').prop('checked', true);
			}

			if (PlugSettings.chatLevel.all){
				$('.PPChat').prop('checked', true);
			} else {//The following is already checked if the last statement was true.
				if (PlugSettings.chatLevel.friend){
					$('#PPChatFriends').prop('checked', true);
				}
				if (PlugSettings.chatLevel.mod){
					$('#PPChatMod').prop('checked', true);
				}
				if (PlugSettings.chatLevel.mention){
					$('#PPChatMentions').prop('checked', true);
				}
			}

			switch(PlugSettings.userLevel){
			case 0:
				$('#PPUserLevelNone').prop('checked', true);
				break;
			case 1:
				$('#PPUserLevelFriends').prop('checked', true);
				break;
			case 2:
				$('#PPUserLevelAll').prop('checked', true);
				break;
			default: console.warn("Plug+: UserLevel is incorrectly set. Recommend resetting it.");
			}

			switch(PlugSettings.songUpdate){
			case 0:
				$('#PPSongUpdateNone').prop('checked', true);
				break;
			case 1:
				$('#PPSongUpdateFriends').prop('checked', true);
				break;
			case 2:
				$('#PPSongUpdateAll').prop('checked', true);
				break;
			default: console.warn("Plug+: SongUpdate is incorrectly set. Recommend resetting it.");
			}

			switch(PlugSettings.djUpdate){
			case 0:
				$('#PPDJUpdateNone').prop('checked', true);
				break;
			case 1:
				$('#PPDJUpdateFriends').prop('checked', true);
				break;
			case 2:
				$('#PPDJUpdateAll').prop('checked', true);
				break;
			default: console.warn("Plug+: DJUpdate is incorrectly set. Recommend resetting it.");
			}

			$('#PPAutoWootDelay').val(PlugSettings.autoWootDelay);
			$('#PPNotifyTimeout').val(PlugSettings.notifyTimeout);

			/**
			 * Once again, finding broken methods in jqueryui and decided to make my own.
			 * Basicly this will find the button elements, select the labels that represent them
			 * and switch their classes to show that they are selected. Normally this is done
			 * with $.button('refresh') but it wouldn't work on buttonsets.
			 */
			$('input:checked').next().switchClass('.ui-state-default', 'ui-state-active');

			var scope = this;
			$('#plugPlusSettingsForm').click(function(){
				scope.getSettings();
			});

		},

		saveSettings : function(){

			localStorage['PlugPlusSettings'] = JSON.stringify(PlugSettings);

			this.sendMessageToApp("settingsChange", null);

		},

		getSettings : function(){

			var s = PlugSettings;

			//Checks
			if ($('#PPAutoWootDelay').val()>90)
				$('#PPAutoWootDelay').val(90);
			if ($('#PPAutoWootDelay').val()<0)
				$('#PPAutoWootDelay').val(0);
			if ($('#PPNotifyTimeout').val()<0)
				$('#PPNotifyTimeout').val(0);
			//Save
			s.notifications = $('#PPNotifications').is(':checked');
			s.requireBlur = $('#PPRequireBlur').is(':checked');
			s.chatLevel.mention = $('#PPChatMentions').is(':checked');
			s.chatLevel.friend = $('#PPChatFriends').is(':checked');
			s.chatLevel.mod = $('#PPChatMod').is(':checked');
			s.chatLevel.all = $('#PPChatAll').is(':checked');

			switch($('input[name=PPUserLevel]:checked').attr('id')){
			case 'PPUserLevelAll': s.userLevel = 2; break;
			case 'PPUserLevelFriends': s.userLevel = 1; break;
			case 'PPUserLevelNone':
			default: s.userLevel = 0;
			}

			switch($('input[name=PPSongUpdate]:checked').attr('id')){
			case 'PPSongUpdateAll': s.songUpdate = 2; break;
			case 'PPSongUpdateFriends': s.songUpdate = 1; break;
			case 'PPSongUpdateNone':
			default: s.songUpdate = 0;
			}

			switch($('input[name=PPDJUpdate]:checked').attr('id')){
			case 'PPDJUpdateAll': s.djUpdate = 2; break;
			case 'PPDJUpdateFriends': s.djUpdate = 1; break;
			case 'PPDJUpdateNone':
			default: s.djUpdate = 0;
			}

			s.autoWootDelay = $('#PPAutoWootDelay').val();
			s.notifyTimeout = $('#PPNotifyTimeout').val();

			//Save settings
			this.saveSettings();
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

			var eventData = {type:type, data:data};
			this.port.postMessage(eventData);

		},

		onReceiveMessage : function(message){
			var scope = this;
			
			if (message.data == "PlugPlusAppReady"){
				this.port = message.ports[0];
				this.port.onmessage = function(message){
					scope.onMessageFromApp(message);
				};
				console.log("Plug+: Hooked private connection to PlugPlusApp");
			} //Ignore everything else.
		},

		onMessageFromApp : function(message){
			if (message.data.type == "notify"){
				var d = message.data.data;
				this.notify(d.title, d.image, d.text);
			}
		},

		notify : function(title, image, text){

			if (!PlugSettings.notifications) return;
			
			chrome.runtime.sendMessage({
				action: "notify",
				img: image,
				text: text,
				title: title,
				timeout: PlugSettings.notifyTimeout
			}, function(response){});

		},

		openPopup : function(id, extraParams){
			var params = {
					appendTo : "#plugPlusContextContainer",
					minWidth : 400,
					minHeight : 200
			};

			for(param in extraParams){
				params[param]=extraParams[param];
			}

			$(id).dialog(params);
		},

		closePopup : function(id){
			$(id).dialog("destroy");
		},

		createDialog : function(message, params){
			var element = $(document.createElement('div'));
			element.append(message);
			element.addClass("plugPlusContext");

			$('#plugPlusContextContainer').append(element);

			params.close = (params.close != undefined) ? params.close : function(){
				element.remove();
			};

			this.openPopup(element, params);
		},

		toggle : {
			autowoot : function(plug){
				if (PlugSettings.autoWoot){
					PlugSettings.autoWoot = false;
					plug.button.autowoot.switchClass("active", "inactive");
				} else {
					PlugSettings.autoWoot = true;
					plug.button.autowoot.switchClass("inactive", "active");
				}

				plug.saveSettings();
			},
			autojoin : function(plug){
				if (PlugSettings.autoJoin){
					PlugSettings.autoJoin = false;
					plug.button.autojoin.switchClass("active", "inactive");
				} else {
					PlugSettings.autoJoin = true;
					plug.button.autojoin.switchClass("inactive", "active");
				}

				plug.saveSettings();
			},
			pluglist : function(plug){
				if (plug.button.pluglist.hasClass('active')){
					plug.button.pluglist.removeClass('active');
					plug.closePopup('#plugPlusList');
				} else {
					plug.button.pluglist.addClass('active');
					plug.openPopup('#plugPlusList', {
						close : function(){
							plug.button.pluglist.removeClass('active');
						},
						width: 800,
						height: 250
					});
				}
			},
			psettings : function(plug){
				if (plug.button.settings.hasClass('active')){
					plug.button.settings.removeClass('active');
					plug.closePopup('#plugPlusSettings');
				} else {
					plug.button.settings.addClass('active');
					plug.openPopup('#plugPlusSettings', {
						close : function(){
							plug.button.settings.removeClass('active');
						},
						width: 800,
						height: 350
					});
				}
			},
			plugchat : function(plug){
				if (plug.button.plugchat.hasClass('active')){
					plug.button.plugchat.removeClass('active');
					plug.closePopup('#plugPlusChat');
				} else {
					plug.button.plugchat.addClass('active');
					plug.openPopup('#plugPlusChat', {
						close : function(){
							plug.button.plugchat.removeClass('active');
						},
						width: 550,
						height: 420
					});
				}
			},
			plugupdates: function(plug){
				if (plug.button.plugupdates.hasClass('active')){
					plug.button.plugupdates.removeClass('active');
					plug.closePopup('#plugPlusUpdates');
				} else {
					plug.button.plugupdates.addClass('active');
					plug.openPopup('#plugPlusUpdates', {
						close : function(){
							plug.button.plugupdates.removeClass('active');
						},
						width: 850,
						height: 600
					});
				}
			},
			hidevideo: function(plug){
				if (plug.button.hidevideo.hasClass('active')){
					plug.button.hidevideo.removeClass('active');
					$('#playback').slideDown();
				} else {
					plug.button.hidevideo.addClass('active');
					$('#playback').slideUp();
				}
			}
		}
};


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

	ga(function(){
		console.log("Plug+: ga loaded.");
	});
	ga('create', 'UA-32685589-1', 'auto');
	ga('send', 'pageview');
	ga('require', 'linkid', 'linkid.js');

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

/**
 * Self managing window visibility detection.
 * 
 * From http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
 * 
 * Slightly modified to avoid conflicts.
 */
(function() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide 
            = window.onfocus = window.onblur = onchange;

    function onchange (evt) {
        var v = 'visible', h = 'hidden',
            evtMap = { 
                focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h 
            };

        evt = evt || window.event;
        var doc = $(document.body);
        if (evt.type in evtMap)
            doc.addClass(evtMap[evt.type]);
        else        
            this[hidden] ? doc.addClass("hidden") : doc.removeClass("hidden");
    }
})();

