import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import SignupContainer from '../components/SignupContainer';
import './Tab2.css';

const Signup: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Signup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Best Ever Training App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SignupContainer name="Signup page" />
      </IonContent>
    </IonPage>
  );
};

export default Signup;
