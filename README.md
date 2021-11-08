# CC Kitchen Timer
This is an addon for Cookie Clicker, that tracks actual play time, so the time the game was actually open. This data is collected for each ascension, together with CBTA, HC, and total duration as it's tracked by the game in a log. Ascensions below 5 minutes don't get their own entry in the log, to not inflate it unnecessarily. The play time still counts towards the total though.

This can be used with existing saved but the data will be incomplete of course, since it can not be reconstructed. Therefor it also can only track time while it's loaded.

This addon is not thoroughly tested yet, issues might lurk that weren't discovered during development. Keep backups of your save, as you always should do.

#### Installing

##### Web

###### Userscript
It can be automatically loaded whenever you open the game with Greasemonkey/Tapermonkey. Install with [CCkt.user.js](https://3plus4i.github.io/CCkitchentimer/CCkt.user.js). This is the recommended way.

###### Bookmarklet
You can use this code as a bookmark to load at will

```javascript
javascript: (function () {
  Game.LoadMod('https://3plus4i.github.io/CCkitchentimer/main.js');
}());
```

Note that the time only is tracked once you load the addon.

##### Steam
To use CC Kitchen Timer on steam put these two files in a new folder in workshop  
[info.txt](https://3plus4i.github.io/CCkitchentimer/info.txt)  
[main.js](https://3plus4i.github.io/CCkitchentimer/main.js)
