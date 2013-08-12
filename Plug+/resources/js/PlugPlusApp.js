//Tracking
(function(){
	var _gaq = _gaq || [];
	_gaq.push(['plugplus._setAccount', 'UA-32685589-1']);
	_gaq.push(['plugplus._trackPageview']);
})();//Hidden anonymous calls.


/**
 * This is the interface that is injected by PlugPlus to
 * run on the page. It has access to plug.dj javascript
 * and can listen to the plug.dj events. It will request
 * the settings from PlugPlus once.
 */
PlugPlusApp = function(){
	/* Events */
	this.event = new Event('plugAppEvent');
	this.setupEvents();

	this.settings = JSON.parse(localStorage['plugPlusSettings']);

	/* Init */
	FB.XFBML.parse();//Setup Plug Comments
};
PlugPlusApp.prototype = {

		constructor : PlugPlusApp,

		fireEvent : function(data){
			$('#plugIn').text(JSON.stringify(data));
			try{
				$('#plugIn').get(0).dispatchEvent(this.event);
			}catch(e){
				console.warn("PlugPlusAPP: The system could not fire the event! Some features may not work.", e);
			}
		},

		setupEvents : function(){
			try{
				$('#plugOut').get(0).addEventListener("plugPlusEvent", this.handlePlugPlusEvent);
			}catch(e){
				console.warn("PlugPlusApp: An error occured setting up the event listener. Some features may not work!", e);
			}
		},

		handlePlugPlusEvent : function(){
			var data = $.parseJSON($('#plugOut').text());
			switch(data.type){

			default: console.warn("PlugPlusApp: Something may have gone wrong,",data);
			}
		},

		setupPlugListeners : function(){
			//Plug Plus listeners


			//Plug.dj listeners


		},

		autoWoot : function(){
			if (this.settings.autoWoot){

			}
		},

		autoJoin : function(){
			if (this.settings.autoJoin){

			}
		},

		songUpdate : function(obj){

		},

		djUpdate : function(obj){

		},

		userJoin : function(obj){

		},

		userLeave : function(obj){

		}

};

PlugData = function(type, eventData){//Standarized message container. Version 2.
	this.type = type;
	this.event = eventData;
};
PlugData.prototype.constructor = PlugData;

//TODO Make anonymous.
var plugplus = new PlugPlusApp();
