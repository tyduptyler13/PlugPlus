//Tracking

var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

PP = {};
PlugData = function(type, eventData){//Standarized message container. Version 2.
	this.type = type;
	this.event = eventData;
};

/* Events */

PP.plugEvent = document.createEvent('Event');
PP.plugEvent.initEvent('plugEvent',true,true);

PP.fireEvent = function(data){
	$('#plugEvents').text(JSON.stringify(data));
	$('#plugEvents').get(0).dispatchEvent(PP.plugEvent);
};
PP.setupEvents = function(){
	$('#plugPlusEvents')[0].addEventListener("plugPlusEvent",PP.plugPlusEvent);

};
PP.initValues = function(){
	var event = {
			users : API.getUsers(),
			self : API.getUser(),
			waitlist : API.getWaitList()
	};
	var data = new PlugData("INIT", event);
	PP.fireEvent(data);
};
PP.overrides = {
		audience : {},
		booth : {},
		dj : {}
};
PP.setImage = function(users, user, src){
	for (var i=0; i<users.length; ++i){
		if (users[i].user == null || users[i].user == undefined) continue;//Skip
		if (users[i].user.id == user.id){
			users[i].image.src = src;
		}
	}
};
PP.setAudienceImage = function(user, src){
	if (user == null) user = API.getUser();//Assume that it wants to change your avatar.
	this.setImage(RoomUser.audience.images, user, src);
	this.overrides.audience[user.id] = {user:user, src:src};
};
PP.setBoothImage = function(user, src){
	if (user == null) user = API.getUser();//Assume that it wants to change your avatar.
	this.setImage(RoomUser.djBooth.images.slice(1), user, src);
	this.overrides.booth[user.id] = {user:user, src:src};
};
PP.setDjImage = function(user, src){
	if (user == null) user = API.getUser();//Assume that it wants to change your avatar.
	this.setImage(RoomUser.audience.images.slice(0, 1), user, src);
	this.overrides.dj[user.id] = {user:user, src:src};
};
PP.checkAudienceImages = function(){
	var overrides = this.overrides.audience;
	for(id in overrides){
		this.setImage(RoomUser.audience.images, overrides[id].user, overrides[id].src);
	}
};
PP.checkBoothImages = function(){
	var overrides = this.overrides.booth;
	for(id in this.overrides.booth){
		this.setImage(RoomUser.djBooth.images.slice(1), overrides[id].user, overrides[id].src);
	}
	for(override in this.overrides.dj){
		this.setImage(RoomUser.djBooth.images.slice(0,1), overrides[id].user, overrides[id].src);
	}
};

/* Message Handling */

PP.plugPlusEvent = function(){
	var data = $.parseJSON($('#plugPlusEvents').text());
	switch(data.type){
	case "JoinWaitList" : API.djJoin();break;
	case "GetDescription" : PP.fireEvent(new PlugData("DESCRIPTION",Models.room.data.description));break;
	case "Init" : PP.initValues();break;
	case "Strobe" : RoomUser.audience.strobeMode(data.data); break;
	case "audienceOverride" : PP.setAudienceImage(data.data.target, data.data.image); break;
	case "boothOverride" : PP.setBoothImage(data.data.target, data.data.image); break;
	case "djOverride" : PP.setDjImage(data.data.target, data.data.image); break;
	default: console.warn("PlugInterface: Something may have gone wrong,",data);
	}
};

PP.init = function(){

	$('.plugPlus').show(); //If something is wrong with plug.dj this wont run.

	API.on(API.DJ_ADVANCE, function(e){
		var data = new PlugData("DJ_ADVANCE",e);
		PP.fireEvent(data);
		PP.checkBoothImages();
		PP.checkAudienceImages();
	});
	API.on(API.DJ_UPDATE, function(e){
		var data = new PlugData("DJ_UPDATE",API.getDJs().concat(API.getWaitList()));//Custom extended list.
		PP.fireEvent(data);
	});
	API.on(API.VOTE_UPDATE, function(e){
		var data = new PlugData("VOTE_UPDATE",e);
		PP.fireEvent(data);
	});
	API.on(API.USER_JOIN, function(e){
		var data = new PlugData("USER_JOIN",e);
		data.userCount = API.getUsers().length;
		PP.fireEvent(data);
		PP.checkAudienceImages();
	});
	API.on(API.USER_LEAVE, function(e){
		var data = new PlugData("USER_LEAVE",e);
		data.userCount = API.getUsers().length;
		PP.fireEvent(data);
	});
	API.on(API.CHAT, function(e){
		var data = new PlugData("CHAT", e);
		data.from = API.getUser(e.fromID);
		if (typeof data.from == "undefined"){
			console.warn("Plug.dj API has an error! Go nag them about it. Their API is incapable of finding user that exists:", data);
			return;
		}
		PP.fireEvent(data);
	});
	API.on(API.WAIT_LIST_UPDATE, function(e){
		var data = new PlugData("WAIT_LIST_JOIN",e);
		PP.fireEvent(data);
		PP.checkBoothImages();
	});

	setTimeout(PP.setupEvents, 500);
	setTimeout(PP.initValues, 2000);
	
	FB.XFBML.parse();//Setup Plug Comments

};

/* Init */
PP.init();
