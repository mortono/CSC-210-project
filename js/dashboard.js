var calendar = {};	
var sunday;
var timer;
var mode = "create";
/* Search functions */
function createSearchHandlers() {
    $('#searchbar').keyup(function() {
        clearTimeout(timer);
        if($('#searchbar').val() != "") {
            timer = setTimeout(updateSearch, 400);
        }
    });
    $('#searchbar').focusin(function() {
        if($('#searchbar').val() != "") {
            $('#dropdown').css({ display : "block" });
        }
    });
    clickOffListener("#dropdown", "#searchbarContainer");
}
function updateSearch() {
    var session = $.cookie("id");
    $("#dropdown").css({ display : "block" });
    $.post("./cgi-bin/friendlist.py", {"id": session, "type": "get"}, function(result) {
        $("#results").empty();
        if (result.length < 2) {
        	return;
        }
        var matching = result.split("\n");
        var results = 0;
        var max = (matching.length < 8) ? matching.length : 8;
        for(var i = 0; i < max; i++) {

            var email = matching[i].trim();
            var searchval = $("#searchbar").val().toLowerCase().trim();
            if(email.indexOf(searchval) !== -1) {
            	results++;
                addResult("friend", results, email);
            }
        }
        $("#dropdown").css( { "height" : results * 45 });
        if(results > 7) {
            addResult("more", null, null);
        } else if(results == 0) {
            addResult("none", null, null);
        }
    });
}
function addResult(type, number, email) {
	console.log("number " + number);
    var session = $.cookie("id");
    if(type == "friend") {
        var item = "<li>" + email + "<a class ='resultItem' onclick = 'removeFriend(\"" + email + "\");'>Remove Friend</a></li>"
        $("#results").append(item);
    } else if(type == "more") {
        var item = $("<li>");
        item.append($("<a>").attr("href", "#").text("View more results"));
        $("#results").append(item);
        $("#dropdown").css( { "height" : $("dropdown").css("height") + 40 });
    } else if(type == "none") {
        var item = $("<li>").text("No results!");
        $("#results").append(item);
        $("#dropdown").css( { "height" : 40 });
    }
}
/* End search functions */
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

function positionMenu() 
{
	$("#userMenu").css("top", $("#myAccount").position().top + $("#myAccount").height() + 20);
	$("#userMenu").css("left", $("#myAccount").position().left + $("#myAccount").width() - $("#userMenu").width());
}
function hideMeeting() 
{
	$("#meetingPane").hide();
	$("#leftArrow").children().css("display", "initial");
	if($("#conversationPane").is(":visible"))
	{
		$("#calendar").css("width", "calc(85% - 42px)");
	}
	else
	{
		$("#calendar").css("width", "calc(100% - 42px)");
		$("#addEvent").css("left", "calc(100% - 82px)");
	}
	$("#showMeeting").toggle();
}
function hideConversation() 
{
	$("#conversationPane").hide();
	$("#rightArrow").children().css("display", "initial");
	if($("#meetingPane").is(":visible"))
	{
		$("#calendar").css("width", "calc(85% - 42px)");
	}
	else
	{
		$("#calendar").css("width", "calc(100% - 42px)");
	}
	$("#showConversation").show();
}
function showMeetingPane()
{
	$("#meetingPane").show();
	$("#leftArrow").children().css("display", "initial");
	if($("#conversationPane").is(":visible"))
	{
		$("#calendar").css("width", "calc(70% - 42px)");
	}
	else
	{
		$("#calendar").css("width", "calc(85% - 42px)");
	}
	$("#showMeeting").hide();
}
function showConversationPane()
{
	$("#conversationPane").show();
	$("#rightArrow").children().css("display", "initial");
	if($("#meetingPane").is(":visible"))
	{
		$("#calendar").css("width", "calc(70% - 42px)");
	}
	else
	{
		$("#calendar").css("width", "calc(85% - 42px)");
	}
	$("#showConversation").toggle();
	$("#addEvent").css("left", "calc(85% - 82px)");
}
function changeView(event)
{
	$(".viewSelector").removeClass("selected");
	$("#" + event.target.id).addClass("selected");
}

function logOut()
{
	$.removeCookie("id", {path: '/'});
}
function showEvents(events)
{
	if(typeof events === "string")
	{
		var stringEventsList = events.split("\n");
		var eventsList = Array();
		for(var i = 0; i < stringEventsList.length; i++)
		{
			eventsList.push(parseEvent(stringEventsList[i]));
		}
		for(var i = 0; i < eventsList.length; i++)
		{
			var dateToSet = new Date(sunday.toString());
			dateToSet.setDate(dateToSet.getDate() - 7);
			dateToSet.setHours(0,0,0,0);
			sunday.setHours(0,0,0,0);
			calendar[eventsList[i].id] = eventsList[i];
			if(parseInt(eventsList[i].repeat) == 0 && (dateToSet <= new Date(eventsList[i].sDate) && sunday > new Date(eventsList[i].sDate)))
			{
				showEvent(eventsList[i]);
			}
			else
			{
				for(var j = 0; j < eventsList[i].repeat.length; j++)
				{
					dateToSet.setDate(dateToSet.getDate() + j);
					if(eventsList[i].repeat.charAt(j) != "0" && (dateToSet >= new Date(eventsList[i].sDate) && dateToSet < new Date(eventsList[i].eDate)))
					{
						showEvent(eventsList[i], j);
					}
				}
			}
		}
	}
	$(".event").click(selectEvent);
}
function showEvent(event, j)
{
	var startTime = parseInt(event.sTime.hour);
	var endTime = parseInt(event.eTime.hour);
	var top, parent, eventObject, numChildren;
	var width = 0;
	var heightMod = 0;
	if(j == null )
	{
		j = new Date(event.sDate.toString()).getDay();
	}
	//determine if event is before or after the thirty minute mark
	//important due to DOM structure and some of the timing for the top of the element
	if(event.sTime.minute < 30)
	{
		parent = $("." + convertTime(startTime) + "." + convertDay(j) + ".top");
		top = (event.sTime.minute) / 30 * parent.height();
	}
	else
	{
		parent = $("." + convertTime(startTime) + "." + convertDay(j) + ".bottom");
		top = (event.sTime.minute - 30) / 30 * parent.height();
	}
	//add the event ot the DOM
	numChildren = parent.children().length;
	parent.append(event.html);
	eventObject = parent.children()[numChildren];

	//check for other events that have the same parent
	//this is needed due to how relative positioning works
	for(var k = 0; k < numChildren; k++)
	{
		heightMod +=  parseInt(parent.children()[k].offsetHeight);
	}
	top -= (heightMod + 2);
	eventObject.style.top = top + "px";	

	//check for overlaps and chege the width accordingly
	for(var z = 0; z < $(".event").length; z++)
	{
		if(eventObject !== $(".event")[z] && collision($(eventObject), $($(".event")[z])))
		{
			width += 1;
		}
	}
	width = 100 - 10 * width;
	//set up the final stylizing
	eventObject.style.width = "calc(" + width + "% - 8px)";
	var height = event.sTime.timeBetween(event.eTime) * 2 * parent.outerHeight() - event.sTime.timeBetween(event.eTime);					
	$("." + convertTime(startTime) + "." + convertDay(j)).children()[numChildren].style.height = height + "px";
}
function selectEvent(event)
{
	var calEvent = calendar[event.target.id];
	var deleteButton = "<input id='deleteEvent' value='Delete' onclick = 'deleteEvent(" + "\"" + calEvent.id + "\"" + ");' type='button'>";
	var editButton = "<input id='editEvent' value='Edit' onclick = 'editEvent(" + "\"" + calEvent.id + "\"" + ");' type='button'>";
	var buttons = "<p>" + deleteButton + editButton + "<p>";
	$(".eventDescription").remove();
		calEvent.htmlDescription = ""+
			"<div class = 'eventDescription' id = '"+ calEvent.id + "description" +"' tabindex = '-1'>" + 
			"<h3> "+ calEvent.title +"</h3>" +
			"<a>"+ calEvent.sTime + " - " + calEvent.eTime + "</a>" + 
			"<p>" + calEvent.description + "</p>"+
			"</div>";
		$(event.target).parent().append(calEvent.htmlDescription);
		$("#" + calEvent.id + "description").position({
			    my:        "center bottom-10px",
			    at:        "center top",
			    of:        $(event.target), // or $("#otherdiv")
			    collision: "fit"
			});
		//need to check if element is clipped by outer container
		//If it is, move it to the right (cannot be clipped by the left due to the times on the side)
		if($("#" + calEvent.id + "description")[0].getBoundingClientRect().right > $("#calendarContainer")[0].getBoundingClientRect().right)
		{
			$("#" + calEvent.id + "description").position({
			    my:        "right bottom-10px",
			    at:        "right top",
			    of:        $(event.target), // or $("#otherdiv")
			    collision: "fit"
			});
		}
		$(document).click(function(event) 
		{ 
		    if(!$(event.target).closest('.eventDescription').length) 
		    {
		        if($('.eventDescription').is(":visible") && event.target.className != "event" && event.target.parentNode.className != "event") 
		        {
		            $('.eventDescription').remove();
		            calEvent.htmlDescription = null;
		        }
		    }
		});
		$("#calendarContainer").css("height", "initial");
		$("#" + calEvent.id + "description").focus();
		
		if(calEvent.owner == $("#myEmail")[0].text.trim())
		{
			$("#" + calEvent.id + "description.eventDescription").append(buttons);
		}
		calEvent.htmlDescription = null;
}

function deleteEvent(event){
	var eventID = calendar[event].id;
	$.post("./cgi-bin/delete_event.py", {"id": eventID, "type": "delete"}, function(result){
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
		$("#" + calendar[event].id).remove();
		$("#" + calendar[event].id + "description").remove();
	});

}
function editEvent(eventID)
{
	calendar[eventID].htmlDescription = null;
	calendar[eventID].html = null;
	location.href = "addEvent.html?mode=edit&event=" + encodeURI(JSON.stringify(calendar[eventID]));
}
function collision($div1, $div2) 
{
    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;
    var x2 = $div2.offset().left;
    var y2 = $div2.offset().top;
    var h2 = $div2.outerHeight(true);
    var w2 = $div2.outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2)
}
function parseEvent(event)
{
	if(event !== "")
	{
		var partsList = event.split(",");
		return new CalendarEvent(partsList[0], partsList[1],partsList[2],partsList[3],new EventDate(partsList[4]),new EventDate(partsList[5]), new Time(partsList[6]), new Time(partsList[7]), partsList[8], partsList[9]);
	}
	return null;
}
function convertTime(time24)
{
	if(typeof time24 === 'number')
	{
		switch(time24)
		{
			case 0: return "12am";
			case 1: return "1am";
			case 2: return "2am";
			case 3: return "3am";
			case 4: return "4am";
			case 5: return "5am";
			case 6: return "6am";
			case 7: return "7am";
			case 8: return "8am";
			case 9: return "9am";
			case 10: return "10am";
			case 11: return "11am";
			case 12: return "12pm";
			case 13: return "1pm";
			case 14: return "2pm";
			case 15: return "3pm";
			case 16: return "4pm";
			case 17: return "5pm";
			case 18: return "6pm";
			case 19: return "7pm";
			case 20: return "8pm";
			case 21: return "9pm";
			case 22: return "10pm";
			case 23: return "11pm";
			default: console.log(time24 + " ERROR"); return "";
		}
	}
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
function showDatePicker()
{
	$("#datepicker").toggle();
}
function getSunday(today)
{
	var sunday = new Date();
	sunday.setDate(sunday.getDate() - today.getDay());
	return sunday;
}
function setDates(sunday)
{
	for(var i = 0; i < $(".dayHeader").length; i++)
	{
		$(".dayHeader")[i].text = (sunday.getMonth()+1) + "/" + sunday.getDate();
		sunday.setDate(sunday.getDate() + 1);
	}
	var startWeek = new Date(sunday);
	startWeek.setDate(startWeek.getDate() - 7);
	if(startWeek.getMonth() == sunday.getMonth())
	{
		$("#dateStamp")[0].text = String(sunday).substring(4,7) + " " + startWeek.getDate() + " - " + sunday.getDate() + " " + startWeek.getFullYear();
	}
	else
	{
		$("#dateStamp")[0].text = String(startWeek).substring(4,7) + " " + startWeek.getDate() + " - " + String(sunday).substring(4,7) + " " + sunday.getDate() + " " + startWeek.getFullYear();
	}
}
function getEvents() {
	var sessID = $.cookie("id");
	var stringEventsTMP = "";
	var tempDate = new Date(sunday);
	tempDate.setDate(tempDate.getDate() - 7);
	var date = (tempDate.getMonth()+1) + ":" + tempDate.getDate() + ":" + tempDate.getFullYear() + ":" + $(".selected")[0].id;
	$.post("./cgi-bin/getEvents.py", {"id": sessID, "date": date}, function(result) {
		if (result.indexOf("None400") !== -1) {
			console.log("not found");
        } else {
        	if(result.length > 7)
        	{
        		showEvents(result.substring(0,result.length-1));
        	}
        }
	});
}

function getFriendEvent(friendName, mID) {
	var sessID = $.cookie("id");
	var tempDate = new Date(sunday);
	tempDate.setDate(tempDate.getDate() - 7);
	var date = (tempDate.getMonth()+1) + ":" + tempDate.getDate() + ":" + tempDate.getFullYear() + ":" + $(".selected")[0].id;

	$.post("./cgi-bin/getFriendEvent.py", {"id": sessID, "date": date, "friend": friendName, "mID": mID}, function(result) {
		if (result.indexOf("None400") !== -1) {
			console.log("not found");
        } else if (result.indexOf("notFriends") !== -1){
        	console.log("Not Friends with " + friendName);
        } else {
        	console.log("Result from friend event: " + result);
        	if (result.length > 2) {
        		showEvents(result.substring(0, result.length-1));
        		for(var i = 0; i < $(".event").length; i++)
        		{
        			console.log(calendar[$(".event")[i].id].description);
        			if(calendar[$(".event")[i].id].description.trim() == "")
        			{
        				$(".event")[i].style.backgroundColor = "red";
        			}
        		}
        	}
        }
	});
	return null;
}
function nextTime()
{
	calender = {};
	setDates(sunday);
	$(".event").remove();
	getEvents();
	showMeetingEvents();
}
function prevTime()
{
	calender = {};
	sunday.setDate(sunday.getDate() - 14);
	setDates(sunday);
	$(".event").remove();
	getEvents();
	showMeetingEvents();
}
function today()
{
	calender = {};
	sunday = getSunday(new Date());
	setDates(sunday);
	$(".event").remove();
	getEvents();
	showMeetingEvents();
}

function clickOffListener(menu, parent)
{
	$(document).click(function(event) 
	{
	    if(!$(event.target).closest(menu).length) 
	    {
	        if($(menu).is(":visible") && !isChildOf(event.target,$(parent)[0])) 
	        {
	            $(menu).hide();
	        }
	    }
	});
}
function isChildOf(child, parent)
{
	if(parent == null)
	{
		return false;
	}
	else if(child.parentNode.id != "" && child.parentNode.id === parent.id)
	{
		return true;
	}
	return isChildOf(child, parent.parentNode);
}
function myCalendar()
{	
	$(".event").remove();
	$(".top").css("background-color", "initial");
	$(".bottom").css("background-color", "initial");
	$(".friend").css("color", "white");
	$("#addEvent").show();
	mode = "create";
	today();
	$("#nextButtons").show();
	$("#today").show();
}
var main = function() {
	sunday = getSunday(new Date());
	setDates(sunday);
	$("#myAccount").click(toggleMenu);
	$("#leftArrow").click(hideMeeting);
	$("#rightArrow").click(hideConversation);
	$(".viewSelector").click(changeView);
	$("#next").click(nextTime);
	$("#prev").click(prevTime);
	$("#today").click(today);
	$(window).resize(positionMenu);
	$("#showConversation").click(showConversationPane);
	$("#showMeeting").click(showMeetingPane);
	$("#notificationContainer").click(showNotifications);
	getEvents();
	var objDiv = document.getElementById("calendarContainer");
	objDiv.scrollTop = objDiv.scrollHeight;
    updateFriendslist();
    createSearchHandlers();
    if(navigator.userAgent.indexOf("Chrome") == -1 || navigator.userAgent.indexOf("Edge") != -1)
    {
    	var scrollbarWidth = $("#calendarContainer")[0].offsetWidth - $("#calendarTable")[0].offsetWidth;
    	$("#calendarContainer").css("margin-right", -scrollbarWidth);
    }
    numOfFriendRequests();
    getMeetings();
}
$(document).ready(main);
