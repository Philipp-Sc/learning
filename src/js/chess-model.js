import * as tf_chess from './tensorflow-chess.js'
import * as chess_stats from './chess-stats.js'

import * as importance_chess from './importance-chess.js'



const default_model = require('./json/default_model.json')
 
var debug = false;

export async function build_my_model(output) {

	var vectors = await chess_stats.load_data();

	console.log("load_data finished")
   
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

export async function test_model_with_pgn(pgn) {
	return tf_chess.test_model_with_pgn('my-model',pgn);
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
 
	var vectors= await chess_stats.load_data();

	var test_vectors = vectors.filter((e,i) => i<vectors.length/2)
	vectors = vectors.filter((e,i) => i>=vectors.length/2)

 
	 await tf_chess.main({ 
	 	load: {model_name: 'my-model'}, 
	 	train: {initial: false},    
	 },vectors) 

	
	if(debug) console.log(await test_model())

	importance_chess.main('my-model',vectors,test_vectors)
  
}
