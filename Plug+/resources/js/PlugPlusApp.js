/**
 * This is the interface that is injected by PlugPlus to
 * run on the page. It has access to plug.dj javascript
 * and can listen to the plug.dj events. It will request
 * the settings from PlugPlus once.
 */
PlugPlusApp = function(){
	this.settings = JSON.parse(localStorage['PlugPlusSettings']);

	/* Events */
	this.setupEvents();

	var scope = this;

	setTimeout(function(){
		scope.setupPlugList();
	}, 10000);

	setTimeout(function(){
		//Trip auto functions a little after startup.
		scope.autoWoot();
		scope.autoJoin();
	}, 5000);

	$('#plugPlusList #refresh').click(function(){
		scope.setupPlugList();
	});

	//Setup channel

	var channel = new MessageChannel();

	window.postMessage("PlugPlusAppReady", "http://plug.dj", [channel.port2]);

	this.port = channel.port1;

	var scope = this;

	this.port.onmessage = function(e){
		scope.handlePlugPlusEvent(e.data);
	};

	this.port.start();
	
	$('#chat-messages').on('mouseenter', '.text img', function(){
		var element = $(this);
		//TODO
	});

	// Setup other general functionality.
	scope.setupMute();
};
PlugPlusApp.prototype = {

		constructor : PlugPlusApp,

		fireEvent : function(type, data){
			var eventData = {type:type, data:data};
			this.port.postMessage(eventData);
		},

		notify : function(title, image, text, convert){
			if (this.settings.requireBlur){
				if(!$(document.body).hasClass("hidden")){
					return;
				}
			}

			this.fireEvent("notify", {title: unescape(title), image: image, text: unescape(text), convert: convert});
		},

		handlePlugPlusEvent : function(data){
			switch(data.type){
			case "settingsChange":
				this.settings = JSON.parse(localStorage['PlugPlusSettings']);
				this.autoWoot();
				this.autoJoin();
				break;
			default: console.warn("PlugPlusApp: Something may have gone wrong,", data);
			}
		},

		setupEvents : function(){
			var scope = this;

			//Plug.dj listeners
			API.on(API.DJ_ADVANCE, function(obj){
				scope.autoWoot();
				scope.songUpdate(obj);
				scope.updateRoomStats();
			});
			API.on(API.DJ_UPDATE, function(obj){
				scope.autoJoin();
				setTimeout(function(){
					scope.autoJoin();
				}, 2000);
				scope.djUpdate(obj);
			});
			API.on(API.VOTE_UPDATE, function(obj){
				scope.userVote(obj);
				scope.updateRoomStats();
			});
			API.on(API.WAIT_LIST_UPDATE, function(){
				scope.updateRoomStats();
			});
			API.on(API.USER_JOIN, function(obj){
				scope.updateRoomStats();
				scope.userJoin(obj);
			});
			API.on(API.USER_LEAVE, function(obj){
				scope.updateRoomStats();
				scope.userLeave(obj);
			});
			API.on(API.CHAT, function(obj){
				scope.chat(obj);
				scope.inline(obj.chatID);
			});

		},

		chat : function(obj){

			var from = API.getUser(obj.fromID);

			if (this.settings.chatLevel.all){
				this.nchat(obj);
			} else {

				if (this.settings.chatLevel.mention){
					if (obj.message.indexOf("@" + API.getUser().username) !== -1){
						this.nchat(obj);
						return;
					}
				}

				if (this.settings.chatLevel.friend){
					if (from.relationship >= 2  && exists(from.relationship)){
						this.nchat(obj);
						return;
					}
				}

				if (this.settings.chatLevel.mod){
					if (from.permission >= 3 && exists(from.permission)){
						this.nchat(obj);
						return;
					}
				}

			}

		},

		nchat : function(obj){
			this.notify("Chat", API.getUser(obj.fromID).avatarID + '.png', obj.from + " said \"" + obj.message + "\"", true);
		},

		autoWoot : function(){
			var scope = this;
			setTimeout(function(){
				if (scope.settings.autoWoot && API.getUser().vote !== -1){
					$('#vote #woot').click();
				}
			}, this.settings.autoWootDelay * 1000);
		},

		autoJoin : function(){
			if (this.settings.autoJoin){
				if ($('.cycle-toggle:contains(Disabled)').length > 0){
					$('#autojoin').click().addClass('disabled').attr('title', "This is not available when the DJ Cycle is disabled.");
					return; //Don't try to autojoin.
				} else {
					$('#autojoin.disabled').removeClass('disabled').attr('title', "Automatically join when you exit the booth.");
				}

				if (API.getWaitList().length < 50){
					API.djJoin();
				} else {
					API.chatLog("Plug+: Waitlist is unavailable/full. Autojoin will not work.");
				}
			}
		},

		songUpdate : function(obj){

			$('#plugPlusListArea div').removeClass('woot meh');

			switch(this.settings.songUpdate){
			case 0: break;//Skip
			case 1: if (obj.dj.relationship <= 2 || !exists(obj.dj.relationship)) break;
			case 2: this.notify("Song Update", PlugPlusApp.urls.youtube(obj.media.cid), obj.dj.username + " is now playing " + obj.media.title);
			break;
			default: console.warn("Plug+: A setting has a value that has no association. Something bad might have happened.");
			}

		},

		djUpdate : function(dj){

			switch(this.settings.djUpdate){
			case 0: break;
			case 1: if (dj.relationship <= 2 || !exists(dj.relationship)) break;
			case 2: this.notify("DJ Update", dj.avatarID + '.png', dj.username + " is now playing.", true);
			break;
			default: console.warn("Plug+: A setting has a value that has no association. Something bad might have happened.");
			}

		},

		userJoin : function(obj){

			switch(this.settings.userLevel){
			case 0: break;
			case 1: if (obj.relationship <= 2 || !exists(obj.relationship)) break;
			case 2: this.notify("User Join", obj.avatarID + '.png', obj.username + " has joined the room.", true);
			break;
			default: console.warn("Plug+: A setting has a value that has no association. Something bad might have happened.");
			}

		},

		userLeave : function(obj){

			switch(this.settings.userLevel){
			case 0: break;
			case 1: if (obj.relationship <= 2 || !exists(obj.relationship)) break;
			case 2: this.notify("User Leave", obj.avatarID + '.png', obj.username + " has left the room.", true);
			break;
			default: console.warn("Plug+: A setting has a value that has no association. Something bad might have happened.");
			}

		},

		userVote : function(obj){

			var vote = (obj.vote == 1) ? "woot" : "meh";

			$("#" + obj.user.id).removeClass('woot meh').addClass(vote);

			switch(this.settings.userLevel){
			case 0: break;
			case 1: if (obj.user.relationship <= 2 || !exists(obj.relationship)) break;
			case 2: this.notify("Vote", obj.user.avatarID + '.png', obj.user.username + " " + vote + "'d this song.", true);
			break;
			default: console.warn("Plug+: A setting has a value that has no association. Something bad might have happened.");
			}

		},

		updateRoomStats : function(){
			var userCount = API.getUsers().length;
			var waitListLength = API.getWaitList().length;
			var waitListPosition = API.getWaitListPosition() + 1;//Don't use zero base for users. -_-
			var roomVotes = API.getRoomScore();
			var percent = (.5 + ((roomVotes.positive/(userCount-1)) - (roomVotes.negative/(userCount-1))) *.5 ) * 100;
			//50% + (Positive Votes Percent - Negative Votes Percent)*50% with the dj taken out of the total since he cant vote. 

			$('#plugUsers').text(userCount);

			if (waitListPosition != 0){
				$('#plugWaitList').text(waitListPosition + "/" + waitListLength);
			} else {
				$('#plugWaitList').text(waitListLength);
			}

			$('#plugSongStats').text(percent.toPrecision(4) + "%");


		},

		inline : function(id) {
			if (this.settings.linkExpansion){
				$('.cid-' + id + ' .text a').each(function(index, element){
					element = $(element); //jQuery it.
					var href = element.attr('href');
					//Is it an image?
					if (href.match(/(https?:\/\/.*\.(?:png|jpe?g|gif))/i)){
						var html = "<img class=\"PPInline\" src=\"" + href + "\" alt=\"" + href + "\"\\>";
						element.html(html);
						element.before("<br>");
					}
				});
			}
		},

		setupPlugList : function(){

			var you = API.getUser().id;

			var listArea = $('#plugPlusListArea');
			var users = API.getUsers();

			listArea.text("");//Clear

			for (var i = 0; i<users.length; ++i){

				var u = users[i];
				var user = new ListUser(u.id, u.username, u.permission, you, u.relationship, u.vote);

				listArea.append(user.getDOM());

			}

		},

		getUser : function(id){

			return $('#' + id);

		},

		setupMute : function() {
			// Allow muting/unmuting via pressing of space bar.
			$("body").keyup(function(event) {
				// Only trigger when space pressed and target is the body.
				if (event.keyCode != 32) return true;
				if ($(event.target).prop("tagName") != "BODY") return true;

				// Get current and previous volume information.
				var curVolume = API.getVolume();
				var lastVolume = 100;
				if ($(this).data("lastVolume")) lastVolume = $(this).data("lastVolume");

				// Update volume.
				if (curVolume == 0) {
					// Unmute.
					API.setVolume(lastVolume);

				} else {
					// Mute.
					API.setVolume(0);

					// Retain current volume setting first before muting completely.
					$(this).data("lastVolume", curVolume);
				}

				return true;
			});
		}
};
PlugPlusApp.urls = {
		youtube : function(id) {
			return "http://img.youtube.com/vi/" + id + "/default.jpg";
		},
		plug : function(id){

		}
};

ListUser = function(id, name, permission, you, relation, vote){
	this.id = id;
	this.name = name;
	this.isMod = (permission>1);
	this.isYou = (id == you);
	this.relation = relation;
	this.vote = vote;
};
ListUser.prototype.constructor = ListUser;
ListUser.prototype.getDOM = function(){

	var element = document.createElement('div');
	var je = $(element);

	je.attr('id', this.id);
	je.text(this.name);

	if (this.relation > 2){
		je.addClass('friend');
	} else if (this.relation > 0){
		je.addClass('fan');
	}

	if (this.isMod){
		je.addClass('mod');
	}

	if (this.isYou){
		je.addClass('you');
	}

	if (this.vote == 1){
		je.addClass('woot');
	} else if (this.vote == -1){
		je.addClass('meh');
	}

	return element;

};

function exists(obj){
	return (typeof obj !== 'undefined');
}

(function(){
	var plugplus = new PlugPlusApp();
})();

