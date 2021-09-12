
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 
import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {sum_array, average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, shuffleArray, sortJsObject, sortArrayKeyValue} from "./utilities.js"
import * as tf_chess from './tensorflow-chess.js'

import * as importance_chess from './importance-chess.js'

import * as evaluation from "../js/eval/evaluation.js"
import * as data_prep from "../js/eval/data-prep.js"


import {skeleton_to_ascii} from "../js/eval/pawn-structure.js"
  
const importance = require('importance')

const Chess = require("chess.js"); 

var newGame = new Chess();



function getMovesAsFENs(game, process){ 
	return sampleMovesAsFENs(game,process,0,0,512,-10,10,0);
}

function sampleMovesAsFENs(game, process,skipProbability, start, end, minCP, maxCP,cpZeroProbability){ 
	console.log("...")
	newGame.reset();
	var fens : string[] = [];
	for (var i = 0; i < game.moves.length; i++) {
		if(game.moves[i] && game.moves[i].notation && game.moves[i].notation.notation){
			newGame.move(game.moves[i].notation.notation);
			if(i>=start && i<=end && evaluation.getCP(game.moves[i])>=minCP && evaluation.getCP(game.moves[i])<=maxCP && Math.random()>skipProbability){
				if(evaluation.getCP(game.moves[i])==0){
					if(Math.random()>cpZeroProbability){
						fens.push(process(newGame,game.moves[i]));
					}
				}else{
					fens.push(process(newGame,game.moves[i]));

				}
			}
		}
	}
	return fens;
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


function gamesToVector(games_FEN) {

	const getResults = (n) => {return sampleMovesAsFENs(n, evaluation.getStatisticsForPositionVector,0.66,5,60*2,-1.5,1.5,0.33)}
	for(var x=0;x<games_FEN.length;x++){
		games_FEN[x] = getResults(games_FEN[x]);
	} 
 
	var vectors = [].concat.apply([], games_FEN)
		.map(e => {
			var target = e[evaluation.allKeys.indexOf("cp")];  
			e.splice(evaluation.allKeys.indexOf("cp"), 1);
			return {"data": e, "label":target}
	})

	console.log(evaluation.allKeys);

	//console.log(vectors)

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

  console.log("Number of games: "+games_FEN.length)  

	var vectors = gamesToVector(games_FEN)//.filter((e,i) => i<3)

  console.log("Number of positions: "+vectors.length)  

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
		console.log("saved to window.default_model");
	} 

	console.log(await test_model())

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


export async function load_my_model() {
  
	 await tf_chess.main({ 
	 	load: {model_name: 'my-model'},    
	 },undefined) 
 
}

export async function train_my_model() {
 
	var vectors= await load_data();

	var test_vectors = vectors.filter((e,i) => i<vectors.length/2)
	vectors = vectors.filter((e,i) => i>=vectors.length/2)

 
	 await tf_chess.main({ 
	 	load: {model_name: 'my-model'}, 
	 	train: {initial: false},    
	 },vectors) 

	
	console.log(await test_model())

	importance_chess.main('my-model',vectors,test_vectors)
  
}

export async function calculate_average_position_vector_list(pgn_database_name) {

	var games = await chess_meta.chessGames(pgn_database_name).then(humanGames => humanGames.get)
	       
  games = games//.filter((e,i) => i<3)    
        .map(game => {return {
        	forBlack: (game.tags.Result=="0-1" || game.tags.Result=="1/2-1/2"),
        	forWhite: (game.tags.Result=="1-0" || game.tags.Result=="1/2-1/2"),
        	vector: getMovesAsFENs(game, evaluation.getStatisticsForPositionVector)}})

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

  console.log(JSON.stringify(getResult(games_FEN_forWhite)))
  console.log(JSON.stringify(getResult(games_FEN_forBlack)))
  
  
 
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
          		value = my_stats_now[combined_importance[i][0]];
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