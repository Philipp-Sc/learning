import React from 'react';
import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';  
import { IonGrid, IonRow, IonCol, IonToggle, IonSpinner, IonBadge} from '@ionic/react'; 
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';

import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal, Card} from 'react-bootstrap'


import * as chess_meta from "../js/chess-meta.js"
 
interface MoveStats {
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
  moveStats: MoveStats;
  evaluation: Evaluation;
  live: Evaluation;
}


const ChessMetaContent: React.FC<ContainerProps> = ({halfMoves,playerColor,moveStats,live,evaluation}) => {
 
 	const game_stats = chess_meta[playerColor=="w" ? "white" : "black"];


	return <div>
    <IonBadge>Asking the right questions is key.</IonBadge>
    <IonBadge>Scroll down to get inspiration for your Chess play.</IonBadge>
    <br/>
    <br/>
    <br/>
 
    <br/>
    <br/>

       <IonBadge>Analysis: {(-1*live.evaluation)+" @depth "+live.depth}</IonBadge>
       <br/>
       <IonBadge>Engine's Move: {(-1*evaluation.evaluation)+" @depth "+evaluation.depth}</IonBadge>
           <br/><br/>
       <IonBadge>Avg. Perf.: {(-1*moveStats.average_eval).toFixed(2)}</IonBadge>
       <IonBadge>Median Perf.: {(-1*moveStats.median_eval).toFixed(2)}</IonBadge>
  
    <br/>
    <br/>
    <br/> 
    <IonBadge>Learn about latent features that help your analysis:</IonBadge> 
    <br/> 
    <br/> 
       <IonBadge>Material:</IonBadge>
       <IonBadge>{(parseFloat(game_stats[halfMoves]["Material w"])-39).toFixed(2)}</IonBadge>
       <IonBadge>({(parseFloat(game_stats[halfMoves]["Material b"])-39).toFixed(2)})</IonBadge>
       <br/>
       <IonBadge>Degree of Freedom:</IonBadge>
       <IonBadge>{(parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility"])/20).toFixed(2)}</IonBadge>
       <IonBadge>({(parseFloat(game_stats[halfMoves]["Opponement Mobility"])/20).toFixed(2)})</IonBadge>
       <br/> 
       <IonBadge>Mobility:</IonBadge>
       <br/>&nbsp;&nbsp;
       <IonBadge>P,B,N,R,Q,K</IonBadge>&nbsp;
       <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Pieces"]).toFixed(2)}</IonBadge>
       <IonBadge>({parseFloat(game_stats[halfMoves]["Opponement Mobility / Pieces"]).toFixed(2)})</IonBadge>
       <br/>&nbsp;&nbsp; 
       <IonBadge>B,N,R</IonBadge>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
       <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Minor Pieces"]).toFixed(2)}</IonBadge>
       <IonBadge>({parseFloat(game_stats[halfMoves]["Opponement Mobility / Minor Pieces"]).toFixed(2)})</IonBadge>
       <br/>
       
       <br/>
       <br/>
    <br/>  
    <IonBadge>Get some hints how high level games look like:</IonBadge> 
    <br/> 
  <br/>
    <br/>
    <br/>
    <br/>

    <br/><br/><br/></div>
};


export default ChessMetaContent;