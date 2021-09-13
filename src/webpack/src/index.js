// cd src/webpack; npx webpack; cp dist/main.js ../../public/chess-to-vector-worker/main.js;

import * as evaluation from './evaluation.js'

const Chess = require("chess.js"); 

var new_game = new Chess();

var game_data;

onmessage = function(message) {
  const {data} = message;
  if (data.method && data.params) {  
  	// map data.params to game_data
  	var res;
  	if(data.method=="receive_game_data"){
  		res = receive_game_data(...data.params)
  	}
  	if(data.method=="getStatisticsForPositionVector"){ 
  		res = evaluation[data.method](...getPGN_and_LastMove(...data.params));
  	}
    postMessage({"value":res});
  } else { 
    console.log('Chess-To-Vector-Worker: Invalid message'); 
  }
}


function receive_game_data(data) {
	game_data = data;
	console.log("...data ("+game_data.length+") loaded on this web worker")
	return 1;
}

function getPGN_and_LastMove(game_index,index){   
	new_game.reset(); 
	for (var i = 0; i < game_data[game_index].moves.length; i++) {
		new_game.move(game_data[game_index].moves[i].notation.notation);
		if(i==index){
			return [new_game,game_data[game_index].moves[i]]
		} 
	}
	return undefined;
}