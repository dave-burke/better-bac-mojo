/*
 * This file as well as the matching html files are based on files found in Preware by WebOSInternals.
 */
function HelpAssistant()
{
	
};

HelpAssistant.prototype.setup = function()
{
	this.controller.get('help-title').innerHTML = $L("Help");
	this.controller.get('help-support').innerHTML = $L("Support");
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, {visible: false});
	
	this.controller.get('appname').innerHTML = Mojo.appInfo.title;
	this.controller.get('appdetails').innerHTML = Mojo.appInfo.version + $L(" by David Burke");
	
	this.supportModel = 
	{
		items: []
	};
	
	this.supportModel.items.push({
		text: $L("Help Topics"),
		target: 'help-topics'
	});
	this.supportModel.items.push({
		text: $L("FAQ"),
		target: 'help-faq'
	});
	this.supportModel.items.push({
		text: $L("Changelog"),
		target: 'help-changelog'
	});
	
	this.controller.setupWidget
	(
		'supportList', 
		{
			itemTemplate: "help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.supportModel
	);
	
	this.controller.listen('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
	
};
HelpAssistant.prototype.listTapHandler = function(event)
{
	var target = event.item.target;
	this.controller.stageController.pushScene(target);
};

HelpAssistant.prototype.activate = function(event) {};
HelpAssistant.prototype.deactivate = function(event) {};
HelpAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};