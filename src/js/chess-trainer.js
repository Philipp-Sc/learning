import * as chess_meta from "../js/chess-meta.js"

const stockfishInfoOutDefault : StockfishInfoOut = {depth: NaN, multipv: NaN, cp: NaN, pv: "", info:"",timestamp:NaN,move:NaN};
  

async function selectOpeningMove(opening_move_duration,halfMoves,chess,elo,playerColor,depth_for_database,book){
  if(opening_move_duration*2+1>=halfMoves && book){ 
        var humanMove = await chess_meta.getMoveFromHumans(chess,elo,playerColor,depth_for_database); 
        if(humanMove.move!=undefined){
          var humanInfo = stockfishInfoOutDefault;
          humanInfo["depth"] = NaN;
          humanInfo["cp"] = NaN;
          humanInfo["multipv"] =NaN;
          humanInfo["pv"]=humanMove.move;
          humanInfo["move"]=halfMoves;
          humanInfo["info"]="Opening Move from HumanGames2200+.pgn";

          return humanInfo;
        }
        console.log("INFO: Unknown Opening, fallback to @no_book.");
      }
  return undefined;
}

export async function selectEngineMove(opening_move_duration,halfMoves,chess,elo,playerColor,depth_for_database,book,
                          position_info_list_at_depth,stockfishInfoOutHistory,
                          engineBlunderTolerance,
                          skill_profile){

      var openingMove = await selectOpeningMove(opening_move_duration,halfMoves,chess,elo,playerColor,depth_for_database,book);
      if(openingMove){
        return openingMove;
      }

      /*
      The opponement only plays good as long as you play decent.
      If you are behind, it will also play badly and give you a chance to come back.
      This is best for training, if the chess engine just butchers you, learning is difficult.
      */ 
      var clean_position_info_list_at_depth = position_info_list_at_depth.filter(e => e.move==halfMoves);

      console.log("INFO: The following "+clean_position_info_list_at_depth.length+" moves are available: ");   
      console.log(clean_position_info_list_at_depth);   

      if(skill_profile[halfMoves]==undefined){ // unlikely case
        console.log("WARNING: skill_profile[halfMoves]==undefined") 
        console.log("INFO: this happens for example when the game lasts more moves than accounted for with the skill_profile.") 
        console.log("INFO: move mumber "+halfMoves)
        console.log("INFO: just taking the best move now")
      }else if(engineBlunderTolerance/10<(stockfishInfoOutHistory[stockfishInfoOutHistory.length-1] || {cp: NaN}).cp/100){
        console.log("INFO: you breached the mistake tolerance")
        console.log("INFO: just taking the best move now")
      }else{
        var myArray = skill_profile[halfMoves].dist;
        var randomGoal = myArray[Math.floor(Math.random()*myArray.length)];
        console.log("INFO: The following evaluation was randomly choosen from the skill profile: ")
        console.log("INFO: Random evaluation: "+randomGoal);
        console.log("INFO: Median evaluation: "+skill_profile[halfMoves].median)
        var justifiedGoal = (skill_profile[halfMoves].median + randomGoal) / 2
        console.log("INFO: Using adjusted evaluation: "+justifiedGoal); 
        clean_position_info_list_at_depth = clean_position_info_list_at_depth.filter(e => e.cp == clean_position_info_list_at_depth.map(e => e.cp).reduce(function(prev, curr) {
          return (Math.abs(curr - (justifiedGoal)) < Math.abs(prev - (justifiedGoal)) ? curr : prev);
        }));
      }
      console.log("INFO: This leaves the following moves: ")
      console.log(clean_position_info_list_at_depth) 
      console.log("INFO: Selecting the first (best) one: "+clean_position_info_list_at_depth[0].pv) 

      return clean_position_info_list_at_depth[0];
}


