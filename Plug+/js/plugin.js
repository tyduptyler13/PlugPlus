var s = document.createElement('script');
s.src = chrome.extension.getURL("js/script.js");
document.head.appendChild(s);

/* Begin Notifications */

if (document.location.pathname!="/"){
	$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");

	//Add controlls from here.
	$.get(chrome.extension.getURL("append.html"),function(data){
		$('#dj-console').append(data);
	},"html");

	$("#ppEvents").get(0).addEventListener("baseEvent",function(){
		var data = $.parseJSON($('#ppEvents').text());//Get data from hidden div.
		var _image = data.image;//Seperate
		var _title = data.title;
		var _text = data.text;
	
		chrome.extension.sendRequest({action:"notify",img:_image ,title:_title ,text:_text});//Send
	});
}
