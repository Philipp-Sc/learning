import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import AppContainer from '../components/AppContainer';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage> 
      <IonContent fullscreen> 
        <AppContainer name="Introduction page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
