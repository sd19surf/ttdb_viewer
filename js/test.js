function downloadFile(url,type,callback,e_callback) {
    var e_callback = null;

	var request = $.ajax({
		type: 'GET',
		url: url,
		dataType: type,
		success: callback,
		error: (function(xhr, textStatus, err) {
			if (e_callback !== null) {
				e_callback(xhr);
			}
			else { 
				alert("Error while retrieving file: " + url);
			}
		})
    })
    return request;

}