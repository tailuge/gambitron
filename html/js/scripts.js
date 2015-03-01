// declratations

var game = new Chess();

var gambit;

var statusEl = $('#status');
var fenEl = $('#fen');
var pgnEl = $('#pgn');
var info = $('#info');

var gambitPosition;

// do not pick up pieces if the game is over, only pick up pieces for White

var onDragStart = function(source, piece, position, orientation) {

    if (game.in_checkmate() === true || game.in_draw() === true || piece.search(/^b/) !== -1) {
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
    board.position(game.fen());
    updateStatus();
    console.log("YOU played:" + JSON.stringify(playedMove, undefined, 2));
    assessMove(gambitPosition, playedMove);
};

var assessMove = function(position, move) {
    var candidateMoves = getCandidateMoves(position);
    console.log("canditateMoves:" + JSON.stringify(candidateMoves));
    if (isMoveInList(candidateMoves, move)) {
        console.log("good move");
    } else {
        console.log("bad move");
    }
};

var isMoveInList = function(moves, move) {
    moves.forEach(function(m) {
        console.log(JSON.stringify(m) +"=?="+JSON.stringify(move));
        if ((m.from === move.from) && (m.to === move.to)) {
            return true;
        }
    });
    return false;
};

var getCandidateMoves = function(position) {
    var results = [];
    position.continuations.forEach(function(p) {
        results.push(p.moveToHere);
    });
    return results;
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


var autoMove = function(position) {
    info.html("Black's move");
    setTimeout(function() {
        makeRandomMove(position);
    }, 1000);
};

var makeRandomMove = function(position) {
    var randomNumber = Math.floor(Math.random() * position.continuations.length);
    //    console.log("index:"+randomNumber+" from choice of:"+position.continuations.length);
    var randomMove = position.continuations[randomNumber].moveToHere;
    console.log("OPPONENT plays:" + JSON.stringify(randomMove));
    game.move(randomMove);
    board.position(game.fen());
    gambitPosition = position.continuations[randomNumber];
    info.html("White to move");
    updateStatus();
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
    var url = 'https://c9.io/tailuge/gambit/workspace/kga.json';
    $.getJSON(url, function(data) {
        gambit = data;

        console.log("loaded gambit with initial fen : " + gambit.fen);

        board.position(gambit.fen);
        game.load(gambit.fen);
        updateStatus();
        autoMove(gambit);
    });

});

var findFenInPosition = function(position, fen) {

    console.log("findFenInPosition");
    $.each(position.continuations, function(i, v) {
        alert(fen + v.fen);
        if (v.fen == fen) {
            return v.score;
        }
    });

};

if (typeof console != "undefined") if (typeof console.log != 'undefined') console.olog = console.log;
else console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('#debugDiv').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info = console.log;
