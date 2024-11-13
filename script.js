let video = document.getElementById("video");
let recordBtn = document.getElementById("record-btn");
let captureBtn = document.getElementById("capture-btn");
let timer = document.querySelector(".timer");
let filter = document.getElementById("filter");

let recorder; // stores undefined 
let chunks = []; // data is stored in the form of chunks/frames
let timerCount = 0; // seconds
let timerInterval;

let isRecording = false; // video recording flag

let constraints = {
    audio: true,
    video: true,
}

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;

        recorder = new MediaRecorder(stream);

        recorder.addEventListener("start", () => {
            chunks = [];

            // start timer for recording video
            timer.innerText = "00:00:00";
            timerInterval = setInterval(() => {
                timerCount++;
                let seconds = timerCount;

                let hours = Math.floor(seconds / 3600);
                seconds = seconds % 3600;

                let minutes = Math.floor(seconds / 60);
                seconds = seconds % 60;

                let computedTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
                timer.innerText = computedTime;
            }, 1000);
        })

        recorder.addEventListener("dataavailable", (event) => {
            chunks.push(event.data);
        })

        recorder.addEventListener("stop", () => {
            let blob = new Blob(chunks, { type: "video/mp4" });
            let videoUrl = URL.createObjectURL(blob);

            let a = document.createElement("a");
            a.href = videoUrl;
            a.download = "video.mp4";
            a.click();

            // stop timer 
            clearInterval(timerInterval);
            timerCount = 0;
        })

        recordBtn.addEventListener("click", () => {
            if (!recorder) return;

            isRecording = !isRecording;

            if (isRecording) { // start recording
                recorder.start();
                recordBtn.classList.add("flickering-anime");
            } else {
                recorder.stop();
                recordBtn.classList.remove("flickering-anime");
            }
        })

        captureBtn.addEventListener("click", (e) => {
            let canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // applying filter for image
            if (filter.value !== "none") {
                applyFilter(canvas, ctx, filter.value);
            }

            let img = canvas.toDataURL("image/png");
            let a = document.createElement("a");
            a.href = img;
            a.download = "image.png";
            a.click();
        })

        video.addEventListener("pause", () => {
            console.log("video paused");
            if (isRecording) {
                recorder.pause(); // pause recording when video paused while recording 
            }
        })
        video.addEventListener("play", () => {
            console.log("video played");
            if (isRecording) {
                recorder.resume(); // resume recording when video played again or resumed while recording 
            }
        })

        let alertShown = false; // Flag to track if the alert has been shown

        filter.addEventListener("change", () => {
            // Show the alert only once
            if (!alertShown) {
                alert("NOTE : The selected filter will only apply for the image when downloaded using Capture button.");
                alertShown = true; // Set the flag to true so the alert won't show again
            }

            // Get the filter value selected by the user
            const filterValue = filter.value;

            // Remove any existing filter classes
            video.classList.remove(
                "filter-none",
                "filter-grayscale",
                "filter-sepia",
                "filter-invert",
                "filter-brightness",
                "filter-contrast",
                "filter-saturation"
            );

            // Apply the selected filter class based on the filterValue
            switch (filterValue) {
                case "none":
                    video.classList.add("filter-none");
                    break;
                case "grayscale":
                    video.classList.add("filter-grayscale");
                    break;
                case "sepia":
                    video.classList.add("filter-sepia");
                    break;
                case "invert":
                    video.classList.add("filter-invert");
                    break;
                case "brightness":
                    video.classList.add("filter-brightness");
                    break;
                case "contrast":
                    video.classList.add("filter-contrast");
                    break;
                case "saturate":
                    video.classList.add("filter-saturation");
                    break;
                default:
                    console.log("Unknown filter:", filterValue);
                    break;
            }
        });

    })
    .catch((err) => {
        console.log(err);
    })

function applyFilter(canvas, ctx, filterName) {

    let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    switch (filterName) {
        case "grayscale":
            // Apply grayscale filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                let gray = pixels.data[i] * 0.2126 + pixels.data[i + 1] * 0.7152 + pixels.data[i + 2] * 0.0722;
                pixels.data[i] = gray;
                pixels.data[i + 1] = gray;
                pixels.data[i + 2] = gray;
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        case "sepia":
            // Apply sepia filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                let red = pixels.data[i] * 0.393 + pixels.data[i + 1] * 0.769 + pixels.data[i + 2] * 0.189;
                let blue = pixels.data[i] * 0.272 + pixels.data[i + 1] * 0.534 + pixels.data[i + 2] * 0.131;
                let green = pixels.data[i] * 0.349 + pixels.data[i + 1] * 0.686 + pixels.data[i + 2] * 0.168;

                pixels.data[i] = red;
                pixels.data[i + 2] = blue;
                pixels.data[i + 1] = green;
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        case "invert":
            // Apply invert filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i] = 255 - pixels.data[i];
                pixels.data[i + 2] = 255 - pixels.data[i + 2];
                pixels.data[i + 1] = 255 - pixels.data[i + 1];
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        case "brightness":
            // Apply brightness filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                let brightness = 40;
                pixels.data[i + 1] = Math.min(255, pixels.data[i + 1] + brightness);
                pixels.data[i] = Math.min(255, pixels.data[i] + brightness);
                pixels.data[i + 2] = Math.min(255, pixels.data[i + 2] + brightness);
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        case "contrast":
            // Apply contrast filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                let contrast = 1.5;
                pixels.data[i + 1] = Math.min(255, (pixels.data[i + 1] - 128) * contrast + 128);
                pixels.data[i] = Math.min(255, (pixels.data[i] - 128) * contrast + 128);
                pixels.data[i + 2] = Math.min(255, (pixels.data[i + 2] - 128) * contrast + 128);
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        case "saturation":
            // Apply saturation filter
            for (let i = 0; i < pixels.data.length; i += 4) {
                let saturation = 1.5; // 1.0 is no change, <1 is less saturated, >1 is more saturated
                let gray = pixels.data[i] * 0.2126 + pixels.data[i + 1] * 0.7152 + pixels.data[i + 2] * 0.0722;

                pixels.data[i + 1] = gray + (pixels.data[i + 1] - gray) * saturation;
                pixels.data[i] = gray + (pixels.data[i] - gray) * saturation;
                pixels.data[i + 2] = gray + (pixels.data[i + 2] - gray) * saturation;
            }
            ctx.putImageData(pixels, 0, 0);
            break;
        default:
            console.log("Unknown filter:", filterName);
            break;
    }
}


