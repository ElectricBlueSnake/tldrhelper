// ==UserScript==
// @name         tldrhelper
// @namespace    Reddit
// @version      0.1
// @description  A simple script to help the awesome fellas at r/tldr
// @author       EB_Snake
// @include      https://*.reddit.com/*
// @include      http://*.reddit.com/*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

const SAVE_BUTTON = 'save tldr'; 
const REMOVE_BUTTON = 'remove tldr';
const CLEAR_BUTTON_ID = 'clear-tldrs';
const POPUP_ID = 'tldr-popup';
const SAVED_TLDRS = 'savedTldrs';
const SAVED_SUBREDDITS = 'savedSubs';
const PRIORITIES = 'priorities';  // stores the order in which subreddits should be displayed
const SOTD = 'subredditOfTheDay';

function updateLink(tldr){
    var tldrs = JSON.parse(GM_getValue(SAVED_TLDRS, '{}'));
    var id = tldr['id'];
    if (id in tldrs) {
        // need to remove the element
        delete tldrs[id];
        GM_setValue(SAVED_TLDRS, JSON.stringify(tldrs));
        var button = document.getElementById(id);
        if (button) {
        	button.innerHTML = SAVE_BUTTON;
        }
    } else {
        // need to add the element
        tldrs[id] = tldr;
        GM_setValue(SAVED_TLDRS, JSON.stringify(tldrs)); 
        document.getElementById(id).innerHTML = REMOVE_BUTTON;
    }
}

/** Adds a new subreddit at the bottom of the priorities list if it does not already exist in the priorities array*/
function addPriority(subreddit){
	var priorities = JSON.parse(GM_getValue(PRIORITIES, '[]'));
	if (!priorities.includes(subreddit)){
		priorities.push(subreddit); 
	}
	GM_setValue(PRIORITIES, JSON.stringify(priorities));
}

/** Moves s1 right before s2 in the priority list */
function updatePriority(s1, s2){
	var priorities = JSON.parse(GM_getValue(PRIORITIES, '[]'));
	var i = priorities.indexOf(s1);
	var j = priorities.indexOf(s2);
	if(i != -1 && j != -1 && i > j){
		priorities.splice(i, 1);
		priorities.splice(j, 0, s1);
	}
	GM_setValue(PRIORITIES, JSON.stringify(priorities));
}

/** Returns a list with the saved submissiosn in subreddit priority order */
function sortTldrs(){
	var tldrs = JSON.parse(GM_getValue(SAVED_TLDRS, '{}'));
	var priorities = JSON.parse(GM_getValue(PRIORITIES, '[]'));
	var sorted = [];
	for (var i = 0; i < priorities.length; i++) {
		for (var id in tldrs){
			if (tldrs[id]['subreddit'] == priorities[i]) {
				sorted.push(tldrs[id]);
			}
		}
	}
	return sorted;
}

/* Inserts a button that allows to store this subreddit */
function insertSubredditButton(subreddit){
	var side = document.getElementsByClassName('side');
	var savedSubs = new Set(JSON.parse(GM_getValue(SAVED_SUBREDDITS, '[]')));
	if (side.length > 0){
		if (savedSubs.has(subreddit)) {
			var text = "Remove sub";
		} else {
			var text = "Save sub";
		}
		var newButton = `
	        <div class="spacer">
	            <div class="sidebox submit" style="display:block">
	                <div class="morelink">
	                    <a href="javascript: return false" target="_top" id="tldr-sotd" value="`+ subreddit +`">`+ text +`</a>
	                    <div class="nub"></div>
	                </div>
	            </div>
	        </div>`;
		side[0].children[1].insertAdjacentHTML('afterend', newButton);
	}
	document.getElementById('tldr-sotd').addEventListener("click", function () {
		var savedSubs = new Set(JSON.parse(GM_getValue(SAVED_SUBREDDITS, '[]')));
		var subreddit = this.getAttribute('value');
		if (savedSubs.has(subreddit)) {
			savedSubs.delete(subreddit);
			this.innerHTML = "Save sub";
		} else {
			savedSubs.add(subreddit);
			this.innerHTML = "Remove sub";
		}
		GM_setValue(SAVED_SUBREDDITS, JSON.stringify(Array.from(savedSubs)));
	}, false);
}

/** Inserts 'save tldr' / 'remove tldr' buttons near to each reddit link found in the page*/
function appendButtons(){
    var links = document.getElementsByClassName('link thing');
    var tldrs = {};
	var match = /r\/\w+/g.exec(window.location);
	if (match) {
		insertSubredditButton(match[0]);
	}
    for (var i = 0; i < links.length; i++){
        var id = /t3_(\w+)/g.exec(links[i].id)[1];
        var div = links[i].getElementsByClassName('top-matter')[0];
        var elems = div.getElementsByTagName('a');
        if (div.getElementsByClassName('recommended-stamp').length > 0) {
            continue;  // Reddit ad, not to be considered
        }
        if (match) {
        	// we are in a subreddit page.
        	var subreddit = match[0];
        	if (elems.length < 4) {
        		var comments = document.location.href;
        	} else {
        		var comments = elems[3].getAttribute('href');        		
        	}
        } else {
        	// we are in the mainpage
            var subreddit = elems[3].innerHTML;
	        var comments = elems[4].getAttribute('href');   	
        }
        var tldr = {
            'id': id,
            'title': elems[0].innerHTML,
            'link': elems[0].getAttribute('href'),
            'author': elems[2].innerHTML,
            'subreddit': subreddit,
            'comments': comments
    	};
        addPriority(subreddit);
        tldrs[id] = tldr;
        /* Inserts "save tldr" link in the ul flat list */
        var uls = links[i].getElementsByTagName('ul');
        var ul = uls[uls.length-1];
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', 'javascript: void(0)');
        a.addEventListener("click", function(){
            updateLink(tldrs[this.id]);
        }, false);
        a.setAttribute('id', id);
        var saved = GM_getValue(SAVED_TLDRS, "{}");
        var isSaved = id in JSON.parse(saved);
        if (isSaved){
            a.appendChild(document.createTextNode(REMOVE_BUTTON));
        } else {
            a.appendChild(document.createTextNode(SAVE_BUTTON));
        }
        li.appendChild(a);
        ul.appendChild(li);
    }    
}

function insertCell(tr, content){
	var td = tr.insertCell();
	td.insertAdjacentHTML('beforeend', content);
	td.style.padding = "2px 5px 2px 5px";
	return td;
}

function createPopup(){
    var div = document.createElement('div');
    div.setAttribute('class', "modal fade tldr-helper");
    div.setAttribute('style', "display: none");
    div.setAttribute('aria-hidden', true);
    var content = `<div class="modal-dialog modal-dialog-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <div class="modal-header-close">
                                    <a href="javascript: void 0;" class="c-close c-hide-text" data-dismiss="modal" id="tldr-close">close this window</a>
                                </div>
                            </div>
                            <div class="modal-body">
                                <div class="interstitial" id="`+POPUP_ID+`">
                                </div>
                            </div>
                        </div>
                    </div>`;
    div.insertAdjacentHTML('beforeend', content);
    document.body.appendChild(div);
    document.getElementById('tldr-close').addEventListener("click", function (){
        hidePopup();
    }, false);
    updatePopup();
    /* Adds a button in the sidebar that calls the popup previously created*/
    var side = document.getElementsByClassName('side');
    if (side.length > 0) {
        var spacer = `
        <div class="spacer">
            <div class="sidebox submit" style="display:block">
                <div class="morelink">
                    <a href="#" target="_top" id="open-tldr">Manage TLDR</a>
                    <div class="nub"></div>
                </div>
            </div>
        </div>`;
        side[0].children[1].insertAdjacentHTML('afterend', spacer);
        document.getElementById('open-tldr').addEventListener("click", function () {
            displayPopup();
        }, false);
    }
}

/** Inserts saved links into the popup. The links are grouped by subreddit */
function updatePopup(){
	var stored = sortTldrs();
	var subreddits = [];
	for (var i = 0; i < stored.length; i++) {
		if (!subreddits.includes(stored[i]['subreddit'])) {
			subreddits.push(stored[i]['subreddit']);
		}
	}
	var div = document.getElementById(POPUP_ID);
	div.innerHTML = '';
	var table = document.createElement('table');
	table.style.fontSize = 'medium';
	table.style.height = "500px";
	table.style.overflowY = "scroll";
	table.style.display = "block";
	table.style.borderBottom = "1px solid gray";
	div.appendChild(table);
	for (var i = 0; i < subreddits.length; i++) {
		var tr = table.insertRow();
		var arrows = insertCell(tr, '<div class="arrow up" role="button" type="up"></div><div class="arrow down" role="button" type="down"></div>');
		arrows.setAttribute('value', i);
		var arrowUp = arrows.children[0];
		var arrowDown = arrows.children[1];
		if (i != 0) {
			arrowUp.addEventListener("click", function () {
				var i = parseInt(this.parentNode.getAttribute('value'));
				updatePriority(subreddits[i], subreddits[i-1]);
				updatePopup();
			}, false);
		} else {
			arrowUp.style.display = 'none';
		}
		if (i != subreddits.length-1){
			arrowDown.addEventListener("click", function () {
				var i = parseInt(this.parentNode.getAttribute('value'));
				updatePriority(subreddits[i+1], subreddits[i]);
				updatePopup();
			}, false);
		} else {
			arrowDown.style.display = "none";
		}
		insertCell(tr, '<a href="https://reddit.com/'+subreddits[i]+'">'+subreddits[i]+'</a>');
		tr.style.borderTop = "1px solid gray";
		var td = insertCell(tr, '');
		var innerTable = document.createElement('table');
		td.appendChild(innerTable);
		var first = true;
		for (var j = 0; j < stored.length; j++) {
			if (stored[j]['subreddit'] == subreddits[i]){
				var innerTr = innerTable.insertRow();
				if (!first) {
					innerTr.style.borderTop = "1px solid gray";
				}
				var title = insertCell(innerTr, '<a href="'+stored[j]['link']+'">'+stored[j]['title']+'</a>');
				title.style.minWidth = "320px";
				insertCell(innerTr, '<a href="'+stored[j]['comments']+'">Comments</a>');
				var removeBtn = insertCell(innerTr, '<a href="javascript: return false;">Remove</a>');
				removeBtn.setAttribute('value', j);
				removeBtn.addEventListener("click", function() {
					var k = parseInt(this.getAttribute('value'));
					console.log(stored, this);
					updateLink(stored[k]);
					updatePopup();
				}, false);
				first = false;	
			}
		}
	}
	/* Adds a button at the bottom of the div to remove all saved tldrs*/
	var clearButton = `
		<div id="popup-bottom">            
			<div class="buttons">
	            <a href="javascript: return false;" class="c-btn c-btn-primary" id="`+CLEAR_BUTTON_ID+`">CLEAR ALL</a>
	        </div>
	        <label>Subreddit of the day</label>
        </div>`;
	div.insertAdjacentHTML('beforeend', clearButton);
	var clearButton = document.getElementById(CLEAR_BUTTON_ID);
	clearButton.addEventListener("click", function () {
		GM_setValue(SAVED_TLDRS, '{}');
		window.location.reload();
	}, false);
	/* Adds a selector for the subreddit of the day */
	var bottom = document.getElementById('popup-bottom');
	var select = document.createElement('select');
	select.id = 'select-sotd';
	bottom.appendChild(select);
	var chosen = GM_getValue(SOTD);
	var savedSubs = JSON.parse(GM_getValue(SAVED_SUBREDDITS, '[]'));
	for (var i = 0; i < savedSubs.length; i++) {
		var option = new Option(savedSubs[i], savedSubs[i]);
		select.appendChild(option);
	}
	if (chosen) {
		select.value = chosen;
	}
	select.addEventListener("change", function () {
		console.log("Changed subreddit of the day to", this.value);
		GM_setValue(SOTD, this.value);
	}, false);
}

function displayPopup(){
    var popup = document.getElementsByClassName('tldr-helper')[0];
    updatePopup();
    popup.setAttribute('aria-hidden', false);
    popup.setAttribute('style', 'display: block;');
    popup.setAttribute('class', "modal fade tldr-helper in");
}

function hidePopup(){
    var popup = document.getElementsByClassName('tldr-helper')[0];
    popup.setAttribute('class', "modal fade tldr-helper");
    popup.setAttribute('style', "display: none");
    popup.setAttribute('aria-hidden', true);   
}

/** Returns the formatted post from the saved links */
function formatPost(){
	// TODO http request to reddit API to retrieve top 3 posts
	var http = new XMLHttpRequest();
	var sotd = GM_getValue(SOTD, '');
	var url = "https://www.reddit.com/" + sotd + "/top.json";
	var params = JSON.stringify({ 'limit': 3 });
	http.onreadystatechange = function() { 
        if (http.readyState == 4 && http.status == 200){
			var output = "";
			var stored = sortTldrs();
			var subreddits = [];
			for (var i = 0; i < stored.length; i++) {
				if (!subreddits.includes(stored[i]['subreddit'])) {
					subreddits.push(stored[i]['subreddit']);
				}
			}
			for (var i = 0; i < subreddits.length; i++) {
				output += "#[/" + subreddits[i] + "](https://reddit.com/"+subreddits[i]+")\n\n";
				for (var j = 0; j < stored.length; j++) {
					if (stored[j]['subreddit'] == subreddits[i]){
						output += "- [**/u/" + stored[j]['author'] + "**](https://reddit.com/u/" + stored[j]['author'] + ")\n\n " +
									"**" + stored[j]['title'] + "**\n\n " +
									"[**Comments**](" + stored[j]['comments'] + ") || [**Link**](" + stored[j]['link'] + ")\n\n";
					}
				}
				output += "&nbsp;\n\n---\n---\n";
			}
			output += "#Something New\n\nEveryday we’ll feature a selected small subreddit and its top content. It's a fun way to include and celebrate smaller subreddits.\n\n" +
						"#Today's subreddit is...\n\n#[/"+sotd+"](https://reddit.com/"+sotd+")\n\nIts top 3 all time posts\n\n";
        	var response = JSON.parse(http.responseText)['data'];
        	console.log(response['children'][0]);
            for (var i = 0; i < 3; i++) {
				output += "- [**/u/" + response['children'][i]['data']['author'] + "**](https://reddit.com/u/" + response['children'][i]['data']['author'] + ")\n\n " +
							"**" + response['children'][i]['data']['title'] + "**\n\n " +
							"[**Comments**](" + response['children'][i]['data']['permalink'] + ") || [**Link**](" + response['children'][i]['data']['url'] + ")\n\n";            	
            }
            output += "&nbsp;\n\n---\n---\n---";
			var textAreas = document.getElementsByTagName('textarea');
			textAreas[1].value = output;	
        }
    }
   	http.open("GET", url, true);
	http.send(params);
}

window.addEventListener('load', function() {
    'use strict';
    appendButtons();
    createPopup();
	var match = /r\/tldr/g.exec(window.location.href);
	if (match) {
		formatPost();
	}
}, false);
