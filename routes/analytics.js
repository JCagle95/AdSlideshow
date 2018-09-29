var express = require('express');
var router = express.Router();
var path = require('path');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res, next) {
    var url = req.app.get('mongodb');
    var database = req.app.get('database');
    if (!req.session.authenticated) {
        res.redirect("/administration/login");
        return;
    }
    res.render('AnalyticsPanel', {UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
});

router.get('/slideshow', function(req, res, next) {
    var url = req.app.get('mongodb');
    var database = req.app.get('database');
    if (!req.session.authenticated) {
        res.redirect("/administration/login");
        return;
    }

    mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
      if (err) {
        console.log("Error Connecting to Database");
        res.render('AnalyticsPanel', {Content: {}});
        return;
      } else {
        var db = client.db(database);
        var collection = db.collection('Telemetry');

        collection.find({"user": req.session.user[0]}).toArray( async function(err, result) {
          if (err) {
            console.log("Error Reading Collection");
            res.render('AnalyticsPanel', {Content: {}});
            return;
          } else {
            if (result == null) {
              console.log("NULL Documents")
              res.render('AnalyticsPanel', {Content: {}});
            } else {
              client.close()
              console.log("Success");
              for (i = 0; i < result.length; i++) {
                result[i].objectID = result[i]._id.toHexString()
              }
              res.render('SlideshowAnalytics', {Content: result, UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
            }
          }
        })
      }
    });
});

router.post('/telemetry', function(req, res, next) {
    var url = req.app.get('mongodb');
    var database = req.app.get('database');

    mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
      if (err) {
        console.log("Error Connecting to Database");
        res.render('AnalyticsPanel', {Content: {}});
        return;
      } else {
        var db = client.db(database);
        var collection = db.collection('Telemetry');
        var slideInfo = db.collection('SlideInformation');
        var currentDateString = req.body.currentDate
        var objectID = new ObjectID(req.body.id);
        var slide = await slideInfo.findOne({"_id": objectID})
        console.log("Current date: " + currentDateString)
        try {
            var result = await collection.findOne({"objectID": req.body.id});
            if (result == null) {
                if (slide != null)
                    await collection.insertOne({"user": slide.user, "slideName": slide.name, "objectID": req.body.id, "counter": [1], "currentDate": currentDateString, "Dates": [currentDateString]});
            } else {
                if (currentDateString != result.currentDate) {
                    result.Dates.push(currentDateString);
                    result.counter.push(1);
                } else {
                    result.counter[result.counter.length-1] += 1;
                }
                var ret = await collection.updateOne({"_id": result._id}, { $set: {"user": slide.user, "slideName": slide.name, "objectID": req.body.id, "counter": result.counter, "currentDate": currentDateString, "Dates": result.Dates}});
            }
            client.close();
        } catch (error) {
            console.log(error);
        }
      }
    });
});

module.exports = router;
