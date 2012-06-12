// Auto* section
PlugControls = "<div id='plugPlus' style='position:absolute;bottom:0px;width:310px;color:black;margin:5px;'><button style='background-color:red' id='ppaj'>AutoJoin</button><button id='ppaw' style='float:right;background-color:red'>AutoWoot</button></div>";
$(document).ready(function(e) {
    $('#dj-console').append(PlugControls);
});

$('#plugPlus button').bind('click',function(eventData){
	console.log(eventData);
	var pressed = eventData.srcElement;
	if($(pressed).data('active')!='true'){
		$(pressed).data('active','true').css('background-color','green');
	}else{
		$(pressed).data('active','false').css('background-color','red');
	}
});

API.addEventListener(API.DJ_ADVANCE, function(dj){
	if(dj == null) return; //no dj
	if(dj == API.getSelf()) return; //don't woot yourself
	if($('#ppaw').data('active')!='true') return; //AutoWoot Off
	$('#button-vote-positive').click(); //Woot
});

API.addEventListener(API.DJ_UPDATE, function(){
	if ($('#ppaj').data('active')!='true') return; //autoJoin off
	if ($('#button-dj-quit').css('display')!="none") return;//Already a dj.
	if ($('#button-dj-waitlist-leave').css('display')!="none") return; //Already on waitlist
	if ($('#button-dj-play').css('display')!="none"){//Check for waitlist.
		$('#button-dj-play').click();//Join
	}else if ($('#button-dj-waitlist-join').css('display')!="none"){//Waitlist available
		$('#button-dj-waitlist-join').click();//Join
	}
});
