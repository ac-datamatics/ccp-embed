import { toHaveStyle } from "@testing-library/jest-dom/dist/matchers";

export default class ScreenRecorder {
    constructor({
        onstop
    }) {
        this.data = [];
        this.stream = null;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.onstop = onstop;
    }


    async start() {
        if (this.isRecording) throw new Error("[ScrenRecorder] Already recording");
        // Prompr for permission and window
        this.stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "monitor"
            }
        });
        // Create a media recorder
        this.mediaRecorder = new MediaRecorder(this.stream);
        // Event listener
        this.mediaRecorder.addEventListener('stop', e=>{
            this.onstop?.(e);
        })
        this.mediaRecorder.addEventListener('dataavailable', e=>{
            this.data.push(e.data)
        })
        // Start recording
        this.isRecording = true;
        this.mediaRecorder.start();
    }

    stop() {
        if (this.stream == null) throw new Error("[ScreenRecorder] Stream not available")
        if (!this.isRecording) return;
        // Stop all tracks
        this.isRecording = false;
        this.stream.getTracks().forEach(track => track.stop());
    }

    getDataBlob() {
        return new Blob(this.data, {
            type: this.data[0].type
        })
    }

    downloadVideo() {
        const data = URL.createObjectURL(this.getDataBlob());
        const link = document.createElement('a');
        link.href = data;
        link.download = 'test';

        link.dispatchEvent(
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            })
        );
    }
}
