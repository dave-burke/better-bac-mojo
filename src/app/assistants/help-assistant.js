/*
 * This file as well as the matching html files are based on files found in Preware by WebOSInternals.
 */
function HelpAssistant() {

};

HelpAssistant.prototype.setup = function() {
	this.controller.get('help-title').innerHTML = $L("Help");
	this.controller.get('help-support').innerHTML = $L("Support");

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems : true
	}, {
		visible : false
	});

	this.controller.get('appname').innerHTML = Mojo.appInfo.title;
	this.controller.get('appdetails').innerHTML = Mojo.appInfo.version + $L(" by David Burke");

	this.supportModel = {
		items : []
	};

	this.supportModel.items.push({
		text : $L("User manual"),
		target : 'help-man'
	});
	this.supportModel.items.push({
		text : $L("Changelog"),
		target : 'help-changelog'
	});
	this.supportModel.items.push({
		text : $L("Get help via email"),
		target : 'support-email'
	});

	this.controller.setupWidget('supportList', {
		itemTemplate : "help/help-row-template",
		swipeToDelete : false,
		reorderable : false
	}, this.supportModel);

	this.controller.listen('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [{ label: "Review this app", command: "do-appCatalog"}]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);

};
HelpAssistant.prototype.listTapHandler = function(event) {
	var target = event.item.target;
	if (target === "support-email") {
		var deviceModel = Mojo.Environment.DeviceInfo.modelName; 
		var webosVersion = Mojo.Environment.DeviceInfo.platformVersion;
		var carrierName = Mojo.Environment.DeviceInfo.carrierName;
		
		var subject = "Better BAC support request";
		var message = "Dear Snew Software,<br><br>";
		message += "Please describe your problem here:<br><br><br>";
		message += "Please do not change the text below this.<br>";
		message += "Device name: " + deviceModel + "<br>";
		message += "webOS version: " + webosVersion + "<br>";
		message += "Carrier: " + carrierName + "<br>";
		message += "App version: " + Mojo.appInfo.version + "<br>";
		new MojoUtils(this).simpleEmail(subject, message, 'snewsoftware@gmail.com', 'Snew Software');
		this.generateEmail();
	} else {
		this.controller.stageController.pushScene(target);
	}
};

HelpAssistant.prototype.activate = function(event) {
};
HelpAssistant.prototype.deactivate = function(event) {
};
HelpAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};
