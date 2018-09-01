var express = require('express');
var router = express.Router();
var path = require('path');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

/* GET Admin page. */
router.get('/', function(req, res, next) {
  res.render('AdministrationPanel', {Content: [{url: "images/img1.jpg", type: "image", delay: 5},
                                               {url: "images/img2.jpg", type: "image", delay: 5},
                                               {url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", type: "video", delay: 16},
                                               {url: "images/img3.jpg", type: "image", delay: 5}]});
});

router.get('/form', function(req, res, next) {
  res.render('InputForm', {Content: [{url: "images/img1.jpg", type: "image", delay: 5},
                                               {url: "images/img2.jpg", type: "image", delay: 5},
                                               {url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", type: "video", delay: 16},
                                               {url: "images/img3.jpg", type: "image", delay: 5}]});
});

/* New Item */
router.post('/newItem', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
      req.session.user = ["public",""];
  }

  try {
    const client = await mongodb.connect(url, { useNewUrlParser: true });
    var db = client.db(database);
    var stringURL = req.body.url;
    var stringName = req.body.name;
    var stringType = req.body.type;
    var delayID = req.body.delay;
    var delay = parseInt(delayID);

    try {
      var item = await collection.findOne({"user": req.session.user[0], "url": stringURL});
      if (item == null) {
        var result = await collection.insertOne({"user": req.session.user[0], "url": stringURL, "type": stringType, "name": stringName, "delay": delay});
      }
      client.close();
      res.redirect("/administration");
    } catch(err) {
      console.log("Error Adding Item");
      res.redirect("/administration");
    }

  } catch(err) {
    console.log(err);
    res.redirect("/administration");
  }
});

module.exports = router;
