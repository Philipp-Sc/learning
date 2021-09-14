import React from 'react';
import { IonModal } from '@ionic/react';  
//import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,IonGrid, IonRow, IonCol, IonToggle, IonSpinner, IonBadge} from '@ionic/react'; 
//import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
//import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
//import { useState, useRef, useEffect } from 'react';

//import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal, Card} from 'react-bootstrap'


//import * as chess_meta from "../js/chess-meta.js"

interface ContainerProps {
  halfMoves: number;
  playerColor: string;
  pieceClicked: string;
  squareClicked: string;
  modalIndex: number;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}


const ModalChessMetaContent: React.FC<ContainerProps> = ({halfMoves,playerColor,pieceClicked,squareClicked,modalIndex,showModal,setShowModal}) => {
 
 	//const game_stats = chess_meta[playerColor=="w" ? "white" : "black"];


	return <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} cssClass='my-custom-class2'>
  
      </IonModal> 
};


export default ModalChessMetaContent;

  /*    
       <IonBadge>{chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex].length==1 ? chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex].replace("P","")+squareClicked : chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]} ({pieceClicked.split("")[0]=="w" ? "white" : "black"})</IonBadge>
         
       {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Pawns"].filter(e => e==true).map(e => (
        <div>
        <table>
        <tr>
          <td><IonBadge>Mobility:</IonBadge></td>
          <td><IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Pawns"]).toFixed(2)}</IonBadge>
        </td> 
        </tr>
        <tr>
          <td><IonBadge>Moves:</IonBadge></td>
          <td><IonBadge>#Pawn: {(100.0*parseFloat(game_stats[halfMoves]["P"])).toFixed(2)}%</IonBadge>
       </td>
          <td><IonBadge>x: {(100.0*parseFloat(game_stats[halfMoves]["Px"])).toFixed(2)}%</IonBadge>
       </td>
        </tr>  
      </table>

        <br/>
         
          <br/> 
        <br/> 
        <table>
        <tr>
          <td><IonBadge>Expansion factor:</IonBadge></td>
          <td><IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Expansion factor"]).toFixed(2)}</IonBadge>
       </td> 
        </tr>
        <tr>
          <td><IonBadge>Expansion Queen Side:</IonBadge></td>
          <td><IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Expansion factor Queen Side"]).toFixed(2)}</IonBadge>
        </td>
        </tr> 
        <tr>
          <td><IonBadge>Expansion King Side:</IonBadge></td>
          <td><IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Expansion factor King Side"]).toFixed(2)}</IonBadge>
        </td> 
        </tr>
      </table>
        <br/> 
       <br/>
       <table> 
  <tr>
    <td><IonBadge>Protected squares*:</IonBadge></td>
    <td><IonBadge color="dark">{(parseFloat(game_stats[halfMoves]["pawn outward protected squares "+pieceClicked.split("")[0]])).toFixed(2)}</IonBadge> 
    </td>
    <td> <IonBadge>{(parseFloat(game_stats[halfMoves]["pawn outward protected squares ratio"])).toFixed(2)}</IonBadge>
    </td>
  </tr>
  <tr>
    <td><IonBadge>Pawns:</IonBadge></td>
    <td><IonBadge>{parseFloat(game_stats[halfMoves]["P count"]).toFixed(2)}</IonBadge></td> 
    
  </tr>
  <tr><td><IonBadge color="dark">w(Pawns) = b(Pawns):</IonBadge>
    </td><td><IonBadge color="dark">{(100.0*parseFloat(game_stats[halfMoves]["P == p"])).toFixed(2)}%</IonBadge>
    </td></tr>
  <tr>
    <td><IonBadge>Packing density*:</IonBadge></td>
    <td><IonBadge color="dark">{(parseFloat(game_stats[halfMoves]["pawn outward packing density "+pieceClicked.split("")[0]])).toFixed(2)}</IonBadge>
    </td>  
    <td><IonBadge>{(parseFloat(game_stats[halfMoves]["pawn outward packing density ratio"])).toFixed(2)}</IonBadge>
    </td> 
  </tr> 
</table> 
 
        
       <br/>
        </div>
        ))} 

         {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Bishops"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Bishops"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Bishop: {(100.0*parseFloat(game_stats[halfMoves]["B"])).toFixed(2)}%</IonBadge>
        <IonBadge>Bx: {(100.0*parseFloat(game_stats[halfMoves]["Bx"])).toFixed(2)}%</IonBadge> 
        <br/>
        <br/> 
        <IonBadge>Bishops:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["B count"]).toFixed(2)}</IonBadge> 
        <br/>
        <IonBadge color="dark">w(Bishops) &gt; b(Knights): {(100*parseFloat(game_stats[halfMoves]["B > n"])).toFixed(2)}%</IonBadge>
        <br/>
        <IonBadge color="dark">w(Bishop) = w(Knight): {(100*parseFloat(game_stats[halfMoves]["B == N"])).toFixed(2)}%</IonBadge>

    <br/>
        </div>
        ))} 

         {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Knights"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Knights"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Knight: {(100*parseFloat(game_stats[halfMoves]["N"])).toFixed(2)}%</IonBadge>
        <IonBadge>Nx: {(100*parseFloat(game_stats[halfMoves]["Nx"])).toFixed(2)}%</IonBadge>
        <br/>
        <br/> 
        <IonBadge>Knights:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["N count"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge color="dark">#Knight &gt; #(Bishop): {(100*parseFloat(game_stats[halfMoves]["N > b"])).toFixed(2)}%</IonBadge>
        <br/>
        <IonBadge color="dark">w(Bishop) = w(Knight): {(100*parseFloat(game_stats[halfMoves]["B == N"])).toFixed(2)}%</IonBadge>

    <br/>
        </div>
        ))} 

          {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Rooks"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Rooks"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Rook: {(100*parseFloat(game_stats[halfMoves]["R"])).toFixed(2)}%</IonBadge>
        <IonBadge>Rx: {(100*parseFloat(game_stats[halfMoves]["Rx"])).toFixed(2)}%</IonBadge>
        <br/>
        <br/> 
        <IonBadge>Rooks:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["R count"]).toFixed(2)}</IonBadge> 
    <br/>
        </div>
        ))} 
       
          {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Queen"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Queens"]).toFixed(2)}</IonBadge> 
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Queen: {(100*parseFloat(game_stats[halfMoves]["Q"])).toFixed(2)}%</IonBadge>
        <IonBadge>Qx: {(100*parseFloat(game_stats[halfMoves]["Qx"])).toFixed(2)}%</IonBadge>
        <br/>
        <br/> 
        <IonBadge>Queens:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["Q count"]).toFixed(2)}</IonBadge> 
    <br/>
        </div>
        ))} 

         {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="King"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / King"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves</IonBadge>    
        <br/>
           <IonBadge>#King: {(100.0*parseFloat(game_stats[halfMoves]["K"])).toFixed(2)}%</IonBadge>
           <IonBadge>Kx: {(100.0*parseFloat(game_stats[halfMoves]["Kx"])).toFixed(2)}%</IonBadge>
        <br/> 
           <IonBadge>#Castle King side: {(100.0*parseFloat(game_stats[halfMoves]["0-0 w"])).toFixed(2)}%</IonBadge>
        <br/>
           <IonBadge>#Castle Queen side: {(100.0*parseFloat(game_stats[halfMoves]["0-0-0 w"])).toFixed(2)}%</IonBadge>
        <br/>  
    <br/>
        </div>
        ))} 

        {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Minor Pieces"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Minor Pieces"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Rook: {(100*parseFloat(game_stats[halfMoves]["R"])).toFixed(2)}%</IonBadge>
        <IonBadge>Rx: {(100*parseFloat(game_stats[halfMoves]["Rx"])).toFixed(2)}%</IonBadge>
        <br/>
        <br/> 
        <IonBadge>Rooks:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["R count"]).toFixed(2)}</IonBadge> 
    <br/>
        </div>
        ))} 

         {[chess_meta.pieceLookup[pieceClicked.split("")[1]][modalIndex]=="Major Pieces"].filter(e => e==true).map(e => (
        <div>
        <IonBadge>Mobility:</IonBadge> 
        <IonBadge>{parseFloat(game_stats[Math.max(halfMoves-1,0)]["Opponement Mobility / Major Pieces"]).toFixed(2)}</IonBadge>
        <br/>
        <IonBadge>Moves:</IonBadge>  
        <IonBadge>#Rook: {(100*parseFloat(game_stats[halfMoves]["R"])).toFixed(2)}%</IonBadge>
        <IonBadge>Rx: {(100*parseFloat(game_stats[halfMoves]["Rx"])).toFixed(2)}%</IonBadge>
        <br/>
        <br/> 
        <IonBadge>Rooks:</IonBadge>
        <IonBadge>{parseFloat(game_stats[halfMoves]["R count"]).toFixed(2)}</IonBadge> 
    <br/>
        </div>
        ))} 
       <IonButton onClick={() => {setShowModal(false);}}>Close</IonButton>
          */