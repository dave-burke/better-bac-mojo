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
function HelpChangelogAssistant() {
	this.changelog = [
		{version: '1.0.1',
		log: [
			'Drink export now produces webOS 2.0 compatible JSON.'
		]},
		{version: '1.0.0',
		log: [
		    'Released in App Catalog',
			'Minor code cleanup',
			'Added some error dialogs for drink import issues'
		]},
		{version: '0.12.7 (beta)',
		log: [
			'Consolidated and updated help pages',
			'Now checks for an internet connection and notifies the user if none is found before trying to update the saved drinks list',
			'Added a "first launch" message that will only be displayed once the first time the app is opened',
			'Some minor formatting changes'
		]},
	    {version: '0.11.9 (beta)',
		log: [
			'Updated drink entry display on main scene',
			'Added metric units for prefs and drinks',
			'Added preview info to custom drink screen'
		]},
		{version: '0.10.18 (beta)',
		log: [
			'Added "Favorite drinks" list of drink templates',
			'Added confirmation dialog for clear all drinks',
			'Documentation updates'
		]},
		{version: '0.9.3 (beta)',
		log: [
			'Released in beta feed',
			'Alarms go off when you reach zero or your preset limit'
		]},
		{version: '0.8.2 (homebrew)',
		log: [
			'Moved "Add drink" to footer and added "Graph" button in footer',
			'Changed default height to 68',
			'Preferences "Save" button now reads "Done"',
			'Rearranged menu items',
			'Removed "Graph Drinks" from the app menu',
			'Auto refresh is now set to 30 seconds',
			'Added pop-up messages for database errors and invalid inputs',
			'Added 12 hour graph period, which is now the default',
			'Event listeners are now correctly cleared'
		]},
		{version: '0.7.3 (homebrew)',
		log: [
			'Each scene has it\'s own help page.',
			'Removed "Add a drink" from list widget',
			'Added "Add a drink" button between the status box and the drink list',
			'"Graph drinks" menu item renamed to "Graph BAC"',
			'All drinks are in a single list',
			'Drinks may be graphed (all or 24h)',
			'Time to zero/limit is displayed as #h #m instead of just total minutes',
			'Added history preferences (max days / max drinks)',
			'New app ID in anticipation of eventual app catalog release',
			'App no longer continues to refresh while minimized',
			'Added ability to add drinks from the past',
			'Using Depot DB'
		]},
		{version: '0.6.0 (homebrew)',
		log: [
			'Released in PreCentral homebrew feed',
			'Added "Watson" method of calculation'
		]},
		{version: '0.5.1 (private beta)',
		log: [
			'Updated about/help to use proper css',
			'Added a proper icon',
			'Removed "Preferences" button and added "Preferences" to app menu',
			'Added an "About" page available via the app menu.',
			'Added a "Help" page available via the app menu.'
		]},
		{version: '0.4.2 (private beta)',
		log: [
			'Fixed a bug that prevented obsolete drinks from being removed from the list',
			'Fixed a bug that prevented the bacDelta from being applied past the first drink',
			'Fixed a bug that would drop the remainder of a bacDelta after removing a drink',
			'Refactored lots of disorganized code',
			'Individual drink BAC is now shown as "bac/originalBac"',
			'Status automatically updates every minute',
			'"Update Status" button has been removed',
			'Drink list entry format has been rearranged and now includes the drink\'s individual BAC',
			'Whenever BAC is decreased, the BAC of the oldest drink in the list is decreased',
			'When the oldest drink\'s BAC reaches zero, it is removed from the list'
		]},
		{version: '0.3.0 (private beta)',
		log: [
			'Tapping a drink loads it as a new drink template',
			'New drink scene includes BAC/time previews'
		]},
		{version: '0.2.0 (private beta)',
		log: [
			'Drink times are displayed in drink list',
			'State is now stored via cookie',
			'Drinks can no longer be re-ordered',
			'Drink list is cleared when BAC is zero'
		]},
		{version: '0.1.0 (private beta)',
		log: [
			'Initial build',
			'Preferences including gender, weight, legal limit',
			'BAC calculation that can be manually updated via button press',
			'Calculated time (in minutes) until BAC will equal the legal limit',
			'Calculated time (in minutes) until BAC will equal zero',
			'List of drinks displayed',
			'Drinks can be re-ordered/deleted',
			'Deleted drinks are removed from the current BAC calculation'
		]}
	];
};

/* this function is for setup tasks that have to happen when the scene is first created use
 * Mojo.View.render to render view templates and add them to the scene, if needed setup widgets here
 * add event handlers to listen to events from widgets */
HelpChangelogAssistant.prototype.setup = function() {
	
	this.controller.setupWidget('changelog',
		{
			itemTemplate: "help-changelog/log-list-entry",
			swipeToDelete: false,
			reorderable: false,
			formatters:{
				log: this.formatLog.bind(this)
			}
		},
		{
			items: this.changelog
		}
	);
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [{ label: "Review this app", command: "do-appCatalog"}]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
};

HelpChangelogAssistant.prototype.formatLog = function(log){
	if(log){
		var html = "<ul>";
		for (var i = 0; i < log.length; i++){
			html += "<li>" + log[i] + "</li>";
		}
		html+="</ul>";
		return html;
	}else{
		return "";
	}
};
