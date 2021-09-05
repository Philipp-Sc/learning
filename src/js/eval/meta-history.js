
import * as move_meta from "./move-meta.js"
import {sum_array} from "../utilities.js"

export const historyKeys = move_meta.move_meta_keys.map(e => "{history} "+e);


export function get_move_meta_history(game,onlyVector){

	  var vector = game.history({ verbose: true }).map(e => move_meta.get_move_meta(e,onlyVector)).reduce(sum_array,new Array(historyKeys.length).fill(0));
	  
		if(onlyVector) return vector;

	  var dict = {}
	  vector.forEach((e,i) => {dict[historyKeys[i]]=e})
	  return dict; 
	
}