
function CalendarEvent(id, owner, title, location, sDate, eDate, sTime, eTime, repeat, description)
{
	this.id = id;
	this.owner = owner;
	this.title = title;
	this.location = location;
	this.sDate = sDate;
	this.eDate = eDate;
	this.sTime = sTime;
	this.eTime = eTime;
	this.repeat = repeat;
	this.description = description;
	this.html = "<div class = 'event' id = '" + this.id + "'>"
					+ "<h4 id ='title'>" + this.title + "</h4>" 
					+ "<a>" + this.sTime + " - " + this.eTime + "</a><br>"
					+ "<a>" + this.location + "</a><br>"
				+ "</div>"
}
function EventDate(stringDate)
{
	if(typeof stringDate === "string")
	{
		var split = String(stringDate).split("/");
		this.day = split[1];
		this.month = split[0];
		this.year = split[2];
	}
	else
	{
		this.month = (stringDate.getMonth()+1)+"";
		this.day = stringDate.getDate()+"";
		this.year = stringDate.getFullYear()+"";
	}
}
EventDate.prototype.toString = function()
{
	return this.month + "/" + this.day + "/" + this.year; 
}
function Time(stringTime)
{
	if(typeof stringTime === "string")
	{
		this.hour = stringTime.substring(0,stringTime.indexOf(":"));
		this.minute = stringTime.substring(stringTime.indexOf(":")+1,stringTime.indexOf(" "));
		if(stringTime.substring(stringTime.indexOf(" ")+1,stringTime.length) === "PM" && this.hour != 12)
		{
			this.hour = (parseInt(this.hour) + 12) + "";
		}
		else if(parseInt(this.hour) == 12 && stringTime.substring(stringTime.indexOf(" ")+1,stringTime.length) === "AM")
		{
			this.hour = "00";
		}
			
	}
	else if(typeof stringTime === "object")
	{
		this.hour = stringTime.hour;
		this.minute = stringTime.minute;
	}
}
Time.prototype.timeBetween = function(eTime)
{
	var minute = eTime.minute - this.minute;
	var hour = eTime.hour - this.hour;
	if(minute < 0)
	{
		minute += 60;
		hour -= 1
	}
	minute = minute / 60.0;
	hour += minute;
	return Math.abs(hour);
}
Time.prototype.before = function(otherTime)
{
	if(this.hour < otherTime.hour)
	{
		return true;
	}
	else if(this.hour == otherTime.hour && this.minute < otherTime.minute)
	{
		return true;
	}
	return false;
}
Time.prototype.toString = function()
{
	var toRet = this.convertTime();
	toRet = toRet.substring(0, toRet.indexOf(" ")) + this.minute + " " + toRet.substring(toRet.indexOf(" ") + 1, toRet.length);
	return toRet;
}
Time.prototype.convertTime = function()
{
	switch(parseInt(this.hour))
	{
		case 0: return "12: am";
		case 1: return "1: am";
		case 2: return "2: am";
		case 3: return "3: am";
		case 4: return "4: am";
		case 5: return "5: am";
		case 6: return "6: am";
		case 7: return "7: am";
		case 8: return "8: am";
		case 9: return "9: am";
		case 10: return "10: am";
		case 11: return "11: am";
		case 12: return "12: pm";
		case 13: return "1: pm";
		case 14: return "2: pm";
		case 15: return "3: pm";
		case 16: return "4: pm";
		case 17: return "5: pm";
		case 18: return "6: pm";
		case 19: return "7: pm";
		case 20: return "8: pm";
		case 21: return "9: pm";
		case 22: return "10: pm";
		case 23: return "11: pm";
		case 24: return "12: am";
		default: console.log(this.hour + " ERROR " + this.title); return "";
	}
}