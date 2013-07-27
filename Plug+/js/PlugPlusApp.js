//Tracking
(function(){
	var _gaq = _gaq || [];
	_gaq.push(['plug._setAccount', 'UA-32685589-1']);
	_gaq.push(['plug._trackPageview']);
})();//Hidden anonymous calls.


/**
 * This is the interface that is injected by PlugPlus to
 * run on the page. It has access to plug.dj javascript
 * and can listen to the plug.dj events. It will request
 * the settings from PlugPlus once.
 */
PlugPlusApp = function(){
	/* Events */
	this.plugEvent = document.createEvent('Event');
	this.plugEvent.initEvent('plugEvent',true,true);
	
	
	/* Init */
	FB.XFBML.parse();//Setup Plug Comments
};
PlugPlusApp.prototype = {
		constructor : PlugPlusApp,
		fireEvent : function(data){
			$('#plugEvents').text(JSON.stringify(data));
			$('#plugEvents').get(0).dispatchEvent(PP.plugEvent);
		},
		setupEvents : function(){
			$('#plugPlusEvents')[0].addEventListener("plugPlusEvent",this.handlePlugPlusEvent);
		},
		handlePlugPlusEvent : function(){
			var data = $.parseJSON($('#plugPlusEvents').text());
			switch(data.type){
			
			default: console.warn("PlugPlusApp: Something may have gone wrong,",data);
			}
		},
		setupPlugListeners : function(){
			
		}
};

PlugData = function(type, eventData){//Standarized message container. Version 2.
	this.type = type;
	this.event = eventData;
};
PlugData.prototype.constructor = PlugData;

//TODO Make anonymous.
var plugplus = new PlugPlusApp();
