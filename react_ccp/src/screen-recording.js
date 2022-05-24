const startScreenRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            displaySurface: "monitor",
        },
    });

    const data = [];

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
        data.push(e.data);
    };

    mediaRecorder.start();

    document.getElementById("stop").addEventListener("click", {
        handleEvent: () => {
            stream.getTracks().forEach( track => track.stop());
        },
    });

    mediaRecorder.onstop = (e) => {
        document.querySelector("video").src = URL.createObjectURL(
            new Blob(data, {
                type: data[0].type,
            })
        );
    }
}