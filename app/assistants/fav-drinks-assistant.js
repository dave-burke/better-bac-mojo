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
	this.formatUtils = new FormatUtils();
	this.favDrinks = [];
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
			items: this.favDrinks,
			disabled: false
		}
	);
	
	this.cmdMenuModel = {
		items: [
		    {},{label: "Custom drink", command: "do-custom"},{}
		]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.handleCommand, this.cmdMenuModel);
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
	
	this.loadFavDrinks();
};

FavDrinksAssistant.prototype.loadFavDrinks = function() {
	this.db.getFavDrinks(function(value){
		if(value){
			this.favDrinks = value;
			this.favDrinks.sort(this.sortByName);
			var drinksList = this.controller.get("favDrinksList").mojo
			if(drinksList){
				drinksList.noticeUpdatedItems(0,this.favDrinks);
			}
		}else{
			Mojo.Log.info("db returned no favorite drinks. That shouldn't happen");
		}
	}.bind(this));
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
	//Mojo.Log.info("Filtering with " + filterString);
	var filteredList = [];
	var nResults = 0;
	for(var i = offset;i<offset+count && i < this.favDrinks.length;i++){
		var name = this.favDrinks[i].name;
		if(name.toUpperCase().indexOf(filterString.toUpperCase()) >= 0){
			filteredList.push(this.favDrinks[i]);
			nResults++;
		}
	}
	listWidget.mojo.noticeUpdatedItems(offset, filteredList);
	listWidget.mojo.setLength(nResults);
	listWidget.mojo.setCount(nResults);
};

FavDrinksAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command) {
			case "do-custom":
				Mojo.Controller.stageController.popScene();
				break;
		}
	}
};

FavDrinksAssistant.prototype.handleDrinkTap = function(event){
	Mojo.Controller.stageController.popScene(event.item);
};

FavDrinksAssistant.prototype.handleDrinkDelete = function(event){
	Mojo.Log.info("Deleting drink at %i: %s",event.index, this.favDrinks[event.index].name);
	this.favDrinks.splice(event.index,1);
	this.db.saveFavDrinks(this.favDrinks);
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
