import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './ExploreContainer.css'; 
import ModalChessMetaContent from './ModalChessMetaContent';
import ChessMetaContent from './ChessMetaContent';
import { IonBadge, IonRadioGroup, IonRadio, IonLoading, IonContent, IonItem, IonLabel, IonTextarea, IonList, IonListHeader, IonSelect, IonSelectOption, IonPage, IonItemDivider } from '@ionic/react';
import { trash, share, caretForwardCircle, heart, close, pencil, book, bookOutline } from 'ionicons/icons';

import {  IonCol } from '@ionic/react';  
import { IonModal, IonActionSheet, IonButton } from '@ionic/react';

import { useHistory } from "react-router-dom";

import Chessboard from "chessboardjsx";
import { ChessInstance, ShortMove } from "chess.js";

import * as chess_meta from "../js/chess-meta.js"
import * as chess_stats from "../js/chess-stats.js"
import * as chess_engine from "../js/chess-engine.js"

import {parser} from '@mliebelt/pgn-parser'


import firebase from "firebase/app";
// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

import { isPlatform } from '@ionic/react';

const Chess = require("chess.js");
const EloRating = require('elo-rating');



 
const AppContainer: React.FC<ContainerProps> = () => {

  const create_aggregated_data_development_option = false;

  var skill_profile : { avg: number, median: number, dist: number[] }[]  = []; 

  const max_depth = 20;
  const max_elo = 2500;
  const min_elo = 2200;
  const opening_move_duration = 5;

  const depth_for_database = 20;

  const player_game_data = JSON.parse(window.localStorage.getItem("player_game_data") || "{}");
  const new_player_data : string[] = [];

  interface StockfishOut { 
    depth: number;
    multipv: number; 
    cp: number; 
    pv: string; 
    info: string;
    timestamp: number;
    move: number ;
  }
  const stockfishOutList : StockfishOut[]  = []
  const stockfishOut2DList : StockfishOut[][]  = []
  const default_eval : { evaluation: number, depth: number} = { evaluation: 0.0, depth: 0};
  const default_movePerformance : { average_eval: number, median_eval:number} = { average_eval: NaN,median_eval: NaN};
  var position_info: { depth: number, multipv: number, cp: number, pv: string, info: string, timestamp: number, move: number, flag: string }[] = [];

  var live_rating_depth = 20;
  var liveStockfishOutList: StockfishOut[] = [];
  
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

  const [evaluation, setEvaluation] = useState(default_eval);
  const evaluationRef = useRef(evaluation);

  const [live, setLive] = useState(default_eval);
  const liveRef = useRef(live);

  const [stockfishOutHistory, setStockfishOutHistory] = useState(stockfishOutList);
  const refStockfishOutHistory = useRef(stockfishOutHistory); 

  const [depth, setDepth] = useState(1);
  const refDepth = useRef(depth);

  const [elo, setElo] = useState(min_elo);
  const refElo = useRef(elo);

  const [useBook, setUseBook] = useState(false);
  const refBook = useRef(useBook);  

  const [isDraggable,setIsDraggable] = useState(true);
  const refIsDraggable = useRef(isDraggable);

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
    if(chess.game_over() || resign){
      chess_meta.save_game({pgn_db: player_pgn_db_ref.current,pgn_analysis: player_pgn_analysis_ref.current},refStockfishOutHistory.current,chess,playerColor,playerElo,refElo.current,refDepth.current,resign)
      
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

      setStockfishOutHistory(stockfishOutList);
      refStockfishOutHistory.current=stockfishOutHistory;
      setGameCount(gameCount+1);
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
        }, 3000);
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
      }, 3000);
      return;
    }
    console.log("player_turn")
  };
  
  const live_info = () => {
    var stockfish_eval = {evaluation: (liveStockfishOutList[0].cp/100), depth: liveStockfishOutList[0].depth};
    setLive(stockfish_eval);
    liveRef.current = stockfish_eval;
    refStockfishOutHistory.current[liveStockfishOutList[0].move-1]=(liveStockfishOutList[0]); // -1 because the evaluation revers to the prev position
  };

  const move_ready = async() => { 
    if(refSecToWait.current>0){
      setTimeout(() => {move_ready();},1000);
      return;
    }
    setTimeout(async() => {

      if(opening_move_duration*2+1>=refHalfMoves.current && refBook.current){

        var humanMove = chess_meta.getMoveFromHumans(chess,refElo.current,playerColor,depth_for_database);
        setEvaluation(humanMove.engine_meter)
        evaluationRef.current=humanMove.engine_meter;
        applyMove(humanMove.move);
      }

      /*
      The opponement only plays good as long as you play decent.
      If you are behind, it will also play badly and give you a chance to come back.
      This is best for training, if the chess engine just butchers you, learning is difficult.
      */

      //console.log("position_info");   
      //console.log(position_info);    

      var limited_strength_move_pool = position_info.filter(e => e.move==refHalfMoves.current && e.multipv<=refMultipv.current);

      console.log("The following "+refMultipv.current+" moves are available: ");   
      console.log(limited_strength_move_pool);   

      if(skill_profile[refHalfMoves.current]==undefined){ // unlikely case
        console.log("skill_profile[refHalfMoves.current]==undefined") 
        console.log("for example when the game lasts many moves") 
        console.log(refHalfMoves.current)
        console.log("just taking the best move now")
      }else if(refEngineBlunderTolerance.current/10<liveRef.current.evaluation){
        console.log("you breached the mistake tolerance")
        console.log("just taking the best move now")
      }else{
        var myArray = skill_profile[refHalfMoves.current].dist;
        var randomGoal = myArray[Math.floor(Math.random()*myArray.length)];
        console.log("The following evaluation was randomly choosen from the skill profile: ")
        console.log("Random evaluation: "+randomGoal);
        console.log("Median evaluation: "+skill_profile[refHalfMoves.current].median)
        var justifiedGoal = (skill_profile[refHalfMoves.current].median + randomGoal) / 2
        console.log("Resulting adjusted evaluation: "+justifiedGoal); 
        limited_strength_move_pool = limited_strength_move_pool.filter(e => e.cp == limited_strength_move_pool.map(e => e.cp).reduce(function(prev, curr) {
          return (Math.abs(curr - (justifiedGoal)) < Math.abs(prev - (justifiedGoal)) ? curr : prev);
        }));
      }
      console.log("This leaves the following moves: ")
      console.log(limited_strength_move_pool) 
      console.log("Selecting the first (best) one: "+limited_strength_move_pool[0].pv)
      var engine_meter = { evaluation: (limited_strength_move_pool[0].cp/100), depth: refDepth.current};
      setEvaluation(engine_meter)
      evaluationRef.current=engine_meter;
      applyMove(limited_strength_move_pool[0].pv) 
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
    setEvaluation(default_eval)
    evaluationRef.current = default_eval;
    setLive(default_eval)
    liveRef.current = default_eval;
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
 
 useEffect(() => { 

    window.addEventListener('resize',() => {setTimeout(() => {setBoardWidth(window.innerWidth); refBoardWidth.current=window.innerWidth;},500)});

    document.addEventListener("transition_engine_to_next_position", transition_engine_to_next_position.bind(null,false));
    document.addEventListener("move_ready", move_ready);
    document.addEventListener("move_executed", move_executed);
    document.addEventListener("new_game", new_game);
    document.addEventListener("live_info", live_info); 

    function messageListener(line) {
      if(line.split(" ")[0]=="info"){
        if(line.split(" ")[1]=="depth" && line.split(" ")[3]!="currmove"){
          if(""+refDepth.current==""+line.split(" ")[2]){ // only for then engine player @depth
             position_info[parseInt(line.split(" multipv ")[1].split(" ")[0])-1] = {
                "depth": parseInt(line.split(" ")[2]),
                "multipv": parseInt(line.split(" multipv ")[1].split(" ")[0]),
                "cp": line.includes("mate") ? 999 * parseInt(line.split(" mate ")[1].split(" ")[0]) : parseInt(line.split(" cp ")[1].split(" ")[0]),
                "pv": line.split(" pv ")[1].split(" ")[0],
                "info": line,
                "timestamp": new Date().getTime(),
                "move": refHalfMoves.current,
                "flag" : "new"
              }
          }
          liveStockfishOutList[parseInt(line.split(" multipv ")[1].split(" ")[0])-1] = {
                "depth": parseInt(line.split(" ")[2]),
                "multipv": parseInt(line.split(" multipv ")[1].split(" ")[0]),
                "cp": line.includes("mate") ? 999 * parseInt(line.split(" mate ")[1].split(" ")[0]) : parseInt(line.split(" cp ")[1].split(" ")[0]),
                "pv": line.split(" pv ")[1].split(" ")[0],
                "info": line,
                "timestamp": new Date().getTime(),
                "move":  refEngineOnPrevMove.current
              }  
          document.dispatchEvent(new Event('live_info')) 
          if(refMoveReady.current==false && position_info.filter(e => e.move==refHalfMoves.current).length==refMultipv.current){
            console.log("move_ready event")
            setMoveReady(true)
            refMoveReady.current=true; 
            document.dispatchEvent(new Event('move_ready')) 
          } 
          //console.log("position_info added:")
          //console.log(parseInt(line.split(" multipv ")[1].split(" ")[0])-1)
          //console.log(position_info[parseInt(line.split(" multipv ")[1].split(" ")[0])-1]) 
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

    const initEngine = () => {
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
        window.stockfish.postMessage('setoption name MultiPV value '+refMultipv.current) 
        if(window.sf_version=="Stockfish 14 (nnue-wasm)"){
          // @ts-ignore
          window.stockfish.postMessage("setoption name Use NNUE value true")
         } 
    }

    setTimeout(() => {
      if(window.stockfish){
        initEngine();
       }else{
        console.log("stockfish.js loading..")
        setTimeout(initEngine,500);
       }
    },0)
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
        }else if (refManualEngineStop.current==false && liveRef.current.depth==live_rating_depth){
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
          live={liveRef.current}
          evaluation={evaluationRef.current}
      />

      <IonBadge>Import PGN</IonBadge>
      <IonBadge>Export PGN</IonBadge><br/><br/><br/><br/><br/><br/>
    </div>
  );
}; 

export default AppContainer;