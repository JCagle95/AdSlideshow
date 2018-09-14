var express = require('express');
var router = express.Router();
var path = require('path');

var mongodb = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

// TODO Homepage
router.get('/', function(req, res, next) {
  res.redirect("/administration/index");
});

router.get('/index', function(req, res, next) {
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
      res.redirect("/administration/login");
      return;
  }

  mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
    if (err) {
      console.log("Error Connecting to Database");
      res.render('AdministrationGallery', {Content: {}});
      return;
    } else {
      var db = client.db(database);
      var collection = db.collection('UserInformation');

      collection.find({}).toArray( async function(err, result) {
        if (err) {
          console.log("Error Reading Collection");
          res.render('AdministrationPanel', {Content: {}});
          return;
        } else {
          if (result == null) {
            console.log("NULL Documents")
            res.render('AdministrationPanel', {Content: {}});
          } else {
            client.close()
            console.log("Success");
            for (i = 0; i < result.length; i++) {
              result[i].objectID = result[i]._id.toHexString()
            }
            res.render('AdministrationPanel', {Content: result, UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
          }
        }
      })
    }
  });
});

/* GET Admin page. */
router.get('/gallery', function(req, res, next) {
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
      res.redirect("/administration/login");
      return;
  }

  mongodb.connect(url, { useNewUrlParser: true }, async function(err, client) {
    if (err) {
      console.log("Error Connecting to Database");
      res.render('AdministrationGallery', {Content: {UserAccount: req.session.user[0], UserSlides: req.session.user[1]}});
      return;
    } else {
      var db = client.db(database);
      var collection = db.collection('SlideInformation');

      collection.find({"user": req.session.user[0]}).toArray( async function(err, result) {
        if (err) {
          console.log("Error Reading Collection");
          res.render('AdministrationGallery', {Content: {UserAccount: req.session.user[0], UserSlides: req.session.user[1]}});
          return;
        } else {
          if (result == null) {
            console.log("NULL Documents")
            res.render('AdministrationGallery', {Content: {UserAccount: req.session.user[0], UserSlides: req.session.user[1]}});
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
            res.render('AdministrationGallery', {Content: result, UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
          }
        }
      })
    }
  });
});

router.get('/form', function(req, res, next) {
  res.render('AddSlides', {Content: {UserAccount: req.session.user[0], UserSlides: req.session.user[1], APIKEY: req.app.get('apikey')}});
});

router.get('/institueForm', function(req, res, next) {
  res.render('AddInstitute', {Content: {UserAccount: req.session.user[0], UserSlides: req.session.user[1]}});
});

/* New Item */
router.post('/addItem', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  console.log(req.body)

  try {
    const client = await mongodb.connect(url, { useNewUrlParser: true });
    var db = client.db(database);
    var stringURL = req.body.URL_Input;
    var stringName = req.body.Name_Input;
    var stringType = req.body.Type_Input;
    var delayID = req.body.Delay_Input;
    var stringPriority = req.body.Priority_Input;
    var delay = parseInt(delayID);
    var priority = parseInt(stringPriority);

    const collection = await db.collection('SlideInformation');

    try {
      var item = await collection.findOne({"user": req.session.user[0], "url": stringURL});
      if (item == null) {
        var result = await collection.insertOne({"user": req.session.user[0], "url": stringURL, "type": stringType, "name": stringName, "delay": delay, "priority": priority});
      }
      client.close();
      res.redirect("/administration/gallery");
    } catch(err) {
      console.log("Error Adding Item");
      res.redirect("/administration/gallery");
    }

  } catch(err) {
    console.log(err);
    res.redirect("/administration/gallery");
  }

});

/* POST Remove ID */
router.post('/removeItem', function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  mongodb.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      // Failed connecting to database, return and send error message.
      console.log("Error Connecting to Database");
      res.send("Error Connecting to Database")
      return;

    } else {
      // If connecting to database success
      var db = client.db(database);
      var id = req.body.id;
      var objectID = new ObjectID(id)

      // Try to get collection
      db.collection('SlideInformation', function(err, collection) {
        if (err) {
          // Collection not exist. Try to create one.
          console.log("Error in getting collection");
          return;
        } else {
          // Collection exist. Delete
          collection.deleteOne({"_id": objectID, "user": req.session.user[0]}, function(err, item) {
            if (err) {
              console.log(err)
              res.send("Error in deleting item.");
              return;
            } else {
              console.log("Success in deleting item.")
              client.close();
              res.redirect("/administration/gallery");
            }
          });
        }
      });
    }
  });
});


/* POST Edit Item */
router.post('/editItem', function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  mongodb.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      // Failed connecting to database, return and send error message.
      console.log("Error Connecting to Database");
      res.send("Error Connecting to Database")
      return;

    } else {
      // If connecting to database success
      var db = client.db(database);
      var id = req.body.id;
      var objectID = new ObjectID(id)

      // Try to get collection
      db.collection('SlideInformation', function(err, collection) {
        if (err) {
          // Collection not exist. Try to create one.
          console.log("Error in getting collection");
          return;
        } else {
          // Collection exist. Delete
          collection.findOne({"_id": objectID, "user": req.session.user[0]}, function(err, item) {
            if (err) {
              console.log(err)
              res.redirect("/administration/gallery")
              return;
            } else {
              console.log("Success in finding item.")
              client.close();
              item.objectID = item._id.toHexString()
              res.render("UpdateSlides", {Content: item, UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
            }
          });
        }
      });
    }
  });
});

/* New Item */
router.post('/updateItem', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  try {
    const client = await mongodb.connect(url, { useNewUrlParser: true });
    var db = client.db(database);
    var stringURL = req.body.URL_Input;
    var stringName = req.body.Name_Input;
    var stringType = req.body.Type_Input;
    var delayID = req.body.Delay_Input;
    var stringPriority = req.body.Priority_Input;
    var id = req.body.ObjectID;
    var delay = parseInt(delayID);
    var priority = parseInt(stringPriority);
    var objectID = new ObjectID(id);

    const collection = await db.collection('SlideInformation');

    try {
      collection.updateOne({"_id": objectID}, { $set: {"url": stringURL, "type": stringType, "name": stringName, "delay": delay, "priority": priority}});
      client.close();
      res.redirect("/administration/gallery");
    } catch(err) {
      console.log("Error Adding Item");
      res.redirect("/administration/gallery");
    }

  } catch(err) {
    console.log(err);
    res.redirect("/administration/gallery");
  }

});

//////////////////////////////
// User related interfaces ///
//////////////////////////////
router.post('/addInstitute', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  console.log(req.body)

  try {
    const client = await mongodb.connect(url, { useNewUrlParser: true });
    var db = client.db(database);
    var stringURL = req.body.URL_Input;
    var stringName = req.body.Name_Input;

    const collection = await db.collection('UserInformation');

    try {
      var item = await collection.findOne({"name": stringName, "url": stringURL});
      if (item == null) {
        var result = await collection.insertOne({"name": stringName, "url": stringURL});
      }
      client.close();
      res.redirect("/administration/index");
    } catch(err) {
      console.log("Error Adding Item");
      res.redirect("/administration/index");
    }

  } catch(err) {
    console.log(err);
    res.redirect("/administration/index");
  }
});

router.post('/editInstitute', function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  mongodb.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      // Failed connecting to database, return and send error message.
      console.log("Error Connecting to Database");
      res.send("Error Connecting to Database")
      return;

    } else {
      // If connecting to database success
      var db = client.db(database);
      var id = req.body.id;
      var objectID = new ObjectID(id)

      // Try to get collection
      db.collection('UserInformation', function(err, collection) {
        if (err) {
          // Collection not exist. Try to create one.
          console.log("Error in getting collection");
          return;
        } else {
          // Collection exist. Delete
          collection.findOne({"_id": objectID}, function(err, item) {
            if (err) {
              console.log(err)
              res.redirect("/administration/gallery")
              return;
            } else {
              console.log("Success in finding item.")
              client.close();
              item.objectID = item._id.toHexString()
              res.render("updateInstitute", {Content: item, UserAccount: req.session.user[0], UserSlides: req.session.user[1]});
            }
          });
        }
      });
    }
  });
});

router.post('/updateInstitute', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }

  try {
    const client = await mongodb.connect(url, { useNewUrlParser: true });
    var db = client.db(database);
    var stringURL = req.body.URL_Input;
    var stringName = req.body.Name_Input;
    var id = req.body.ObjectID;
    var objectID = new ObjectID(id);

    const collection = await db.collection('UserInformation');

    try {
      collection.updateOne({"_id": objectID}, { $set: {"url": stringURL, "name": stringName}});
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

router.post('/switchUser', async function(req, res, next) {
  // Connecting to MongoDB
  var url = req.app.get('mongodb');
  var database = req.app.get('database');
  if (!req.session.authenticated) {
    res.redirect("/administration/login");
    return;
  }
  console.log(req.body)
  req.session.user = [req.body.name,req.body.id];
  res.redirect("/administration/index");
});

//////////////////////////////
// Login related interfaces //
//////////////////////////////
router.get('/login', function(req, res, next) {
  if (req.session.authenticated) {
    res.redirect("/administration")
  } else {
    res.render("login", {message: res.req.session.message});
  }
});

router.get('/logout', function(req, res, next) {
  if (req.session.authenticated) {
    console.log("Logging out");
    req.session.destroy(function(err){
      console.log("Delete Sesssion")
      res.redirect("/administration/login");
    });
  } else {
    res.redirect("/administration/login");
  }
});

router.post('/auth', function(req, res, next) {
  if (req.session.authenticated) {
    console.log(req.session.authenticated)
    res.redirect('/administration');
  } else {
    var url = req.app.get('mongodb');
    var database = req.app.get('database');
    var username = req.body.InputEmail;
    var password = req.body.InputPassword;
    console.log(username)
    console.log(password)
    if (username == "") {
      res.req.session.message = "Empty Username";
      res.redirect('/administration/login');
    } else {
      mongodb.connect(url, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log("Error Connecting to Database");
          res.req.session.message = "Error Connecting to Database";
          res.redirect('/administration/login');
          return;
        } else {
          var db = client.db(database);
          var collection = db.collection('Admin');
          collection.findOne({"user": username}, function(err, result) {
            if (err) {
              console.log("Error Reading Collection");
              res.req.session.message = "Error Connecting to Database";
              res.redirect('/administration/login');
              return;
            } else {
              if (result == null) {
                console.log("NULL Documents")
                res.req.session.message = "Incorrect Username/Password";
                res.redirect('/administration/login');
              } else {
                client.close()
                console.log(result)
                console.log(result.password)
                if (result.password == password) {
                  req.session.authenticated = true
                  req.session.user = [username,""];
                  req.session.save(function(err){
                    console.log("Save Sesssion")
                    res.redirect('/administration');
                  });
                } else {
                  console.log("Bad password")
                  res.req.session.message = "Incorrect Username/Password";
                  res.redirect('/administration/login');
                }
              }
            }
          })
        }
      });
    }
  }
});

module.exports = router;
