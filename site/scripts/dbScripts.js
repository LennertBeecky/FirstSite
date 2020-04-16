const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
require('dotenv').config();

const url_login = process.env.MONGO_URL;

function db_test(given) {
  console.log(given);
}

async function db_insertion(voornaam, naam, email, wachtwoord, speakerId) {
  console.log(speakerId);
  const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect( err => {
    const collection = client.db("Thesis_db").collection("site_login");
    console.log("connected");
    collection.insertOne({
      Voornaam: String(voornaam),
      Naam: String(naam),
      Email: String(email),
      Wachtwoord: String(wachtwoord),
      SpeakerId: speakerId
    })
    if (err) {
      console.log(err);
    }
  });
  client.close();
}

async function db_insertion_place(email, plaatsnaam) {
  const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect( err => {
    const collection = client.db("Thesis_db").collection("site_login");
    console.log("connected");
    collection.findOneAndUpdate(
      {
        Email: email
      },
      {
        $set: {
          Plaatsnaam: plaatsnaam
        }
      });
    if (err) {
      console.log(err);
    }
  });
  client.close();
}

async function db_insertion_fb(email, accessToken, refreshToken, id) {
  const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect( err => {
    const collection = client.db("Thesis_db").collection("site_login");
    console.log("connected");
    collection.findOneAndUpdate(
      {
        Email: email
      },
      {
        $set: {
          fbAT: accessToken,
          fbRT: refreshToken,
          fbID: id
        }
      });
    if (err) {
      console.log(err);
    }
  });
  client.close();
}

async function db_insertion_google(email, accessToken, refreshToken, id) {
  const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect( err => {
    const collection = client.db("Thesis_db").collection("site_login");
    console.log("connected");
    collection.findOneAndUpdate(
      {
        Email: email
      },
      {
        $set: {
          gAT: accessToken,
          gRT: refreshToken,
          gID: id
        }
      });
    if (err) {
      console.log(err);
    }
  });
  client.close();
}

const db_find_api = () => {

  return new Promise(resolve => {
    var elements = [];
    var cursor;

    const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });

    client.connect( err => {
      const collection = client.db("Thesis_db").collection("apis");

      findDocuments(collection, function(doc){
        client.close();
        console.log(doc);
        resolve(doc);
      });
      if (err) {
        console.log(err);
      }
    });
  })
}

const findDocuments = function (coll, callback) {
  coll.find({}).toArray(function (err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
}

const db_find_email = (emailGiven) => {

  return new Promise(resolve => {

    const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });

    client.connect( err => {
      const collection = client.db("Thesis_db").collection("site_login");

      findEmail(collection, emailGiven, function(counts){
        client.close();
        console.log(counts);
        resolve(counts);
      });
      if (err) {
        console.log(err);
      }
    });
  })
}

const findEmail = function (coll, emailGiven, callback) {
  coll.find({Email: emailGiven}).count(function (err, count) {
    assert.equal(err, null);
    callback(count);
  });
}

const db_check_user = (emailGiven) => {

  return new Promise(resolve => {

    const client = new MongoClient(url_login, { useNewUrlParser: true, useUnifiedTopology: true });

    client.connect( err => {
      const collection = client.db("Thesis_db").collection("site_login");

      findUser(collection, emailGiven, function(doc){
        client.close();
        console.log("doc");
        console.log(doc);
        resolve(doc);
      });
      if (err) {
        console.log(err);
      }
    });
  })
}

const findUser = function (coll, emailGiven, callback) {
  coll.findOne({Email: emailGiven}, function(err, docs){
    assert.equal(err, null);
    callback(docs);
  });
}

exports.dbTest = db_test;
exports.db_insertion = db_insertion;
exports.db_insertion_place = db_insertion_place;
exports.db_insertion_fb = db_insertion_fb;
exports.db_insertion_google = db_insertion_google;
exports.db_find_api = db_find_api;
exports.db_find_email = db_find_email;
exports.db_check_user = db_check_user;
