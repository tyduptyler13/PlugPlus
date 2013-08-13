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
	this.settings = JSON.parse(localStorage['PlugPlusSettings']);
	
	/* Events */
	this.setupEvents();
	
	//Trip auto functions on startup.
	this.autoWoot();
	this.autoJoin();

	/* Init */
	if (FB)//If FB is not ready, it will take care of this anyways.
		FB.XFBML.parse();//Setup Plug Comments
};
PlugPlusApp.prototype = {

		constructor : PlugPlusApp,

		fireEvent : function(data){
			$('#plugIn').text(JSON.stringify(data));
			try{
				$('#plugIn').trigger(this.event);
			}catch(e){
				console.warn("PlugPlusAPP: The system could not fire the event! Some features may not work.", e);
			}
		},

		handlePlugPlusEvent : function(data){
			var data = data.data;
			if (data.from != "plugPlus") return;
			switch(data.type){
			case "settingsChange":
				this.settings = JSON.parse(localStorage['PlugPlusSettings']);
				this.autoWoot();
				this.autoJoin();
				break;
			default: console.warn("PlugPlusApp: Something may have gone wrong,",data);
			}
		},

		setupEvents : function(){
			var self = this;
			//Plug Plus listeners
			try{
				window.addEventListener("message", function(data){self.handlePlugPlusEvent(data)});
			}catch(e){
				console.warn("PlugPlusApp: An error occured setting up the event listener. Some features may not work!", e);
			}

			//Plug.dj listeners
			API.on(API.DJ_ADVANCE, this.autoWoot);
			API.on(API.DJ_UPDATE, this.autoJoin);

		},

		autoWoot : function(){
			if (this.settings.autoWoot){
				$('#button-vote-positive').click();
			}
		},

		autoJoin : function(){
			if (this.settings.autoJoin){
				if (API.getBoothPosition() == -1 && API.getWaitListPosition() == -1)
					API.djJoin();
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

//TODO Make anonymous.
var plugplus = new PlugPlusApp();
