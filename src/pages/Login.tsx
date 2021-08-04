import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react'; 
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { personCircle } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { IonLoading, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import './Login.css';

import firebase from "firebase/app";
// Add the Firebase services that you want to use
import "firebase/auth";

function validateEmail(email: string) {
    const re = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/;
    return re.test(String(email).toLowerCase());
}
const Login: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(""+(localStorage.getItem('email')==null ? "" : localStorage.getItem('email')));
  const [password, setPassword] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isloggedin, setLoggedin] = useState<boolean>(false);
  const handleLogin = () => {
    setLoading(true);
    if (!email) {
        setMessage("Please enter a valid email");
        setIserror(true);
        return;
    }
    if (validateEmail(email) === false) {
        setMessage("Your email is invalid");
        setIserror(true);
        return;
    }

    if (!password || password.length < 6) {
        setMessage("Please enter your password");
        setIserror(true);
        return;
    }
     firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function() {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithEmailAndPassword(email, password).then(res => {  
          if(res.user && res.user.uid){
            localStorage.setItem("user_uid",res.user.uid); 
            setLoggedin(true)  
            firebase.firestore().collection('user_data').doc(res.user.uid).collection('meta_data').doc("last_login").set({date: new Date().getTime()}, {merge: true})
            firebase.firestore().collection('user_data').doc(res.user.uid).collection('public') 
            .orderBy('timestamp', 'desc')
            .get().then(user_data => {
              var data_ : string[] = []
              user_data.forEach(doc => data_.push(JSON.stringify(doc.data())))
              //data_.reverse();
              localStorage.setItem("user_data",JSON.stringify(data_)); 
              history.push("/tab2");
              setLoading(false);  
              document.dispatchEvent(new Event('login'));
            })
          }
            //console.log(res) 
         }).catch(function(error) {
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            setMessage("Auth failure! Please create an account");
            setIserror(true)
            // ...
          }); 
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    

  };
  const handleLogout = () => {
    firebase.auth().signOut().then(function() {
      localStorage.removeItem("isloggedin");  
      localStorage.removeItem("user_uid");  
      localStorage.removeItem("user_data"); 
      setLoggedin(false)               
      document.dispatchEvent(new Event('logout'));
    }).catch(function(error) {
      setMessage("Signout failure!");
      setIserror(true)
    });
  };

  if(isloggedin==true){
    return (<IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding ion-text-center">
        <IonGrid> 
        <IonRow>
          <IonCol>
            <IonIcon
                style={{ fontSize: "70px", color: "#0040ff" }}
                icon={personCircle}
            />
          </IonCol>
        </IonRow>
          <IonRow>
            <IonCol>
            <IonItem>
            <IonLabel position="floating"> Email</IonLabel>
            <IonInput disabled
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                >
            </IonInput>
            </IonItem>
            </IonCol>
          </IonRow>
 
          <IonRow>
            <IonCol> 
              <IonButton expand="block" onClick={handleLogout}>Logout</IonButton>
            </IonCol>
          </IonRow>
          <IonLoading
        cssClass='my-custom-class'
        isOpen={loading}
        onDidDismiss={() => setLoading(false)}
        message={'Please wait...'}
        duration={5000}
      />
        </IonGrid>
      </IonContent>
    </IonPage>);
  }

  return (
    <IonPage> 
      <IonContent fullscreen className="ion-padding ion-text-center">
        <IonGrid>
        <IonRow>
          <IonCol>
            <IonAlert
                isOpen={iserror}
                onDidDismiss={() => setIserror(false)}
                cssClass="my-custom-class"
                header={"Error!"}
                message={message}
                buttons={["Dismiss"]}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonIcon
                style={{ fontSize: "70px", color: "#0040ff" }}
                icon={personCircle}
            />
          </IonCol>
        </IonRow>
          <IonRow>
            <IonCol>
            <IonItem>
            <IonLabel position="floating"> Email</IonLabel>
            <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                >
            </IonInput>
            </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
            <IonItem>
              <IonLabel position="floating"> Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                >
              </IonInput>
            </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <p style={{ fontSize: "small" }}>
                  By clicking LOGIN you agree to our <a href="#">Policy</a>
              </p>
              <IonButton expand="block" onClick={handleLogin}>Login</IonButton>
              <p style={{ fontSize: "medium" }}>
                  Don't have an account? <a href="/tab1">Sign up!</a>
              </p>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
