GoogDriveBrw = Ember.Application.create({
    LOG_TRANSITIONS: true
});
GoogDriveBrw.register('controller:folders', GoogDriveBrw.FoldersController, {singleton: false });



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
                GoogDriveBrw.userProfile.set('loggedIn', true);
                GoogDriveBrw.startRouting();
                //setTimeout(function(){console.log('resetting'); window.location.reload()}, 10000)
            });
        } else {
            this._super();
        }
    }
});

GoogDriveBrw.FolderRoute = Ember.Route.extend({
    model: function(param) {
        var id = param.folder_id ? param.folder_id : 'root' // todo: move it into Folder.find() ?
        return  GoogDriveBrw.Folder.find(id)
    }
});
GoogDriveBrw.FilesRoute = Ember.Route.extend({
    setupController: function(controller){
        var folder = this.modelFor('files');
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

GoogDriveBrw.FoldersController = Ember.ArrayController.extend({
    content: [],
	doFlipExpand: function(folder) {
		folder.set('isExpanded', !folder.get('isExpanded'));
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


//GoogDriveBrw.userProfile = Ember.Object.create({
//    isAuthenticated: true
//});
//
//GoogDriveBrw.IndexController =  Ember.ArrayController.extend({
//    content: [GoogDriveBrw.userProfile],
//    doLogin: function() {
//        $('#login_dialog').modal('show');
//    },
//    doAuthenticate: function() {
//
//    }
//});
//
