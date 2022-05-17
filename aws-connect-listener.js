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
    // Instances
    isInitialized;
    instanceURL;
    onInstanceInitialized;
    onInstanceTerminated;

    // Data about calls
    callStatus;
    callContact;
    onCallConnectingOrIncoming;
    onCallConnected;
    onCallPending;
    onCallMissed;
    onCallError;
    onCallEnded;
    onCallACW;
    onCallDestroy;

    // Agent
    agent;

    /**
     * @param {HTMLElement} containerDiv 
     * @param {String} instanceURL 
     */
    constructor(containerDiv, instanceURL) {
        // Configure instance data
        this.instanceURL = instanceURL;
        this.isInitialized = false;
        // Restore
        this.callContact = null;
        this.callStatus = null;
        // Init ccp
        connect.core.initCCP(containerDiv, {
            ccpUrl: this.instanceURL, // Required
            ...CCP_OPTIONS
        })

        const eventBus = connect.core.getEventBus();
        // Listen to instance termination
        eventBus.subscribe(connect.EventType.TERMINATED, () => {
            this.isInitialized = false;
            this.onInstanceTerminated?.();
        });
        // Listen to init
        eventBus.subscribe(connect.EventType.INIT, () => {
            this.isInitialized = true;
            this.onInstanceInitialized?.();
            // Get current agent
            connect.agent(agent => {
                this.agent = agent;
            })
            // Listen to contacts
            connect.contact(contact => {
                // Avoid duplicates
                if(this.callContact.getContactId() == contact.getContactId()) return;
                // Store new contact
                this.callContact = contact;
                // Events
                this.callContact.onRefresh(contact => {
                    // Avoid duplicate events
                    if(this.callStatus == contact.getState().type) return;
                    this.callStatus = contact.getState().type;
                    // Listen to acw
                    contact.onACW(() => {
                        this.callStatus = "after-call-work";
                        this.onCallACW?.(contact);
                    })
                    // Listen to call destroy
                    contact.onDestroy(() => {
                        this.callStatus = "destroyed";
                        this.onCallDestroy?.(contact);
                    })
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
                });
            });
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
