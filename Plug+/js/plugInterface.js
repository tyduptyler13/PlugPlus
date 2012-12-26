//"use strict";//Secure code
//Tracking


var _gaq = _gaq || [];
_gaq.push(['plug._setAccount', 'UA-32685589-1']);
_gaq.push(['plug._trackPageview']);

//Plug object

var pp = {};

/* Begin Notifications */

pp.PlugPlusEvent = document.createEvent('Event');
pp.PlugPlusEvent.initEvent('PlugPlusEvent',true,true);

pp.fireEvent = function(data){
	if (pp.settings.notify){
		$('#ppEvents').html(JSON.stringify(data));
		$('#ppEvents').get(0).dispatchEvent(pp.PlugPlusEvent);
	}
}

PlugData = function(type, eventData){//Standarized message container.
	this.type = type;
	this.data = eventData;
}

/* Init */
$(document).ready(function(e) {	
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
});
