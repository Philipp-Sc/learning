
import * as fen_utils from "./fen-utils.js"
 


export const expansionFactorKeys = [	 
		"Expansion Factor King Side {white}", 
		"Expansion Factor King Side {black}", 
		"Expansion Factor Queen Side {white}", 
		"Expansion Factor Queen Side {black}",  
		"Expansion Factor {white}", 
   	"Expansion Factor {black}" 
  ]


 export function expansion_factor(fen,onlyVector){ 
	var simple_fen = fen.split(" ")[0];
	var fen_rows = simple_fen.replace(/[0-9]/g, "").split("/") 
	// ["rnbqkbnr", "pppppppp", "", "", "", "", "PPPPPPPP", "RNBQKBNR"]

	var sum_pieces = {
		white_pieces: 0,
		black_pieces: 0,
		white_pieces_ranked: 0,
		black_pieces_ranked: 0
	}

   var expanded_fen = fen_utils.expandFen(fen).join("").split("/")
   // ["rnbqkbnr", "ppppNpNp", "eeeeeeee", "eeeeeeee", "eeeeeeee", "eeeeeeee", "PPPPPPPP", "RNBQKBNR"]
 
 	var sum_pieces_per_wing = {
		white_pieces_queen_side: 0,
		white_pieces_king_side: 0,
		black_pieces_queen_side: 0,
		black_pieces_king_side: 0, 
		white_pieces_queen_side_ranked: 0,
		white_pieces_king_side_ranked: 0,
		black_pieces_queen_side_ranked: 0,
		black_pieces_king_side_ranked: 0, 
	}

	for(var i=0;i<fen_rows.length;i++){
	/* 0: {w: "", b: "rnbqkbnr"}
		1: {w: "", b: "pppppppp"}
		2: {w: "", b: ""}
		3: {w: "", b: ""}
		4: {w: "", b: ""}
		5: {w: "", b: ""}
		6: {w: "PPPPPPPP", b: ""}
		7: {w: "RNBQKBNR", b: ""}
	*/
		var white_pieces = fen_rows[i].split("").filter(e => e.toLowerCase()!=e).join("").split("").length;
		var black_pieces = fen_rows[i].split("").filter(e => e.toLowerCase()==e).join("").split("").length;
		var white_pieces_ranked = (i+1)*white_pieces;
		var black_pieces_ranked = (7-i+1)*black_pieces;

		sum_pieces.white_pieces += white_pieces
		sum_pieces.black_pieces += black_pieces
		sum_pieces.white_pieces_ranked += white_pieces_ranked
		sum_pieces.black_pieces_ranked += black_pieces_ranked

		var expanded_fen_wings = {
    			white_queen_side: expanded_fen[i].slice(0,4),
    			white_king_side: expanded_fen[i].slice(4,8), 
    			black_queen_side: expanded_fen[i].slice(0,4),
    			black_king_side: expanded_fen[i].slice(4,8)
    		}
	   var sum_pieces_per_wing_white_pieces_queen_side = expanded_fen_wings.white_queen_side.split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length;
 		var sum_pieces_per_wing_white_pieces_king_side  = expanded_fen_wings.white_king_side.split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length;
 		var sum_pieces_per_wing_black_pieces_queen_side = expanded_fen_wings.black_queen_side.split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length;
 		var sum_pieces_per_wing_black_pieces_king_side  = expanded_fen_wings.black_king_side.split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length;
 		
 		sum_pieces_per_wing.white_pieces_queen_side_ranked += sum_pieces_per_wing_white_pieces_queen_side*(i+1);
 		sum_pieces_per_wing.white_pieces_queen_side += sum_pieces_per_wing_white_pieces_queen_side; 
 		sum_pieces_per_wing.white_pieces_king_side_ranked += sum_pieces_per_wing_white_pieces_king_side*(i+1);
 		sum_pieces_per_wing.white_pieces_king_side  += sum_pieces_per_wing_white_pieces_king_side;
 		sum_pieces_per_wing.black_pieces_queen_side_ranked += sum_pieces_per_wing_black_pieces_queen_side*(7-i+1);
 		sum_pieces_per_wing.black_pieces_queen_side += sum_pieces_per_wing_black_pieces_queen_side;
 		sum_pieces_per_wing.black_pieces_king_side_ranked += sum_pieces_per_wing_black_pieces_king_side*(7-i+1);
 		sum_pieces_per_wing.black_pieces_king_side  += sum_pieces_per_wing_black_pieces_king_side; 
	}
 
    // white and black mixxed because of array 0,4 -> black 5-7 -> white
    var vector = [
    (sum_pieces_per_wing.white_pieces_queen_side_ranked/sum_pieces_per_wing.white_pieces_queen_side),
    (sum_pieces_per_wing.black_pieces_queen_side_ranked/sum_pieces_per_wing.black_pieces_queen_side),
    (sum_pieces_per_wing.white_pieces_king_side_ranked/sum_pieces_per_wing.white_pieces_king_side),
    (sum_pieces_per_wing.black_pieces_king_side_ranked/sum_pieces_per_wing.black_pieces_king_side),
    (sum_pieces.white_pieces/sum_pieces.white_pieces_ranked),
    (sum_pieces.black_pieces/sum_pieces.black_pieces_ranked)]
    .map(e => isNaN(e) ? 0 : e==Infinity? 0 : e)
      
    if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[expansionFactorKeys[i]]=e})
	  return dict; 
}