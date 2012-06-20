  //Tracking
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

// Auto* section
PlugControls = "<div id='plugPlus' style='position:absolute;bottom:0px;width:310px;color:black;margin:5px;'><button style='background-color:red; border-radius:5px;' id='ppaj' title='Join automatically whenever your turn ends.'>AutoJoin</button><button id='ppaw' style='float:right;background-color:red;border-radius:5px' title='Woot every song that plays.'>AutoWoot</button></div>";
$(document).ready(function(e) {
	if (document.location.pathname=="/") return;//Don't add to front page
	
    $('#dj-console').append(PlugControls);
	
	API.addEventListener(API.DJ_ADVANCE, function(){
		ppDJAdvance();
		autoWoot();
	});

	API.addEventListener(API.DJ_UPDATE, function(){
		ppDJUpdate();
		autoJoin();
	});
	
	$('#plugPlus button').bind('click',function(eventData){
		var pressed = eventData.srcElement;
		if($(pressed).data('active')!='true'){
			$(pressed).data('active','true').css('background-color','green');
			if (pressed.id == "ppaj"){
				autoJoin();
			}
			if (pressed.id == "ppaw"){
				autoWoot();
			}
		}else{
			$(pressed).data('active','false').css('background-color','red');
		}
	});
});





function autoWoot(){
	var dj = API.getDJs()[0];
	if(dj == null) return; //no dj
	if(dj == API.getSelf()) return; //don't woot yourself
	if($('#ppaw').data('active')!='true') return; //AutoWoot Off
	$('#button-vote-positive').click(); //Woot
}

function autoJoin(){
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
function firePPEvent(data){
	$('#ppEvents').text(data).trigger('baseEvent');
}

function ppDJAdvance(){
	
}

function ppDJUpdate(){
	
}
