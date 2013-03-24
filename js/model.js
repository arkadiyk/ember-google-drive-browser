
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
            folder = this.createFolder.call(this, {id: "root", title: "Root Folder"});
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
        var request = gapi.client.drive.parents.list({fileId: folder_id});

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
                        path_to_root.push('root');
                        finished_callback();
                    }
                });
            }
            GoogDriveBrw.apiState.decrementProperty('activeCalls');
        };
        GoogDriveBrw.apiState.incrementProperty('activeCalls');
        request(get_parents);
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
        var request = gapi.client.drive.files.list({q: "'" + folder_id + "' in parents"});

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
            }
            folder.set('childFolders', folders);
            folder.set('childFiles', files);
            folder.set('isLoading', false);
            folder.set('isLoaded', true);

            GoogDriveBrw.apiState.decrementProperty('activeCalls');
        };

        GoogDriveBrw.apiState.incrementProperty('activeCalls');
        request(populate_folder);
        return true;
    }
});

GoogDriveBrw.drive = GoogDriveBrw.Drive.create({});

GoogDriveBrw.Folder = Ember.Object.extend({
	isLoaded: false,
	isLoading: false,
	childFolders: [],
	childFiles: [],

    load: function() {
        GoogDriveBrw.drive.loadSubFolders(this);
    }
});

GoogDriveBrw.Folder.reopenClass({
    find: function(folder_id) {
        return GoogDriveBrw.drive.findFolder(folder_id);
    }
});

GoogDriveBrw.File = Ember.Object.extend({});
