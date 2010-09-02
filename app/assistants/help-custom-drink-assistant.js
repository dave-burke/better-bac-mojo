function HelpCustomDrinkAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

HelpCustomDrinkAssistant.prototype.setup = function() {
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
		    { label: "About", command: 'do-myAbout'}
	    ]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
};

HelpCustomDrinkAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


HelpCustomDrinkAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

HelpCustomDrinkAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
