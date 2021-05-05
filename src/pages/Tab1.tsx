import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'; 
import './Tab1.css';
import { IonGrid, IonRow, IonCol, IonToggle, IonSpinner, IonBadge} from '@ionic/react'; 
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { micCircleOutline, cameraOutline } from 'ionicons/icons';

import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, DropdownButton, Dropdown, FormControl, Button, Modal} from 'react-bootstrap'

import MediaCapturer from 'react-multimedia-capture';

import {IonInfiniteScroll, IonInfiniteScrollContent, IonCard} from '@ionic/react';

import { Plugins, CameraResultType } from '@capacitor/core';

//import ReactAudioPlayer from 'react-audio-player';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

var hash = require('object-hash');


const Tab1: React.FC = () => {

  const inputRef = React.createRef<HTMLInputElement>();

  const { Camera } = Plugins;

  const takePicture = async() => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;
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
    var new_item = {"type":"imageUrl","value":imageUrl,"id":id,"timestamp":timestamp,"hash":hash([timestamp,id])};
    setItems([...items, new_item]);
    setSelectedItemHash(new_item.hash)
    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }

  const [dropdown, setDropdown] = useState<string>("New")

  const [show, setShow] = useState<boolean>(false);
 

  const [granted, setGranted] = useState<boolean>(false);
  const [rejectedReason, setRejectedReason] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
 
  interface Item {
    type: string;
    value: any;
    id: number;
    timestamp: number;
    hash: string;
  }

  const [items, setItems] = useState< Item []>([]);

  const [selectedItemHash, setSelectedItemHash] = useState<string>();


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


  const handleGranted = () => { 
    setGranted(true);
    console.log('Permission Granted!');
  };
  const handleDenied = (err) => {
    setRejectedReason(err.name) 
    console.log('Permission Denied!', err);
  };
  const handleStart = (stream) => {
    setRecording(true);
    console.log('Recording Started.');
  };
  const handleStop = (blob) => {
    setRecording(false);
    console.log('Recording Stopped.');
    downloadAudio(blob);
  };
  const handlePause = () => {
    setPaused(true);
  };
  const handleResume = (stream) => {
    setPaused(false);
  };
  const handleStreamClose = () => {
    setGranted(false);
  };
  const handleError = (err) => {
    alert(err);
  };

  const downloadAudio = (blob) => { 
    let url = URL.createObjectURL(blob);
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
    var new_item = {"type":"audioUrl","value":url,"timestamp":timestamp,"id":id,"hash":hash([timestamp,id])};
    setItems([...items, new_item]);
    setSelectedItemHash(new_item.hash); 
    
    /*
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);

    a.click();*/
  };

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
      var new_item = {"type":"text","value":content,"timestamp":timestamp,"id":id,"hash":hash([timestamp,id])}
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
 
 const deleteItem = async() => {
  if(selectedItemHash){
    setItems(items.filter(e => e.hash!=selectedItemHash))
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

      {items.sort((a, b) => {
    return b.id - a.id || b.timestamp - a.timestamp;
}).map((item: Item, i: number) => {
            if(item.type=="text"){
            return <div key={`${i}`}> 
    <IonCard>
  <InputGroup><InputGroup.Prepend><InputGroup.Radio name="groupOptions" checked={item.hash==(selectedItemHash || items[items.length-1].hash)} value={item.hash} onChange={(e) => {setSelectedItemHash(e.currentTarget.value)}}/> </InputGroup.Prepend><InputGroup.Append>
 <IonItem>
          <IonLabel>
            {item.value}
          </IonLabel>     
        </IonItem>
   </InputGroup.Append><InputGroup.Append className="ml-auto">
      <InputGroup.Text>{item.id}</InputGroup.Text>
    </InputGroup.Append></InputGroup></IonCard></div>
            }else if(item.type=="imageUrl"){
            return <div key={`${i}`}> 
    <IonCard className={item.hash==(selectedItemHash || items[items.length-1].hash) ? "shadow-lg mb-5 rounded" : ""}> 
  <img src={item.value} onClick={() => {setSelectedItemHash(item.hash)}}/></IonCard></div>
            }else if(item.type=="audioUrl"){
            return <div key={`${i}`}>
      
    <IonCard>
  <InputGroup><InputGroup.Prepend><InputGroup.Radio name="groupOptions" checked={item.hash==(selectedItemHash || items[items.length-1].hash)} value={item.hash} onChange={(e) => {setSelectedItemHash(e.currentTarget.value)}}/> </InputGroup.Prepend>
  <InputGroup>
   <AudioPlayer 
    src={item.value}
    onPlay={e => console.log("onPlay")}
    // other props here
  />
  </InputGroup><InputGroup.Append className="ml-auto">
      <InputGroup.Text>{item.id}</InputGroup.Text>
    </InputGroup.Append></InputGroup></IonCard></div>
            }
          })
        } 
    {items.length>=13 &&
     <IonInfiniteScroll threshold="10px" position="bottom"
          disabled={disableInfiniteScroll}
          onIonInfinite={(e) => searchNext(e)}>
          <IonInfiniteScrollContent
              loadingText="Loading more ...">
          </IonInfiniteScrollContent>
      </IonInfiniteScroll>}

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
      <Dropdown.Item onClick={() => {setDropdown("Iterate");}} >Iterate</Dropdown.Item> 
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

            {(dropdown=="Iterate") && <Button variant="outline-secondary" onClick={() => {}}>{'w/A'}</Button>}
            {(dropdown=="Iterate") && <Button variant="outline-secondary" onClick={() => {}}>{'w/Info'}</Button>}
            {(dropdown=="Iterate") && <Button variant="outline-secondary" onClick={() => {}}>{'w/Detail'}</Button>}
            {(dropdown=="Iterate") && <Button variant="outline-secondary" onClick={() => {}}>{'w/Tip'}</Button>}
            {(dropdown=="Iterate") && <Button variant="outline-secondary" onClick={() => {}}>{'w/ID'}</Button>} 
      </div>

     {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && !recording && <Button variant="outline-secondary" onClick={() => {takePicture()}}><IonIcon icon={cameraOutline}/></Button>}
          
     <MediaCapturer
          constraints={{ audio: true }}
          mimeType="audio/webm"
          timeSlice={10}
          onGranted={handleGranted}
          onDenied={handleDenied}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onError={handleError} 
          onStreamClosed={handleStreamClose}
          render={({ request, start, stop, pause, resume }) => 
          <div>
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && recording && !paused && <Button variant="outline-secondary" onClick={() => {stop()}}>Stop</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && recording && !paused && <Button variant="outline-secondary" onClick={() => {pause()}}>Pause</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && recording && paused && <Button variant="outline-secondary" onClick={() => {resume()}}>Resume</Button>} 
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && granted && !recording && <Button variant="outline-secondary" onClick={() => {start()}}><IonIcon icon={micCircleOutline}/></Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && !granted && <Button variant="outline-secondary" onClick={() => {request()}}>Get Permission</Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && recording && !paused && <Button variant="outline-secondary" disabled><IonSpinner className="hw1" name="bubbles"/></Button>}
            {(dropdown=="New" || dropdown=="Add" || dropdown=="Edit") && recording && paused && <Button variant="outline-secondary" disabled><IonSpinner className="hw1" name="dots"/></Button>}
          </div>
        } />
    </InputGroup.Append>
  </InputGroup> 
      </div>  

  
    </IonPage>
  );
};

export default Tab1;
