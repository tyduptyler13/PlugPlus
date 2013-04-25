  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-32685589-1']);
  _gaq.push(['_trackPageview']);

  $(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    
    chrome.permissions.contains({
    	origins: ['https://*/*','http://*/*']
    }, function(result){
    	if (result){
    		$('#enableExternals').prop('checked',true);
    	} //else {
    		//Don't need to set it false;
    	//}
    });
    
    var granted = function(success){
    	if (success){
    		$('#perms').append("<span style='color:green'>Success!</span>");
    	}else{
    		$('#perms').append("<span style='color:red'>Failed!</span>");
    		$('#enableExternals').prop("checked",false);
    	}
    };
    
    $('#enableExternals').click(function(){
    	if (!$('#enableExternals').prop("checked")){
    		//Remove perm
    		chrome.permissions.remove({
    			origins: ['https://*/*','http://*/*']
    		}, granted);
    	}else{
    		//Add perm
    		chrome.permissions.request({
    			origins: ['https://*/*','http://*/*']
    		}, granted);
    	}
    });
    
  });
