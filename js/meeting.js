//load meetings into meetingPane
var meetings = Array();
var guestCalendar = {};

function Meeting(mid, title, location, sTime, eTime, sDate, eDate, duration, repeat, description, eventId, guestList, owner)
{
	this.mid = mid;
	this.title = title;
	this.location = location;
	this.sTime = sTime;
	this.eTime = eTime;
	this.sDate = sDate; 
	this.eDate = eDate;
	this.duration = duration;
	this.repeat = repeat;
	this.description = description;
	this.eventId = eventId;
	this.guestList = guestList;
	this.owner = owner;
}
function getMeetings()
{
	var sessID = $.cookie("id");
	$.post("./cgi-bin/get_meeting_titles.py", {"id": sessID}, function(result) {
		if (result.indexOf("error400") !== -1) {
			console.log("not found");
        } else {
        	if(result.length > 4)
        	{
        		showMeetingSideBar(result.substring(0,result.length-1));
        		numOfMeetingRequests();
        	}
        }
	});
}
function showMeetingSideBar(stringEvents)
{
	var splitMeetings = stringEvents.split("\n");
	for(var i = 0; i < splitMeetings.length; i++)
	{
		var split = splitMeetings[i].split(",");
		meetings.push({"title":split[0].trim(), "id": split[1].trim(), "accepted": split[2].trim()});
		if(meetings[i].accepted == "1")
		{
			$("#meetingList").append("<li class = 'selectMeeting' id='m" + meetings[i].id + "''>"+ meetings[i].title+"</li>"); //update to check for accepted status
		}
	}
	$(".selectMeeting").click(selectMeeting);
	showMeetingEvents();
}
function getMeeting(mID)
{
	var mIDT = String(mID);	
	$.post("./cgi-bin/get_meeting.py", {"mid": mIDT}, function(result)
	{
		if(result.indexOf("error400") !== -1)
		{
			console.log("No Such Meeting");
		}
		else if (result.indexOf("fillAll") !== -1) {
			console.log(result);
		}
		else
		{
			var parts = result.split(",");
			for(var i = 0; i < parts.length; i++)
			{
				parts[i] = parts[i].trim();
			}
			var meeting = new Meeting(parts[0], parts[1], parts[2], new Time(parts[3]), new Time(parts[4]), new EventDate(parts[5]), new EventDate(parts[6]), parts[7], parts[8], parts[9], parts[10], parts[11], parts[12]);
			var startWeek = getStartWeek(meeting.sDate.toString());
			console.log(startWeek);
			startWeek.setDate(startWeek.getDate() - 7)
			setDates(startWeek);
			sunday = startWeek;
			var guestList = parts[11];
			var guests = guestList.split(":");
			for(var i = 0; i < guests.length; i++)
			{
				getFriendEvent(guests[i], mIDT);
			}
			getFriendEvent(meeting.owner, mIDT);
			showMeeting(meeting);
			getEvents();
			$("#nextButtons").hide();
			$("#today").hide();
		}
	});
}
function getStartWeek(sDate)
{
	var toRet = new Date(sDate);
	if(toRet.getDay() == 0)
	{
		toRet.setDate(toRet.getDate() + 7)
		return toRet;
	}
	else
	{
		while(toRet.getDay() != 0)
		{
			toRet.setDate(toRet.getDate() + 1);
		}
	}
	return toRet;
}
function showMeeting(meeting)
{
	//grey out days that are not elible to be met on
	$(".top").css("background-color", "initial");
	$(".bottom").css("background-color", "initial");
	for(var i = 0; i < meeting.repeat; i++)
	{
		if(meeting.repeat.charAt(i) == "0") {
            $("." + convertDay(i)).css("background-color", "#dfdfdf");
        }
    
    }
	//grey out times that are not able to be met on
	for(var i = 0; i < 24; i++)
	{
		if(i >= meeting.sTime.hour && i < meeting.eTime.hour)
		{
			continue;
		}
		else
		{
			$("." + convertTime(i)).css("background-color", "#dfdfdf");
		}
	}
	if(meeting.owner != $("#myEmail")[0].text.trim())
	{
		$("#addEvent").hide();
	}
	else
	{
		$("#addEvent").show();
	}
	mode = "meeting&meeting=" + encodeURI(JSON.stringify(meeting));
}

function selectMeeting(event)
{
	$(".event").remove();
	calendar = {};
	getMeeting(event.target.id.substring(1,event.target.id.length));
	showAcceptances(event.target.id.substring(1,event.target.id.length));
}
function showAcceptances(mId)
{
	$.post("./cgi-bin/get_guest_list.py", {"mid":mId}, function(result)
	{
		//check for success
		var guests = result.trim().split("\n");
		for(var i = 0; i < guests.length; i++)
		{
			var currGuest = guests[i].trim().split(",");
			for(var j = 0; j < $(".friend").length; j++)
			{
				var currFriend = $(".friend")[j];
				if(currFriend.textContent.trim() === currGuest[0])
				{
					if(currGuest[2] === "1")
					{
						currFriend.style.color = "green";
					}
					else if(currGuest[2] === "-1")
					{
						currFriend.style.color = "red";
					}
					else if(currGuest[2] == '0')
					{
						currFriend.style.color = "yellow";
					}
				}
			}
		}
	});
}
function showMeetingEvents()
{
	for(var i = 0; i < meetings.length; i++)
	{
		if(meetings[i].accepted == "1")
		{
			$.post("./cgi-bin/get_meeting.py", {"mid": meetings[i].id}, function(result)
			{
				//check for success
				var parts = result.split(",");
				for(var i = 0; i < parts.length; i++)
				{
					parts[i] = parts[i].trim();
				}
				var meeting = new Meeting(parts[0], parts[1], parts[2], new Time(parts[3]), new Time(parts[4]), new EventDate(parts[5]), new EventDate(parts[6]), parts[7], parts[8], parts[9], parts[10], parts[11], parts[12]);
				if(meeting.eventId >= 0 && meeting.owner.trim() != $("#myEmail")[0].text.trim())
				{
					$.post("./cgi-bin/get_event.py", {"id": meeting.eventId}, function(result)
					{
						//check for success!
						showEvents(result.substring(0, result.length-1));
					});
				}
			});
		}
	}
}