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
			formatters:{
				name:this.formatUtils.formatName.bind(this.formatUtils),
				abv:this.formatUtils.formatAbv.bind(this.formatUtils),
			},
			swipeToDelete: true,
			reorderable: false,
			filterFunction: this.filterDrinks.bind(this)
		},
		this.model = {
			listTitle: $L("Favorite drinks"),
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
				{ label: "Load json", command: "do-fav-drinks-import"},
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

FavDrinksAssistant.prototype.removeDuplicates = function(drinks) {
	var out=[];
	var map={};

	for (var i=0;i<drinks.length;i++) {
		map[drinks[i].name]=drinks[i];
	}
	for (drinkName in map) {
		out.push(map[drinkName]);
	}
	return out;
}

FavDrinksAssistant.prototype.updateDrinksList = function(){
	this.clearOldDrinks(this.favDrinks);
	this.favDrinks = this.removeDuplicates(this.favDrinks);
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
				Mojo.Controller.stageController.pushScene("custom-drink", this.state, this.prefs);
				break;
			case 'do-fav-drinks-import':
				Mojo.Log.info("Doing import");
				var req = new Ajax.Request("/media/internal/better-bac.json", {
					method: 'get',
					onFailure: function() {
						Mojo.Log.info("JSON get failed");
					},
					on404: function() {
						Mojo.Log.info("JSON not found");
					},
					onSuccess: function(transport) {
						var text = transport.responseText
						var json = Mojo.parseJSON(text);
						var drinks = json.data;
						this.favDrinks = this.favDrinks.concat(drinks);
						this.updateDrinksList();
						this.controller.get("favDrinksList").mojo.noticeUpdatedItems(0,this.favDrinks);
					}.bind(this)
				});
				break;
			case 'do-fav-drinks-clear':
				this.favDrinks = [];
				this.db.saveFavDrinks(this.favDrinks);
				var drinksList = this.controller.get("favDrinksList").mojo
				if(drinksList){
					drinksList.noticeRemovedItems(0,drinksList.getLength());
				}
				break;
		}
	}
};

FavDrinksAssistant.prototype.handleDrinkTap = function(event){
	Mojo.Controller.stageController.popScene();
	Mojo.Controller.stageController.pushScene("custom-drink", this.prefs, event.item);
};

FavDrinksAssistant.prototype.handleDrinkDelete = function(event){
	Mojo.Log.info("Deleting drink at %i: %s",event.index, this.favDrinks[event.index].name);
	this.favDrinks.splice(event.index,1);
	this.db.saveFavDrinks(this.favDrinks);
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
