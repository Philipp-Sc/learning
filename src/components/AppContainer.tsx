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
import * as lichess_api from "../js/lichess-api.js" 
import * as chess_board_utils from "../js/chess-board-utils.js" 
import {AdjustingInterval} from "../js/utilities.js"



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

  const [liveRatingDepth,setLiveRatingDepth] = useState(20); 
  
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
  const [latestWin, setLatestWin] = useState((window.localStorage.getItem("latestWin") || "No data available."));

  const [stockfishInfoOutEvaluation, setStockfishInfoOutEvaluation] = useState(stockfishInfoOutDefault);
  const stockfishInfoOutEvaluationRef = useRef(stockfishInfoOutEvaluation);
  // TODO change into list, to have a history here as well. Will allow us to go back

  const [stockfishOutHistory, setStockfishInfoOutHistory] = useState(stockfishOutList);
  const refStockfishInfoOutHistory = useRef(stockfishOutHistory); 

  const [depth, setDepth] = useState(1);
  const refDepth = useRef(depth);

  const [elo, setElo] = useState(min_elo);
  const refElo = useRef(elo);

  const [useBook, setUseBook] = useState(false);
  const refBook = useRef(useBook);  

  const [debug, setDebug] = useState(false); 
  const refDebug = useRef(debug);

  const [isDraggable,setIsDraggable] = useState(true);
  const refIsDraggable = useRef(isDraggable);

  const [highlightAnalysis,setHighlightAnalysis] = useState(true);
  const [highlightEngine,setHighlightEngine] = useState(true);
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

  const [boardWidth, setBoardWidth] = useState(Math.min(700,window.innerWidth));
  const refBoardWidth = useRef(boardWidth);

  const [movePerformance, setMovePerformance] = useState(default_movePerformance);
  const refMovePerformance = useRef(movePerformance);

  const [notificationOut,setNotificationOut] = useState([]);
  const refNotificationOut = useRef(notificationOut);

  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);

// put into objects. to reduce size of passing!

// app chess logic

  const takeBackMove = async() => {
      if(refHalfMoves.current<=0){
        return;
      } 
      if(refEngineOn.current==false || (refEngineOn.current && refEngineOnPrevMove.current!=refHalfMoves.current)){ 
        if(refEngineOn.current && refEngineOnPrevMove.current!=refHalfMoves.current){
          // @ts-ignore
          window.stockfish.postMessage("stop");
        }
        chess.undo();
        chess.undo();

        refFen.current=chess.fen();
        setFen(refFen.current);   

        refHalfMoves.current = refHalfMoves.current - 2;
        setHalfMoves(refHalfMoves.current)

        setTimeout(() => {
        chess_stats.getNotification(chess,playerColor,refHalfMoves.current).then(result => {
            refNotificationOut.current = result;
            setNotificationOut(refNotificationOut.current)
          }) 
        },0)

        refMovePerformance.current = chess_meta.historicPerformanceAtMoveNumber(refHalfMoves.current,{pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current});
        setMovePerformance(refMovePerformance.current);

      }else { 
      if(refSecToWait.current > 0){
        refSecToWait.current = 0;
        setSecToWait(refSecToWait.current);
      }
      setTimeout(takeBackMove,300)
    }
  }

  const game_over = (resign=false) => {
    setGameCount(gameCount+1);
    if(chess.game_over() || resign){
      chess_meta.save_game({pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current},refStockfishInfoOutHistory.current,chess,playerColor,playerElo,refElo.current,refDepth.current,resign)
      var playerWin = (chess.in_checkmate() && chess.turn()==playerColor) || resign ? 0 : (chess.in_draw() ? 0.5 : 1);
      if(playerWin==1){
        setLatestWin("@profile "+elo+" @depth "+depth);
      }
      var result = EloRating.calculate(playerElo, playerElo, playerWin==1,50);
      setPlayerElo(result.playerRating) 
    } 
  }

  const handleMove = async(move: ShortMove) => {
    if (chess.move(move)) {
        refFen.current=chess.fen();
        setFen(refFen.current);   

        chess_stats.getNotification(chess,playerColor,refHalfMoves.current).then(result => {
            refNotificationOut.current = result;
            setNotificationOut(refNotificationOut.current)
          })  

        document.dispatchEvent(new Event('move_executed'))   
        engine_turn();
    }
  }; 

  const engine_turn = () => {
    if(refDebug.current) console.log("engine_turn");
    if (!chess.game_over()) {
        var sec = Math.floor(Math.min(new Date().getTime()-moveTimestamp,5*60*1000)/1000);
        refSecToWait.current = sec;
        setSecToWait(sec);
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
    refFen.current=chess.fen();
    setFen(refFen.current); 
    setMoveTimestamp(new Date().getTime()); 
    if (chess.game_over()) {  
      game_over(); 
      setTimeout(() => {
              document.dispatchEvent(new Event('new_game'))
      }, 0);
      return;
    }
    if(refDebug.current) console.log("player_turn")
  };
  
  const move_ready = async() => { 
    if(refSecToWait.current>0){
      setTimeout(() => {move_ready();},1000);
      return;
    }
    
      const engineMove = await chess_trainer.selectEngineMove(opening_move_duration,refHalfMoves.current,chess,refElo.current,playerColor,depth_for_database, refBook.current,
                          position_info_list_at_depth,refStockfishInfoOutHistory.current,
                          refEngineBlunderTolerance.current,
                          skill_profile,
                          refDebug.current);
      if(refDebug.current) console.log(engineMove)
      if(engineMove){
        stockfishInfoOutEvaluationRef.current=engineMove;
        setStockfishInfoOutEvaluation(engineMove)
        applyMove(engineMove.pv) 
      }else{

      }

      refMoveReady.current=false; 
      setMoveReady(false)
  
  };

  const move_executed = () => {  
    refHalfMoves.current=refHalfMoves.current+1;
    setHalfMoves(count => count +1);
    if(refDebug.current) console.log("halfMoves: "+refHalfMoves.current); 
    if(!refEngineOn.current){ 
      refEngineOnPrevMove.current = refHalfMoves.current;
      setEngineOnPrevMove(refHalfMoves.current);
    }

    var aggMovePerformance = chess_meta.historicPerformanceAtMoveNumber(refHalfMoves.current,{pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current});
    setMovePerformance(aggMovePerformance);
    refMovePerformance.current = aggMovePerformance;

    };

  const new_game = () => { 
    if(refEngineOn.current){
      if(refDebug.current) console.log("stop engine before new game")
      setEngineNewGame(true);
      refEngineNewGame.current=true;
      // @ts-ignore
      window.stockfish.postMessage("stop");
    }
    setHalfMoves(0);
    refHalfMoves.current=0;
    if(refDebug.current) console.log("halfMoves: "+refHalfMoves.current);
    chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    var temp = chess.fen();
    refFen.current=temp;
    setFen(temp); 

    stockfishInfoOutEvaluationRef.current = {depth: NaN, multipv: NaN, cp: NaN, pv: "", info:"",timestamp:NaN,move:NaN}; 
    setStockfishInfoOutEvaluation(stockfishInfoOutEvaluationRef.current)
 
    refStockfishInfoOutHistory.current = []; 
    setStockfishInfoOutHistory(refStockfishInfoOutHistory.current);


    var temp1 = { average_eval: NaN,median_eval: NaN};
    refMovePerformance.current = temp1;
    setMovePerformance(temp1);

    setMoveTimestamp(new Date().getTime());
    };    

  const transition_engine_to_next_position = (new_game) => {
    if(refEngineOn.current){
      if(new_game){
      if(refDebug.current) console.log("engine stop!");
      // @ts-ignore
      window.stockfish.postMessage("stop");
      return;
      }
      if(refDebug.current) console.log("engine transitioning to next position!");
      refManualEngineStop.current=true;
      setManualEngineStop(true);
      // @ts-ignore
      window.stockfish.postMessage("stop");
    }else{
      if(refDebug.current) console.log("engine not running!")
    }
  }

  const start_engine = () => {
    setTimeout(() => {
     // set new game position
     // @ts-ignore
     window.stockfish.postMessage("position fen " + refFen.current);  
     var temp = Math.min(Math.max(Math.min(5,chess.moves().length),Math.floor(chess.moves().length/2)),15);
     refMultipv.current = temp;
     setMultipv(temp)
     // @ts-ignore
     window.stockfish.postMessage('setoption name MultiPV value '+temp) // take 1/2 of possible moves
     // start search
     // @ts-ignore
     window.stockfish.postMessage("go depth "+Math.max(depth,liveRatingDepth));
     refEngineOn.current=true;
     setEngineOn(true);
   },500)
  }
  const show_piece_stats = (piece) => { 
      refPieceClicked.current=piece;
      setPieceClicked(piece);
      setPieceUpdated(true);  
  }
  const show_piece_stats_square = (square) => {
    if(!refIsDraggable.current){
      refSquareClicked.current=square; 
      setSquareClicked(square);
    }
  }
 
 useEffect(() => { 
    window.addEventListener('resize',() => {setTimeout(() => {refBoardWidth.current=Math.min(700,window.innerWidth);setBoardWidth(refBoardWidth.current); },500)});
    
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
          if(refDepth.current==info.depth){ // only for the engine player @depth
             position_info_list_at_depth[info.multipv-1] = info;
          }  
          if(info.multipv-1==0){
            // get the best move
            refStockfishInfoOutHistory.current[info.move-1]=info; // -1 because the evaluation revers to the prev position
            // tell react to trigger a re-render on all components that use this useState. 
            setStockfishInfoOutHistory([...refStockfishInfoOutHistory.current]); 
          }

          if(refMoveReady.current==false && position_info_list_at_depth.filter(e => e.move==refHalfMoves.current).length==refMultipv.current){
            if(refDebug.current) console.log("move_ready event")
            refMoveReady.current=true; 
            setMoveReady(true)
            document.dispatchEvent(new Event('move_ready')) 
          }  
        }         
      } 
      if(line.split(" ")[0]=="bestmove"){
        if(refDebug.current) console.log(line)
        refEngineOn.current=false;   
        setEngineOn(false);
      }
    }
    chess_engine.startEngine(messageListener);
    }, []);  

  useEffect(() => {   
    if(pieceUpdated){
      setShowActionSheet(true);
      setPieceUpdated(false);
    }  
    }, [pieceUpdated]);  

  useEffect(() => { 
    window.localStorage.setItem("playerElo",""+playerElo);
    window.localStorage.setItem("gameCount",""+gameCount);
    window.localStorage.setItem("latestWin",""+latestWin);
    }, [playerElo, gameCount,latestWin]);  
 
  useEffect(() => {  
    if(refSecToWait.current>0){
      if(window.ticker){
        // continue
      }else{
        // start
        window.ticker = new AdjustingInterval(() => {refSecToWait.current=Math.max(0,refSecToWait.current-1);setSecToWait(refSecToWait.current);},1000)
        window.ticker.start();
      }
    }else if(refSecToWait.current<=0 && window.ticker){
      // stop
      window.ticker.stop();
      window.ticker=undefined;
    }
    }, [secToWait]);  
 
  useEffect(() => {  
    if(refEngineOn.current){
      if(refDebug.current) console.log("engine started!")
    }else{ 
        if(refDebug.current) console.log("engine shutdown!")
        if(refEngineOnPrevMove.current!=refHalfMoves.current){
          refEngineOnPrevMove.current = refHalfMoves.current;
          setEngineOnPrevMove(refHalfMoves.current);
        }
        if(refManualEngineStop.current==true){ 
           if(refDebug.current) console.log("(preparing for the new position)")
          // if engine is stopped because it was searching for the previous position 
           refManualEngineStop.current=false;
           setManualEngineStop(false);
          // now is searching the current position
           start_engine();
        }else if (refManualEngineStop.current==false && (refStockfishInfoOutHistory.current[refStockfishInfoOutHistory.current.length-1] || {depth: NaN}).depth==Math.max(depth,liveRatingDepth)){
          // engine finished because it found the best move
            if(refDebug.current) console.log("(finished search)")   
        }else if(refEngineNewGame.current==true){
           refEngineNewGame.current=false;
           setEngineNewGame(false);
           // @ts-ignore
           window.stockfish.postMessage("ucinewgame");
        }
    }
    }, [engineOn]);  
 
   useEffect(() => { 

      async function doTask() {

      // using pre computed skill profile
      skill_profile = chess_meta.skill_profiles[refElo.current] 


      await chess_stats.load_my_model({isProduction: true}); 

      
      //console.log(await chess_stats.test_model());

      

      if(create_aggregated_data_development_option){
        
        window.export_current_model = chess_stats.export_my_model;

        // once needed every time the feature vector or model definition are changed.
        //await chess_stats.build_my_model();
 

        // retrain the model & new importance
        // await chess_stats.train_my_model(); 



        var rebuild_prod_prerequisites = false;
        if(rebuild_prod_prerequisites){

          // once needed every time the feature vector or model definition are changed.
          // also new importance
          //await chess_stats.build_my_model();
  
          chess_stats.calculate_average_position_vector_list("engine")
          chess_stats.calculate_average_position_vector_list("human") 

          skill_profile = await chess_stats.getSkillProfile(refElo.current,depth_for_database)
          console.log(JSON.stringify(skill_profile))  
        }
      }
    }
    doTask();
      }, [elo]);  

   const toggle_engine_tolerance = () => {
    if(refEngineBlunderTolerance.current==10){
      refEngineBlunderTolerance.current=0;
      setEngineBlunderTolerance(0);
    }else{
      refEngineBlunderTolerance.current=refEngineBlunderTolerance.current+1;
      setEngineBlunderTolerance(refEngineBlunderTolerance.current+1);
     }
   }
  
  return (
    <div className="container" id="app">
      <div style={{marginTop:'10px', paddingRight: '30px'}}> 
      <IonBadge>Elo: {playerElo}</IonBadge> 
      <IonBadge>Latest win: {latestWin}</IonBadge> 
      <br/>
      <IonBadge onClick={() => {setElo(elo+100);refElo.current=refElo.current+100; if(refElo.current>max_elo){setElo(min_elo);refElo.current=min_elo;} }}>@profile {elo}</IonBadge>
      <IonBadge onClick={() => {setDepth(depth+1);refDepth.current=refDepth.current+1; if(refDepth.current==max_depth){setDepth(1);refDepth.current=1;}}}>@depth {depth}</IonBadge>
      <IonBadge onClick={() => {setUseBook(prev => !prev);refBook.current = !refBook.current;}}>@{useBook ? "custom_book" : "no_book"}</IonBadge>
      <IonBadge onClick={() => {toggle_engine_tolerance()}}>@{"blunder_tolerance "+refEngineBlunderTolerance.current/10}</IonBadge>
      </div>

      <div style={{textAlign:'right', marginRight: '10px', marginTop: '-26px'}}>
      <IonBadge>{refSecToWait.current}</IonBadge>
      </div>
 
      <Chessboard
        squareStyles={chess_board_utils.highlightSquares(refStockfishInfoOutHistory.current,chess, highlightAnalysis, highlightEngine, refHalfMoves.current)}
        boardStyle={chess_board_utils.highlightBoard(refMovePerformance.current, avgPerf, medianPerf)}
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
      <IonBadge onClick={() => takeBackMove()}>Take Back Move!</IonBadge>
      <br/><br/>

      <ChessMetaContent 
          halfMoves={refHalfMoves.current}
          playerColor={playerColor} 
          movePerformance={refMovePerformance.current}
          live={{ 
            evaluation: (refStockfishInfoOutHistory.current.filter(e => e.move<=refHalfMoves.current)[refStockfishInfoOutHistory.current.filter(e => e.move<=refHalfMoves.current).length-1] || {cp: NaN}).cp/100,
            depth: (refStockfishInfoOutHistory.current.filter(e => e.move<=refHalfMoves.current)[refStockfishInfoOutHistory.current.filter(e => e.move<=refHalfMoves.current).length-1] || {depth:NaN}).depth}}
          evaluation={{evaluation: stockfishInfoOutEvaluationRef.current.cp/100,depth: stockfishInfoOutEvaluationRef.current.depth}}
          highlightAnalysis={highlightAnalysis}
          setHighlightAnalysis={setHighlightAnalysis}
          highlightEngine={highlightEngine}
          setHighlightEngine={setHighlightEngine}
          avgPerf={avgPerf}
          setAvgPerf={setAvgPerf}
          medianPerf={medianPerf}
          setMedianPerf={setMedianPerf}
          notificationOut={refNotificationOut.current}
          liveRatingDepth={liveRatingDepth}
          setLiveRatingDepth={setLiveRatingDepth}
          depth={depth}
      />
 
      <IonBadge onClick={() => {lichess_api.exportToLichess(player_pgn_db_ref.current)}}>Export Last Game To Lichess</IonBadge><br/><br/><br/><br/><br/><br/>
      <IonBadge onClick={() => {refDebug.current=!refDebug.current;setDebug(refDepth.current)}}>{refDebug.current ? "@(+)" : "@"}debug</IonBadge>
    </div>
  );
}; 

export default AppContainer;