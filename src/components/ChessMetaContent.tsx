import React from 'react';
import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';  
import { IonGrid, IonRow, IonCol, IonSpinner, IonBadge} from '@ionic/react'; 
import { IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';

import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal, Card} from 'react-bootstrap'

import { IonList, IonItem, IonLabel, IonInput, IonToggle, IonRadio, IonCheckbox, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/react';


import * as chess_meta from "../js/chess-meta.js"
 
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
}


const ChessMetaContent: React.FC<ContainerProps> = ({halfMoves,playerColor,movePerformance,live,evaluation,highlightAnalysis,setHighlightAnalysis,highlightEngine,setHighlightEngine,avgPerf,setAvgPerf,medianPerf,setMedianPerf,notificationOut}) => {
 
 	const game_stats = chess_meta[playerColor=="w" ? "white" : "black"];

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

        <IonList>
          {notificationOut.map(e => {return <IonItemSliding>
            <IonItem>
              <IonLabel>{e}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption onClick={() => {}}>Show</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>})}
          
        </IonList>

    <br/><br/>

       <IonBadge onClick={() => {setHighlightAnalysis(!highlightAnalysis)}}>{highlightAnalysis ? "@(+) " : "@"}analysis: {isNaN(live.evaluation) ? "No data available" : ((-1*live.evaluation)+" @depth "+live.depth)}</IonBadge>
       <br/>
       <IonBadge onClick={() => {setHighlightEngine(!highlightEngine)}}>{highlightEngine ? "@(+) " : "@"}engine move: {isNaN(evaluation.evaluation) ? "No data available" : (-1*evaluation.evaluation)+" @depth "+evaluation.depth}</IonBadge>
           <br/><br/>
       <IonBadge  onClick={() => {setAvgPerf(!avgPerf)}}>{avgPerf ? "@(+) " : "@"}avg. perf.: {isNaN(avg_player_perf) ? "No data available" : avg_player_perf}</IonBadge>
       <IonBadge  onClick={() => {setMedianPerf(!medianPerf)}}>{medianPerf ? "@(+) " : "@"}median perf.: {isNaN(median_player_perf) ? "No data available" : median_player_perf}</IonBadge>
<br/></div>
};


export default ChessMetaContent;