// put model code into new js file.
// chess-model.js
// the code makes sure it is loaded on its own

 
import * as chess_meta from "../js/chess-meta.js" 
import {sum_array, average, median, shuffleArray, sortArrayKeyValue} from "./utilities.js"

import * as importance_chess from './importance-chess.js'
 
import * as data_prep from "../js/eval/data-prep.js"


import * as chess_model from "../js/chess-model.js" 

const Chess = require("chess.js"); 
 
 
var debug = false;

export function get_all_keys_for_features() {
	return window.rust.then(my_wasm_bindgen => {return ("cp\n"+my_wasm_bindgen.get_keys()).split("\n");});
}


async function get_features_with_keys_as_dict(history) {
	var keys = await get_all_keys_for_features();
	var feature_vector =window.rust.get_features(JSON.stringify(history));
	var dict = {};
	for(var i=0;i<keys.length;i++){
		dict[keys[i]] = feature_vector[i];
	}
	return dict;
}


/* Returns a promise, which we need to resolve with await before we send another request.*/
function sendToChessToVectorWorker(worker,game_index){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"get_features",params: [game_index]}); 
		  worker.onmessage = (message) => {   
		        res(message.data.value)     
		  }
		});
	return promise;
}
 
function sendWasmToChessWorker(worker){
	var promise = window.rust_wasm.then(blob => blob.arrayBuffer()).then(buffer => {

		return new Promise((res, rej) => {
  
		  worker.postMessage({method:"receive_wasm",param: buffer},[buffer]);

		  worker.onmessage = (message) => {  
		        res(message.data.value)     
		  }
		});
	});
	return promise;
}

function sendGameDataToChessWorker(worker,game_data){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"receive_game_data",params: [game_data]});

		  worker.onmessage = (message) => {  
		        res(message.data.value)     
		  }
		});
	return promise;
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


async function gamesToVector(games_FEN) {

  var batchSize = 8;

  var myWorkers = new Array(batchSize);
  for(var i=0;i<myWorkers.length;i++){ 
  	myWorkers[i] = new Worker("chess_to_feature_vector/main.js");
  } 

	var toLength = games_FEN.length - (games_FEN.length % batchSize)
	var frame = toLength/batchSize
  
 	for(var i=0;i<myWorkers.length;i++){
 		var batchData = games_FEN.filter((e,ii) => ii>=i*frame && ii<(i+1)*frame);
 		await sendWasmToChessWorker(myWorkers[i]);
		await sendGameDataToChessWorker(myWorkers[i],batchData); 
 	}

	const getResults = (game_index,i) => {
		return sendToChessToVectorWorker(myWorkers[i],game_index);
	} 
  const task = (game_index,i) => {return () => getResults(game_index,i)};
 
	if(debug) console.log("Games: "+toLength);
	if(debug) console.log("Batches: "+frame)
  
	var myBatchTasks = [];
 
	for(var i=0; i<myWorkers.length;i++){
		var myTasks = [];
		for(var x=0;x<frame-1;x++){
		  //var value = await getResults(x,batch[i][x],i); 
		  //var promise = getResults(x,batch[i][x],i); // (gets called immidiatly)
		  myTasks.push(task(x,i)) 
		}
		myBatchTasks.push(myTasks);
	}

	const syncDoTask = async(tasks) => {  // evaluate task sequentially
		var result = [];
		for(var i = 0; i<tasks.length;i++){
			var res = await tasks[i]();
			result.push(res);
			console.log("...")
		}
		return result;
	}
 
 	// evaluate all batches in parallel
	var myPromises = await Promise.all(myBatchTasks.map(tasks => syncDoTask(tasks)));
 

	myWorkers.forEach(e => e.terminate());


	window.allKeys = await get_all_keys_for_features();
	if(debug) console.log("window.allKeys")

	var vectors = [].concat.apply([],[].concat.apply([], myPromises))
		.map(e => {
			var target = e[window.allKeys.indexOf("cp")];  
			e.splice(window.allKeys.indexOf("cp"), 1);
			return {"data": e, "label":target}
	})


	//if(debug) console.log(vectors)

	//if(debug) console.log(vectors)

	vectors = data_prep.sample_with_bins([-2,2],10,vectors);
	return vectors;
}

export async function load_data() {
	
	var engineGames_1 = await chess_meta.chessGames("engine").then(humanGames => humanGames.get);
	var engineGames_2 = await chess_meta.chessGames("engine_2").then(humanGames => humanGames.get); 
	var humanGames  = await chess_meta.chessGames("human").then(humanGames => humanGames.get);

	// allows me to train with a % of different data each time.
	//shuffleArray(engineGames_1);
	//shuffleArray(engineGames_2);
	//shuffleArray(humanGames);

  //var games_FEN = [...engineGames_1.filter((e,i) => i<humanGames.length/2),...engineGames_2.filter((e,i) => i<humanGames.length/2),...humanGames]

  var games_FEN = [...engineGames_1,...engineGames_2,...humanGames]

  shuffleArray(games_FEN);

  if(debug) console.log("Number of games: "+games_FEN.length)  

	var vectors = await gamesToVector(games_FEN.filter((e,i) => i<=(32*200)-1))

  if(debug) console.log("Number of positions: "+vectors.length)  

  return vectors;
}

export async function calculate_average_position_vector_list(pgn_database_name) {

	var games = await load_data();
	       
  games = games  
        .map((game,i) => {return {
        	forBlack: (game.tags.Result=="0-1" || game.tags.Result=="1/2-1/2"),
        	forWhite: (game.tags.Result=="1-0" || game.tags.Result=="1/2-1/2"),
        	vector: game}})

  var games_FEN_forWhite = gamesToVector(games.filter(e => e.forWhite).map(e => e.vector));
  var games_FEN_forBlack = gamesToVector(games.filter(e => e.forBlack).map(e => e.vector));


  const getResult = (games_FEN) => {

	  var vectors_for_move = [];

	  for(var i = 0; i<games_FEN.length;i++){ 
	  	for(var ii = 0; ii<games_FEN[i].length;ii++){ // game // move
	  		 var move_vector = games_FEN[i][ii]; // vector
	  		 var move_vector_list = vectors_for_move[ii] || [];
	  		 move_vector_list.push(move_vector);
	  		 vectors_for_move[ii] = move_vector_list;
	  	}
	  }
	  for(var i = 0; i<vectors_for_move.length;i++){
	  	var length = vectors_for_move[i].length; 
	  	var amalgamation = vectors_for_move[i].reduce(sum_array);
	  	amalgamation = amalgamation.map(e => e/length)
	  	vectors_for_move[i] = [i,length,...amalgamation];
	  }

	  var keys = ["index","game count",...window.allKeys];

	  return {data: vectors_for_move, keys: keys};

  }

  if(debug) console.log(JSON.stringify(getResult(games_FEN_forWhite)))
  if(debug) console.log(JSON.stringify(getResult(games_FEN_forBlack)))
  
  
 
  // var results = {}
  // for(var i=0;i<data.length;i++){
  // results[keys[i]] = data[i];	 
	//} 
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

function getValueByKey(key_value_array,key) { 
	return key_value_array.filter(e => e[0]==key)[0][1];
}

// add update function and value here
export async function getNotification(chess, playerColor, halfMoves, notificationList, setNotificationList){

	if(halfMoves>=0){ 

		var last_move = chess.history({verbose:true}).reverse()[0]
		if(!last_move){
			return [];
		}

		var pgn = chess.pgn();

		notificationList = await neuralNetworkPredictNotification(pgn,last_move.san,notificationList,setNotificationList);

		var allKeys = (await get_all_keys_for_features()).filter(e => e!="cp"); // e!="last move by"
		var my_stats_now = get_features_with_keys_as_dict(chess.history({verbose: true})); 

		var global_feature_importance = JSON.parse(window.localStorage.getItem('my-model'+"://importance"));   

        var stats_hero = chess_meta[playerColor=="w" ? "white" : "black"][halfMoves]; 
        var stats_human = chess_meta[playerColor=="w" ? "white_human" : "black_human"][halfMoves]; 

		const callback = (feature_importance_value,index) => {

			var key = allKeys[index]; 

			var global_feature_importance_value = getValueByKey(global_feature_importance,key);

			var combined_importance_value = [ 
				allKeys.length*((global_feature_importance_value+feature_importance_value)/2),
				allKeys.length*global_feature_importance_value,
				allKeys.length*feature_importance_value
				];

			var difference = ((combined_importance_value[0]-combined_importance_value[1]).toFixed(2))
				var positive = difference > 0 ? "+" : (difference < 0 ? "-" : "")

			var msg;
				var value;
	      	if(key.includes("Pawn Structure") && !key.includes("Count")){
	      		value = my_stats_now[key]+"\n";
	      		msg = key+" \n"+value+" \|\|           "+positive+"\n"+"    ("+(stats_human[key].toFixed(2))+", "+(stats_hero[key].toFixed(2))+")";
	      
	      	}else{
	      		value = my_stats_now[key].toFixed(2);
	      		msg = key+" \|\|           "+positive+"\n"+value+"    ("+(stats_human[key].toFixed(2))+", "+(stats_hero[key].toFixed(2))+")";
	      
	      	}

	      	notificationList.push([msg,combined_importance_value[2]])
	      	setNotificationList([...sortArrayKeyValue(notificationList)])

		}

	importance_chess.get_feature_importance_with_pgn('my-model',pgn,callback) 
    } 
}

async function neuralNetworkPredictNotification(pgn,last_move_san,notificationList,setNotificationList) {
	 
		var prediction = await chess_model.test_model_with_pgn(pgn)
		// predict each possible move, order them, get index of played move.
		var prediction_cp = (parseFloat(prediction.prediction_value).toFixed(2)); 
		var my_test_game = new Chess();
		my_test_game.load_pgn(pgn);


		var predictions = [];

		my_test_game.undo();
		var alternatives = my_test_game.moves({verbose:true}); 

		for(var i=0;i<alternatives.length;i++){
			my_test_game.load_pgn(pgn);
			my_test_game.undo();
			my_test_game.move(alternatives[i]);  
			predictions.push(await chess_model.test_model_with_pgn(my_test_game.pgn()));
		} 
		predictions = await Promise.all(predictions); 

		predictions = predictions
			.map((e,i) => [alternatives[i].san,e.prediction[0]]) 

		predictions = sortArrayKeyValue(predictions).map((e,i) => [e[0],i]);


		var index_of_played_move = 1+getValueByKey(predictions,last_move_san)

		notificationList = [["NN evaluation of "+last_move_san+": "+prediction_cp+" ("+index_of_played_move+"/"+alternatives.length+") \nInput Neurons:",Infinity]]

		setNotificationList(notificationList);
		return notificationList;

}