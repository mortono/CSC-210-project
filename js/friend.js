/* Friend functions */
function addFriend() {
    var email = prompt("Please enter the email of the friend you'd like to add.");
    // linkFriend(email);
    addFriendRequest(email);
}
function addFriendRequest(email) {
	var session = $.cookie("id");
    $.post("./cgi-bin/addFriendRequest.py", {"id": session, "friendEmail": email}, function(result) {
    	console.log("Add Freind: " + result);
    	if(result.indexOf("DNE") != -1){
    		alert("No user exists with the email " + email);
    	} else if(result.indexOf("duplicate") != -1){
    		alert("You've already sent a friend request to this user");
    	} else if (result.indexOf("fillAll") != -1) {
            //do nothing, empty request
        }  else if (result.indexOf("addYourself") != -1) {
            alert("You can't add yourself!");
        }  else if (result.indexOf("alreadyFriends") != -1) {
            alert("You are already friends with " + email);
        } else{
    		alert("A friend request has been sent to " + result);
    	}
        
    });
}
function checkForFriendRequest() {
	var session = $.cookie("id");
	$.post("./cgi-bin/getFriendRequests.py", {"id": session}, function(result) {
		if(result.indexOf('none')==-1){
			var names = resultToArray(result.split("\n")[0]);
			var emails = resultToArray(result.split("\n")[1]);

			for(i = 0; i<names.length; i++){
				friendRequestPrompt(names[i], emails[i]);
			}
			
		}	
	});
};
function willYouBeMyFriendPlease(message, email, name){ //promts user to accept, delete, or ignore friend request
	var session = $.cookie("id");
    $('<id = "friendshipBox" div></div>').appendTo('body').html('<div><h6>'+message+'?</h6></div>')
        .dialog({
                modal: true, title: 'Delete Friend Request', zIndex: 10000, autoOpen: true,
                width: 'auto', resizable: false,
                        buttons: {
                            Yes: function () { // accept friend request fuction								
                                $('body').append('<h1 ">Confirm Dialog Result: <i>Yes</i></h1>');
                                linkFriend(email);
        						updateFriendslist();
        						numOfFriendRequests();
                                $(this).dialog("close");
                                
                            },
                            No: function () { //ignore friend request                          		                              
                            	$('body').append('<h1>Confirm Dialog Result: <i>No</i></h1>');
                            	
                                $(this).dialog("close");
                               
                            }
                        },
                        close: function(event, ui){//delete friend request
                        	$.post("./cgi-bin/deleteFriendRequest.py", {"id": session, "requester": name}, function(result){
        							console.log(result);
        							
        	
    							});
                        	$(this).remove();
                        }
                    });
};

function friendRequestPrompt(name, email){//prompts user to accept or delete a friend request
	var session = $.cookie("id");
    if (confirm("Are you sure you want to accept " + name + "'s friend request?" )) {
        linkFriend(email);
        updateFriendslist();
        $.post("./cgi-bin/deleteFriendRequest.py", {"id": session, "requester": name}, function(result){
        	console.log(result);
        	
    	});
    } 
	
};
function resultToArray(result){
	array = result.split(', ');
	array[0] = array[0].replace('[', '');
	array[array.length - 1] = array[array.length - 1].replace(']', '');

	for (i=0; i < array.length; i++){
		array[i] = array[i].replace('(u\'', '');
		array[i] = array[i].replace('\',)', '');
	}

	return array;
}
function linkFriend(email) {
    var session = $.cookie("id");
    $.post("./cgi-bin/friendlist.py", {"id": session, "type": "add", "friendEmail": email}, function(result) {
        if(result.indexOf("DNE") !== -1) {
            alert("A user with email "  + email + " does not exist!");
        } else if(result.indexOf("duplicate") !== -1) {
            alert("You are already friends with that user!");
        } else if(result.indexOf("success") !== -1) {
			updateFriendslist();
        } else{
            console.log("Could not add friend with email " + email);
        }
    });
}
function removeFriend(email) {
    var session = $.cookie("id");
    $.post("./cgi-bin/friendlist.py", {"id": session, "type": "remove", "friendEmail": email}, function(result) {
        if(result.indexOf("success") !== -1) {
            updateFriendslist();
            updateSearch();
        } else {
            console.log("Error removing friend with email "  + email);
        }
    });
}
function updateFriendslist() {
    var session = $.cookie("id");
    $.post("./cgi-bin/get_data_type.py", {"id": session, "typeToReturn": "friends"}, function(result) {
        var friends = result.split("\n");
        var container = $("#friendsList");
        container.html("");
        if(friends.length >  1) {
            for(var i = 0; i < friends.length - 1; i++) {
                var item = $("<li>").appendTo(container);
                item.addClass("friend");
                item.text(friends[i]);
            }
        } else {
            var item = $("<li>").appendTo(container);
            item.text("You have no friends.");
        }
    });
}
$(document).on('click', '.friend', function () {
    var item = $(this);
    if($("div", this).length > 0) {
        $("div", this).remove();
    } else {
        var details = $("<div>");
        details.html("<a href='javascript:removeFriend(\"" + item.text() + "\")' class='friendLink'>Remove friend</a>");
        item.append(details);
    }
});
