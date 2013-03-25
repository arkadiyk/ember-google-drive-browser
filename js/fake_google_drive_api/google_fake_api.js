window.gapi = {
    auth: {
        authorize: function(params, callback) {
            var result = {};
            setTimeout(function() {
                console.log('authorized!');
                callback(result);
            }, 1000);
        }
    },
	client: {
        load: function(api_name, api_version, load_callback) {
            setTimeout(load_callback, 10);
        },
		drive: {
			files: {
				list: function(params) {
                    var folder_id = params.q.match(/'(.*)' in parents/)[1];
                    var result = GoogDriveFixtures.file_list[folder_id];
					return {execute: function(callback) {
                        console.log("calling list with ", params, folder_id, result);
						setTimeout(function(){ callback(result) }, 300);
					}}
				}
			},
            parents: {
                list: function(params) {
                    var folder_id = params.fileId;
                    var result = GoogDriveFixtures.parent_list[folder_id];
                    return {execute: function(callback) {
                        console.log("calling parents with ", params, folder_id, result);
                        setTimeout(function(){ callback(result) }, 300);
                    }}
                }
            }
        }
	}
};
