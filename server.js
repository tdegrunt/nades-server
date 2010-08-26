/* 
    server.js
    NADES

    Created by Tom de Grunt on 2010-08-22.
    Copyright (c) 2010 Tom de Grunt.
    This file is part of NADES.

    NADES is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    NADES is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with NADES.  If not, see <http://www.gnu.org/licenses/>.
*/

var express = require('express'),
  sys = require('sys'),
  fs = require('fs'),
  mongoose = require('./vendor/mongoose/mongoose').Mongoose;

// Move to directory of script
process.chdir(__dirname);

var ENERGY_DATA_TYPES = {"p":"power","g":"gas","w":"water"};  

mongoose.model('EnergyData', {

    properties: ['type', 'total', 'current', 'average', 'created_at'],

    cast: {
      type: String,
      total: Number,
      current: Number,
      average: Number,
      created_at: Date
    },

});

var db = mongoose.connect('mongodb://localhost/nades');

var EnergyData = db.model('EnergyData');

var app = express.createServer();

app.configure(function() {
  app.use(express.logger()),
  app.use(express.bodyDecoder()),
  app.use(express.staticProvider(__dirname + '/public'))
});

/*
 * Returns the time in unix date/time stamp
 */
app.get('/time', function(req, res){
  res.send(""+Math.round(new Date().getTime() / 1000),{'Content-Type': 'text/plain'});
});

/*
 * Updates EnergyData
 */
app.post('/update', function(req, res) {
  var data = req.body;
  
  data.forEach(function(sensorInfo){
    var ed = new EnergyData({
        type: ENERGY_DATA_TYPES[sensorInfo["n"]], 
        total: sensorInfo["t"], current: sensorInfo["c"], average: sensorInfo["a"], 
        created_at: new Date(sensorInfo["s"])});
    ed.save();
  });

  res.send("OK");
});

app.get('/frontend/daily/:year?/:month?/:date?', function(req, res) {
  var now = new Date();
  if (req.params.year && req.params.month && req.params.date) {
    now = new Date(req.params.year, req.params.month-1, req.params.date);
  }
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  var query = EnergyData.find({"type":"power","created_at":{"$gte": start, "$lt": end}}).sort([["created_at",1]]);
  var firstData;
  var lastData;
  query.first(function(result){
      firstData = result;
  }).last(function(result){
      lastData = result;
  }).all(function(docs){
    res.render('daily.html.ejs', {
      locals: {
        sensorData: docs,
        firstData: firstData,
        lastData: lastData
      }
    });
  });
});

app.listen(8000);




