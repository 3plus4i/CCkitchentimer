if(CCkt === undefined) var CCkt = {
    init:function(){
        // the game doesn't trigger the load method if the loaded save has no data stored for the mod
        // we need to know though if a save was loaded to reset data, so we have to change the function
        Game.loadModData = new Function('return '+Game.loadModData.toString().slice(0, -1)+'CCkt.checkSave(0);}');
        
        // add css for the ascension log
        var css = document.createElement('style');
        css.innerHTML = `
            #CCktTotalTime{font-weight: bold}
            .CCkt.ascension_log {text-align: right; width: 100%}
            th .CCkt.ascension_log {
                border-collapse: collapse;
                border-bottom: thin solid white;
                font-weight: bold
            }
            td .CCkt.ascension_log {padding-left: 5px; padding-right: 5px;}
            .CCkt.ascension_log tr:nth-child(even) {background: rgba(0,0,0,0.3);}
            
        `
        document.head.appendChild(css);
        
        Game.registerHook('reset', CCkt.reset);
        Game.registerHook('reincarnate', CCkt.reincarnate);
        CCkt.checkSave(1);
    },
    lastT: Date.now(),
    logOpen: 0,
    data: {
        sVersion: 1,
        totalT: 0,
        ascensions: [], //log of previous ascensions
        curAscension: 0, //time played this ascension
        resets: 1 //technically this is the number of the current ascension, not number of ascensions done
    }
}
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');

CCkt.launch = function(){
    CCkt.isLoaded = 1;
    Game.registerMod("CCkt", CCkt);
    Game.customStatsMenu.push(function(){
        CCSE.AppendStatsGeneral('<a class="option" onclick="CCkt.showLog()">Ascension log</a>');
    });
}
 
CCkt.showLog = function(){
    // creates the prompt for the ascension log
    var str = '<h3>Ascension log</h3><div class="block">total play time: <span id="CCktTotalTime">'
        + CCkt.formatTime(Date.now() - CCkt.lastT + CCkt.data.totalT)
        + '</span></div><div><table class="CCkt ascension_log"><tr><th>Ascension</th><th>HC</th><th>Cookies Baked</th><th>Duration</th><th>Playtime</th></tr>';
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
    //console.log(save);
    CCkt.data = JSON.parse(save);
}

CCkt.checkSave = function(init){
    var t = Date.now()
    
    CCkt.mode = Game.ascensionMode;
    CCkt.legacyCookies = Game.cookiesReset;
    CCkt.startT = Game.startDate;
    
    if (!Game.modSaveData.CCkt) {
        CCkt.data.totalT = 0;
        CCkt.data.ascensions.length = 0;
        CCkt.data.curAscension = 0;
        CCkt.data.resets = Game.resets + 1;
        if (init) {
            CCkt.data.totalT = t - CCkt.lastT;
            CCkt.data.curAscension = t - CCkt.lastT;
        }
        CCkt.lastT = t;
        
        // For testing. Don't forget to remove!
        CCkt.data.ascensions = [[1, 440, 85184341083213078917, 920808556, 97734430], [2, 2983, 26543596087268840714913, 79089653597, 66299844], [4, 'Born again', 1099749010101, 7075568, 7075568]];
    } else if (init) {
        CCkt.load(Game.modSaveData.CCkt);
        CCkt.data.totalT = t - CCkt.lastT;
        CCkt.data.curAscension = t - CCkt.lastT;
        CCkt.lastT = t;
    }
}

CCkt.reset = function(h){
    if (h) {
        // hard reset
        CCkt.data.totalT = 0;
        CCkt.data.ascensions.length = 0;
        CCkt.data.curAscension = 0;
        CCkt.data.resets = 1;
        CCkt.mode = Game.ascensionMode;
        CCkt.legacyCookies = 0;
        CCkt.startT = Game.startDate;
    } else {
        // ascension
        var t = Date.now() - CCkt.lastT + CCkt.data.curAscension;
        if (t > 300000) {
            var pos = CCkt.data.ascensions.push([])-1;
            CCkt.data.ascensions[pos].push(CCkt.data.resets);
            CCkt.data.ascensions[pos].push(CCkt.mode?Game.ascensionModes[CCkt.mode.toString()].name:Math.floor(Game.HowMuchPrestige(Game.cookiesReset))-Math.floor(Game.HowMuchPrestige(CCkt.legacyCookies)));
            CCkt.data.ascensions[pos].push(Game.cookiesReset-CCkt.legacyCookies);
            CCkt.data.ascensions[pos].push(Date.now()-CCkt.startT);
            CCkt.data.ascensions[pos].push(t);
        }
        CCkt.data.totalT += Date.now() - CCkt.lastT;
    }
    CCkt.lastT = Date.now();
}

CCkt.reincarnate = function(){
    var t = Date.now();
    CCkt.data.totalT += t - CCkt.lastT;
    CCkt.lastT = t;
    CCkt.data.curAscension = 0;
    CCkt.data.resets++;
    CCkt.mode = Game.ascensionMode;
    CCkt.legacyCookies = Game.cookiesReset;
    CCkt.startT = Game.startDate;
}

if(!CCkt.isLoaded){
    if(CCSE && CCSE.isLoaded){
        CCkt.launch();
    }
    else{
        if(!CCSE) var CCSE = {};
        if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(CCkt.launch);
    }
}

