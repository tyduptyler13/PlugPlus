//Tracking

var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

PP = {};
PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.you = API.getSelf();
	this.data = eventData;
	this.users = API.getUsers();//Send user list any time something happens.
}

/* Events */

PP.plugEvent = document.createEvent('Event');
PP.plugEvent.initEvent('plugEvent',true,true);

PP.fireEvent = function(data){
	$('#plugEvents').text(JSON.stringify(data));
	$('#plugEvents')[0].dispatchEvent(PP.plugEvent);
}

/* Init */
$(function(){	
	API.addEventListener(API.DJ_ADVANCE, function(e){
		PP.fireEvent(new PlugData("DJ_ADVANCE",e));
	});
	API.addEventListener(API.DJ_UPDATE, function(e){
		PP.fireEvent(new PlugData("DJ_UPDATE",API.getDJs().concat(API.getWaitList())));//Custom extended list.
	});
	API.addEventListener(API.VOTE_UPDATE, function(e){
		PP.fireEvent(new PlugData("VOTE_UPDATE",e));
	});
	API.addEventListener(API.USER_JOIN, function(e){
		PP.fireEvent(new PlugData("USER_JOIN",e));
	});
	API.addEventListener(API.USER_LEAVE, function(e){
		PP.fireEvent(new PlugData("USER_LEAVE",e));
	});
	API.addEventListener(API.CHAT, function(e){
		PP.fireEvent(new PlugData("CHAT", e));
	});
	API.addEventListener(API.WAIT_LIST_UPDATE, function(e){
		PP.fireEvent(new PlugData("WAIT_LIST_JOIN",e));
	});
	setTimeout('$(\'#plugPlusEvents\')[0].addEventListener("plugPlusEvent",PP.plugPlusEvent)',500);

});

/* Message Handling */

PP.plugPlusEvent = function(){
	var data = $.parseJSON($('#plugPlusEvents').text());
	switch(data.type){
		case "JoinWaitList" : API.waitListJoin();break;
	}
	console.log(data);
}
