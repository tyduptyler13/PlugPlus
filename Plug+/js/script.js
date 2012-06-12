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
