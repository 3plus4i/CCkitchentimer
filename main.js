if(CCkt === undefined) var CCkt = {
    init:function(){
        // add css for the ascension log
        var css = document.createElement('style');
        css.innerHTML = `
            #CCktLogButton {font-weight: bold; margin: 5px}
            #CCktTotalTime {font-weight: bold}
            #CCktTableBox {
                max-height: 25em;
                width: 510px;
                overflow-y: auto
            }
            #CCktLogTable {
                text-align: right;
                width: 480px;
                margin: 10px 0px 10px 5px
            }
            .CCkt.ascension_log th {
                border-collapse: collapse;
                border-bottom: thin solid rgb(204, 204, 204);
                font-weight: bold
            }
            .CCkt.ascension_log th, .CCkt.ascension_log td {padding: 3px}
            .CCkt.ascension_log tr:nth-child(2n+3) {background: rgba(0,0,0,0.3);}
            
        `
        document.head.appendChild(css);
        
        // add button for the ascension log to Game.UpdateMenu()
        Game.UpdateMenu = new Function(Game.UpdateMenu.toString().slice(11).replace('giftStr+\'</div>\':\'\')', 'giftStr+\'</div>\':\'\')+\'<div class="listing" id="CCktLogButton"><a class="option CCkt" onclick="CCkt.showLog()">Ascension log</a></div>\''));
        
        Game.registerHook('reset', CCkt.reset);
        Game.registerHook('reincarnate', CCkt.reincarnate);
        setInterval(CCkt.checkAscensionStatus, 5000);
        
        if (Game.modSaveData.CCkt) {
            CCkt.load(Game.modSaveData.CCkt);
            CCkt.backup = Game.modSaveData.CCkt;
        } else CCkt.clearData();
        CCkt.isLoaded = 1;
    },
    isLoaded: 0,
    lastT: Date.now(), // timestamp for the last data update
    logOpen: 0,
    isAscending: 0,
    data: {
        sVersion: 1,
        f: 0, // mod data carries over if you import a save that has no data stored for this mod, so we use Game.startDate as a fingerprint
        totalT: 0, // time the game has been running since start
        ascensions: [], //log of previous ascensions
        curAscension: 0, //time played this ascension
        resets: 1 //technically this is the number of the current ascension, not number of ascensions done
    }
}
 
CCkt.showLog = function(){
    // creates the prompt for the ascension log
    var str = '<h3>Ascension log</h3><div class="block">total play time: <span id="CCktTotalTime">'
        + CCkt.formatTime(Date.now() - CCkt.lastT + CCkt.data.totalT)
        + '</span></div><div id="CCktTableBox"><table class="CCkt ascension_log" id="CCktLogTable"><tr><th>#</th><th>HC</th><th>Cookies Baked</th><th>Duration</th><th>Playtime</th></tr>';
    if (CCkt.data.ascensions.length) {
        for (i of CCkt.data.ascensions) {
            str += '<tr><td>' + i[0] + '</td><td>' + (typeof(i[1])=='string'?i[1]:'+'+Beautify(i[1])) + '</td><td>'
                + Beautify(i[2]) + '</td><td>' + CCkt.formatTime(i[3]) + '</td><td>' + CCkt.formatTime(i[4]) + '</td></tr>';
        }
    }
    str += '<tr><td>' + CCkt.data.resets + '</td><td id="CCktCurrentHC">' + (CCkt.mode?Game.ascensionModes[CCkt.mode.toString()].name:'+'
        +Beautify(Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned))-Math.floor(Game.HowMuchPrestige(Game.cookiesReset))))
        + '</td><td id="CCktCurrentCookies">' + Beautify(Game.cookiesEarned) + '</td><td id="CCktCurrentDuration">' + CCkt.formatTime(Date.now()-Game.startDate)
        + '</td><td id="CCktCurrentPlaytime">' + CCkt.formatTime(Date.now()-CCkt.lastT+CCkt.data.curAscension) + '</td></tr></table></div>';
    
    CCkt.logOpen=0;
    Game.Prompt(str, [['Back', 'Game.ClosePrompt();']], CCkt.updateLog, 'widePrompt');
}

CCkt.updateLog = function(){
    // runs while the log is open
    if (!CCkt.logOpen || !CCkt.tt) {
        CCkt.logOpen = 1;
        CCkt.tt = l("CCktTotalTime");
        CCkt.ch = Game.ascensionMode?0:l("CCktCurrentHC");
        CCkt.cc = l("CCktCurrentCookies");
        CCkt.cd = l("CCktCurrentDuration");
        CCkt.ct = l("CCktCurrentPlaytime");
    } else {
        CCkt.tt.innerHTML = CCkt.formatTime(Date.now() - CCkt.lastT + CCkt.data.totalT);
        if (CCkt.ch) CCkt.ch.innerHTML = '+'+Beautify(Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned))-Math.floor(Game.HowMuchPrestige(Game.cookiesReset)))
        CCkt.cc.innerHTML = Beautify(Game.cookiesEarned);
        CCkt.cd.innerHTML = CCkt.formatTime(Date.now()-Game.startDate);
        CCkt.ct.innerHTML = CCkt.formatTime(Date.now()-CCkt.lastT+CCkt.data.curAscension);
    }
}

CCkt.formatTime = function(time){
    // format times for the log, without reducing precision
    var str = '',
        p = 0;
    
    time = Math.floor(time / 1000);
    p = Math.floor(time / 86400);
    if (p > 0) {
        str += Math.floor(time / 86400) + ':';
        time -= p * 86400;
    }
    p = Math.floor(time / 3600);
    if (p > 0) {
        if (p < 10) str += '0';
        str += Math.floor(time / 3600) + ':';
        time -= p * 3600; 
    } else str += '00:';
    p = Math.floor(time / 60);
    if (p > 0) {
        if (p < 10) str += '0';
        str += Math.floor(time / 60) + ':';
        time -= p * 60;
    } else str += '00:';
    if (time > 0) {
        if (time < 10) str += '0';
        str += time;
    } else str += '00';
    
    return str;
}

CCkt.save = function(){
    var t = Date.now();
    CCkt.data.totalT = t - CCkt.lastT + CCkt.data.totalT;
    CCkt.data.curAscension += t - CCkt.lastT;
    CCkt.lastT = t;
    return JSON.stringify(CCkt.data);
}

CCkt.load = function(save){
    CCkt.data = JSON.parse(save);
    CCkt.mode = Game.ascensionMode;
    CCkt.legacyCookies = Game.cookiesReset;
    CCkt.startT = Game.startDate;
    CCkt.lastT = Date.now();
    isAscending = 0;
    if (typeof CCkt.data.f == 'undefined') CCkt.data.f = Game.fullDate;
    else if (CCkt.data.f != Game.fullDate) CCkt.clearData();
}

CCkt.clearData = function(){
    console.log("clear data\n"+Game.modSaveData.CCkt+"\nCCkt.data.f   : "+CCkt.data.f+"\nGame.fullDate: "+Game.fullDate);
    CCkt.data.totalT = 0;
    CCkt.data.ascensions.length = 0;
    CCkt.data.curAscension = 0;
    CCkt.data.resets = Game.resets + 1;
    CCkt.data.f = Game.fullDate;
    CCkt.mode = Game.ascensionMode;
    CCkt.legacyCookies = Game.cookiesReset;
    CCkt.startT = Game.startDate;
}

CCkt.checkAscensionStatus = function(){
    if (Game.OnAscend) {
        if (!CCkt.isAscending) {
            CCkt.isAscending = 1;
            CCkt.ascend();
        }
    }
}

CCkt.ascend = function(){
    var t = Date.now() - CCkt.lastT + CCkt.data.curAscension;
    if (t > 300000) {
        var pos = CCkt.data.ascensions.push([])-1;
        CCkt.data.ascensions[pos].push(CCkt.data.resets);
        CCkt.data.ascensions[pos].push(CCkt.mode?Game.ascensionModes[CCkt.mode.toString()].name
            :Math.floor(Game.HowMuchPrestige(Game.cookiesReset+(CCkt.isAscending?Game.cookiesEarned:0)))-Math.floor(Game.HowMuchPrestige(CCkt.legacyCookies)));
        CCkt.data.ascensions[pos].push(CCkt.isAscending?Game.cookiesEarned:(Game.cookiesReset-CCkt.legacyCookies));
        CCkt.data.ascensions[pos].push(Date.now()-CCkt.startT);
        CCkt.data.ascensions[pos].push(t);
    }
    CCkt.data.totalT += Date.now() - CCkt.lastT;
    CCkt.lastT = Date.now();
}

CCkt.reset = function(h){
    if (h) {
        // hard reset
        CCkt.data.totalT = 0;
        CCkt.data.ascensions.length = 0;
        CCkt.data.curAscension = 0;
        CCkt.data.resets = 1;
        CCkt.data.f = Game.fullDate;
        CCkt.mode = Game.ascensionMode;
        CCkt.legacyCookies = 0;
        CCkt.isAscending = 0;
        CCkt.startT = Game.startDate;
        CCkt.lastT = Date.now();
    }
}

CCkt.reincarnate = function(){
    if (!CCkt.isAscending) CCkt.ascend();
    var t = Date.now();
    CCkt.data.totalT += t - CCkt.lastT;
    CCkt.lastT = t;
    CCkt.data.curAscension = 0;
    CCkt.data.resets++;
    CCkt.mode = Game.ascensionMode;
    CCkt.legacyCookies = Game.cookiesReset;
    CCkt.startT = Game.startDate;
    CCkt.isAscending = 0;
}

if(!CCkt.isLoaded) Game.registerMod("CCkt", CCkt);

