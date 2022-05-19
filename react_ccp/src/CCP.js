import { Component } from "react";
import React from "react";
import "amazon-connect-streams";
import isBrowserCompatible from "./compatibility";

class CCP extends Component {
    constructor(props) {
        super(props);
        this.instanceURL = props.instanceURL
    }

    componentDidMount() {
        if (!isBrowserCompatible) {
            document.getElementById("ccp").innerText="Sorry, browser not supported. Please switch to one of the three latest versions of Chrome or Firefox."
        }
        else {
            connect.core.initCCP(document.getElementById("ccp"), {
                // CONNECT CONFIG
                ccpUrl: this.instanceURL, // Required
                region: "us-east-1", // Region of the instance
                ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
                ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
                ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
                // LOGIN
                loginPopup: true, // Show a popup window to authenticate
                loginPopupAutoClose: true, // Auto close login popup after auth
                loginOptions: {
                    autoClose: true,
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
            })
        }
    }

    render() {
        return <></>
    }
}

export default CCP