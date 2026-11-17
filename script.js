
// ======================================
// KLIKEBOOTH — PEEK A BOOTH
// MODERN RETRO EDITORIAL
// ======================================

const homePage = document.getElementById("homePage");
const boothPage = document.getElementById("boothPage");

const startBtn = document.getElementById("startBtn");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const downloadBtn = document.getElementById("downloadBtn");

const countdown = document.getElementById("countdown");
const cameraStatus = document.getElementById("cameraStatus");

const resultSection = document.getElementById("resultSection");
const photoResult = document.getElementById("photoResult");

const emailInput = document.getElementById("email");
const sendBtn = document.getElementById("sendBtn");
const sendStatus = document.getElementById("sendStatus");

const filterButtons = document.querySelectorAll(".filter-btn");

const photoFormat = document.getElementById("photoFormat");
const photoSize = document.getElementById("photoSize");
const sizeNote = document.getElementById("sizeNote");

let cameraStream = null;
let photoData = null;

let selectedFilter = "none";
let capturedPhotos = [];

let isCapturing = false;
let isSending = false;


// ======================================
// DESIGN SYSTEM
// ======================================

const COLORS = {
    deepTeal: "#092328",
    forestTeal: "#12544F",
    warmYellow: "#EBE3A7",
    burntOrange: "#E37434",
    offWhite: "#F7F3DC"
};


// ======================================
// FILTER PRESETS
// ======================================

const filters = {

    none: "none",

    vintage: "sepia(0.55) contrast(1.1) saturate(0.85)",

    warm: "sepia(0.25) saturate(1.35) brightness(1.05)",

    mono: "grayscale(1) contrast(1.15)",

    soft: "brightness(1.12) saturate(0.75) contrast(0.9)",

    cool: "saturate(0.85) hue-rotate(15deg) brightness(1.05)"

};


// ======================================
// MEMULAI PHOTOBOOTH
// ======================================

startBtn.addEventListener("click", async function () {

    homePage.classList.add("hidden");
    boothPage.classList.remove("hidden");

    cameraStatus.textContent = "CONNECTING TO CAMERA...";

    startBtn.disabled = true;

    try {

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera is not supported in this browser.");
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },

            audio: false

        });

        video.srcObject = cameraStream;

        await video.play();

        video.style.filter = filters[selectedFilter];

        cameraStatus.textContent =
            "CAMERA READY — LET'S CAPTURE SOMETHING.";

        captureBtn.disabled = false;

    } catch (error) {

        console.error("Camera error:", error);

        cameraStatus.textContent =
            "CAMERA ACCESS FAILED — PLEASE ALLOW CAMERA PERMISSION.";

        startBtn.disabled = false;

    }

});


// ======================================
// MEMILIH FILTER
// ======================================

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        if (isCapturing) return;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedFilter = this.dataset.filter;

        video.style.filter = filters[selectedFilter];

    });

});


// ======================================
// PILIHAN FORMAT DAN UKURAN FOTO
// ======================================

photoFormat.addEventListener("change", function () {

    if (this.value === "strip") {

        photoSize.value = "2x6";

        photoSize.disabled = true;

        sizeNote.textContent =
            "PHOTO STRIP — 2 × 6 INCHES / 3 FRAMES.";

    } else {

        photoSize.disabled = false;

        photoSize.value = "4x6";

        sizeNote.textContent =
            "SELECT YOUR PREFERRED PHOTO SIZE.";

    }

});


// ======================================
// COUNTDOWN
// ======================================

function wait(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}


async function runCountdown() {

    for (let i = 3; i >= 1; i--) {

        countdown.textContent = i;

        await wait(1000);

    }

    countdown.textContent = "SMILE!";

    await wait(500);

    countdown.textContent = "";

}


// ======================================
// MENGAMBIL FOTO DARI KAMERA
// ======================================

function captureFrame() {

    if (!video.videoWidth || !video.videoHeight) {

        throw new Error("Camera is not ready.");

    }

    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;

    const ctx = tempCanvas.getContext("2d");

    ctx.filter = filters[selectedFilter];

    // Mirror selfie

    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        video,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
    );

    return tempCanvas;

}


// ======================================
// CROP FOTO
// ======================================

function drawCover(ctx, img, x, y, width, height) {

    const sourceRatio = img.width / img.height;
    const targetRatio = width / height;

    let sx = 0;
    let sy = 0;

    let sw = img.width;
    let sh = img.height;

    if (sourceRatio > targetRatio) {

        sw = img.height * targetRatio;

        sx = (img.width - sw) / 2;

    } else {

        sh = img.width / targetRatio;

        sy = (img.height - sh) / 2;

    }

    ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        x,
        y,
        width,
        height
    );

}


// ======================================
// MEMBUAT SINGLE PHOTO
// ======================================

function createSinglePhoto(img) {

    const size = photoSize.value;

    let width = 1200;
    let height = 1800;

    if (size === "4x4") {

        width = 1200;
        height = 1200;

    }

    if (size === "2x6") {

        width = 600;
        height = 1800;

    }

    const output = document.createElement("canvas");

    output.width = width;
    output.height = height;

    const ctx = output.getContext("2d");

    // Background photo

    ctx.fillStyle = COLORS.offWhite;

    ctx.fillRect(0, 0, width, height);

    const padding = Math.round(width * 0.045);

    drawCover(
        ctx,
        img,
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
    );

    return output;

}


// ======================================
// MEMBUAT PHOTO STRIP
// ======================================

function createPhotoStrip(photos) {

    const output = document.createElement("canvas");

    output.width = 600;
    output.height = 1800;

    const ctx = output.getContext("2d");

    // Main background

    ctx.fillStyle = COLORS.offWhite;

    ctx.fillRect(0, 0, 600, 1800);

    const padding = 35;
    const gap = 20;

    const photoWidth = 530;
    const photoHeight = 535;

    photos.forEach((photo, index) => {

        const y = padding + index * (photoHeight + gap);

        drawCover(
            ctx,
            photo,
            padding,
            y,
            photoWidth,
            photoHeight
        );

    });

    // Editorial footer

    ctx.fillStyle = COLORS.deepTeal;

    ctx.fillRect(0, 1740, 600, 60);

    ctx.fillStyle = COLORS.warmYellow;

    ctx.font = "bold 22px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "KLIKEBOOTH / 2026",
        300,
        1777
    );

    return output;

}


// ======================================
// PROSES PENGAMBILAN FOTO
// ======================================

captureBtn.addEventListener("click", async function () {

    if (isCapturing || !cameraStream) return;

    isCapturing = true;

    captureBtn.disabled = true;

    retakeBtn.classList.add("hidden");

    capturedPhotos = [];

    const isStrip = photoFormat.value === "strip";

    const totalPhotos = isStrip ? 3 : 1;

    try {

        for (let i = 0; i < totalPhotos; i++) {

            cameraStatus.textContent = isStrip
                ? `FRAME ${i + 1} / 3 — GET READY.`
                : "GET READY FOR YOUR PHOTO.";

            await runCountdown();

            capturedPhotos.push(captureFrame());

            if (i < totalPhotos - 1) {

                cameraStatus.textContent =
                    "FRAME CAPTURED — PREPARE FOR THE NEXT SHOT.";

                await wait(1000);

            }

        }

        let finalCanvas;

        if (isStrip) {

            finalCanvas = createPhotoStrip(capturedPhotos);

        } else {

            finalCanvas = createSinglePhoto(capturedPhotos[0]);

        }

        // Convert to JPEG

        photoData = finalCanvas.toDataURL("image/jpeg", 0.95);

        photoResult.src = photoData;

        video.classList.add("hidden");

        resultSection.classList.remove("hidden");

        retakeBtn.classList.remove("hidden");

        downloadBtn.disabled = false;

        cameraStatus.textContent =
            "CAPTURE COMPLETE — YOUR PHOTO IS READY.";

        sendBtn.disabled = true;

        emailInput.value = "";

        sendStatus.textContent = "";

        resultSection.scrollIntoView({

            behavior: "smooth"

        });

    } catch (error) {

        console.error("Capture error:", error);

        cameraStatus.textContent =
            "CAPTURE FAILED — PLEASE TRY AGAIN.";

        captureBtn.disabled = false;

    } finally {

        isCapturing = false;

    }

});


// ======================================
// RETAKE FOTO
// ======================================

retakeBtn.addEventListener("click", function () {

    if (isCapturing || isSending) return;

    photoData = null;

    capturedPhotos = [];

    video.classList.remove("hidden");

    resultSection.classList.add("hidden");

    retakeBtn.classList.add("hidden");

    downloadBtn.disabled = true;

    captureBtn.disabled = false;

    sendBtn.disabled = true;

    emailInput.value = "";

    sendStatus.textContent = "";

    video.style.filter = filters[selectedFilter];

    cameraStatus.textContent =
        "CAMERA READY — PREPARE YOUR NEXT SHOT.";

    video.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

});


// ======================================
// VALIDASI EMAIL
// ======================================

emailInput.addEventListener("input", function () {

    sendBtn.disabled = !(
        emailInput.checkValidity() &&
        emailInput.value.trim() !== "" &&
        photoData &&
        !isSending
    );

});


// ======================================
// DOWNLOAD FOTO
// ======================================

downloadBtn.addEventListener("click", function () {

    if (!photoData) return;

    const link = document.createElement("a");

    link.href = photoData;

    link.download = photoFormat.value === "strip"
        ? "klikebooth-strip.jpg"
        : "klikebooth-photo.jpg";

    link.click();

});


// ======================================
// KIRIM FOTO KE N8N WEBHOOK
// ======================================

sendBtn.addEventListener("click", async function () {

    if (
        !photoData ||
        !emailInput.checkValidity() ||
        isSending
    ) {

        return;

    }

    isSending = true;

    sendBtn.disabled = true;

    sendStatus.textContent = "SENDING YOUR PHOTO...";

    try {

        const response = await fetch(

            "https://doozy-audacious-cheer.ngrok-free.dev/webhook-test/klikebooth",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email: emailInput.value.trim(),

                    photo: photoData,

                    filename: photoFormat.value === "strip"
                        ? "klikebooth-strip.jpg"
                        : "klikebooth-photo.jpg",

                    format: photoFormat.value,

                    size: photoSize.value,

                    filter: selectedFilter

                })

            }

        );

        if (!response.ok) {

            throw new Error("Failed to send photo.");

        }

        sendStatus.textContent =
            "PHOTO SENT SUCCESSFULLY — CHECK YOUR EMAIL.";

    } catch (error) {

        console.error("Webhook error:", error);

        sendStatus.textContent =
            "SOMETHING WENT WRONG — PLEASE TRY AGAIN.";

    } finally {

        isSending = false;

        sendBtn.disabled = !(
            emailInput.checkValidity() &&
            emailInput.value.trim() !== "" &&
            photoData
        );

    }

});


// ======================================
// CLEANUP CAMERA
// ======================================

window.addEventListener("beforeunload", function () {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {

            track.stop();

        });

    }

});


// ======================================
// SELESAI
// ======================================
