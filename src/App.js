import './App.css';
import React from 'react';
import CCP from './CCP';
import ScreenRecorder from './ScreenRecorder';
import {uploadFile, uploadVideo} from './uploadS3';

import Amplify, { Auth, Storage } from 'aws-amplify';

import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

// Amplify.configure({
//     Auth: {
//         identityPoolId: 'us-east-1:632fe465-4c6b-49a7-bcb0-ddc9cf0e16ee', //REQUIRED - Amazon Cognito Identity Pool ID
//         region: 'us-east-1', // REQUIRED - Amazon Cognito Region
//         // userPoolId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito User Pool ID
//         // userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
//     },
//     Storage: {
//         AWSS3: {
//             bucket: 'ac-datamatics', //REQUIRED -  Amazon S3 bucket name
//             region: 'us-east-1', //OPTIONAL -  Amazon service region
//         }
//     }
// });

function App() {
  //const credentials = Auth.currentCredentials();
  // credentials.then ( imprimir => console.log(imprimir));
  // uploadFile();
    let blob;
    // Used to call methods of the object
    const ccp = React.createRef();
    const recorder = new ScreenRecorder({
      onstop: (e)=>{
        blob = recorder.getDataBlob();
      }
    });
    return (
      <div className="App">
          <p>+52 55 4440 5475</p>
          <CCP 
            instanceURL={"https://ac-datamatics.my.connect.aws/ccp-v2"} 
            ref={ccp}
            style={{
              height: '500px', 
              width: '500px',
              backgroundColor: 'grey'
            }}
            key={"CCP"}
            onInstanceConnected={(__ccp) => {
              // Called on instance init, when an agent logs in
            }}
            onInstanceTerminated={async () => {
              // Called on instance termination, when an agent logs out

            }}
            onAgent={async (agent)=>{
              // Called after initialization, when an agent is assigned to the ccp
              //let type = ccp.current.getAgentType();
            }}
            onAgentStateChange={async (state) => {
              // Called when the agent's state changes (ie, they are online/offline, in a call or on acw)
              // Get screen 
              if(state.newState === 'Available' || state.newState === 'PendingBusy') {
                console.debug(state.newState);
                await recorder.getScreen();
              }
              console.debug(state.newState)
            }}
            onContact={(contact) => {
              // Called when new info of a contact is received
            }}
            onIncomingContact={async (contact) => {
              // Called when there is an incoming contact (eg, the phone is ringing)
              // Here the option to answer and start recording should be shown
              if(window.confirm("Answer")){
                contact.accept();
                recorder.start();
              } else {
                contact.reject()
              }
            }}
            onPendingContact={(contact) => {
              // Called before the connectedContact event. The contact is pending
              // https://github.com/amazon-connect/amazon-connect-streams/blob/master/Documentation.md#contactonpending
            }}
            onMissedContact={(contact) => {
              // Called When the contact was missed
            }}
            onConnectedContact={(contact) => {
              // Called when the contact is connected (the call has started)
            }}
            onEndedContact={(contact) => {
              // Called when either party hangs up
            }}
            onErrorContact={(contact) => {
              // Called in case of error
            }}
            onRejectedContact={(contact) => {
              // Called if the contact was rejected or declined
            }}
            onDestroyContact={async (contact) => {
              // Called after acw, when the agent closes the communication with the contact
              // Stop recording
              recorder.stop();

              // Here, the stored recording should be uploaded to S3
              await uploadVideo(blob);

              // Here, a lambda must be called to insert the recording's data into the database
              const data = {
                agentId: ccp.current.agent.getConfiguration().username,
                // callStartUTCDate: contact.getQueueTimestamp().toISOString(),
                contactId: contact.getContactId(),
                queueId: contact.getQueue().queueId
              }
            }}
            onAfterCallWork={(contact) => {
              // Called after the call has ended but the agent is still working
            }}
          />
      </div>
    );
  }

export default App;