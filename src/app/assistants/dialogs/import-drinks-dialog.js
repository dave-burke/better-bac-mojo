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
function ImportDrinksDialogAssistant(sceneAssistant, imported, callback) {
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	this.callback = callback;
	sceneAssistant.favDrinks = sceneAssistant.favDrinks;
	
	this.prefs = sceneAssistant.prefs;
	
	this.drinkMap = {};
	this.newDrinks = [];
	this.updatedDrinks = [];
	this.invalidDrinks = 0;
	
	//Analyze imports
	var drinks = sceneAssistant.favDrinks;
	for (var i=0;i<drinks.length;i++) {
		this.drinkMap[drinks[i].name]=drinks[i];
	}
	
	for(var i = 0;i<imported.length;i++){
		var drink = imported[i];
		if(this.isValid(drink)){
			var existing = this.drinkMap[drink.name];
			if(existing){
				if(drink.abv != existing.abv){
					Mojo.Log.info("%s already exists, but has a different abv",drink.name);
					//TODO check updated date?
					this.updatedDrinks.push(drink);
				}
			}else{
				Mojo.Log.info("%s does not exist",drink.name);
				drink.count = 0;
				drink.lastTime = 0;
				this.newDrinks.push(drink);
			}
		}else{
			this.invalidDrinks++;
		}
	}
}

ImportDrinksDialogAssistant.prototype.isValid = function(drink){
	if(drink.name === undefined){
		return false;
	}
	if(drink.abv === undefined || isNaN(drink.abv) || drink.abv <= 0){
		return false;
	}
	if (drink.vol === undefined || isNaN(drink.vol) || drink.vol <= 0) {
		return false;
	}
	if(drink.updated === undefined || isNaN(drink.updated) || drink.updated <= 0){
		return false;
	}
	return true;
};

ImportDrinksDialogAssistant.prototype.setup = function(widget){
	this.widget = widget;
	
	if(this.updatedDrinks.length == 0 && this.newDrinks.length == 0){
		this.widget.mojo.close();
		this.callback("No updates found. You have all the latest A.B.V. data.");
	}else{
		this.controller.setupWidget("newDrinksCheck",
		    this.attributes = {},
		    this.newDrinksCheckModel = {
		        value: this.prefs.importNew
		    }
		);
		
		this.controller.setupWidget("updatedDrinksCheck",
			this.attributes = {},
		    this.updatedDrinksCheckModel = {
		        value: this.prefs.importUpdated
		    }
		);
		
		this.controller.setupWidget("okButton",
			this.attributes = {},
			this.okButtonModel = {
				buttonLabel: "Import selected"
		    }
		);
		this.controller.get('okButton').addEventListener(Mojo.Event.tap, this.submit.bindAsEventListener(this));
		
		this.controller.setupWidget("cancelButton",
			this.attributes = {},
			this.okButtonModel = {
				buttonLabel: "Cancel"
			}
		);
		this.controller.get('cancelButton').addEventListener(Mojo.Event.tap, this.cancel.bindAsEventListener(this));
		
		this.controller.get("newDrinksText").update(this.newDrinks.length + " new drinks");
		this.controller.get("updatedDrinksText").update(this.updatedDrinks.length + " updated drinks");
	}
};

ImportDrinksDialogAssistant.prototype.submit = function(){
	var doNew = this.newDrinksCheckModel.value;
	var doUpdated = this.updatedDrinksCheckModel.value;
	Mojo.Log.info("Import new = " + doNew);
	Mojo.Log.info("Import updated = " + doUpdated);
	if(!doNew){
		this.newDrinks = false;
	}
	if(!doUpdated){
		this.updatedDrinks = false;
	}
	//this.sceneAssistant.doImport(this.newDrinks, this.updatedDrinks);
	Mojo.Log.info("Updated: " + this.updatedDrinks);
	Mojo.Log.info("New: " + this.newDrinks);
	if(this.updatedDrinks){
		Mojo.Log.info("Updating drinks");
		for(var i = 0;i<this.updatedDrinks.length;i++){
			var updatedDrink = this.updatedDrinks[i];
			this.drinkMap[updatedDrink.name] = updatedDrink;
		}
		this.sceneAssistant.favDrinks = [];
		for (drinkName in this.drinkMap) {
			this.sceneAssistant.favDrinks.push(this.drinkMap[drinkName]);
		}
	}
	if(this.newDrinks){
		Mojo.Log.info("Adding new drinks");
		this.sceneAssistant.favDrinks = this.sceneAssistant.favDrinks.concat(this.newDrinks);
	}
	this.sceneAssistant.updateDrinksList();
	this.controller.get("favDrinksList").mojo.noticeUpdatedItems(0,this.sceneAssistant.favDrinks);
	Mojo.Controller.getAppController().showBanner("You now have " + this.sceneAssistant.favDrinks.length + " saved drinks.", {source: 'notification'});

	this.saveAndClose(doNew, doUpdated);
};

ImportDrinksDialogAssistant.prototype.cancel = function(){
	Mojo.Log.info("Cancelled import");
	var doNew = this.newDrinksCheckModel.value;
	var doUpdated = this.updatedDrinksCheckModel.value;
	this.saveAndClose(doNew, doUpdated);
};

ImportDrinksDialogAssistant.prototype.saveAndClose = function(doNew, doUpdated){
	this.prefs.importNew = doNew;
	this.prefs.importUpdated = doUpdated;
	this.sceneAssistant.db.savePrefs(this.prefs);
	this.widget.mojo.close();
	this.callback();
};