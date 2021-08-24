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
  avgPerf: boolean;
  setAvgPerf: () => void;
  medianPerf: boolean;
  setMedianPerf: () => void;
}


const ChessMetaContent: React.FC<ContainerProps> = ({halfMoves,playerColor,movePerformance,live,evaluation,highlightAnalysis,setHighlightAnalysis,avgPerf,setAvgPerf,medianPerf,setMedianPerf}) => {
 
 	const game_stats = chess_meta[playerColor=="w" ? "white" : "black"];

  const avg_player_perf = (-1*movePerformance.average_eval).toFixed(2);
  const median_player_perf = (-1*movePerformance.median_eval).toFixed(2);


  // find statistics that can put a probability on a question/statement
  // (eventually use NNs)
  // if there is a suddden change of the probability (0->1 or 1->0) then push the question/statement to the player.

  const notificationOut = ["The King of the opponent is on the same file (e) as the Knight of yours",
                           "You have a degree of freedom (D.O.F) of 4 to do anything.",
                           "I'm impressed! You are making a very interesting choice here. ",
                           "You got the bishop pair but you have no mobility",
                           "You gained space on the queenside",
                           "You have a good control of the center.",
                           "You have opposite side castles.",
                           "You made to many pawn moves."]

	return <div> 

        <IonList>
          {notificationOut.map(e => {return <IonItemSliding>
            <IonItem>
              <IonLabel>{e}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption onClick={() => {}}>Unread</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>})}
          
        </IonList>

    <br/><br/>

       <IonBadge onClick={() => {setHighlightAnalysis(!highlightAnalysis)}}>{highlightAnalysis ? "@(+) " : "@"}analysis: {isNaN(live.evaluation) ? "No data available" : ((-1*live.evaluation)+" @depth "+live.depth)}</IonBadge>
       <br/>
       <IonBadge>@engine move: {isNaN(evaluation.evaluation) ? "No data available" : (-1*evaluation.evaluation)+" @depth "+evaluation.depth}</IonBadge>
           <br/><br/>
       <IonBadge  onClick={() => {setAvgPerf(!avgPerf)}}>{avgPerf ? "@(+) " : "@"}avg. perf.: {isNaN(avg_player_perf) ? "No data available" : avg_player_perf}</IonBadge>
       <IonBadge  onClick={() => {setMedianPerf(!medianPerf)}}>{medianPerf ? "@(+) " : "@"}median perf.: {isNaN(median_player_perf) ? "No data available" : median_player_perf}</IonBadge>
<br/></div>
};


export default ChessMetaContent;