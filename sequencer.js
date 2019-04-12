var interval;
var iteration = -1;
var signals = [];
var downEvent = document.createEvent('Events');
downEvent.initEvent("mousedown", true, false);
var upEvent = document.createEvent('Events');
upEvent.initEvent("mouseup", true, false);

function reset(stop){
    iteration = 0;
    for(var signal of signals){
        signal.element.parentElement.classList.remove("signal");
    }
    signals = [];
    var markers = document.getElementsByClassName("marker");
    for(var marker of markers){
        signals.push({
            index: Array.prototype.slice.call(container.getElementsByTagName("DIV")).indexOf(marker),
            element: marker
        });
    }
    if(!stop){
        for(var signal of signals){
            signal.element.parentElement.classList.add("signal");
            if(signal.element.parentElement.style.opacity != 0.5){
                signal.element.dispatchEvent(downEvent);
                signal.element.dispatchEvent(upEvent);
            }
        }
    }
}

function transmit(index, angle){
    console.log(index, angle);
    var odd = Math.floor(index/width)%2;
    var offset;
    switch(angle){
        case   0: offset = -2*width; break;
        case  30: case  60: offset = odd? 1-width: -width; break;
        case  90: offset = 1; break;
        case 120: case 150: offset = odd? 1+width: width; break;
        case 180: offset = 2*width; break;
        case 210: offset = odd? width: width-1; break;
        case 240: offset = odd? width: width-1; break;
        case 270: offset = -1; break;
        case 300: offset = odd? -width: -width-1; break;
        case 330: offset = odd? -width: -width-1; break;
    }
    index += offset;
    if(angle > 0 && angle < 180 && index%width == 0 || angle > 180 && index%width == width-1)
        return false;
    if(index < 0 || index >= width*height)
        return false;
    return {
        index: index,
        element: container.getElementsByTagName("DIV")[index],
        angle: angle
    };
}

function update(){
    iteration++;
    if(iteration == parseInt(document.getElementById("iterations").value)){
        reset(false);
        return;
    }
    var newSignals = [];
    for(var signal of signals){
        signal.element.parentElement.classList.remove("signal");
        var pointers = signal.element.children;
        var redirected = false;
        for(var pointer of pointers){
            if(pointer.style.display == "block"){
                redirected = true;
                var angle = parseInt(pointer.className.substr(8));
                var newSignal = transmit(signal.index, angle);
                if(newSignal && !newSignals.find(s=>s.index==newSignal.index&&s.angle==newSignal.angle))
                    newSignals.push(newSignal);
            }
        }
        if(!redirected && typeof signal.angle === "number"){
            var newSignal = transmit(signal.index, signal.angle);
            if(newSignal && !newSignals.find(s=>s.index==newSignal.index&&s.angle==newSignal.angle))
            newSignals.push(newSignal);
        }
    }
    signals = newSignals;
    for(var signal of signals){
        signal.element.parentElement.classList.add("signal");
        if(signal.element.parentElement.style.opacity != 0.5){
            signal.element.dispatchEvent(downEvent);
            signal.element.dispatchEvent(upEvent);
        }
    }
}

document.getElementById("start").addEventListener("click",(e)=>{
    reset(false);
    if(!interval)
        interval = setInterval(update,60000/parseFloat(document.getElementById("tempo").value));
});

document.getElementById("stop").addEventListener("click",(e)=>{
    if(interval)
        clearInterval(interval);
    interval = false;
    reset(true);
});

document.getElementById("tempo").addEventListener("change",(e)=>{
    if(interval)
        clearInterval(interval);
    reset(false);
    interval = setInterval(update,60000/parseFloat(document.getElementById("tempo").value));
});

document.getElementById("channels").addEventListener("change",(e)=>{
    oscCount = e.target.value;
});