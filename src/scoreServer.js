//
// Serve static pages and web services via express
// Gambit
//
// e.g.
// https://gambit-c9-tailuge.c9.io/graph.html
//

var StockfishProxy = require('./stockfishproxy.js');

var express = require("express"),
  http = require("http"),
  path = require("path"),
  app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.use(express.static("/home/ubuntu/workspace"));

// Create the http server and get it to                                                                                                                
// listen on the specified port process.env.PORT                                                                                                                   
http.createServer(app).listen(process.env.PORT, function() {
  console.log("Express server listening on port " + process.env.PORT);
});

app.get("/healthCheck", function(req, res) {
  console.log("Healthcheck");
  res.send("running ok");
});



// e.g.
// https://gambit-c9-tailuge.c9.io/graph.html
// https://gambit-c9-tailuge.c9.io/score/colour/myfen
// https://gambit-c9-tailuge.c9.io/score/white/rnbqkbnr%2Fpppp1ppp%2F8%2F8%2F4Pp2%2F5N2%2FPPPP2PP%2FRNBQKB1R%20b%20KQkq%20-%201%203

app.get('/score/:colour/:fen', function(req, res, next) {
  console.log("Score");
  console.log("fen:" + req.params.fen);
  console.log("colour:" + req.params.colour);
  var scoreSign = (req.params.colour == "white") ? -1 : 1;
  var stockfishProxy = new StockfishProxy();

  stockfishProxy.analyseFen(req.params.fen, 8, 1, function(arrayOfLines) {
    var results = [];
    var bestPV = "";
    for (var i in arrayOfLines) {
      var line = arrayOfLines[i];
      console.log("line:" + line);

      if (/^info depth 2.*$/.test(line)) {
        results.push(extractScore(line) * scoreSign);
      }
      else if (/^info depth 4.*$/.test(line)) {
        results.push(extractScore(line) * scoreSign);
      }
      else if (/^info depth 6.*$/.test(line)) {
        results.push(extractScore(line) * scoreSign);
      }
      else if (/^info depth 8.*$/.test(line)) {
        results.push(extractScore(line) * scoreSign);
        bestPV = line;
      }
    }
    var response = {
      scores: results,
      pv: bestPV
    };

    console.log("response:" + response);
    res.send(JSON.stringify(response, null, 2));
  });
});


var extractScore = function(line) {
  if (/^.*mate -.*$/.test(line)) {
    return -1200;
  }
  else if (/^.*mate .*$/.test(line)) {
    return 1200;
  }
  return line.replace(/.*score cp (-?\d+) nodes.*/, '$1');
};
