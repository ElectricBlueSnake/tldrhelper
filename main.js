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
const SAVED_IDS = 'savedIds';
const SAVED_TLDRS = 'savedTldrs';

function updateLink(tldr){
    var saved = JSON.parse(GM_getValue(SAVED_IDS, '{}'));
    var tldrs = JSON.parse(GM_getValue(SAVED_TLDRS, '{}'));
    var id = tldr['id'];
    if (id in saved) {
        // need to remove the element
        delete tldrs[id];
        delete saved[id];
        GM_setValue(SAVED_IDS, JSON.stringify(saved));
        GM_setValue(SAVED_TLDRS, JSON.stringify(tldrs));
        document.getElementById(id).innerHTML = SAVE_BUTTON;
    } else {
        // need to add the element
        saved[id] = id;
        tldrs[id] = tldr;
        GM_setValue(SAVED_IDS, JSON.stringify(saved));
        GM_setValue(SAVED_TLDRS, JSON.stringify(tldrs)); 
        document.getElementById(id).innerHTML = REMOVE_BUTTON;
    }
}

function appendButtons(){
    var links = document.getElementsByClassName('link');
    var tldrs = {};
    for (var i = 0; i < links.length; i++){
        var id = /t3_(\w+)/g.exec(links[i].id)[1];
        var elems = links[i].getElementsByTagName('a');
        if (elems.length < 6) {
            continue;  // Reddit ad, not to be considered
        }
        var tldr = {
            'id': id,
            'title': elems[1].innerHTML,
            'link': elems[1].getAttribute('href'),
            'author': elems[3].innerHTML,
            'subreddit': elems[4].innerHTML,
            'comments': elems[5].getAttribute('href')
        };
        tldrs[id] = tldr;
        var uls = links[i].getElementsByTagName('ul');
        var ul = uls[uls.length-1];
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.setAttribute('href', 'javascript: void(0)');
        a.addEventListener("click", function(){
            updateLink(tldrs[this.id]);
        }, false);
        a.setAttribute('id', id);
        console.log(a);
        var saved = GM_getValue(SAVED_IDS, "{}");
        var isSaved = id in JSON.parse(saved);
        if (isSaved){
            a.appendChild(document.createTextNode(REMOVE_BUTTON));
        } else {
            a.appendChild(document.createTextNode(SAVE_BUTTON));
        }
        a.setAttribute('saved', isSaved);
        li.appendChild(a);
        ul.appendChild(li);
    }    
}

window.addEventListener('load', function() {
    'use strict';
    appendButtons();
}, false);
