//Tracking

var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

var pp = {};
PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.data = eventData;
}

/* Events */

pp.plugEvent = document.createEvent('Event');
pp.plugEvent.initEvent('plugEvent',true,true);

pp.fireEvent = function(data){
	$('#plugEvents').html(JSON.stringify(data));
	$('#plugEvents').get(0).dispatchEvent(pp.plugEvent);
}

/* Init */
$(function(){	
	API.addEventListener(API.DJ_ADVANCE, function(e){
		var data = new PlugData("DJ_ADVANCE", e);
		pp.fireEvent(data);
	});
	API.addEventListener(API.DJ_UPDATE, function(e){
		var data = new PlugData("DJ_UPDATE",e);
		pp.fireEvent(data);
	});
	API.addEventListener(API.VOTE_UPDATE, function(e){
		var data = new PlugData("VOTE_UPDATE",e);
		pp.fireEvent(data);
	});
	API.addEventListener(API.USER_JOIN, function(e){
		var data = new PlugData("USER_JOIN",e);
		pp.fireEvent(data);
	});
	API.addEventListener(API.USER_LEAVE, function(e){
		var data = new PlugData("USER_LEAVE", e);
		pp.fireEvent(data);
	});
	API.addEventListener(API.CHAT, function(e){
		var data = new PlugData("CHAT", e);
		pp.fireEvent(data);
	});
	$('#plugPlusEvents')[0].addEventListener("plugPlusEvent",pp.plugPlusEvent);
});

/* Message Handling */

pp.plugPlusEvent = function(){
	var data = $.parseJSON($('#plugPlusEvents').text());
	console.log(data);
}
