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
function FavDrinksAssistant(dbUtils, prefs) {
	this.db = dbUtils;
	this.prefs = prefs;
	this.formatUtils = new FormatUtils();
}

FavDrinksAssistant.prototype.setup = function(){
	this.spinnerModel = {
			spinning: false 
		};
	
	this.controller.setupWidget("loadingSpinner",
		this.attributes = {
			spinnerSize: "large"
		},
		this.spinnerModel
	); 
	
	this.controller.setupWidget("favDrinksList",
			this.attributes = {
				itemTemplate: "fav-drinks/drink-list-entry",
				listTemplate: "fav-drinks/drink-list-container",
				//emptyTemplate: "fav-drinks/drink-list-empty",
				formatters:{
					name:this.formatUtils.formatName.bind(this.formatUtils),
					abv:this.formatUtils.formatAbv.bind(this.formatUtils)
				},
				swipeToDelete: true,
				reorderable: false,
				filterFunction: this.filterDrinks.bind(this)
			},
			this.listModel = {
				listTitle: $L("Drinks (Start typing to search)"),
				disabled: false
			}
		);
	
	this.cmdMenuModel = {
		items: [
		    {},{label: "Custom drink", command: "do-custom"},{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.handleCommand, this.cmdMenuModel);
	
	this.appMenuAttr = {
			omitDefaultItems: true
		};
		this.appMenuModel = {
			visible: true,
			items: [ 
			    {label: 'Load drinks',
			    	items: [
			    	    {label: $L("From web (official)"), command: "import-web-official"},
			    	    //{label: $L("From web (custom)"), command: "import-web-custom"},
			    	    {label: $L("From USB drive"), command: "import-usb"}
			    	]
			    },
			    { label: 'Export via email', command: "do-fav-drinks-export"},
			    { label: 'Submit ABVs to the author', command: "do-fav-drinks-submit"},
				{ label: "Clear favorites", command: "do-fav-drinks-clear"}
				//{ label: "Preferences", command: "do-myPrefs"}
			]
		};
		this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
		
	this.handleFirstTime();
};

FavDrinksAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	Mojo.Log.info("Setting fav-drink event listeners");
	this.favDrinksList = this.controller.get("favDrinksList");
	
	this.drinkTapHandler = this.handleDrinkTap.bind(this);
	Mojo.Event.listen(this.favDrinksList, Mojo.Event.listTap, this.drinkTapHandler);
	
	this.drinkDeleteHandler = this.handleDrinkDelete.bind(this);
	Mojo.Event.listen(this.favDrinksList, Mojo.Event.listDelete, this.drinkDeleteHandler);
};

FavDrinksAssistant.prototype.clearOldDrinks = function(favDrinks){
	while(favDrinks.length > 1000){ //Make this a 'max fav drinks' preference
		var oldestIndex = 0;
		var oldestTime = favDrinks[oldestIndex].lastTime;
		for(var i = 1;i<favDrinks.length;i++){
			var indexTime = favDrinks[i].lastTime;
			if(indexTime < oldestTime){
				oldestIndex = i;
				oldestTime = indexTime;
			}
		}
		favDrinks.splice(oldestIndex, 1);
	}
};

FavDrinksAssistant.prototype.sortByName = function(a, b){
	if(a.name == b.name){
		return 0;
	}else if(a.name < b.name){
		return -1;
	}else{
		return 1;
	}
};

FavDrinksAssistant.prototype.filterDrinks = function(filterString, listWidget, offset, count){
	if(this.favDrinks){
		this.doFilter(filterString, listWidget, offset, count);
	}else{
		this.startSpinner();
		this.db.getFavDrinks(function(value){
			this.stopSpinner();
			if(value){
				this.favDrinks = value;
				this.updateDrinksList();
				this.doFilter(filterString, listWidget, offset, count);
			}else{
				Mojo.Log.info("db returned no favorite drinks. That shouldn't happen");
			}
		}.bind(this));
	}
};

FavDrinksAssistant.prototype.startSpinner = function(){
	Mojo.Log.info("Start spinning");
	var spinner = this.controller.get("loadingSpinner").mojo;
	if(spinner){
		spinner.start();
	}else{
		this.spinnerModel.spinning = true;//Mojo.Log.info("Spinner not stopped!");
	}
};

FavDrinksAssistant.prototype.stopSpinner = function(){
	Mojo.Log.info("Stop spinning");
	var spinner = this.controller.get("loadingSpinner").mojo;
	if(spinner){
		spinner.stop();
	}else{
		this.spinnerModel.spinning = false;//Mojo.Log.info("Spinner not stopped!");
	}
};

FavDrinksAssistant.prototype.updateDrinksList = function(){
	this.clearOldDrinks(this.favDrinks);
	this.favDrinks.sort(this.sortByName);
	this.db.saveFavDrinks(this.favDrinks);
};

FavDrinksAssistant.prototype.doFilter = function(filterString, listWidget, offset, count){
	Mojo.Log.info("list asked for items: filter=" + filterString + " offset=" + offset + " limit=" + count);
	
	var drinks = this.favDrinks;
	var totalSubsetSize = 0;
	var subset = [];
	
	for(var i = 0;i < drinks.length;i++){
		var name = drinks[i].name;
		if(name.toUpperCase().indexOf(filterString.toUpperCase()) >= 0){
			if (subset.length < count && totalSubsetSize >= offset) {
				//Mojo.Log.info(name + " matches" + filterString);
				subset.push(drinks[i]);
			}
			totalSubsetSize++;
		}
	}
	//Mojo.Log.info("Found " + nResults + " results out of " + drinks.length + " at " + offset + ": " + this.debugDrinks(subset));
	listWidget.mojo.noticeUpdatedItems(offset, subset);
	listWidget.mojo.setLength(totalSubsetSize);
	listWidget.mojo.setCount(totalSubsetSize);
};

FavDrinksAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command) {
			case 'do-custom':
				Mojo.Controller.stageController.popScene();
				Mojo.Controller.stageController.pushScene("custom-drink", this.prefs);
				event.stopPropagation();
				break;
			case 'import-web-official':
				this.ajaxGet("http://sites.google.com/site/snewsoftware/webos/files/better-bac.json");
				event.stopPropagation();
				break;
			case 'import-web-custom':
				this.ajaxGet("/media/internal/better-bac.json");
				event.stopPropagation();
				break;
			case 'import-usb':
				this.ajaxGet("/media/internal/better-bac.json");
				event.stopPropagation();
				break;
			case 'do-fav-drinks-export':
				this.handleExport();
				event.stopPropagation();
				break;
			case 'do-fav-drinks-submit':
				this.handleExport(true);
				event.stopPropagation();
				break;
			case 'do-fav-drinks-clear':
				this.favDrinks = [];
				this.db.saveFavDrinks(this.favDrinks);
				var drinksList = this.controller.get("favDrinksList").mojo
				if(drinksList){
					drinksList.noticeRemovedItems(0,drinksList.getLength());
				}
				event.stopPropagation();
				break;
		}
	}
};

FavDrinksAssistant.prototype.ajaxGet = function(source){
	Mojo.Log.info("Loading drinks from " + source);
	var req = new Ajax.Request(source, {
		method: 'get',
		onFailure: this.ajaxFailure.bind(this),
		on404: this.ajax404.bind(this),
		onSuccess: this.ajaxSuccess.bind(this)
	});
};

FavDrinksAssistant.prototype.ajaxFailure = function(){
	Mojo.Log.info("JSON get failed");
};

FavDrinksAssistant.prototype.ajax404 = function(){
	Mojo.Log.info("JSON not found");
};

FavDrinksAssistant.prototype.ajaxSuccess = function(transport){
	Mojo.Log.info("Ajax success!");
	var json = Mojo.parseJSON(transport.responseText);
	var date = new Date(json.updated);
	var drinks = json.data;
	this.handleImports(drinks);
};

FavDrinksAssistant.prototype.handleImports = function(imported){
	Mojo.Log.info("Showing dialog");
	this.controller.showDialog({
	    template: 'dialogs/import-drinks-dialog',
	    assistant: new ImportDrinksDialogAssistant(this,imported, function(){
	    	
	    }.bind(this))
	});
};

FavDrinksAssistant.prototype.handleExport = function(submitToAuthor){
	var message = "";
	var recipients = [];
	var subject = "";
	if(submitToAuthor){
		subject = "Better BAC json submission"
		recipients.push({type: 'email',
            role: 1,
            value: 'snewsoftware@gmail.com',
            contactDisplay: 'Snew Software'});
		message += "Dear Snew Software,<br>Please consider merging this data with the official feed.<br>";
	}else{
		subject = "Better BAC json export"
		message += "Copy the following out to a file named better-bac.json (Make sure the filename is all lowercase and Windows doesn't rename the file as better-bac.json.txt).<br>" +
			"To load these drinks into Better BAC, simply copy better-bac.json to the root of the Pre's USB directory.<br>";
	}
	message += '<br>{version: "1.0", updated: ' + new Date().getTime() + ", data: [<br>";
	for(var i = 0;i<this.favDrinks.length;i++){
		var drink = this.favDrinks[i];
		if(i!=0){
			message +=",<br>";
		}
		message += '{name: "' + drink.name + '", abv: ' + drink.abv + ', vol: ' + drink.vol + ', updated: ' + drink.updated + '}'; 
	}
	message += '<br>]}';
	Mojo.Log.info("Sending message: " + message);
	var obj = new Mojo.Service.Request("palm://com.palm.applicationManager/", {
		method: "open",
		parameters: {
			id: "com.palm.app.email",
			params: {
				"summary": subject,
				"text": message,
				"recipients": recipients
			}
		}
	});
};

FavDrinksAssistant.prototype.handleDrinkTap = function(event){
	Mojo.Controller.stageController.popScene();
	Mojo.Controller.stageController.pushScene("custom-drink", this.prefs, event.item);
};

FavDrinksAssistant.prototype.handleDrinkDelete = function(event){
	var drink = event.item;
	for(var i = 0;i<this.favDrinks.length;i++){
		var iDrink = this.favDrinks[i];
		if(iDrink.name == drink.name){
			Mojo.Log.info("Deleting %s",drink.name);
			this.favDrinks.splice(i,1);
			this.db.saveFavDrinks(this.favDrinks);
			break;
		}
	}
};

FavDrinksAssistant.prototype.handleFirstTime = function(){
	var cookie = new Mojo.Model.Cookie(Mojo.appInfo.id + '.firstTimes');
	var firstTimes = cookie.get();
	if (!firstTimes) {
		firstTimes = {};
	}
	if(!firstTimes.favDrinks){
		this.controller.showAlertDialog({
			onChoose: function(choice){
				}.bind(this),
				message: 'Want more A.B.V. data? Choose "Load Drinks"->"From Web (Official)" from the app menu to download the A.B.V. for hundreds of drinks! Don\'t forget to check back later to see if there are updates!',
				choices: [
				    {label: "Okay", value: true, type: "affirmative"}
				]
			});
		firstTimes.favDrinks = true;
		Mojo.Log.info("Storing %j" + firstTimes);
		cookie.put(firstTimes);
	}
};

FavDrinksAssistant.prototype.debugDrinks = function(drinks){
	var message = "";
	for(var i = 0;i<drinks.length;i++){
		var drink = drinks[i];
		if(i!=0){
			message+=", ";
		}
		message+=drink.name;
	}
	//Mojo.Log.info(message);
	return message;
};

FavDrinksAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	Mojo.Log.info("Clearing fav-drink event listeners");
	Mojo.Event.stopListening(this.favDrinksList, Mojo.Event.listTap, this.drinkTapHandler);
};

FavDrinksAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
