
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
    	"Material": totalMaterialWhite+totalMaterialBlack,
        "Material w": totalMaterialWhite,
        "Material b": totalMaterialBlack,
        "P count": piecesWhite.filter(e => e=='P').length,
        "p count": piecesBlack.filter(e => e=='p').length,
        "N count": piecesWhite.filter(e => e=='N').length,
        "n count": piecesBlack.filter(e => e=='n').length,
        "B count": piecesWhite.filter(e => e=='B').length,
        "b count": piecesBlack.filter(e => e=='b').length,
        "R count": piecesWhite.filter(e => e=='R').length,
        "r count": piecesBlack.filter(e => e=='r').length,
        "Q count": piecesWhite.filter(e => e=='Q').length,
        "q count": piecesBlack.filter(e => e=='q').length,
        "B > n": (piecesWhite.filter(e => e=='B').length > piecesBlack.filter(e => e=='n').length) ? 1 : 0,
        "N > b": (piecesWhite.filter(e => e=='N').length > piecesBlack.filter(e => e=='b').length) ? 1 : 0,
        "B == N": (piecesWhite.filter(e => e=='B').length == piecesWhite.filter(e => e=='N').length) ? 1 : 0,
        "P == p": (piecesWhite.filter(e => e=='P').length == piecesBlack.filter(e => e=='p').length) ? 1 : 0
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
        "pawn outward protected squares": new Set(moves_w.map(e => e.split("x")[1])).size,
        "outward protected square per pawn": new Set(moves_w.map(e => e.split("x")[1])).size/w_pawn_count,
        "pawn over(outward)protection": moves_w.map(e => e.split("x")[1]).length/(new Set(moves_w.map(e => e.split("x")[1])).size),
        "pawn outward packing density": moves_w.map(e => e.split("x")[1]).length / w_pawn_count
        },
      b:{moves: moves_b,
        "pawn outward protected squares": new Set(moves_b.map(e => e.split("x")[1])).size,
        "outward protected square per pawn": new Set(moves_b.map(e => e.split("x")[1])).size/b_pawn_count,
        "pawn over(outward)protection": moves_b.map(e => e.split("x")[1]).length/(new Set(moves_b.map(e => e.split("x")[1])).size),
        "pawn outward packing density": moves_b.map(e => e.split("x")[1]).length / b_pawn_count
        }
    }
    var out_ = {
      color:out,
      both: {
        "pawn outward protected squares": out.w["pawn outward protected squares"]/out.b["pawn outward protected squares"],
        "outward protected square per pawn": out.w["outward protected square per pawn"]/out.b["outward protected square per pawn"],
        "pawn over(outward)protection": out.w["pawn over(outward)protection"]/out.b["pawn over(outward)protection"],
        "pawn outward packing density": out.w["pawn outward packing density"]/out.b["pawn outward packing density"]
       
      }
  }
  return {
       "pawn outward protected squares ratio": out_.both["pawn outward protected squares"],
       "outward protected square per pawn ratio": out_.both["outward protected square per pawn"],
       "pawn over(outward)protection ratio": out_.both["pawn over(outward)protection"],
       "pawn outward packing density ratio": out_.both["pawn outward packing density"],
       "pawn outward protected squares w": out_.color.w["pawn outward protected squares"],
       "outward protected square per pawn w": out_.color.w["outward protected square per pawn"],
       "pawn over(outward)protection w": out_.color.w["pawn over(outward)protection"],
       "pawn outward packing density w": out_.color.w["pawn outward packing density"],
       "pawn outward protected squares b": out_.color.b["pawn outward protected squares"],
       "outward protected square per pawn b": out_.color.b["outward protected square per pawn"],
       "pawn over(outward)protection b": out_.color.b["pawn over(outward)protection"],
       "pawn outward packing density b": out_.color.b["pawn outward packing density"],
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
			"Expansion factor Queen Side":  temp11[0],
			"Expansion factor King Side": temp11[1],
			"Expansion factor Queen Side w": temp10[0],
			"Expansion factor Queen Side b": temp10[1],
			"Expansion factor King Side w": temp10[2],
			"Expansion factor King Side b": temp10[3],
			"Expansion factor": temp11[2],
			"Expansion factor w": temp10[4],
   			"Expansion factor b": temp10[5],
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
   	"Opponement Mobility": moves.length,
		"Opponement Mobility / Pieces": moves.length/(last_move.turn=="b" ? fen_.filter(e => filterPieces("white",e) || e=='K').length : fen_.filter(e => filterPieces("black",e) || e=='k').length),
		"Opponement Mobility / Knights": moves.length/(last_move.turn=="b" ? fen_.filter(e => e=='N').length : fen_.filter(e => e=='n').length),
		"Opponement Mobility / Bishops": moves.length/(last_move.turn=="b" ? fen_.filter(e => e=='B').length : fen_.filter(e => e=='b').length),
		"Opponement Mobility / Rooks": moves.length/(last_move.turn=="b" ? fen_.filter(e => e=='R').length : fen_.filter(e => e=='r').length),
		"Opponement Mobility / Pawns": pawn_moves.length/(last_move.turn=="b" ? piecesWhite.filter(e => e=='P').length : piecesBlack.filter(e => e=='p').length),
		"Opponement Mobility / Queens": non_pawn_moves.filter(e => e.includes('Q')).length/(last_move.turn=="b" ? piecesWhite.filter(e => e=='Q').length : piecesBlack.filter(e => e=='q').length),
		"Opponement Mobility / King": non_pawn_moves.filter(e => e.includes('K')).length/(last_move.turn=="b" ? piecesWhite.filter(e => e=='K').length : piecesBlack.filter(e => e=='k').length),
		"Opponement Mobility / Minor Pieces": non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(last_move.turn=="b" ? piecesWhite.filter(e => e=='B' || e=='N' || e=='R').length : piecesBlack.filter(e => e=='b' || e=='n' || e=='r').length),
		"Opponement Mobility / Major Pieces": non_pawn_moves.filter(e => !e.includes('Q') && !e.includes('K')).length/(last_move.turn=="b" ? piecesWhite.filter(e => e=='Q' || e=='R').length : piecesBlack.filter(e => e=='q' || e=='r').length),

   	}
}

function info_move(last_move){
	return {
			"P": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() == last_move.notation.notation && last_move.notation.fig==null)  ? 1 : 0,
			"p": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() == last_move.notation.notation && last_move.notation.fig==null)  ? 1 : 0,
			"B": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="B")  ? 1 : 0,
			"b": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="B")  ? 1 : 0,
			"N": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="N")  ? 1 : 0,
			"n": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="N")  ? 1 : 0,
			"R": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="R")  ? 1 : 0,
			"r": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="R")  ? 1 : 0,
			"Q": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="Q")  ? 1 : 0,
			"q": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="Q")  ? 1 : 0,
			"K": (last_move.turn=="w" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="K")  ? 1 : 0,
			"k": (last_move.turn=="b" && !last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="K")  ? 1 : 0,
			"Px": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() == last_move.notation.notation && last_move.notation.fig==null)  ? 1 : 0,
			"px": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() == last_move.notation.notation && last_move.notation.fig==null)  ? 1 : 0,
			"Bx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="B")  ? 1 : 0,
			"bx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="B")  ? 1 : 0,
			"Nx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="N")  ? 1 : 0,
			"nx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="N")  ? 1 : 0,
			"Qx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="Q")  ? 1 : 0,
			"qx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="Q")  ? 1 : 0,
			"Rx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="R")  ? 1 : 0,
			"rx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="R")  ? 1 : 0,
			"Kx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="K")  ? 1 : 0,
			"kx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && last_move.notation.fig=="K")  ? 1 : 0,
			"Bx || Nx": (last_move.turn=="w" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && (last_move.notation.fig=="B" || last_move.notation.fig=="N") )  ? 1 : 0,
			"bx || nx": (last_move.turn=="b" && last_move.notation.notation.includes('x') && last_move.notation.notation.toLowerCase() != last_move.notation.notation && (last_move.notation.fig=="B" || last_move.notation.fig=="N") )  ? 1 : 0,
			"0-0 w": (last_move.turn=="w" && last_move.notation.notation=="O-O")  ? 1 : 0,
			"0-0 b": (last_move.turn=="b" && last_move.notation.notation=="O-O")  ? 1 : 0,
			"0-0-0 w": (last_move.turn=="w" && last_move.notation.notation=="O-O-O")  ? 1 : 0,
			"0-0-0 b": (last_move.turn=="b" && last_move.notation.notation=="O-O-O")  ? 1 : 0
	}
}


function getStatisticsForPosition(new_game,last_move) {
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