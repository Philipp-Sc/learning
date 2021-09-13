
import * as fen_utils from "./fen-utils.js"

import {average,reduce_sum} from "./utilities.js"

const Chess = require("chess.js"); 

const arr = [0,1,2,3,4,5,6,7];
const king_side = [4,5,6,7];
const queen_side = [0,1,2,3];


const pawn_skeleton_fen_list = [
						"8/pp3ppp/2p1p3/8/3P4/8/PPP2PPP/8",
						"8/pp3ppp/2p1p3/8/3P4/4P3/PP3PPP/8",
						"8/pp3ppp/3pp3/8/4P3/8/PPP2PPP/8",
						"8/pp2pp1p/3p2p1/8/4P3/8/PPP2PPP/8",
						"8/pp3ppp/3p4/4p3/4P3/8/PPP2PPP/8",
						"8/pp2pppp/3p4/8/2P1P3/8/PP3PPP/8",
						"8/pp1p1ppp/4p3/8/2P1P3/8/PP3PPP/8",
						"8/5ppp/pp1pp3/8/2P1P3/8/PP3PPP/8",
						"8/pp3ppp/2p5/4p3/2P1P3/8/PP3PPP/8",
						"8/pp3ppp/2pp4/8/2P1P3/8/PP3PPP/8",
						"8/ppp2ppp/3p4/3Pp3/4P3/8/PPP2PPP/8",
						"8/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/8",
						"8/ppp2ppp/8/8/3P4/8/PP3PPP/8",
						"8/pp3ppp/4p3/8/3P4/8/PP3PPP/8",
						"8/pp3ppp/4p3/8/2PP4/8/P4PPP/8",
						"8/pp3ppp/2p5/3p4/3P4/4P3/PP3PPP/8",
						"8/pp3ppp/4p3/2Pp4/3P4/8/PP3PPP/8",
						"8/ppp2 pp/4p3/3p1p2/3P1P2/4P3/PPP3PP/8",
						"8/pp3ppp/3p4/2p1p3/2P1P3/3P4/PP3PPP/8",
						"8/pp2pppp/3p4/2p5/4P3/3P4/PPP2PPP/8"]

var pawn_skeleton_list = [...pawn_skeleton_fen_list].map(f => fen_utils.expandFen(f));
// Source https://en.wikipedia.org/wiki/Pawn_structure

export const skeleton_to_ascii = (index) => { 
		var chess = new Chess(pawn_skeleton_fen_list[index]+" w - - 0 1");
		return chess.ascii(); 

}

const pawn_skeleton_name_list =	[
						"The Caro formation",
						"The Slav formation",
						"The Scheveningen formation",
						"The Dragon formation",
						"The Boleslavsky hole formation",
						"The Maróczy bind formation with a pawn on d6.",
						"The Maróczy bind formation with a pawn on e6.",
						"The Hedgehog formation",
						"The Rauzer formation  (colors reversed)",
						"The Boleslavsky Wall formation",
						"The d5 chain formation",
						"The e5 chain formation",
						"The Isolani formation in the Giuoco Piano",
						"The Isolani formation in the Queen's Gambit ",
						"The Hanging Pawns formation",
						"The Carlsbad formation",
						"The Panov formation",
						"The Stonewall formation",
						"The Botvinnik system",
						"The Closed Sicilian formation"]



export const pawnKeys = [ 
		"Open A File",
		"Open B File",
		"Open C File",
		"Open D File",
		"Open E File",
		"Open F File",
		"Open G File",
		"Open H File",  
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
		"Queen Side Pawn Majority {white}",
		"King Side Pawn Majority {black}",
		"Queen Side Pawn Majority {black}",
		"Furthest advanced pawn {white}",
		"Furthest advanced pawn {black}",
		"Least advanced pawn {white}",
		"Least advanced pawn {black}",
		"Avg advanced pawn {white}",
		"Avg advanced pawn {black}",
		"Fianchetto Queen Side {white}",
		"Fianchetto King Side {white}",
		"Fianchetto Queen Side {black}",
		"Fianchetto King Side {black}",
		"Pawn Structure 1st Closest Match",
		"Pawn Structure 2nd Closest Match",
		"Pawn Structure 3rd Closest Match",
		"Pawn Structure 1st Closest Match Count",
		"Pawn Structure 2nd Closest Match Count",
		"Pawn On A3 {white}",
		"Pawn On H3 {white}",
		"Pawn On A4 {white}",
		"Pawn On H4 {white}",
		"Pawn On A6 {black}",
		"Pawn On H6 {black}",
		"Pawn On A5 {black}",
		"Pawn On H5 {black}",
		"Count Pawns On White Squares {white}",
		"Count Pawns On Black Squares {white}",
		"Count Pawns On White Squares {black}",
		"Count Pawns On Black Squares {black}",];

	 
function isIsolatedPawn(each_size,each,each_all,i,each_Pp, each_pP) { 
	if(!each_Pp[i]){
		return 0;
	}

	if(i == 0){ // A
		return (each_size[1]==1 || (each_size[1]==2 && each_pP[1])) ? 1 : 0
	}else if(i==7){ // H
		return (each_size[6]==1 || (each_size[6]==2 && each_pP[6])) ? 1 : 0
	}else{ // B,..,G
		return ((each_size[i+1]==1 || (each_size[i+1]==2 && each_pP[i+1])) && (each_size[i-1]==1 || (each_size[i-1]==2 && each_pP[i-1]))) ? 1 : 0
	}
	return undefined;
}


export function pawnFeatures(fen,onlyVector) {

	var expandedFen = fen_utils.expandFen(fen);
	var game_pawn_structure = expandedFen.map(e => e=="P" || e=="p" || e=="e" || e=="/" ? e : "e");

	// count correctly placed pawns for each pattern
	// return index of matching/closest pattern 

	var matches = pawn_skeleton_list.map(f =>  f.map((e,i) => e==game_pawn_structure[i]).filter(e => e).length);
	var max = Math.max(...matches);
	var closest_pawn_structure = matches.indexOf(max)
	var max_1 = Math.max(...matches.filter(e => e<max))
	var closest_pawn_structure_1 = matches.indexOf(max_1);
	var max_2 = Math.max(...matches.filter(e => e<max_1));
	var closest_pawn_structure_2 = matches.indexOf(max_2);

	// todo: go back one move
	// then match closest pawn structure
	// if same; repeat;
	// until new pattern found or end reached.

	var res = fen_utils.fenToOneBoard(fen,true);

	var each_all = arr.map(ee => res.map(e => e[ee]));
	/* (8) [Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8), Array(8)]
H	0: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
G	1: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
F	2: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
E	3: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
D	4: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
C	5: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
B	6: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
A	7: (8) ["e", "p", "e", "e", "e", "e", "P", "e"]
	         8    7    6    5    4    3    2    1
	*/

	var each_all_square_color = new Array(8).fill(undefined).map((e,i) => i%2==0 ? new Array(8).fill(null).map((e,i) => i%2!=0) : new Array(8).fill(null).map((e,i) => i%2==0))
	// true -> white
	// false -> black
	var each_all_square_color_1d = [].concat.apply([], each_all_square_color);

	
	

	var each = each_all.map(ee => new Set(ee));

	// could run in parallel
	var each_p = each.map(e => e.has("p"));
	var each_P = each.map(e => e.has("P"));
	var each_size = each.map(e => e.size);

	var each_all_p = each_all.map(ee => ee.map(e => e=="p"));
	var each_all_P = each_all.map(ee => ee.map(e => e=="P"));
	// />
	var each_all_p_1d =[].concat.apply([], each_all_p);
	var each_all_P_1d =[].concat.apply([], each_all_P);

	var each_all_p_1d_on_white_squares = each_all_p_1d.filter((e,i) => each_all_square_color_1d[i] && e).length
	var each_all_p_1d_on_black_squares = each_all_p_1d.filter((e,i) => !each_all_square_color_1d[i] && e).length
	var each_all_P_1d_on_white_squares = each_all_P_1d.filter((e,i) => each_all_square_color_1d[i] && e).length
	var each_all_P_1d_on_black_squares = each_all_P_1d.filter((e,i) => !each_all_square_color_1d[i] && e).length
	


	var vector = [  
		each_size[0]==1 ? 1 : 0,
		each_size[1]==1 ? 1 : 0,
		each_size[2]==1 ? 1 : 0,
		each_size[3]==1 ? 1 : 0,
		each_size[4]==1 ? 1 : 0,
		each_size[5]==1 ? 1 : 0,
		each_size[6]==1 ? 1 : 0,
		each_size[7]==1 ? 1 : 0,  
		each_size[0]==2 && each_p[0] ? 1 : 0,
		each_size[1]==2 && each_p[1] ? 1 : 0,
		each_size[2]==2 && each_p[2] ? 1 : 0,
		each_size[3]==2 && each_p[3] ? 1 : 0,
		each_size[4]==2 && each_p[4] ? 1 : 0,
		each_size[5]==2 && each_p[5] ? 1 : 0,
		each_size[6]==2 && each_p[6] ? 1 : 0,
		each_size[7]==2 && each_p[7] ? 1 : 0,
		each_size[0]==2 && each_P[0] ? 1 : 0,
		each_size[1]==2 && each_P[1] ? 1 : 0,
		each_size[2]==2 && each_P[2] ? 1 : 0,
		each_size[3]==2 && each_P[3] ? 1 : 0,
		each_size[4]==2 && each_P[4] ? 1 : 0,
		each_size[5]==2 && each_P[5] ? 1 : 0,
		each_size[6]==2 && each_P[6] ? 1 : 0,
		each_size[7]==2 && each_P[7] ? 1 : 0,
		reduce_sum(arr.map(i => each_all_P[i].filter(ee => ee).length>=2 ? 1 : 0)),
		reduce_sum(arr.map(i => each_all_p[i].filter(ee => ee).length>=2 ? 1 : 0)),
		reduce_sum(arr.map(e => isIsolatedPawn(each_size,each,each_all,e,each_P,each_p))), // white
		reduce_sum(arr.map(e => isIsolatedPawn(each_size,each,each_all,e,each_p,each_P))), // black
		reduce_sum(king_side.map(e => each_P[e] ? 1 : 0)) > reduce_sum(queen_side.map(e => each_P[e] ? 1 : 0)) ? 1 : 0,
		reduce_sum(king_side.map(e => each_P[e] ? 1 : 0)) < reduce_sum(queen_side.map(e => each_P[e] ? 1 : 0)) ? 1 : 0,
		reduce_sum(king_side.map(e => each_p[e] ? 1 : 0)) > reduce_sum(queen_side.map(e => each_p[e] ? 1 : 0)) ? 1 : 0,
		reduce_sum(king_side.map(e => each_p[e] ? 1 : 0)) < reduce_sum(queen_side.map(e => each_p[e] ? 1 : 0)) ? 1 : 0,
		8-Math.min(...each_all_P.map(e => Math.min(...e.map((ee,i) => ee ? i : 8)))),
		8-Math.max(...each_all_p.map(e => Math.max(...e.map((ee,i) => ee ? i : -1)))),
		8-Math.max(...each_all_P.map(e => Math.max(...e.map((ee,i) => ee ? i : -1)))),
		8-Math.min(...each_all_p.map(e => Math.min(...e.map((ee,i) => ee ? i : 8)))),
		(8-average(each_all_P.map(e => average(e.map((ee,i) => ee ? i : -1).filter(e => e!=-1))).filter(e => !isNaN(e)))) || -1,
		(8-average(each_all_p.map(e => average(e.map((ee,i) => ee ? i : -1).filter(e => e!=-1))).filter(e => !isNaN(e)))) || -1,
		reduce_sum([each_all_P[2][6],each_all_P[1][5],each_all_P[0][6]].map(e => e ? 1 : 0)),// pawns on F2,G3,H2
		reduce_sum([each_all_P[7][6],each_all_P[6][5],each_all_P[5][6]].map(e => e ? 1 : 0)),// pawns on A2,B3,C2
		reduce_sum([each_all_p[2][1],each_all_p[1][2],each_all_p[0][1]].map(e => e ? 1 : 0)),// pawns on F7,G6,H7
		reduce_sum([each_all_p[7][1],each_all_p[6][2],each_all_p[5][1]].map(e => e ? 1 : 0)), // pawns on A7,B6,C7
		closest_pawn_structure,
		closest_pawn_structure_1,
		closest_pawn_structure_2,
		max,
		max_1, 
		each_all_P[7][5] ? 1 : 0, // A3
		each_all_P[0][5] ? 1 : 0,  // H3
		each_all_P[7][4] ? 1 : 0, // A4
		each_all_P[0][4] ? 1 : 0,  // H4
		each_all_p[7][2] ? 1 : 0, // A6
		each_all_p[0][2] ? 1 : 0, // H6
		each_all_p[7][3] ? 1 : 0, // A5
		each_all_p[0][3] ? 1 : 0, // H5
		each_all_P_1d_on_white_squares,
		each_all_P_1d_on_black_squares,
		each_all_p_1d_on_white_squares,
		each_all_p_1d_on_black_squares,
		];
	
	if(onlyVector) return vector;

	var dict = {}
	vector.forEach((e,i) => {dict[pawnKeys[i]]=e})
	return dict;
}