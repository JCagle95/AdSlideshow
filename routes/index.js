var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {Content: [{url: "images/img1.jpg", type: "image", delay: 5},
                                 {url: "images/img2.jpg", type: "image", delay: 5},
                                 {url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", type: "video", delay: 16},
                                 {url: "images/img3.jpg", type: "image", delay: 5}]});
});

module.exports = router;
