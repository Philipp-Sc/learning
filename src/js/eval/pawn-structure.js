
import * as fen_utils from "./fen-utils.js"

import {average,reduce_sum} from "../utilities.js"


const arr = [0,1,2,3,4,5,6,7];
const king_side = [4,5,6,7];
const queen_side = [0,1,2,3];


export const pawnKeys = [
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
		"Queen Side Pawn Majority {white}",
		"King Side Pawn Majority {black}",
		"Queen Side Pawn Majority {black}",
		"Furthest advanced pawn {white}",
		"Furthest advanced pawn {black}",
		"Least advanced pawn {white}",
		"Least advanced pawn {black}",
		"Avg advanced pawn {white}",
		"Avg advanced pawn {black}",
		"Fianchetto King Side {white}",
		"Fianchetto King Side {black}",
		"Fianchetto Queen Side {white}",
		"Fianchetto Queen Side {black}",];


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

	var res = fen_utils.fenToOneBoard(fen,true);

	var each_all = arr.map(ee => res.map(e => e[ee]));
	var each = each_all.map(ee => new Set(ee));

	// could run in parallel
	var each_p = each.map(e => e.has("p"));
	var each_P = each.map(e => e.has("P"));
	var each_size = each.map(e => e.size);

	var each_all_p = each_all.map(ee => ee.map(e => e=="p"));
	var each_all_P = each_all.map(ee => ee.map(e => e=="p"));
	// />



	var vector = [ 
	    reduce_sum(each_size.map(e => e==1 ? 1 : 0)),
		each_size[0]==1 ? 1 : 0,
		each_size[1]==1 ? 1 : 0,
		each_size[2]==1 ? 1 : 0,
		each_size[3]==1 ? 1 : 0,
		each_size[4]==1 ? 1 : 0,
		each_size[5]==1 ? 1 : 0,
		each_size[6]==1 ? 1 : 0,
		each_size[7]==1 ? 1 : 0,
		reduce_sum(each_size.map(e => e==2 ? 1 : 0)),
		each_size[0]==2 ? 1 : 0,
		each_size[1]==2 ? 1 : 0,
		each_size[2]==2 ? 1 : 0,
		each_size[3]==2 ? 1 : 0,
		each_size[4]==2 ? 1 : 0,
		each_size[5]==2 ? 1 : 0,
		each_size[6]==2 ? 1 : 0,
		each_size[7]==2 ? 1 : 0,
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
		Math.min(...each_all_P.map(e => Math.min(...e.map((ee,i) => ee ? i : 8)))),
		Math.max(...each_all_p.map(e => Math.max(...e.map((ee,i) => ee ? i : -1)))),
		Math.max(...each_all_P.map(e => Math.max(...e.map((ee,i) => ee ? i : -1)))),
		Math.min(...each_all_p.map(e => Math.min(...e.map((ee,i) => ee ? i : 8)))),
		average(each_all_P.map(e => average(e.map((ee,i) => ee ? i : -1).filter(e => e!=-1))).filter(e => !isNaN(e))) || -1,
		average(each_all_p.map(e => average(e.map((ee,i) => ee ? i : -1).filter(e => e!=-1))).filter(e => !isNaN(e))) || -1,
		reduce_sum([each_all_P[5][1],each_all_P[6][2],each_all_P[7][1]].map(e => e ? 1 : 0)),// pawns on F2,G3,H2
		reduce_sum([each_all_P[0][1],each_all_P[1][2],each_all_P[2][1]].map(e => e ? 1 : 0)),// pawns on A2,B3,C2
		reduce_sum([each_all_p[5][6],each_all_p[6][5],each_all_p[7][6]].map(e => e ? 1 : 0)),// pawns on F7,G6,H7
		reduce_sum([each_all_p[0][6],each_all_p[1][5],each_all_p[2][6]].map(e => e ? 1 : 0)) // pawns on A7,B6,C7
		];
	
	if(onlyVector) return vector;

	var dict = {}
	vector.forEach((e,i) => {dict[pawnKeys[i]]=e})
	return dict;
}