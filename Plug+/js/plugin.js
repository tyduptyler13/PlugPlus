var s = document.createElement('script');
s.src = chrome.extension.getURL("js/script.js");
document.head.appendChild(s);

$("body").append("<div style='display:none;' id=\"ppEvents\" hidden></div>");

$("#ppEvents").get(0).addEventListener("baseEvent",function(e_data){
	chrome.extention.sendRequest({type:"event",data:e_data});
});
