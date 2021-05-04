import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import AboutContainer from '../components/AboutContainer';
import './Tab2.css';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Best Ever Training App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <AboutContainer name="About page" />
      </IonContent>
    </IonPage>
  );
};

export default About;
