var LocalStrategy = require('passport-local').Strategy;
var User            = require('../model/model.js').User;
var service =require('../service/user_service.js');
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        service.getUserByEmail(email, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
        function(req, email, password, done) {
            User.findOne({ 'email' :  email }, function(err, user) {
                if (err){
                    return done(err, null);
                }
                if (!user){
                    return done(null,false,"notExist");
                }
                if (user.email===email&&user.password!=password){
                    return done(null,false,"wrongPassword");
                }
                return done(null, user);
            });
        })
    );

};
// if(user==null) {
//             cb("notExist",null);
//         }
//         else if(user.email===userName && user.password===password) {
//             cb("success",user);
//         }
//         else if(user.email===userName&&user.password!=password) {
//             cb("wrongPassword",null);
//         }
