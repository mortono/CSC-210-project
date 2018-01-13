var sessId=$.cookie("id");
function getEmail(arg) {
    $.post("./cgi-bin/get_data_type.py", arg, function (result) {
        if (result.indexOf("None400") !== -1) {
             window.location.href="./index.html";
        } else {
        	if (result.length > 100) {
        		$.removeCookie("id");
        		window.location.href = "./index.html";
        	} else {
        		document.getElementById("myEmail").text=result;
        	}
        }
    })
}
var args={"id": sessId, "typeToReturn": "email"};
getEmail(args);
