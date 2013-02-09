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
	djUpdate: 1, //0 = none, 1 = only friends, 2 = all
	notifyTimeout: 7, //Time in seconds before the notification closes automatically. 0 means never timeout.
	manMode : false
}

/* Functions */
PlugPlus = {
	avatarURL : "http://www.plug.dj/images/avatars/thumbs/",
	plugPlusEvent : new CustomEvent("plugPlusEvent",{bubbles:false,cancelable:true}),
	getAudience : function(_callback){this.fireEvent(new PlugData("getAudience",{callback:_callback}))},
	getSelf : function(_callback){this.fireEvent(new PlugData("getSelf",{callback:_callback}))},
	fireEvent : function(data){$('#plugPlusEvents').html(JSON.stringify(data));$('#plugPlusEvents')[0].dispatchEvent(this.plugPlusEvent);},
	updateList : function(users){
		var list = new Array();
		var User = function(){
			this.id = "";//Vote
			this.border = "";
			this.outline = "";
			this.username = "";
		};
		users.forEach(function(user){
			var tmp = new User();
			tmp.id = user.vote==1?"voteup":(user.vote==-1?"votedown":"");
			tmp.border = user.permission>0?"border: #E90E82 "+user.permission+"px solid;":"";
			tmp.outline = user.relationship>0?"outline: #DEE97D "+user.relationship*2+"px solid;":"";
			tmp.username = user.username.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			list.push(tmp);
		});
		$('#plugPlusListArea').children().remove('div');
		list.forEach(function(user){
			var tmp = "<div id=\""+user.id+"\" style=\""+user.border+user.outline+"\">"+user.username+"</div>";
			$('#plugPlusListArea').append(tmp);
		});
	},
	loadSettings : function(){this.updateSettings(JSON.parse(localStorage['PlugPlusSettings']))},
	updateSettings : function(data){//Preserve defaults if settings are incomplete or non existant.
		for (var setting in PlugSettings){
			try{
				PlugSettings[setting] = data[setting]!=undefined?data[setting]:PlugSettings[setting];
			} catch (e){
				console.warn("P+ setting \"",setting, "\" appears to be corrupted, incorrectly formatted, or missing. Default value was used.");
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
	saveSettings : function(){localStorage['PlugPlusSettings'] = JSON.stringify(PlugSettings)},
	notify : function(_title, _image, _text){
		if (PlugSettings.notifications)
			chrome.extension.sendRequest({action:"notify",img:_image, title:_title, text:_text, timeout:PlugSettings.notifyTimeout});
	},
	autowoot : function(){
		if (PlugSettings.autoWoot){
			if (PlugSettings.autoWootDelay>0){
				setTimeout("$('#button-vote-positive').click();",PlugSettings.autoWootDelay*1000);
			}else{
				$('#button-vote-positive').click();
			}
		}
	},
	autojoin : function(){
		if (PlugSettings.autoJoin)
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
			if (from.relationship==0&&data.message.indexOf(you.username)==-1) return;
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
	getUser: function(users,name){
		for (var x=0;x<users.length;x++){
			if (users[x].username==name)
				return users[x];
		}
	},
	settingsForm : {
		autoSave : function(){$('.PPSetting').change(this.save);PlugPlus.debug("AutoSave",this)},
		update : function(){
			$('#PPNotifications').attr('checked',PlugSettings.notifications);
			$('#PPChatLevel').val(PlugSettings.chatLevel);
			$('#PPUserLevel').val(PlugSettings.userLevel);
			$('#PPSongUpdate').val(PlugSettings.songUpdate);
			$('#PPDJUpdate').val(PlugSettings.djUpdate);
			$('#PPAutoWootDelay').attr('value',PlugSettings.autoWootDelay);
			$('#PPNotifyTimeout').attr('value',PlugSettings.notifyTimeout);
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
			//Save settings
			PlugPlus.saveSettings();
			//Show settings saved
			$('#PPSaved').stop(true,false).show(0).fadeOut(2000);
		}
	},
	debug : function(){//Comment out to disable plug debug statements.
		//console.log(arguements);
	},
	manMode : {
		create : function(){
			$('.plugPlus').draggable({cancel:".plugPlusContent"});
			$('.plugPlusBar').resizable({autoHide: true, handles: "e, w", minWidth:540}).resize(function(){//No vertical sizing.
				$('.plugPlus').css('width',$('.plugPlusBar').css('width'));//Hacky width fix for some css issue.
			});
		},
		destroy : function(){
			$('.plugPlus').draggable('destroy').css({top:'',left:''});//Fix bugs...
			$('.plugPlusBar').resizable('destroy').css({width:''}).trigger("resize");//And yet more jquery bugs...
		}
	},
	updateUserCount : function(users){
		$('#plugUsers').text(users.length);
	},
	updateWaitList : function(self, list){
		if (list.indexOf(self)>=0){
			$('#plugWaitList').text((list.indexOf(self)+1)+"/"+(list.length));
		}else{
			$('#plugWaitList').text(list.length);
		}
	}
}



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
		PlugPlus.button.pluglist.click(function(){$('#plugPlusSettings').slideUp();$('#plugPlusList').slideToggle();PlugSettings.pluglist=!PlugSettings.pluglist;PlugPlus.saveSettings()});
		PlugPlus.button.settings.click(function(){$('#plugPlusList').slideUp();$('#plugPlusSettings').slideToggle();PlugPlus.saveSettings()});
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
		//$('.plugPlusContent').mousemove(function(e){e.stopImmediatePropagation();PlugPlus.debug("Plug+: Blocking mousemove event.")});//Fix for showing names on mouseover.
		console.log("Plug+: Setup complete.");
	},"html");
	
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("js/plugInterface.js");
	s.type = "application/javascript";
	document.head.appendChild(s);

	$("#plugEvents")[0].addEventListener("plugEvent",function(){
		var data = $.parseJSON($('#plugEvents').text());//Get data from hidden div.
		if (data.users) PlugPlus.updateList(data.users);
		switch(data.type){
			case "WAIT_LIST_JOIN":PlugPlus.updateWaitList(data.you, data.data);break;
			case "DJ_ADVANCE":PlugPlus.songUpdate(data.data);PlugPlus.autowoot();break;
			case "DJ_UPDATE":PlugPlus.autojoin();PlugPlus.djUpdate(data.data);break;
			case "VOTE_UPDATE":PlugPlus.userVote(data.data);break;
			case "USER_JOIN":PlugPlus.userJoin(data.data);PlugPlus.updateUserCount(data.users);break;
			case "USER_LEAVE":PlugPlus.userLeave(data.data);PlugPlus.updateUserCount(data.users);break;
			case "CHAT":PlugPlus.chat(data.data,PlugPlus.getUser(data.users,data.data.from),data.you);break;
			default: console.warn("P+ Notice: Possible error ",data);
		}
	});
	
});
