var sessId;
var eventID;
function logOut()
{
	$.removeCookie("id", {path: '/'});
}

function createMeeting(arg) { //function that sends form data to python file
    $.post("../cgi-bin/create_meeting.py", arg, function (result) {
		if (result.indexOf("fillAllError") !== -1) {
			console.log(result);
			alert("Please fill out all of the event fields!");
		} else if (result.indexOf("eventCreated") !== -1) {
			window.location.href = "./dashboard.html";
		} else {
			alert("There was a problem. Please refresh and try again.");
		}
    });
}
function getFriends() {
	sessId = $.cookie("id");
	var arg = {"id": sessId, "type": "get"}
	$.post("../cgi-bin/friendlist.py", arg, function (result) {
		if (result.indexOf("failure") !== -1) {
			console.log(result);
			alert("Please fill out all of the event fields!");
		} else {
			showFriends(result);
			$(".friendRow").click(checkCheckbox);
		}
    });
}
function getData()
{
	var repeat = "";
	var endDate = null;
	var startDate = new EventDate($("#sDatePicker")[0].value);
	var date = new Date(startDate.toString());
	for(var i = 0; i < $(".dayBox").length; i++)
	{
		if($($(".dayBox")[i]).is(":checked"))
		{
			repeat += "1"
		}
		else
		{
			repeat += "0";
		}
	}
	if(getFirstNotZero(repeat) > date.getDay())
	{
		for(var i = 0; i < repeat.length; i++)
		{
			if(repeat.charAt(i) != "0" && convertDay(i) !== convertDay(date.getDay()))
			{
				date.setDate(date.getDate() + 1);
			}
		}
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
	//TODO: guest list
	var friends = "";
	for(var i = 0; i < $(".friendBox").length; i++)
	{
		if($(".friendBox")[i].checked)
		{
			friends += $(".friendBox")[i].value.trim() + ":";
		}
	}
	var event = {
		 "owner": $("#myEmail")[0].text.trim(),
		 "title": $("#name")[0].value,
		 "location": $("#location")[0].value,
		 "sDate": startDate.toString(),
		 "eDate": endDate.toString(),
		 "sTime": $("#sTimePicker")[0].value,
		 "eTime": $("#eTimePicker")[0].value,
		 "repeat": repeat,
		 "duration": $("#duration")[0].value.trim(),
		 "description": $("#descriptionBox")[0].value.trim(),
		 "guestList": friends.substring(0,friends.length-1).trim()
		};
	console.log(event);
	createMeeting(event);
	return event;
}

function getFirstNotZero(string)
{
	for(var i = 0; i < string.length; i++)
	{
		if(string.charAt(i) != "0")
		{
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
function showFriends(friendsString) //formatted as friend1\nfriend2\freind3
{
	friends = friendsString.trim().split("\n");
	for(var i = 0; i < friends.length; i++)
	{
		$("#friendsList").append("<tr class = 'friendRow'><td>" + friends[i] + "</td><td><input class = 'friendBox' type = 'checkbox' value = '" + friends[i] + "'></td></tr>");
	}
}
$(function(){$(".datepicker").datepicker();});

function toggleMenu() {
	if($("#userMenu")[0] == null) {
		$("header").append(	
			"<div id = 'userMenu' tabindex = '-1'>"
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
function checkCheckbox(event)
{
	if($(event.target)[0].childNodes[0].localName !== "input")
	{
		event.target.nextElementSibling.childNodes[0].checked = !event.target.nextElementSibling.childNodes[0].checked;
	}
	else
	{
		event.target.childNodes[0].checked = !event.target.childNodes[0].checked;
	}
}
var main = function()
{
	var today = new Date();
	var date = (today.getMonth() + 1) + "/" + today.getDate() +"/" + today.getFullYear();
	$("#myAccount").click(toggleMenu);
	$("#datepicker").attr("placeholder", date);	
	$('.timepicker').timepicker({
		timeFormat: 'hh:mm p',
	    interval: 15,
	    minTime: '12:00am',
	    maxTime: '11:45pm',
	    defaultTime: '11',
	    startTime: '12:00am',
	    scrollDefault: '12:00pm',
	    dynamic: false,
	    dropdown: true,
	    scrollbar: false
	});
	getFriends();
	sessId = $.cookie("id"); //gets cookie
}
$(document).ready(main);