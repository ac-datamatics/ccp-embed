import './App.css';
import React from 'react';
import isBrowserCompatible from './compatibility';
import CCP from './CCP';

function App() {
    // Used to call methods of the object
    const ccp = React.createRef();
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
            onInstanceTerminated={() => {
              // Called on instance termination, when an agent logs out
            }}
            onAgent={(agent)=>{
              // Called after initialization, when an agent is assigned to the ccp
              let type = ccp.current.getAgentType();
              alert(type)
            }}
            onAgentStateChange={(state) => {
              // Called when the agent's state changes (ie, they are online/offline, in a call or on acw)
            }}
            onContact={(contact) => {
              // Called when new info of a contact is received
            }}
            onIncomingContact={(contact) => {
              // Called when there is an incoming contact (eg, the phone is ringing)
              // Here the option to answer and start recording should be shown
              alert("Incoming call");
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
            onDestroyContact={(contact) => {
              // Called after acw, when the agent closes the communication with the contact
              // Here, the stored recording should be uploaded to S3
              // Here, a lambda must be called to insert the recording's data into the database
            }}
            onAfterCallWork={(contact) => {
              // Called after the call has ended but the agent is still working
            }}
          />
      </div>
    );
  }

export default App;
