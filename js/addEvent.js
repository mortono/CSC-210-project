var sessId;
var mode;
var eventID;
var meeting;
function logOut()
{
	$.removeCookie("id", {path: '/'});
}
function createEvent(arg) { //function that sends form data to python file 
    $.post("../cgi-bin/addEvent.py", arg, function (result) {
		if (result.indexOf("fillAllError") !== -1) {
			console.log(result);
			alert("Please fill out all of the event fields!");
		} else if (result.indexOf("eventCreated") !== -1) {
			window.location.href = "./dashboard.html";
		} else {
			alert("There was a problem. Please refresh and try again.");
			console.log(result);
		}
    });
}
function updateEvent(arg)
{
	var id = $.cookie("id");
	$.post("../cgi-bin/edit_event.py", arg, function (result)
	{
		if (result.indexOf("fillAllError") !== -1) 
		{
			alert("Please fill out all of the event fields!");
		} 
		else if (result.indexOf("eventCreated") !== -1) 
		{
			window.location.href = "./dashboard.html";
		} 
		else 
		{
			alert("There was a problem. Please refresh and try again.");
			console.log(result);
		}
    });
}
function createMeetingEvent(arg)
{
	    $.post("../cgi-bin/addMeetingEvent.py", arg, function (result) {
		if (result.indexOf("fillAllError") !== -1) {
			console.log(result);
			alert("Please fill out all of the event fields!");
		} else if (result.indexOf("eventCreated") !== -1) {
			window.location.href = "./dashboard.html";
		} else {
			alert("There was a problem. Please refresh and try again.");
			console.log(result);
		}
    });
}
function getData()
{
	var repeat = "";
	var endDate = null;
	var startDate = new EventDate($("#sDatePicker")[0].value);
	if($("#repeat").is(":checked"))
	{
		var date = new Date(startDate.toString());
		for(var i = 0; i < $(".dayBox").length; i++)
		{
			if($($(".dayBox")[i]).is(":checked"))
			{
				repeat += $("#repeatTime")[0].value;
			}
			else
			{
				repeat += "0";
			}
		}
		if(getFirstNotZero(repeat) > date.getDay())
		{
			date.setDate(date.getDate() + getFirstNotZero(repeat));
		}
		startDate = new EventDate(date);
		if($("#eDatePicker")[0].value == "")
		{
			endDate = new EventDate(startDate.month + "/" + startDate.day + "/" + (parseInt(startDate.year) + 10));
		}
		else
		{
			endDate = new EventDate($("#eDatePicker")[0].value);
		}
	}
	else
	{
		repeat = "0000000";
		endDate = startDate;
	}
	var event = {
		 "id": eventID,
		 "owner": $("#myEmail")[0].text.trim(),
		 "title": $("#name")[0].value,
		 "location": $("#location")[0].value,
		 "sDate": startDate.toString(),
		 "eDate": endDate.toString(),
		 "sTime": $("#sTimePicker")[0].value.toUpperCase(),
		 "eTime": $("#eTimePicker")[0].value.toUpperCase(),
		 "repeat": repeat,
		 "description": $("#descriptionBox")[0].value.trim()
		};
	if(mode == "create")
	{
		createEvent(event);
	}
	else if(mode == "edit")
	{
		updateEvent(event);
	}
	else
	{
		event.guestList = meeting.guestList;
		event.mid = meeting.mid;
		console.log(event);
		createMeetingEvent(event);
	}
	return event;
}

function getEventFromURL()
{
	var url_string = window.location.href;
	var url = new URL(url_string);
	mode = url.searchParams.get("mode");
	if(mode == "edit")
	{
		var c = url.searchParams.get("event");
		var event = JSON.parse(c);
		$('.timepicker').timepicker({
			timeFormat: 'hh:mm p',
		    interval: 15,
		    minTime: '12:00am',
		    maxTime: '11:45pm',
		    defaultTime: '11',
		    startTime: '12:00am',
		    scrollDefault: '11:00am',
		    dynamic: false,
		    dropdown: true,
		    scrollbar: false
		});
		$("#name")[0].value = event.title;
		$("#location")[0].value = event.location;
		$("#sDatePicker")[0].value = event.sDate.month + "/" + event.sDate.day + "/" + event.sDate.year;
		$("#eDatePicker")[0].value = event.eDate.month + "/" + event.eDate.day + "/" + event.eDate.year;
		$("#sTimePicker")[0].value = new Time(event.sTime).toString().toUpperCase();
		$("#eTimePicker")[0].value = new Time(event.eTime).toString().toUpperCase();
		$("#descriptionBox")[0].value = event.description;
		if(event.repeat != 0)
		{
			$("#repeat").prop("checked", true);
			$("#repeatTable").toggle();
			for(var i = 0; i < $(".dayBox").length; i++)
			{
				$(".dayBox")[i].checked = event.repeat.charAt(i) != "0";
				if(event.repeat.charAt(i) != "0")
				{
					$("#repeatTime")[0].value = parseInt(event.repeat.charAt(i));
				}
			}
		}
		$("#main h1")[0].innerText = "Edit Event";
		$("#submit")[0].value = "Update Event";
		update = true;
		eventID = event.id;
	}
	else if(mode == "meeting")
	{
		$("#repeat").parent().hide();
		$("#repeat").hide();
		var c = url.searchParams.get("meeting");
		meeting = JSON.parse(c);
		$('.timepicker').timepicker({
			timeFormat: 'hh:mm p',
		    interval: 15,
		    minTime: new Time(meeting.sTime).toString().replace(" ", ""),
		    maxTime: new Time(meeting.eTime).toString().replace(" ", ""),
		    defaultTime: '11',
		    startTime: new Time(meeting.sTime).toString().replace(" ", ""),
		    scrollDefault: '11:00am',
		    dynamic: false,
		    dropdown: true,
		    scrollbar: false
		});
		$("#main h1")[0].innerText = "New Event for "  + meeting.title;
		console.log(meeting);
		$("#name")[0].value = meeting.title;
		$("#location")[0].value = meeting.location;
		$("#sDatePicker")[0].value = meeting.sDate.month + "/" + meeting.sDate.day + "/" + meeting.sDate.year;
		$("#eDatePicker")[0].value = meeting.eDate.month + "/" + meeting.eDate.day + "/" + meeting.eDate.year;
		$("#sTimePicker")[0].value = new Time(meeting.sTime).toString();
		$("#eTimePicker")[0].value = new Time(meeting.eTime).toString();
		$("#descriptionBox")[0].value = meeting.description;
	}
	else
	{
		$('.timepicker').timepicker({
			timeFormat: 'hh:mm p',
		    interval: 15,
		    minTime: '12:00am',
		    maxTime: '11:45pm',
		    defaultTime: '11',
		    startTime: '12:00am',
		    scrollDefault: '11:00am',
		    dynamic: false,
		    dropdown: true,
		    scrollbar: false
		});
	}
}
function validateData(event)//Also need to validate event length!
{
	if(!(new Time(event.sTime).before(new Time(event.eTime))))
	{
		return false;
	}
	else if(new Date(event.sDate) > new Date(event.eDate))
	{
		return false;
	}
}
function validateMeetingDate(event)//finish this later, will check if a date is within the start date and end date of the meeting. Also needs to check if the start date is after the end date.
{
	var sDate = new Date(meeting.sDate);
	
}
function getFirstNotZero(string)
{
	for(var i = 0; i < string.length; i++)
	{
		if(string.charAt(i) != "0")
		{
			console.log(i);
			return i;
		}
	}
	return -1;
}
function convertDay(dayInt)
{
	switch(dayInt)
	{
		case 0: return "sunday";
		case 1: return "monday";
		case 2: return "tuesday";
		case 3: return "wednesday";
		case 4: return "thursday";
		case 5: return "friday";
		case 6: return "saturday";
		default: return "NOT A DAY";
	}
}

$(function(){$(".datepicker").datepicker();});

function toggleMenu() {
	if($("#userMenu")[0] == null) {
		$("header").append(	
			"<div id='userMenu' tabindex='-1'>"
                + "<ul>"
                + "<li><a href='editAccount.html'>My Account</a></li>"
				+ "<li><a href='addMeeting.html'>Create Meeting</a></li>"
				+ "<li><a href='addEvent.html'>Create Event</a></li>"
                + "<br>"
                + "<li><a onclick ='logOut();' href='index.html'>Log Out</a></li>"
                + "</ul>" 
            + "</div>"
			);
		clickOffListener("#userMenu", "#myAccount")
	}
	else 
	{
		$("#userMenu").toggle();
		$("#userMenu").focus();
	}
	positionMenu();
}
function clickOffListener(menu, parent) {
	$(document).click(function(event) {
	    if(!$(event.target).closest(menu).length) {
	        if($(menu).is(":visible") && !isChildOf(event.target,$(parent)[0])) {
	            $(menu).hide();
	        }
	    }
	});
}
function isChildOf(child, parent) {
	if(parent == null) {
		return false;
	}
	else if(child.parentNode.id != "" && child.parentNode.id === parent.id) {
		return true;
	}
	return isChildOf(child, parent.parentNode);
}
function positionMenu() 
{
	$("#userMenu").css("top", $("#myAccount").position().top + $("#myAccount").height() + 20);
	$("#userMenu").css("left", $("#myAccount").position().left + $("#myAccount").width() - $("#userMenu").width());
}
var main = function()
{
	var today = new Date();
	var date = (today.getMonth() + 1) + "/" + today.getDate() +"/" + today.getFullYear();
	$("#myAccount").click(toggleMenu);
	$("#datepicker").attr("placeholder", date);	
	$("#repeat")[0].checked = false;
	$("#repeat").change(function()
	{
		$("#repeatTable").toggle();
	});
	sessId = $.cookie("id"); //gets cookie
	getEventFromURL();
}
$(document).ready(main);