import React from 'react';
import './ExploreContainer.css';

interface ContainerProps {
  name: string;
}

const FaqContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container" id="faq"> 
      <strong>General</strong><br/><br/>
      <b>Why did you create this?</b>
      <p>I want to help writers better understand emotion in writing. You can now devote more time to being creative and thinking about other subject relevant changes to your story. You can now use that time for research or even any improvement of your writing skills If you are stuck with writer's block, the program will guarantee that you will put at least one more word on your page. But the app is as good as the emotion you are willing to use, so choose carefully.</p>
      <br/>
      <strong>Pricing</strong><br/><br/>
      <b>What happens if the limit is reached?</b> 
      <p>The limit of 10 text samples can be removed by paying a small fee.</p>
      <br/>
      <b>Are you going to make any money from this?</b>
      <p>The app is free. There is a limit of 10 text samples. If you want to remove the limit altogether, there is a small fee.</p>
      <br/>
      <b>Why are you charging for the text samples?</b>
      <p>I want to prevent people from using the app to generate hate speech as well as to cover my costs.</p>
      <br/>
      <strong>Features</strong><br/><br/>
	  <b>Why does the app only generate the emotions "suspicion", "trust", "disgust", "fear", "joy", "surprise", "sadness", "anticipation", and "dislike"?</b>
	  <p>These emotions are the primary emotions. Every other emotion is built on these emotions. More specific emotions might be added in the future.</p>
	  <br/>
    <b>Why do you only show how the emotions are expressed in fantasy, romance and crime?</b>
    <p>This is a beta version of the app. I'm working on integrating more genres.</p><br/>
    <b>I want to generate text with a specific topic.</b>
    <p>Contact me at philipp@schluetermann.de, I will consider your request.</p><br/>
	  <strong>Safety</strong><br/><br/>
	  <b>What are you doing to prevent misuse?</b>
	  <p>We might disable the random button if we detect potential harmful content repeatedly. As a result some emotions or gernes might be blocked if misuse is detected.</p>
	  <p>To stop people misusing the generated text we have a limit of 10 text samples. If you want to see more text samples, you need to pay a small fee. This helps prevent people from misusing the generated text.</p>
	  <strong>Data</strong><br/><br/>
	  <b>Who owns the generated text?</b>
	  <p>You do. You own all the rights to the generated text. You can do whatever you want with it. To detect migate security risks each text sample is logged, we use the data to help improve the app and prevent misuse.</p>
     </div>
  );
};

export default FaqContainer;

/* <b>What happens if I want to transfer the style of the text sample into my own writing?</b>
      <p>The style of the text sample will be transferred into your own writing for free.</p>
      <br/>  <b>Can I save the generated text?</b>
      <p>No, you can not. The text will disappear as soon as you click on a different emotion. Writer Emotion is to help you understand how different emotions are expressed in writing. So you can improve your own writing. It is not intended to replace your writing. That being said you are still able to copy the text manualy.</p>
  */