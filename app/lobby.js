/*******************************************************************************************************************************/
//Globals
var express = require('express');
var gamesuite = express();
var serv = require('http').Server(gamesuite);
var path = require('path');
var bodyParser = require('body-parser');
gamesuite.use(bodyParser.urlencoded({ extended: false }));
gamesuite.use(bodyParser.json());

//Desktop: 0, Laptop: 1
var pathmode = 1;

gamesuite.use(express.static(__dirname + '/../public'));
console.log("Loading...");

//Game constructor
function startGame(gameName) {
    if(gameName == "tweetlord") {
        var gameState = {
            inProgress: false,
            code: generateGC(),
            players: {1:"",2:"",3:"",4:"",5:"",6:""},
            points: {1:0,2:0,3:0,4:0,5:0,6:0},
            timers: {0:60,1:60,2:30,3:15,4:10,5:60},
            tweeters: {1:0,2:0,3:0,4:0,5:0,6:0},
            prompts: {1:0,2:0,3:0,4:0,5:0,6:0},
            tweets: {1:"",2:"",3:"",4:"",5:"",6:""},
            round: 0,
            phase: 0,
            starttime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            endtime: undefined,
            postpones: 0,
            currentTweeter: 0,
            hasTweeted: []
        }
        console.log("New Tweetlord gameState created");
        return gameState;
    } else if(gameName == "imposter") {
        var gameState = {
            inProgress: false,
            code: generateGC(),
            players: {1:"",2:"",3:"",4:"",5:"",6:"",7:"",8:"",9:"",10:""},
            round: 0,
            phase: 0,
            starttime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            endtime: undefined,
            postpones: 0,
            location: "undefined",
            roles: {1:99,2:99,3:99,4:99,5:99,6:99,7:99,8:99,9:99,10:99}
        }
        console.log("New Imposter gameState created");
        return gameState;
    } else {
        console.log("Error in call to startGame");
        return null;
    }
}
var GAMELIST = {};
var SOCKETLIST = {};
/*******************************************************************************************************************************/
//Root page
gamesuite.get('/', function(req, res) {
  if(pathmode == 0) {
    res.sendFile(path.resolve('/Programs/Nodejs/sync/public/lobby.html'));
  } else if(pathmode == 1) {
    res.sendFile(path.resolve('/home/hydra/Apps/gamesuite/public/lobby.html'));
  }
});

//Game pages
gamesuite.get('/tweetlord/:gameCode', function(req, res) {
  if(req.url == "/tweetlord/neon.css") {
    res.set("Content-Type", "text/css");
    if(pathmode == 0) {
      res.sendFile(path.resolve('/Programs/Nodejs/sync/public/neon.css'));
    } else if(pathmode == 1) {
      res.sendFile(path.resolve('/home/hydra/Apps/gamesuite/public/neon.css'));
    }
  } else {
    res.set("Content-Type", "text/html");
    if(pathmode == 0) {
      res.sendFile(path.resolve('/Programs/Nodejs/sync/public/tweetlord.html'));
    } else if(pathmode == 1) {
      res.sendFile(path.resolve('/home/hydra/Apps/gamesuite/public/tweetlord.html'));
    }
  }
});

gamesuite.get('/imposter/:gameCode', function(req, res) {
    if(req.url == "/imposter/iridium.css") {
    res.set("Content-Type", "text/css");
    if(pathmode == 0) {
      res.sendFile(path.resolve('/Programs/Nodejs/sync/public/iridium.css'));
    } else if(pathmode == 1) {
      res.sendFile(path.resolve('/home/hydra/Apps/gamesuite/public/iridium.css'));
    }
  } else {
    res.set("Content-Type", "text/html");
    if(pathmode == 0) {
      res.sendFile(path.resolve('/Programs/Nodejs/sync/public/imposter.html'));
    } else if(pathmode == 1) {
      res.sendFile(path.resolve('/home/hydra/Apps/gamesuite/public/imposter.html'));
    }
  }
});
/*******************************************************************************************************************************/
//Lobby forms
gamesuite.post('/scripts/makeGame', function(req, res) {
    var gameTitle = req.body.gameTitle;
    var newGame = startGame(gameTitle);
        newGame.players[1] = req.body.namepromptM;
        newGame.inProgress = true;
    GAMELIST[newGame.code] = newGame;
    res.writeHead(301, { Location: '/' + gameTitle + '/' + newGame.code });
    res.end();
});

gamesuite.post('/scripts/joinGame', function(req, res) {
    var cgc = req.body.gameprompt;
    var gameTitle = req.body.gameTitle;
    var myGame = getGame(cgc);
    if(myGame == "GameNotFound") {
        alert("No game exists with that game code");
        return;
    }
    //Check if full
    
    //Add name
    for(var i = 0; i < 6; i++) {
        //Be original
        if(myGame.players[i] == req.body.namepromptJ) {
            req.body.namepromptJ = req.body.namepromptJ + " 2";
        }
        if(myGame.players[i] == "") {
            myGame.players[i] = req.body.namepromptJ;
            break;
        }
    }
    res.writeHead(301, { Location: '/imposter/' + gameState.code });
    res.end();
    emitToAll('playerJoin');
});

/*******************************************************************************************************************************/
//Listen
serv.listen(8081, function() {
  console.log("GAMESUITE START!");
});
/*******************************************************************************************************************************/
//Sockets
var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket) {
    var slen = Object.keys(SOCKETLIST).length;
    socket.tlid = slen + 1;
    socket.name = gameState.players[socket.tlid];
    SOCKETLIST[socket.tlid] = socket;
    console.log("Socket connection initialized: socket " + socket.tlid);

    socket.on('sockettest', function(data) {
        console.log(data.welcome);
    });
    
    socket.emit('setup', {
        gameState: gameState,
        socketId: socket.tlid
    });

    socket.on('disconnect', function() {
        //Remove socket
        delete SOCKETLIST[socket.tlid];
        //Remove player
        gameState.players[socket.tlid] = "*disconnected*";
        //Deprecated: move players down
        // if(gameState.players[socket.tlid + 1] != "") {
        //     for(var i = (socket.tlid + 1); i < 7; i++) {
        //         gameState.players[i - 1] = gameState.players[i];
        //         gameState.players[i] = "";
        //     }
        // }
        //Restart app if no players left
        var isEmpty = true;
        for(var i = 1; i < 7; i++) {
            if((gameState.players[i] != "") && (gameState.players[i] != "*disconnected*")) {
                isEmpty = false;
            }
        }
        if(isEmpty == true) {
            restartApp();
        }
        console.log("Socket " + socket.tlid + " disconnected");
    });
    
    //Buttons
    socket.on('postpone', function() {
        if(gameState.postpones > 4) {
            socket.emit('tooManyPostpones');
            return;
        }
        gameState.postpones = gameState.postpones + 1;
        gameState.timers[0] = gameState.timers[0] + 15;
    });
    
    socket.on('impatience', function() {
        gameState.timers[0] = gameState.timers[0] - 1;
    });

    //Pausing
    socket.on('pause', function() {
        gameState.inProgress = false;
        console.log("Game paused");
    });

    socket.on('unpause', function() {
        gameState.inProgress = true;
        console.log("Game resumed");
    });
});
/*******************************************************************************************************************************/
//Utility functions
function generateGC() {
    var gcchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var gc = "";
    for(var i = 0; i < 6; i++) {
        var rc = gcchars.charAt(Math.floor(Math.random() * 36));
        gc = gc + rc;
    }
    return gc;
}

function getGame(gc) {
    if(GAMELIST.hasOwnProperty(gc)) {
        var myGame = GAMELIST.gc;
        return myGame;
    } else {
        return "GameNotFound";
    }
}

function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    if (typeof obj !== "object") return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function restartApp() {
    try {
      gameState = startGame();
      console.log("Webserver was halted");
    } catch (e) {
      console.log("Can't stop webserver: ");
      console.log(e);
    }
    if(pathmode == 0) {
        var sExecute = "node " + path.resolve('/Programs/Nodejs/sync/app/lobby.js');
    } else {
        var sExecute = "node " + path.resolve('/home/hydra/tweetlord/tweetlord/sync/app/lobby.js');
    }
    tweetlord.killed = true;
    var exec = require('child_process').exec;
    exec(sExecute, function () {
        console.log('APPLICATION RESTARTED');
        rollTweeters();
        console.log(gameState);
    });
}

/*******************************************************************************************************************************/
//Imposter functions
