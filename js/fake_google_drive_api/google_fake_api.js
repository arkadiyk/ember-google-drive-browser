window.gapi = {
	client: {
		drive: {
			files: {
				list: function(params) {
                    var folder_id = params.q.match(/'(.*)' in parents/)[1];
                    var result = GoogDriveFixtures.file_list[folder_id];
					return function(callback) {
                        console.log("calling list with ", params, folder_id, result);
						setTimeout(function(){ callback(result) }, 1200);
					}
				}
			},
            parents: {
                list: function(params) {
                    var folder_id = params.fileId;
                    var result = GoogDriveFixtures.parent_list[folder_id];
                    return function(callback) {
                        console.log("calling parents with ", params, folder_id, result);
                        setTimeout(function(){ callback(result) }, 1200);
                    }
                }
            }
        }
	}
};
