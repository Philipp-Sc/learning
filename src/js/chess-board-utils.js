
const Chess = require("chess.js");


export const highlightSquares = (stockfishInfoOutHistory, chess, highlightAnalysis, highlightEngine, halfmoves) => {
      var board = {
        columns: ["a", "b", "c", "d", "e", "f", "g", "h"],
        rows: [8, 7, 6, 5, 4, 3, 2, 1]
      };
      var allSquares = board.columns.reduce(
        (prev, next) => [...prev, ...board.rows.map(x => next + x)],
        []
      );
      var squares = allSquares.map((e) => {var o = {};var v={backgroundColor: undefined}; o[e]=v; return o}).reduce(function(result, item) {
        var key = Object.keys(item)[0]; 
        result[key] = item[key];
        return result;
      }, {});
 
      if(highlightAnalysis && stockfishInfoOutHistory.length>=1){
        var a = (stockfishInfoOutHistory[stockfishInfoOutHistory.length-1] || {cp: NaN}).cp/100;
        var move = chess.history({ verbose: true })[stockfishInfoOutHistory.length-1];
        if(move){ 
          squares[move.to].backgroundColor = 'rgba('+(a*-1>=0 ? 0 : 255)+','+(a*-1>=0 ? 255 : 0)+',0,'+(Math.min(1,Math.abs(a)))+')'
        }
      } 

      if(highlightEngine && stockfishInfoOutHistory.length>=1){
         stockfishInfoOutHistory.filter(e => e.move==halfmoves).forEach(e => {
                  var a = (e || {cp: NaN}).cp/100;
                  var game = new Chess(chess.fen());
                  game.move(e.pv, { sloppy: true });
                  var move = game.history({ verbose: true }).reverse()[0];
                  if(move){ 
                  squares[move.to].backgroundColor = 'rgba(0,0,255,'+(Math.min(1,Math.abs(0.5+a)))+')'
                  }
                })
      }
      return squares;
}

export const highlightBoard = (movePerformance, avgPerf, medianPerf) => {

  var a = avgPerf ? movePerformance.average_eval :  movePerformance.median_eval;

  if(medianPerf && avgPerf){
    a = (a+movePerformance.median_eval)/2
  }else if(!medianPerf && !avgPerf){
    a = 0;
  }
  return {
          marginBottom: '30px',
          borderRadius: '5px',
          boxShadow: `0 10px 30px `+'rgba('+(a*-1>=0 ? 0 : 255)+','+(a*-1>=0 ? 255 : 0)+',0,'+(Math.min(1,Math.abs(a)))+')'
        }
}
