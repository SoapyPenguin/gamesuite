/*******************************************************************************************************************************/
//Globals
var express = require('express');
var gamesuite = express();
var serv = require('http').Server(gamesuite);
var path = require('path');
var url = require('url');
var bodyParser = require('body-parser');
var idle = true;
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
            title: "tweetlord",
            inProgress: false,
            code: generateGC(),
            players: {1:"",2:"",3:"",4:"",5:"",6:""},
            playerct: 0,
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
            title: "imposter",
            inProgress: false,
            code: generateGC(),
            players: {1:"",2:"",3:"",4:"",5:"",6:"",7:"",8:"",9:"",10:""},
            playerct: 0,
            timers: {0:60,1:360},
            round: 0,
            phase: 0,
            starttime: new Date().toISOString().slice(0, 19).replace('T', ' '),
            endtime: undefined,
            postpones: 0,
            scenario: "undefined",
            roles: {1:99,2:99,3:99,4:99,5:99,6:99,7:99,8:99,9:99,10:99},
            votes: {}
        }
        gameState = imposter.assignRoles(gameState);
        console.log("New Imposter gameState created");
        return gameState;
    } else {
        console.log("Error in call to startGame");
        return null;
    }
}
var GAMELIST = {};
var SOCKETLIST = {};
var PLAYERLIST = {};
/*******************************************************************************************************************************/
//Imposter functions
var imposter = require('./imposterFuncs.js');
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
    //Make game
    var gameTitle = req.body.gameTitle;
    var newGame = startGame(gameTitle);
        newGame.players[1] = req.body.namepromptM;
        newGame.playerct += 1;
        newGame.inProgress = true;
    GAMELIST[newGame.code] = newGame;
    //Make player
    var playerid = Object.keys(PLAYERLIST).length + 1;
    var player = {
        id: playerid,
        slot: 1,
        name: req.body.namepromptM,
        gameTitle: req.body.gameTitle,
        gc: newGame.code
    }
    PLAYERLIST[player.id] = player;
    console.log(player);
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
    var isFull = true;
    for(var p in myGame.players) {
        if(p == "") {
            isFull = false;
            break;
        }
    }
    if(isFull) {
        alert("Sorry, that game is full");
        return;
    }
    //Add name
    for(var i = 0; i < 6; i++) {
        //Be original
        if(myGame.players[i] == req.body.namepromptJ) {
            req.body.namepromptJ = "Other " + req.body.namepromptJ;
        }
        if(myGame.players[i] == "") {
            myGame.players[i] = req.body.namepromptJ;
            myGame.playerct += 1;
            break;
        }
    }
    res.writeHead(301, { Location: '/' + gameTitle + '/' + cgc });
    res.end();
});
/*******************************************************************************************************************************/
//Sockets
var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket) {
    //Connection
    var slen = Object.keys(SOCKETLIST).length;
    socket.id = slen + 1;
    socket.player = PLAYERLIST[socket.id];
    socket.gameState = null;
    socket.ip = socket.request.connection.remoteAddress;
    SOCKETLIST[socket.id] = socket;
    console.log("Socket connection initialized: socket " + socket.id + " (" + socket.ip + ")");

    //Test ===========================================================
    socket.on('sockettest', function(data) {
        console.log(data.welcome);
    });
    //----------------------------------------------------------------

    //Setup ==========================================================
    socket.emit('setup', {
        socketId: socket.id
    });

    socket.on('sendGC', function(data) {
        //Fetch and assign gamestate
        socket.gc = data.gc;
        socket.gameState = getGame(socket.gc);
        console.log("Socket " + socket.id + " has joined game " + socket.gc);
        socket.emit('playerJoin', {
            gameState: socket.gameState,
            player: socket.player
        });
        if(socket.gameState.phase == 0) {
            if(socket.gameState.title == "imposter") {
                var ph0data = {
                    gameState: socket.gameState,
                    scenarios: imposter.getScenarios()
                };
            } else {
                var ph0data = { gameState: socket.gameState };
            }
            socket.emit('setupPh0', ph0data);
        }
    });
    //----------------------------------------------------------------

    //Disconnection ==================================================
    socket.on('disconnect', function() {
        //Remove player
        socket.gameState.players[socket.id] = "*disconnected*";
        //Move players down
        if(socket.gameState.players[socket.id + 1] != "") {
            for(var i = (socket.id + 1); i < 7; i++) {
                if(socket.gameState.title == "imposter") {
                    socket.gameState.players[i - 1] = socket.gameState.players[i];
                    socket.gameState.players[i] = "";
                    socket.gameState.roles[i - 1] = socket.gameState.roles[i];
                    socket.gameState.roles[i] = "";
                }
            }
        }
        //Remove game if no players left
        var isEmpty = true;
        for(var i = 1; i < 11; i++) {
            if((socket.gameState.players[i] != "") && (socket.gameState.players[i] != "*disconnected*")) {
                isEmpty = false;
            }
        }
        if(isEmpty == true) {
            console.log("Game " + socket.gameState.code + " abandoned: removing...");
            delete GAMELIST[socket.gameState.code];
        }
        //Remove socket/player
        delete SOCKETLIST[socket.id];
        delete PLAYERLIST[socket.id];
        console.log("Socket " + socket.id + " disconnected");
    });
    //----------------------------------------------------------------
    
    //Buttons ========================================================
    socket.on('postpone', function() {
        if(socket.gameState.postpones > 4) {
            socket.emit('tooManyPostpones');
            return;
        } else {
            socket.gameState.postpones = socket.gameState.postpones + 1;
            socket.gameState.timers[0] = socket.gameState.timers[0] + 15;
        }
    });
    
    socket.on('impatience', function() {
        socket.gameState.timers[0] = socket.gameState.timers[0] - 10;
    });
    //----------------------------------------------------------------

    //Pausing ========================================================
    socket.on('pause', function() {
        socket.gameState.inProgress = false;
        console.log("Game paused (" + socket.id);
    });

    socket.on('unpause', function() {
        socket.gameState.inProgress = true;
        console.log("Game resumed");
    });
    //----------------------------------------------------------------

    //Events =========================================================
    //~~~ Imposter ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    socket.on('imposterVictory', function() {
        socket.gameState.phase = 3;
        emitToGame('setupPh3', socket.gameState.code);
    });

    socket.on('callRestartVote', function(data) {
        if(!('restart' in socket.gameState.votes)) {
            var rvote = {
                caller: socket.id,
                callerslot: data.slot,
                time: 10,
                agree: 1,
                agreed: []
            }
            rvote.agreed.push(data.slot);
            socket.gameState.votes['restart'] = rvote;
            console.log("Vote for restart called by S" + socket.id + " for " + socket.gameState.code);
            emitToGame('restartVote', socket.gameState.code);
        }
    });

    socket.on('voteForRestart', function() {
        if('restart' in socket.gameState.votes && socket.gameState.votes['restart'].agreed.indexOf(socket.player.slot) == -1) {
            socket.gameState.votes['restart'].agree += 1;
        }
        emitToGame('updateVotes', socket.gameState.code);
    });

    socket.on('callReplayVote', function(data) {
        if(!('replay' in socket.gameState.votes)) {
            var rvote = {
                caller: socket.id,
                callerslot: data.slot,
                time: 10,
                agree: 1,
                agreed: []
            }
            rvote.agreed.push(data.slot);
            socket.gameState.votes['replay'] = rvote;
            console.log("Vote for replay called by S" + socket.id + " for " + socket.gameState.code);
            emitToGame('replayVote', socket.gameState.code);
        }
    });

    socket.on('voteForReplay', function() {
        if('replay' in socket.gameState.votes && socket.gameState.votes['replay'].agreed.indexOf(socket.player.slot) == -1) {
            socket.gameState.votes['replay'].agree += 1;
        }
        emitToGame('updateVotes', socket.gameState.code);
    });
    //----------------------------------------------------------------
});
/******************************************************************************************************************************/
//Clock
if(idle) {
    var idlepoll = setInterval(function() {
        if(Object.keys(GAMELIST).length > 0) {
            console.log("Booting up!");
            startClock();
            clearInterval(idlepoll);
        }
    }, 2000);
}
function startClock() {
    var tick = setInterval(function() {
        if(Object.keys(GAMELIST).length == 0) {
            console.log("No games in progress, going idle...");
            idle = true;
            clearInterval(tick);
        } else {
            idle = false;
        }
        for(var game in GAMELIST) {
            g = GAMELIST[game];
            /**IMPOSTER
                ph0: lobby
                ph1: game
                ph2: vote call (time run out)
                ph3: imposter victory
            **/
            if(g.title == "imposter" && g.inProgress == true) {
                if(g.phase == 0) {
                    g.timers[0] -= 1;
                    emitToGame('tickPh0', g.code);
                    if(g.timers[0] < 1) {
                        g.phase = 1;
                        var iroll = Math.floor(Math.random() * g.playerct);
                        g.roles[iroll+1] = "Imposter";
                        emitToGame('setupPh1', g.code);
                    }
                } else if(g.phase == 1) {
                    g.timers[1] -= 1;
                    emitToGame('tickPh1', g.code);
                    if(g.timers[1] < 1) {
                        g.phase = 2;
                        emitToGame('setupPh2', g.code);
                    }
                    if(!isEmpty(g.votes)) {
                        emitToGame('voteTick', g.code);
                    }
                }
            }
        }
    }, 1000);
}
/*******************************************************************************************************************************/
//Utility functions
function emitToGame(event, gc) {
    var found = false;
    for(var s in SOCKETLIST) {
        var socket = SOCKETLIST[s];
        if(socket.gc == gc) {
            found = true;
            socket.emit(event, {
                gameState: getGame(gc)
            });
        }
    }
    if(found == false) {
        console.log("Error in emitToGame(" + event + "): unable to find game " + gc);
    }
}

function emitToGameC(event, gc, data) {
    var found = false;
    for(var s in SOCKETLIST) {
        var socket = SOCKETLIST[s];
        if(socket.gc == gc) {
            found = true;
            socket.emit(event, data);
        }
    }
    if(found == false) {
        console.log("Error in emitToGameC(" + event + "): unable to find game " + gc);
    }
}

function generateGC() {
    var gcchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var gc = "";
    for(var i = 0; i < 6; i++) {
        var rc = gcchars.charAt(Math.floor(Math.random() * 26));
        gc = gc + rc;
    }
    if(GAMELIST.hasOwnProperty(gc)) {
        generateGC();
        return;
    }
    return gc;
}

function getGame(gc) {
    var found = 0;
    var keys = Object.keys(GAMELIST);
    for(var i=0; i<keys.length; i++) {
        var g = GAMELIST[keys[i]];
        if(g.code == gc) {
            found = 1;
            return g;
        }
    }
    if(found == 0) {
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
        for(var g in GAMELIST) {
            delete g;
        }
        console.log("Webserver was halted");
    } catch (e) {
      console.log("Can't stop webserver: ");
      console.log(e);
    }
    if(pathmode == 0) {
        var sExecute = "node " + path.resolve('/Programs/Nodejs/sync/app/lobby.js');
    } else {
        var sExecute = "node " + path.resolve('/home/hydra/Apps/gamesuite/app/lobby.js');
    }
    gamesuite.killed = true;
    var exec = require('child_process').exec;
    exec(sExecute, function () {
        console.log('APPLICATION RESTARTED');
    });
}
/*******************************************************************************************************************************/
//Listen
serv.listen(8081, function() {
  console.log("GAMESUITE START!");
});
/*******************************************************************************************************************************/