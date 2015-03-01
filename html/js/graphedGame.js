/* globals Chess, ChessBoard, google */
// declratations

'use strict';

var game = new Chess();

var moveStack = [];

var statusEl = $('#status');
var fenEl = $('#fen');
var pgnEl = $('#pgn');

var plottedArray = [
    ['Move', 'Depth2', 'Depth4', 'Depth6', 'Depth8'],
    ['-', 0, 0, 0, 0]
];

// do not pick up pieces if the game is over

var onDragStart = function(source, piece, position, orientation) {

    if (game.in_checkmate() === true || game.in_draw() === true) {
        return false;
    }
};

var playedMove;

var onDrop = function(source, target) {
    // see if the move is legal
    var m = {
        from: source,
        to: target
    };

    var move = game.move(m);
    playedMove = m;

    // illegal move
    if (move === null) return 'snapback';
};

// update the board position after the piece snap

var onSnapEnd = function() {
    moveStack.push(game.fen());
    board.position(game.fen());
    updateStatus();
    //last turns colour
    var moveColor = 'white';
    if (game.turn() === 'w') {
        moveColor = 'black';
    }

    playedMove.colour = moveColor;

    console.log("move:" + JSON.stringify(playedMove, undefined, 2));
    getEval(playedMove, game.fen());
};

var getEval = function(move, fen) {
    var url = 'https://gambit-c9-tailuge.c9.io/score/' + (move.colour) + '/' + encodeURIComponent(fen) + "?unique=" + (new Date().getTime());

    console.log("url : " + url);

    $.getJSON(url, function(data) {
        var plotData = [playedMove.from + "" + (playedMove.to)].concat(data.scores);
        console.log("server response : " + JSON.stringify(data, undefined, 2));
        plottedArray.push(plotData);
        drawChart();
    });
};

var updateStatus = function() {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (game.in_draw() === true) {
        status = 'Game over, drawn position';
    }

    // game still on
    else {
        status = moveColor + ' to move';

        // check?
        if (game.in_check() === true) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());

};

/**
 * Back. Pop current move off the stack then recalculate to previous entry.
 */
var back = function() {
    moveStack.pop();
    var previousPosition = moveStack.pop();
    game.load(previousPosition);
    onSnapEnd();
};



var cfg = {
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    moveSpeed: 'slow',
    showErrors: 'alert'
};

var board = new ChessBoard('board', cfg);



$(document).ready(function() {

    board.start();
    console.log("begin");
    updateStatus();
    moveStack.push(game.fen());

});



if (typeof console != "undefined")
    if (typeof console.log != 'undefined') console.olog = console.log;
    else console.olog = function() {};


console.log = function(message) {
    console.olog(message);
    $('#debugDiv').append('' + message + '<br/>');
    $("#debugDiv").scrollTop($("#debugDiv")[0].scrollHeight);
};
console.error = console.debug = console.info = console.log;

//
// Graphing
//

google.load("visualization", "1", {
    packages: ["corechart"]
});

google.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable(plottedArray);

    var options = {
        title: 'Centipawn Score'
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
