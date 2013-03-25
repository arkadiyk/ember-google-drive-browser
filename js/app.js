GoogDriveBrw = Ember.Application.create({
    LOG_TRANSITIONS: true
});
GoogDriveBrw.register('controller:folder_tree', GoogDriveBrw.FoldersController, {singleton: false });

// Routes
GoogDriveBrw.router = GoogDriveBrw.Router.map(function(){
	this.resource('folder', {path: '/'}, function(){
		this.resource('files', {path: '/:folder_id'}, function(){
            this.route('list');
            this.route('grid');
        });
	});
});

GoogDriveBrw.Router.reopen({
    startRouting: function() {
        if (!GoogDriveBrw.userProfile.get('loggedIn')) {
            $("#login_dialog").modal('show').one('click', "#login_btn", function(){
                $("#login_dialog").modal('hide');
                GoogDriveBrw.drive.authorize(function(){
                    GoogDriveBrw.userProfile.set('loggedIn', true);
                    GoogDriveBrw.startRouting();
                });
            });
        } else {
            this._super();
        }
    }
});

GoogDriveBrw.FolderRoute = Ember.Route.extend({
    model: function(param) {
        console.log('kkk', param);
        var id = param.folder_id ? param.folder_id : 'root' // todo: move it into Folder.find() ?
        return GoogDriveBrw.Folder.find(id);
    }
});
GoogDriveBrw.FilesRoute = Ember.Route.extend({
    setupController: function(controller, folder){
        console.log('fff', controller, folder);
        folder.load();
        controller.set('content', folder);
        GoogDriveBrw.viewMode.set('folder',folder);
    },
    renderTemplate: function() {
        this.render('fileList', {
            into: 'application',
            outlet: 'filesOutlet'
        });
    }
});

GoogDriveBrw.FilesListRoute = Ember.Route.extend({
    activate: function(){
        GoogDriveBrw.viewMode.set('mode','list');
    }
});
GoogDriveBrw.FilesGridRoute = Ember.Route.extend({
    activate: function(){
        GoogDriveBrw.viewMode.set('mode','grid');
    }
});

GoogDriveBrw.FolderTreeController = Ember.ObjectController.extend({
 	doFlipExpand: function(folder) {
 		this.set('isExpanded', !this.get('isExpanded'));
        folder.load();
	}
});

GoogDriveBrw.FilesIndexController = Ember.ObjectController.extend({});

/**
 * Holds an active Google API calls counter to show a loading indicator if the count > 0
 * @type {*}
 */
GoogDriveBrw.apiState = Ember.Object.create({
    activeCalls: 0
});

GoogDriveBrw.ViewMode = Ember.Object.extend({
    isList: function() {
        return this.get('mode') === "list"
    }.property('mode'),
    isGrid: function() {
        return this.get('mode') === "grid"
    }.property('mode')
});

GoogDriveBrw.viewMode = GoogDriveBrw.ViewMode.create({
    mode: "list"
});
GoogDriveBrw.ViewModeView =  Ember.View.extend({
    context: GoogDriveBrw.viewMode
});


GoogDriveBrw.userProfile = Ember.Object.create({
    loggedIn: false
});


/*
 * models
 */

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

