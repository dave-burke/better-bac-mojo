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
	if(prefs){
		Mojo.Log.info("Received prefs %j",prefs);
		this.prefs = prefs;
	}else{
		Mojo.Log.error("No prefs!");
	}
	
	if (templateDrink) {
		this.newDrinkModel = {
			"name": templateDrink.name,
			"abv": templateDrink.abv,
			"vol": templateDrink.vol,
			"bac": 0,
			"origBac": 0,
			"time": new Date().getTime()
		}
		Mojo.Log.info("Got template: %j", this.newDrinkModel);
	}
	else {
		this.newDrinkModel = {
			"name": "",
			"abv": 0,
			"vol": 0,
			"bac": 0,
			"origBac": 0,
			"bacWhenAdded": 0,
			"time": new Date().getTime()
		};
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
            hintText: $L('Alcohol By Volume'),
			modifierState: Mojo.Widget.numLock
        },
        this.newDrinkModel
	);
	
	// Set up drink vol field
	this.controller.setupWidget("drinkVolField",
        this.attributes = {
			modelProperty: 'vol',
            hintText: $L('Volume (in oz.)'),
            focusMode: Mojo.Widget.focusSelectMode,
			modifierState: Mojo.Widget.numLock
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
}

CustomDrinkAssistant.prototype.activate = function(templateDrink) {
	Mojo.Log.info("Setting new drink listeners");
	
	this.submitButton = this.controller.get("submitButton");
	this.submitHandler = this.submit.bind(this);
	Mojo.Event.listen(this.submitButton, Mojo.Event.tap, this.submitHandler);
	
	this.drinkTimePicker = this.controller.get("drinkTimePicker");
	this.timeChangeHandler = this.changeTime.bind(this);
	Mojo.Event.listen(this.drinkTimePicker, Mojo.Event.propertyChange, this.timeChangeHandler);
	
	if(this.newDrinkModel.name.length > 0){
		Mojo.Log.info("Popped with template drink!");
		this.controller.get("drinkVolField").mojo.focus();
	}else{
		Mojo.Log.info("No template drink");
		this.controller.get("drinkNameField").mojo.focus();
	}
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
	Mojo.Event.stopListening(this.submitButton, Mojo.Event.tap, this.submitHandler);
	Mojo.Event.stopListening(this.drinkTimePicker, Mojo.Event.propertyChange, this.timeChangeHandler);
}

CustomDrinkAssistant.prototype.cleanup = function(event) {
	/*
	 * this function should do any cleanup needed before the scene is destroyed
	 * as a result of being popped off the scene stack
	 */
}
