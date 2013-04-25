//Tracking

var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

PP = {};
PlugData = function(type, eventData){//Standarized message container. Version 2.
	this.type = type;
	this.event = eventData;
}

/* Events */

PP.plugEvent = document.createEvent('Event');
PP.plugEvent.initEvent('plugEvent',true,true);

PP.fireEvent = function(data){
	$('#plugEvents').text(JSON.stringify(data));
	$('#plugEvents')[0].dispatchEvent(PP.plugEvent);
}
PP.setupEvents = function(){
	$('#plugPlusEvents')[0].addEventListener("plugPlusEvent",PP.plugPlusEvent);

}
PP.initValues = function(){
	var event = {
			users : API.getUsers(),
			self : API.getSelf(),
			waitlist : API.getWaitList()
	};
	var data = new PlugData("INIT", event);
	PP.fireEvent(data);
}

/* Message Handling */

PP.plugPlusEvent = function(){
	var data = $.parseJSON($('#plugPlusEvents').text());
	switch(data.type){
	case "JoinWaitList" : API.waitListJoin();break;
	case "GetDescription" : PP.fireEvent(new PlugData("DESCRIPTION",Models.room.data.description));break;
	case "Init" : PP.initValues();break;
	default: console.warn("PlugInterface: Something may have gone wrong,",data);
	}
}

/* Init */
$(function(){

	$('.plugPlus').show(); //If something is wrong with plug.dj this wont run.

	API.addEventListener(API.DJ_ADVANCE, function(e){
		var data = new PlugData("DJ_ADVANCE",e);
		PP.fireEvent(data);
	});
	API.addEventListener(API.DJ_UPDATE, function(e){
		var data = new PlugData("DJ_UPDATE",API.getDJs().concat(API.getWaitList()));//Custom extended list.
		PP.fireEvent(data);
	});
	API.addEventListener(API.VOTE_UPDATE, function(e){
		var data = new PlugData("VOTE_UPDATE",e);
		PP.fireEvent(data);
	});
	API.addEventListener(API.USER_JOIN, function(e){
		var data = new PlugData("USER_JOIN",e);
		data.userCount = API.getUsers().length;
		PP.fireEvent(data);
	});
	API.addEventListener(API.USER_LEAVE, function(e){
		var data = new PlugData("USER_LEAVE",e);
		data.userCount = API.getUsers().length;
		PP.fireEvent(data);
	});
	API.addEventListener(API.CHAT, function(e){
		var data = new PlugData("CHAT", e);
		data.from = API.getUser(e.fromID);
		if (typeof data.from == "undefined"){
			console.warn("Plug.dj API has an error! Go nag them about it. Their API is incapable of finding user that exists:", data);
			return;
		}
		PP.fireEvent(data);
	});
	API.addEventListener(API.WAIT_LIST_UPDATE, function(e){
		var data = new PlugData("WAIT_LIST_JOIN",e);
		PP.fireEvent(data);
	});

	setTimeout(PP.setupEvents, 500);
	setTimeout(PP.initValues, 2000);

});
