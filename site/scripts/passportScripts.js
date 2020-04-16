const db_scripts = require('./dbScripts.js');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function login(email, password, callback) {
  var exists = await db_scripts.db_find_email(email);
  var returnedObject = {};
  if(exists === 0) {
    returnedObject["status"] = 0;
    return callback(returnedObject);
  }
  else {
    var user = await db_scripts.db_check_user(email);
    console.log(user.Wachtwoord);
    let res = bcrypt.compare(password, user.Wachtwoord, function(err, res) {
      if (err) {
        console.log(err);
      }
      if(res) {
        returnedObject["status"] = 1;
        return callback(returnedObject);
      } else {
        returnedObject["status"] = 0;
        return callback(returnedObject);
      }
    })
  }
}

async function hashPassw(voornaam, naam, email, password, speakerId) {
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    }
    (async() => {
      await db_scripts.db_insertion(voornaam, naam, email, hash, speakerId);
    })();

  });
}

exports.login = login;
exports.hashPassw = hashPassw;
