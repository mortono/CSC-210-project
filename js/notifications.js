var friendNotifications = Array();
var meetingNotifications = Array();

function makeNotificationsRED(numOfNotifications){ //changes color to red, and grows notification num
	var weight = "normal";
	var numSize = 12;
	var maxNumSize = 25;
	if(numOfNotifications == 0){
		weight = "normal";
		$("#notificationDisplay").replaceWith( "<a id='notificationDisplay'>" + numOfNotifications + "</a>" );
		$(".notBrackets").css("font-weight", weight);
		$("#not").css("font-weight", weight);
	}
	if(numOfNotifications > 0){ 
		weight = "bold"; 
		$("#notificationDisplay").replaceWith( "<a id='notificationDisplay'>" + numOfNotifications + "</a>" );
		$("#notificationDisplay").addClass("redAndBold");

		$(".notBrackets").css("font-weight", weight);
		$(".notBrackets").css("font-size", numSize + numOfNotifications + "px");

		$("#not").css("font-weight", weight);
	}		
	if(numOfNotifications >= 13){
		weight = "bold";
		$("#notificationDisplay").css("font-size",  + maxNumSize + "px");
		
		$("#not").css("font-weight", weight);
	}
};
function showNotifications()
{
	if($("#notificationArea").length == 0)
	{
		$("header").append(
			"<div id =\"notificationArea\">" +
				"<div id = \"notificationArrow\" class = \"arrow-up\"></div>" +
				"<div id = \"notificationBox\">" +
					"<table id = \"notificationTable\">" +
						"<tr>" + 
							"<th id = 'meetingNotifications'>Meeting Requests</th>" +
							"<th id = 'friendNotifications'>Friend Requests</th>" +
						"</tr>" +
					"</table>" +
				"</div>"+
			"</div>");
		$("#notificationArea").position({
		    my:        "center top",
		    at:        "center bottom",
		    of:        $("#notificationContainer"),
		    collision: "fit"
		});
		clickOffListener("#notificationArea", "#notificationContainer");
		$("#meetingNotifications").click(showMeetingNotifications);
		$("#friendNotifications").click(showFriendNotifications);
		showMeetingNotifications();
	}
	else
	{
		$("#notificationArea").toggle();
	}
}
function showMeetingNotifications()
{
	if(!$("#meetingNotifications").hasClass("selected"))
	{
		$("#friendNotifications").removeClass("selected");
		$("#meetingNotifications").addClass("selected");
		$(".notification").remove();
		if(meetingNotifications.length !== 0)
		{
			for(var i = 0 ; i < meetingNotifications.length; i++)
			{
				$("#notificationTable").append(
					"<tr class = 'notification'>" +
						"<td colspan = '2' class = 'notoficationTD' id = '" + meetingNotifications[i].id + "Container'>" +
							"<a  id='"+meetingNotifications[i].id.trim() + "' class='" + meetingNotifications[i].title + "' > <span " + " class='redAndBold'>" + meetingNotifications[i].title  + "</span></a>" +
							"<input class = 'notificationButton' type = 'button' value = 'Accept' onclick = 'acceptRejectMeeting(\"" + meetingNotifications[i].id + "\", 1)'>" +
							"<input class = 'notificationButton' type = 'button' value = 'Reject' onclick = 'acceptRejectMeeting(\"" + meetingNotifications[i].id + "\", -1)'>" +
						"</td>" + 
					"</tr>"
				);
			}
		}
		else
		{
			$(".notification").remove();
			$("#notificationTable").append(
			"<tr class = 'notification'>" +
				"<td colspan = '2' class = 'notoficationTD' id = 'emptyNofitications'>No Meeting Requests!</td>" + 
			"</tr>");
		}
	}
}
function acceptRejectMeeting(email, acceptState)
{
	if(acceptState == 1)
	{

	}
	var session = $.cookie("id");
	$("#" + email.replace(".", "").replace("@", "") + "Container").remove();
	for(var i = 0 ; i < meetingNotifications.length; i++)
	{
		if(meetingNotifications[i].id === email)
		{
			console.log("Sending request...");
			console.log({"id": session, "mid": meetingNotifications[i].id, "type": acceptState});
			$.post("./cgi-bin/accept_decline_meeting.py", {"id": session, "mid": meetingNotifications[i].id, "type": acceptState}, function(result)
			{
		        console.log(result);
				location.reload(); 						  	
		    });
		  
		}
	}

}
function showFriendNotifications()
{
	if(!$("#friendNotifications").hasClass("selected"))
	{
		$("#meetingNotifications").removeClass("selected");
		$("#friendNotifications").addClass("selected");
		$(".notification").remove();
		if(friendNotifications.length !== 0)
		{
			for(var i = 0 ; i < friendNotifications.length; i++)
			{
				$("#notificationTable").append(
					"<tr class = 'notification'>" +
						"<td colspan = '2' class = 'notoficationTD' id = '" + friendNotifications[i].email.trim().replace(".", "").replace("@", "") + "Container'>" +
							"<a  id='"+friendNotifications[i].email.trim() + "' class='" + friendNotifications[i].name + "' > <span id="+ friendNotifications.name + " class='redAndBold'>" + friendNotifications[i].name  + "</span></a>" +
							"<input class = 'notificationButton' type = 'button' value = 'Accept' onclick = 'acceptFriendRequest(\"" + friendNotifications[i].email.trim() + "\")'>" +
							"<input class = 'notificationButton' type = 'button' value = 'Reject' onclick = 'rejectFriendRequest(\"" + friendNotifications[i].email.trim() + "\")'>" +
						"</td>" + 
					"</tr>"
				);
			}
		}
		else
		{
			$(".notification").remove();
			$("#notificationTable").append(
			"<tr class = 'notification'>" +
				"<td colspan = '2' class = 'notoficationTD' id = 'emptyNofitications'>No Friend Requests!</td>" + 
			"</tr>");
		}	
	}
}
function acceptFriendRequest(email)
{
	var session = $.cookie("id");
	linkFriend(email);
	updateFriendslist();
	$("#" + email.replace(".", "").replace("@", "") + "Container").remove();
	var i;
	for(i = 0 ; i < friendNotifications.length; i++)
	{
		if(friendNotifications[i].email === email)
		{
			$.post("./cgi-bin/deleteFriendRequest.py", {"id": session, "requester": friendNotifications[i].name.trim()}, function(result)
			{
		        console.log(result);						  	
		    });
		    friendNotifications.splice(i,1);
			makeNotificationsRED(friendNotifications.length + meetingNotifications.length);
		}
	}
}
function rejectFriendRequest(email)
{
	var session = $.cookie("id");
    $("#" + email.replace(".", "").replace("@", "") + "Container").remove();
    var i;
    for(i = 0 ; i < friendNotifications.length; i++)
	{
		if(friendNotifications[i].email === email)
		{
			$.post("./cgi-bin/deleteFriendRequest.py", {"id": session, "requester": friendNotifications[i].name}, function(result)
			{
		        console.log(result);						  	
		    });
		    friendNotifications.splice(i,1);
			makeNotificationsRED(friendNotifications.length + meetingNotifications.length);
		}
	}
}

function numOfFriendRequests()//Returns number of unanswered friend requests AND makes the changes not number
{
	var session = $.cookie("id");
	$.post("./cgi-bin/getFriendRequests.py", {"id": session}, function(result) {
		if(result.indexOf('none') == -1){
			var names = resultToArray(result.split("\n")[0]);
			var emails = resultToArray(result.split("\n")[1]);
			for(var i = 0; i < names.length; i++)
			{
				friendNotifications.push({"name": names[i].trim(), "email":emails[i].trim()});
			}
			makeNotificationsRED(friendNotifications.length + meetingNotifications.length);
			return names.length;
			
		} else{
			return 0;
		}	
	});
}
function numOfMeetingRequests()
{
	for(var i = 0; i < meetings.length; i++)
	{
		if(meetings[i].accepted == "0")
		{
			meetingNotifications.push(meetings[i]);
		}
	}
	makeNotificationsRED(friendNotifications.length + meetingNotifications.length);
}