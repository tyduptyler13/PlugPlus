/* Global data */
PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.data = eventData;
};

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
		manMode : false,
		allowBackgroundOverride : false,
		allowAvatarOverride : false
};

/* Functions */
PlugPlus = {
		serverAW : true,
		serverAJ : true,
		serverDisabled : "This option has been disabled by the server.",
		avatarURL : "http://www.plug.dj/images/avatars/thumbs/",
		self : null,
		plugPlusEvent : new CustomEvent("plugPlusEvent",{bubbles:false,cancelable:true}),
		getAudience : function(_callback){this.fireEvent(new PlugData("getAudience",{callback:_callback}));},
		getSelf : function(_callback){this.fireEvent(new PlugData("getSelf",{callback:_callback}));},
		fireEvent : function(data){$('#plugPlusEvents').html(JSON.stringify(data));$('#plugPlusEvents')[0].dispatchEvent(this.plugPlusEvent);},
		updateList : function(users){
			if( Object.prototype.toString.call( users ) !== '[object Array]' ){
				users = [users];
			}
			if ($('#plugPlusListArea').children().length==1){
				$('#plugPlusListArea').children().remove("div#loading");
			}
			var list = new Array();
			var User = function(){
				this.class = "";//Vote
				this.border = "";
				this.outline = "";
				this.username = "";
			};
			users.forEach(function(user){
				var tmp = new User();
				tmp.id = user.id;
				tmp.class = user.vote==1?"voteup":(user.vote==-1?"votedown":"");
				tmp.border = user.permission>0?"border: #E90E82 "+user.permission+"px solid;":"";
				tmp.outline = (user.relationship>0)?//Either the relationship to you or an outline that shows who you are.
						"outline: #DEE97D "+user.relationship*2+"px solid;":(user.id==PlugPlus.self.id)?
								"outline: #0072BB solid thin":"";
				tmp.username = user.username.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
				list.push(tmp);
			});
			list.forEach(function(user){
				if ($("#"+user.id).length==0){
					var tmp = "<div class=\""+user.class+"\" id=\""+user.id+"\" style=\""+user.border+user.outline+"\">"+user.username+"</div>";
					$('#plugPlusListArea').append(tmp);
				}else{
					$("#plugPlusListArea #"+user.id).attr('class',user.class).attr('style',user.border+user.outline);
				}
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
					PlugSettings[setting] = data[setting]!=undefined?data[setting]:PlugSettings[setting];
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
			if (PlugSettings.manMode){
				PlugPlus.button.manmode.attr('id','on');
				PlugPlus.manMode.create();
			}
			this.settingsForm.update();
		},
		saveSettings : function(){localStorage['PlugPlusSettings'] = JSON.stringify(PlugSettings);},
		notify : function(_title, _image, _text){
			if (PlugSettings.notifications)
				chrome.extension.sendRequest({action:"notify",img:_image, title:_title, text:_text, timeout:PlugSettings.notifyTimeout});
		},
		autowoot : function(){
			if (PlugSettings.autoWoot && this.serverAW){
				if (PlugSettings.autoWootDelay>0){
					setTimeout("$('#button-vote-positive').click();",PlugSettings.autoWootDelay*1000);
				}else{
					$('#button-vote-positive').click();
				}
			}
		},
		autojoin : function(){
			if (PlugSettings.autoJoin && this.serverAJ)
				PlugPlus.fireEvent(new PlugData("JoinWaitList",true));
		},
		djUpdate : function(data){
			switch(PlugSettings.djUpdate){
			case 0:break;//No notification.
			case 1:if (data[0].relationship==0) break;//Skip if not a friend.
			case 2:PlugPlus.notify("New dj",PlugPlus.avatarURL+data[0].avatarID+".png",data[0].username+" is now playing.");break;
			default:console.warn("A setting seems to have a bad value!",PlugSettings);
			}
		},
		songUpdate : function(data){
			switch(PlugSettings.songUpdate){
			case 0:break;
			case 1:if (data.dj.relationship==0) break;
			case 2:PlugPlus.notify("Song Update",PlugPlus.avatarURL+data.dj.avatarID+".png",data.dj.username+" is now playing the song \""+data.media.title+"\" by "+data.media.author);break;
			default:console.warn("A setting seems to have a bad value!",PlugSettings);
			}
		},
		chat : function(data, from, you){
			var setting = PlugSettings.chatLevel;
			if (setting==0) return;
			if (setting == 1){
				if (data.message.indexOf(you.username)==-1) return;
			}else if (setting==2){
				if (from.relationship==0 && data.message.indexOf(you.username)==-1) return;
			}else{
				PlugPlus.notify("Chat",PlugPlus.avatarURL+from.avatarID+".png",from.username+": "+data.message);
			}
		},
		userJoin : function(user){
			switch(PlugSettings.userLevel){
			case 0:break;
			case 1:if (user.relationship==0) break;
			case 2:PlugPlus.notify("User Enter Notice",PlugPlus.avatarURL+user.avatarID+".png",user.username+" has joined the room. Say hello!");break;
			default:console.warn("A setting seems to have a bad value!",PlugSettings);
			}
		},
		userLeave : function(user){
			//Remove user from list.
			$('#plugPlusListArea #'+user.id).remove();
			//Notifications
			switch(PlugSettings.userLevel){
			case 0:break;
			case 1:if (user.relationship==0) break;
			case 2:PlugPlus.notify("User Exit Notice",PlugPlus.avatarURL+user.avatarID+".png",user.username+" has left the room.");break;
			default:console.warn("A setting seems to have a bad value!",PlugSettings);
			}
		},
		userVote : function(data){
			switch(PlugSettings.userLevel){
			case 0:break;
			case 1:if (data.user.relationship==0) break;
			case 2:PlugPlus.notify("Vote Update",PlugPlus.avatarURL+data.user.avatarID+".png",data.user.username+" has "+(data.vote==1?"wooted":"meh'd")+" this song.");break;
			default:console.warn("A setting seems to have a bad value!",PlugSettings);
			}
		},
		button : {autowoot : 0,autojoin : 0, pluglist : 0, settings : 0, manmode : 0},
		settingsForm : {
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
				//Save settings
				PlugPlus.saveSettings();
				//Show settings saved
				$('#PPSaved').stop(true,false).show(0).fadeOut(2000);
			}
		},
		manMode : {
			create : function(){
				$('.plugPlus').draggable({cancel:".plugPlusContent"});
				$('.plugPlusBar').resizable({autoHide: true, handles: "e, w", minWidth:600, maxWidth:1200}).resize(function(){//No vertical sizing.
					$('.plugPlus').css('width',$('.plugPlusBar').css('width'));//Hacky width fix for some jquery issue.
				});
			},
			destroy : function(){
				$('.plugPlus').draggable('destroy').css({top:'',left:''});//Fix bugs...
				$('.plugPlusBar').resizable('destroy').css({width:''}).trigger("resize");//And yet more jquery bugs...
			}
		},
		updateUserCount : function(count){
			$('#plugUsers').text(count);
		},
		updateWaitList : function(self, list){
			var pos;
			for (pos=0;pos<=list.length;++pos){
				if (pos==list.length){
					pos = -1;
					break;
				} else if (list[pos].id==self.id){
					break;//Stop position counter.
				}
			}
			if (pos>=0){
				$('#plugWaitList').text((pos+1)+"/"+(list.length));
			}else{
				$('#plugWaitList').text(list.length);
			}
		},
		parseConfig : function(data){
			//debug;
			data = data.replace(/&#34;/g,'"');
			console.log(data);
			if (data == null || typeof data == "undefined"){
				return;
			}
			var matched = data.match(/\[CONFIG\+=.+\]/g);
			if (matched != null){
				for(var x = 0; x < matched.length; ++x){
					var config = matched[x].substring(matched[x].indexOf("=")+1,matched[x].length-1);
					if (isURL(config)){
						$.getJSON(config, applyConfig(returned.plugplus));
					} else {
						try{
							this.applyConfig(JSON.parse(config).plugplus);
						} catch(e){
							console.warn("Plug+: Could not parse page config.");
						}
					}
				}
			}else{
				console.log("Plug+: No config was defined. Using defaults.");
			}
		},
		applyConfig : function(config){
			//Override background
			if (PlugSettings.allowBackgroundOverride){
				//Prep for CSS rules.
				config.background = "url(" + config.background + ")";
				
				$('body').css("background-image",config.background);
			}
			//Disable autowoot
			if (!config.autoWoot){
				this.serverAW = false;
				this.button.autowoot.attr('id','disabled').attr('title', this.serverDisabled);
			}
			//Disable autojoin
			if (!config.autoJoin){
				this.serverAJ = false;
				this.button.autojoin.attr('id','disabled').attr('title', this.serverDisabled);
			}

		},
		resetVotes : function(){
			$('#plugPlusListArea').children().attr('class','');
		}
};



/* Init */
$(function(){
	if (document.location.pathname=="/" | $('.plugPlus')) return;//Only one instance of plug at a time.

	PlugPlus.loadSettings();

	$("body").append("<div style='display:none;' id=\"plugEvents\" hidden></div>");
	$("body").append("<div style='display:none;' id=\"plugPlusEvents\" hidden></div>");

	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('body').append(data);
		$('.plugPlusDropDown').resizable({autoHide:true,handles: "s"});
		PlugPlus.button.autojoin = $('#autojoin').attr('id','off');
		PlugPlus.button.autowoot = $('#autowoot').attr('id','off');
		PlugPlus.button.manmode  = $('#manmode').attr('id','off');
		PlugPlus.button.settings = $('#settings').attr('id','');
		PlugPlus.button.pluglist = $('#pluglist').attr('id','');
		PlugPlus.button.pluglist.click(function(){$('#plugPlusSettings').slideUp();$('#plugPlusList').slideToggle();PlugSettings.pluglist=!PlugSettings.pluglist;PlugPlus.saveSettings();});
		PlugPlus.button.settings.click(function(){$('#plugPlusList').slideUp();$('#plugPlusSettings').slideToggle();PlugPlus.saveSettings();});
		PlugPlus.button.autojoin.click(function(){
			PlugSettings.autoJoin = !PlugSettings.autoJoin;
			if (PlugSettings.autoJoin){
				PlugPlus.button.autojoin.attr('id','on');
				PlugPlus.autojoin();
			}else{
				PlugPlus.button.autojoin.attr('id','off');
			}
			PlugPlus.saveSettings();
		});
		PlugPlus.button.autowoot.click(function(){
			PlugSettings.autoWoot = !PlugSettings.autoWoot;
			if (PlugSettings.autoWoot){
				PlugPlus.button.autowoot.attr('id','on');
				PlugPlus.autowoot();
			}else{
				PlugPlus.button.autowoot.attr('id','off');
			}
			PlugPlus.saveSettings();
		});
		PlugPlus.button.manmode.click(function(){
			PlugSettings.manMode = !PlugSettings.manMode;
			if (PlugSettings.manMode){
				PlugPlus.button.manmode.attr('id','on');
				PlugPlus.manMode.create();
			}else{
				PlugPlus.button.manmode.attr('id','off');
				PlugPlus.manMode.destroy();
			}
			PlugPlus.saveSettings();
		});
		PlugPlus.applySettings();
		PlugPlus.settingsForm.autoSave();
		console.log("Plug+: Setup complete.");
	},"html");

	$.getScript(chrome.extension.getURL("js/plugInterface.js"))
	.done(function(script, status, statusid){
		console.log("PlugInterface inject: ",status);
		setTimeout('PlugPlus.fireEvent(new PlugData("GetDescription",true))', 3000);//Wait 3 seconds.
	})
	.fail(function(){
		console.error("PlugInterface failed to inject!");
	});

	$("#plugEvents").bind("plugEvent",function(){
		var data = $.parseJSON($('#plugEvents').text());//Get data from hidden div.
		switch(data.type){
		case "WAIT_LIST_JOIN":
			PlugPlus.updateWaitList(PlugPlus.self, data.event);
			break;
		case "DJ_ADVANCE":
			PlugPlus.songUpdate(data.event);
			PlugPlus.autowoot();
			PlugPlus.resetVotes();
			break;
		case "DJ_UPDATE":
			PlugPlus.autojoin();
			PlugPlus.djUpdate(data.event);
			break;
		case "VOTE_UPDATE":
			PlugPlus.userVote(data.event);
			PlugPlus.updateList(data.event.user);
			break;
		case "USER_JOIN":
			PlugPlus.updateList(data.event);
			PlugPlus.userJoin(data.event);
			PlugPlus.updateUserCount(data.userCount);
			break;
		case "USER_LEAVE":
			PlugPlus.userLeave(data.event);
			PlugPlus.updateUserCount(data.userCount);
			break;
		case "CHAT":
			PlugPlus.chat(data.event,data.from,PlugPlus.self);
			break;
		case "DESCRIPTION":
			PlugPlus.parseConfig(data.event);
			break;
		case "INIT":
			PlugPlus.self = data.event.self;
			PlugPlus.updateList(data.event.users);
			PlugPlus.updateWaitList(data.event.self, data.event.waitlist);
			PlugPlus.updateUserCount(data.event.users.length);
			break;//Setup all fields.
		default: console.warn("P+ Notice: Possible error ",data);
		}
	});

});

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

