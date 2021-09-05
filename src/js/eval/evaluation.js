
import * as move_meta from "./move-meta.js"
import {get_move_meta_history,historyKeys} from "./meta-history.js"
import {mobility,mobilityKeys} from "./mobility.js" 
import {package_density,packageDensityKeys} from "./package-density.js"
import {material,materialKeys} from "./material.js"
import {pawnFeatures,pawnKeys} from "./pawn-structure.js"
import {expansion_factor,expansionFactorKeys} from "./expansion-factor.js"


export const allKeys = [ 
   			 "cp",
   			 "halfmove",
   			 "last move by",
   			 ...move_meta.move_meta_keys, // _1
   			 ...materialKeys, // _2
   			 ...packageDensityKeys, // _3
   			 ...expansionFactorKeys, // _4
   			 ...pawnKeys, // _5
   			 ...mobilityKeys, // _6
             ...historyKeys, // _7
        ];


export function getCP(move) {
    if(move.commentAfter){
        var temp = move.commentAfter.split("/")[0].replace("\n"," ").split(" ").reverse()[0];
        var cp = parseFloat(temp);
        return isNaN(cp) ? -1 : cp; 
    }else{
        if(move.commentDiag){
            if(move.commentDiag.depth20){
                return parseFloat(move.commentDiag.depth20);
            }
            if(move.commentDiag.depth1){
                return parseFloat(move.commentDiag.depth1);
            }
            return undefined;
        }
    }
}

export function getStatisticsForPositionDict(new_game,last_move) {
	return getStatisticsForPosition(new_game,last_move,false);
}

export function getStatisticsForPositionVector(new_game,last_move) {
	return getStatisticsForPosition(new_game,last_move,true);
}
 
export function getStatisticsForPosition(new_game,last_move,onlyVector) {

                var fen = new_game.fen();

                var __1 = getCP(last_move);
                var __2 = new_game.history().length;
                var __3 = move_meta.getColorOfMove(last_move)=="w" ? 1 : 0;
        
				var _1 = move_meta.get_move_meta(last_move,onlyVector);
				var _2 = material(fen,onlyVector);
				var _3 = package_density(fen,onlyVector);
				var _4 = expansion_factor(fen,onlyVector);
				var _5 = pawnFeatures(fen,onlyVector);
				var _6 = mobility(new_game, fen, last_move,_3.opt,onlyVector);
                var _7 = get_move_meta_history(new_game,onlyVector);

				if(onlyVector){
					return [__1,__2,__3,..._1,..._2,..._3.vector,..._4,..._5,..._6,..._7]
				}

        var statistics =  {
   			 "cp": __1,
   			 "halfmove": __2,
   			 "last move by": __3,
        }
        statistics = Object.assign({}, statistics, _1);
        statistics = Object.assign({}, statistics, _2);
        statistics = Object.assign({}, statistics, _3.dict);
        statistics = Object.assign({}, statistics, _4);
        statistics = Object.assign({}, statistics, _5);
        statistics = Object.assign({}, statistics, _6);
        statistics = Object.assign({}, statistics, _7);
        return statistics;
            }