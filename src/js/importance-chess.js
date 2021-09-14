 

import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, sortJsObject} from "./utilities.js"

import * as tf_chess from './tensorflow-chess.js'

import * as evaluation from "../js/eval/evaluation.js"


import {importance} from './importance/index.js'

   
const Chess = require("chess.js"); 

var debug = false;


export async function getImportance(model_name, vectors, norm,n_) { 
	  var n_vectors = tf_chess.convertToTensor(vectors,norm);

	  var myModel = {predict: (test) => tf_chess.modelPredict(model_name,[test, [test.length, test[0].length]])}
	  
	  const imp = await importance(myModel, n_vectors.inputs[0], n_vectors.labels[0], {
		  kind: 'mse',
		  n: n_,
		  means: true,
		  verbose: debug
		})
	  var importance_list = (imp.map((e,i) => {return {key:evaluation.allKeys[1+i],value:e}}))
	  importance_list = sortJsObject(importance_list); 
	  return importance_list 
}


export const get_feature_importance_with_pgn = async(model_name, pgn) => {

	var norm = JSON.parse(window.localStorage.getItem(model_name));

 	var my_test_game = new Chess();
	my_test_game.load_pgn(pgn);


	var vectors = [];

	my_test_game.undo();
	var alternatives = my_test_game.moves({verbose:true});

	// importance means the features that are used to evaluate the position
	// with live training, that sentence changes to:
	// importance means the features that are used to evaluate position correctly
	// what we need is:
	// filter the features if they have changed with the last move
	// this makes two sets of features:
	// static features, dynamic features
	// for the dynamic features (really the only features the player has direct control over)
	// todo: find out which values are the aspiration
	// make a spider diagram, with each alternative move with the dynamic features is plotted?
    // the coloring of the move would resemble the evaluation
	

    // not sure if this is a good idea:
	// filter moves that maintain a evaluation >=0 for white and <=0 for black
	// use stockfish, because it is more accurate

	// this way we get the importance of the features that improve the position
	var reduce = 0; 
	while(vectors.length==0){

		for(var i=0;i<alternatives.length;i++){
			my_test_game.load_pgn(pgn);
			my_test_game.undo();
			my_test_game.move(alternatives[i]);   
			var vector = evaluation.getStatisticsForPositionVector(my_test_game, my_test_game.history({verbose:true}).reverse()[0]);
			var label = await tf_chess.test_model_with_pgn(model_name,my_test_game.pgn()); 
			
			if(label.prediction[0]>=0.5-reduce){ // we want to know about features that are important for good moves
				vector[evaluation.allKeys.indexOf("cp")] = label.prediction_value[0]
				vectors.push(vector)
			}
		} 
		reduce = reduce + 0.1;
	}

	vectors = vectors.map(e => {
		var target = e[evaluation.allKeys.indexOf("cp")]; 
		e.splice(evaluation.allKeys.indexOf("cp"), 1);
		return {"data": e, "label":target}
	}) 

	/*
   * feature vectors for all possible positions that could have arisen a move ago
   *
   * - this shows the features that are important to make the right move
   * - it does not show all the features that are important to evaluate the position correctly,
   *   the missing features are unaffectd by the last move.
   *   -> but they are still important to evaluate the position.
   *
   * Plan: 
   * - Use the importance of the features over all test data.
   *		- Order Notification Feature Vector by that.
   * - Highlight the features that are important and affected by any possible last move
   * - Highlight these features again by
   *    - How relevant they are for positive/negative evaluations
	 */
 
	return getImportance(model_name, vectors, norm, Math.max(1,Math.floor(alternatives.length/2)));

} 


export async function main(model_name,vectors,test_vectors) {

			var norm = JSON.parse(window.localStorage.getItem(model_name));

			if(vectors){
				if(debug) console.log("Importance on training data:")
	 			if(debug) console.log(await getImportance(model_name,vectors, norm,1))
 			}

 			if(test_vectors){
				if(debug) console.log("Importance on test data:")
				var global_feature_importance = await getImportance(model_name,test_vectors, norm,1);
				if(debug) console.log(global_feature_importance)		
				window.localStorage.setItem(model_name+"://importance",JSON.stringify(global_feature_importance))
				if(debug) console.log('Saved '+model_name+"://importance")
			}		

}