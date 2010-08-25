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
  mongoose = require('./vendor/mongoose/mongoose').Mongoose;

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

var db = mongoose.connect('mongodb://localhost/naem');

var EnergyData = db.model('EnergyData');

var app = express.createServer(
    express.logger(),
    express.bodyDecoder(),
    express.staticProvider(__dirname + '/public')
);

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

  var ed = new EnergyData();
  ed.type = ENERGY_DATA_TYPES[data["n"]];
  ed.total = data["t"];
  ed.current = data["c"];
  ed.average = data["a"];
  ed.created_at = new Date(data["s"]);
  ed.save();

  sys.puts(JSON.stringify(req.body));
  res.send("OK");
});

app.get('/frontend/daily', function(req, res) {
  EnergyData.find({"type":"power"}).all(function(docs){
    res.render('daily.html.ejs', {
      locals: {
        sensorData: docs
      }
    });
  });
});

app.listen(8000);
