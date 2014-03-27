$(function() {
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
