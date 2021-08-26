import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter, IonReactMemoryRouter } from '@ionic/react-router';
import { createMemoryHistory} from 'history';

import { createGesture, Gesture } from '@ionic/react';

//import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Faq from './pages/Faq';
import Signup from './pages/Signup';
import Policy from './pages/Policy';
import About from './pages/About';
import Login from './pages/Login';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';


// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDDn_F8D25raobRa_rFbIiAaRkGj_V19gs",
    authDomain: "learning-b6f1c.firebaseapp.com",
    projectId: "learning-b6f1c",
    storageBucket: "learning-b6f1c.appspot.com",
    messagingSenderId: "864390809094",
    appId: "1:864390809094:web:897186e3f220d37350e587",
    measurementId: "G-01VVCXZXRN"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

const App: React.FC = () => { 

  const browserHistory = createMemoryHistory();

  // fixes annoying unintended iOS left swipe
  let gesture = createGesture({
          el: document.getElementById('root'),
          threshold: 0,
          gestureName: 'my-gesture',
          gesturePriority: 40.5, // priority of swipe to go back is 40 
          onMove: ev => console.log(ev)
        });
  gesture.enable(true);

  return (
   <IonApp>
    <IonReactMemoryRouter history={browserHistory}>
      <IonTabs>
        <IonRouterOutlet swipeGesture={false}>
          <Route path="/faq" component={Faq} exact={true} />
          <Route path="/signup" component={Signup} exact={true} />
          <Route path="/about" component={About} exact={true} />
          <Route path="/policy" component={Policy} exact={true} />
          <Route path="/tab1" component={Tab1} exact={true} />
          <Route path="/tab2" component={Tab2} exact={true} />
          <Route path="/tab3" component={Login} exact={true} />
          <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
          <Route render={() => <Redirect to="/tab1" />} exact={true} />
        </IonRouterOutlet>
        <IonTabBar className="tabBar" slot="top">
          <IonTabButton tab="tab1" href="/tab1">
            <IonLabel>Language</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonLabel>Chess</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonLabel>Login</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactMemoryRouter>
  </IonApp>
)};

export default App;
