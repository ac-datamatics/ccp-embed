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

    async getScreen() {
        // Prompt for permission and window
        if (!this.stream || !this.stream.active) {
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
                this.data.push(e.data);
            })
        }
    }
    
    start() {
        if (this.isRecording) throw new Error("[ScrenRecorder] Already recording");
        
        // Start recording
        this.isRecording = true;
        this.mediaRecorder.start();
        console.debug('started recording');
    }

    stop() {
        if (!this.stream) throw new Error("[ScreenRecorder] Stream not available")
        if (!this.isRecording) return;
        // Stop all tracks
        this.isRecording = false;
        this.stream.getTracks().forEach(track => track.stop());
        console.debug('stopped recording');
    }

    getDataBlob() {
        let blob = new Blob(this.data, {
            type: this.data[0].type
        });
        console.debug(URL.createObjectURL(blob));
        return blob;
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
