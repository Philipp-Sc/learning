import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AppContainer from '../components/AppContainer';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage> 
      <IonContent fullscreen> 
        <AppContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
