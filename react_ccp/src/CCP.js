import { Component } from "react";
import React from "react";
import "amazon-connect-streams";
import isBrowserCompatible from "./compatibility";

class CCP extends Component {
    constructor(props) {
        super(props);
        this.containerDiv = React.createRef();
        this.instanceURL = props.instanceURL
        this.state = {
            initialized: false
        }
        this.__loginWindow;
    }

    componentDidMount() {
        if (!isBrowserCompatible) {
            this.containerDiv.current.innerHTML = "Sorry, browser not supported. Please switch to one of the three latest versions of Chrome or Firefox."
            return
        }
        connect.core.initCCP(this.containerDiv.current, {
            // CONNECT CONFIG
            ccpUrl: this.instanceURL, // Required
            region: "us-east-1", // Region of the instance
            ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
            ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
            ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
            // LOGIN
            loginPopup: false, // Show a popup window to authenticate
            loginPopupAutoClose: false, // Auto close login popup after auth
            loginOptions: {
                autoClose: false,
                height: 400,
                width: 400,
                top: 0,
                left: 0
            },
            // PHONE OPTIONS
            softphone: {
                allowFramedSoftphone: true,   // optional, defaults to false
                disableRingtone: false,       // optional, defaults to false
                ringtoneUrl: false // optional, defaults to CCP’s default ringtone if a falsy value is set
            },
            pageOptions: { //optional
                enableAudioDeviceSettings: false, //optional, defaults to 'false'
                enablePhoneTypeSettings: false //optional, defaults to 'true' 
            },
        });
        // On ccp instance terminated
        connect.core.getEventBus().subscribe(connect.EventType.TERMINATED, () => {
            this.setState({ initialized: false });
            // Callback
            this.props.onInstanceTerminated?.();
        });
        // On connected to ccp
        connect.core.getEventBus().subscribe(connect.EventType.UPDATE_CONNECTED_CCPS, () => {
            this.setState({ initialized: true });
            // Close login window
            this.__loginWindow?.close();
            // Callback
            this.props.onInstanceConnected?.();
            // Listen to agents 
            connect.agent(agent => {
                // Store agent
                this.agent = agent;
                // Callback
                this.props.onAgent?.(agent);
                // Listen to agent changes
                agent.onStateChange(state => {
                    // Avoid duplicate events
                    if (state.newState == state.oldState) return;
                    // Callback
                    this.props.onAgentStateChange?.(state);
                });
            });
            // Listen to contacts
            connect.contact(contact => {
                // Callback
                this.props.onContact?.(contact);
                // Store previous state
                let previousState = contact.getState().type;
                // Listen to contact changes
                contact.onRefresh(contact => {
                    if (contact.getState().type == previousState) return;
                    previousState = contact.getState().type;
                    switch (previousState) {
                        case connect.ContactStateType.INCOMING:
                        case connect.ContactStateType.CONNECTING:
                            return this.props.onIncomingContact?.(contact);
                        case connect.ContactStateType.PENDING:
                            return this.props.onPendingContact?.(contact);
                        case connect.ContactStateType.MISSED:
                            return this.props.onMissedContact?.(contact);
                        case connect.ContactStateType.CONNECTED:
                            return this.props.onConnectedContact?.(contact);
                        case connect.ContactStateType.ENDED:
                            return this.props.onEndedContact?.(contact);
                        case connect.ContactStateType.ERROR:
                            return this.props.onErrorContact?.(contact);
                        case connect.ContactStateType.REJECTED:
                            return this.props.onRejectedContact?.(contact);
                    }
                })
                // Listen to contact events
                contact.onACW(() => {
                    if (previousState == "after-call-work") return;
                    previousState = "after-call-work";
                    this.props.onAfterCallWork?.();
                });
                contact.onDestroy(() => {
                    if (previousState == "destroy") return;
                    previousState = "destroy";
                    this.props.onDestroyContact?.(contact);
                });
            });

        });

    }

    openLoginPopup() {
        // Remove from localstorage the item that says the popup was shown
        localStorage.removeItem('connectPopupManager::connect::loginPopup');
        // Open login window
        this.__loginWindow = window.open(this.instanceURL, "window2", "popup=1");
    }

    getAgentType(){
        try{
            const permissions = this.agent.getPermissions();
            if(permissions.length == 1) return "Agent";
            else if(permissions.length == 2) return "Admin";
        } catch(e){
            return "CallCenterManager";
        }
    }

    render() {
        if (!isBrowserCompatible()) return <div> This browser is not compatible </div>
        return (
            <div>
                <div ref={this.containerDiv} style={{ display: this.state.initialized ? 'block' : 'none', height: '400px', width: '400px' }}></div>
                <div style={{ display: this.state.initialized ? 'none' : 'initial' }}>
                    <h1>Please login here</h1>
                    <button onClick={this.openLoginPopup.bind(this)}>Login</button>
                </div>
                <p>+52 55 4440 5475</p>
            </div>
        )
    }

}

export default CCP