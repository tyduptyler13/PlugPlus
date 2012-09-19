/* Init */
if (document.location.pathname!="/"){

	$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");
	
	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#dj-console').append(data);
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
