const config = require('./config');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const scopes = ['identify', 'connections'];

passport.serializeUser(function(user, done) {
    done(null, user);
})
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
passport.use(new DiscordStrategy({
    clientID: config.discors.id,
    clientSecret: config.discors.secret,
    callbackURL: `${config.protocol}://${config.url}/discord/callback`,
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

const app = express();
app
.disable("x-powered-by")
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true }))
.use(cookieParser())
.use(session({
    name: 'cookie',
    secret: 'ewgy34289vhj34yug3fpohko4p3iuhgiu5g',
    proxy: true,
    resave: true,
    saveUninitialized: true,
}))
.use(passport.initialize())
.use(passport.session())
.use(require('./router'))
.use(function(req, res){
    res.status(404).send('not found');
})
http.createServer(app).listen(80);

mongoose.set('strictQuery', false);
mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to the Mongodb');
}).catch((err) => {
    console.error(`Unable to connect to the Mongodb. Error: ${err}`);
});

process.on("unhandledRejection", (err) => console.error(err));
process.on("uncaughtException", (err) => console.error(err));