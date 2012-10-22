/* Init */
if (document.location.pathname!="/"){

	$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");
	
	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#dj-console').append(data);

		// Bug fix for z-index
		$('.options').hover(
			function(){//In
				$('#footer-container').css('z-index','1');
			},
			function(){//Out
				$('#footer-container').css('z-index','8000');
			}
		);
	},"html");
	
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("js/plugplus.js");
	s.type = "text/javascript";
	document.head.appendChild(s);

	$("#ppEvents").get(0).addEventListener("baseEvent",function(){
		var data = $.parseJSON($('#ppEvents').text());//Get data from hidden div.
		chrome.extension.sendRequest({action:"notify",img:data.image ,title:data.title ,text:data.text,timeout:data.timeout});//Send
	});
	
}
