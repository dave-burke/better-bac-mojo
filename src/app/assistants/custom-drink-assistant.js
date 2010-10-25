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
function CustomDrinkAssistant(prefs, templateDrink) {
	this.convUtils = new ConversionUtils();
	
	if(prefs){
		Mojo.Log.info("Received prefs %j",prefs);
		this.prefs = prefs;
	}else{
		Mojo.Log.error("No prefs!");
	}
	
	if (templateDrink) {
		//TODO remove this block from catalog version
		if(!templateDrink.units){
			Mojo.Log.info("No units on template drink. Default to oz");
			templateDrink.units = "oz";
		}else{
			Mojo.Log.info("Template drink already has units: " + templateDrink.units);
		}
		this.newDrinkModel = {
			"name": templateDrink.name,
			"abv": templateDrink.abv,
			"vol": templateDrink.vol,
			"units": templateDrink.units,
			"bac": 0,
			"origBac": 0,
			"time": new Date().getTime()
		}
		Mojo.Log.info("Got template: %j", this.newDrinkModel);
	}else {
		this.newDrinkModel = {
			"name": "",
			"abv": 0,
			"vol": 0,
			"bac": 0,
			"origBac": 0,
			"bacWhenAdded": 0,
			"time": new Date().getTime()
		};
		if(this.prefs.units == "metric"){
			this.newDrinkModel.units = "ml";
		}else{
			this.newDrinkModel.units = "oz";
		}
	}
}

CustomDrinkAssistant.prototype.setup = function() {
	this.bacUtils = new BacUtils();
	
	// Set up drink name field
	this.controller.setupWidget("drinkNameField",
		this.attributes = {
			modelProperty: 'name',
			hintText: $L('Drink name'),
			textCase: Mojo.Widget.steModeTitleCase,
			focusMode: Mojo.Widget.focusSelectMode
		},
		this.newDrinkModel
	);
	
	// Set up drink ABV field
	this.controller.setupWidget("drinkAbvField",
		this.attributes = {
			modelProperty: 'abv',
			//hintText: $L('Alcohol By Volume'),
			modifierState: Mojo.Widget.numLock
		},
		this.newDrinkModel
	);
	
	// Set up drink vol field
	this.controller.setupWidget("drinkVolField",
		this.attributes = {
			modelProperty: 'vol',
			//hintText: $L('Volume'),
			focusMode: Mojo.Widget.focusSelectMode,
			modifierState: Mojo.Widget.numLock
		},
		this.newDrinkModel
	);
	
	this.controller.setupWidget("drinkUnitToggle",
	        this.attributes = {
				modelProperty: "units",
	            trueValue: "ml",
	            trueLabel: "ml",
	            falseValue: "oz",
	            falseLabel: "oz"
	        },
	        this.newDrinkModel
	    );
	
	this.controller.setupWidget("drinkTimePicker",
		this.attributes = {
			label: 'Time'
		},
		this.model = {
			time: new Date()
		}
	);
	
	// Set up submit button
	this.controller.setupWidget("submitButton",
		this.attributes = {},
		this.model = {
			label : "Add Drink"
		}
	);
	
	this.appMenuAttr = {
		omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
			{ label: "About", command: 'do-myAbout'},
			{ label: "Help for this scene", command: 'do-help-custom-drink'},
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);

	this.updateDrinkInfo();
}

CustomDrinkAssistant.prototype.activate = function(templateDrink) {
	Mojo.Log.info("Setting new drink listeners");
	//TODO keyPress
	this.updateDrinkInfoHandler = this.updateDrinkInfo.bind(this);
	//this.controller.listen(this.controller.sceneElement, Mojo.Event.keypress, this.updateDrinkInfoHandler);
	Mojo.Event.listen(this.controller.get("drinkAbvField"), Mojo.Event.propertyChange, this.updateDrinkInfoHandler);
	Mojo.Event.listen(this.controller.get("drinkVolField"), Mojo.Event.propertyChange, this.updateDrinkInfoHandler);
	
	this.changeUnitsHandler = this.changeUnits.bind(this);
	Mojo.Event.listen(this.controller.get("drinkUnitToggle"), Mojo.Event.propertyChange, this.changeUnitsHandler);
	
	this.changeTimeHandler = this.changeTime.bind(this);
	Mojo.Event.listen(this.controller.get("drinkTimePicker"), Mojo.Event.propertyChange, this.changeTimeHandler);
	
	this.submitHandler = this.submit.bind(this);
	Mojo.Event.listen(this.controller.get("submitButton"), Mojo.Event.tap, this.submitHandler);
	
	if(this.newDrinkModel.name.length > 0){
		Mojo.Log.info("Popped with template drink!");
		this.controller.get("drinkVolField").mojo.focus();
	}else{
		Mojo.Log.info("No template drink");
		this.controller.get("drinkNameField").mojo.focus();
	}
}

CustomDrinkAssistant.prototype.updateDrinkInfo = function(event){
	Mojo.Log.info("Drink info updated");
	if(!isNaN(this.newDrinkModel.abv) && this.newDrinkModel.abv > 0 &&
			!isNaN(this.newDrinkModel.vol) && this.newDrinkModel.vol > 0){
		var abvDelta = this.bacUtils.calcBacIncrease(this.prefs, this.newDrinkModel);
		abvDelta = this.bacUtils.roundBac(abvDelta);
		var timeDelta = this.bacUtils.calcTimeTo(abvDelta, 0, true);
		//var selectedTime = this.newDrinkModel.time;
		var text = "This drink will add " + abvDelta + " to your BAC. ";
		text += "It will add " + timeDelta + " to the time it takes your B.A.C. to reach zero.";
		this.controller.get("drinkInfo").innerHTML = text;
	}else{
		this.controller.get("drinkInfo").innerHTML = "";
	}
}

CustomDrinkAssistant.prototype.changeUnits = function(event){
	//This shouldn't really be necessary? units is always "oz" but event.value is always correct?
	Mojo.Log.info("Units are " + this.newDrinkModel.units);
	if(this.newDrinkModel.units == "ml"){
		var oz = this.newDrinkModel.vol;
		var ml = this.convUtils.ozToMl(oz);
		Mojo.Log.info("Converting " + oz + "oz to " + ml + "ml");
		this.newDrinkModel.vol = ml;
	}else{
		var ml = this.newDrinkModel.vol;
		var oz = this.convUtils.mlToOz(ml);
		Mojo.Log.info("Converting " + ml + "ml to " + oz + "oz");
		this.newDrinkModel.vol = oz;
	}
	this.controller.modelChanged(this.newDrinkModel);
}

CustomDrinkAssistant.prototype.changeTime = function(event){
	var currentTime = new Date().getTime();
	var selectedTime = event.value.getTime();
	
	var timeDelta = currentTime - selectedTime;
	
	if(timeDelta < 0){
		// time should always be in the past
		selectedTime = selectedTime - 86400000;
	}
	Mojo.Log.info("New Time is ", new Date(selectedTime));
	this.newDrinkModel.time = selectedTime;
}

CustomDrinkAssistant.prototype.submit = function(event){
	this.newDrinkModel.bac = this.bacUtils.calcBacIncrease(this.prefs, this.newDrinkModel);
	this.newDrinkModel.origBac = this.newDrinkModel.bac;
	Mojo.Controller.stageController.popScene(this.newDrinkModel);
}

CustomDrinkAssistant.prototype.deactivate = function(event) {
	Mojo.Log.info("Clearing new drink listeners");
	//this.controller.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.updateDrinkInfoHandler);
	Mojo.Event.stopListening(this.controller.get("drinkAbvField"), Mojo.Event.propertyChange, this.updateDrinkInfoHandler);
	Mojo.Event.stopListening(this.controller.get("drinkVolField"), Mojo.Event.propertyChange, this.updateDrinkInfoHandler);
	Mojo.Event.stopListening(this.controller.get("drinkUnitToggle"), Mojo.Event.propertyChange, this.changeUnitsHandler);
	Mojo.Event.stopListening(this.controller.get("drinkTimePicker"), Mojo.Event.propertyChange, this.changeTimeHandler);
	Mojo.Event.stopListening(this.controller.get("submitButton"), Mojo.Event.tap, this.submitHandler);
}

CustomDrinkAssistant.prototype.cleanup = function(event) {
	/*
	 * this function should do any cleanup needed before the scene is destroyed
	 * as a result of being popped off the scene stack
	 */
}
