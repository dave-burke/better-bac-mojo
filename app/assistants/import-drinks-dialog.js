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
function ImportDrinksDialogAssistant(sceneAssistant, newDrinks, importedDrinks) {
	Mojo.Log.info("Hello?");
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	this.currentDrinks = sceneAssistant.favDrinks;
	this.newDrinks = newDrinks;
	this.importedDrinks = importedDrinks;
}

ImportDrinksDialogAssistant.prototype.setup = function(){
	this.widget = widget;
	
	this.controller.setupWidget("newDrinksCheck",
	    this.attributes = {},
	    this.newDrinksCheckModel = {
	        value: true
	    }
	);
	//Mojo.Event.listen(this.controller.get("newDrinksCheck"), Mojo.Event.propertyChange, this.handleNewDrinksCheck);
	
	this.controller.setupWidget("updatedDrinksCheck",
		this.attributes = {},
	    this.updatedDrinksCheckModel = {
	        value: true
	    }
	);
	//Mojo.Event.listen(this.controller.get("updatedDrinksCheck"), Mojo.Event.propertyChange, this.handleUpdatedDrinksCheck);
	
	this.sceneAssistant.controller.setupWidget("okButton",
		this.attributes = {},
		this.okButotnModel = {
			buttonLabel: "Import selected",
	    }
	);
	Mojo.Event.listen("okButton", Mojo.Event.tap, this.submit);
};

ImportDrinksDialogAssistant.prototype.submit = function(){
	Mojo.Log.info("Import new = " + this.newDrinksCheckModel.value);
	Mojo.Log.info("Import updated = " + this.updatedDrinksCheckModel.value);
	this.widget.mojo.close();
};