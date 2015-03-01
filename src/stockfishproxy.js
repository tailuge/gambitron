// Talks to stockfish process and collects response lines.

module.exports = function StockfishProxy() {

    var self = this;
    this.result = [];
    this.terminal = null;

    this.handleStdout = function(data) {
        var s = data.toString();
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
        //console.log(self.result);
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
        this.terminal.stdin.write('setoption name MultiPV value ' + variations + '\n');
        this.terminal.stdin.write('position fen ' + fen + '\n');
        this.terminal.stdin.write('go depth ' + depth + '\n\n');
        this.terminal.stdin.write('quit\n');
        return;
    };
};
