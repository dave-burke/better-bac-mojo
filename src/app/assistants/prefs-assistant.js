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
function PrefsAssistant(dbUtils, prefs) {
	this.dbUtils = dbUtils;
	this.prefs = prefs;
	this.convUtils = new ConversionUtils();
}

PrefsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Setting up widgets");
	this.controller.setupWidget("genderSelector",
        this.attributes = {
			modelProperty: "gender",
			label: $L("Gender"),
            choices: [
                {label: $L("Male"), value: "m"},
                {label: $L("Female"),value: "f"}
            ]
		},
        this.prefs
    );
	
	this.controller.setupWidget("heightField",
        this.attributes = {
			modelProperty: "height",
			modifierState: Mojo.Widget.numLock
        },
		this.prefs
	);
	
	this.controller.setupWidget("weightField",
        this.attributes = {
			modelProperty: "weight",
			modifierState: Mojo.Widget.numLock
        },
		this.prefs
	);
	
	this.controller.setupWidget("agePicker",
		this.attributes = {
			modelProperty: "age",
			label: $L(" "),
	        min: 18,
	        max: 99
		},
	    this.prefs
	);
	
	this.controller.setupWidget("unitsSelector",
        this.attributes = {
			modelProperty: "units",
			label: $L("Units"),
            choices: [
                {label: "Imperial", value: "imperial"},
                {label: "Metric",value: "metric"}
            ]
		},
        this.prefs
    );

	this.controller.setupWidget("limitField",
        this.attributes = {
			modelProperty: "limit",
			modifierState: Mojo.Widget.numLock
        },
		this.prefs
	);
	
	this.controller.setupWidget("calcSelector",
        this.attributes = {
			modelProperty: "calc",
			label: $L("Calc method"),
            choices: [
                {label: "Widmark", value: "widmark"},
                {label: "Watson",value: "watson"}
            ]
		},
        this.prefs
    );
	
	this.controller.setupWidget("historyMaxDaysPicker",
		this.attributes = {
			modelProperty: "historyMaxDays",
			label: $L(" "),
	        min: 1,
	        max: 31
		},
	    this.prefs
	);
	
	this.controller.setupWidget("historyMaxLengthPicker",
		this.attributes = {
			modelProperty: "historyMaxLength",
			label: $L(" "),
	        min: 0,
	        max: 100
		},
	    this.prefs
	);
	
	this.controller.setupWidget("alarmToggle",
		this.attributes = {
			modelProperty: "alarms" 
		},
		this.prefs
	);
	
	this.controller.setupWidget("doneButton",
        this.attributes = {
            },
        this.model = {
            label : "Done"
        }
	);
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
		    { label: "About", command: 'do-myAbout'},
		    { label: "Help for this scene", command: 'do-help-prefs'}
	    ]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);

	this.setLabels();
}

PrefsAssistant.prototype.savePrefs = function(event){
	this.dbUtils.savePrefs(this.prefs);
	this.controller.modelChanged(this.prefs);
}

PrefsAssistant.prototype.setLabels = function(){
	if(this.prefs.units == "metric"){
		this.controller.get("heightLabel").innerHTML = "Height (in cm)";
		this.controller.get("weightLabel").innerHTML = "Height (in kg)";
	}else{
		this.prefs.units == "imperial";
		this.controller.get("heightLabel").innerHTML = "Height (in inches)";
		this.controller.get("weightLabel").innerHTML = "Height (in lbs)";
	}
}

PrefsAssistant.prototype.changeUnits = function(event){
	this.setLabels();
	Mojo.Log.info("Prefs=%j",this.prefs);
	if(this.prefs.units == "metric"){
		//convert imperial to metric
		var inches = this.prefs.height;
		var cm = this.convUtils.inToCm(inches);
		Mojo.Log.info("Height was " + inches + "in but is now " + cm + "cm");
		this.prefs.height = cm;

		var lbs = this.prefs.weight;
		var kg = this.convUtils.lbsToKg(lbs);
		Mojo.Log.info("Weight was " + lbs + "lbs but is now " + kg + "kg");
		this.prefs.weight = kg;
	}else{
		//convert metric to imperial
		var cm = this.prefs.height;
		var inches = this.convUtils.cmToIn(cm);
		Mojo.Log.info("Height was " + cm + "cm but is now " + inches + "in");
		this.prefs.height = inches;

		var kg = this.prefs.weight;
		var lbs = this.convUtils.kgToLbs(kg);
		Mojo.Log.info("Weight was " + kg + "kg but is now " + lbs + "lbs");
		this.prefs.weight = lbs;
	}
	this.savePrefs();
}

PrefsAssistant.prototype.activate = function(event){
	Mojo.Log.info("Setting prefs event listeners");
	this.saveHandler = this.savePrefs.bind(this);
	Mojo.Event.listen(this.controller.get("genderSelector"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("heightField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("weightField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("agePicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("limitField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("calcSelector"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("historyMaxDaysPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("historyMaxLengthPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(this.controller.get("alarmToggle"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.listen(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.saveHandler);

	this.changeUnitsHandler = this.changeUnits.bind(this);
	Mojo.Event.listen(this.controller.get("unitsSelector"), Mojo.Event.propertyChange, this.changeUnitsHandler);
	
	this.doneButtonHandler = this.handleDoneButton.bind(this);
	Mojo.Event.listen(this.controller.get("doneButton"),Mojo.Event.tap, this.doneButtonHandler);
}

PrefsAssistant.prototype.handleDoneButton = function(event){
	Mojo.Controller.stageController.popScene();
}

PrefsAssistant.prototype.deactivate = function(){
	Mojo.Log.info("Clearing prefs event listeners");
	Mojo.Event.stopListening(this.controller.get("genderSelector"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("heightField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("weightField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("agePicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("unitsSelector"), Mojo.Event.propertyChange, this.changeUnitsHandler);
	Mojo.Event.stopListening(this.controller.get("limitField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("calcSelector"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("historyMaxDaysPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("historyMaxLengthPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("alarmToggle"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("doneButton"),Mojo.Event.tap, this.doneButtonHandler);
}
