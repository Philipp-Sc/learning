import React from 'react';
import CardContent from '../components/CardContent';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'; 
import './Tab1.css';
import { IonGrid, IonRow, IonCol, IonToggle, IonSpinner, IonBadge} from '@ionic/react'; 
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { micCircleOutline, cameraOutline, trashOutline, returnUpForwardOutline, returnDownBackOutline } from 'ionicons/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal} from 'react-bootstrap'
 
//import { ReactMediaRecorder,useReactMediaRecorder } from "react-media-recorder";
import useMediaRecorder from '@wmik/use-media-recorder';


import {IonSlides, IonSlide, IonInfiniteScroll, IonInfiniteScrollContent, IonCard} from '@ionic/react';

import { Plugins, CameraResultType } from '@capacitor/core';

//import ReactAudioPlayer from 'react-audio-player';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

var hash = require('object-hash');


const Tab1: React.FC = () => {

   const slideOpts = { 
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    speed: 400
  }; 


  const inputRef = React.createRef<HTMLInputElement>();

  const { Camera } = Plugins;

  const takePicture = async() => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    }); 
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = "data:image/png;base64,"+image.base64String; 
    var id = 0;
    if(dropdown=="New"){
      id = items.length;
    }else if(dropdown=="Add" && selectedItemHash!=undefined){
      var selectedItem = getItemByHash(selectedItemHash);
      if(selectedItem!=undefined){
        id = selectedItem.id;
      }
    }else if(dropdown=="Edit" && selectedItemHash!=undefined){
      var selectedItem = getItemByHash(selectedItemHash);
      if(selectedItem!=undefined){
        selectedItem.type="imageUrl";
        selectedItem.value=imageUrl;
        setItems([...items.filter(e => e.hash!=selectedItemHash), selectedItem]); 
        return;
      }else{
        return;
      }
    }
    var timestamp = Date.now();
    var new_item = {"type":"imageUrl","value":imageUrl,"id":id,"timestamp":timestamp,"hash":hash([timestamp,id]),"deleted":undefined,"synced":undefined};
    setItems([...items, new_item]);
    setSelectedItemHash(new_item.hash)
    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }

  const [dropdown, setDropdown] = useState<string>("New")

  const [show, setShow] = useState<boolean>(false);
 
  const [paused, setPaused] = useState<boolean>(false);
 
  interface Item {
    type: string;
    value: any;
    id: number;
    timestamp: number;
    hash: string;
    deleted: number | undefined;
    synced: number | undefined;
  }

  const [items, setItems] = useState< Item []>(JSON.parse(window.localStorage.getItem("items") || "[]")); // on load remove all deleted entries

  const [selectedItemHash, setSelectedItemHash] = useState<string>(items.length>0 ? items[0].hash : "");


  const [showSelect, setShowSelect] = useState<boolean>(false); 

  var example = [
  {
    "text":"", 
  },
  { 
    "imageUrl":""
  },
  { 
    "audioUrl":""
  }];
  const [disableInfiniteScroll, setDisableInfiniteScroll] = 
        useState<boolean>(false);

/*

  const {
    status,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useReactMediaRecorder({ audio: true });
*/
  const getData = async(blob, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => { 
      if(event!=null && event.target!=null && event.target.result!=null){
        callback(event.target.result);
      }
    }
    reader.readAsDataURL(blob);
  }

  const downloadAudio = (blob) => { 

    const setAudio = (blob) => {
      let url = blob;//URL.createObjectURL(blob);
      var id = 0;
      if(dropdown=="New"){
        id = items.length;
      }else if(dropdown=="Add" && selectedItemHash!=undefined){
        var selectedItem = getItemByHash(selectedItemHash);
        if(selectedItem!=undefined){
          id = selectedItem.id;
        }
      }else if(dropdown=="Edit" && selectedItemHash!=undefined){
        var selectedItem = getItemByHash(selectedItemHash);
        if(selectedItem!=undefined){
          selectedItem.type="audioUrl"
          selectedItem.value=url;
          setItems([...items.filter(e => e.hash!=selectedItemHash), selectedItem]); 
          return;
        }else{
          return;
        }
      }
      var timestamp = Date.now();
      var new_item = {"type":"audioUrl","value":url,"timestamp":timestamp,"id":id,"hash":hash([timestamp,id]),"deleted":undefined,"synced":undefined};
      setItems([...items, new_item]);
      setSelectedItemHash(new_item.hash); 
    }
     
    getData(blob,setAudio);
    /*
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);

    a.click();*/
  };

  let {
    error,
    status,
    mediaBlob,
    stopRecording,
    getMediaStream,
    pauseRecording,
    resumeRecording,
    startRecording
  } = useMediaRecorder({
    blobOptions: { type: 'audio/wav' },
    mediaStreamConstraints: { audio: true },
    onDataAvailable: downloadAudio,
  });
  useEffect(() => {  
    if(dropdown=="Edit"){
      var current_item = getItemByHash(selectedItemHash) || {"type":"none","value":""};
      if(inputRef){
        if(inputRef.current){
          inputRef.current.value=(dropdown=="Edit" && current_item.type=="text") ? current_item.value : ""
      }
      }
    } 
  },[selectedItemHash,dropdown]);

  useEffect(() => {
    // monitor the free space and move data that can be retrieved from firestore
    // move that data to sessionstorage
    // have a function hydrate sessionstorage, after the page was refreshed
    window.localStorage.setItem("items",JSON.stringify(items.filter(e => e.deleted==undefined || (e.deleted!=undefined && e.deleted<0))));
  },[items])

/*
  const getSupportetAudioType = () => {
    var audio = document.createElement('audio'); 
    var types = ["audio/webm",
               "audio/webm\;codecs=opus",
               "audio/mpeg",
               "audio/vorbis",
               "audio/aac",
               "audio/ogg",
               "audio/opus",
               "audio/ac3",
               "audio/wav"];
    for (var i in types) {
      if(audio.canPlayType(types[i])=="maybe"){   
        return types[i];
      }
    }
    return "audio/wav";
  }*/

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(false);

 const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      var content = event.target.value;
      var id = 0;
      if(dropdown=="New"){
        id = items.length;
      }else if(dropdown=="Add" && selectedItemHash!=undefined){
        var selectedItem = getItemByHash(selectedItemHash);
        if(selectedItem!=undefined){
          id = selectedItem.id;
        }
      }else if(dropdown=="Edit" && selectedItemHash!=undefined){
        var selectedItem = getItemByHash(selectedItemHash);
        if(selectedItem!=undefined){
          selectedItem.type="text";
          selectedItem.value=content;
          setItems([...items.filter(e => e.hash!=selectedItemHash), selectedItem]); 
          return;
        }else{
          return;
        }
      }
      var timestamp = Date.now();
      var new_item = {"type":"text","value":content,"timestamp":timestamp,"id":id,"hash":hash([timestamp,id]),"deleted":undefined,"synced":undefined}
      setItems([...items, new_item]);
      setSelectedItemHash(new_item.hash);
      event.target.value = '';
    }
  }

 const getItemByHash = (hash_) => { 
  for(var i = 0;i<items.length;i++){
    if(items[i].hash==hash_){ 
      return items[i];
    }
  } 
  return undefined

 }

 const undoLastDelete = () => {
  var deleted_items = items.filter(e => e.deleted!=undefined && e.deleted>=0).sort((a, b) => {if(b.deleted && a.deleted){return b.deleted - a.deleted};return 0;});
  var undoHash = deleted_items[deleted_items.length-1].hash;
  setItems(items.map(e => {if(e.hash==undoHash && e.deleted!=undefined){e.deleted=e.deleted*(-1);}return e;}))
 }

  const redoLastDelete = () => {
  var undo_deleted_items = items.filter(e => e.deleted!=undefined && e.deleted<0).sort((a, b) => {if(b.deleted && a.deleted){return b.deleted - a.deleted};return 0;});
  if(undo_deleted_items.length==0){
    return;
  }
  var undoHash = undo_deleted_items[0].hash;
  setItems(items.map(e => {if(e.hash==undoHash && e.deleted!=undefined){e.deleted=e.deleted*(-1);}return e;}))
 }
 
 const deleteItem = async() => {
  // if deleteItem => deletes ID 
  // then remove 
  if(selectedItemHash){
    var new_items = items.map(e => {
      if(e.hash==selectedItemHash){
        e.deleted=Date.now();
      }
      return e;
    });
    setItems(new_items)
    // add call to firebase to permanently remove it
    setSelectedItemHash(items[items.length-1].hash)
  } 
 }

 const fetchMoreData = async() => {
    // not fetching here, this is only for the view
    setTimeout(() => {
      setItems([...items, ...[]]);
    }, 1500);
  };

 const searchNext = async($event) => {

    console.log("loadingText")
    await fetchMoreData();
    //setDisableInfiniteScroll(items.length > 10);

    // finish loading current batch
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  /*
   const [theme,setTheme] = useState<boolean>(false)

  useEffect(() => {  
    document.body.classList.toggle('dark', theme)
  },[theme]);

  <IonList>
        <IonItem lines="full">
          <IonIcon slot="start" name="moon"></IonIcon>
          <IonLabel>
            Toggle Dark Theme
          </IonLabel>
          <IonToggle onClick={() => {setTheme(!theme)}} slot="end"></IonToggle>
        </IonItem>
      </IonList>
  */

  return (
    <IonPage>  
     <IonContent>   
       <IonSlides pager={true} options={slideOpts}  className="h-100">
        {Array.from(new Set(items.map((item: Item) => item.id))).map((id: number) => { 
          return (
                  <IonSlide key={`${id}`} hidden={items.filter((e: Item)=> e.id==id && (e.deleted==undefined || e.deleted<0)).length==0}> 
                      <CardContent items={items.filter((e: Item)=> e.id==id && (e.deleted==undefined || e.deleted<0))} selectedItemHash={selectedItemHash} setSelectedItemHash={setSelectedItemHash} />
                  </IonSlide>
                 );
          }
          )
        } 
        </IonSlides>

    <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        animation={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reference</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         To add content to an existing card you need to select a specific card.
        </Modal.Body>
        <Modal.Footer> 
          <Button variant="primary" onClick={() => {handleClose()}}>Okay</Button>
        </Modal.Footer>
      </Modal>

     </IonContent>     
      <div slot="bottom">   
        <InputGroup className="mb-0">
         <DropdownButton
      as={InputGroup.Append}
      variant="outline-secondary"
      title={dropdown}
      id="input-group-dropdown-1"
      className="dropup"
    >
      <Dropdown.Item onClick={() => {setDropdown("New");}} >New</Dropdown.Item>
      <Dropdown.Item onClick={() => {setDropdown("Add");}} >Add</Dropdown.Item> 
      <Dropdown.Item onClick={() => {setDropdown("Edit");}} >Edit</Dropdown.Item> 
      <Dropdown.Item onClick={() => {setDropdown("Delete");}} >Delete</Dropdown.Item> 
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => {setDropdown("Augment");}} >Augment</Dropdown.Item> 
      <Dropdown.Item onClick={() => {setDropdown("Special");}} >Special</Dropdown.Item> 
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => {setDropdown("Hide/Show");}} >Hide/Show</Dropdown.Item> 
      <Dropdown.Item onClick={() => {setDropdown("Training");}} >Training</Dropdown.Item> 
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => {}} >Options</Dropdown.Item> 
    </DropdownButton>
    {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && <FormControl
      placeholder="Type: Content"
      ref={inputRef}
      aria-label="Type: Content"
      aria-describedby="basic-addon2"
      onKeyDown={handleKeyDown}
    />} 
    {dropdown=="Delete" && items.filter((e: Item)=> e.deleted!=undefined && e.deleted>=0).length>0 && <Button variant="outline-secondary" onClick={() => {undoLastDelete();}}>
    <IonIcon icon={returnDownBackOutline}/>
  </Button>}
   {dropdown=="Delete" && items.filter((e: Item)=> e.deleted!=undefined && e.deleted<0).length>0 && <Button variant="outline-secondary" onClick={() => {redoLastDelete()}}>
    <IonIcon icon={returnUpForwardOutline}/>
    </Button>}
    {dropdown=="Delete" && items.filter((e: Item)=> e.deleted!=undefined && e.deleted>=0).length>0 && <Button className="ml-auto" variant="outline-secondary" onClick={() => {window.location.reload();}}>
    Clear cache <IonIcon icon={trashOutline}/>
    </Button>}
    {dropdown=="Delete" && <Button variant="secondary" block onClick={() => {deleteItem()}}>
    Remove selection
  </Button>}
   
     <InputGroup.Append>  
      <div>
            {(dropdown=="Special") && <Button variant="outline-secondary" onClick={() => {}}>{'Correct'}</Button>}
            {(dropdown=="Special") && <Button variant="outline-secondary" onClick={() => {}}>{'Similar'}</Button>}
            {(dropdown=="Special") && <Button variant="outline-secondary" onClick={() => {}}>{'Translate'}</Button>}
            {(dropdown=="Special") && <Button variant="outline-secondary" onClick={() => {}}>{'Explain'}</Button>}

            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'Q'}</Button>}
            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'A'}</Button>}
            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'Info'}</Button>}
            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'Detail'}</Button>}
            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'Tip'}</Button>}
            {(dropdown=="Augment") && <Button variant="outline-secondary" onClick={() => {}}>{'ID'}</Button>}

            {(dropdown=="Hide/Show") && <Button variant="outline-secondary" onClick={() => {}}>{'A'}</Button>}
            {(dropdown=="Hide/Show") && <Button variant="outline-secondary" onClick={() => {}}>{'Info'}</Button>}
            {(dropdown=="Hide/Show") && <Button variant="outline-secondary" onClick={() => {}}>{'Detail'}</Button>}
            {(dropdown=="Hide/Show") && <Button variant="outline-secondary" onClick={() => {}}>{'Tip'}</Button>}
            {(dropdown=="Hide/Show") && <Button variant="outline-secondary" onClick={() => {}}>{'ID'}</Button>} 
      </div>

     {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && status!="recording" && <Button variant="outline-secondary" onClick={() => {takePicture()}}><IonIcon icon={cameraOutline}/></Button>}
   <div> 
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status==="recording" && <Button variant="outline-secondary" onClick={() => {stopRecording()}}>Stop</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status==="recording" && !paused && <Button variant="outline-secondary" onClick={() => {pauseRecording();setPaused(true)}}>Pause</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status==="recording" && paused && <Button variant="outline-secondary" onClick={() => {resumeRecording();setPaused(false)}}>Resume</Button>} 
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status!=="ready" && {status}.status!=="recording" && <Button variant="outline-secondary" onClick={() => {getMediaStream();startRecording()}}><IonIcon icon={micCircleOutline}/></Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && false && <Button variant="outline-secondary" onClick={() => {getMediaStream()}}>Get Permission</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status==="recording" && !paused && <Button variant="outline-secondary" disabled><IonSpinner className="hw1" name="bubbles"/></Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && {status}.status!=="stopped" && {status}.status!=="recording" && status!=="idle" && paused && <Button variant="outline-secondary" disabled><IonSpinner className="hw1" name="dots"/></Button>}
    </div>
    
    </InputGroup.Append>
  </InputGroup> 
      </div>  

  
    </IonPage>
  );
};

export default Tab1;
