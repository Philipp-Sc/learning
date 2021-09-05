
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 
import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, sortJsObject} from "./utilities.js"
import * as tf_chess from './tensorflow-chess.js'

import * as evaluation from "../js/eval/evaluation.js"
  
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


export async function getFeatureImportance(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(async(games) => {

					//var humanGames = await chess_meta.chessGames("human").then(humanGames => humanGames.get);
		      //console.log(games.length) // 1839
					var games = games.filter((e,iii) => iii<=3);

 

//					console.log(games);
				 
	        //var games_FEN = [...games,...humanGames]
	        var games_FEN = games
	        //      .filter(e => playerColor=='w' ? (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2") : (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))
	        
	       const getResults = (n) => {return sampleMovesAsFENs(n, evaluation.getStatisticsForPositionVector,0.66,5*2,60*2,-1.5,1.5,0.33)}
	       for(var x=0;x<games_FEN.length;x++){
	       	games_FEN[x] = getResults(games_FEN[x]);
	       } 

	       //console.log(games_FEN)
	        
	        var vectors = [].concat.apply([], games_FEN)
	        //.filter(e => e[evaluation.allKeys.indexOf("last move by")]==1 && e[evaluation.allKeys.indexOf("halfmove")]>5*2 && e[evaluation.allKeys.indexOf("halfmove")]<=45*2)
          
	       //console.log(vectors)

          vectors = vectors.map(e => {
	        	var target = e[evaluation.allKeys.indexOf("cp")];  
	        	e.splice(evaluation.allKeys.indexOf("cp"), 1);
	        	return {"data": e, "label":target}
	        })

	        window.allKeys = evaluation.allKeys;

	        //console.log(vectors)

	       /*
					* Sample the data in a smart way, to avoid overfitting to the median/average label value
	        */

	        var histGenerator = d3.bin()
					  .domain([-2,2])    // Set the domain to cover the entire intervall [0;]
					  .thresholds(10);  // number of thresholds; this will create 10+1 bins

					var bins = histGenerator(vectors.map(e => e.label))
					.filter(e => e.length>=1).map(e => [arrayMin(e),e.length,arrayMax(e)])

					//console.log(bins);

					var mean_most_common_least_common_count = median(bins.map(e => e[1]));

					var selectVectors = [];

					for(var i = 0; i<mean_most_common_least_common_count;i++){
						bins.forEach(e => {
						var temp = vectors.filter(each => each.label>=e[0] && each.label<=e[2])
						selectVectors.push(temp[Math.floor(Math.random() * temp.length)])
						})
					}
					
					//console.log(selectVectors);

					vectors = selectVectors;

					/* Create the model or load model
					 */
 
					 tf_chess.main({
					 	create: false,
					 	load: {model: 'my-model', normalizeVector_:'normalizeVector'}, 
					 	train: true, 
					 	overrideMinMax: false, 
					 	saveAfterTraining:  {model: 'my-model', normalizeVector_:'normalizeVector'},
					 	importance: true,
					 	test: true,
					 },vectors, undefined)
 
	      })
}

export async function getGameStatistics(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(games => {
	       
	        var games_FEN = games
	              .filter(e => playerColor=='w' ? (e.tags.Result=="1-0" || e.tags.Result=="1/2-1/2") : (e.tags.Result=="0-1" || e.tags.Result=="1/2-1/2"))
	              .map(game => getMovesAsFENs(game, evaluation.getStatisticsForPositionDict).map(f => {
	              	return Object.assign({}, { 
																		         "index": 0, 
																		   			 "game count": 1
																		        }, f);
	              }))
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

export function getNotification(chess, playerColor, halfMoves){

	 if(halfMoves>0){ 
          var my_stats_now = evaluation.getStatisticsForPositionDict(chess,chess.history({verbose:true}).reverse()[0]);
          var stats_opp = chess_meta[playerColor=="w" ? "white" : "black"][halfMoves];
          delete stats_opp["game count"];
          delete stats_opp["index"];
          delete stats_opp["Material"]; 

          var notification = getDistanceVectorForStatistics({'playerStats':my_stats_now,'stats': stats_opp})
          .filter(e => e.includes(playerColor=="w" ? "{white}" : "{black}")).map(e => e.replace(playerColor=="w" ? "{white}" : "{black}",""));
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
          return Array.from(new Set(notification)); 
 
        }else{
          return [];
        }
}