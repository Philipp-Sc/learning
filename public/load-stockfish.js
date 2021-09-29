
function isSupported() {
  if (typeof WebAssembly !== "object") return false;
  const source = Uint8Array.from([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 7, 8,
    1, 4, 116, 101, 115, 116, 0, 0, 10, 15, 1, 13, 0, 65, 0, 253, 17, 65, 0,
    253, 17, 253, 186, 1, 11,
  ]);
  if (
    typeof WebAssembly.validate !== "function" ||
    !WebAssembly.validate(source)
  )
    return false;
  if (typeof Atomics !== "object") return false;
  if (typeof SharedArrayBuffer !== "function") return false;
  return true;
};


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

function getConnection() { 
  return navigator.connection || navigator.mozConnection ||
    navigator.webkitConnection || navigator.msConnection;
}

function callback(){
	try{ 
		Stockfish().then(sf => {
			window.stockfish = sf;
		});
	}catch(error){
		console.log(error);
	}
}

function importStockfish(){
  // 1Mbps: 1MB file will take eight seconds to download
  // 10Mbps: 50MB -> 40s 

  // Only use NNUE version, when network speed is sufficient. Otherwise the download takes to long.
	if(isSupported() && getConnection().downlink>=10){
		// Multi-threaded WASM. Uses SIMD. Strongest.
		window.sf_version = "Stockfish 14 (nnue-wasm)";
		// See https://github.com/hi-ogawa/Stockfish for a WebAssembly port with NNUE support.
        // See https://github.com/hi-ogawa/stockfish-nnue-wasm-demo/blob/master/public/index.html for how to use Stockfish 14 (nnue-wasm).
		const script = document.createElement("script");    
		script.async = false;    
		script.src = "./stockfish/nnue-wasm/stockfish.js";    
		script.onload = function() {
	      callback();
	    };
		document.body.appendChild(script); 
	}
	else if(wasmThreadsSupported()){
		// Multi-threaded WASM, but using the classical handcrafted evaluation function.
		window.sf_version = "Stockfish 14 (wasm)";
		// https://github.com/niklasf/stockfish.wasm
		const script = document.createElement("script");    
		script.async = false;    
		script.src = "./stockfish/wasm/stockfish.js";    
		script.onload = function() {
	      callback();
	    };
		document.body.appendChild(script); 
	}else{ 
		// Slower-single threaded WASM fallback.
        // With extremely slow pure JavaScript fallback.
		window.sf_version = "Stockfish 10";
		// Maintained with bugfixes to keep supporting older browsers, but active development is happening on stockfish.wasm.
		// https://github.com/niklasf/stockfish.js
		var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
		window.stockfish = new Worker(wasmSupported ? './stockfish/v10/stockfish.wasm.js' : './stockfish/v10/stockfish.js');
		window.stockfish.onmessage = function(event) {
		    console.log(event.data ? event.data : event);
		}; 
	}
}

importStockfish();



/*
const onSelectNnueFile = async (e) => {
        const selected = e.currentTarget.files[0];
        if (selected) {
          //
          // TODO:
          // On Archlinux Chromium 92.0.4515.107, most of times this code fails with the error saying:
          //   TypeError: Failed to execute 'decode' on 'TextDecoder': The provided ArrayBufferView value must not be shared.
          // On the other hand, either Chrome with the same version or Firefox never fail.
          //
          const FS = stockfish.FS;
          const buffer = await selected.arrayBuffer();
          const array = new Uint8Array(buffer);
          const filename = "/" + selected.name;
          FS.writeFile(filename, array);
          stockfish.postMessage(`setoption name EvalFile value ${filename}`);
          stockfish.postMessage(`eval`);
        }
      };
*/