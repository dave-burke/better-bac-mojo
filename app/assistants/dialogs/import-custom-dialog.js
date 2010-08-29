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
function ImportCustomDialogAssistant(sceneAssistant, callback) {
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	this.callback = callback;
}

ImportCustomDialogAssistant.prototype.setup = function(widget){
	this.widget = widget;
	
	this.controller.setupWidget("urlField",
	        this.attributes = {
				hintText: $L("URL or file path"),
				textCase: Mojo.Widget.steModeLowerCase,
				autoFocus: true
			},
			this.urlFieldModel= {
				value: ""
			}
		);
	
	this.controller.setupWidget("okButton",
		this.attributes = {},
		this.okButtonModel = {
			buttonLabel: "Import selected",
	    }
	);
	this.controller.get('okButton').addEventListener(Mojo.Event.tap, this.submit.bindAsEventListener(this));
	
	this.controller.setupWidget("cancelButton",
		this.attributes = {},
		this.okButtonModel = {
			buttonLabel: "Cancel",
		}
	);
	this.controller.get('cancelButton').addEventListener(Mojo.Event.tap, this.cancel.bindAsEventListener(this));
};

ImportCustomDialogAssistant.prototype.submit = function(){
	var url = this.urlFieldModel.value;
	this.callback(url);
	this.widget.mojo.close();
};

ImportCustomDialogAssistant.prototype.cancel = function(){
	Mojo.Log.info("Cancelled import");
	this.widget.mojo.close();
};