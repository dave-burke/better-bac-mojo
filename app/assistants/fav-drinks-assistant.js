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
			reorderable: false
		},
		this.model = {
			listTitle: $L("Favorite drinks"),
			items: this.favDrinks
		}
	);
	this.loadFavDrinks();
}

FavDrinksAssistant.prototype.loadFavDrinks = function() {
	this.db.getFavDrinks(function(value){
		if(value){
			this.favDrinks = value;
			this.controller.get("favDrinksList").mojo.noticeAddedItems(0,this.favDrinks);
		}else{
			Mojo.Log.info("db returned no favorite drinks. That shouldn't happen");
		}
	}.bind(this));
	
};

FavDrinksAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	Mojo.Log.info("Setting fav-drink event listeners");
	this.favDrinksList = this.controller.get("favDrinksList");
	
	this.drinkTapHandler = this.handleDrinkTap.bind(this);
	Mojo.Event.listen(this.favDrinksList, Mojo.Event.listTap, this.drinkTapHandler);
};

FavDrinksAssistant.prototype.handleDrinkTap = function(event){
	var favDrink = event.item;
	var newDrink = {};
	newDrink.name = favDrink.name;
	newDrink.abv = favDrink.abv;
	Mojo.Controller.stageController.popScene(newDrink);
}

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
