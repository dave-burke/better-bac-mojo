/* this is the creator function for your scene assistant object. It will be passed all the 
	additional parameters (after the scene name) that were passed to pushScene. The reference
	to the scene controller (this.controller) has not be established yet, so any initialization
	that needs the scene controller should be done in the setup function below. */
function HelpFaqAssistant(title, scene) {
	this.title = title;
	this.scene = scene;
};

/* this function is for setup tasks that have to happen when the scene is first created use
 * Mojo.View.render to render view templates and add them to the scene, if needed setup widgets here
 * add event handlers to listen to events from widgets */
HelpFaqAssistant.prototype.setup = function() {
	this.scene = "help-man-entry/entries/" + this.scene + ".html";
	
	this.controller.setupWidget('entry',
		{
			itemTemplate: this.scene,
			swipeToDelete: false,
			reorderable: false
		},
		{
			items: {"foo"}
		}
	);

	this.controller.get("title").innerHTML = this.title;
};
