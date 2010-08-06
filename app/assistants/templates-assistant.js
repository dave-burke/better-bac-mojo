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
function TemplatesAssistant(dbUtils) {
	this.dbUtils = dbUtils;
	this.dbUtils.getTemplates(function(value){
		this.templates = value;
		if(!this.templates){
			var beer = {
					name: "Beer",
					abv: 5,
					vol: 12
			}
			var wine = {
					name: "Wine",
					abv: 12,
					vol: 4
			}
			var shot = {
					name: "Shot",
					abv: 1.5,
					vol: 35
			}
			var cocktail = {
					name: "Cocktail",
					abv: 15,
					vol: 5
			}
			this.templates = [beer,wine,shot,cocktail];
		}else{
			Mojo.Log.info("Got templates: %j",this.templates);
		}
	}.bind(this));
}

TemplatesAssistant.prototype.setup = function() {
	this.controller.setupWidget("templateList",
			this.attributes = {
				itemTemplate: "templates/drink-list-entry",
				listTemplate: "templates/drink-list-container",
				formatters:{
					name:this.formatUtils.formatName,
					abv:this.formatUtils.formatAbv,
					vol:this.formatUtils.formatVol,
				},
				swipeToDelete: true,
				reorderable: true
			},
			this.model = {
				listTitle: $L("Favorite Drinks"),
				items: this.state.drinks
			}
		);
};

TemplatesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

TemplatesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TemplatesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
