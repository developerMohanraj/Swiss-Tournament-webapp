var service = require('./../service/user_service.js');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session= require('express-session');

exports.indexPage=function(req,res) {
    console.log(req,"_____++++++++++++++++============")
    if(req.session.user==null)
        res.redirect('/login');
    else {
        console.log(req.session,"Session =======")
        service.getTourneyByUserId(req.session._id,function(tourn) {
            var name=req.session.name
            res.render('dashboard.ejs',{tourn,name})
        })
    }
}
exports.login=function(req, res) {
    service.isAuthenticated(req.body.email,req.body.password,function(status,usr) {
        console.log(req.session)
        if(status=='success'){
            console.log(req.session)
            req.session.user=usr.email;
            req.session.name=usr.firstName;
            req.session._id =usr._id;
            req.session.authenticatedStatus= true;
            res.send({status:"success"});
        }
        else if(status=="wrongPassword") {
            res.send({status:"invalid"})
        }
        else if(status=="notExist"){
            res.send({status:"register"})
        }
    })
}
exports.logout=function(req,res) {

    if(req.session.authenticatedStatus) {
        req.session.user=null;
        req.session.name=null;
        req.session._id=null;

        res.redirect('/login');
    }
    else {
        res.redirect('/login')
    }
}

exports.allTournament=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        var tourney=[];
        service.getTourneyByUserId(req.session._id,function (result) {
            result.forEach(function(tourny,index) {
                service.getTourneyById(tourny,function(tournament) {
                    console.log(tournament)
                    tourney.push(tournament);
                    setTimeout(function () {
                        if(index==result.length-1) {
                            console.log(tourney)
                            res.send(JSON.stringify(tourney))
                        }
                    },400)
                })
            })
        })
    }

}

exports.register=function(req,res) {
    var user={
        firstName   : req.body.firstname,
        lastName    : req.body.lastName,
        email       : req.body.email,
        password    : req.body.password,
        address     : req.body.address,
        mobile      : req.body.mobile
    }
    console.log(user);
    service.createUser(user ,function(err,user) {
        console.log(user)
        if(err) {
            if(err=="exist") {
            res.send({status:"exist"});
            }
            else{
                res.send({status:"fail"});
            }
        }
        else if(user){
            res.send({status:"success"});
        }
   })
}
exports.createTournament= function(req,res,next) {
    service.createTournament(req.body.tourney,req.session.user,function (error,tourny) {
        console.log('in router')
        if(error) {
            if(error=="exist") {
                res.json({status:"exist"})
                next();
            }
            else if(error=="userError") {
                res.json({status:"userError"})
                next();
            }
            else if(error=="tournamentError") {
                res.json({status:"tournamentError"})
                next();
            }
        }
        else{
            res.json({status:"success"});
            next();
        }

    })
}
exports.startTournament=function(req , res) {

    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.getTourneyByUserId(req.session._id,function (tournament) {
            console.log(req.session._id);
            var tourn=[];
            var name=req.session.name
            tournament.forEach(function(t_detail,index) {
                service.getTourneyById(t_detail,callIt);
                function callIt(tourney) {
                    console.log("here2");
                    tourn.push(tourney.tournament_name);
                    setTimeout(function () {
                        if(index===tournament.length-1) {
                            console.log(tournament.length,index);
                            res.render('tournament.ejs',{tourn,name})
                        }
                    }, 300)
                }
            })
        })
    }
}
exports.addPlayer=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        console.log("At router")
        service.addPlayerToTournament(req.body.playername,req.body.tourney,function (status,tourn) {
            console.log(status,tourn)
            if(status){
                if(status=="exist"){
                    res.send({status:"exist"});
                }
                if(status=="dbError"){
                    res.send({status:"dbError"});
                }
            }
            else if(tourn){
                res.send(JSON.stringify(tourn));
            }
        })
    }
}


exports.tourneyDetails=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.getTourneyByName(req.query.tName,function (tournament) {
            res.send(JSON.stringify(tournament));
        })
    }
}

exports.showPlayers=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.getTourneyByName(req.query.tName,function(tournament) {
            var name=req.session.name;
            var tournament=tournament;
            res.render('tourny.ejs',{tournament,name});
        })
    }
}
exports.pairPlayers=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        // console.log(req.body.tourney);
        service.swissPair(req.body.tourney,function (tournament) {
            var name=req.session.name;
            res.send(JSON.stringify(tournament));
        })
    }
}
exports.getReportModal=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.resultSelector(req.query.tName,function(matches,tourney) {
            var matchSet=[];
            matches.forEach(function(match) {
                if(matches.winner==null) {
                    matchSet.push(match);
                    console.log(match)
                }
            })
            res.render('matches.handlebars', {matches: matchSet, layout: false});
        })
    }
}
exports.reportWinner=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.reportMatch(req.body.winner,req.body.tName,function(playerName) {
            var name=req.session.name;
            res.send({playerName});
        })
    }
}
exports.getAllMatches=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        console.log(req.query.tName)
        service.findAllMatches(req.query.tName,function(matches) {

            console.log(matches)
            res.render('matchDetail.handlebars', {matches: matches, layout: false});
        })

    }
}
exports.currentStatus=function(req,res) {
    if(req.session.user==null)
        res.redirect('/login');
    else {
        service.getTourneyByName(req.query.tName,function(tournament) {
            var name=req.session.name;
            service.currentStanding(tournament.players,tournament.matches,function (players,standings){
                res.send(JSON.stringify(standings));
            })
        })
    }
}
