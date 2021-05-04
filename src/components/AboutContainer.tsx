import React from 'react';
import './ExploreContainer.css';

interface ContainerProps {
  name: string;
}

const AboutContainer: React.FC<ContainerProps> = ({ name }) => {
  return ( 
    <div className="container" id="app">
      <strong>{name}</strong>
      <p>The following are the primary emotions, every other emotions are built on them:</p>
      <ul>
        <li>Scared</li>
        <li>Angry</li>
        <li>Sad</li>
        <li>Happy</li>
        <li>Disgusted</li>
        <li>Surprised</li>
        <li>Trust</li>
        <li>Joy</li>
        <li>Anticipation</li>
        <li>...</li>
      </ul>
      <p>If you're a writer, you'll want to get a feel for how these emotions are expressed in writing.</p>
      <p>So, I built an app to help you better understand how to use these emotions in your own writing.</p>
      <p>It's called Writer Emotion.</p>
      <p>Writer Emotion is a web app that helps you better understand how to use different emotions in your own writing.</p>
      <p>Just click on a selection, and you'll see how the emotion is expressed in writing.</p>
      <br/> 
      <br/>
      <br/>
    </div>
  );
};

export default AboutContainer;
