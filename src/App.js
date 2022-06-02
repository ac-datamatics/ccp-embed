import './App.css';
import CCP from './CCP';
import React, { useState, useRef } from "react";
import RecordRTC from "recordrtc";
import Amplify, {Storage } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App() {
    // Used to call methods of the object

    const ccp = React.createRef();

    const [stream, setStream] = useState(null);
    // const [isRecording, setIsRecording] = useState(null);  BORRAR????
    const recorderRef = useRef(null);

    const getScreen = async (getConfirm = false) => {
        if (!stream || !stream.active) {       // Get screen if necessary
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "monitor",
                },
                audio: false,
            });

            setStream(mediaStream);
            recorderRef.current = new RecordRTC(mediaStream, {
                type: "video",
            });
        }
    }

    const startRecording = () => {
        // If isn't recording
        if (recorderRef.current.getState() === "recording") return;
        recorderRef.current.startRecording();
    };

    const stopRecording = async () => new Promise((resolve, reject) => {
        if (!recorderRef.current) return;       // Recording doesn't exist
        if (recorderRef.current.getState() === "stopped") return;    // Not recording

        recorderRef.current.stopRecording(function() {
            resolve(this.getBlob());
        });
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
                    stream.getVideoTracks().forEach( track => track.stop() );
                }}
                onAgent={async (agent) => {
                    // Called after initialization, when an agent is assigned to the ccp
                    agent.setState(agent.getAgentStates()[1], {
                        success: () => { },
                        failure: (err) => { console.debug('not changed') },
                       },
                    );
                }}
                onAgentStateChange={async (state) => {
                    // Called when the agent's state changes (ie, they are online/offline, in a call or on acw)
                    // When agent gets online
                    if(state?.newState === 'Available' && state?.oldState === 'Offline') {
                        await getScreen();
                    }
                    else if(state?.newState === 'Offline') {
                        stream.getVideoTracks().forEach( track => track.stop() );
                    }
                    console.debug(state.newState)
                }}
                onContact={(contact) => {
                    // Called when new info of a contact is received
                }}
                onIncomingContact={async (contact) => {
                    // Called when there is an incoming contact (eg, the phone is ringing)
                    await getScreen(true);
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
                    startRecording(contact);
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
                    let heyBlob = await stopRecording();

                    // Here, the stored recording should be uploaded to S3
                    Storage.put(`recordings/${contact.getContactId()}.webm`, heyBlob, {
                        level: "public",
                        contentType: "video/webm",
                    });

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
