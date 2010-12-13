/* this is the creator function for your scene assistant object. It will be passed all the 
	additional parameters (after the scene name) that were passed to pushScene. The reference
	to the scene controller (this.controller) has not be established yet, so any initialization
	that needs the scene controller should be done in the setup function below. */
function HelpHowtoAssistant() {
	this.topics = [
	    {
	    	topic: 'Add a drink',
	    	topicText: 'Click the "Add" button. You will see a list of drinks you\'ve had or that you\'ve downloaded from the internet.' +
	    		'this is a test'
	    }
	];
};

/* this function is for setup tasks that have to happen when the scene is first created use
 * Mojo.View.render to render view templates and add them to the scene, if needed setup widgets here
 * add event handlers to listen to events from widgets */
HelpHowtoAssistant.prototype.setup = function() {
	
	this.controller.setupWidget('howto',
		{
			itemTemplate: "help-howto/howto-list-entry",
			swipeToDelete: false,
			reorderable: false
		},
		{
			items: this.topics
		}
	);
};
