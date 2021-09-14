 
import * as chess_meta from "../js/chess-meta.js" 
import {sum_array, average, median, shuffleArray, sortArrayKeyValue} from "./utilities.js"
import * as tf_chess from './tensorflow-chess.js'

import * as importance_chess from './importance-chess.js'

import * as evaluation from "../webpack-eval-package/src/evaluation.js"
import * as data_prep from "../js/eval/data-prep.js"


import {skeleton_to_ascii} from "../webpack-eval-package/src/pawn-structure.js"
   

const Chess = require("chess.js"); 

const default_model = require('./json/default_model.json')
 
var debug = false;


/* Returns a promise, which we need to resolve with await before we send another request.*/
function sendToChessToVectorWorker(worker,game_index){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"getStatisticsForPositionVector",params: [game_index]}); 
		  worker.onmessage = (message) => {   
		        res(message.data.value)     
		  }
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

function getMovesAsFENs(game_index,game, process){ 
	return sampleMovesAsFENs(game_index,game,process,0,0,512,-10,10,0);
}
 
async function sampleMovesAsFENs(game_index,game, process,skipProbability, start, end, minCP, maxCP,cpZeroProbability){  
	if(debug) console.log("...")     
	var res = [];
	for (var i = 0; i < game.moves.length; i++) {
		if(game.moves[i] && game.moves[i].notation && game.moves[i].notation.notation){
			if(i>=start && i<=end && evaluation.getCP(game.moves[i])>=minCP && evaluation.getCP(game.moves[i])<=maxCP && Math.random()>skipProbability){
				if(evaluation.getCP(game.moves[i])==0){
					if(Math.random()>cpZeroProbability){ 
						res.push(await process(game_index,i))
					}
				}else{
						res.push(await process(game_index,i))
				}
			}
		}
	}   
	return Promise.resolve(res);
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

	var batchSize = 32;

  var myWorkers = new Array(batchSize);
  for(var i=0;i<myWorkers.length;i++){
  	myWorkers[i] = new Worker("chess-to-vector-worker/main.js");
  } 

	var toLength = games_FEN.length - (games_FEN.length % batchSize)
	var frame = toLength/batchSize
  
 	for(var i=0;i<myWorkers.length;i++){
 		var batchData = games_FEN.filter((e,ii) => ii>=i*frame && ii<(i+1)*frame);
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
			if(debug) console.log("...")
		}
		return result;
	}
 
 	// evaluate all batches in parallel
	var myPromises = await Promise.all(myBatchTasks.map(tasks => syncDoTask(tasks)));
 

	myWorkers.forEach(e => e.terminate());

	var vectors = [].concat.apply([],[].concat.apply([], myPromises))
		.map(e => {
			var target = e[evaluation.allKeys.indexOf("cp")];  
			e.splice(evaluation.allKeys.indexOf("cp"), 1);
			return {"data": e, "label":target}
	})


	//if(debug) console.log(vectors)
	window.allKeys =evaluation.allKeys;
	if(debug) console.log("window.allKeys")

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

export async function build_my_model(output) {

	var vectors = await load_data();

   
	await tf_chess.main({
		 	create: {model_name: 'my-model'}, 
		 	train: {initial: true},    
		 },vectors, undefined)	 

	if(output){
		window.default_model = JSON.stringify(Object.entries(localStorage).filter(e => e[0].includes("tensorflow") || e[0].includes("normalizeVector")))
		if(debug) console.log("saved to window.default_model");
	} 

	if(debug) console.log(await test_model())

}

export async function test_model(){

	var games = ["1.g3 e5 2.bg3 d5",
							 "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. a3 {giuoco piano} *"]

	var results = [];
	for(var i=0;i<games.length;i++){
		var result = await tf_chess.test_model_with_pgn('my-model',games[i]);
		results.push(result);
	}

	return results
}


export async function load_my_model(args) {

	 if(args.isProduction){
	  	await tf_chess.import_model('my-model',default_model)
	 }
  
	 await tf_chess.main({ 
	 	load: {model_name: 'my-model'},    
	 },undefined) 
 
}

export function export_my_model() {
	return tf_chess.export_model('my-model');
}

export async function train_my_model() {
 
	var vectors= await load_data();

	var test_vectors = vectors.filter((e,i) => i<vectors.length/2)
	vectors = vectors.filter((e,i) => i>=vectors.length/2)

 
	 await tf_chess.main({ 
	 	load: {model_name: 'my-model'}, 
	 	train: {initial: false},    
	 },vectors) 

	
	if(debug) console.log(await test_model())

	importance_chess.main('my-model',vectors,test_vectors)
  
}

export async function calculate_average_position_vector_list(pgn_database_name) {

	var games = await chess_meta.chessGames(pgn_database_name).then(humanGames => humanGames.get)
	       
  games = games//.filter((e,i) => i<3)    
        .map((game,i) => {return {
        	forBlack: (game.tags.Result=="0-1" || game.tags.Result=="1/2-1/2"),
        	forWhite: (game.tags.Result=="1-0" || game.tags.Result=="1/2-1/2"),
        	vector: getMovesAsFENs(i,game, evaluation.getStatisticsForPositionVector)}})

  var games_FEN_forWhite = games.filter(e => e.forWhite).map(e => e.vector);
  var games_FEN_forBlack = games.filter(e => e.forBlack).map(e => e.vector);


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

	  var keys = ["index","game count",...evaluation.allKeys];

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

export async function getNotification(chess, playerColor, halfMoves){

	 if(halfMoves>=0){ 
	 				// get global importance for (any) position
	 				//

	 				// get importance in this position
	 				var global_feature_importance = JSON.parse(window.localStorage.getItem('my-model'+"://importance"));   

					var feature_importance = await importance_chess.get_feature_importance_with_pgn('my-model',chess.pgn())      


	 				function getValueByKey(key_value_array,key) {
	 					return key_value_array.filter(e => e[0]==key)[0][1];
	 				}

	 				var allKeys = evaluation.allKeys.filter(e => e!="last move by" && e!="cp");


	 				var combined_importance = allKeys
	 					.map(e => [e,allKeys.length*((getValueByKey(global_feature_importance,e)+getValueByKey(feature_importance,e))/2),allKeys.length*getValueByKey(global_feature_importance,e)])
	 				//	.filter(e => e[1]>=0.0001)

          combined_importance = sortArrayKeyValue(combined_importance); 


	 				// then add rank difference
	 				// dropdown:
	 				// - to show what features are normaly more important, but in this position are not.

          var my_stats_now = evaluation.getStatisticsForPositionDict(chess,chess.history({verbose:true}).reverse()[0]); 
          // filter my_stats_now by feature importance

          var stats_hero = chess_meta[playerColor=="w" ? "white" : "black"][halfMoves]; 
          var stats_human = chess_meta[playerColor=="w" ? "white_human" : "black_human"][halfMoves]; 

 
          var notification = [];
          for(var i=0;i<combined_importance.length;i++){ 
          	var difference = ((combined_importance[i][1]-combined_importance[i][2]).toFixed(2))
          	var positive = difference > 0 ? "+" : (difference < 0 ? "-" : "")
          	//+(combined_importance[i][1].toFixed(2))+" ("+positive+difference+") \n"

          	var msg;
          	var value;
          	if(combined_importance[i][0].includes("Pawn Structure") && !combined_importance[i][0].includes("Count")){
          		value = skeleton_to_ascii(my_stats_now[combined_importance[i][0]])+"\n";
          		msg = combined_importance[i][0]+" \n"+value+" \|\|           "+positive+"\n"+"    ("+(stats_human[combined_importance[i][0]].toFixed(2))+", "+(stats_hero[combined_importance[i][0]].toFixed(2))+")";
          
          	}else{
          		value = my_stats_now[combined_importance[i][0]].toFixed(2);
          		msg = combined_importance[i][0]+" \|\|           "+positive+"\n"+value+"    ("+(stats_human[combined_importance[i][0]].toFixed(2))+", "+(stats_hero[combined_importance[i][0]].toFixed(2))+")";
          
          	}

          		notification.push(msg)
          }
 
          // order and color by importance later

 

          var prediction = await tf_chess.test_model_with_pgn('my-model',chess.pgn())
          // predict each possible move, order them, get index of played move.
          var prediction_cp = (parseFloat(prediction.prediction_value).toFixed(2)); 
          var my_test_game = new Chess();
					my_test_game.load_pgn(chess.pgn());


					var predictions = [];

					my_test_game.undo();
					var alternatives = my_test_game.moves({verbose:true}); 

					for(var i=0;i<alternatives.length;i++){
						my_test_game.load_pgn(chess.pgn());
						my_test_game.undo();
						my_test_game.move(alternatives[i]);  
						predictions.push(await tf_chess.test_model_with_pgn('my-model',my_test_game.pgn()));
					} 
					predictions = await Promise.all(predictions); 

					predictions = predictions
						.map((e,i) => [alternatives[i].san,e.prediction[0]]) 

					predictions = sortArrayKeyValue(predictions).map((e,i) => [e[0],i]);
 

					var index_of_played_move = 1+getValueByKey(predictions,chess.history({verbose:true}).reverse()[0].san)


          return ["NN evaluation of "+chess.history().reverse()[0]+": "+prediction_cp+" ("+index_of_played_move+"/"+alternatives.length+") \nInput Neurons:",...Array.from(new Set(notification))]; 
 
        }else{
          return [];
        }
}