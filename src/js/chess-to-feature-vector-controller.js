

var chess_to_feature_vector_worker = undefined;
 
export async function get_chess_to_feature_vector_worker_if_exists_else_create() {
	if(chess_to_feature_vector_worker){
		return chess_to_feature_vector_worker;
	}else{
		chess_to_feature_vector_worker = new Worker("chess_to_feature_vector/main.js");
		await sendWasmToChessWorker(chess_to_feature_vector_worker);
		return chess_to_feature_vector_worker;
	}
}

export async function get_all_keys_for_features() {
	return await sendToChessToVectorWorkerGetKeys(await get_chess_to_feature_vector_worker_if_exists_else_create());
}


export async function get_features_with_keys_as_dict(history) {
	var keys = await get_all_keys_for_features();
	var worker = await get_chess_to_feature_vector_worker_if_exists_else_create();
	var feature_vector = (await sendToChessToVectorWorkerDirectly(worker,history))[0];
	var dict = {};
	for(var i=0;i<keys.length;i++){
		dict[keys[i]] = feature_vector[i];
	}
	return dict;
}

export function sendToChessToVectorWorkerGetKeys(worker){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"get_all_keys",params: undefined}); 
		  worker.onmessage = (message) => {   
		        res(message.data.value)     
		  }
		});
	return promise;
}

export function sendToChessToVectorWorker(worker,game_index){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"get_features",params: [game_index]}); 
		  worker.onmessage = (message) => {   
		        res(message.data.value)     
		  }
		});
	return promise;
}

export function sendToChessToVectorWorkerDirectly(worker,game_histories){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"get_features_directly",params: game_histories}); 
		  worker.onmessage = (message) => {   
		        res(message.data.value)     
		  }
		});
	return promise;
}
 
export function sendWasmToChessWorker(worker){
	var promise = window.rust_wasm.then(blob => blob.arrayBuffer()).then(buffer => {

		return new Promise((res, rej) => {
  
		  worker.postMessage({method:"receive_wasm",param: buffer},[buffer]);

		  worker.onmessage = (message) => {  
		        res(message.data.value)     
		  }
		});
	});
	return promise;
}

export function sendGameDataToChessWorker(worker,game_data){
	var promise = new Promise((res, rej) => {
  
		  worker.postMessage({method:"receive_game_data",params: [game_data]});

		  worker.onmessage = (message) => {  
		        res(message.data.value)     
		  }
		});
	return promise;
}