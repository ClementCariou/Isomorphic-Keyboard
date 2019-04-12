var uils = {
	"Wicki-Hayden":"2,7,5;R30M", 
	"Harmonic Table": "3,7,4;R0",
	"Gerhard" :  "1,4,3;R60",
	"Park" : "2,5,3;R90M",
	"Jankó" : "1,2,1;R90",
	"C-System" : "1,3,2;R270M",
	"B-System" : "1,3,2;R270",
	"Bajan" : "1,3,2;R90M",
	"Zigzag": "0,1,1;R60",
	"Armchair": "1,2,1;R90",
};
var down = false;
var selected;
var width, height;
document.body.addEventListener("mouseleave", (e)=>down = false);
document.body.addEventListener("mousedown", (e)=>down = true);
document.body.addEventListener("mouseup", (e)=>down = false);

var container = document.getElementById("container");
container.addEventListener("mouseclick", (e)=>preventDefault());

function getPosition(el) {
	var xPos = 0;
	var yPos = 0;
   
	while (el) {
	  if (el.tagName == "BODY") {
		// deal with browser quirks with body/window/document and page scroll
		var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
		var yScroll = el.scrollTop || document.documentElement.scrollTop;
   
		xPos += (el.offsetLeft - xScroll + el.clientLeft);
		yPos += (el.offsetTop - yScroll + el.clientTop);
	  } else {
		// for all other non-BODY elements
		xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
		yPos += (el.offsetTop - el.scrollTop + el.clientTop);
	  }
   
	  el = el.offsetParent;
	}
	return {
	  x: xPos,
	  y: yPos
	};
}

function mouseDown(e){
	playNote(this.note, this.octave);
	if(e.button > 0 || e.shiftKey || e.ctrlKey){
		selected = e.target;
		while(selected.tagName != "LI")
			selected = selected.parentNode;
	}
	if(e.button == 1 || e.ctrlKey){
		selected.style.opacity = selected.style.opacity == 0.5 ? 1 : 0.5;
	}
}

function mouseUp(e){
	if(e.button == 2 || e.shiftKey){
		var current = e.target;
		while(current.tagName != "LI")
			current = current.parentNode;
		if(current == selected){
			var marker = selected.getElementsByTagName("DIV")[0];
			if(marker.classList.contains("marker"))
				marker.classList.remove("marker");
			else
				marker.classList.add("marker");
			return;
		}
		var p1 = getPosition(current);
		var p2 = getPosition(selected);
		var angle = Math.atan2(p2.y-p1.y, p2.x-p1.x);
		angle = angle*180/Math.PI - 90;
		var angleRounded = Math.round(angle/30)*30;
		if(Math.abs(angle-angleRounded) < 2){
			angleRounded = angleRounded >= 0 ? angleRounded : 360 + angleRounded; 
			var pointer = selected.getElementsByClassName("pointer-"+angleRounded);
			if(pointer.length == 1){
				pointer[0].style.display = pointer[0].style.display == "block" ? "none" : "block";
			}
		}
	}
}

function mouseEnter(e){
	if(down){
		playNote(this.note, this.octave);	
		if(e.buttons == 4 || e.ctrlKey){
			var current = e.target;
			while(current.tagName != "LI")
				current = current.parentNode;
			if(current != selected)
				current.style.opacity = current.style.opacity == 0.5 ? 1 : 0.5;
		}
	}
}

function gcd(a, b){
	if(a == 0 || b == 0)
		return 1;
	while(a != b) 
		if(a > b) a -= b; 
		else b -= a; 
	return a;
}

function parseUIL(){
	var uil = document.getElementById("uil");
	var str = uil.value;
	if(!/^\d+,\d+,\d+;R(3|6|9|(12)|(15)|(18)|(21)|(24)|(27)|(30)|(33))?0M?$/.test(str)){
		e.target.classList.add("error");
		console.log("Wrong format");
		return false;
	}
	//Parse UIL
	var data = str.split(";");
	var lgd = data[0].split(",").map(v=>parseInt(v));
	var L = lgd[0], G = lgd[1], D = lgd[2];
	var rotation = parseInt(data[1].replace(/R|M/,""));
	var mirror = str.endsWith("M");
	//Test completness (https://www.researchgate.net/publication/255993032_Discrete_Isomorphic_Completeness_and_a_Unified_Isomorphic_Layout_Format)
	//G - L = D and G, L, D coprimes
	console.log(G,L,D);
	if(G%12 - L%12 != D%12 || gcd(G,L) != 1 || gcd(G,D) != 1 || gcd(L,D) != 1){
		uil.classList.add("error");
		console.log("Incomplete layout");
		return false;
	}
	uil.classList.remove("error");
	//Calculate steps after transformations
	if(mirror){
		var tmp = lgd[0];
		lgd[0] = lgd[2];
		lgd[2] = tmp;
	}
	for(i = 0; i < 3; i++)
		lgd[i+3] = -lgd[i];
	var tilted = rotation%60 == 30;
	rotation = 6-Math.floor(rotation/60);
	var result = {tilted : tilted, rotation : rotation, mirror : mirror};
	if(!tilted){
		result.x = lgd[(rotation+2)%6] + lgd[(rotation+3)%6];
		result.y = lgd[(rotation+4)%6];
	}else{
		result.x = lgd[(rotation+2)%6];
		result.y = lgd[(rotation+3)%6] + lgd[(rotation+4)%6];
	}
	result.z = lgd[(rotation+3)%6];
	return result;
}

function adaptSize(uil){
	var tilted = uil.tilted;
	var oldTilted = document.getElementById("container").classList.contains("tilted");
	var size = document.getElementById("size").value.split("x").map(v=>parseInt(v));
	if(tilted && !oldTilted){
		size[0]-=2; size[1]++;
	}else if(oldTilted && !tilted){
		size[0]+=2; size[1]--;
	}else
		return;
	document.getElementById("size").value = size[0] + "x" + size[1];
}


function generate(){
	//Get parameters
	var uil = parseUIL();
	if(document.getElementsByClassName("error").length != 0)
		return;
	adaptSize(uil);
	var size = document.getElementById("size").value.split("x").map(v=>parseInt(v));
	width = uil.tilted ? size[0] : size[0]/2;
	height = uil.tilted ? size[1] : size[1]*2;
	var firstNote = document.getElementById("firstNote").value;
	var firstKey = notes.indexOf(firstNote.slice(0, -1)) + parseInt(firstNote.slice(-1))*12;
	var notation = document.getElementById("notation").value == "Sharp" ? notes : notesb;
	var showNote = document.getElementById("label").value.includes("Note");
	var showOctave = document.getElementById("label").value.includes("Octave");
	var debugOctave = document.getElementById("label").value == "Debug Octave";
	//Clear generation
	while(container.firstChild)
		container.removeChild(container.firstChild);
	//Tilt the grid
	if(uil.tilted){
		container.classList.add("tilted");
	} else {
		container.classList.remove("tilted");
	}
	container.table = [];
	for(var y = 0; y < height; y++){
		//Create hex row
		var ol = document.createElement("ol");
		ol.classList.add(y%2 == 1 ? "even" : "odd");
		container.appendChild(ol);
		for(var x = 0; x < width; x++){
			if(width%1 == 0.5 && x > width-1 && y%2 == 1)
				continue;
			//Calculate current note
			var key = firstKey + x * uil.x + Math.floor(y/2) * uil.y + (y%2) * uil.z;
			var note = notes[(key+120)%12];
			var octave = Math.floor(key/12);
			//Create hex cell
			var li = document.createElement("li");
			li.classList.add("hex");
			if(debugOctave)
				li.classList.add("octave-" + octave);
			else if(key%12 == 8)
				li.classList.add("blue-note");
			else if(key%12 == 2)
				li.classList.add("lightblue-note");
			else if(note.length == 2)
				li.classList.add("black-note");
			else
				li.classList.add("default-note");
			ol.appendChild(li);
			//Create note span
			if(showNote || debugOctave){
				var noteText = document.createElement("span");
				noteText.classList.add("note");
				noteText.innerText = notation[key%12];
				li.appendChild(noteText);
			}
			//Create octave span
			if(showOctave){
				var octaveText = document.createElement("span");
				octaveText.classList.add("octave");
				octaveText.innerText = octave;
				li.appendChild(octaveText);
			}
			//Create pointers
			var pointers = document.createElement("div");
			li.appendChild(pointers);
			for(i = uil.tilted?1:0; i<12; i+=2){
				var pointer = document.createElement("span");
				pointer.classList.add("pointer-"+i*30);
				pointer.innerText = "▲";
				pointers.appendChild(pointer);
			}
			//Set click event
			li.onmousedown = mouseDown.bind({note:note, octave:octave});
			li.onmouseup = mouseUp;
			li.onmouseenter = mouseEnter.bind({note:note, octave:octave});
		}
	}
}

generate();

//Handle layout settings
document.getElementById("layout").addEventListener("change",(e)=>{
	var uil = document.getElementById("uil");
	if(e.target.value == "Custom"){
		uil.disabled = false;
	}else{
		uil.disabled = true;
		uil.value = uils[e.target.value];
	}
	generate();
});

document.getElementById("uil").addEventListener("change",(e)=>{
	generate(); //tests are done during generation
});

document.getElementById("size").addEventListener("change",(e)=>{
	if(!/^\d+x\d+$/.test(e.target.value)){
		e.target.classList.add("error");
	}else{
		e.target.classList.remove("error");
		generate();
	}
});

document.getElementById("firstNote").addEventListener("change",(e)=>{
	if(!/^(A|B|C|D|E|F|G|(A#)|(C#)|(D#)|(F#)|(G#))\d$/.test(e.target.value)){
		e.target.classList.add("error");
	}else{
		e.target.classList.remove("error");
		generate();
	}
});

document.getElementById("notation").addEventListener("change",(e)=>generate());
document.getElementById("label").addEventListener("change",(e)=>generate());

function setNoteColor(className, backgroundColor, color){
	var sheet = document.createElement('style');
	sheet.innerHTML = "."+className+"{background-color:"+backgroundColor+" !important;color:"+color+" !important}";
	document.body.appendChild(sheet);
}

document.getElementById("defaultColor").addEventListener("change",(e)=>{
	setNoteColor("default-note",e.target.style.backgroundColor,e.target.style.color);
	setNoteColor("hex:hover",document.getElementById("hoverColor").style.backgroundColor);
});
document.getElementById("mainColor").addEventListener("change",(e)=>{
	setNoteColor("blue-note",e.target.style.backgroundColor,e.target.style.color);
	setNoteColor("hex:hover",document.getElementById("hoverColor").style.backgroundColor);
});
document.getElementById("secColor").addEventListener("change",(e)=>{
	setNoteColor("lightblue-note",e.target.style.backgroundColor,e.target.style.color);
	setNoteColor("hex:hover",document.getElementById("hoverColor").style.backgroundColor);
});
document.getElementById("oppositeColor").addEventListener("change",(e)=>{
	setNoteColor("black-note",e.target.style.backgroundColor,e.target.style.color);
	setNoteColor("hex:hover",document.getElementById("hoverColor").style.backgroundColor);
});
document.getElementById("hoverColor").addEventListener("change",(e)=>{
	setNoteColor("hex:hover",e.target.style.backgroundColor);
});
document.getElementById("signalColor").addEventListener("change",(e)=>{
	setNoteColor("signal",e.target.style.backgroundColor);
	setNoteColor("hex:hover",document.getElementById("hoverColor").style.backgroundColor);
});