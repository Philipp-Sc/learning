import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import FaqContainer from '../components/FaqContainer';
import './Tab2.css';

const Faq: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>FAQ</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Best Ever Training App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <FaqContainer name="FAQ page" />
      </IonContent>
    </IonPage>
  );
};

export default Faq;
