
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 
import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, sortJsObject} from "./utilities.js"


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
			if(i>=start && i<=end && game.moves[i].commentAfter>=minCP && game.moves[i].commentAfter<=maxCP && Math.random()>skipProbability){
				if(game.moves[i].commentAfter==0){
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

function createModel(inputSize,outputSize) {
  // Create a sequential model
  const model = tf.sequential();

  // Add a single input layer
  model.add(tf.layers.dense({inputShape: [inputSize], units: 256, useBias: true, activation: 'relu'})); 

  // 1024 good results
  // 512 good results 
  // 256

  model.add(tf.layers.dropout({ rate: 0.05 }))
  // Add an hidden layer
  model.add(tf.layers.dense({units: 256, useBias: false, activation: 'relu'}));  
  // model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  // activation ('elu'|'hardSigmoid'|'linear'|'relu'|'relu6'| 'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'|'swish'|'mish')


  // Add an output layer
  model.add(tf.layers.dense({units: outputSize, useBias: false}));

  return model;
}

function normalizeVector(data,inputMinMax_,labelMinMax_) {

	 var inputMinMax;
	 var labelMinMax;

   if(!inputMinMax_ || !labelMinMax_){
		  var v_min = new Array(data[0].data.length).fill(Infinity);
		  var v_max = new Array(data[0].data.length).fill(-Infinity);
		  for(var i=0;i<data.length;i++){
		  	data[i].data.forEach((e,i) => {
		  		if(e<v_min[i]){
		  			v_min[i] = e;
		  		}
		  		if(e>v_max[i]){
		  			v_max[i] = e;
		  		} 
		  	}) 
		  }
	    var inputMinMax =  v_min.map((e,i) => {return {"min":v_min[i], "max":v_max[i]}})

	    var d = data.map(entry => entry.label).map(e => e==undefined ? -1 : (isFinite(e) ? e : -1));
	    var labelMinMax =  {max: 2, min: -2}
  }

    if(inputMinMax_ && labelMinMax_){
    	inputMinMax = inputMinMax_;
    	labelMinMax = labelMinMax_;
    }
    

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.data).map(entry => entry.map((e,i) => normalize(inputMinMax[i].min,inputMinMax[i].max)(e)))
    const labels = data.map(d => d.label).map(entry => normalize(labelMinMax.min,labelMinMax.max)(entry))

    return {
    	inputs:inputs,
    	labels:labels,
    	inputMinMax:inputMinMax,
    	labelMinMax:labelMinMax,
    }
}

/**
 * Convert the input data to tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data,inputMinMax_,labelMinMax_) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    const res = normalizeVector(data,inputMinMax_,labelMinMax_);
    const inputs = res.inputs;
    const labels = res.labels;
    //console.log(inputs);
    //console.log(labels);


    const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

 
    return {
      inputs: inputTensor,
      labels: labelTensor,
      // Return the min/max bounds so we can use them later.
      inputMinMax: res.inputMinMax,
      labelMinMax: res.labelMinMax, 
    }
  });
}

async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });

  const batchSize = 64;
  // 16 good results
  const epochs = 30;
  // 50 good results

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'poisson'],
      { height: 300, callbacks: ['onEpochEnd'] }
    )
  });
}


export async function getFeatureImportance(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(async(games) => {
		      //console.log(games.length) // 1839
//					var games = games.filter((e,iii) => iii<=3);

 

//					console.log(games);
					games.forEach((game,ii) => {
						 game.moves.forEach((move,i) => {
						 	if(move.commentAfter){
						 		var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
						 		var cp = parseFloat(temp);
						 		games[ii].moves[i].commentAfter = isNaN(cp) ? -1 : cp;
						 	} 
					})
					}) 

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


          var temp = {"input":undefined,"label":undefined};
					let model;
          if(true){ // load or create
	        	model = createModel(vectors[0].data.length,1);
	      	}else{
	        	model = await tf.loadLayersModel('localstorage://my-model');

	 					temp = JSON.parse(window.localStorage.getItem("normalizeVector"))
	 					console.log("loaded normalizeVector from localstorage");
					}
					tfvis.show.modelSummary({name: 'Model Summary'}, model);


					/* Prepare training data
					 */

					// Convert the data to a form we can use for training.
					const tensorData = convertToTensor(vectors,temp.input,temp.label);


					const {inputs, labels} = tensorData;


					window.localStorage.setItem("normalizeVector",JSON.stringify({"input":tensorData.inputMinMax,"label":tensorData.labelMinMax}))
 					console.log("normalizeVector written to localStorage")

 					// "{\"input\":[{\"min\":0,\"max\":0},{\"min\":1,\"max\":1},{\"min\":1,\"max\":499},{\"min\":0,\"max\":1},{\"min\":0,\"max\":78},{\"min\":0,\"max\":39},{\"min\":0,\"max\":39},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":2},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":14},{\"min\":0,\"max\":2},{\"min\":0,\"max\":6},{\"min\":0,\"max\":2},{\"min\":0,\"max\":13},{\"min\":0,\"max\":2},{\"min\":0,\"max\":6},{\"min\":0,\"max\":2},{\"min\":0,\"max\":null},{\"min\":0,\"max\":null},{\"min\":-4,\"max\":4},{\"min\":0,\"max\":null},{\"min\":0,\"max\":7},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0,\"max\":8},{\"min\":0.13333333333333333,\"max\":5.333333333333333},{\"min\":1,\"max\":8},{\"min\":1,\"max\":8},{\"min\":1,\"max\":63},{\"min\":1,\"max\":61},{\"min\":0,\"max\":2},{\"min\":0,\"max\":null},{\"min\":0,\"max\":null},{\"min\":0,\"max\":2},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":8},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":8},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1},{\"min\":0,\"max\":3},{\"min\":0,\"max\":3},{\"min\":0,\"max\":4},{\"min\":0,\"max\":4},{\"min\":0,\"max\":1},{\"min\":0,\"max\":1}],\"label\":{\"max\":2,\"min\":-2}}"


					// Train the model
					if(false){ // train or not train
						var res = await trainModel(model, inputs, labels);
						console.log('Done Training');
						

						await model.save('localstorage://my-model');
						console.log("model saved: my-model")
					}
					//await model.save('downloads://my-model');

           
					/* Prepare test data or use training data as testing data
					 */

        	var res = normalizeVector(vectors,temp.input,temp.label);
 

        	//console.log(res)

        	var myModel = {predict: (test) => {
        		var p = model.predict(tf.tensor2d(test, [test.length, test[0].length]));
        		return p.dataSync();
        	}}

					// Get feature importance
					const imp = importance(myModel, res.inputs, res.labels, {
					  kind: 'mse',
					  n: 1,
					  means: true,
					  verbose: true
					})
					var importance_list = (imp.map((e,i) => {return {key:evaluation.allKeys[1+i],value:e}}))
          importance_list = sortJsObject(importance_list);
					console.log(importance_list)


          /* Prepare custom testing data
					var my_test_game = new Chess();
					my_test_game.load_pgn("1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. a3 {giuoco piano} *");
	
					var vectors = getStatisticsForPositionVector(my_test_game,my_test_game.history({verbose:true}).reverse()[0])

					console.log(vectors)
          vectors = [vectors].map(e => {
	        	var target = e[evaluation.allKeys.indexOf("cp")]; 
	        	e.splice(evaluation.allKeys.indexOf("cp"), 1);
	        	return {"data": e, "label":target}
	        })
					console.log(vectors)

        	var res = normalizeVector(vectors,temp.input,temp.label);


        	console.log(res);
        	//res.inputs.length
				  const preds = model.predict(tf.tensor2d(res.inputs, [res.inputs.length, res.inputs[0].length]));
				  console.log("first pred, then label")
				  console.log(preds.dataSync());
				  console.log(res.labels); 
*/

				return;



	        var result = []; 
	        // we need a evaluation key
	        // then can do regression here
	        console.log(games_FEN)
 
	        console.log(JSON.stringify(result));
	      })
}

export async function getGameStatistics(playerColor) {

	chess_meta.chessGames("engine").then(humanGames => humanGames.get).then(games => {
	        games.forEach((game,ii) => {
						 game.moves.forEach((move,i) => {
						 	if(move.commentAfter){
						 		var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
						 		var cp = parseFloat(temp);
						 		games[ii].moves[i].commentAfter = isNaN(cp) ? -1 : cp;
						 	} 
					})
					})

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