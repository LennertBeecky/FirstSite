const functions = require('firebase-functions');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
const path = require('path');
const mongodb = require('mongodb');
const fs = require('fs');
const cors = require('cors');
const saltRounds = 10;
const passport = require('passport');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const db_scripts = require('./scripts/dbScripts');
const api_scripts = require('./scripts/apiScripts');
const passport_scripts = require('./scripts/passportScripts');

require('dotenv').config();
const jwtExpirySeconds = 300;
const cookieParser = require('cookie-parser');


app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({origin: true}));
app.use(express.json());
app.use(cookieParser());


app.get('/timestamp', (req, res) => {
	res.send('Test')
});

app.get('/test', (req, res) => {
	res.render('home');
})

app.get('/', (req, res) => {
  res.render('login');
})

app.get('/register', (req, res) => {
  res.render('register', {inputEmail: '"input"',
	inputEmailIcon: '"fas fa-check"', inputEmailText:'',
	inputPassword:'"input"', inputPasswordIcon: '"fas fa-check"',
	inputPasswordText:'', code: req.query.id});
})

app.get('/promo', (req, res) => {
	res.render('promo');
})

app.get('/home', function(req, res, next) {
	try {
    const decoded = jwt.verify(req.cookies.accessCookie.t, process.env.ACCESS_TOKEN_SECRET);
		console.log(decoded);
     return next();
  } catch (error) {
    res.status(401);
    res.redirect('/');
  }
}, async(req, res) => {
			var table = await api_scripts.create_table('test');
		  res.render('home', {table: table});
})

app.post('/register', async(req, res) => {
	res.render('register', {inputEmail: '"input"',
	inputEmailIcon: '"fas fa-check"', inputEmailText:'',
	inputPassword:'"input"', inputPasswordIcon: '"fas fa-check"',
	inputPasswordText:'', code: req.query.id});
})

app.post('/login', async (req, res) => {
  console.log('Login!!!');
  console.log(req.body.email);
  console.log(req.body.password);
  new Promise( (resolve, reject) => {
    passport_scripts.login(req.body.email, req.body.password, async function(value) {
      if(value.status === 1) {
        var table = await api_scripts.create_table('test');
				const token = jwt.sign({Email: req.body.email},
					 process.env.ACCESS_TOKEN_SECRET);
				res.cookie("accessCookie", {t: token, Email: req.body.email},
					{maxAge: jwtExpirySeconds * 1000});
        res.render('home.ejs', {table: table});
      } else {
        res.render('login');
      }
    });
  }).catch((error) => {
    console.log(error);
  });

})

/* Plaatsnaam */
app.post('/setPlaatsnaam', async (req, res) => {
	plaatsnaam = req.body.stad;
	email = req.cookies.accessCookie.Email;
	try {
		db_scripts.db_insertion_place(email, plaatsnaam);
		res.redirect('/home');
	} catch(e) {
		console.log("error: " + e);
		res.redirect('/home');
	}
})

/* Registration form */
app.post('/doRegistration', async function(req, res) {
	naam = req.body.naam;
	voornaam = req.body.voornaam ;
	email = req.body.email;
	password1 = req.body.wachtwoord1;
	console.log(password1);
	password2 = req.body.wachtwoord2;
	console.log(password2);
	speakerId = req.body.id;
	console.log(speakerId);

	if(password1 === password2) {
		let found = await db_scripts.db_find_email(email);
    if(found !== 0){
      res.render('register', {inputEmail: '"input is-danger"',
			inputEmailIcon: '"fas fa-exclamation-triangle"',
			inputEmailText:'<p class="help is-danger">De email is reeds in gebruik.</p>',
			inputPassword:'"input"', inputPasswordIcon: '"fas fa-check"',
			inputPasswordText:'', code: speakerId});
    }
    else {
      (async() => {
        await passport_scripts.hashPassw(voornaam, naam, email, password1, speakerId);
      })();
			res.redirect('/');
    }

  }
  else {
    res.render('register', {inputEmail: '"input"',
		inputEmailIcon: '"fas fa-check"', inputEmailText:'',
		inputPassword:'"input is-danger"',
		inputPasswordIcon: '"fas fa-exclamation-triangle"',
		inputPasswordText:'<p class="help is-danger">De wachtwoorden komen niet overeen.</p>'});
  }
})

app.post('/goToHome', (req, res) => {
  res.render('home.ejs')
})

/* This is for Facebook Authentication */
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: process.env.FB_CALLBACK_URL
},
async function(accessToken, refreshToken, profile, done) {
  try {
		await db_scripts.db_insertion_fb('Lennert.Beeckmans@gmail.com', accessToken, refreshToken, profile.id);
		done(null);
	} catch(e) {
		done(e);
	}
}));

/* This is for Google Authentication */
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.G_CLIENT_ID,
  clientSecret: process.env.G_CLIENT_SECRET,
  callbackURL: process.env.G_CALLBACK_URL,
	passReqToCallback: true
},
async function(request, accessToken, refreshToken, profile, done) {
  try {
		await db_scripts.db_insertion_google('Lennert.Beeckmans@gmail.com', accessToken, refreshToken, profile.id);
		done(null);
	} catch(e) {
		done(e);
	}
}));

app.get('/auth/facebook', passport.authenticate('facebook', {
	scope: ['pages_messaging', 'user_likes']})
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { succesRedirect: '/home',
                                      failureRedirect: '/'}));

app.get('/auth/google', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/admin.directory.resource.calendar', 'https://www.googleapis.com/auth/calendar']})
);

app.get('/auth/google/callback',
  passport.authenticate('google', { succesRedirect: '/home',
                                      failureRedirect: '/'}));

exports.app = functions.https.onRequest(app);
