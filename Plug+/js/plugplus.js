Avatars = "http://www.plug.dj/images/avatars/thumbs/";


/* Init */
$(function(){
	if (document.location.pathname=="/") return;

	$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");
	
	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#audience').append(data);
	},"html");
	
	var s = document.createElement('script');
	s.src = chrome.extension.getURL("js/plugInterface.js");
	s.type = "text/javascript";
	document.head.appendChild(s);

	$("#ppEvents").get(0).addEventListener("PlugPlusEvent",function(){
		var data = $.parseJSON($('#ppEvents').text());//Get data from hidden div.
		console.log(data);
	});
	
});


