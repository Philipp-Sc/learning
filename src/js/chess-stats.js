
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 
import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, shuffleArray, sortJsObject, sortArrayKeyValue} from "./utilities.js"
import * as tf_chess from './tensorflow-chess.js'

import * as evaluation from "../js/eval/evaluation.js"
import * as data_prep from "../js/eval/data-prep.js"
  
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


export async function loadChessModel() {

	 await tf_chess.main({
	 	create: false,
	 	load: {default: true, model: 'my-model', normalizeVector_:'normalizeVector'}, 
	 	train: false, 
	 	overrideMinMax: false, 
	 	saveAfterTraining:  {model: 'my-model', normalizeVector_:'normalizeVector'},
	 	importance: false,
	 	test: true,
	 },undefined, undefined)

	window.test_model("1.g3 e5 2.bg3 d5")



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

export async function getFeatureImportance(loadData) {

	var vectors;


	var create = false;
	var load = !create;

	if(loadData){

	var engineGames_1 = await chess_meta.chessGames("engine").then(humanGames => humanGames.get);
	var engineGames_2 = await chess_meta.chessGames("engine_2").then(humanGames => humanGames.get); 
	var humanGames  = await chess_meta.chessGames("human").then(humanGames => humanGames.get);

	shuffleArray(engineGames_1);
	shuffleArray(engineGames_2);
	shuffleArray(humanGames);

	// Do not train all at once, to it in batches.
  var games_FEN = [...engineGames_1.filter((e,i) => i<humanGames.length/2),...engineGames_2.filter((e,i) => i<humanGames.length/2),...humanGames]
  // 50% human games, 25% + 25% engine games,
  shuffleArray(games_FEN);

  // games_FEN = games_FEN.filter((e,i) => i<games_FEN.length/2);
  // use other halfe for testing!

  console.log(games_FEN.length) 
	games_FEN = games_FEN.filter((e,iii) => iii<=1000);

	vectors = gamesToVector(games_FEN)

	var test_vectors = vectors.filter((e,i) => i<vectors.length/2)
	vectors = vectors.filter((e,i) => i>=vectors.length/2)



	/* Create the model or load model
	 */

	 if(create){
		 await tf_chess.main({
		 	create: true,
		 	//load: {default: true, model: 'my-model', normalizeVector_:'normalizeVector'}, 
		 	train: true, 
		 	//updatenormalizeVector: true, 
		 	saveAfterTraining:  {model: 'my-model', normalizeVector_:'normalizeVector'},
		 	importance: true,
		 	test: true,
		 },vectors, undefined, undefined)
	}
	if(load){
	 await tf_chess.main({
	 	create: false,
	 	load: {default: false, model: 'my-model', normalizeVector_:'normalizeVector'}, 
	 	train: true, 
	 	updatenormalizeVector: false, 
	 	saveAfterTraining:  {model: 'my-model', normalizeVector_:'normalizeVector'},
	 	importance: true,
	 	test: true,
	 },vectors, test_vectors, undefined)
	}

	window.test_model("1.g3 e5 2.bg3 d5")


	}else{

	if(load){ // just load model and init test_model function

	 await tf_chess.main({
	 	create: false,
	 	load: {default: false, model: 'my-model', normalizeVector_:'normalizeVector'}, 
	 	train: false, 
	 	updatenormalizeVector: false, 
	 	saveAfterTraining:  {model: 'my-model', normalizeVector_:'normalizeVector'},
	 	importance: false,
	 	test: true,
	 },vectors, undefined, undefined)
	}

	window.test_model("1.g3 e5 2.bg3 d5")


	}

	
  
}

export async function getGameStatistics() {

	var games = await chess_meta.chessGames("engine").then(humanGames => humanGames.get)
	       
  games = games//.filter((e,i) => i==100)    
        .map(game => {return {
        	forBlack: (game.tags.Result=="0-1" || game.tags.Result=="1/2-1/2"),
        	forWhite: (game.tags.Result=="1-0" || game.tags.Result=="1/2-1/2"),
        	vector: getMovesAsFENs(game, evaluation.getStatisticsForPositionVector)}})

  var games_FEN_forWhite = games.filter(e => e.forWhite).map(e => e.vector);
  var games_FEN_forBlack = games.filter(e => e.forBlack).map(e => e.vector);


  const getResult = (games_FEN) => {

  	var result = [];

	  const zero_vector = new Array(games_FEN[0][0].length).fill(0); 

	  for(var i=0;i<180;i++){ 
	      var zero = [...zero_vector]
	      var game_count = 0;
	      for(var ii=0;ii<games_FEN.length;ii++){
	      	game_count = games_FEN[ii].length;
	      	if(games_FEN[ii][i]){
	      		zero = zero.map((e,iii) => e + games_FEN[ii][i][iii]);
	      	}
	      }
	      zero = zero.map(e => (e/game_count).toFixed(2)) 
	      var index=result.length 
	      result.push([index,game_count,...zero]);
	  }

	  var keys = ["index","game count",...evaluation.allKeys];

	  return {data: result, keys: keys};

  }

  console.log(getResult(games_FEN_forWhite))
  console.log(getResult(games_FEN_forBlack))
  
  
 
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
	 				var global_feature_importance = chess_meta.global_test_importance;
	 				//await window.get_feature_importance_with_pgn(chess.pgn())           

					var feature_importance = await window.get_feature_importance_with_pgn(chess.pgn())      


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
/*

          var stats_opp = chess_meta[playerColor=="w" ? "white" : "black"][halfMoves];
          delete stats_opp["index"];  
          delete stats_opp["game count"];  
          delete stats_opp["cp"];
          delete stats_opp["last move by"];  

          Object.values(stats_opp)*/
/*
          for(var i=0;i<evaluation.allKeys.length;i++){
          	my_stats_now[evaluation.allKeys[i]] -=  my_stats_now[evaluation.allKeys[i]];
          }*/ 
          console.log(my_stats_now)
          console.log(combined_importance)
 
          var notification = [];
          for(var i=0;i<combined_importance.length;i++){ 
          	var msg = "("+(combined_importance[i][1].toFixed(2))+", "+(combined_importance[i][2].toFixed(2))+") "+combined_importance[i][0]+" "+my_stats_now[combined_importance[i][0]];
          	notification.push(msg)
          }
          // order and color by importance later



//          var notification = getDistanceVectorForStatistics({'playerStats':my_stats_now,'stats': stats_opp})

/*
          .filter(e => e.includes(playerColor=="w" ? "{white}" : "{black}")).map(e => e.replace(playerColor=="w" ? "{white}" : "{black}",""));
*/          
/*
          notification = notification.map(e => {
            if(e.includes("{fig}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{fig}")).map(e => e.replace("{fig}","")).join("\n")
            }
            if(e.includes("{capture}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{capture}")).map(e => e.replace("{capture}","")).join("\n")
            }
            if(e.includes("{castle}")){
              return "Probabilities were: \n"+notification.filter(e => e.includes("{castle}")).map(e => e.replace("{castle}","")).join("\n")
            }
            return e.replace("(excl.","\n(excl.")
          })
*/

          var prediction = await window.test_model(chess.pgn())
          return ["Chess Model Predicted: "+prediction.prediction_value,...Array.from(new Set(notification))]; 
 
        }else{
          return [];
        }
}