function FirstTimeAssistant() {
	this.cmdMenuModel = {
	    visible: false, 
	    items: [
		    {},{
				label: $L("Ok, I've read this. Let's continue ..."),
				command: 'do-continue'
		    },{}
	     ]
	};
}

FirstTimeAssistant.prototype.setup = function() {
	this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
};

FirstTimeAssistant.prototype.activate = function(event) {
	// start continue button timer
    this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};

FirstTimeAssistant.prototype.showContinue = function(){
    // show the command menu
    this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};
FirstTimeAssistant.prototype.handleCommand = function(event){
    if (event.type == Mojo.Event.command){
	    switch (event.command){
			case 'do-continue':
				this.controller.stageController.popScene();
				break;
	    }
	}
	if(event.type == Mojo.Event.back) {
    	event.stop();
    	event.stopPropagation();
	}
};