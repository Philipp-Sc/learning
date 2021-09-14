
import * as move_meta from "./move-meta.js"


export function countMaterial(fen){
	return fen.map(e => e.toLowerCase()).map(e => e=='p' ? 1 : e).map(e => e=='b' ? 3 : e).map(e => e=='n' ? 3 : e).map(e => e=='r' ? 5 : e).map(e => e=='q' ? 9 : e).reduce((a, b) => a + b, 0);
}

export function expandFen(fen) {
   //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" 
	 var res = fen.split(" ")[0].replaceAll("8","eeeeeeee").replaceAll("7","eeeeeee").replaceAll("6","eeeeee").replaceAll("5","eeeee").replaceAll("4","eeee").replaceAll("3","eee").replaceAll("2","ee").replaceAll("1","e").split("")
   // .join("") -> "rnbqkbnr/pppppppp/eeeeeeee/eeeeeeee/eeeeeeee/eeeeeeee/PPPPPPPP/RNBQKBNR"
   return res;
}
export function zipFen(fen) {
	 var res = fen.replaceAll("eeeeeeee","8").replaceAll("eeeeeee","7").replaceAll("eeeeee","6").replaceAll("eeeee","5").replaceAll("eeee","4").replaceAll("eee","3").replaceAll("ee","2").replaceAll("e","1");
	 return res;
}

export function fenToBoard(fen,onlyPawns){
	var expFen = expandFen(fen);
	var res = expFen.map(e => (onlyPawns ? e.toLowerCase()=="p" : move_meta.filterPieces("both",e) || e.toLowerCase()=="k") || e=="/" ? e :"e").join("").split("/").map(e => {return {w:e.split("").map((e,i) => e.toLowerCase()!=e ? e :"e"),b:e.split("").map(e => e.toLowerCase()==e ? e :"e")};})
  return {"white":res.map(e => e.w), "black":res.map(e => e.b)}
}

export function fenToOneBoard(fen,onlyPawns){
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