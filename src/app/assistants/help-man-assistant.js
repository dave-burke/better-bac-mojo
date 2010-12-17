/*
 * This file is part of Better BAC
 * Copyright (C) 2010 David Burke
 *
 * Better BAC is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Better BAC is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [{ label: "Review this app", command: "do-appCatalog"}]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
};

HelpManAssistant.prototype.listTapHandler = function(event) {
	this.controller.stageController.pushScene('help-man-entry',event.item.title,event.item.scene);
};

HelpManAssistant.prototype.activate = function(event) {};
HelpManAssistant.prototype.deactivate = function(event) {};
HelpManAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening('toc', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};
