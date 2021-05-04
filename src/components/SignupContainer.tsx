import React from 'react';
import './ExploreContainer.css';
import { IonLoading, IonContent, IonItem, IonLabel, IonList, IonListHeader, IonSelect, IonSelectOption, IonPage, IonItemDivider } from '@ionic/react';

interface ContainerProps {
  name: string;
}

const SignupContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container" id="faq">
      <strong>Join the Beta.</strong> 
      <p className="signup">
      	 This is a beta version of the app, invites only.
      	<br/>
         If you want to see more text samples than are available to you as guest, you need to pay a small fee. 
         The fee covers the time and effort to create the samples including the servers and development costs.</p>

     <IonList className="pricing">
         <IonItem> 
      		<div><p><b>Guest</b><br/>100 requests total </p><p className="price">Free</p></div>
         </IonItem>
         <IonItem> 
      		<div><p><b>Writer</b><br/>500 requests/month, Default Writer Model</p><p className="price">$13/month</p></div>
         </IonItem>
         <IonItem> 
      		<div><p><b>Writer Pro</b><br/>500 requests/month, Advanced Writer Model</p><p className="price">$27/month</p></div>  
         </IonItem>
         <IonItem> 
      		<div><p><b>Writer Pro Plus</b><br/>1000 requests/month, Expert Writer Model, Support</p><p className="price">$55/month</p></div>
         </IonItem>
         <IonItem> 
      		<div><p><b>VIP</b><br/>1000 requests/month, Expert Writer Model, Support, Bonus Features</p><p className="price">$99/month</p></div>
         </IonItem> 
    </IonList>

      <p>*Prices are subject to change as we update our service.</p>
      <p>The Writer Models influence to app's the ability to generate content. The Default Writer Model works good overall, but you might need experiment more. In contrast the Advanced Writer Model and the Expert Model generate great content more consistently. </p>
      <p><br/>Above all, this software is intended to be used as a tool for writers, not as a tool for cheating.     
         Anyone who wants to use this tool for cheating will have their account deleted. (Cheating may refer to exploiting the system or creating harmful content.)   
    </p>
      <br/> 
      <br/> 
      <p>Write me and get invited to the private beta.</p>
      <p>Contact: philipp@schluetermann.de</p>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
         
        </div>
  );
};

export default SignupContainer; 