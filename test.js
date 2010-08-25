var sys = require('sys'),
  mongoose = require('./vendor/mongoose/mongoose').Mongoose;
  
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
db.on('open',function(){
  var EnergyData = db.model('EnergyData');

  var ed = new EnergyData();
  ed.type = "power";
  ed.total = 83322.7343;
  ed.current = 310.0775;
  ed.average = 305.5755;
  ed.created_at = new Date("Mon, 23 Aug 2010 22:44:34 GMT");
  ed.save();

  EnergyData.find({"type":"power"}).all(function(result){
    sys.puts(JSON.stringify(result));
  });
  
  

  db.close();  
});
