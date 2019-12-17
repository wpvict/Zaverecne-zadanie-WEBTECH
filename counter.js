//Next if/else logic required to assign additional (our) handler to window.onload event.
//We are trying to stack it additionally to existing handlers without usual equality assignment.
if(window.attachEvent) {
    window.attachEvent('onload', onLoadCounter);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function(evt) {
            curronload(evt);
            onLoadCounter(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = onLoadCounter;
    }
}

//For debug purposes.
function say(text){
    alert(text);
}


//Local event handler to maintain loading counter logic here.


function onLoadCounter(){
    var counter = document.getElementById('counter');
    if(!counter){
        return;
    }
    setCounter(counter);
}

function setCounter(counter){
    var cookie = getCounterCookie();
    var visits = 0;
    if(cookie){
        visits = parseInt(cookie);
    }
    visits = visits + 1;
    setCounterCookie(visits);
    counter.value = visits;
}

function setCounterCookie(value) {
    document.cookie = "privateCounterTrafficTask=" + (value || "");
}

function getCounterCookie() {
    var nameEQ = "privateCounterTrafficTask=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}