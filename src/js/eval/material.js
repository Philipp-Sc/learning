
import * as fen_utils from "./fen-utils.js"
import * as move_meta from "./move-meta.js"

export const materialKeys = [	 
        "P count {white}",
        "p count {black}",
        "N count {white}",
        "n count {black}",
        "B count {white}",
        "b count {black}",
        "R count {white}",
        "r count {black}",
        "Q count {white}",
        "q count {black}",
        "B > n",
        "N > b",
        "B == N",
        "P == p",
        "b > N",
        "n > B",
        "b == n"];

export function material(fen, onlyVector){
  var simple_fen = fen.split(" ")[0].split("");
  var piecesWhite = simple_fen.filter(e => move_meta.filterPieces("white",e));
  var piecesBlack = simple_fen.filter(e => move_meta.filterPieces("black",e)); 

  var piecesWhite_P =piecesWhite.filter(e => e=='P').length
  var piecesWhite_B =piecesWhite.filter(e => e=='B').length
  var piecesWhite_N =piecesWhite.filter(e => e=='N').length
  var piecesBlack_p =piecesBlack.filter(e => e=='p').length
  var piecesBlack_b =piecesBlack.filter(e => e=='b').length
  var piecesBlack_n =piecesBlack.filter(e => e=='n').length

  var vector = [	   
         piecesWhite_P,
         piecesBlack_p,
         piecesWhite_N,
         piecesBlack_n,
         piecesWhite_B,
         piecesBlack_b,
         piecesWhite.filter(e => e=='R').length,
         piecesBlack.filter(e => e=='r').length,
         piecesWhite.filter(e => e=='Q').length,
         piecesBlack.filter(e => e=='q').length, 
         (piecesWhite_B > piecesBlack_n) ? 1 : 0, 
         (piecesWhite_N > piecesBlack_b) ? 1 : 0, 
         (piecesWhite_B == piecesWhite_N) ? 1 : 0, 
         (piecesWhite_P == piecesBlack_p) ? 1 : 0,
         (piecesBlack_b > piecesWhite_N) ? 1 : 0, 
         (piecesBlack_n > piecesWhite_B) ? 1 : 0, 
         (piecesBlack_b == piecesBlack_n) ? 1 : 0,  
  ]
  if(onlyVector) return vector;

	var dict = {}
	vector.forEach((e,i) => {dict[materialKeys[i]]=e})
	return dict; 
}
