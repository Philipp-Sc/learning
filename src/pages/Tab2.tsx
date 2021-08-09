import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import AppContainer from '../components/AppContainer';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage> 
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Best Ever Training App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AppContainer name="Introduction page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
