import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PolicyContainer from '../components/PolicyContainer';
import './Tab2.css';

const Policy: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Policy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Best Ever Training App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <PolicyContainer name="Policy page" />
      </IonContent>
    </IonPage>
  );
};

export default Policy;
