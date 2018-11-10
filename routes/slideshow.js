var express = require('express');
var router = express.Router();

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
  var url = req.app.get('mongodb');
  var database = req.app.get('database');

  mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
    if (err) {
      console.log("Error Connecting to Database");
      res.redirect("/administration")
      return;
    } else {
      var db = client.db(database);
      collection = db.collection('SlideInformation');
      collection.find({"user": "admin@adslideshow.com"}).toArray( async function(err, result) {
        if (err) {
          console.log("Error Reading Collection");
          res.render('index', {Content: {}});
          return;
        } else {
          if (result == null) {
            console.log("NULL Documents")
            res.render('index', {Content: {}});
          } else {
            client.close()
            console.log("Success");
            for (i = 0; i < result.length; i++) {
              result[i].objectID = result[i]._id.toHexString()
            }
            result.sort(function(a,b) {
              if (a.priority < b.priority) {
                return -1;
              } else if (a.priority == b.priority) {
                return 0;
              } else {
                return 1;
              }
            });
            console.log(result)
            res.render('slideshow', {Content: result, Message: "Welcome to Precision One Health Info Platform"});
          }
        }
      })
    }
  });
});

router.get('/:id', function(req, res, next) {
  var url = req.app.get('mongodb');
  var database = req.app.get('database');

  var userID = req.params.id
  console.log(userID)
  var objectID = new ObjectID(userID);

  mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
    if (err) {
      console.log("Error Connecting to Database");
      res.redirect("/administration")
      return;
    } else {
      var db = client.db(database);
      var collection = db.collection('UserInformation');
      var result = await collection.findOne({"_id": objectID})
      var message = result.message;

      collection = db.collection('SlideInformation');
      collection.find({"user": result.name}).toArray( async function(err, result) {
        if (err) {
          console.log("Error Reading Collection");
          res.render('index', {Content: {}});
          return;
        } else {
          if (result == null) {
            console.log("NULL Documents")
            res.render('index', {Content: {}});
          } else {
            client.close()
            console.log("Success");
            for (i = 0; i < result.length; i++) {
              result[i].objectID = result[i]._id.toHexString()
            }
            result.sort(function(a,b) {
              if (a.priority < b.priority) {
                return -1;
              } else if (a.priority == b.priority) {
                return 0;
              } else {
                return 1;
              }
            });
            console.log(result)
            res.render('slideshow', {Content: result, Message: message});
          }
        }
      })
    }
  });
});

module.exports = router;
