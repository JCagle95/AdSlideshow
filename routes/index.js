var express = require('express');
var router = express.Router();

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
      req.session.user = ["public",""];
  }

  mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
    if (err) {
      console.log("Error Connecting to Database");
      res.render('index', {Content: {}});
      return;
    } else {
      var db = client.db(database);
      var collection = db.collection('SlideInformation');

      collection.find({"user": req.session.user[0]}).toArray( async function(err, result) {
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
            res.render('index', {Content: result});
          }
        }
      })
    }
  });
});

module.exports = router;
