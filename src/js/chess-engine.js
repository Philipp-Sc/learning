
export function wasmThreadsSupported() {
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

/*
var stockfish = undefined;
// Stockfish.wasm is loaded via index.html, the stockfish.* files are placed in the public folder.
// @ts-ignore
Stockfish().then(sf => {
  stockfish = sf;
});


var position_info: { 
	depth: number, 
	multipv: number, 
	cp: number, 
	pv: string, 
	info: string, 
	timestamp: number, 
	move: number, 
	flag: string 
	}[] = [];
*/