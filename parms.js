function openPanel(open){
	document.getElementById('panel').style.width = open ? '260px' : '0px';
	openTab(document.getElementsByClassName("active")[0]);
}

function openTab(target, tabName) {
	var tablinks = document.getElementsByClassName("tablinks");
	for (var i = 0; i < tablinks.length; i++)
	tablinks[i].classList.remove("active");
	target.classList.add("active");
	if(typeof tabName == "undefined")
		return;
	var tabcontent = document.getElementsByClassName("tabcontent");
	for (var i = 0; i < tabcontent.length; i++)
		tabcontent[i].style.display = "none";
	document.getElementById(tabName).style.display = "block";
}

//Generate float input
for(var e of Array.from(document.getElementsByClassName("float"))){
    e.addEventListener("keyup", function(event) {
        if(event.keyCode === 13)
            this.blur();
    }.bind(e));
    e.type = "range";
    e.className = "floatInput";
    var div = document.createElement("div");
    div.className = "floatDiv";
    var btn = document.createElement("input");
    btn.type = "button";
    btn.onclick = function() {
        this.type = this.type == "range" ? "number" : "range";
    }.bind(e);
    e.replaceWith(div);
    div.append(btn);
    div.append(e);
}
