// cd src/webpack; npx webpack; cp dist/main.js ../../public/chess-to-vector-worker/main.js;
 
importScripts('./rust/eval-wasm/pkg/eval_wasm.js'); 
importScripts('./chess.min.js'); 
  
 
var new_game = new Chess(); 

var game_data;

var skipProbability = 0.66;
var start = 5;
var end = 60*2;
var minCP = -1.5;
var maxCP = 1.5;
var cpZeroProbability = 0.33;
 
 
onmessage = function(message) {
				  const {data} = message;
				  if (data.method) {  
				  	// map data.params to game_data
				  	var res;
				  	if(data.method=="receive_wasm"){
				  		wasm_bindgen(data.param).then(() => { 
				    		postMessage({"value":1});
				  		});
				  	}
				  	if(data.method=="receive_game_data"){  
			  			res = receive_game_data(...data.params);
			    		postMessage({"value":res}); 
				  		
				  	}/*
				  	if(data.method=="getStatisticsForPositionVector"){ 
				  		res = evaluation[data.method](...getPGN_and_LastMove(...data.params));
				  	}*/
				  	if(data.method=="get_all_keys"){ 
				  		res = wasm_bindgen.get_keys().split("\n");
				  		postMessage({"value":res});
				  	}
				  	if(data.method=="get_features"){ 
				  		res = getPGN(...data.params).map(e => { 
				  			return  {"data": wasm_bindgen.get_features(JSON.stringify(e.history)), "label":e.label};
				  		});
				  		postMessage({"value":res});
				  	}
				  	if(data.method=="get_features_directly"){ 
				  		res = data.params.map(e => {  
				  			return wasm_bindgen.get_features(JSON.stringify(e));
				  		});
				  		postMessage({"value":res});
				  	}

				  } else { 
				    console.log('chess_to_feature_vector: Invalid message'); 
				  }
				} 
 

function receive_game_data(data) {
	game_data = data;
	console.log("received game data: "+game_data.length+" games loaded")
	return 1;
} 

function getPGN(game_index){   
	new_game.reset(); 
	var res = []
	for (var i = 0; i < game_data[game_index].moves.length; i++) {
		if(game_data[game_index].moves[i] && game_data[game_index].moves[i].notation && game_data[game_index].moves[i].notation.notation){
			new_game.move(game_data[game_index].moves[i].notation.notation);
			if(i>=start && i<=end && getCP(game_data[game_index].moves[i])>=minCP && getCP(game_data[game_index].moves[i])<=maxCP && Math.random()>skipProbability){
				if(getCP(game_data[game_index].moves[i])==0){
					if(Math.random()>cpZeroProbability && !new_game.game_over()){ 
						res.push({"history":new_game.history({verbose: true}), "label": getCP(game_data[game_index].moves[i])})
					}
				}else if (!new_game.game_over()){
						res.push({"history":new_game.history({verbose: true}), "label": getCP(game_data[game_index].moves[i])})
				}
				}
			}
 	}
	return res;
}

function getCP(move) {
    if(move.commentAfter){
        var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
        var cp = parseFloat(temp);
        return isNaN(cp) ? -1 : cp; 
    }else{
        if(move.commentDiag){
            if(move.commentDiag.depth20){
                return parseFloat(move.commentDiag.depth20);
            }
            if(move.commentDiag.depth1){
                return parseFloat(move.commentDiag.depth1);
            }
            return undefined;
        }
        return 0;
    }
}

 