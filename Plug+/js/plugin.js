var s = document.createElement('script');
s.src = chrome.extension.getURL("js/script.js");
document.head.appendChild(s);

/* Begin Notifications */
$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");

$("#ppEvents").get(0).addEventListener("baseEvent",function(){
	var data = $.parseJSON($('#ppEvents').text());//Get data from hidden div.
	console.log("Data reached plugin" + data);
	var _image = data.image;//Seperate
	var _title = data.title;
	var _text = data.text;
	
	chrome.extention.sendRequest({action:"notify",img:_image ,title:_title ,text:_text});//Send
});

