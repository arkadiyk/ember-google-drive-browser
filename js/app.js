GoogDriveBrw = Ember.Application.create({
    LOG_TRANSITIONS: true
});

// login
GoogDriveBrw.deferReadiness();
$(function(){
    GoogDriveBrw.drive.authorizeOnLoad(function(){GoogDriveBrw.advanceReadiness()});
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

GoogDriveBrw.FolderRoute = Ember.Route.extend({
    model: function() {
         return GoogDriveBrw.Folder.find('root');
    }
});

GoogDriveBrw.FilesRoute = Ember.Route.extend({
    setupController: function(controller, folder){
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

/**
 * Grid/List view
 * @type {*}
 */
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
GoogDriveBrw.UserProfileView =  Ember.View.extend({
    tagName: 'p',
    classNames: ["navbar-text","pull-right"],
    context: GoogDriveBrw.userProfile
});


/*  models  */
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

GoogDriveBrw.File = Ember.Object.extend({
    formattedCreatedDate: function() {
        var cd = this.get('createdDate');
        if (!cd) return '';
        var d = new Date(cd);
        return '' +
            d.getFullYear() + '-' +
            (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' +
            (d.getDay() < 9 ? '0' : '') +  (d.getDay() + 1) + ' ' +
            d.getHours() + ':' +
            d.getMinutes() + ':' +
            d.getSeconds();
    }.property('createdDate'),
    formattedSize: function() {
        var bytes = this.get('fileSize');
        if (!bytes) return '';
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }.property('fileSize')
});
