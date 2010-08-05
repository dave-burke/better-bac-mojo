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
function DateUtils() {
}

DateUtils.prototype.formatTime = function(date){
	var minutes = String(date.getMinutes());
	if(minutes.length == 1){
		minutes = "0" + minutes;
	}
	var hours = date.getHours();
	if(hours >= 12){
		if (hours > 12) {
			hours = hours - 12;
		}
		return hours + ":" + minutes + " PM";
	}else{
		return hours + ":" + minutes + " AM";
	}
}

DateUtils.prototype.formatDate = function(date, withYear){
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var year = date.getFullYear();
	
	var dateString = month + "/" + day;
	if(withYear){
		dateString += "/" + year;
	}
	return dateString;
}

DateUtils.prototype.formatDateTime = function(date, withYear){
	var dateString = this.formatDate(date, withYear);
	var timeString = this.formatTime(date, withYear);
	return dateString + " " + timeString;
}
