
import * as move_meta from "./move-meta.js"


export const mobilityKeys = [
  "Opponement Mobility (All)",
  "Opponement Mobility (Pieces)",
  "Opponement Mobility (Pieces without Queen & King)",
  "Opponement Mobility (Pawns)",
  "Opponement Mobility (Pieces without Queen & King) per Minor Piece",
  "Opponement Mobility (King)",
  "Opponement Mobility (Queen)",
  "Opponement Mobility (Pawns) per Pawn"
]

export function mobility(game, fen, last_move,onlyVector){
	  
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

    var vector = [
     moves.length,
   	 non_pawn_moves.length,	
   	 non_pwan_moves_without_QK,
   	 pawn_moves.length,
  	 non_pwan_moves_without_QK/(color_of_move_b ? piecesWhite.filter(e => e=='B' || e=='N' || e=='R').length : piecesBlack.filter(e => e=='b' || e=='n' || e=='r').length),
  	 non_pwan_moves_only_K,
  	 non_pwan_moves_only_Q,
  	 pawn_moves.length/(color_of_move_b ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length)
	]

	  if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[mobilityKeys[i]]=e})
	  return dict; 
}
