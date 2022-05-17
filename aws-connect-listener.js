// localStorage.removeItem('connectPopupManager::connect::loginPopup');

const CCP_OPTIONS = {
    region: "us-east-1", // Region of the instance
    ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
    ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
    ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
    loginPopupAutoClose: true,
    // LOGIN
    loginPopup: false, // Show a popup window to authenticate
    loginPopupAutoClose: true, // Auto close login popup after auth
    loginOptions: {
        autoClose: true,
        height: 600,
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
}

class ConnectListener {
    // Data about instance
    isInitialized;
    instanceURL;
    
    onInstanceInitialized;
    onInstanceTerminated;

    // Data about calls
    callStatus;
    callContact;


    onInitialized;
    onCallConnectingOrIncoming;
    onCallConnected;
    onCallPending;
    onCallMissed;
    onCallError;
    onCallEnded;
    onCallACW;
    onCallDestroy;

    currentContact;

    agent;

    /**
     * @param {HTMLElement} containerDiv 
     * @param {String} instanceURL 
     */
    constructor(containerDiv, instanceURL) {
        // Configure instance data
        this.instanceURL = instanceURL;
        this.isInitialized = false;
        // Init ccp
        connect.core.initCCP(containerDiv, {
            ccpUrl: this.instanceURL, // Required
            ...CCP_OPTIONS
        })
        // On initialized
        connect.core.onInitialized(() => {
            // Set as initialized
            this.isInitialized = true;
            this.onInstanceInitialized?.();

            // Listen to instance termination
            const eventBus = connect.core.getEventBus();
            eventBus.subscribe(connect.EventType.TERMINATED, () => {
                this.isInitialized = false;
                localStorage.removeItem('connectPopupManager::connect::loginPopup');
                this.onInstanceTerminated?.();
            });

            // Listen to agent
            connect.agent(agent => {
                agent.onRefresh(agent => {
                    this.agent = agent;
                })
            })
            // Listen to contact events
            connect.contact(contact => {
                contact.onRefresh(contact => {
                    this.callContact = contact;
                    // Avoid duplicate events
                    if (this.callStatus == contact.getState().type) return;
                    this.callStatus = contact.getState().type;
                    switch (this.callStatus) {
                        case connect.ContactStateType.INCOMING:
                        case connect.ContactStateType.CONNECTING:
                            this.onCallConnectingOrIncoming?.(contact);
                            break;
                        case connect.ContactStateType.PENDING:
                            this.onCallPending?.(contact);
                            break;
                        case connect.ContactStateType.CONNECTED:
                            this.onCallConnected?.(contact);
                            break;
                        case connect.ContactStateType.MISSED:
                            this.onCallMissed?.(contact);
                            break;
                        case connect.ContactStateType.ENDED:
                            this.onCallEnded?.(contact);
                            break;
                        case connect.ContactStateType.ERROR:
                            this.onCallError?.(contact);
                            break;
                    }
                })
                contact.onACW(() => {
                    this.callStatus = "after-call-work";
                    this.onCallACW?.(contact);
                })
                contact.onDestroy(() => {
                    this.callStatus = "destroyed";
                    this.onCallDestroy?.(contact);
                })
            })
        });
        
    }

    login(){
        if(this.isInitialized) return;
        connect.core.loginWindow = connect.core.getPopupManager().open(this.instanceURL, connect.MasterTopics.LOGIN_POPUP, {
            autoClose: true
        });
    }


    acceptIncomingCall() {
        this.currentContact?.accept();
    }
    rejectIncomingCall() {
        this.currentContact?.reject();
    }

}
