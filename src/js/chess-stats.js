
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 
import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";

const Chess = require("chess.js"); 

const mobilityKeys = [
	"Opponement Mobility (All)",
  "Opponement Mobility (Pieces)",
  "Opponement Mobility (Pawns)",
	"Opponement Mobility (Pieces) per Minor Piece",
	"Opponement Mobility (Pieces) per Major Piece",
  "Opponement Mobility (Pawns) per Pawn"
]

const infoMoveKeys = [
		  "{fig} Pawn {white}",
			"{fig} Pawn {black}",
			"{fig} Bishop {white}",
			"{fig} Bishop {black}",
			"{fig} Knight {white}",
			"{fig} Knight {black}",
			"{fig} Rook {white}",
			"{fig} Rook {black}",
			"{fig} Queen {white}",
			"{fig} Queen {black}",
			"{fig} King {white}",
			"{fig} King {black}", 
			"{capture} Px {white}",
			"{capture} px {black}",
			"{capture} Bx {white}",
			"{capture} bx {black}",
			"{capture} Nx {white}",
			"{capture} nx {black}",
			"{capture} Qx {white}",
			"{capture} qx {black}",
			"{capture} Rx {white}",
			"{capture} rx {black}",
			"{capture} Kx {white}",
			"{capture} kx {black}", 
			"{capture} Bx or Nx {white}",
			"{capture} bx or nx {black}", 
			"{castle} 0-0 {white}",
			"{castle} 0-0 {black}", 
			"{castle} 0-0-0 {white}",
			"{castle} 0-0-0 {black}"
			]

const pawnKeys = [
    "Open Files",
		"Open A File",
		"Open B File",
		"Open C File",
		"Open D File",
		"Open E File",
		"Open F File",
		"Open G File",
		"Open H File",
		"Half-Open Files",
		"Half-Open A File",
		"Half-Open B File",
		"Half-Open C File",
		"Half-Open D File",
		"Half-Open E File",
		"Half-Open F File",
		"Half-Open G File",
		"Half-Open H File",
		"Half-Open A File {white}",
		"Half-Open B File {white}",
		"Half-Open C File {white}",
		"Half-Open D File {white}",
		"Half-Open E File {white}",
		"Half-Open F File {white}",
		"Half-Open G File {white}",
		"Half-Open H File {white}",
		"Half-Open A File {black}",
		"Half-Open B File {black}",
		"Half-Open C File {black}",
		"Half-Open D File {black}",
		"Half-Open E File {black}",
		"Half-Open F File {black}",
		"Half-Open G File {black}",
		"Half-Open H File {black}",
		"Double Pawns {white}",
		"Double Pawns {black}",
		"Isolated Pawns {white}",
		"Isolated Pawns {black}",
		"King Side Pawn Majority {white}",
		"Queen Side Pawn Majority {white}"];

const materialKeys = [	 
        "Total Material", 
        "Material {white}", 
        "Material {black}", 
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
        "B > n {white}",
        "N > b {white}",
        "B == N {white}",
        "P == p {white}",
        "b > N {black}",
        "n > B {black}",
        "b == n {black}",
        "p == P {black}"];

const packageDensityKeys = [ 
       "Protected-squares ratio (excl. pieces as defenders, protected pawns, overprotection)",
			 "Protected-squares per pawn ratio (excl. pieces as defenders, protected pawns, overprotection)",
			 "Over-protected-squares ratio (excl. pieces as defenders, protected pawns)",
       "Packing density ratio (excl. pieces as defenders, prodected pawns)",
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {white}",
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {white}",
       "Over-protected-squares (excl. pieces as defenders, protected pawns) {white}",
       "Packing density (excl. pieces as defenders, prodected pawns) {white}",
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {black}",
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {black}",
       "Over-protected squares (excl. pieces as defenders, protected pawns) {black}",
       "Packing density (excl. pieces as defenders, protected pawns) {black}"
       ]

const expansionFactorKeys = [	
      "Expansion Factor Queen Side", 
			"Expansion Factor King Side", 
			"Expansion Factor King Side {white}", 
			"Expansion Factor King Side {black}", 
			"Expansion Factor Queen Side {white}", 
			"Expansion Factor Queen Side {black}", 
			"Expansion Factor", 
			"Expansion Factor {white}", 
   		"Expansion Factor {black}" 
  ]

var allKeys = [
         "index",
   			 "game count",
   			 "cp",
   			 "halfmove",
   			 "last move by",
   			 ...materialKeys,
   			 ...packageDensityKeys,
   			 ...expansionFactorKeys,
   			 ...mobilityKeys,
   			 ...infoMoveKeys,
   			 ...pawnKeys
        ];

function getMovesAsFENs(game, process){ 
	console.log("...")
	var newGame = new Chess();
	var fens : string[] = [];
	for (var i = 0; i < game.moves.length; i++) {
		if(game.moves[i] && game.moves[i].notation && game.moves[i].notation.notation){
			newGame.move(game.moves[i].notation.notation);
			fens.push(process(newGame,game.moves[i]));
		}
	}
	return fens;
}

function filterPieces(playerColor,e){
	if(playerColor=="white"){
		return e=='P' || e=='B' || e=='N' || e=='R' || e=='Q';
	}else if(playerColor=="black"){
		return e=='p' || e=='b' || e=='n' || e=='r' || e=='q';
	}else{
		return e=='p' || e=='b' || e=='n' || e=='r' || e=='q' || e=='P' || e=='B' || e=='N' || e=='R' || e=='Q';
	}
}

function countMaterial(fen){
	return fen.map(e => e.toLowerCase()).map(e => e=='p' ? 1 : e).map(e => e=='b' ? 3 : e).map(e => e=='n' ? 3 : e).map(e => e=='r' ? 5 : e).map(e => e=='q' ? 9 : e).reduce((a, b) => a + b, 0);
}

function expandFen(fen) {
   //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" 
	 var res = fen.split(" ")[0].replaceAll("8","eeeeeeee").replaceAll("7","eeeeeee").replaceAll("6","eeeeee").replaceAll("5","eeeee").replaceAll("4","eeee").replaceAll("3","eee").replaceAll("2","ee").replaceAll("1","e").split("")
   // .join("") -> "rnbqkbnr/pppppppp/eeeeeeee/eeeeeeee/eeeeeeee/eeeeeeee/PPPPPPPP/RNBQKBNR"
   return res;
}
function zipFen(fen) {
	 var res = fen.replaceAll("eeeeeeee","8").replaceAll("eeeeeee","7").replaceAll("eeeeee","6").replaceAll("eeeee","5").replaceAll("eeee","4").replaceAll("eee","3").replaceAll("ee","2").replaceAll("e","1");
	 return res;
}

function fenToBoard(fen,onlyPawns){
	var expFen = expandFen(fen);
	var res = expFen.map(e => (onlyPawns ? e.toLowerCase()=="p" : filterPieces("both",e) || e.toLowerCase()=="k") || e=="/" ? e :"e").join("").split("/").map(e => {return {w:e.split("").map((e,i) => e.toLowerCase()!=e ? e :"e"),b:e.split("").map(e => e.toLowerCase()==e ? e :"e")};})
  return {"white":res.map(e => e.w), "black":res.map(e => e.b)}
}

function fenToOneBoard(fen,onlyPawns){
	var res = fenToBoard(fen,onlyPawns);
	const zip = (a, b) => a.map((k, i) => k=="e" ? b[i] : k);
	return res.white.map((e,i) => zip(e, res.black[i]))
	/*
		 (8) [Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8)]
	0: (8) ["r", "n", "b", "q", "k", "b", "n", "r"]
	1: (8) ["p", "p", "p", "p", "p", "p", "p", "p"]
	2: (8) ["e", "e", "e", "e", "e", "e", "e", "e"]
	3: (8) ["e", "e", "e", "e", "e", "e", "e", "e"]
	4: (8) ["e", "e", "e", "e", "e", "e", "e", "e"]
	5: (8) ["e", "e", "e", "e", "e", "e", "e", "e"]
	6: (8) ["P", "P", "P", "P", "P", "P", "P", "P"]
	7: (8) ["R", "N", "B", "Q", "K", "B", "N", "R"]
	length: 8
*/
}

function isIsolatedPawn(each,each_all,i,playerColor) {
	var pawn = playerColor=="white" ? "P" : "p"
	var pawn_ = playerColor=="white" ? "p" : "P"

	if(!each_all[i].includes(pawn)){
		return 0;
	}

	if(i == 0){ // A
		return (each[1].size==1 || (each[1].size==2 && Array.from(each[1]).includes(pawn_))) ? 1 : 0
	}else if(i==7){ // H
		return (each[6].size==1 || (each[6].size==2 && Array.from(each[6]).includes(pawn_))) ? 1 : 0
	}else{ // B,..,G
		return ((each[i+1].size==1 || (each[i+1].size==2 && Array.from(each[i+1]).includes(pawn_))) && (each[i-1].size==1 || (each[i-1].size==2 && Array.from(each[i-1]).includes(pawn_)))) ? 1 : 0
	}
	return undefined;
}

function pawnFeatures(fen,onlyVector) {

	var res = fenToOneBoard(fen,true);

	var each = [0,1,2,3,4,5,6,7].map(ee => new Set(res.map(e => e[ee])));
	var each_all = [0,1,2,3,4,5,6,7].map(ee => res.map(e => e[ee]));

	var vector = [ 
	  each.map(e => e.size==1 ? 1 : 0).reduce( ( p, c ) => p + c, 0 ),
		each[0].size==1 ? 1 : 0,
		each[1].size==1 ? 1 : 0,
		each[2].size==1 ? 1 : 0,
		each[3].size==1 ? 1 : 0,
		each[4].size==1 ? 1 : 0,
		each[5].size==1 ? 1 : 0,
		each[6].size==1 ? 1 : 0,
		each[7].size==1 ? 1 : 0,
		each.map(e => e.size==2 ? 1 : 0).reduce( ( p, c ) => p + c, 0 ),
		each[0].size==2 ? 1 : 0,
		each[1].size==2 ? 1 : 0,
		each[2].size==2 ? 1 : 0,
		each[3].size==2 ? 1 : 0,
		each[4].size==2 ? 1 : 0,
		each[5].size==2 ? 1 : 0,
		each[6].size==2 ? 1 : 0,
		each[7].size==2 ? 1 : 0,
		each[0].size==2 && Array.from(each[0]).includes("p") ? 1 : 0,
		each[1].size==2 && Array.from(each[1]).includes("p") ? 1 : 0,
		each[2].size==2 && Array.from(each[2]).includes("p") ? 1 : 0,
		each[3].size==2 && Array.from(each[3]).includes("p") ? 1 : 0,
		each[4].size==2 && Array.from(each[4]).includes("p") ? 1 : 0,
		each[5].size==2 && Array.from(each[5]).includes("p") ? 1 : 0,
		each[6].size==2 && Array.from(each[6]).includes("p") ? 1 : 0,
		each[7].size==2 && Array.from(each[7]).includes("p") ? 1 : 0,
		each[0].size==2 && Array.from(each[0]).includes("P") ? 1 : 0,
		each[1].size==2 && Array.from(each[1]).includes("P") ? 1 : 0,
		each[2].size==2 && Array.from(each[2]).includes("P") ? 1 : 0,
		each[3].size==2 && Array.from(each[3]).includes("P") ? 1 : 0,
		each[4].size==2 && Array.from(each[4]).includes("P") ? 1 : 0,
		each[5].size==2 && Array.from(each[5]).includes("P") ? 1 : 0,
		each[6].size==2 && Array.from(each[6]).includes("P") ? 1 : 0,
		each[7].size==2 && Array.from(each[7]).includes("P") ? 1 : 0,
		[0,1,2,3,4,5,6,7].map(i => each_all[i].filter(ee => ee=="P").length>=2 ? 1 : 0).reduce( ( p, c ) => p + c, 0 ),
		[0,1,2,3,4,5,6,7].map(i => each_all[i].filter(ee => ee=="p").length>=2 ? 1 : 0).reduce( ( p, c ) => p + c, 0 ),
		[0,1,2,3,4,5,6,7].map(e => isIsolatedPawn(each,each_all,e,"white")).reduce( ( p, c ) => p + c, 0 ),
		[0,1,2,3,4,5,6,7].map(e => isIsolatedPawn(each,each_all,e,"black")).reduce( ( p, c ) => p + c, 0 ),
		[4,5,6,7].map(e => Array.from(each[e]).includes("P") ? 1 : 0).reduce( ( p, c ) => p + c, 0) > [0,1,2,3].map(e => Array.from(each[e]).includes("P") ? 1 : 0).reduce( ( p, c ) => p + c, 0) ? 1 : 0,
		[4,5,6,7].map(e => Array.from(each[e]).includes("P") ? 1 : 0).reduce( ( p, c ) => p + c, 0) > [0,1,2,3].map(e => Array.from(each[e]).includes("P") ? 1 : 0).reduce( ( p, c ) => p + c, 0) ? 0 : 1
		];
	
	if(onlyVector) return vector;

	var dict = {}
	vector.forEach((e,i) => {dict[pawnKeys[i]]=e})
	return dict;
}

function material(fen, onlyVector){
	var fen_ = fen.split(" ")[0].split("");
	var piecesWhite = fen_.filter(e => filterPieces("white",e));
  var piecesBlack = fen_.filter(e => filterPieces("black",e));
  var totalMaterialWhite = countMaterial(piecesWhite);
  var totalMaterialBlack = countMaterial(piecesBlack);

  var vector = [	  
         totalMaterialWhite+totalMaterialBlack, 
         totalMaterialWhite, 
         totalMaterialBlack, 
         piecesWhite.filter(e => e=='P').length,
         piecesBlack.filter(e => e=='p').length,
         piecesWhite.filter(e => e=='N').length,
         piecesBlack.filter(e => e=='n').length,
         piecesWhite.filter(e => e=='B').length,
         piecesBlack.filter(e => e=='b').length,
         piecesWhite.filter(e => e=='R').length,
         piecesBlack.filter(e => e=='r').length,
         piecesWhite.filter(e => e=='Q').length,
         piecesBlack.filter(e => e=='q').length, 
         (piecesWhite.filter(e => e=='B').length > piecesBlack.filter(e => e=='n').length) ? 1 : 0, 
         (piecesWhite.filter(e => e=='N').length > piecesBlack.filter(e => e=='b').length) ? 1 : 0, 
         (piecesWhite.filter(e => e=='B').length == piecesWhite.filter(e => e=='N').length) ? 1 : 0, 
         (piecesWhite.filter(e => e=='P').length == piecesBlack.filter(e => e=='p').length) ? 1 : 0,
         (piecesBlack.filter(e => e=='b').length > piecesWhite.filter(e => e=='N').length) ? 1 : 0, 
         (piecesBlack.filter(e => e=='n').length > piecesWhite.filter(e => e=='B').length) ? 1 : 0, 
         (piecesBlack.filter(e => e=='b').length == piecesBlack.filter(e => e=='n').length) ? 1 : 0, 
         (piecesBlack.filter(e => e=='p').length == piecesWhite.filter(e => e=='P').length) ? 1 : 0 
  ]
  if(onlyVector) return vector;

	var dict = {}
	vector.forEach((e,i) => {dict[materialKeys[i]]=e})
	return dict; 
}

function package_density(fen,onlyVector){ 
	  
		var res = fenToBoard(fen,true)
	  var res_b = res.black.map((e,i) => {return e.map((e,ii) => i==7 && e=="e" ? "n" : i>1 && e=="e" ? "p" : i==0 && ii==0 ? "k" : i==0 && ii==7 ? "K" : e=="e" ? e : e.toUpperCase()).map(e => e.toLowerCase()==e && e!="e" ? e.toUpperCase(): e.toLowerCase())}).map(e => e.join("")).join("/")
    var res_w = res.white.map((e,i) => {return e.map((e,ii) => i==0 && e=="e" ? "n" : i<6 && e=="e" ? "p" : i==7 && ii==0 ? "k" : i==7 && ii==7 ? "K" : e)}).map(e => e.join("")).join("/")

    var new_w = [zipFen(res_w),"w","-","-","0","1"].join(" ");
    var new_b = [zipFen(res_b),"b","-","-","0","1"].join(" ");

    var newGame = new Chess(new_w);
    var moves_w = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));
    newGame.load(new_b);
    var moves_b = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));

    var w_pawn_count = new_w.split("").filter(e => e=="P").length
    var b_pawn_count = new_b.split("").filter(e => e=="p").length
    // * excluding squares where a pawn protects a pawn 

	  var vector = [
	        new Set(moves_w.map(e => e.split("x")[1])).size,
	        new Set(moves_w.map(e => e.split("x")[1])).size/w_pawn_count,
	        moves_w.map(e => e.split("x")[1]).length - (new Set(moves_w.map(e => e.split("x")[1])).size),
	        moves_w.map(e => e.split("x")[1]).length / w_pawn_count,

	        new Set(moves_b.map(e => e.split("x")[1])).size,
	        new Set(moves_b.map(e => e.split("x")[1])).size/b_pawn_count,
	        moves_b.map(e => e.split("x")[1]).length - (new Set(moves_b.map(e => e.split("x")[1])).size),
	        moves_b.map(e => e.split("x")[1]).length / b_pawn_count  
	 ]
	 vector = [...vector,
	        vector[0]/vector[4],
	        vector[1]/vector[5],
	        vector[2] - vector[6],
	        vector[3]/vector[7]
	       ]

   if(onlyVector) return vector;

	 var dict = {}
	 vector.forEach((e,i) => {dict[packageDensityKeys[i]]=e})
	 return dict; 
}

function expansion_factor(fen,onlyVector){
	var fen_ = fen.split(" ")[0];
	var temp8 = fen_.replace(/[0-9]/g, "").split("/").map(e => {return {w: e.split("").filter(e => e.toLowerCase()!=e).join(""),b: e.split("").filter(e => e.toLowerCase()==e).join("")}}).map((e,i) => [(i+1)*e.w.split("").length,(7-i+1)*e.b.split("").length,e.w.split("").length,e.b.split("").length]).reduce((a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3]],[0,0,0,0])
    var temp9 = fen_.replaceAll("8","eeeeeeee").replaceAll("7","eeeeeee").replaceAll("6","eeeeee").replaceAll("5","eeeee").replaceAll("4","eeee").replaceAll("3","eee").replaceAll("2","ee").replaceAll("1","e").split("/").map(e => {return {w: [e.slice(0,4),e.slice(4,8)],b: [e.slice(0,4),e.slice(4,8)]}}).map((e,i) => [e.w[0].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length*(i+1),e.w[0].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length,e.w[1].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length*(i+1),e.w[1].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length,e.b[0].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length*(7-i+1),e.b[0].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length,e.b[1].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length*(7-i+1),e.b[1].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length]).reduce((a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3],a[4]+b[4],a[5]+b[5],a[6]+b[6],a[7]+b[7]],[0,0,0,0,0,0,0,0]);
    // white and black mixxed because of array 0,4 -> black 5-7 -> white
    var temp10 = [(temp9[0]/temp9[1]),(temp9[4]/temp9[5]),(temp9[2]/temp9[3]),(temp9[6]/temp9[7]),(temp8[0]/temp8[2]),(temp8[1]/temp8[3])].map(e => isNaN(e) ? 0 : e==Infinity? 0 : e)
    var temp11 = [temp10[1]/temp10[0],temp10[3]/temp10[2],temp10[5]/temp10[4]].map(e => isNaN(e) ? 0 : e==Infinity? 0 : e)

    var vector = [	  
       temp11[0], 
			 temp11[1], 
			 temp10[0], 
			 temp10[1], 
			 temp10[2], 
			 temp10[3], 
			 temp11[2], 
			 temp10[4], 
   		 temp10[5] 
			];

    if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[expansionFactorKeys[i]]=e})
	  return dict; 
}


function getColorOfMove(last_move){
	if(last_move.turn){
		return last_move.turn;
	}else{
		return last_move.color;
	}
}

function getNotationOfMove(last_move){
	if(last_move.notation){
		return last_move.notation.notation;
	}else{
		return last_move.san;
	}
}

function getFigureOfMove(last_move){
	if(last_move.notation){
		return last_move.notation.fig;
	}else{
		if(last_move.piece=="p"){
			return null;
		}
		return last_move.color=='w' ? last_move.piece.toUpperCase() : last_move.piece.toLowerCase();
	}
}

function mobility(game, fen, last_move,onlyVector){
	  var fen_ = fen.split(" ")[0].split("");

    var piecesWhite = fen_.filter(e => filterPieces("white",e));
    var piecesBlack = fen_.filter(e => filterPieces("black",e));
	  var moves = game.moves();
    var pawn_moves = moves.filter(e => e.length==2 && e.toLowerCase()==e);
    var non_pawn_moves = moves.filter(e => e.toLowerCase()!=e) 

    var vector = [
     moves.length,
   	 non_pawn_moves.length,	
   	 pawn_moves.length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length),
	   non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='B' || e=='N' || e=='R').length : piecesBlack.filter(e => e=='b' || e=='n' || e=='r').length),
		 non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='Q' || e=='R').length : piecesBlack.filter(e => e=='q' || e=='r').length),
  	 pawn_moves.length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length)
	]

	  if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[mobilityKeys[i]]=e})
	  return dict; 
}



function info_move(last_move,onlyVector){

	var color_of_move = getColorOfMove(last_move);
	var color_of_move_w = getColorOfMove(last_move)=="w";
	var color_of_move_b = !color_of_move_w;
	var notation_of_move = getNotationOfMove(last_move);
	var notation_of_move_lower = notation_of_move.toLowerCase();
	var figure_of_move = getFigureOfMove(last_move);
	var notation_of_move_includes_x = notation_of_move.includes('x');
	var notation_of_move_is_upper = notation_of_move_lower != notation_of_move

	var vector = [
      (color_of_move_w && !notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_w && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
      (color_of_move_b && !notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
     // ['unusual {high, low} number of {Pawn, Bishop, Knight, Queen, King, Rook} moves']
      (color_of_move_w && notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && !notation_of_move_is_upper && figure_of_move==null)  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="B")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="N")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="Q")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="R")  ? 1 : 0,
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && figure_of_move=="K")  ? 1 : 0,
     // ['unusual {high, low} number of {Pawns, Bishops, Knights, Queens, Kings, Rooks} captures']
      (color_of_move_w && notation_of_move_includes_x && notation_of_move_is_upper && (figure_of_move=="B" || figure_of_move=="N") )  ? 1 : 0,
      (color_of_move_b && notation_of_move_includes_x && notation_of_move_is_upper && (figure_of_move=="B" || figure_of_move=="N") )  ? 1 : 0,
     // ['unusual {high, low} number of minor piece captures']
      (color_of_move_w && notation_of_move=="O-O")  ? 1 : 0,
      (color_of_move_b && notation_of_move=="O-O")  ? 1 : 0,
     // ['{early, average, late} castling timing']
      (color_of_move_w && notation_of_move=="O-O-O")  ? 1 : 0,
      (color_of_move_b && notation_of_move=="O-O-O")  ? 1 : 0 
                     
			 ]

		if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[infoMoveKeys[i]]=e})
	  return dict; 
	
}

function getStatisticsForPositionDict(new_game,last_move) {
	return getStatisticsForPosition(new_game,last_move,false);
}

function getStatisticsForPositionVector(new_game,last_move) {
	return getStatisticsForPosition(new_game,last_move,true);
}

function getStatisticsForPosition(new_game,last_move,onlyVector) {
        var fen = new_game.fen();

				var material_ = material(fen,onlyVector);
				var package_density_ = package_density(fen,onlyVector);
				var expansion_factor_ = expansion_factor(fen,onlyVector);
				var mobility_ = mobility(new_game, fen, last_move,onlyVector);
				var info_move_ = info_move(last_move,onlyVector);
				var pawn_features_ = pawnFeatures(fen,onlyVector);

				if(onlyVector){
					return [0,1,last_move.commentAfter,new_game.history().length,getColorOfMove(last_move)=="w" ? 1 : 0,...material_,...package_density_,...expansion_factor_,...mobility_,...info_move_,...pawn_features_]
				}

        var statistics =  {
         "index": 0, 
   			 "game count": 1,
   			 "cp": last_move.commentAfter,
   			 "halfmove": new_game.history().length,
   			 "last move by": getColorOfMove(last_move)=="w" ? 1 : 0,
        }
        statistics = Object.assign({}, statistics, material_);
        statistics = Object.assign({}, statistics, package_density_);
        statistics = Object.assign({}, statistics, expansion_factor_);
        statistics = Object.assign({}, statistics, mobility_);
        statistics = Object.assign({}, statistics, info_move_);
        statistics = Object.assign({}, statistics, pawn_features_);
        return statistics;
            }

function sum(ob1, ob2) {
      let sum = {};

      Object.keys(ob1).forEach(key => {
        if (ob2.hasOwnProperty(key)) {
          sum[key] = ob1[key] + ob2[key]
        }  
      })
      return sum;
}

export function getDistanceVectorForStatistics(stats){
	var stats1 = stats.playerStats;
	var stats2 = stats.stats;
	let vector = {}
	Object.keys(stats1).forEach(key => {
        if (stats2.hasOwnProperty(key)) {
        	var diff = Math.abs(stats1[key] - stats2[key]);
        	if(diff>0.1 && stats2!=Infinity){ 
        		if(key.includes("{fig}") || key.includes("{capture}") || key.includes("{castle}")){
        			vector[key] = [" ("+(stats1[key] > stats2[key] ? ""+(100*Math.abs(diff-1)).toFixed(1)+"%) " : ""+(100*diff).toFixed(1)+"%) ")+key,diff,stats1[key],stats2[key]];
        		}else{
        	  	vector[key] = [" ("+(stats1[key] > stats2[key] ? "+" : "-")+diff.toFixed(2)+") "+key,diff,stats1[key],stats2[key]];
        		}
        	}
        }  
      })

		// Create items array
	var items = Object.keys(vector).map(function(key) {
	  return vector[key];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
	  return second[1] - first[1];
	});

	return	items.map(entry => entry[0]);
}

function createModel(inputSize,outputSize) {
  // Create a sequential model
  const model = tf.sequential();

  // Add a single input layer
  model.add(tf.layers.dense({inputShape: [inputSize], units: 1024, useBias: true, activation: 'relu'}));

  // Add an hidden layer
  model.add(tf.layers.dense({units: 512, useBias: false, activation: 'relu'}));  
  // model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  // activation ('elu'|'hardSigmoid'|'linear'|'relu'|'relu6'| 'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'|'swish'|'mish')


  // Add an output layer
  model.add(tf.layers.dense({units: outputSize, useBias: false}));

  return model;
}


function normalize(min, max) {
    var delta = max - min;
    return function (val) {
        var res = (val - min) / delta;
        return !isFinite(res) || isNaN(res) ? 0 : res;
    };
}

function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return ( p < v ? p : v );
  });
}

function arrayMax(arr) {
  return arr.reduce(function (p, v) {
    return ( p > v ? p : v );
  });
}

function normalizeVector(data,inputMinMax_,labelMinMax_) {

	 var inputMinMax;
	 var labelMinMax;

   if(!inputMinMax_ || !labelMinMax_){
		  var v_min = new Array(data[0].data.length).fill(Infinity);
		  var v_max = new Array(data[0].data.length).fill(-Infinity);
		  for(var i=0;i<data.length;i++){
		  	data[i].data.forEach((e,i) => {
		  		if(e<v_min[i]){
		  			v_min[i] = e;
		  		}
		  		if(e>v_max[i]){
		  			v_max[i] = e;
		  		} 
		  	}) 
		  }
	    var inputMinMax =  v_min.map((e,i) => {return {"min":v_min[i], "max":v_max[i]}})

	    var d = data.map(entry => entry.label).map(e => e==undefined ? -1 : (isFinite(e) ? e : -1));
	    var labelMinMax =  {max: 2, min: -2}
  }

    if(inputMinMax_ && labelMinMax_){
    	inputMinMax = inputMinMax_;
    	labelMinMax = labelMinMax_;
    }
    

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.data).map(entry => entry.map((e,i) => normalize(inputMinMax[i].min,inputMinMax[i].max)(e)))
    const labels = data.map(d => d.label).map(entry => normalize(labelMinMax.min,labelMinMax.max)(entry))

    return {
    	inputs:inputs,
    	labels:labels,
    	inputMinMax:inputMinMax,
    	labelMinMax:labelMinMax,
    }
}

/**
 * Convert the input data to tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    const res = normalizeVector(data,undefined,undefined);
    const inputs = res.inputs;
    const labels = res.labels;
    //console.log(inputs);
    //console.log(labels);


    const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

 
    return {
      inputs: inputTensor,
      labels: labelTensor,
      // Return the min/max bounds so we can use them later.
      inputMinMax: res.inputMinMax,
      labelMinMax: res.labelMinMax, 
    }
  });
}

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });

  const batchSize = 16;
  const epochs = 50;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'mse'],
      { height: 300, callbacks: ['onEpochEnd'] }
    )
  });
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export async function getFeatureImportance(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(async(games) => {
		      //console.log(games.length) // 1839
					//var games = games.filter((e,iii) => iii<=5);
					games.forEach((game,ii) => {
						 game.moves.forEach((move,i) => {
						 	if(move.commentAfter){
						 		var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
						 		var cp = parseFloat(temp);
						 		games[ii].moves[i].commentAfter = isNaN(cp) ? -1 : cp;
						 	} 
					})
					}) 

	        var games_FEN = games
	        //      .filter(e => playerColor=='w' ? (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2") : (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))
	        
	       const getResults = (n) => {return getMovesAsFENs(n, getStatisticsForPositionVector)}
	       for(var x=0;x<games_FEN.length;x++){
	       	games_FEN[x] = getResults(games_FEN[x]);
	       } 

	       //console.log(games_FEN)
	        
	        var vectors = [].concat.apply([], games_FEN)
	        //.filter(e => e[allKeys.indexOf("last move by")]==1 && e[allKeys.indexOf("halfmove")]>5*2 && e[allKeys.indexOf("halfmove")]<=45*2)
          
	       //console.log(vectors)

          vectors = vectors.map(e => {
	        	var target = e[allKeys.indexOf("cp")]; 
	        	e.splice(allKeys.indexOf("cp"), 1);
	        	return {"data": e, "label":target}
	        })

	        //console.log(vectors)

	       /*
					* Sample the data in a smart way, to avoid overfitting to the median/average label value
	        */

	        var histGenerator = d3.bin()
					  .domain([-2,2])    // Set the domain to cover the entire intervall [0;]
					  .thresholds(10);  // number of thresholds; this will create 10+1 bins

					var bins = histGenerator(vectors.map(e => e.label))
					.filter(e => e.length>=1).map(e => [arrayMin(e),e.length,arrayMax(e)])

					//console.log(bins);

					const median = arr => {
            const mid = Math.floor(arr.length / 2),
              nums = [...arr].sort((a, b) => a - b);
            return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
          };

					var mean_most_common_least_common_count = median(bins.map(e => e[1]));

					var selectVectors = [];

					for(var i = 0; i<mean_most_common_least_common_count;i++){
						bins.forEach(e => {
						var temp = vectors.filter(each => each.label>=e[0] && each.label<=e[2])
						selectVectors.push(temp[Math.floor(Math.random() * temp.length)])
						})
					}
					
					//console.log(selectVectors);

					vectors = selectVectors;

					/* Create the model
					 */


	        const model = createModel(vectors[0].data.length,1);
	        //const model = await tf.loadLayersModel('localstorage://my-model');

					tfvis.show.modelSummary({name: 'Model Summary'}, model);


					/* Prepare training data
					 */

					// Convert the data to a form we can use for training.
					const tensorData = convertToTensor(vectors);
					const {inputs, labels} = tensorData;


					window.localStorage.setItem("normalizeVector",JSON.stringify({"input":tensorData.inputMinMax,"label":tensorData.labelMinMax}))
 					console.log("normalizeVector written to localStorage")

 					// "{\"input\":[{\"min\":0,\"max\":0},{\"min\":1,\"max\":1},{\"min\":1,\"max\":499},{\"min\":0,\"max\":1},{\"min\":0,\"max\":78},{\"min\":0,\"max\":39},{\"min\":0,\"max\":39},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":14},{\"min\":0,\"max\":2},{\"min\":0,\"max\":6},{\"min\":0,\"max\":2},{\"min\":0,\"max\":13},{\"min\":0,\"max\":2},{\"min\":0,\"max\":6},{\"min\":0,\"max\":2},{\"min\":0,\"max\":null},{\"min\":0,\"max\":null},{\"min\":-4,\"max\":4},{\"min\":0,\"max\":null},{\"min\":0,\"max\":7},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0.13333333333333333,\"max\":5.333333333333333},{\"min\":1,\"max\":8},{\"min\":1,\"max\":8},{\"min\":1,\"max\":63},{\"min\":1,\"max\":61},{\"min\":0,\"max\":2},{\"min\":0,\"max\":null},{\"min\":0,\"max\":null},{\"min\":0,\"max\":2},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":8},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":8},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":3},{\"min\":0,\"max\":3},{\"min\":0,\"max\":4},{\"min\":0,\"max\":4},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1}],\"label\":{\"max\":2,\"min\":-2}}"


					// Train the model
					var res = await trainModel(model, inputs, labels);
					console.log('Done Training');

					//await model.save('localstorage://my-model');
					//await model.save('downloads://my-model');

          // Load the model
					//const model = await tf.loadLayersModel('localstorage://my-model-2');


					/* Prepare test data
					 */

					// todo: use saved minMax values
					var temp = JSON.parse(window.localStorage.getItem("normalizeVector"))
        	var res = normalizeVector(vectors,temp.input,temp.label);


        	console.log(res);
        	//res.inputs.length
				  const preds = model.predict(tf.tensor2d(res.inputs, [res.inputs.length, res.inputs[0].length]));
				  console.log("first pred, then label")
				  console.log(preds.dataSync());
				  console.log(res.labels); 


				return;



	        var result = []; 
	        // we need a evaluation key
	        // then can do regression here
	        console.log(games_FEN)
 
	        console.log(JSON.stringify(result));
	      })
}

export async function getGameStatistics(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(games => {
	        games.forEach((game,ii) => {
						 game.moves.forEach((move,i) => {
						 	if(move.commentAfter){
						 		var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
						 		var cp = parseFloat(temp);
						 		games[ii].moves[i].commentAfter = isNaN(cp) ? -1 : cp;
						 	} 
					})
					})

	        var games_FEN = games
	              .filter(e => playerColor=='w' ? (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2") : (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))
	              .map(game => getMovesAsFENs(game, getStatisticsForPositionDict))
	        var result = [];

	        var zero; 
	        for(var i=0;i<180;i++){ 
	            zero = {};
	            Object.keys(games_FEN[0][0]).forEach(k => zero[k] = 0);
	            // @ts-ignore
	            games_FEN.forEach(e => {if(e[i]){zero = sum(zero,e[i])};}); 
	            // @ts-ignore
	            Object.keys(zero).map(function(key, index) {
	              if(key=="game count" || key=="index"){return;}
	              // @ts-ignore
	              zero[key] = (zero[key]/zero["game count"]).toFixed(2);
	            });
	            zero["index"]=result.length
	            // @ts-ignore
	            result.push(zero);
	        }
	        console.log(JSON.stringify(result));
	      })
}


export async function getSkillProfile(elo,depth) {
	  return chess_meta.chessGames("human").then(humanGames => humanGames.get).then(games => {
  
       const processing1 = (games_1,games_2,i) => { 
        var evaluations = undefined; 
         if(i%2==0){ // white, because it starts at 0
              evaluations = games_1
              .filter(e => e.moves[i]!=undefined && e.moves[i].turn=='w' && e.moves[i].commentDiag!=null)
              .map(e => ("[%depth20 "+e.moves[i].commentDiag.depth20+"] [%depth1"+e.moves[i].commentDiag.depth1+"]" || "[%depth20 0] [%depth1 0]" ).replace("\n"," ").replace(/[\[\]\%]/g,"").split("depth").filter(e => e.length >0).map(e => { return {"depth": e.split(" ")[0], "eval": e.split(" ")[1]} }).filter( e => e.depth==depth)[0].eval)
              .map(e => parseFloat(e))
              .filter(e => !isNaN(e))
              .map(e => e*100); 
        }else{
             evaluations = games_2
              .filter(e => e.moves[i]!=undefined && e.moves[i].turn=='b' && e.moves[i].commentDiag!=null)
              .map(e => ("[%depth20 "+e.moves[i].commentDiag.depth20+"] [%depth1"+e.moves[i].commentDiag.depth1+"]" || "[%depth20 0] [%depth1 0]" ).replace("\n"," ").replace(/[\[\]\%]/g,"").split("depth").filter(e => e.length >0).map(e => { return {"depth": e.split(" ")[0], "eval": e.split(" ")[1]} }).filter( e => e.depth==depth)[0].eval)
              .map(e => parseFloat(e))
              .filter(e => !isNaN(e))
              .map(e => e*(-100));
        } 
       return  evaluations;
       }
       const processing2 = (evaluations) => {
          const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
          const median = arr => {
            const mid = Math.floor(arr.length / 2),
              nums = [...arr].sort((a, b) => a - b);
            return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
          };
          return {"avg" : average(evaluations),
                  "median" : median(evaluations),
                  "dist" : evaluations
                  };
       } 
       const processing = (games) => { 
       var games_1 = games 
              .filter(e => e.tags.WhiteElo >=elo && e.tags.WhiteElo <=elo+100)
              .filter(e => (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2")) 
       var games_2 = games
              .filter(e => e.tags.BlackElo >=elo && e.tags.BlackElo <=elo+100)
              .filter(e => (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))

        return processing1.bind(null,games_1,games_2)
        }   
       return Array(269).fill(0).map((e,i)=> processing(games)(i)).map(processing2); 
     })
}

export function getNotification(chess, playerColor, halfMoves){

	 if(halfMoves>0){ 
          var my_stats_now = getStatisticsForPositionDict(chess,chess.history({verbose:true}).reverse()[0]);
          var stats_opp = chess_meta[playerColor=="w" ? "white" : "black"][halfMoves];
          delete stats_opp["game count"];
          delete stats_opp["index"];
          delete stats_opp["Material"]; 

          var notification = getDistanceVectorForStatistics({'playerStats':my_stats_now,'stats': stats_opp})
          .filter(e => e.includes(playerColor=="w" ? "{white}" : "{black}")).map(e => e.replace(playerColor=="w" ? "{white}" : "{black}",""));
          notification = notification.map(e => {
            if(e.includes("{fig}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{fig}")).map(e => e.replace("{fig}","")).join("\n")
            }
            if(e.includes("{capture}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{capture}")).map(e => e.replace("{capture}","")).join("\n")
            }
            if(e.includes("{castle}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{castle}")).map(e => e.replace("{castle}","")).join("\n")
            }
            return e.replace("(excl.","\n(excl.")
          })
          return Array.from(new Set(notification)); 
 
        }else{
          return [];
        }
}