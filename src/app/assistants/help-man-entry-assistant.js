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
function HelpManEntryAssistant(title, scene) {
	this.title = title;
	this.scene = scene;
};

/* this function is for setup tasks that have to happen when the scene is first created use
 * Mojo.View.render to render view templates and add them to the scene, if needed setup widgets here
 * add event handlers to listen to events from widgets */
HelpManEntryAssistant.prototype.setup = function() {
	this.scene = 'help-man-entry/entries/' + this.scene;
	
	Mojo.Log.info('Loading scene ' + this.scene);
	this.controller.setupWidget('entry',
		{
			itemTemplate: this.scene,
			swipeToDelete: false,
			reorderable: false
		},
		{
			items: [{'foo':'bar'}]
		}
	);

	this.controller.get('title').innerHTML = this.title;
};
