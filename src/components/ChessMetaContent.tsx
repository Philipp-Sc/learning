import React from 'react';
import {IonBadge} from '@ionic/react';   
import {useState} from 'react';

import { IonList, IonItem, IonLabel, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/react';
 
interface MovePerformance {
  average_eval: number;
  median_eval:number;
}

interface Evaluation {
  evaluation: number;
  depth: number;
}

interface ContainerProps {
  halfMoves: number;
  playerColor: string; 
  movePerformance: MovePerformance;
  evaluation: Evaluation;
  live: Evaluation;
  highlightAnalysis: boolean;
  setHighlightAnalysis: () => void;
  highlightEngine: boolean;
  setHighlightEngine: () => void;
  avgPerf: boolean;
  setAvgPerf: () => void;
  medianPerf: boolean;
  setMedianPerf: () => void;
  notificationOut: string[];
  liveRatingDepth: boolean;
  setLiveRatingDepth: () => void;
  depth: number;
}


const ChessMetaContent: React.FC<ContainerProps> = ({halfMoves,playerColor,movePerformance,live,evaluation,highlightAnalysis,setHighlightAnalysis,highlightEngine,setHighlightEngine,avgPerf,setAvgPerf,medianPerf,setMedianPerf,notificationOut,liveRatingDepth,setLiveRatingDepth,depth}) => {
 

  const [showPieceType,setShowPieceType] = useState(true);
  const [showMoveTo,setShowMoveTo] = useState(true);
  const [showHistory,setShowHistory] = useState(true);
  const [showPawnOn,setShowPawnOn] = useState(true);
  const [showOpenFile,setShowOpenFile] = useState(true);
  const [showHalfOpenFile,setShowHalfOpenFile] = useState(true);
  const [showCapture,setShowCapture] = useState(true);
  const [showMaterialCount,setShowMaterialCount] = useState(true);

  const avg_player_perf = (-1*movePerformance.average_eval).toFixed(2);
  const median_player_perf = (-1*movePerformance.median_eval).toFixed(2);


   // Show functionality, as long as selected, update chess board with visualization of given parameter
   // Add on touch/click on item, dropdown box with chart

   // Show "P move played", "B move Played",.. together as one notification
   // "3rd most probable move played ( 10% B, 20% N, >>5% P<<,1%Q, 0% K)" showing the order of the probabilities
   // Same Idea for Px,Nx,Bx,Kx,Qx

   // --> make probabilities more usefull by combining them, with the move history
   // at Move N how likely is it that there have been M Knight moves
   
   // FIX BUG WHERE Analysis is not updated for the second, third, ... game.
   // this happens because somehow the last indices are still there, only after halfmove n+1 the analysis continues to show

	return <div> 

         
        <IonList style={{"maxWidth": "700px", "margin": "0 auto"}}>
        {notificationOut.map(e => e[0])
            .filter((e,i) => i==0).map(e => {return <IonItemSliding>
            <IonItem>
              <IonLabel>{e.toString().split("||")[0]}</IonLabel>
              <IonLabel style={{flex: "unset"}}>{e.toString().split("||")[1]}</IonLabel>
            </IonItem>
        
        <IonBadge onClick={() => {setShowMoveTo(!showMoveTo)} }>{showMoveTo ? "@(+)" : "@"}move_to</IonBadge>
        <IonBadge onClick={() => {setShowPawnOn(!showPawnOn)} }>{showPawnOn ? "@(+)" : "@"}pawn_on</IonBadge>
        
        <IonBadge onClick={() => {setShowPieceType(!showPieceType)} }>{showPieceType ? "@(+)" : "@"}figure</IonBadge>
        
        <IonBadge onClick={() => {setShowOpenFile(!showOpenFile)} }>{showOpenFile ? "@(+)" : "@"}open_file</IonBadge>
        <IonBadge onClick={() => {setShowHalfOpenFile(!showHalfOpenFile)} }>{showHalfOpenFile ? "@(+)" : "@"}half_open_file</IonBadge>
    
        <IonBadge onClick={() => {setShowHistory(!showHistory)} }>{showHistory ? "@(+)" : "@"}history</IonBadge>

        <IonBadge onClick={() => {setShowCapture(!showCapture)} }>{showCapture ? "@(+)" : "@"}capture</IonBadge>
        
        <IonBadge onClick={() => {setShowMaterialCount(!showMaterialCount)} }>{showMaterialCount ? "@(+)" : "@"}material</IonBadge>
     

            <IonItemOptions side="end">
              <IonItemOption onClick={() => {}}>Show</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>})}

          {notificationOut.map(e => e[0])
            .filter((e,i) => i!=0)
            .filter(e => showCapture ? true : !e.includes("{capture}"))
            .filter(e => showMaterialCount ? true : !e.includes("count {"))
            .filter(e => showHalfOpenFile ? true : !e.includes("Half-Open"))
            .filter(e => showOpenFile ? true : !e.includes("Open") || (e.includes("Open") && e.includes("Half")))
            .filter(e => showPawnOn ? true : !e.includes("Pawn On"))
            .filter(e => showHistory ? true : !e.includes("{history}"))
            .filter(e => showMoveTo ? true : !e.includes("move to"))
            .filter(e => showPieceType ? true : (!e.includes("{fig}") || e.includes("{history}")) ).map(e => {return <IonItemSliding>
            <IonItem>
              <IonLabel>{e.toString().split("||")[0]}</IonLabel>
              <IonLabel style={{flex: 'unset'}}>{e.toString().split("||")[1]}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption onClick={() => {}}>Show</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>})}
          
        </IonList>

    <br/><br/>

       <IonBadge onClick={() => {setHighlightAnalysis(!highlightAnalysis)}}>{highlightAnalysis ? "@(+) " : "@"}analysis: {isNaN(live.evaluation) ? "No data available" : ((-1*live.evaluation)+" @depth "+live.depth)}</IonBadge>
       <IonBadge onClick={() => {if(liveRatingDepth>=40){setLiveRatingDepth(depth)}else{setLiveRatingDepth(liveRatingDepth+1)}}}>@max depth {Math.max(depth,liveRatingDepth)}</IonBadge>
       <br/>
       <IonBadge onClick={() => {setHighlightEngine(!highlightEngine)}}>{highlightEngine ? "@(+) " : "@"}engine move: {isNaN(evaluation.evaluation) ? "No data available" : (-1*evaluation.evaluation)+" @depth "+evaluation.depth}</IonBadge>
           <br/><br/>
       <IonBadge  onClick={() => {setAvgPerf(!avgPerf)}}>{avgPerf ? "@(+) " : "@"}avg. perf.: {isNaN(avg_player_perf) ? "No data available" : avg_player_perf}</IonBadge>
       <IonBadge  onClick={() => {setMedianPerf(!medianPerf)}}>{medianPerf ? "@(+) " : "@"}median perf.: {isNaN(median_player_perf) ? "No data available" : median_player_perf}</IonBadge>
<br/></div>
};


export default ChessMetaContent;