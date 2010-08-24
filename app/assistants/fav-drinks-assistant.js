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
	this.controller.setupWidget("favDrinksList",
			this.attributes = {
				itemTemplate: "fav-drinks/drink-list-entry",
				listTemplate: "fav-drinks/drink-list-container",
				emptyTemplate: "fav-drinks/drink-list-empty",
				formatters:{
					name:this.formatUtils.formatName.bind(this.formatUtils),
					abv:this.formatUtils.formatAbv.bind(this.formatUtils)
				},
				swipeToDelete: true,
				reorderable: false,
				filterFunction: this.filterDrinks.bind(this)
			},
			this.model = {
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
				{ label: "Clear favorites", command: "do-fav-drinks-clear"},
				{ label: "Preferences", command: "do-myPrefs"}
			]
		};
		this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
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
		this.db.getFavDrinks(function(value){
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

FavDrinksAssistant.prototype.updateDrinksList = function(){
	this.clearOldDrinks(this.favDrinks);
	Mojo.Controller.getAppController().showBanner(this.favDrinks.length + " fav drinks", {source: 'notification'});
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
	var drinkMap = {};
	var newDrinks = [];
	var updatedDrinks = [];
	
	var drinks = this.favDrinks;
	for (var i=0;i<drinks.length;i++) {
		drinkMap[drinks[i].name]=drinks[i];
	}
	
	for(var i = 0;i<imported.length;i++){
		var drink = imported[i];
		var existing = drinkMap[drink.name];
		if(existing){
			if(drink.abv === existing.abv){
			}else{
				Mojo.Log.info("%s already exists, but has a different abv",drink.name);
				updatedDrinks.push(drink);
			}
		}else{
			Mojo.Log.info("%s does not exist: %j",drink.name,existing);
			newDrinks.push(drink);
		}
	}
	
	this.controller.showAlertDialog({
		onChoose: function(choice){
				if(choice){
					Mojo.Log.info("Updated: %j",updatedDrinks);
					Mojo.Log.info("New: %j",newDrinks);
					for(var i = 0;i<updatedDrinks.length;i++){
						var updatedDrink = updatedDrinks[i];
						drinkMap[updatedDrink.name] = updatedDrink;
					}
					this.favDrinks = [];
					for (drinkName in drinkMap) {
						this.favDrinks.push(drinkMap[drinkName]);
					}
					this.favDrinks = this.favDrinks.concat(newDrinks);
					this.updateDrinksList();
					this.controller.get("favDrinksList").mojo.noticeUpdatedItems(0,this.favDrinks);
				}else{
					Mojo.Log.info("User cancelled import");
				}
			}.bind(this),
		message: "Found " + newDrinks.length + " new & " + updatedDrinks.length + " updated.",
		choices: [
		    {label: "Import", value: true, type: "affirmative"},
		    {label: "Cancel", value: false, type: "negative"}
		]
	});
	
//	this.controller.showDialog({
//	    template: 'dialogs/import-drinks-dialog',
//	    assistant: new ImportDrinksDialogAssistant(this, newDrinks, updatedDrinks)
//	});
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
