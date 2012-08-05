  //Tracking
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  (function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

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
	}//Things shouldn't get here but we should check TODO
}

/* Begin Notifications */

pp.baseEvent = document.createEvent('Event');
pp.baseEvent.initEvent('baseEvent',true,true);

pp.fireEvent = function(data){
	$('#ppEvents').html(JSON.stringify(data));
	$('#ppEvents').get(0).dispatchEvent(pp.baseEvent);
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

/* Additional Functions */

pp.setCookie = function(c_name,value,exdays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value; //Cookie will work in all rooms.
}

pp.getCookie = function(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
  		if (x==c_name){
    		return unescape(y);
		}
	}
}

/* Woot bonus features */

pp.extra = {};
pp.extra.simpleList = function(){//Group of usernames with coloring to show woots, mehs, friends, mods
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
pp.extra.showWindow = function(){
	$('body').append("<div class='pplist' title='Purple = Mod/Owner, Yellow = Follower/Friend, Red = Meh, Green = Woot'></div>");
	pp.extra.updateList();
}
pp.extra.hideWindow = function(){
	$('.pplist').remove();
}
pp.extra.updateList = function(){
	$('.pplist').children().remove('div');
	var users = pp.extra.simpleList();
	for (var i = 0; i<users.length;++i){
		var tmp = "<div style=\"display:inline-block;";
		tmp += "background-color:"+users[i].bgColor+";";
		if(users[i].border) tmp += "border:"+users[i].border+";";
		if(users[i].outline) tmp += "outline:"+users[i].outline+";";
		tmp += "\">"+users[i].username+"</div>";
		$('.pplist').append(tmp);
	}
}

/* Init */
$(document).ready(function(e) {
	if (document.location.pathname=="/") return;//Don't add to front page
	
	API.addEventListener(API.DJ_ADVANCE, function(){
		pp.djAdvance();
		pp.autoWoot();
	});

	API.addEventListener(API.DJ_UPDATE, function(){
		pp.djUpdate();
		pp.autoJoin();
	});
	
	API.addEventListener(API.VOTE_UPDATE, pp.extra.updateList);
	
	API.addEventListener(API.CHAT,function(data){
		if (data.message.indexOf(API.getSelf().username)!=-1){
			var message = {};
			message.image = "http://www.plug.dj/images/avatars/thumbs/" + API.getUser(data.fromID).avatarID + ".png";
			message.title = "Chat";
			message.text = data.from + " said: \"" + data.message + "\"";
			pp.fireEvent(message);
		}
	});
	
	$('#plugPlus .option').bind('click',function(eventData){
		var pressed = eventData.currentTarget;
		if($(pressed).data('active')!='true'){
			$(pressed).data('active','true').css('background-color','green');
			if (pressed.id == "ppaj"){
				pp.autoJoin();
			}
			if (pressed.id == "ppaw"){
				pp.autoWoot();
			}
			if (pressed.id == "pplist"){
				pp.extra.showWindow();
			}
			pp.setCookie(pressed.id,'true',7);
		}else{
			$(pressed).data('active','false').css('background-color','red');
			pp.setCookie(pressed.id,'false',7);
			if (pressed.id == "pplist"){
				pp.extra.hideWindow();
			}
		}
	});
	//Remember options for 7 days
	if (pp.getCookie('ppaw')=="true"){
		$('#ppaw').click();
		setTimeout(pp.autoWoot,10000);//Wait an extra 10 seconds to autoWoot again.
	}else{
		pp.setCookie('ppaw','false',7);
	}	
	if (pp.getCookie('ppaj')=="true"){
		$('#ppaj').click();
		setTimeout(pp.autoJoin,10000);//Wait an extra 10 seconds to autoJoin again.
	}else{
		pp.setCookie('ppaj','false',7);
	}
	if (pp.getCookie('pplist')=="true"){
		$('#pplist').click();
	}else{
		pp.setCookie('pplist','false',7);
	}
});
