import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';  
import { IonGrid, IonRow, IonCol, IonToggle, IonSpinner, IonBadge} from '@ionic/react'; 
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { micCircleOutline, cameraOutline, helpOutline, informationOutline, checkmarkDoneOutline, clipboardOutline, documentTextOutline, cogOutline } from 'ionicons/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal, Card} from 'react-bootstrap'
  
import {IonSlides, IonSlide, IonInfiniteScroll, IonInfiniteScrollContent, IonCard} from '@ionic/react';
 
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
 
 
 interface Item {
    type: string;
    value: any;
    augment: string | undefined;
    id: number;
    timestamp: number;
    hash: string;
    deleted: number | undefined;
    synced: number | undefined; 
  }

interface ContainerProps {
  items: Item[];
  selectedItemHash: string | undefined;
  setSelectedItemHash: (a: string) => void;
}

const CardContent: React.FC<ContainerProps> = ({items,selectedItemHash,setSelectedItemHash}) => {

  const strinToIcon = (text) => {
    if(text=="helpOutline"){
      return helpOutline;
    }else if(text=="informationOutline"){
      return informationOutline;
    }else if(text=="checkmarkDoneOutline"){
      return checkmarkDoneOutline;
    }else if(text=="documentTextOutline"){
      return documentTextOutline;
    }else if(text=="clipboardOutline"){
      return clipboardOutline;
    }else if(text=="cogOutline"){
      return cogOutline;
    }
  }


	return <div className="m-auto-auto">{items.sort((a, b) => {return b.id - a.id || b.timestamp - a.timestamp;})
		 	     .map((item: Item, i: number) => {
		 	                 if(item.type=="text"){
 	                             return <div key={`${i}`}> 
											<IonCard>
													<InputGroup>
														<InputGroup.Prepend>
															<InputGroup.Radio name="groupOptions" checked={item.hash==(selectedItemHash || items[items.length-1].hash)} value={item.hash} onChange={(e) => {setSelectedItemHash(e.currentTarget.value)}}/> 
														  {item.augment!=undefined &&<InputGroup.Text><IonIcon icon={strinToIcon(item.augment)}/></InputGroup.Text>}
                            </InputGroup.Prepend> 
															<IonItem>
												          <Card.Text>{item.value}</Card.Text>  
														</IonItem> 
														<InputGroup.Append className="ml-auto">
                              <InputGroup.Text>{item.id}</InputGroup.Text> 
													</InputGroup.Append>
												</InputGroup>
											</IonCard>
										</div>
    			            }else if(item.type=="imageUrl"){
		                        return <div key={`${i}`}>
		                        			<IonCard className={item.hash==(selectedItemHash || items[items.length-1].hash) ? "shadow-lg mb-5 rounded" : ""}> 
													<img src={item.value} onClick={() => {setSelectedItemHash(item.hash)}}/>
												</IonCard>
											</div>
            				}else if(item.type=="audioUrl"){
            					return <div key={`${i}`}>
            							<IonCard>
            								<InputGroup>
            									<InputGroup.Prepend>
            										<InputGroup.Radio name="groupOptions" checked={item.hash==(selectedItemHash || items[items.length-1].hash)} value={item.hash} onChange={(e) => {setSelectedItemHash(e.currentTarget.value)}}/> 
            									 {item.augment!=undefined &&<InputGroup.Text><IonIcon icon={strinToIcon(item.augment)}/></InputGroup.Text>}
                          </InputGroup.Prepend>
	            								<InputGroup>
	            									<AudioPlayer src={item.value}/>
	            								</InputGroup>
	            								<InputGroup.Append className="ml-auto">
                              	<InputGroup.Text>{item.id}</InputGroup.Text>
	            							    </InputGroup.Append>
            							    </InputGroup>
            							</IonCard>
            						</div>
            		        }
            		        	          })}</div>
};


export default CardContent;

/* {items.length>=13 &&
     <IonInfiniteScroll threshold="10px" position="bottom"
          disabled={disableInfiniteScroll}
          onIonInfinite={(e) => searchNext(e)}>
          <IonInfiniteScrollContent
              loadingText="Loading more ...">
          </IonInfiniteScrollContent>
      </IonInfiniteScroll>})*/