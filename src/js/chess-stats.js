
import * as chess_meta from "../js/chess-meta.js"

const Chess = require("chess.js");

function getMovesAsFENs(game, process){ 
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
	}else{
		return e=='p' || e=='b' || e=='n' || e=='r' || e=='q';
	}
}

function countMaterial(fen){
	return fen.map(e => e.toLowerCase()).map(e => e=='p' ? 1 : e).map(e => e=='b' ? 3 : e).map(e => e=='n' ? 3 : e).map(e => e=='r' ? 5 : e).map(e => e=='q' ? 9 : e).reduce((a, b) => a + b, 0);
}

function material(fen){
	var fen_ = fen.split(" ")[0].split("");
	var piecesWhite = fen_.filter(e => filterPieces("white",e));
    var piecesBlack = fen_.filter(e => filterPieces("black",e));
    var totalMaterialWhite = countMaterial(piecesWhite);
    var totalMaterialBlack = countMaterial(piecesBlack);

    return {
    	  "Total Material": totalMaterialWhite+totalMaterialBlack,
			// ['unusual {high, low} total material']
        "Material {white}": totalMaterialWhite,
			// ['unusual {high, low} material (white)']
        "Material {black}": totalMaterialBlack,
			// ['unusual {high, low} material (black)']
        "P count {white}": piecesWhite.filter(e => e=='P').length,
        "p count {black}": piecesBlack.filter(e => e=='p').length,
        "N count {white}": piecesWhite.filter(e => e=='N').length,
        "n count {black}": piecesBlack.filter(e => e=='n').length,
        "B count {white}": piecesWhite.filter(e => e=='B').length,
        "b count {black}": piecesBlack.filter(e => e=='b').length,
        "R count {white}": piecesWhite.filter(e => e=='R').length,
        "r count {black}": piecesBlack.filter(e => e=='r').length,
        "Q count {white}": piecesWhite.filter(e => e=='Q').length,
        "q count {black}": piecesBlack.filter(e => e=='q').length, 
        "B > n {white}": (piecesWhite.filter(e => e=='B').length > piecesBlack.filter(e => e=='n').length) ? 1 : 0, 
        "N > b {white}": (piecesWhite.filter(e => e=='N').length > piecesBlack.filter(e => e=='b').length) ? 1 : 0, 
        "B == N {white}": (piecesWhite.filter(e => e=='B').length == piecesWhite.filter(e => e=='N').length) ? 1 : 0, 
        "P == p {white}": (piecesWhite.filter(e => e=='P').length == piecesBlack.filter(e => e=='p').length) ? 1 : 0,
        "b > N {black}": (piecesBlack.filter(e => e=='b').length > piecesWhite.filter(e => e=='N').length) ? 1 : 0, 
        "n > B {black}": (piecesBlack.filter(e => e=='n').length > piecesWhite.filter(e => e=='B').length) ? 1 : 0, 
        "b == n {black}": (piecesBlack.filter(e => e=='b').length == piecesBlack.filter(e => e=='n').length) ? 1 : 0, 
        "p == P {black}": (piecesBlack.filter(e => e=='p').length == piecesWhite.filter(e => e=='P').length) ? 1 : 0 
    }
}

function package_density(fen){ 
    var fen_new = fen.split(" ");
    var res = fen.split(" ")[0].replaceAll("8","eeeeeeee").replaceAll("7","eeeeeee").replaceAll("6","eeeeee").replaceAll("5","eeeee").replaceAll("4","eeee").replaceAll("3","eee").replaceAll("2","ee").replaceAll("1","e").split("").map(e => e.toLowerCase()=="p" || e=="/" ? e :"e").join("").split("/").map(e => {return {w:e.split("").map((e,i) => e.toLowerCase()!=e ? e :"e"),b:e.split("").map(e => e.toLowerCase()==e ? e :"e")};}).map((e,i) => {return {w:e.w.map((e,ii) => i==0 && e=="e" ? "n" : i<6 && e=="e" ? "p" : i==7 && ii==0 ? "k" : i==7 && ii==7 ? "K" : e),b:e.b.map((e,ii) => i==7 && e=="e" ? "n" : i>1 && e=="e" ? "p" : i==0 && ii==0 ? "k" : i==0 && ii==7 ? "K" : e=="e" ? e : e.toUpperCase()).map(e => e.toLowerCase()==e && e!="e" ? e.toUpperCase(): e.toLowerCase())}}).map(e => {return {w: e.w.join(""),b: e.b.join("")}}).reduce((a,b) => {return {w: a.w+"/"+b.w, b:a.b+"/"+b.b}},{w:"",b:""});
    var new_w = [res.w.slice(1,).replaceAll("eeeeeeee","8").replaceAll("eeeeeee","7").replaceAll("eeeeee","6").replaceAll("eeeee","5").replaceAll("eeee","4").replaceAll("eee","3").replaceAll("ee","2").replaceAll("e","1"),"w","-","-","0","1"].join(" ");
    var new_b = [res.b.slice(1,).replaceAll("eeeeeeee","8").replaceAll("eeeeeee","7").replaceAll("eeeeee","6").replaceAll("eeeee","5").replaceAll("eeee","4").replaceAll("eee","3").replaceAll("ee","2").replaceAll("e","1"),"b","-","-","0","1"].join(" ");
    var newGame = new Chess(new_w);
    var moves_w = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));
    newGame.load(new_b);
    var moves_b = newGame.moves().filter(e => !e.toLowerCase().includes('k') && !e.toLowerCase().includes('='));

    var w_pawn_count = new_w.split("").filter(e => e=="P").length
    var b_pawn_count = new_b.split("").filter(e => e=="p").length
    // * excluding squares where a pawn protects a pawn 

    var out = {
      w: {moves: moves_w,
        "Pawn protected squares (excluding: protected pawns, overprotection)": new Set(moves_w.map(e => e.split("x")[1])).size,
        "Pawn protected squares per pawn (excluding: protected pawns, overprotection)": new Set(moves_w.map(e => e.split("x")[1])).size/w_pawn_count,
        "Pawn over protected squares (excluding: protected pawns)": moves_w.map(e => e.split("x")[1]).length - (new Set(moves_w.map(e => e.split("x")[1])).size),
        "Pawn packing density (excluding: prodected pawns)": moves_w.map(e => e.split("x")[1]).length / w_pawn_count
        // exposed surface area per pawn
        },
      b:{moves: moves_b,
        "Pawn protected squares (excluding: protected pawns, overprotection)": new Set(moves_b.map(e => e.split("x")[1])).size,
        "Pawn protected squares per pawn (excluding: protected pawns, overprotection)": new Set(moves_b.map(e => e.split("x")[1])).size/b_pawn_count,
        "Pawn over protected squares (excluding: protected pawns)": moves_b.map(e => e.split("x")[1]).length - (new Set(moves_b.map(e => e.split("x")[1])).size),
        "Pawn packing density (excluding: prodected pawns)": moves_b.map(e => e.split("x")[1]).length / b_pawn_count
        }
    }
    var out_ = {
      color:out,
      both: {
        "Pawn protected squares (excluding: protected pawns, overprotection)": out.w["Pawn protected squares (excluding: protected pawns, overprotection)"]/out.b["Pawn protected squares (excluding: protected pawns, overprotection)"],
        "Pawn protected squares per pawn (excluding: protected pawns, overprotection)": out.w["Pawn protected squares per pawn (excluding: protected pawns, overprotection)"]/out.b["Pawn protected squares per pawn (excluding: protected pawns, overprotection)"],
        "Pawn over protected squares (excluding: protected pawns)": out.w["Pawn over protected squares (excluding: protected pawns)"] - out.b["Pawn over protected squares (excluding: protected pawns)"],
        "Pawn packing density (excluding: prodected pawns)": out.w["Pawn packing density (excluding: prodected pawns)"]/out.b["Pawn packing density (excluding: prodected pawns)"]
       
      }
  }
  return {
       "Protected-squares ratio (excl. pieces as defenders, protected pawns, overprotection)": out_.both["Pawn protected squares (excluding: protected pawns, overprotection)"],
			 "Protected-squares per pawn ratio (excl. pieces as defenders, protected pawns, overprotection)": out_.both["Pawn protected squares per pawn (excluding: protected pawns, overprotection)"],
			 "Over-protected-squares ratio (excl. pieces as defenders, protected pawns)": out_.both["Pawn over protected squares (excluding: protected pawns)"],
       "Packing density ratio (excl. pieces as defenders, prodected pawns)": out_.both["Pawn packing density (excluding: prodected pawns)"],
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {white}": out_.color.w["Pawn protected squares (excluding: protected pawns, overprotection)"],
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {white}": out_.color.w["Pawn protected squares per pawn (excluding: protected pawns, overprotection)"],
       "Over-protected-squares (excl. pieces as defenders, protected pawns) {white}": out_.color.w["Pawn over protected squares (excluding: protected pawns)"],
       "Packing density (excl. pieces as defenders, prodected pawns) {white}": out_.color.w["Pawn packing density (excluding: prodected pawns)"],
       "Protected-squares (excl. pieces as defenders, protected pawns, overprotection) {black}": out_.color.b["Pawn protected squares (excluding: protected pawns, overprotection)"],
       "Protected-squares per pawn (excl. pieces as defenders, protected pawns, overprotection) {black}": out_.color.b["Pawn protected squares per pawn (excluding: protected pawns, overprotection)"],
       "Over-protected squares (excl. pieces as defenders, protected pawns) {black}": out_.color.b["Pawn over protected squares (excluding: protected pawns)"],
       "Packing density (excl. pieces as defenders, protected pawns) {black}": out_.color.b["Pawn packing density (excluding: prodected pawns)"]
  } 
}

function expansion_factor(fen){
	var fen_ = fen.split(" ")[0];
	var temp8 = fen_.replace(/[0-9]/g, "").split("/").map(e => {return {w: e.split("").filter(e => e.toLowerCase()!=e).join(""),b: e.split("").filter(e => e.toLowerCase()==e).join("")}}).map((e,i) => [(i+1)*e.w.split("").length,(7-i+1)*e.b.split("").length,e.w.split("").length,e.b.split("").length]).reduce((a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3]],[0,0,0,0])
    var temp9 = fen_.replaceAll("8","eeeeeeee").replaceAll("7","eeeeeee").replaceAll("6","eeeeee").replaceAll("5","eeeee").replaceAll("4","eeee").replaceAll("3","eee").replaceAll("2","ee").replaceAll("1","e").split("/").map(e => {return {w: [e.slice(0,4),e.slice(4,8)],b: [e.slice(0,4),e.slice(4,8)]}}).map((e,i) => [e.w[0].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length*(i+1),e.w[0].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length,e.w[1].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length*(i+1),e.w[1].split("").filter(e => e.toLowerCase()!=e).filter(e => e!="e").length,e.b[0].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length*(7-i+1),e.b[0].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length,e.b[1].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length*(7-i+1),e.b[1].split("").filter(e => e.toLowerCase()==e).filter(e => e!="e").length]).reduce((a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3],a[4]+b[4],a[5]+b[5],a[6]+b[6],a[7]+b[7]],[0,0,0,0,0,0,0,0]);
    // white and black mixxed because of array 0,4 -> black 5-7 -> white
    var temp10 = [(temp9[0]/temp9[1]),(temp9[4]/temp9[5]),(temp9[2]/temp9[3]),(temp9[6]/temp9[7]),(temp8[0]/temp8[2]),(temp8[1]/temp8[3])].map(e => isNaN(e) ? 0 : e==Infinity? 0 : e)
    var temp11 = [temp10[1]/temp10[0],temp10[3]/temp10[2],temp10[5]/temp10[4]].map(e => isNaN(e) ? 0 : e==Infinity? 0 : e)

    return {
			"Expansion Factor Queen Side":  temp11[0],
			// ['unusual {high, low} Queen Side Expansion']
			"Expansion Factor King Side": temp11[1],
			// ['unusual {high, low} King Side Expansion']
			"Expansion Factor King Side {white}": temp10[0],
			// ['unusual {high, low} Queen Side Expansion (white)']
			"Expansion Factor King Side {black}": temp10[1],
			// ['unusual {high, low} Queen Side Expansion (black)']
			"Expansion Factor Queen Side {white}": temp10[2],
			// ['unusual {high, low} King Side Expansion (white)']
			"Expansion Factor Queen Side {black}": temp10[3],
			// ['unusual {high, low} King Side Expansion (black)']
			"Expansion Factor": temp11[2],
			// ['unusual {high, low} Expansion']
			"Expansion Factor {white}": temp10[4],
			// ['unusual {high, low} Expansion (white)']
   		"Expansion Factor {black}": temp10[5],
			// ['unusual {high, low} Expansion (black)']
    }
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

function mobility(game, fen, last_move){
	  var fen_ = fen.split(" ")[0].split("");

    var piecesWhite = fen_.filter(e => filterPieces("white",e));
    var piecesBlack = fen_.filter(e => filterPieces("black",e));
	  var moves = game.moves();
    var pawn_moves = moves.filter(e => e.length==2 && e.toLowerCase()==e);
    var non_pawn_moves = moves.filter(e => e.toLowerCase()!=e) 

   	return {
   	"Opponement Mobility (All)": moves.length,
   	"Opponement Mobility (Pieces)": non_pawn_moves.length,	
   	"Opponement Mobility (Pawns)": pawn_moves.length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length),
	  "Opponement Mobility (Pieces) per Minor Piece": non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='B' || e=='N' || e=='R').length : piecesBlack.filter(e => e=='b' || e=='n' || e=='r').length),
		"Opponement Mobility (Pieces) per Major Piece": non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='Q' || e=='R').length : piecesBlack.filter(e => e=='q' || e=='r').length),
   	// ['unusual {high, low} total mobility']
  	"Opponement Mobility (Pawns) per Pawn": pawn_moves.length/(getColorOfMove(last_move)=="b" ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length)
		// ['unusual {high, low} pawn mobility']
	 	// ['unusual {high, low} piece mobility per {Queen, King, Minor Piece, Major Piece}']
   	}
}



function info_move(last_move){
	return {
			"Pawn move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() == getNotationOfMove(last_move) && getFigureOfMove(last_move)==null)  ? 1 : 0,
			"Pawn move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() == getNotationOfMove(last_move) && getFigureOfMove(last_move)==null)  ? 1 : 0,
			"Bishop move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="B")  ? 1 : 0,
			"Bishop move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="B")  ? 1 : 0,
			"Knight move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="N")  ? 1 : 0,
			"Knight move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="N")  ? 1 : 0,
			"Rook move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="R")  ? 1 : 0,
			"Rook move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="R")  ? 1 : 0,
			"Queen move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="Q")  ? 1 : 0,
			"Queen move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="Q")  ? 1 : 0,
			"King move played {white}": (getColorOfMove(last_move)=="w" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="K")  ? 1 : 0,
			"King move played {black}": (getColorOfMove(last_move)=="b" && !getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="K")  ? 1 : 0,
			// ['unusual {high, low} number of {Pawn, Bishop, Knight, Queen, King, Rook} moves']
			"Px move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() == getNotationOfMove(last_move) && getFigureOfMove(last_move)==null)  ? 1 : 0,
			"px move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() == getNotationOfMove(last_move) && getFigureOfMove(last_move)==null)  ? 1 : 0,
			"Bx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="B")  ? 1 : 0,
			"bx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="B")  ? 1 : 0,
			"Nx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="N")  ? 1 : 0,
			"nx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="N")  ? 1 : 0,
			"Qx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="Q")  ? 1 : 0,
			"qx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="Q")  ? 1 : 0,
			"Rx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="R")  ? 1 : 0,
			"rx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="R")  ? 1 : 0,
			"Kx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="K")  ? 1 : 0,
			"kx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && getFigureOfMove(last_move)=="K")  ? 1 : 0,
			// ['unusual {high, low} number of {Pawns, Bishops, Knights, Queens, Kings, Rooks} captures']
			"Bx or Nx move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && (getFigureOfMove(last_move)=="B" || getFigureOfMove(last_move)=="N") )  ? 1 : 0,
			"bx or nx move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move).includes('x') && getNotationOfMove(last_move).toLowerCase() != getNotationOfMove(last_move) && (getFigureOfMove(last_move)=="B" || getFigureOfMove(last_move)=="N") )  ? 1 : 0,
			// ['unusual {high, low} number of minor piece captures']
			"0-0 move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move)=="O-O")  ? 1 : 0,
			"0-0 move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move)=="O-O")  ? 1 : 0,
			// ['{early, average, late} castling timing']
			"0-0-0 move played {white}": (getColorOfMove(last_move)=="w" && getNotationOfMove(last_move)=="O-O-O")  ? 1 : 0,
			"0-0-0 move played {black}": (getColorOfMove(last_move)=="b" && getNotationOfMove(last_move)=="O-O-O")  ? 1 : 0
			// ['{early, average, late} queen side castling timing']
	}
}


export function getStatisticsForPosition(new_game,last_move) {
                var fen = new_game.fen();

				var material_ = material(fen);
				var package_density_ = package_density(fen);
				var expansion_factor_ = expansion_factor(fen);
				var mobility_ = mobility(new_game, fen, last_move);
				var info_move_ = info_move(last_move)

                var statistics =  {
	               "index": 0, 
				   			 "game count": 1
                }
                statistics = Object.assign({}, statistics, material_);
                statistics = Object.assign({}, statistics, package_density_);
                statistics = Object.assign({}, statistics, expansion_factor_);
                statistics = Object.assign({}, statistics, mobility_);
                statistics = Object.assign({}, statistics, info_move_);
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
        	  vector[key] = [" ("+(stats1[key] > stats2[key] ? "+" : "-")+diff.toFixed(2)+") "+key,diff,stats1[key],stats2[key]];
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


export async function getGameStatistics(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(games => {
	        var games_FEN = games
	              .filter(e => playerColor=='w' ? (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2") : (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))
	              .map(game => getMovesAsFENs(game, getStatisticsForPosition))
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