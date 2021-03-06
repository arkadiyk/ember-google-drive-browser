GoogDriveBrw.Drive = Ember.Object.extend({
    driveFolderObjectCache: Ember.Object.create({}),

    /**
     * Create or repopulate folder and save it into a folder cache
     * @param o Folder attributes JSON
     * @returns folder
     */
    createFolder: function(o) {
        var f = this.get('driveFolderObjectCache').get(o.id);
        if (f) {
            f.setProperties(o);
        } else {
            f = GoogDriveBrw.Folder.create(o);
            this.get('driveFolderObjectCache').set(o.id, f);
        }
        return f;
    },

    /**
     * Find folder
     * 1. Try to find it in the folder cache
     * 2. If folder_id is 'root' create new one (potential race condition?)
     * 3. Load folder hierarchy from server.
     *
     * @param id
     * @returns {null}
     */
    findFolder: function(id) {
        var folder = null;
        if (this.get('driveFolderObjectCache').get(id)) {
            // Step 1. Find in Object cache
            folder = this.get('driveFolderObjectCache').get(id);
        } else if (id == 'root'){
            // Step 2. If root is requested and not yet in the cache, create it
            folder = this.createFolder.call(this, {id: "root", title: "Root Folder", isExpanded: true});
        } else {
            // Step 3. If direct folder URL hit - Try to get from Google Drive by id
            // Step 3.1 Create a folder. It will be returned right away coz all populate callbacks are async
            folder = this.createFolder.call(this, {id: id, title: "Loading ..."});

            // Step 3.2 Try to populate this folder with child folders and files
            this.loadSubFolders(folder);

            // Step 3.3 Travel up the parent tree and populate all folders on a way. Can take time as we execute many requests here.
            // Step 3.4 Travel down the tree and open the folders. There can be multiple paths as multiple parens allowed
            var that = this;
            var path_to_root = [];
            var finished_callback = function() {
                for(var i=path_to_root.length-1; i>=0; i--){
                    that.get('driveFolderObjectCache').get(path_to_root[i]).set('isExpanded',true);
                }
            };
            this.loadParents(folder, path_to_root, finished_callback);
        }

        this.loadSubFolders(folder);
        return folder;
    },

    /**
     * Load parents for a folder from Google Server
     * @param current_folder
     * @param path_to_root to store paths to the root from current folder. We need it to expand them all when we are done.
     * @param finished_callback Callback on when all parents up to the root are loaded.
     */
    loadParents: function(current_folder, path_to_root, finished_callback) {
        var folder_id = current_folder.get('id');
        var that = this;
        var get_parents = function(result_list) {
            if(result_list && result_list.items) {
                result_list.items.forEach(function(o){
                    if(!o.isRoot) {
                        var folder = that.createFolder.call(that, {id: o.id});
                        that.loadSubFolders(folder);
                        path_to_root.push(o.id);
                        that.loadParents(folder, path_to_root, finished_callback);
                    } else {
                        // assuming root folder loads on app startup
                        path_to_root.push('root');
                        finished_callback();
                    }
                });
            } else if (result_list.error.code == 404) { // file not found
                // URL pointed to invalid folder_id
                if(!current_folder.get('isDestroyed')) {
                    console.log("NO PARENTS! Destroy and delete the folder from cache..");
                    that.get('driveFolderObjectCache').set(folder_id, null);
                    current_folder.set('title','');
                    current_folder.destroy();
                }
            } else if (result_list.error.code == 401) {
                console.log('reathorizing parents:', result_list);
                GoogDriveBrw.drive.authorize(function(){that.loadParents(current_folder, path_to_root, finished_callback)});
            } else {
                console.log('cannot get parents:', result_list);
                alert('Cannot get file parents: ' + result_list.error.code + ' - ' + result_list.error.message);
            }
            GoogDriveBrw.apiState.decrementProperty('activeCalls');
        };
        GoogDriveBrw.apiState.incrementProperty('activeCalls');

        gapi.client.load('drive', 'v2', function() {
            var fields = 'items(id,isRoot)';
            var request = gapi.client.drive.parents.list({fileId: folder_id, fields: fields});
            request.execute(get_parents);
        });
    },

    /**
     * Load child files and folders for the folder
     * @param folder
     * @returns {boolean} true if we need to load children
     */
    loadSubFolders: function(folder) {
        if(folder.get('isLoaded') || folder.get('isLoading')) return false;

        folder.set('isLoading', true);
        var folder_id = folder.get('id');

        var that = this;
        var populate_folder = function(result_list) {
            var files = [], folders = [];
            if(result_list && result_list.items) {
                result_list.items.forEach(function(o){
                    o.parent_id = folder_id;
                    if (o.mimeType === "application/vnd.google-apps.folder") {
                        folders.pushObject(that.createFolder.call(that, o));
                    } else {
                        files.pushObject(GoogDriveBrw.File.create(o));
                    }
                });
                folder.set('childFolders', folders);
                folder.set('childFiles', files);
                folder.set('isLoading', false);
                folder.set('isLoaded', true);
            } else if (result_list.error.code == 404) { // file not found
                // URL pointed to invalid folder_id
                if(!folder.get('isDestroyed')) {
                    console.log("NO PARENTS! Destroy and delete the folder from cache..");
                    that.get('driveFolderObjectCache').set(folder_id, null);
                    folder.set('title','');
                    folder.destroy();
                }
            } else if (result_list.error.code == 401) {
                console.log('reathorizing list:', result_list);
                GoogDriveBrw.drive.authorize(function(){that.loadSubFolders(folder)});
            } else {
                console.log('cannot get list:', result_list);
                alert('Cannot get file list: ' + result_list.error.message);
            }

            GoogDriveBrw.apiState.decrementProperty('activeCalls');
        };
        GoogDriveBrw.apiState.incrementProperty('activeCalls');

        gapi.client.load('drive', 'v2', function() {
            var query = "'" + folder_id + "' in parents";
            var fields = "items(createdDate,description,fileExtension,fileSize,iconLink,id,imageMediaMetadata,indexableText,mimeType,thumbnailLink,title)";
            var request = gapi.client.drive.files.list({q: query, fields: fields});
            request.execute(populate_folder);
        });

        return true;
    },

    authorizeOnLoad: function(success_callback) {
        if(!gapi || !gapi.auth) {
            setTimeout(function(){ GoogDriveBrw.drive.authorizeOnLoad(success_callback) }, 36);
        } else {
            GoogDriveBrw.drive.authorize(success_callback);
        }
    },

    authorize: function(success_callback) {
        var CLIENT_ID = '251650969875-cd1ubr5qmgjqh5hptugcql4cik570u6f.apps.googleusercontent.com';
        var SCOPES = 'https://www.googleapis.com/auth/drive.readonly.metadata';
        var callback = function(auth_result) {
            if (auth_result && !auth_result.error) {
                GoogDriveBrw.drive.populateUserProfile();
                if(success_callback){ success_callback(auth_result) }
            } else {
                gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false}, callback);
            }
        };
        gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: true}, callback);
    },

    populateUserProfile: function() {
        var populateProfile = function(result) {
            GoogDriveBrw.userProfile.setProperties(result);
        }
        gapi.client.load('drive', 'v2', function() {
            var fields = "name,user";
            var request = gapi.client.drive.about.get({fields: fields});
            request.execute(populateProfile);
        });
    }
});
GoogDriveBrw.drive = GoogDriveBrw.Drive.create({});


