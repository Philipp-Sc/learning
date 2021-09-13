
import * as fen_utils from "./fen-utils.js"


const Chess = require("chess.js"); 

var newGame = new Chess();

export const packageDensityKeys = [   
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {white}",
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {white}",
       "Over-protected-squares (excl. pieces as defenders, protected pawns) {white}", 
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {black}",
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {black}",
       "Over-protected squares (excl. pieces as defenders, protected pawns) {black}", 
       ]

       // attacked occupied squares defended
       // attacked occupied squares
       // center squares protected

export function package_density(fen,onlyVector){  
	  
    var res = fen_utils.fenToBoard(fen,true) // only pawns
  
    for(var i=0;i<res.black.length;i++){  
       for(var ii=0;ii<res.black[i].length;ii++){
              res.black[i][ii] = i==7 && res.black[i][ii]=="e" ? // position knights on the last rank
                                    "N" : 
                                          i>1 && res.black[i][ii]=="e" ? // replace empty space with white pawns
                                          "P" : 
                                                 i==0 && ii==0 ? // position the white king
                                                 "K" : 
                                                        i==0 && ii==7 ? // position the black King
                                                        "k" : 
                                                               res.black[i][ii]=="e" ? // this fills the first rank with empty space
                                                               "e" : 
                                                                      res.black[i][ii]; // p

              res.white[i][ii] = i==0 && res.white[i][ii]=="e" ? // position kights on the first rank
                                    "n" :
                                          i<6 && res.white[i][ii]=="e" ? // replace empty space with black pawns
                                          "p" :
                                                  i==7 && ii==0 ? // position the black king
                                                  "k" : 
                                                        i==7 && ii==7 ? // position the white king
                                                        "K" : 
                                                               res.white[i][ii]=="e" ? // fills the last rank with empty space
                                                               "e" :
                                                                      res.white[i][ii]; // P
       }
    } 

    var new_w = [fen_utils.zipFen(res.white.map(e => e.join("")).join("/")),"w","-","-","0","1"].join(" ");
    var new_b = [fen_utils.zipFen(res.black.map(e => e.join("")).join("/")),"b","-","-","0","1"].join(" ");

    newGame.load(new_w)
    var moves_w = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));
    newGame.load(new_b);
    var moves_b = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));

    var w_pawn_count = new_w.split("").filter(e => e=="P").length
    var b_pawn_count = new_b.split("").filter(e => e=="p").length
    // * excluding squares where a pawn protects a pawn 

    var moves_can_capture_w = moves_w.map(e => e.split("x")[1]);
    var squares_can_capture_w_set = new Set(moves_can_capture_w)

    const squares_can_capture_w = squares_can_capture_w_set.size

    var moves_can_capture_b = moves_b.map(e => e.split("x")[1]);
    var squares_can_capture_b_set = new Set(moves_can_capture_b)

    const squares_can_capture_b = squares_can_capture_b_set.size

	  var vector = [
	        squares_can_capture_w,
	        squares_can_capture_w!=0 ? squares_can_capture_w/w_pawn_count :0,
	        moves_can_capture_w.length - squares_can_capture_w, 
	        squares_can_capture_b,
	        squares_can_capture_b!=0 ? squares_can_capture_b/b_pawn_count :0,
	        moves_can_capture_b.length - squares_can_capture_b, 
	 ] 

   if(onlyVector) return {vector: vector, opt: {"squares_can_capture_w":squares_can_capture_w_set,"squares_can_capture_b":squares_can_capture_b_set}};

	 var dict = {}
	 vector.forEach((e,i) => {dict[packageDensityKeys[i]]=e})
	 return {dict:dict,opt: {"squares_can_capture_w":squares_can_capture_w_set,"squares_can_capture_b":squares_can_capture_b_set}}; 
}