   
import {sortJsObject} from "./utilities.js"

import * as tf_chess from './tensorflow-chess.js'
 
import {importance} from './importance/index.js'

import * as chess_stats from "./chess-stats.js"
   
import {sendToChessToVectorWorkerDirectly,get_chess_to_feature_vector_worker_if_exists_else_create,get_all_keys_for_features} from "../js/chess-to-feature-vector-controller.js" 

const Chess = require("chess.js"); 


var debug = true;

// has a callback function to get intermediate results
export async function getImportance(model_name, vectors, norm,n_,callback) { 
	  var allKeys = await get_all_keys_for_features();
	  var n_vectors = tf_chess.convertToTensor(vectors,norm);

	  var myModel = {modelScore: (test,label,kind) => tf_chess.modelScore(model_name,[test, [test.length, test[0].length]],label,kind)}
	  
	  return importance(myModel, n_vectors.inputs[0], n_vectors.labels[0], {
		  kind: 'mse',
		  n: n_,
		  means: true,
		  verbose: debug
		})
	  .then(imp => Promise.all(imp.map((e,i) => e.then(res => {callback(res,i);return res}))).then(importance_list => {
	  	return sortJsObject(importance_list.map((e,i) => {return {key:allKeys[i],value:e}}))
	  }))
}


export const get_feature_importance_with_pgn = async(model_name, pgn, callback) => {

	var norm = JSON.parse(window.localStorage.getItem(model_name));

 	var my_test_game = new Chess();
	my_test_game.load_pgn(pgn);
		
	if(my_test_game.game_over()){
		my_test_game.undo();
	}


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

 			var chess_to_feature_vector_worker = await get_chess_to_feature_vector_worker_if_exists_else_create();
			var vector = (await sendToChessToVectorWorkerDirectly(chess_to_feature_vector_worker,[my_test_game.history({verbose:true})]))[0]

			var label = await tf_chess.test_model_with_pgn(model_name,my_test_game.pgn()); 
			
			if(label.prediction[0]>=0.5-reduce){ // we want to know about features that are important for good moves 
				vectors.push({"data":vector,"label": label.prediction_value[0]})
			}
		} 
		reduce = reduce + 0.1;
	}

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
 
	return getImportance(model_name, vectors, norm, Math.max(1,Math.floor(alternatives.length/2)), callback);

} 


export async function main(model_name,vectors,test_vectors) {

			var norm = JSON.parse(window.localStorage.getItem(model_name));

			if(vectors){
				if(debug) console.log("Importance on training data:")
	 			if(debug) console.log(await getImportance(model_name,vectors, norm,1,() => {}))
 			}

 			if(test_vectors){
				if(debug) console.log("Importance on test data:")
				var global_feature_importance = await getImportance(model_name,test_vectors, norm,1,() => {});
				if(debug) console.log(global_feature_importance)		
				window.localStorage.setItem(model_name+"://importance",JSON.stringify(global_feature_importance))
				if(debug) console.log('Saved '+model_name+"://importance")
			}		

}