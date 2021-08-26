const initEngine = (messageListener) => {
  if(window.sf_version=="Stockfish 14 (nnue-wasm)" || window.sf_version=="Stockfish 14 (wasm)"){
    // @ts-ignore
    window.stockfish.addMessageListener(line => {  
      messageListener(line);
    });
  }else if(window.sf_version=="Stockfish 10"){
    window.stockfish.onmessage = function(event) {
      //NOTE: Web Workers wrap the response in an object.
      // console.log(event.data ? event.data : event); 
      if(event.data=="" || event.data==null){
        return;
      }
      messageListener(event.data ? event.data : event)
    };
  }
  // @ts-ignore
  window.stockfish.postMessage('uci'); 
  // @ts-ignore
  window.stockfish.postMessage('setoption name MultiPV value '+1) 
  if(window.sf_version=="Stockfish 14 (nnue-wasm)"){
    // @ts-ignore
    window.stockfish.postMessage("setoption name Use NNUE value true")
   } 
}

export const startEngine = (messageListener) => {
  console.log(window.sf_version);
  if(window.stockfish){
    initEngine(messageListener);
   }else{
    console.log("stockfish.js loading..")
    setTimeout(() => {startEngine(messageListener);},500);
   }
}
