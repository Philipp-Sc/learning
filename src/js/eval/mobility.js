
import * as move_meta from "./move-meta.js"

const files = ['a','b','c','d','e','f','g','h']
const ranks = [1,2,3,4,5,6,7,8];

export const mobilityKeys = [
  "Opponement Mobility (All)",
  "Opponement Mobility (Pieces)",
  "Opponement Mobility (Pawns)", 
  "Opponement Mobility (King)",
  "Opponement Mobility (Queen)", 
  "Opponement Space Area (Unprotected)", 
]
// maybe add "Opponement Space Area (Protected)"
// "Number of Moves that can move into protected space"

// board replace king with empty space
// for each candidate square
// place king there
// chess js ask check and mate. -> true -> protected

// this method will exclude the king as a protector of squares
// in endgames or king attacks this might be bad


// Opponement Space Area. 
// Number of safe squares available for minor pieces on the central four files on ranks 2 to 4.
// Safe squares one, two or three squares behind a friendly pawn are counted twice.


export function mobility(game, fen, last_move,opt,onlyVector){
	  
	var simple_fen = fen.split(" ",1)[0].split("");

    var piecesWhite = simple_fen.filter(e => move_meta.filterPieces("white",e));
    var piecesBlack = simple_fen.filter(e => move_meta.filterPieces("black",e));
	  var moves = game.moves();
    var pawn_moves = moves.filter(e => e.length==2 && e.toLowerCase()==e);
    var non_pawn_moves = moves.filter(e => e.toLowerCase()!=e) 
    var color_of_move = move_meta.getColorOfMove(last_move);
    var color_of_move_b = color_of_move=="b"; 

    var non_pwan_moves_without_QK = non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length

    var non_pwan_moves_only_Q = non_pawn_moves.filter(e => e.includes('Q')).length
    var non_pwan_moves_only_K = non_pawn_moves.filter(e => e.includes('K')).length

    const behind_pawns = (curr_rank,any_r,e,color) => { 
      var mm = parseInt(curr_rank)
      var a;
      var d;
      if(color_of_move_b){ // color of prev player black => current player is white
        a = any_r < mm
        d = mm - any_r 
      }else{                // white
        a = any_r > mm
        d = any_r - mm
      } 
      if(d<=3 && a){ // check if square behind curr_rank on the board and max distance is 3 squares
        var square = game.get(e.split("")[0]+any_r);  
        /*console.log(game.ascii());
        console.log(e); 
        console.log(color) 
        console.log(e.split("")[0]+any_r)*/
        if(square){ 
          return square.type=='p' && square.color==color; // pawn must be color of player }
        }
      }
      return false;
    }

    var minorPieceMovesThatCanGoBehindPawns = game
    .moves({ verbose: true }) 
    .filter(e => e.piece.toLowerCase()!="p") 
    .filter(e => e.piece.toLowerCase()!="q" && e.piece.toLowerCase()!="k") 
    .filter(e => ['1','2','7','8','a','b','g','h'].map(each => e.to.includes(each)).filter(each => each).length==0)
    .map(e => {
      var m = e.to.split(""); 
      return {
        square:e, 
        isBehindPawn: ranks
                .filter(r => ![1,8].includes(r))
                .filter(r =>  behind_pawns(m[1],r,e.to,e.color))
              }
            }) 
    .filter(e => e.isBehindPawn.length > 0)
    .map(e => e.square)

    minorPieceMovesThatCanGoBehindPawns = new Set(minorPieceMovesThatCanGoBehindPawns)
  
    var minorPieceMovesThatCanGoBehindPawnsCount = minorPieceMovesThatCanGoBehindPawns.size;
 

    var vector = [
     moves.length,
   	 non_pawn_moves.length,	 
   	 pawn_moves.length,
  	 non_pwan_moves_only_K,
  	 non_pwan_moves_only_Q, 
     minorPieceMovesThatCanGoBehindPawnsCount, 
	]

	  if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[mobilityKeys[i]]=e})
	  return dict; 
}
