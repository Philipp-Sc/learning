import React, { useState, useEffect, useRef } from 'react';
import './ExploreContainer.css'; 
import ModalChessMetaContent from './ModalChessMetaContent';
import ChessMetaContent from './ChessMetaContent';
import { IonBadge, IonActionSheet} from '@ionic/react';
import { book, bookOutline } from 'ionicons/icons';
 
import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";

import * as chess_meta from "../js/chess-meta.js"
import * as chess_stats from "../js/chess-stats.js"
import * as chess_engine from "../js/chess-engine.js" 
import * as chess_trainer from "../js/chess-trainer.js" 


const Chess = require("chess.js");
const EloRating = require('elo-rating');
 
const AppContainer: React.FC = () => {

  const create_aggregated_data_development_option = false;

  var skill_profile : { avg: number, median: number, dist: number[] }[]  = []; 

  const max_depth = 20;
  const max_elo = 2500;
  const min_elo = 2200;
  const opening_move_duration = 5;

  const depth_for_database = 20;

  const player_game_data = JSON.parse(window.localStorage.getItem("player_game_data") || "{}");
  const new_player_data : string[] = [];

  interface StockfishInfoOut { 
    depth: number;
    multipv: number; 
    cp: number; 
    pv: string; 
    info: string;
    timestamp: number;
    move: number ;
  }

  const stockfishOutList : StockfishInfoOut[]  = [];
  const stockfishOut2DList : StockfishInfoOut[][]  = [];
  const stockfishInfoOutDefault : StockfishInfoOut = {depth: NaN, multipv: NaN, cp: NaN, pv: "", info:"",timestamp:NaN,move:NaN};
  
  const default_movePerformance : { average_eval: number, median_eval:number} = { average_eval: NaN,median_eval: NaN};
  var position_info_list_at_depth: StockfishInfoOut[] = [];

  var live_rating_depth = 20;
  var liveStockfishInfoOutList: StockfishInfoOut[] = [];
  
  const [chess] = useState<ChessInstance>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );

  const [fen, setFen] = useState(chess.fen());
  const refFen = useRef(fen);


  const [player_pgn_db,set_player_pgn_db] = useState(player_game_data.pgn_db || new_player_data);
  const player_pgn_db_ref = useRef(player_pgn_db);

  const [player_pgn_analysis,set_player_pgn_analysis] = useState(player_game_data.pgn_analysis || stockfishOut2DList);
  const player_pgn_analysis_ref = useRef(player_pgn_analysis);


  const [moveTimestamp, setMoveTimestamp] = useState(new Date().getTime());

  const [playerElo, setPlayerElo] = useState(parseInt(window.localStorage.getItem("playerElo") || "1500"));
  // analyse the players profile, compare with other profiles to set elo. ELO based on cp!
  const [playerColor, setPlayerColor] = useState('w');


  const [halfMoves, setHalfMoves] = useState(0);
  const refHalfMoves = useRef(halfMoves);


  const [gameCount, setGameCount] = useState(parseInt(window.localStorage.getItem("gameCount") || "0"));

  const [stockfishInfoOutEvaluation, setStockfishInfoOutEvaluation] = useState(stockfishInfoOutDefault);
  const stockfishInfoOutEvaluationRef = useRef(stockfishInfoOutEvaluation);

  const [stockfishOutHistory, setStockfishInfoOutHistory] = useState(stockfishOutList);
  const refStockfishInfoOutHistory = useRef(stockfishOutHistory); 

  const [depth, setDepth] = useState(1);
  const refDepth = useRef(depth);

  const [elo, setElo] = useState(min_elo);
  const refElo = useRef(elo);

  const [useBook, setUseBook] = useState(false);
  const refBook = useRef(useBook);  

  const [isDraggable,setIsDraggable] = useState(true);
  const refIsDraggable = useRef(isDraggable);

  const [highlightAnalysis,setHighlightAnalysis] = useState(true);
  const [avgPerf,setAvgPerf] = useState(true);
  const [medianPerf,setMedianPerf] = useState(true);


  const [pieceUpdated,setPieceUpdated] = useState(false);
  const [pieceClicked,setPieceClicked] = useState("wQ");
  const refPieceClicked = useRef(pieceClicked);
  const [squareClicked,setSquareClicked] = useState("d1");
  const refSquareClicked = useRef(squareClicked);

  const [engineBlunderTolerance, setEngineBlunderTolerance] = useState(7);
  // positions worese or equal (for the player) than engineBlunderTolerance the engine will punish
  const refEngineBlunderTolerance = useRef(engineBlunderTolerance);  

  const [multipv, setMultipv] = useState(1);
  const refMultipv = useRef(multipv);

  const [moveReady, setMoveReady] = useState(false);
  const refMoveReady = useRef(moveReady); 

  const [secToWait, setSecToWait] = useState(0);
  const refSecToWait = useRef(secToWait); 

  const [manualEngineStop, setManualEngineStop] = useState(false);
  const refManualEngineStop = useRef(manualEngineStop);

  const [engineOn, setEngineOn] = useState(false);
  const refEngineOn = useRef(engineOn);

  const [engineOnPrevMove, setEngineOnPrevMove] = useState(0);
  const refEngineOnPrevMove = useRef(engineOnPrevMove);
 
  const [engineNewGame, setEngineNewGame] = useState(false);
  const refEngineNewGame = useRef(engineNewGame);

  const [boardWidth, setBoardWidth] = useState(window.innerWidth);
  const refBoardWidth = useRef(boardWidth);

  const [movePerformance, setMovePerformance] = useState(default_movePerformance);
  const refMovePerformance = useRef(movePerformance);

  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);

// app chess logic
  const game_over = (resign=false) => {
    setGameCount(gameCount+1);
    if(chess.game_over() || resign){
      chess_meta.save_game({pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current},refStockfishInfoOutHistory.current,chess,playerColor,playerElo,refElo.current,refDepth.current,resign)
      var playerWin = (chess.in_checkmate() && chess.turn()==playerColor) || resign ? 0 : (chess.in_draw() ? 0.5 : 1);
      var result = EloRating.calculate(playerElo, playerElo, playerWin==1,50-playerWin);
      setPlayerElo(result.playerRating)
      if((chess.in_checkmate() && chess.turn()==playerColor) || resign){   
        if(min_elo==refElo.current){
          if(1==refDepth.current){
          }else{
            setElo(max_elo);
            refElo.current=max_elo;
            setDepth(depth-1);
            refDepth.current=refDepth.current-1;
          }
        }else{
          setElo(elo-100);
          refElo.current=refElo.current-100;
        } 
      }else if(!chess.in_draw()){    
        if(max_elo==refElo.current){
          if(max_depth==refDepth.current){
          }else{
            setElo(min_elo);
            refElo.current=min_elo;
            setDepth(depth+1);
            refDepth.current=refDepth.current+1;
          }
        }else{
          setElo(elo+100);
          refElo.current=refElo.current+100
        } 
      }
    } 

  }

  const handleMove = (move: ShortMove) => {
    if (chess.move(move)) {
      setFen(chess.fen());   
      refFen.current=chess.fen();

      document.dispatchEvent(new Event('move_executed'))   
      engine_turn();
    }
  }; 

  const engine_turn = () => {
    console.log("engine_turn");
    if (!chess.game_over()) {
        var sec = Math.floor(Math.min(new Date().getTime()-moveTimestamp,5*60*1000)/1000);
        setSecToWait(sec);
        refSecToWait.current = sec;
        if(refEngineOn.current){
          document.dispatchEvent(new Event('transition_engine_to_next_position')) 
        }else{
          start_engine();
        }
      }else{
        game_over();
        setTimeout(() => {
                document.dispatchEvent(new Event('new_game'))
        }, 0);
      }
  }

  const applyMove = (move) => { 
    chess.move(move, { sloppy: true })
    document.dispatchEvent(new Event('move_executed'))  
    setFen(chess.fen()); 
    refFen.current=chess.fen();
    setMoveTimestamp(new Date().getTime()); 
    if (chess.game_over()) {  
      game_over(); 
      setTimeout(() => {
              document.dispatchEvent(new Event('new_game'))
      }, 0);
      return;
    }
    console.log("player_turn")
  };
  
  const move_ready = async() => { 
    if(refSecToWait.current>0){
      setTimeout(() => {move_ready();},1000);
      return;
    }
    setTimeout(async() => {

      const engineMove = await chess_trainer.selectEngineMove(opening_move_duration,refHalfMoves.current,chess,refElo.current,playerColor,depth_for_database, refBook.current,
                          position_info_list_at_depth,refStockfishInfoOutHistory.current,
                          refEngineBlunderTolerance.current,
                          skill_profile);
      console.log(engineMove)
      setStockfishInfoOutEvaluation(engineMove)
      stockfishInfoOutEvaluationRef.current=engineMove;
      applyMove(engineMove.pv) 
      setMoveReady(false)
      refMoveReady.current=false; 

    },0);
  
  };

  const move_executed = () => {  
    setHalfMoves(count => count +1);
    refHalfMoves.current=refHalfMoves.current+1;
    console.log("halfMoves: "+refHalfMoves.current); 
    if(!refEngineOn.current){ 
      setEngineOnPrevMove(refHalfMoves.current);
      refEngineOnPrevMove.current = refHalfMoves.current;
    }

    var aggMovePerformance = chess_meta.historicPerformanceAtMoveNumber(refHalfMoves.current,{pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current});
    setMovePerformance(aggMovePerformance);
    refMovePerformance.current = aggMovePerformance;

    };

  const new_game = () => { 
    if(refEngineOn.current){
      console.log("stop engine before new game")
      setEngineNewGame(true);
      refEngineNewGame.current=true;
      // @ts-ignore
      window.stockfish.postMessage("stop");
    }
    setHalfMoves(0);
    refHalfMoves.current=0;
    console.log("halfMoves: "+refHalfMoves.current);
    chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    var temp = chess.fen();
    setFen(temp); 
    refFen.current=temp;
    setStockfishInfoOutEvaluation(stockfishInfoOutDefault)
    stockfishInfoOutEvaluationRef.current = stockfishInfoOutDefault; 

    setStockfishInfoOutHistory(stockfishOutList);
    refStockfishInfoOutHistory.current=stockfishOutList;
    setMoveTimestamp(new Date().getTime());
    };    

  const transition_engine_to_next_position = (new_game) => {
    if(refEngineOn.current){
      if(new_game){
      console.log("engine stop!");
      // @ts-ignore
      window.stockfish.postMessage("stop");
      return;
      }
      console.log("engine transitioning to next position!");
      setManualEngineStop(true);
      refManualEngineStop.current=true;
      // @ts-ignore
      window.stockfish.postMessage("stop");
    }else{
      console.log("engine not running!")
    }
  }

  const start_engine = () => {
    setTimeout(() => {
     // set new game position
     // @ts-ignore
     window.stockfish.postMessage("position fen " + refFen.current);  
     var temp = Math.min(Math.max(Math.min(5,chess.moves().length),Math.floor(chess.moves().length/2)),15);
     setMultipv(temp)
     refMultipv.current = temp;
     // @ts-ignore
     window.stockfish.postMessage('setoption name MultiPV value '+temp) // take 1/2 of possible moves
     // start search
     // @ts-ignore
     window.stockfish.postMessage("go depth "+live_rating_depth);
     setEngineOn(true);
     refEngineOn.current=true;
   },500)
  }
  const show_piece_stats = (piece) => { 
      setPieceClicked(piece);
      refPieceClicked.current=piece;
      setPieceUpdated(true);  
  }
  const show_piece_stats_square = (square) => {
    if(!refIsDraggable.current){
      setSquareClicked(square);
      refSquareClicked.current=square; 
    }
  }

const highlightSquares = (stockfishInfoOutHistory, chess) => {
      var board = {
        columns: ["a", "b", "c", "d", "e", "f", "g", "h"],
        rows: [8, 7, 6, 5, 4, 3, 2, 1]
      };
      var allSquares = board.columns.reduce(
        (prev, next) => [...prev, ...board.rows.map(x => next + x)],
        []
      );
      var squares = allSquares.map((e) => {var o = {};var v={backgroundColor: undefined}; o[e]=v; return o}).reduce(function(result, item) {
        var key = Object.keys(item)[0]; 
        result[key] = item[key];
        return result;
      }, {});
 
      if(highlightAnalysis && stockfishInfoOutHistory.length>=1){
        var a = (stockfishInfoOutHistory[stockfishInfoOutHistory.length-1] || {cp: NaN}).cp/100;
        var move = chess.history({ verbose: true })[stockfishInfoOutHistory.length-1];
        if(move){ 
          squares[move.to].backgroundColor = 'rgba('+(a*-1>=0 ? 0 : 255)+','+(a*-1>=0 ? 255 : 0)+',0,'+(Math.min(1,Math.abs(a)))+')'
        }
      } 
      return squares;
}

const highlightBoard = (movePerformance) => {

  var a = avgPerf ? movePerformance.average_eval :  movePerformance.median_eval;

  if(medianPerf && avgPerf){
    a = (a+movePerformance.median_eval)/2
  }else if(!medianPerf && !avgPerf){
    a = 0;
  }

  return {
          marginBottom: '30px',
          borderRadius: '5px',
          boxShadow: `0 10px 30px `+'rgba('+(a*-1>=0 ? 0 : 255)+','+(a*-1>=0 ? 255 : 0)+',0,'+(Math.min(1,Math.abs(a)))+')'
        }

}
 
 useEffect(() => { 

    window.addEventListener('resize',() => {setTimeout(() => {setBoardWidth(window.innerWidth); refBoardWidth.current=window.innerWidth;},500)});

    document.addEventListener("transition_engine_to_next_position", transition_engine_to_next_position.bind(null,false));
    document.addEventListener("move_ready", move_ready);
    document.addEventListener("move_executed", move_executed);
    document.addEventListener("new_game", new_game);

    function messageListener(line) {
      if(line.split(" ")[0]=="info"){
        if(line.split(" ")[1]=="depth" && line.split(" ")[3]!="currmove"){
          var info = {
                "depth": parseInt(line.split(" ")[2]),
                "multipv": parseInt(line.split(" multipv ")[1].split(" ")[0]),
                "cp": line.includes("mate") ? 999 * parseInt(line.split(" mate ")[1].split(" ")[0]) : parseInt(line.split(" cp ")[1].split(" ")[0]),
                "pv": line.split(" pv ")[1].split(" ")[0],
                "info": line,
                "timestamp": new Date().getTime(),
                "move":  refEngineOnPrevMove.current
              }  
          if(""+refDepth.current==""+line.split(" ")[2]){ // only for the engine player @depth
             position_info_list_at_depth[parseInt(line.split(" multipv ")[1].split(" ")[0])-1] = info;
          }
          liveStockfishInfoOutList[parseInt(line.split(" multipv ")[1].split(" ")[0])-1] = info; 
          // overrides entries with updated depth
          
          refStockfishInfoOutHistory.current[liveStockfishInfoOutList[0].move-1]=liveStockfishInfoOutList[0]; // -1 because the evaluation revers to the prev position
          
          if(refMoveReady.current==false && position_info_list_at_depth.filter(e => e.move==refHalfMoves.current).length==refMultipv.current){
            console.log("move_ready event")
            setMoveReady(true)
            refMoveReady.current=true; 
            document.dispatchEvent(new Event('move_ready')) 
          } 
          //console.log("position_info_list_at_depth added:")
          //console.log(parseInt(line.split(" multipv ")[1].split(" ")[0])-1)
          //console.log(position_info_list_at_depth[parseInt(line.split(" multipv ")[1].split(" ")[0])-1]) 
        }         
      }
      //console.log(line)
      if(line.split(" ")[0]=="bestmove"){
        console.log(line)
        setEngineOn(false);
        refEngineOn.current=false;  
        //console.log(line.split(" ")[1])
        //applyMove(line.split(" ")[1])
      }
    }

    console.log(window.sf_version);

    chess_engine.startEngine(messageListener);

    }, []);  

  useEffect(() => {   
    if(pieceUpdated){
      setShowActionSheet(true);
      setPieceUpdated(false);
    } 
    // set popup
    }, [pieceUpdated]);  

  useEffect(() => { 
    window.localStorage.setItem("playerElo",""+playerElo);
    window.localStorage.setItem("gameCount",""+gameCount);
    }, [playerElo, gameCount]);  
 
  useEffect(() => {  
    if(refSecToWait.current>0){
      setTimeout(() => {setSecToWait(Math.max(0,refSecToWait.current-1));refSecToWait.current=Math.max(0,refSecToWait.current-1);},1000);
    }
    }, [secToWait]);  
 
  useEffect(() => {  
    if(refEngineOn.current){
      console.log("engine started!")
    }else{ 
        console.log("engine shutdown!")
        if(refEngineOnPrevMove.current!=refHalfMoves.current){
          setEngineOnPrevMove(refHalfMoves.current);
          refEngineOnPrevMove.current = refHalfMoves.current;
        }
        if(refManualEngineStop.current==true){ 
           console.log("(preparing for the new position)")
          // if engine is stopped because it was searching for the previous position 
           setManualEngineStop(false);
           refManualEngineStop.current=false;
          // now is searching the current position
           start_engine();
        }else if (refManualEngineStop.current==false && (refStockfishInfoOutHistory.current[refStockfishInfoOutHistory.current.length-1] || {depth: NaN}).depth==live_rating_depth){
          // engine finished because it found the best move
            console.log("(finished search)")   
        }else if(refEngineNewGame.current==true){
           setEngineNewGame(false);
           refEngineNewGame.current=false;
           // @ts-ignore
           window.stockfish.postMessage("ucinewgame");
        }
    }
    }, [engineOn]);  
 
   useEffect(async() => { 
      // using pre computed skill profile
      skill_profile = chess_meta.skill_profiles[refElo.current] 

      if(create_aggregated_data_development_option){
        // create skill profile 
        skill_profile = await chess_stats.getSkillProfile(refElo.current,depth_for_database)
        console.log(JSON.stringify(skill_profile)) 
        // create game (best-play) statistics
        chess_stats.getGameStatistics("w")
        chess_stats.getGameStatistics("b")
      }
      }, [elo]);  

   const toggle_engine_tolerance = () => {
    if(refEngineBlunderTolerance.current==10){
      setEngineBlunderTolerance(0);
      refEngineBlunderTolerance.current=0;
    }else{
      setEngineBlunderTolerance(refEngineBlunderTolerance.current+1);
      refEngineBlunderTolerance.current=refEngineBlunderTolerance.current+1;
     }
   }
  
  return (
    <div className="container" id="app">
      <br/>
      <IonBadge onClick={() => {setElo(elo+100);refElo.current=refElo.current+100; if(refElo.current>max_elo){setElo(min_elo);refElo.current=min_elo;} }}>@profile {elo}</IonBadge>
      <IonBadge onClick={() => {setDepth(depth+1);refDepth.current=refDepth.current+1; if(refDepth.current==max_depth){setDepth(1);refDepth.current=1;} }}>@depth {depth}</IonBadge>
      <IonBadge onClick={() => {setUseBook(prev => !prev);refBook.current = !refBook.current;}}>@{useBook ? "custom_book" : "no_book"}</IonBadge>
      <IonBadge onClick={() => {toggle_engine_tolerance()}}>@{"mistake_tolerance "+refEngineBlunderTolerance.current/10}</IonBadge>
      
      <IonBadge>{refSecToWait.current}</IonBadge>


      <Chessboard
        squareStyles={highlightSquares(refStockfishInfoOutHistory.current,chess)}
        boardStyle={highlightBoard(refMovePerformance.current)}
        showNotation={true}
        width={refBoardWidth.current} 
        position={refFen.current}
        orientation={playerColor=='w' ? 'white' : 'black'}
        onDrop={(move) =>
          handleMove({
            from: move.sourceSquare,
            to: move.targetSquare,
            promotion: "q",
          })
        }
        draggable={refIsDraggable.current}
        onPieceClick={show_piece_stats}
        onSquareClick={show_piece_stats_square}
      />
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        cssClass='my-custom-class'
        buttons={
        chess_meta.pieceLookup[refPieceClicked.current.split("")[1]].map((e,i) => {
          return { 
           text: e.length==1 ? e.replace("P","")+refSquareClicked.current : e,
           icon: refPieceClicked.current.split("")[0]=='w' ? book : bookOutline,
           handler: () => { 
            setModalIndex(i);
            setShowModal(true);
           }
          }
        })
      }>
      </IonActionSheet> 
      <ModalChessMetaContent 
          halfMoves={refHalfMoves.current}
          playerColor={playerColor}
          pieceClicked={refPieceClicked.current}
          squareClicked={refSquareClicked.current}
          modalIndex={modalIndex}
          showModal={showModal}
          setShowModal={setShowModal}/>

      <IonBadge>Games: {gameCount}</IonBadge>
      <IonBadge>Halfmoves: {refHalfMoves.current}</IonBadge>
      <br/>
      <IonBadge onClick={() => {transition_engine_to_next_position(true);setTimeout(() => {game_over(true);document.dispatchEvent(new Event('new_game'));},500);}}>Resign!</IonBadge>

      <IonBadge onClick={() => {setSecToWait(0);refSecToWait.current=0;}} >Force move!</IonBadge>
      <IonBadge onClick={() => {if(refSecToWait.current==0){setPlayerColor(color => color=='w' ? 'b' : 'w');if(playerColor=='w' || refHalfMoves.current>0){engine_turn();}}}}>Switch sides!</IonBadge>
      <br/><br/>

      <ChessMetaContent 
          halfMoves={refHalfMoves.current}
          playerColor={playerColor}
          movePerformance={refMovePerformance.current}
          live={{
            evaluation: (refStockfishInfoOutHistory.current[refStockfishInfoOutHistory.current.length-1] || {cp: NaN}).cp/100,
            depth: (refStockfishInfoOutHistory.current[refStockfishInfoOutHistory.current.length-1] || {depth:NaN}).depth}}
          evaluation={{evaluation: stockfishInfoOutEvaluationRef.current.cp/100,depth: stockfishInfoOutEvaluationRef.current.depth}}
          highlightAnalysis={highlightAnalysis}
          setHighlightAnalysis={setHighlightAnalysis}
          avgPerf={avgPerf}
          setAvgPerf={setAvgPerf}
          medianPerf={medianPerf}
          setMedianPerf={setMedianPerf}
      />

      <IonBadge>Import PGN</IonBadge>
      <IonBadge>Export PGN</IonBadge><br/><br/><br/><br/><br/><br/>
    </div>
  );
}; 

export default AppContainer;