
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis' 

import * as chess_meta from "../js/chess-meta.js"
import * as d3 from "d3";
import {average, median, arraysEqual, sum, arrayMin, arrayMax, normalize, undoNormalize, sortJsObject} from "./utilities.js"


import * as evaluation from "../js/eval/evaluation.js"
  
const importance = require('importance')

const Chess = require("chess.js"); 
 

 export function createModel(inputSize,outputSize) {
  // Create a sequential model
  const model = tf.sequential();

  // Add a single input layer
  model.add(tf.layers.dense({inputShape: [inputSize], units: 256, useBias: true, activation: 'relu'})); 

  // 1024 good results
  // 512 good results 
  // 256


  // Add an hidden layer
  model.add(tf.layers.dense({units: 256, useBias: false, activation: 'relu'}));  
  // model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
  // activation ('elu'|'hardSigmoid'|'linear'|'relu'|'relu6'| 'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'|'swish'|'mish')


  // Add an output layer
  model.add(tf.layers.dense({units: outputSize, useBias: false}));

  tfvis.show.modelSummary({name: 'Model Summary'}, model);

  return model;
}


export function normalizeVector(data,inputMinMax_,labelMinMax_) {

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
export function convertToTensor(data,inputMinMax_,labelMinMax_) {
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

export async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });

  const batchSize = 64;
  // 16 good results
  const epochs = 100;
  // 50 good results

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss'],
      { height: 400, callbacks: ['onEpochEnd'] }
    )
  });
}


export async function load_model(my_model,normalizeVector_) {
	var model = await tf.loadLayersModel('localstorage://'+my_model);
	console.log("loaded localstorage://"+my_model);
	console.log("loaded localstorage://"+normalizeVector_);
	tfvis.show.modelSummary({name: 'Model Summary'}, model);

	return {model:model, "normalizeVector_":JSON.parse(window.localStorage.getItem(normalizeVector_))}
}

export function getImportance(model, vectors, normalizeVector_) {

    var n_vectors = normalizeVector(vectors,normalizeVector_.input,normalizeVector_.label);

    var myModel = {predict: (test) => {
        		var p = model.predict(tf.tensor2d(test, [test.length, test[0].length]));
        		return p.dataSync();
    }}
	// Get feature importance
	const imp = importance(myModel, n_vectors.inputs, n_vectors.labels, {
	  kind: 'mse',
	  n: 1,
	  means: true,
	  verbose: true
	})
	var importance_list = (imp.map((e,i) => {return {key:evaluation.allKeys[1+i],value:e}}))
    importance_list = sortJsObject(importance_list);
	console.log(importance_list)
}

const test_model_with_pgn = async(model,normalizeVector_, pgn) => {
 	var my_test_game = new Chess();
	my_test_game.load_pgn(pgn);

	var vectors = evaluation.getStatisticsForPositionVector(my_test_game,my_test_game.history({verbose:true}).reverse()[0])

	vectors = [vectors].map(e => {
		var target = e[evaluation.allKeys.indexOf("cp")]; 
		e.splice(evaluation.allKeys.indexOf("cp"), 1);
		return {"data": e, "label":target}
	}) 

	return await test_model_vectors(model,normalizeVector_,vectors,pgn);

}

const test_model_vectors = async(model,normalizeVector_,vectors,pgn) => {
 
 	var res = normalizeVector(vectors,normalizeVector_.input,normalizeVector_.label);

	const preds = model.predict(tf.tensor2d(res.inputs, [res.inputs.length, res.inputs[0].length]));
	
	const data = preds.dataSync();

	return {pgn: pgn,
			vectors: vectors, 
			normalizeVector: {input: res.inputMinMax, label: res.labelMinMax}, 
			prediction: data, 
			prediction_value: data.map(e => undoNormalize(e,-2,2)),
			label: res.labels
			}

}

export async function main(arg,vectors,test_pgns) {
	
    var normalizeVector_ = {"input":undefined,"label":undefined};
	let model;

	if(arg.create){ // create
		model = createModel(vectors[0].data.length,1);
	}
	if(arg.load){
		var loaded_model = await load_model(arg.load.model,arg.load.normalizeVector_)
		model = loaded_model.model;
		normalizeVector_ = loaded_model.normalizeVector_;
	}

	if(arg.train){ 
	
		// Convert the data to a form we can use for training.
		const tensorData = convertToTensor(vectors,normalizeVector_.input,normalizeVector_.label);
		const {inputs, labels} = tensorData;
		if(arg.create || arg.overrideMinMax){
			normalizeVector_ = {"input":tensorData.inputMinMax,"label":tensorData.labelMinMax};
		}
				
		var res = await trainModel(model, inputs, labels);
		console.log('Done Training');
						
		if(arg.saveAfterTraining){
			await model.save('localstorage://'+arg.saveAfterTraining.model);
			console.log("model saved: "+arg.saveAfterTraining.model)

			if(arg.overrideMinMax){
				window.localStorage.setItem(arg.saveAfterTraining.normalizeVector_,JSON.stringify(normalizeVector_))
	 			console.log(arg.saveAfterTraining.normalizeVector_+" written to localStorage")
 			}
		}
	}
	if((arg.load || (arg.create && arg.train))){

		if(arg.importance){
 			getImportance(model,vectors, normalizeVector_) 
		}
		if(arg.test){
		/* Prepare test data or use training data as testing data
		 */
			var res = await test_model_with_pgn(model,normalizeVector_,"1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. a3 {giuoco piano} *");
			console.log(res);

			// allow live testing
			window.test_model = (pgn) => test_model_with_pgn(model,normalizeVector_,pgn).then(e => console.log(e));

			if(test_pgns){
				var res = Promise.all(...test_pgns.map(e => test_model_with_pgn(model,normalizeVector_,e)));
				console.log(res)
			}

		}

	}
				 
					
        	

					


          ///* Prepare custom testing data
					

}