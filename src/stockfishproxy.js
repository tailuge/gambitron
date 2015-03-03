// Talks to stockfish process and collects response lines.

module.exports = function StockfishProxy() {

    var self = this;
    this.result = [];
    this.terminal = null;

    this.handleStdout = function(data) {
        var s = data.toString();
        console.log(s);
        var arrayOfLines = s.match(/[^\r\n]+/g);
        for (var i in arrayOfLines) {
            var line = arrayOfLines[i];
            self.result.push(line);
        }
    };

    this.handleStderr = function(data) {
        console.log('stderr: ' + data);
    };

    this.handleExit = function(code) {
        console.log("========v=======");
        console.log(JSON.stringify(self.result));
        console.log("========^=======");
        self.callback(self.result);
        return;
    };

    this.analyseFen = function(fen, depth, variations, callback) {
        this.callback = callback;
        this.terminal = require('child_process').spawn('Stockfish/src/stockfish');

        // setup callbacks
        this.terminal.stdout.on('data', this.handleStdout);
        this.terminal.stderr.on('data', this.handleStderr);
        this.terminal.on('exit', this.handleExit);

        // trigger analysis        
        var commands = [
            'setoption name MultiPV value ' + variations,
            'position fen ' + fen ,
            'go depth ' + depth + '\n',
            "quit\n"
        ].join("\n");
        console.log(commands);
        this.terminal.stdin.write(commands);
        return;
    };
};
