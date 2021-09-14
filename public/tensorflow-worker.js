
//importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js"); 
//importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js")
importScripts("./tensorflow/tf.min.js"); 
//importScripts("./tensorflow/tf-backend-wasm.js")
//tf.setBackend('cpu')
//tf.setBackend('wasm')

var loaded_model;
var loaded_model_name;

var debug = false;

onmessage = function(message) {
  const {data} = message;
  if (data.method && data.params) {
    if(data.method!="modelPredict"){
      if(debug) console.log('Tensorflow Worker:');
      if(debug) console.log(">> Method: "+data.method)
      if(debug) console.log(">> Params: "+data.params.length)
    }
  	var res = self[data.method](data.method,...data.params);
    res.then(result => postMessage(result));
  } else { 
    if(debug) console.log('Tensorflow Worker: Invalid message'); 
  }

}

async function init_model(method,model_name) {
  loaded_model = await tf.loadLayersModel('indexeddb://'+model_name);
  loaded_model_name = model_name;
  return new Promise((resolve, reject) => {
    resolve({"type":"result","method":method,"value":model_name})
  }); 
}

function createModel(method,model_name,inputSize,outputSize) { 
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

  return model.save('indexeddb://'+model_name).then(() => {
    return {"type":"result","method":method,"value": model_name}
  }) 
}


async function trainModel(method, model_name, inputs, labels) {

   var model = await tf.loadLayersModel('indexeddb://'+model_name);
 

    const inputTensor = tf.tensor2d(...inputs);
    const labelTensor = tf.tensor2d(...labels);

    const batchSize = 256;
    // 64 good results
    const epochs = 25;
    // 50 good results

    model.compile({
          optimizer: tf.train.adam(),
          loss: tf.losses.meanSquaredError,
          metrics: ['mse'],
        }); 

    const callbacks = {
      onEpochEnd: async (epoch, logs) => {
        if(debug) console.log("epoch: " + epoch +" "+ JSON.stringify(logs))
        callback("onEpochEnd",epoch,logs);
      }
    };

    await model.fit(inputTensor, labelTensor, {
          batchSize,
          epochs,
          shuffle: true,
          callbacks: callbacks
          });    

    inputTensor.dispose();
    labelTensor.dispose();

    loaded_model = model;
    loaded_model_name = model_name;
 

    return model.save('indexeddb://'+model_name).then(() => {
      return {"type":"result","method":method,"value":model_name}
    })
}

function callback(method,epoch,logs) { 
  postMessage({"type":"callback","method":method,"value":[epoch,logs]})
}


async function modelPredict(method,model_name,test) {

  if(loaded_model && model_name==loaded_model_name){
 
    var tensor = tf.tensor2d(...test);
    var promise = loaded_model.predict(tensor);
    var result = promise.dataSync();
    tensor.dispose(); 

    return new Promise((resolve, reject) => {
      resolve({"type":"result","method":method,"value":result})
    });  
  }else{
    loaded_model = await tf.loadLayersModel('indexeddb://'+model_name);
    loaded_model_name = model_name;

    return modelPredict(method,model_name,test)
    // possible error, no model for model_name exists. 
  }
}
 