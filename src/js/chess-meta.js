
import parser from '@mliebelt/pgn-parser'
const Chess = require("chess.js");

var types = {engine: "EngineGames.pgn", human: "HumanGames2200+.pgn"}

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
        .filter(e => e.tags.WhiteELO >=elo && e.tags.WhiteELO <=elo+100)
        .filter(e => e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2")
    }else{
        games = games
        .filter(e => e.tags.BlackELO >=elo && e.tags.BlackELO <=elo+100)
        .filter(e => e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2")
    }
    for(var i=0;i<history.length;i++){
        games = games.filter(e => e.moves[i].notation.notation==history[i]);
    }
    console.log(games)
    if(games.length>0){ 
        var randomGame = games[Math.floor(Math.random()*games.length)];
        console.log(randomGame.moves[history.length].notation.notation);

        var commentAfter = (randomGame.moves[history.length].commentAfter || "[%depth20 0] [%depth1 0]" ).replace(/[\[\]\%]/g,"").split("depth").filter(e => e.length >0).map(e => { return {"depth": e.split(" ")[0], "eval": e.split(" ")[1]} });
        var engine_meter = {evaluation: (playerColor=='w' ? (-1) : 1)*parseFloat(commentAfter.filter( e => e.depth==depth_for_database)[0].eval), depth: parseInt(commentAfter.filter( e => e.depth==depth_for_database)[0].depth)};
        
        return {move:randomGame.moves[history.length].notation.notation, engine_meter: engine_meter} 
    }
    return {move: undefined, engine_meter:undefined}
}
 

