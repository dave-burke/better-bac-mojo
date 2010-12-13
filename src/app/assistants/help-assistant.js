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
		text: $L("User manual"),
		target: 'help-man'
	});
	this.supportModel.items.push({
		text: $L("Changelog"),
		target: 'help-changelog'
	});
	this.supportModel.items.push({
		text: $L("Generate support email"),
		target: 'email'
	});
	
	this.controller.setupWidget
	(
		'supportList', 
		{
			itemTemplate: "help/help-row-template",
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
	if(target === "email"){
		//TODO
	}else{
		this.controller.stageController.pushScene(target);
	}
};

HelpAssistant.prototype.activate = function(event) {};
HelpAssistant.prototype.deactivate = function(event) {};
HelpAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};
