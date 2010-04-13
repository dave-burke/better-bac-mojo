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
function PrefsAssistant(db, prefs) {
	this.db = db;
	this.prefs = prefs;
}

PrefsAssistant.prototype.savePrefs = function(){
	if(isNaN(this.prefs.height)){
		Mojo.Controller.errorDialog("Height must be a number");
		this.prefs.height = 68;
	}
	if(this.prefs.height < 1.0){
		this.prefs.height = 1.0;
	}
	if(this.prefs.height > 120){
		this.prefs.height = 120;
	}
	
	if(isNaN(this.prefs.weight)){
		Mojo.Controller.errorDialog("Weight must be a number");
		this.prefs.weight = 180;
	}
	if(this.prefs.weight < 1.0){
		this.prefs.weight = 1.0;
	}
	if(this.prefs.weight > 1000){
		this.prefs.weight = 1000;
	}
	
	if(this.prefs.age < 0){
		this.prefs.age = 0;
	}
	if(this.prefs.age > 120){
		this.prefs.age = 120;
	}
	
	if(isNaN(this.prefs.limit)){
		Mojo.Controller.errorDialog("Limit must be a number");
		this.prefs.limit = 0.08;
	}
	if(this.prefs.limit < 0){
		this.prefs.limit = 0;
	}
	if(this.prefs.limit > 1){
		this.prefs.limit = 1;
	}
	this.db.add("prefs", this.prefs, this.onSavePrefsSuccess.bind(this), this.onSavePrefsFailure.bind(this));
	this.controller.modelChanged(this.prefs);
}

PrefsAssistant.prototype.onSavePrefsSuccess = function(){
	Mojo.Log.info("Successfully saved prefs");
}

PrefsAssistant.prototype.onSavePrefsFailure = function(){
	Mojo.Log.info("FAILED TO SAVE PREFS");
}

PrefsAssistant.prototype.setup = function() {
	
	Mojo.Log.info("Setting up widgets");
	this.controller.setupWidget("genderSelector",
        this.attributes = {
			modelProperty: "gender",
			label: $L("Gender"),
            choices: [
                {label: $L("Male"), value: "m"},
                {label: $L("Female"),value: "f"},
            ],
		},
        this.prefs
    );
	
	this.controller.setupWidget("heightField",
        this.attributes = {
			modelProperty: "height",
			modifierState: Mojo.Widget.numLock,
        },
		this.prefs
	);
	
	this.controller.setupWidget("weightField",
        this.attributes = {
			modelProperty: "weight",
			modifierState: Mojo.Widget.numLock,
        },
		this.prefs
	);
	
	this.controller.setupWidget("agePicker",
		this.attributes = {
			modelProperty: "age",
			label: $L("Age:"),
	        min: 18,
	        max: 99
		},
	    this.prefs
	);
	
	this.controller.setupWidget("limitField",
        this.attributes = {
			modelProperty: "limit",
			modifierState: Mojo.Widget.numLock,
        },
		this.prefs
	);
	
	this.controller.setupWidget("calcSelector",
        this.attributes = {
			modelProperty: "calc",
			label: $L("Calc method"),
            choices: [
                {label: "Widmark", value: "widmark"},
                {label: "Watson",value: "watson"},
            ],
		},
        this.prefs
    );
	
	this.controller.setupWidget("historyMaxDaysPicker",
		this.attributes = {
			modelProperty: "historyMaxDays",
			label: $L("Max history days:"),
	        min: 1,
	        max: 31
		},
	    this.prefs
	);
	
	this.controller.setupWidget("historyMaxLengthPicker",
		this.attributes = {
			modelProperty: "historyMaxLength",
			label: $L("Max history items:"),
	        min: 0,
	        max: 100,
		},
	    this.prefs
	);
	
	this.controller.setupWidget("doneButton",
        this.attributes = {
            },
        this.model = {
            label : "Done",
        }
	);
	
	this.appMenuAttr = {
	    omitDefaultItems: true
	};
	this.appMenuModel = {
		visible: true,
		items: [ 
		    { label: "About", command: 'do-myAbout'},
		    { label: "Help for this scene", command: 'do-help-prefs'},
	    ]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttr, this.appMenuModel);
	
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
	Mojo.Event.listen(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.saveHandler);
	
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
	Mojo.Event.stopListening(this.controller.get("limitField"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("calcSelector"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("historyMaxDaysPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("historyMaxLengthPicker"), Mojo.Event.propertyChange, this.saveHandler);
	Mojo.Event.stopListening(Mojo.Controller.stageController.document, Mojo.Event.stageDeactivate, this.saveHandler);
	Mojo.Event.stopListening(this.controller.get("doneButton"),Mojo.Event.tap, this.doneButtonHandler);
}
