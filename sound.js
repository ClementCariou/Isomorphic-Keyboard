var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var notesb = ["C","C#","D","E♭","E","F","F#","G","G#","A","B♭","B"];
var attack = parseFloat(document.getElementById("attack").value);
var hold = parseFloat(document.getElementById("hold").value);
var release = parseFloat(document.getElementById("release").value);
var decay = parseFloat(document.getElementById("decay").value);
var oscCount = 8;
var currentOsc = 0;
var ac;

function initCompressor(){
	ac.comp = ac.createDynamicsCompressor();
	ac.comp.threshold.setValueAtTime(-4, ac.currentTime);
	ac.comp.knee.setValueAtTime(40, ac.currentTime);
	ac.comp.ratio.setValueAtTime(2, ac.currentTime);
	ac.comp.attack.setValueAtTime(0, ac.currentTime);
	ac.comp.release.setValueAtTime(0.25, ac.currentTime);
	ac.comp.connect(ac.destination)
}

function initConv(){
	var length = ac.sampleRate * 3;
	var impulse = ac.createBuffer(2, length, ac.sampleRate);
	var impulseL = impulse.getChannelData(0);
	var impulseR = impulse.getChannelData(1);
	for (i = 0; i < length; i++) {
		impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
	}
	ac.conv = ac.createConvolver();
	ac.conv.buffer = impulse;
	ac.conv.connect(ac.gain);
}

function initFilter(){
	ac.filter = ac.createBiquadFilter();
	ac.filter.type = document.getElementById("filter").value.toLowerCase();
	ac.filter.frequency.setValueAtTime(document.getElementById("frequency").value, ac.currentTime);
	ac.filter.Q.setValueAtTime(document.getElementById("qfactor").value, ac.currentTime);
	ac.filter.connect(ac.conv);
}

function initOscillators(){
	ac.osc = [];
	for(i = 0; i < oscCount; i++){
		ac.osc[i] = ac.createOscillator();
		ac.osc[i].gain = ac.createGain();
		ac.osc[i].gain.gain.setValueAtTime(0, ac.currentTime);
		ac.osc[i].connect(ac.osc[i].gain);
		ac.osc[i].gain.connect(ac.filter);
		ac.osc[i].start(ac.currentTime);
	}
}

function initAudio(){
	ac = new AudioContext();
	ac.gain = ac.createGain();
	ac.gain.gain.setValueAtTime(document.getElementById("gain").value, ac.currentTime);
	ac.gain.connect(ac.destination);
	initConv();
	initFilter();
	initOscillators();
}

window.addEventListener("mousemove", (e) => {
    if(!ac){
		initAudio();
	}
});

function playNote(note, octave){
	var distance = notes.indexOf(note);
	var freq = 440 * Math.pow( Math.pow( 2, 1 / 12 ), distance - 9 ) * Math.pow( 2, octave - 4);
	console.log(note+octave);
	//console.log(freq, distance, octave);
	ac.osc[currentOsc].type = document.getElementById("type").value.toLowerCase();
	ac.osc[currentOsc].frequency.cancelScheduledValues(ac.currentTime);
	ac.osc[currentOsc].frequency.setValueAtTime(freq, ac.currentTime);
	ac.osc[currentOsc].frequency.setValueAtTime(0, ac.currentTime + attack + hold + release);
	ac.osc[currentOsc].gain.gain.cancelScheduledValues(ac.currentTime);
	ac.osc[currentOsc].gain.gain.setValueAtTime(0, ac.currentTime);
	ac.osc[currentOsc].gain.gain.linearRampToValueAtTime(1, ac.currentTime + attack);
	ac.osc[currentOsc].gain.gain.setValueAtTime(1, ac.currentTime + attack + hold);
	ac.osc[currentOsc].gain.gain.linearRampToValueAtTime(0, ac.currentTime + attack + hold + release);
	currentOsc = (currentOsc+1)%oscCount;
}

document.getElementById("gain").addEventListener("change",(e)=>{
	ac.gain.gain.setValueAtTime(e.target.value, ac.currentTime);
});

document.getElementById("attack").addEventListener("change",(e)=>{
	attack = parseFloat(e.target.value);
});

document.getElementById("hold").addEventListener("change",(e)=>{
	hold = parseFloat(e.target.value);
});

document.getElementById("release").addEventListener("change",(e)=>{
	release = parseFloat(e.target.value);
});

document.getElementById("reverbs").addEventListener("change",(e)=>{
	document.getElementById("decay").disabled = !e.target.checked;
	ac.conv.disconnect();
	ac.filter.disconnect();
	if(e.target.checked){
		ac.filter.connect(ac.conv);
		ac.conv.connect(ac.gain);
	}else{
		ac.filter.connect(ac.gain);
	}
});

document.getElementById("decay").addEventListener("change",(e)=>{
	decay = parseFloat(e.target.value);
	ac.conv.disconnect();
	ac.filter.disconnect();
	initConv();
	ac.filter.connect(ac.conv);
});

document.getElementById("filter").addEventListener("change",(e)=>{
	ac.filter.type = e.target.value.toLowerCase();
	document.getElementById("qfactor").disabled = e.target.value.includes("shelf");
});

document.getElementById("frequency").addEventListener("change",(e)=>{
	ac.filter.frequency.setValueAtTime(e.target.value, ac.currentTime);
});

document.getElementById("qfactor").addEventListener("change",(e)=>{
	ac.filter.Q.setValueAtTime(e.target.value, ac.currentTime);
});