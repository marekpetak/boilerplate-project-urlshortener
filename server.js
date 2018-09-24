'use strict';

var validUrl = require('valid-url');
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const { Model, Schema } = mongoose;



var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);
const urlSchema = mongoose.Schema({
  original_url: String,
  short_url: Number
});
var ShortUrl = mongoose.model('ShortUrl', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', (req, res) => { 
  // res.json({"url": req.body.url});
  
  if (req.body) { 
    if (validUrl.isUri(req.body.url)) {
      let urlIndex = 1;
      ShortUrl.findOne().sort({'short_url': -1}).exec((error, data) => {
        if (error) {
          console.log(error);
        } else { 
          if (data) { 
            urlIndex = Number(data.short_url) + 1;
            console.log(data);
          }
          
            ShortUrl.create({original_url: req.body.url, short_url: urlIndex}, (error, data) => {
            if (error) {
              console.log(error);
            } else {
             res.json({"original_url":"www.google.com","short_url": urlIndex}); 
            }
          });
        }
        
      });
    } else {
      res.json({"error":"invalid URL"});
    }
  }
});

app.get('/api/shorturl/:urlId', (req, res) => {
  ShortUrl.findOne({short_url: req.params.urlId}, (error, data) => {
    if (error) {
      res.json({error: `short_url: ${req.params.urlId} not found`});    
    } else {
      res.redirect(data.original_url);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
