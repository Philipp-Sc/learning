import React from 'react';
import './ExploreContainer.css';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'; 
import { IonGrid, IonRow, IonCol } from '@ionic/react'; 
import { useHistory } from "react-router-dom";
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { IonTextarea, IonItemDivider, IonList } from '@ionic/react';
import { useState } from 'react';
interface ContainerProps {
  name: string;
}

const PlanContainer: React.FC<ContainerProps> = ({ name }) => {
    const [text, setText] = useState<string>();
	  const history = useHistory();
	  const handleAbout = () => { 
	  	 history.push("/about");
  		};
	  const handlePolicy = () => { 
		 history.push("/policy");
		};
	  const handleSignup = () => { 
		history.push("/signup");
		};
	  const handleFAQ = () => { 
		history.push("/faq");
		};

  return (
    <div className="container" id="plan">        
     
   
    </div>
  );
};

export default PlanContainer;


