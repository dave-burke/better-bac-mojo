/* this is the creator function for your scene assistant object. It will be passed all the 
	additional parameters (after the scene name) that were passed to pushScene. The reference
	to the scene controller (this.controller) has not be established yet, so any initialization
	that needs the scene controller should be done in the setup function below. */
function HelpManAssistant() {
	this.topics = [
	    {
	    	title: 'Main scene',
	    	scene: 'main-scene'
	    },{
	    	title: 'Preferences scene',
	    	scene: 'prefs-scene'
	    },{
	    	title: 'Adding a drink',
	    	scene: 'add-a-drink'
	    },{
	    	title: 'Graphing your drinks',
	    	scene: 'graph-scene'
	    },{
	    	title: 'How do I know the ABV of my drink?',
	    	scene: 'abv-howto'
	    },{
	    	title: 'How is my BAC Calculated?',
	    	scene: 'calculations'
	    },{
	    	title: 'How accurate is this?',
	    	scene: 'accuracy'
	    },{
	    	title: 'When should I add a drink?',
	    	scene: 'when-to-add'
	    },{
	    	title: 'Where can I find the source code?',
	    	scene: 'source'
	    }
	];
};

/* this function is for setup tasks that have to happen when the scene is first created use
 * Mojo.View.render to render view templates and add them to the scene, if needed setup widgets here
 * add event handlers to listen to events from widgets */
HelpManAssistant.prototype.setup = function() {
	
	this.controller.setupWidget('toc',
		{
			itemTemplate: "help-man/man-toc-entry",
			swipeToDelete: false,
			reorderable: false
		},
		{
			items: this.topics
		}
	);
	this.controller.listen('toc', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};

HelpManAssistant.prototype.listTapHandler = function(event) {
	this.controller.stageController.pushScene('help-man-entry',event.item.title,event.item.scene);
};

HelpManAssistant.prototype.activate = function(event) {};
HelpManAssistant.prototype.deactivate = function(event) {};
HelpManAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('toc', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};
