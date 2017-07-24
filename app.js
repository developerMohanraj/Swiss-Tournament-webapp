const express = require('express');
var exphbs= require('express-handlebars');
var app = express();
var service = require('./service/user_service.js');
var morgan=require('morgan');
var mongoose=require('mongoose');
var path=require('path');
var cookieParser=require('cookie-parser')
var bodyParser = require('body-parser');
var routeTo = require('./routes/allRoutes.js');
var session=require('express-session');
var passport=require('passport');
mongoose.connect('mongodb://localhost/SwissTournamentDataBase',function(err) {
    if(err)
        throw err;
    console.log("Connected to DB!!")
});
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'/public')))
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'ejs');
app.set('view engine','handlebars')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cookieParser());
app.use(session({secret:"bvkvkhvkdsceflbe",resave:false,saveUninitialized:true}))

app.use(passport.initialize());
app.use(passport.session())
require('./config/passport.js')(passport);


app.use('/public',express.static(path.join(__dirname,'/public')))
app.use('/login',express.static(path.join(__dirname,'/views')))
app.use('/',express.static(path.join(__dirname,'/views')))
app.get('/dashboard/alltourn',routeTo.allTournament);
app.get('/dashboard',routeTo.indexPage);
app.post('/user', function(req, res, next) {
    passport.authenticate('local-login',function(err,user,info) {
        if(user){
            req.session.user=user.email;
            req.session.name=user.firstName;
            req.session._id =user._id;
            req.authenticatedStatus= true;
            res.send({status:"success"});
            return next();
        }
        else if(info=="wrongPassword") {
            res.json({status:"invalid"})
            return next();
        }
        else if(info=="notExist"){
            res.json({status:"register"})
            return next();
        }
        res.sendStatus(200);
    })(req, res, next);
});
app.get('/logout',routeTo.logout);
app.use('/register',express.static(path.join(__dirname,'/views','register.html')));
app.post('/register/createprofile',routeTo.register);
app.post('/createtournament',routeTo.createTournament);
app.get('/dashboard/tournament',routeTo.startTournament);
app.post('/addplayer',routeTo.addPlayer)
app.get('/dashboard/tournament/status',routeTo.showPlayers);
app.post('/dashboard/tournament/status/pair',routeTo.pairPlayers);
app.get('/dashboard/tournament/getReport',routeTo.getReportModal)
app.post('/declarewinner',routeTo.reportWinner);
app.get('/dashboard/tournament/points',routeTo.currentStatus);
app.get('/dashboard/tournament/getDetails',routeTo.tourneyDetails);
app.get('/dashboard/tournament/matchDetails',routeTo.getAllMatches);
app.listen(3000);
module.exports = app;
