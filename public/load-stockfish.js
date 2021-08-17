 
function wasmThreadsSupported() {
  // WebAssembly 1.0
  const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
  if (
    typeof WebAssembly !== "object" ||
    typeof WebAssembly.validate !== "function"
  )
    return false;
  if (!WebAssembly.validate(source)) return false;

  // SharedArrayBuffer
  // @ts-ignore
  if (typeof SharedArrayBuffer !== "function") return false;

  // Atomics
  if (typeof Atomics !== "object") return false;

  // Shared memory
  const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
  if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

  // Structured cloning
  try {
    // You have to make sure nobody cares about these messages!
    window.postMessage(mem, "*");
  } catch (e) {
    return false;
  }

  // Growable shared memory (optional)
  try {
    mem.grow(8);
  } catch (e) {
    return false;
  }

  return true;
}

function callback(){
	try{ 
		Stockfish().then(sf => {
			window.stockfish = sf;
			window.sf_version = 14;
		});
	}catch(error){
		console.log(error);
	}
}

function callbackLegacy(){
	try{ 
		window.stockfish = STOCKFISH();
		window.stockfish.onmessage = function(event) {
		    console.log(event.data ? event.data : event);
		};
		window.sf_version = 11;
	}catch(error){
		console.log(error);
	}

}

function importStockfish(){
	if(wasmThreadsSupported() && false){
		const script = document.createElement("script");    
		script.async = false;    
		script.src = "./stockfish/wasm/stockfish.js";    
		script.onload = function() {
	      callback();
	    };
		document.body.appendChild(script); 
	}else if(/(iPad|iPhone|iPod)/g.test(navigator.userAgent)==false){
		const script = document.createElement("script");    
		script.async = false;    
		script.src = "./stockfish/v11/stockfish.js";    
		script.onload = function() {
	      callbackLegacy();
	    };
		document.body.appendChild(script); 
	}else{
		var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

		window.stockfish = new Worker(wasmSupported ? './stockfish/v10/stockfish.wasm.js' : './stockfish/v10/stockfish.js');
		window.stockfish.onmessage = function(event) {
		    console.log(event.data ? event.data : event);
		};

		window.sf_version = 10; 
	}
}

importStockfish();