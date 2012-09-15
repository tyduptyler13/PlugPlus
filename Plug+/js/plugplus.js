"use strict";//Secure code
//Tracking


var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

var pp = {};

// Auto* section

pp.autoWoot = function(){
	var dj = API.getDJs()[0];
	if(dj == null) return; //no dj
	if(dj == API.getSelf()) return; //don't woot yourself
	if($('#ppaw').data('active')!='true') return; //AutoWoot Off
	$('#button-vote-positive').click(); //Woot
}

pp.autoJoin = function(){
	if ($('#ppaj').data('active')!='true') return; //autoJoin off
	if ($('#button-dj-quit').css('display')!="none") return;//Already a dj.
	if ($('#button-dj-waitlist-leave').css('display')!="none") return; //Already on waitlist
	if ($('#button-dj-play').css('display')!="none"){//Check for waitlist.
		$('#button-dj-play').click();//Join
	}else if ($('#button-dj-waitlist-join').css('display')!="none"){//Waitlist available
		$('#button-dj-waitlist-join').click();//Join
	}
}

/* Begin Notifications */

pp.baseEvent = document.createEvent('Event');
pp.baseEvent.initEvent('baseEvent',true,true);

pp.fireEvent = function(data){
	if (pp.settings.notify){
		$('#ppEvents').html(JSON.stringify(data));
		$('#ppEvents').get(0).dispatchEvent(pp.baseEvent);
	}
}

pp.djAdvance = function(){
	var data = {};
	data.image = API.getMedia().image;
	data.title = "Song Update";
	data.text = API.getMedia().title + " by " + API.getMedia().author;
	pp.fireEvent(data);
}

pp.djUpdate = function(){
	var data = {};
	data.image = "http://www.plug.dj/images/avatars/thumbs/" + API.getDJs()[0].avatarID + ".png";
	data.title = "New DJ";
	data.text = "DJ " + API.getDJs()[0].username + " is now playing.";
	pp.fireEvent(data);
}

/* Settings */

pp.settings = localStorage['Plug+'] != undefined ? JSON.parse(localStorage['Plug+']) : {timeout:7,notify:true,filter:false,ppaj:false,ppaw:false,list:false};
pp.saveSettings = function(){
	localStorage['Plug+'] = JSON.stringify({
		timeout : pp.settings.timeout,
		notify  : pp.settings.notify,
		filter  : pp.settings.filter,
		ppaj    : pp.settings.ppaj,
		ppaw    : pp.settings.ppaw,
		list    : pp.settings.list,
		filters : pp.chat.filters
	});
}
pp.applySettings = function(){
	if (pp.settings.ppaw){
		setTimeout(function(){//Change to set interval
			$('#ppaw').click();
			pp.autoWoot();
		},5000);//Wait an extra 10 seconds to autoWoot again.
	}
	if (pp.settings.ppaj){
		setTimeout(function(){//Change to set interval
			$('#ppaj').click();
			pp.autoJoin()
		},5000);//Wait an extra 10 seconds to autoJoin again.
	}
	if (pp.settings.list){
		$('#pplist').click();
	}
	if (pp.settings.notify){
		$('#notify').click();
	}
	if (pp.settings.filter){
		$('#filter').click();
	}
}

/* Plug+ special functions */

pp.pluglist = {};
pp.pluglist.simpleList = function(){//Group of usernames with coloring to show woots, mehs, friends, mods
	var users = API.getUsers();
	var list = Array();
	var user = function(){
		this.bgColor = "black";
		this.border = false;
		this.outline = false;
		this.username = "";
	}
	for (var i = 0; i<users.length; ++i){
		var tmp = new user();
		if (users[i].moderator)
			tmp.border = "#E90E82 thin solid";
		if (users[i].owner)
			tmp.border = "#E90E82 thick solid";
		switch(users[i].vote){
			case 1: tmp.bgColor = "green";break;
			case -1: tmp.bgColor = "red";break;
			default: tmp.bgColor = "grey";break;
		}
		if (users[i].relationship !=0)
			tmp.outline = "#DEE97D solid " + users[i].relationship*2 + "px";
		tmp.username = users[i].username;
		list.push(tmp);
	}
	return list;
}
pp.pluglist.showWindow = function(){
	$('body').append("<div class='pplist' title='Purple = Mod/Owner, Yellow = Follower/Friend, Red = Meh, Green = Woot'></div>");
	pp.pluglist.updateList();
}
pp.pluglist.hideWindow = function(){
	$('.pplist').remove();
}
pp.pluglist.updateList = function(){
	$('.pplist').children().remove('div');
	var users = pp.pluglist.simpleList();
	for (var i = 0; i<users.length;++i){
		var tmp = "<div style=\"display:inline-block;";
		tmp += "background-color:"+users[i].bgColor+";";
		if(users[i].border) tmp += "border:"+users[i].border+";";
		if(users[i].outline) tmp += "outline:"+users[i].outline+";";
		tmp += "\">"+users[i].username+"</div>";
		$('.pplist').append(tmp);
	}
}

/* Chat functions */

pp.chat = {};
pp.chat.setupFilter = function() {
	Chat.plugChatCommand = Chat.chatCommand;
	Chat.chatCommand = function(value){
		if (value.indexOf('/block')==0){//Use same username twice to remove it.
			var tmp = value.substr(7,value.length-6);
			if (tmp == ""){
				var obj={};obj.type="update";obj.message="Usage: /block (user)";this.receive(obj);
				return true;
			}
			for (var i = 0; i < pp.chat.filters.users.length; ++i){
				if (tmp == pp.chat.filters.users[i]){
					pp.chat.filters.users.pop(i);
					var obj={};obj.type="update";obj.message="User unblocked.";this.receive(obj);
					pp.saveSettings();
					return true;
				}
			}
			pp.chat.filters.users.push(tmp);
			var obj={};obj.type="update";obj.message="User blocked.";this.receive(obj);
			pp.saveSettings();
			return true;
		}
		if (value.indexOf('/filter')==0){//Use same word twice to remove it.
			var tmp = value.substr(8,value.length-7);
			if (tmp == ""){
				var obj={};obj.type="update";obj.message="Usage: /filter (word)";this.receive(obj);
				return true;
			}
			for (var i = 0; i < pp.chat.filters.words.length; ++i){
				if (tmp == pp.chat.filters.words[i]){
					pp.chat.filters.words.pop(i);
					var obj={};obj.type="update";obj.message="Word removed form list.";this.receive(obj);
					pp.saveSettings();
					return true;
				}
			}
			pp.chat.filters.words.push(tmp);
			var obj={};obj.type="update";obj.message="Word added to filter.";this.receive(obj);
			pp.saveSettings();
			return true;
		}
		if (value.indexOf('/notify')==0){
			//TODO
		}
		if (value.indexOf('/help')==0){
			var obj={};obj.type="update";obj.message="<strong>Plug+ Commands:</strong><br>/block <em>Block a user</em><br>/filter <em>Block words</em><br>/notify # <em>Set timeout for notifications</em><br>";this.receive(obj);
			return Chat.plugChatCommand(value);//Display both help menus.
		}
		return Chat.plugChatCommand(value);
	}
	pp.chat.oldChat = SocketListener.chat;
	SocketListener.chat = function(obj){
		if (pp.settings.filter){
			if (obj.from != undefined){
				for (var i=0; i<pp.chat.filters.users.length; ++i){
					var user = pp.chat.filters.users[i];
					if (obj.from == user){
						console.log("Plug+: Message blocked from " + user);
						return;
					}
				}
			}
			if (obj.message != undefined){
				for (var i=0;i<pp.chat.filters.words.length; ++i){
					var word = pp.chat.filters.words[i];
					var reg = new RegExp(word,"i");
					var tmp = obj.message.match(reg)
					if (tmp != null){
						var stars = "";
						for (var x=0;x<word.length;++x){
							stars += "*";
						}
						obj.message = obj.message.replace(reg,stars);
					}
				}
			}
		} pp.chat.oldChat(obj);
	}
}
pp.chat.filters = pp.settings.filters != undefined ? pp.settings.filters : {
	users : new Array(),
	words : new Array()
}
/*
pp.chat.disable = function(value){//When true will disable chat entirely.
	
}
*/
pp.chat.notify = function(data){
	if (data.message.indexOf(API.getSelf().username)!=-1){
		var message = {};
		message.image = "http://www.plug.dj/images/avatars/thumbs/" + API.getUser(data.fromID).avatarID + ".png";
		message.title = "Chat";
		message.text = data.from + " said: \"" + data.message + "\"";
		message.timeout = pp.settings.timeout;
		pp.fireEvent(message);
	}
}


/* Init */
$(document).ready(function(e) {

	if (document.location.pathname=="/") return;//Don't add to front page

	pp.chat.setupFilter();//Setup filter.

	API.addEventListener(API.DJ_ADVANCE, function(){
		pp.djAdvance();
		pp.autoWoot();
	});
	
	API.addEventListener(API.DJ_UPDATE, function(){
		pp.djUpdate();
		pp.autoJoin();
	});

	API.addEventListener(API.VOTE_UPDATE, pp.pluglist.updateList);

	API.addEventListener(API.CHAT,function(data){pp.chat.notify(data);});

	$('#plugPlus .option').bind('click',function(eventData){
		var pressed = eventData.currentTarget;
		if($(pressed).data('active')!='true'){
			$(pressed).data('active','true').css('background-color','green');
			switch(pressed.id){
			case "ppaj":
				pp.autoJoin();
				pp.settings.ppaj = true;
			break;
			case "ppaw":
				pp.autoWoot();
				pp.settings.ppaw = true;
			break;
			case "pplist":
				pp.pluglist.showWindow();
				pp.settings.list = true;
			break;
			case "notify":
				pp.settings.notify = true;
			break;
			case "filter":
				pp.settings.filter = true;
			break;
			default:
				console.warn("Unknown button pressed: " + pressed.id);
			break;
			}
		}else{
			$(pressed).data('active','false').css('background-color','red');
			switch(pressed.id){
			case "ppaj":
				pp.settings.ppaj = false;
			break;
			case "ppaw":
				pp.settings.ppaw = false;
			break;
			case "pplist":
				pp.pluglist.hideWindow();
				pp.settings.list = false;
			break;
			case "notify":
				pp.settings.notify = false;
			break;
			case "filter":
				pp.settings.filter = false;
			break;
			default:
				console.warn("Unknown button pressed: " + pressed.id);
			break;
			}
		}
		pp.saveSettings();
	});
	
	/*Bug fix for z-index */
	$('.options').hover(
		function(){//In
			$('#footer-container').css('z-index','1');
		},
		function(){//Out
			$('#footer-container').css('z-index','8000');
		}
	);
	
	pp.applySettings();
	
	console.log("Plug+: Setup complete.");
});
