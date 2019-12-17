//Next if/else logic required to assign additional (our) handler to window.onload event.
//We are trying to stack it additionally to existing handlers without usual equality assignment.
if(window.attachEvent) {
    window.attachEvent('onload', onLoadNames);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function(evt) {
            curronload(evt);
            onLoadNames(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = onLoadNames;
    }
}

//For debug purposes.
function say(text){
    alert(text);
}


//Local event handler to maintain loading names-dates logic here.
function onLoadNames(){
    var line = document.getElementById('names_line');
    if(!line){
        return;
    }
    readNames(line);
}

function readNames(line){
    //Get local xml file with names data.
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'names.xml', true);
    xhr.timeout = 2000;
    xhr.onload = function () {
      //Handler for the case when xml file was found and loaded.
      var r = this.responseXML;
      line.innerText = parseNamesXml(r);
    };
    xhr.ontimeout = function (e) {
      //Handler to write error info into console.
      console.log(e);
    };
    xhr.send(null);
}

function parseNamesXml(xml){
    // Stupid check but - become assured that xml document is not null.
    if(!xml){
        return '';
    }
    //create dictionary with names-dates where the key is date in format 'MMDD' (as 'den' property in xml file.)
    var obj = {};
    // Get the list of all nodes.
    var allNodes = xml.getElementsByTagName('zaznam');
    if(!allNodes){
        // Exit if any node found.
        return '';
    }
    //Read every node and write it's data into our local object to use it in the future.
    for(i = 0; i < allNodes.length; i++){
        var dayNode = allNodes[i];
        d = {};
        d.search = [];
        for(j = 0; j < dayNode.children.length; j++){
            if(dayNode.children[j].nodeName === 'den'){
                d.day = dayNode.children[j].innerHTML;
            }
            else if(dayNode.children[j].nodeName === 'SK'){
                d.sk = dayNode.children[j].innerHTML;
                d.search = d.sk.toLowerCase().replace(/ /g, '').split(',');
            }
            else if(dayNode.children[j].nodeName === 'SKd'){
                d.skd = dayNode.children[j].innerHTML;
                d.search = d.search.concat(d.skd.toLowerCase().replace(/ /g, '').split(','));
            }
            else if(dayNode.children[j].nodeName === 'SKsviatky'){
                d.holiday = dayNode.children[j].innerHTML;
            }
        }
        if(d.day){
            obj[d.day] = d;
        }
    }
    // Make our names/dates object global to allow it to be visible during entire page lifetime.
    window.names = obj;
    // Get current date.
    dateNow = getDateLocal();
    //Getting marquee element data.
    return getDayInfoByDate(dateNow);
}

function getDayInfoByDate(date){
    var o = window.names[date.localTechnical];
    if(!o){
        return '';
    }
    var info = 'Datum je ' + date.toStringLocal + '. ';
    if(o.holiday){
        info += 'Sviatok ' +  o.holiday + '. ';
    }
    if(o.skd){
        info += 'Meniny maju: ' +  o.skd;
    }
    else if(o.sk){
        info += 'Meniny maju: ' +  o.sk;
    }
    return info;
}

function getDateLocal(){
    // Get current date
    var d = new Date();
    var result = {};
    // Get single values of date object (day, month, year) and assign it to internally specified object keeping date info
    result.day = d.getDate();
    result.month = d.getMonth() + 1;
    result.year = d.getFullYear();
    //Create a couple of properties which will return specific string format of the date.
    result.toStringLocal = result.day.toString() + '.' + result.month.toString() + '.' +  result.year.toString();
    result.localTechnical = result.month.toString() + result.day.toString();
    return result;
}

function findDateByName(){
    // Find info text area if not found - exit.
    var textArea = document.getElementById('name_info');
    if(!textArea){
        return;
    }
    // If text area was found - clean it.
    textArea.innerText = '';
    // Find textbox with name search data if not found - exit.
    var nameText = document.getElementById('name_search');
    if(!nameText || !nameText.value || !window.names){
        return;
    }
    // Find textbox with date search data if found - clean it.
    var dateText = document.getElementById('date_search');
    if(dateText){
        dateText.value = '';
    }
    //Create container to put found date into.
    var foundDates = [];
    //Make search field lowercase as search containers values in day-name objects.
    var searchValue = nameText.value.toLowerCase();
    for (var key in window.names) {
        // iterate over dictionary and try to find name in 'search' properties.
        var d = window.names[key];
        if (d && d.search.includes(searchValue)) {
            var result = key[2] + key[3] + '.' + key[0] + key[1];
            foundDates.push(result);
        }
    }
    textArea.innerText = foundDates.join(', ');
}

function findNameByDate(){
    // Find info text area if not found - exit.
    var textArea = document.getElementById('name_info');
    if(!textArea){
        return;
    }
    // If text area was found - clean it.
    textArea.innerText = '';
    // Find textbox with date search data if not found - exit.
    var dateText = document.getElementById('date_search');
    if(!dateText || !dateText.value || !window.names){
        return;
    }
    // Find textbox with name search data if found - clean it.
    var nameText = document.getElementById('name_search');
    if(nameText){
        nameText.value = '';
    }
    // Split date text by '.' sign to get dey and month.
    var splitted = dateText.value.split('.');
    if(splitted.length && splitted.length != 2){
        // If there is invalid date (impossible but paranoic check required) - then exit.
        return;
    }
    // Combine month and date values into single unique value to search over name-dates dictionary.
    var month = splitted[1];
    var day = splitted[0];
    if(month.length == 1){
        month = '0' + month
    }
    if(day.length == 1){
        day = '0' + day
    }
    var searchDate = month + day;
    // Find target date.
    var result = window.names[searchDate];
    if(!result || (!result.sk && !result.skd)){
        //Exit if not found or if there are empty SK and SKd properties (nothing to show).
        return;
    }
    // Assign found values to  info text area.
    //First of all trying to assign pretty value (with diacritics)
    // and if not found then assign at least non-diecritics values.
    textArea.innerText = result.skd || result.sk;
}
