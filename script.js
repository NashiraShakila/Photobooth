
// ======================================
// KLIKEBOOTH — PEEK A BOOTH
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

// FILTER PRESETS

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

    cameraStatus.textContent = "Connecting to your camera...";

    try {

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

        cameraStatus.textContent =
            "Camera is ready! Choose your favorite filter and pose.";

        captureBtn.disabled = false;

    } catch (error) {

        console.error("Camera error:", error);

        cameraStatus.textContent =
            "Camera access failed. Please allow camera permission.";

    }

});


// ======================================
// MEMILIH FILTER
// ======================================

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        selectedFilter = this.dataset.filter;

        // Preview filter langsung di kamera

        video.style.filter = filters[selectedFilter];

    });

});


// ======================================
// PILIHAN FORMAT DAN UKURAN
// ======================================

photoFormat.addEventListener("change", function () {

    if (this.value === "strip") {

        photoSize.value = "2x6";

        photoSize.disabled = true;

        sizeNote.textContent =
            "Photo strip uses a vertical 2 × 6 inch layout with 3 photos.";

    } else {

        photoSize.disabled = false;

        photoSize.value = "4x6";

        sizeNote.textContent =
            "Choose your preferred photo print size.";

    }

});


// ======================================
// FUNGSI COUNTDOWN
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

    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;

    const ctx = tempCanvas.getContext("2d");

    // Terapkan filter pada hasil foto

    ctx.filter = filters[selectedFilter];

    // Mirror agar hasil sesuai tampilan selfie

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
// CROP FOTO AGAR SESUAI UKURAN
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
        sx, sy, sw, sh,
        x, y, width, height
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

    ctx.fillStyle = "#FFFDF8";
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
// MEMBUAT PHOTO STRIP 3 FOTO
// ======================================

function createPhotoStrip(photos) {

    const output = document.createElement("canvas");

    output.width = 600;
    output.height = 1800;

    const ctx = output.getContext("2d");

    ctx.fillStyle = "#FFFDF8";
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

    // Footer photo strip

    ctx.fillStyle = "#790D16";
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
        "KLIKEBOOTH ✳",
        300,
        1770
    );

    return output;

}


// ======================================
// PROSES PENGAMBILAN FOTO
// ======================================

captureBtn.addEventListener("click", async function () {

    if (isCapturing) return;

    isCapturing = true;
    captureBtn.disabled = true;
    retakeBtn.classList.add("hidden");

    capturedPhotos = [];

    const isStrip = photoFormat.value === "strip";

    const totalPhotos = isStrip ? 3 : 1;

    try {

        for (let i = 0; i < totalPhotos; i++) {

            cameraStatus.textContent = isStrip
                ? `PHOTO ${i + 1} OF 3 — GET READY!`
                : "GET READY FOR YOUR PHOTO!";

            await runCountdown();

            capturedPhotos.push(captureFrame());

            if (i < totalPhotos - 1) {

                cameraStatus.textContent =
                    "Great! Get ready for the next shot.";

                await wait(1000);

            }

        }

        let finalCanvas;

        if (isStrip) {

            finalCanvas = createPhotoStrip(capturedPhotos);

        } else {

            finalCanvas = createSinglePhoto(capturedPhotos[0]);

        }

        // Simpan hasil menjadi JPEG

        photoData = finalCanvas.toDataURL("image/jpeg", 0.95);

        photoResult.src = photoData;

        video.classList.add("hidden");

        resultSection.classList.remove("hidden");

        retakeBtn.classList.remove("hidden");

        downloadBtn.disabled = false;

        cameraStatus.textContent =
            "Your photo is ready! Looking good!";

        sendBtn.disabled = true;

        emailInput.value = "";

        sendStatus.textContent = "";

        resultSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Capture error:", error);

        cameraStatus.textContent =
            "Something went wrong. Please try again.";

        captureBtn.disabled = false;

    } finally {

        isCapturing = false;

    }

});


// ======================================
// RETAKE FOTO
// ======================================

retakeBtn.addEventListener("click", function () {

    photoData = null;
    capturedPhotos = [];

    video.classList.remove("hidden");

    resultSection.classList.add("hidden");

    retakeBtn.classList.add("hidden");

    downloadBtn.disabled = true;

    captureBtn.disabled = false;

    cameraStatus.textContent =
        "Ready for another shot!";

    sendStatus.textContent = "";

    video.style.filter = filters[selectedFilter];

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
        photoData
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

    if (!photoData || !emailInput.checkValidity()) {
        return;
    }

    sendBtn.disabled = true;

    sendStatus.textContent = "Sending your photo...";

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
            "Your photo has been sent successfully! Check your email.";

    } catch (error) {

        console.error("Webhook error:", error);

        sendStatus.textContent =
            "Oops! Something went wrong. Please try again.";

        sendBtn.disabled = false;

    }

});


// ======================================
// SELESAI
// ======================================
