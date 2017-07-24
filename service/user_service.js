var mongoose=require('mongoose');
var model=require('../model/model.js');
// var service=require('./tournament_service.js');


// ====================================lib functions==============================
function createUser(user, cb) {

    var user_object= new model.User({
        firstName   :user.firstName,
        lastName    :user.lastName,
        email       :user.email,
        password    :user.password,
        address     :user.address,
        role        :"user",
        mobile      :user.mobile
    })
    getUserByEmail(user.email,function(res) {
        if(res==null) {
            user_object.save(function(err,res) {
                if(err){
                    cb(err,null);
                }
                cb(null,res);
            })
        }else{
            cb("exist",null);
        }
    });

}
function createTournament(tournament,email,cb) {
    getUserByEmail(email,function(userDetails) {
        if(userDetails.tournament.length>0){
            userDetails.tournament.forEach(function(tourn,index){
                getTourneyById(tourn,function(singleTournament) {
                    if(singleTournament.tournament_name===tournament){
                        cb("exist",null)
                    }
                    else if(index==userDetails.tournament.length-1) {
                        var tournamentObject=new model.Tournament({
                            tournament_name:tournament,
                            tour_owner     :userDetails._id
                        })
                        tournamentObject.save(function(err,result) {
                            if(err){
                                cb("tournamentError",null)
                            }
                            userDetails.tournament.push(result._id)
                            userDetails.save(function(err, result) {
                                if (err){
                                    cb("userError",null)
                                }
                                cb(null,"success");
                            })
                        })
                    }
                })

            })
        }
        else{
            var tournamentObject=new model.Tournament({
                tournament_name:tournament,
                tour_owner     :userDetails._id
            })
            tournamentObject.save(function(err,result) {
                if(err){
                    cb("tournamentError",null)
                }
                userDetails.tournament.push(result._id)
                userDetails.save(function(err, result) {
                    if (err){
                    cb("userError",null)
                    }
                    cb(null,"success");
                })
            })
        }
    })
}
function addPlayerToTournament(playerName,tourneyName,cb) {
    getTourneyByName(tourneyName,function(tourney) {
        if(tourney.status==="NOTSTARTED") {
            if(tourney.players.length>0){
               tourney.players.forEach(function(player,index){
                    if(playerName==player.name) {
                        cb("exist",null)
                    }
                    else if(tourney.players.length-1==index){
                        tourney.players.push({name:playerName})
                        tourney.save(function(err,result) {
                            if(err){
                            cb("dbError",null)
                            }
                            cb(null,result);
                        });
                    }
                })
            }
            else{
                tourney.players.push({name:playerName})
                tourney.save(function(err,result) {
                    if(err){
                    cb("dbError",null)
                    }
                    cb(null,result);
                });
            }
        }
    })
}

function isAuthenticated(userName,password,cb) {

    getUserByEmail(userName,function(user) {
        if(user==null) {
            cb("notExist",null);
        }
        else if(user.email===userName && user.password===password) {
            cb("success",user);
        }
        else if(user.email===userName&&user.password!=password) {
            cb("wrongPassword",null);
        }
    })
}

function currentStanding(players,matches,sortedPlayers){
    var playersWtPoint=[];
    var sortedList=[];
    for(var i=0;i<players.length;i++) {

        var pnt=0;
        matches.forEach(function(match) {
            if(match.winner) {
                if(players[i]._id.equals(match.winner._id))
                {
                    pnt++
                }
            }
        })
        var sortObj={
            _player:players[i],
            _point  :pnt
        }
        playersWtPoint.push(sortObj);
        if(i===players.length-1) {
            playersWtPoint.sort(compare);
            playersWtPoint.forEach(function(player,index){
                sortedList.push(player._player);
                if (index==playersWtPoint.length-1) {
                    console.log(playersWtPoint)
                    sortedPlayers(sortedList,playersWtPoint);
                }
            })
        }
    }
}
function swissPair(tourney,cb) {
    getTourneyByName(tourney.trim(),function(tournamentInfo) {
        var players;
        var thisRound;
        var matchPair=[];
        console.log(tournamentInfo)
        var matchSet=tournamentInfo.matches;
        if(tournamentInfo.matches.length==0) {
            if(Math.log2(tournamentInfo.players.length)%1==0){
                thisRound=1;
                for(var i=0;i<tournamentInfo.players.length;i++) {
                    var obj={
                        player_one:tournamentInfo.players[i],
                        player_two:tournamentInfo.players[++i],
                        round     :thisRound
                    };
                    matchPair.push(obj);
                    if(i==tournamentInfo.players.length-1) {
                        matchPair.forEach(function (match,index) {
                            tournamentInfo.matches.push(match);
                            if(index==matchPair.length-1) {
                                tournamentInfo.set({status:"STARTED"})
                                tournamentInfo.save(function(err,res) {
                                    if(err) {
                                        cb(null)
                                    }
                                    cb(tournamentInfo);
                                })

                            }
                        })
                    }
                }
            }
        }
        else {
            thisRound=matchSet[matchSet.length-1].round+1;
            currentStanding(tournamentInfo.players,matchSet,sortedPlayerList);
            function sortedPlayerList(sortedPlayers,points){
                var thisRoundMatches=[];
                var points=points;
                while(sortedPlayers.length>0) {
                    var tempPlayer=sortedPlayers.splice(0,1);
                    var playerOne=tempPlayer[0];
                    var playerTwo=sortedPlayers[0];
                    for(var i=0;i<matchSet.length;i++) {
                        if(!(matchSet[i].winner._id.equals(playerOne._id) && matchSet[i].loser._id.equals(playerTwo._id))||(matchSet[i].winner._id.equals(playerTwo._id) && matchSet[i].loser._id.equals(playerOne._id))) {
                            var obj={
                                player_one:playerOne,
                                player_two:playerTwo,
                                round     :thisRound
                            };
                            matchPair.push(obj);
                            sortedPlayers.splice(i,1)
                            break;
                        }
                    }
                    if(sortedPlayers.length==0) {
                        matchPair.forEach(function (match,index) {
                            tournamentInfo.matches.push(match);
                            if(index==matchPair.length-1) {
                                tournamentInfo.save(function(err,res) {
                                    if(res) {
                                        cb(tournamentInfo);
                                    }

                                })
                            }
                        })
                    }
                }
            }
        }
    })
}

function resultSelector(tourney,cb) {
    getTourneyByName(tourney,function(tournament) {
        var lastRoundFilter=tournament.matches;
        var lastRoundMatches=[];
        var lastRound      =tournament.matches[tournament.matches.length-1].round;
        lastRoundFilter.forEach(function(match) {
            if(match.round==lastRound && !match.winner) {
                lastRoundMatches.push(match);
            }
        })
        cb(lastRoundMatches,tournament);
    })
}

function getMatchesByRound(tourney,round,cb) {
    getTourneyByName(tourney,function(tournament) {
        var roundFilter=tournament.matches;
        var roundMatches=[];
        roundFilter.forEach(function(match) {
            if(match.round==round) {
                roundMatches.push(match);
            }
        })
        cb(roundMatches,tournament);
    })
}
function reportMatch(winner,tourney,success) {
    resultSelector(tourney, function (lastRoundMatches,tournament) {
        lastRoundMatches.forEach(function (match) {
            if(match.player_one._id==winner) {

                match.set({winner:match.player_one,loser:match.player_two});
                tournament.save({'_id':tournament._id},function(err,res){
                    if(err){
                        throw err;
                    }
                    if(Math.log2(tournament.players.length)==match.round&&tournament.matches[tournament.matches.length-1].winner!=null) {
                        tournament.set({status:"COMPLETED"});
                        tournament.save();
                    }
                    success(match.player_one.name);
                })
            }
            else if(match.player_two._id==winner) {
                match.set({winner:match.player_two,loser:match.player_one});
                tournament.save({'_id':tournament._id,'matches._id':match._id},function(err,res){
                    if(err){
                        throw err;
                    }
                    if(Math.log2(tournament.players.length)==match.round&&tournament.matches[tournament.matches.length-1].winner!=null) {
                        tournament.set({status:"COMPLETED"});
                        tournament.save();
                    }
                    success(match.player_two.name);
                })
            }
        })
    })
}


//============================support functions=====================================


function getUserByEmail(email,callBack) {
    model.User.findOne({'email':email},function(err,result) {
        if(err)
            callBack(null)
        callBack(result);
    });
}
function findUserById(id,callBack) {
    model.User.findOne({'_id':id},function(err,result) {
        if(err)
            throw err;
        callBack(result);
    });
}


function getAllTourney(callBack) {
    model.Tournament.find({},function(err,result) {
        if(err)
            throw err;
        callBack(result);
    });
}
function getTourneyById(id,callBack) {
    model.Tournament.findOne({'_id':id},function(err,result) {
        callBack(result);
    });
}
function getTourneyByName(tornyName,cb) {
    model.Tournament.findOne({'tournament_name':tornyName},function(err,result) {
        if(err){
             throw err;
        }
        cb(result);
    });
}
function getTourneyByUserId(userId,cb) {
    model.User.findOne({'_id':userId},function(err,result) {
        if(err)
            throw err;
        cb(result.tournament);
    });
}


function getPlayers(tourney_name,callBack) {
    getTourneyByName(tourney_name,function(tournament) {
        var player=[];
        callBack(tournament);
    })
}

function findAllMatches(tourney,cb) {
    // var matcheSet
    getTourneyByName(tourney,function(res) {
        console.log("Getting all matches",res)
        cb(res.matches)
    })
}
function compare(a,b) {
        return b._point-a._point
}


module.exports= {
    getUserByEmail       :getUserByEmail,
    isAuthenticated      :isAuthenticated,
    createUser           :createUser,
    createTournament     :createTournament,
    getAllTourney        :getAllTourney,
    findUserById         :findUserById,
    getTourneyByName     :getTourneyByName,
    getTourneyByUserId   :getTourneyByUserId,
    getTourneyById       :getTourneyById,
    addPlayerToTournament:addPlayerToTournament,
    getPlayers           :getPlayers,
    swissPair            :swissPair,
    resultSelector       :resultSelector,
    reportMatch          :reportMatch,
    currentStanding      :currentStanding,
    findAllMatches       :findAllMatches
}
