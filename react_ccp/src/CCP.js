import { Component } from "react";
import React from "react";
import "amazon-connect-streams";
import isBrowserCompatible from "./compatibility";

class CCP extends Component {
    static i = 0;
    constructor(props) {
        super(props);
        this.containerDiv = React.createRef();
        this.instanceURL = props.instanceURL
        this.state = {
            initialized: false
        }
        this.__loginWindow;
        this.__terminatedSubscription;
        this.__updateConnectedSubscription;
    }

    componentWillUnmount(){
        connect.core.getEventBus().unsubscribeAll();
    }

    componentDidMount() {
        if (!isBrowserCompatible) {
            this.containerDiv.current.innerHTML = "Sorry, browser not supported. Please switch to one of the three latest versions of Chrome or Firefox."
            return;
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
        this.__terminatedSubscription?.unsubscribe();
        this.__terminatedSubscription = connect.core.getEventBus().subscribe(connect.EventType.TERMINATED, () => {
            if(!this.state.initialized) return;
            this.setState({ initialized: false });
            // Callback
            this.props.onInstanceTerminated?.();

        });
        // On connected to ccp
        this.__updateConnectedSubscription?.unsubscribe();
        this.__updateConnectedSubscription = connect.core.getEventBus().subscribe(connect.EventType.UPDATE_CONNECTED_CCPS, () => {
            if(this.state.initialized) return;
            this.setState({ initialized: true });
            // Close login window
            this.__loginWindow?.close();
            // Callback
            this.props.onInstanceConnected?.();
            // Listen to agents 
            connect.agent(agent => {
                if(agent.getConfiguration().username == this.agent?.getConfiguration().username) return;
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
            // Previous contact
            let previousContactID = null;
            // Listen to contacts
            connect.contact(contact => {
                alert(contact.getContactId());
                // Listen to contacts only once
                if(contact.getContactId() == previousContactID) return;
                previousContactID = contact.getContactId();
                // Callback
                this.props.onContact?.(contact);
                // Store previous state
                let previousState = null;
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
            return "Admin";
        } catch(e){
            return "CallCenterManager";
        }
    }

    render() {
        if (!isBrowserCompatible()) return <div> This browser is not compatible </div>
        return (
            <div style={this.props.style}>
                <div ref={this.containerDiv} style={{display: this.state.initialized ? 'flex' : 'none', flex: 1, height: '100%', width: '100%'}}></div>
                <div style={{ display: this.state.initialized ? 'none' : 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%' }}>
                    <h1>Please login here</h1>
                    <button onClick={this.openLoginPopup.bind(this)}>Login</button>
                </div>
            </div>
        )
    }

}

export default CCP