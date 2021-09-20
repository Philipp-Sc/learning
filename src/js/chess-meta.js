
import {average,median} from "./utilities.js"


import {parser} from '@mliebelt/pgn-parser' 


const game_statistics = require('./json/game_statistics.json')
const global_importance = require('./json/global_importance.json')
export const skill_profiles = require('./json/skill_profiles.json')

var types = {engine: "EngineGames.pgn", human: "HumanGames2200+.pgn", engine_2: "2021-08.commented.[8145].pgn"}

function toDict(data_and_keys){
	var dict = []
	for(var i=0;i<data_and_keys.data.length;i++){
		var data_in_dict = {}
		data_and_keys.data[i].forEach((e,ii) => {
			data_in_dict[data_and_keys.keys[ii]] = e;
		})
		dict.push(data_in_dict);
	}
	return dict;
}

export const white = toDict(game_statistics.engine.white);
export const black = toDict(game_statistics.engine.black);
 
// 

export const white_human = toDict(game_statistics.human.white)
export const black_human = toDict(game_statistics.human.black)


export const pieceLookup = {
    "Q": ["Major Pieces","Queen", "Q"],
    "B": ["Minor Pieces","Bishops", "B"],
    "N": ["Minor Pieces","Knights", "K"],
    "R": ["Major Pieces","Rooks", "R"],
    "P": ["Pawns", "P"],
    "K": ["King", "K"]
}

export const global_train_importance = global_importance.global_train_importance;
export const global_test_importance = global_importance.global_test_importance;

// To avoid parsing errors
// match 
// 1. ... 
// 2. ...
// 3. ...
// with regex ([0-9]+\. \.\.\.) and remove

export async function chessGames(type) {  
   try {
        const response = await fetch('/games/'+types[type]);
        const text = await response.text();   
        var pgn = parser.parse(text, {startRule: "games"})
        return {res: true, get: pgn}; 
    } catch (error) {
        console.log("WARNING: Failed to fetch "+type+" games. Check your internet connection.")
        console.error(error);
        return {res:false};
    }  
};

export async function getMoveFromHumans(chess,elo,playerColor,depth_for_database){
    // filter all games by history
    // randomly select a game and play that move
    // games with the same elo as skill level have a higher chance of being picked 
    var humanGames = await chessGames("human");
    if(humanGames.res==false){
        return;
    }
    var games = humanGames.get;
    var history = chess.history();  
    games = games.filter(e => e.moves[history.length]!=undefined && e.moves[history.length].turn==chess.turn());

    if(chess.turn()=="w"){
        games = games
        .filter(e => e.tags.WhiteElo >=elo && e.tags.WhiteElo <=elo+100)
        .filter(e => e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2")
    }else{
        games = games
        .filter(e => e.tags.BlackElo >=elo && e.tags.BlackElo <=elo+100)
        .filter(e => e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2")
    }
    for(var i=0;i<history.length;i++){
        games = games.filter(e => e.moves[i].notation.notation==history[i]);
    }
    // console.log(games)
    if(games.length>0){ 
        var randomGame = games[Math.floor(Math.random()*games.length)];
        //console.log(randomGame.moves[history.length].notation.notation);

        var commentAfter = (randomGame.moves[history.length].commentAfter || "[%depth20 0] [%depth1 0]" ).replace(/[\[\]\%]/g,"").split("depth").filter(e => e.length >0).map(e => { return {"depth": e.split(" ")[0], "eval": e.split(" ")[1]} });
        var engine_meter = {evaluation: (playerColor=='w' ? (-1) : 1)*parseFloat(commentAfter.filter( e => e.depth==depth_for_database)[0].eval), depth: parseInt(commentAfter.filter( e => e.depth==depth_for_database)[0].depth)};
        
        return {move:randomGame.moves[history.length].notation.notation, engine_meter: engine_meter} 
    }
    return {move: undefined, engine_meter:undefined}
}
 

export async function save_game (player_game_data,stockfishOutHistory,chess,playerColor,playerElo,eloSetting,depthSetting,resign=false) {
      chess.header('White', playerColor=='w' ? 'Player' : 'Engine', 'Black', playerColor=='b' ? 'Player' : 'Engine');
      chess.header('PlayerElo', ""+playerElo);
      chess.header('Elo', ""+eloSetting);
      chess.header('Depth', ""+depthSetting);
      if((chess.in_checkmate() && chess.turn()==playerColor) || resign){
        chess.header('Result', playerColor=='w' ? "0-1" : "1-0")
      }else if(chess.in_draw()){
        chess.header('Result', "1/2-1/2") 
      }else{
        chess.header('Result', playerColor=='w' ? "1-0" : "0-1")
      }
      var chess_pgn = chess.pgn();

      player_game_data.pgn_db.push(chess_pgn); 
      player_game_data.pgn_analysis.push(stockfishOutHistory); 
 
      //console.log((player_pgn_db.map((e,i) => hydrate_game(e,player_pgn_analysis[i]))));
      window.localStorage.setItem("player_game_data",JSON.stringify({"pgn_db": player_game_data.pgn_db, "pgn_analysis": player_game_data.pgn_analysis}));
  }

const hydrate_game = (pgn,analysis) => { 
var game = parser.parse(pgn, {startRule: "game"});  
  for(var i=0;i<game.moves.length;i++){
    if(analysis[i]!=undefined && !(typeof game.moves[i]=== 'string')){
      if(analysis.filter(e => e!=null && e.move!=null && e.move-1==i).length==1){ 
        game.moves[i].commentAfter = JSON.stringify({evaluation: ((analysis.filter(e =>  e!=null && e.move!=null && e.move-1==i)[0].cp/100)), depth: analysis.filter(e =>  e!=null && e.move!=null && e.move-1==i)[0].depth});
      }
    } 
  }
return game;

};

export const historicPerformanceAtMoveNumber = (halfMoves,player_game_data) => {
    var games = player_game_data.pgn_db.map((e,i) => hydrate_game(e,player_game_data.pgn_analysis[i]))
    var aggMovePerformance : { average_eval: number, median_eval:number} = { average_eval: NaN,median_eval: NaN};

    var historyPerfromanceAtMoveNumber = games.map(game => game.moves.map(i =>i.commentAfter).filter(m => m!=null).map(m => JSON.parse(m).evaluation))
                      .filter(game => game[halfMoves]).map(game => game[halfMoves])

    aggMovePerformance.average_eval = average(historyPerfromanceAtMoveNumber);
    aggMovePerformance.median_eval = median(historyPerfromanceAtMoveNumber);

    // returns NaN when no data available for move
    return aggMovePerformance;
  }

