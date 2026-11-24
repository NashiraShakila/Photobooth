
/* ==========================================
   KLIKEBOOTH
   PHOTOBOOTH SYSTEM / 2026
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // ELEMENTS
  // ========================================

  const homePage = document.getElementById("homePage");
  const boothPage = document.getElementById("boothPage");

  const startBtn = document.getElementById("startBtn");

  const video = document.getElementById("video");
  const cameraFrame = document.getElementById("cameraFrame");
  const cameraHint = document.getElementById("cameraHint");

  const countdown = document.getElementById("countdown");

  const captureBtn = document.getElementById("captureBtn");
  const retakeBtn = document.getElementById("retakeBtn");

  const cameraStatusElements = document.querySelectorAll("#cameraStatus");

  const resultSection = document.getElementById("resultSection");
  const photoResult = document.getElementById("photoResult");

  const emailInput = document.getElementById("email");
  const sendBtn = document.getElementById("sendBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const sendStatus = document.getElementById("sendStatus");

  const filterButtons = document.querySelectorAll(".filter-btn");

  const photoLayout = document.getElementById("photoLayout");
  const shotCount = document.getElementById("shotCount");
  const frameStyle = document.getElementById("frameStyle");
  const photoSize = document.getElementById("photoSize");

  const frameChoices = document.querySelectorAll(".frame-choice");

  const layoutNote = document.getElementById("layoutNote");
  const frameNote = document.getElementById("frameNote");
  const sizeNote = document.getElementById("sizeNote");

  const miniOutput = document.getElementById("miniOutput");
  const designPreviewName = document.getElementById("designPreviewName");

  const liveFrameOverlay = document.getElementById("liveFrameOverlay");
  const previewModeLabel = document.getElementById("previewModeLabel");


  // ========================================
  // CONFIGURATION
  // ========================================

  const WEBHOOK_URL =
    "https://doozy-audacious-cheer.ngrok-free.dev/webhook-test/klikebooth";

  const COLORS = {
    butter: "#EFEABB",
    peach: "#FFEAD3",
    teal: "#005461",
    burgundy: "#4B1426",
    red: "#9B0F06",
    indigo: "#121358"
  };


  // ========================================
  // FILTERS
  // ========================================

  const filters = {

    original: "none",

    y2k:
      "saturate(1.55) contrast(1.08) brightness(1.08) hue-rotate(-8deg)",

    beautify:
      "brightness(1.12) saturate(0.92) contrast(0.91)",

    retro:
      "sepia(0.48) saturate(1.2) contrast(1.08)",

    dramatic:
      "contrast(1.35) saturate(1.15) brightness(0.94)",

    dreamy:
      "brightness(1.16) saturate(0.78) contrast(0.88) blur(0.15px)",

    noir:
      "grayscale(1) contrast(1.35) brightness(0.95)",

    disposable:
      "sepia(0.2) saturate(1.4) contrast(1.12) brightness(1.08)",

    cocoa:
      "sepia(0.45) saturate(0.8) brightness(0.94) contrast(1.1)",

    peachy:
      "sepia(0.18) saturate(1.2) brightness(1.08) hue-rotate(-8deg)",

    coolblue:
      "saturate(0.9) hue-rotate(15deg) brightness(1.05) contrast(1.05)",

    flash:
      "brightness(1.28) contrast(1.15) saturate(1.1)"
  };


  const filterNames = {
    original: "ORIGINAL",
    y2k: "Y2K",
    beautify: "BEAUTIFY",
    retro: "RETRO",
    dramatic: "DRAMATIC",
    dreamy: "DREAMY",
    noir: "NOIR",
    disposable: "DISPOSABLE",
    cocoa: "COCOA",
    peachy: "PEACHY",
    coolblue: "COOL BLUE",
    flash: "FLASH"
  };


  // ========================================
  // FRAME INFORMATION
  // ========================================

  const frameInformation = {

    editorial: {
      name: "EDITORIAL TYPE",
      note: "Clean editorial typography, thin borders, and edition numbers."
    },

    retro: {
      name: "RETRO PATTERN",
      note: "Warm retro dots with burgundy and peach accents."
    },

    check: {
      name: "GRAPHIC CHECK",
      note: "Geometric checker pattern in teal and butter."
    },

    bloom: {
      name: "ORGANIC BLOOM",
      note: "Abstract floral details with warm colors."
    },

    minimal: {
      name: "MINIMAL PRINT",
      note: "A simple print with thin borders and subtle labels."
    }

  };


  // ========================================
  // LAYOUT INFORMATION
  // ========================================

  const layoutInformation = {

    single: "One large photo composition.",

    vertical: "Photos arranged from top to bottom.",

    horizontal: "Photos arranged from left to right.",

    grid: "Photos arranged in a balanced grid.",

    asymmetric: "Photos arranged in an editorial asymmetric layout.",

    freeform: "A playful composition with varied photo sizes."
  };


  // ========================================
  // STATE
  // ========================================

  let cameraStream = null;

  let selectedFilter = "original";
  let selectedLayout = "vertical";
  let selectedFrame = "editorial";
  let selectedSize = "4x6";

  let capturedPhotos = [];
  let finalPhotoData = null;

  let isCapturing = false;
  let isSending = false;


  // ========================================
  // STATUS HELPER
  // ========================================

  function updateStatus(message) {

    cameraStatusElements.forEach(element => {
      element.textContent = message;
    });

  }


  // ========================================
  // HOME TO BOOTH
  // ========================================

  startBtn.addEventListener("click", async () => {

    homePage.classList.add("hidden");
    boothPage.classList.remove("hidden");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    updateStatus("Requesting camera permission...");

    await startCamera();

  });


  // ========================================
  // CAMERA
  // ========================================

  async function startCamera() {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

      updateStatus(
        "Your browser does not support camera access. Please use a supported browser."
      );

      cameraHint.textContent = "CAMERA NOT SUPPORTED";

      return;

    }

    try {

      if (cameraStream) {
        stopCamera();
      }

      cameraStream = await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: "user",
          width: {
            ideal: 1280
          },
          height: {
            ideal: 720
          }
        },

        audio: false

      });

      video.srcObject = cameraStream;

      await video.play();

      video.style.filter = filters[selectedFilter];

      cameraHint.classList.add("hidden");

      captureBtn.disabled = false;

      updateStatus("Camera connected. Your booth is ready!");

      updateLivePreview();

    } catch (error) {

      console.error("Camera error:", error);

      captureBtn.disabled = true;

      cameraHint.classList.remove("hidden");

      cameraHint.textContent = "CAMERA ACCESS REQUIRED";

      if (error.name === "NotAllowedError") {

        updateStatus(
          "Camera permission denied. Please allow camera access in your browser settings."
        );

      } else if (error.name === "NotFoundError") {

        updateStatus(
          "No camera detected. Please connect a camera and try again."
        );

      } else {

        updateStatus(
          "Unable to access camera. Please check your camera and try again."
        );

      }

    }

  }


  function stopCamera() {

    if (cameraStream) {

      cameraStream.getTracks().forEach(track => {
        track.stop();
      });

      cameraStream = null;

    }

    video.srcObject = null;

  }


  // ========================================
  // LIVE PREVIEW
  // ========================================

  function updateLivePreview() {

    if (previewModeLabel) {

      previewModeLabel.textContent =
        "LIVE / " + filterNames[selectedFilter];

    }

    if (video) {

      video.style.filter = filters[selectedFilter];

    }

    if (miniOutput) {

      miniOutput.dataset.layout = selectedLayout;

      miniOutput.dataset.frame = selectedFrame;

    }

    updateFramePreview();

    updateDesignPreviewName();

  }


  // ========================================
  // FILTER SELECTION
  // ========================================

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      const filter = button.dataset.filter;

      if (!Object.prototype.hasOwnProperty.call(filters, filter)) return;

      selectedFilter = filter;

      filterButtons.forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      video.style.filter = filters[selectedFilter];

      if (previewModeLabel) {

        previewModeLabel.textContent =
          "LIVE / " + filterNames[selectedFilter];

      }

    });

  });


  // ========================================
  // FRAME SELECTION
  // ========================================

  frameChoices.forEach(button => {

    button.addEventListener("click", () => {

      const frame = button.dataset.frameChoice;

      if (!frameInformation[frame]) return;

      selectedFrame = frame;

      frameStyle.value = frame;

      frameChoices.forEach(item => {

        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");

      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      updateFramePreview();

    });

  });


  frameStyle.addEventListener("change", () => {

    const frame = frameStyle.value;

    if (!frameInformation[frame]) return;

    selectedFrame = frame;

    frameChoices.forEach(button => {

      const active = button.dataset.frameChoice === frame;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        active ? "true" : "false"
      );

    });

    updateFramePreview();

  });


  function updateFramePreview() {

    const information = frameInformation[selectedFrame];

    if (!information) return;

    if (frameNote) {
      frameNote.textContent = information.note;
    }

    if (liveFrameOverlay) {

      liveFrameOverlay.className =
        "live-frame-overlay frame-" + selectedFrame;

    }

    if (miniOutput) {
      miniOutput.dataset.frame = selectedFrame;
    }

    updateDesignPreviewName();

  }


  // ========================================
  // LAYOUT SELECTION
  // ========================================

  photoLayout.addEventListener("change", () => {

    selectedLayout = photoLayout.value;

    layoutNote.textContent =
      layoutInformation[selectedLayout];

    miniOutput.dataset.layout = selectedLayout;

    updateDesignPreviewName();

  });


  // ========================================
  // PHOTO SIZE
  // ========================================

  photoSize.addEventListener("change", () => {

    selectedSize = photoSize.value;

    const sizeMessages = {

      "4x6": "4 × 6 inch photo proportion.",

      "4x4": "Square 4 × 4 inch photo proportion.",

      "2x6": "Narrow 2 × 6 inch photostrip proportion."

    };

    sizeNote.textContent = sizeMessages[selectedSize];

  });


  // ========================================
  // SHOT COUNT
  // ========================================

  shotCount.addEventListener("change", () => {

    updateDesignPreviewName();

  });


  // ========================================
  // DESIGN PREVIEW LABEL
  // ========================================

  function updateDesignPreviewName() {

    const layoutName = selectedLayout.toUpperCase();

    const frameName = frameInformation[selectedFrame].name;

    designPreviewName.textContent =
      layoutName + " / " + frameName;

  }


  // ========================================
  // COUNTDOWN
  // ========================================

  function runCountdown() {

    return new Promise(resolve => {

      let number = 3;

      countdown.classList.remove("hidden");

      countdown.textContent = number;

      const timer = setInterval(() => {

        number--;

        if (number > 0) {

          countdown.textContent = number;

        } else {

          clearInterval(timer);

          countdown.textContent = "SMILE!";

          setTimeout(() => {

            countdown.textContent = "";

            countdown.classList.add("hidden");

            resolve();

          }, 650);

        }

      }, 1000);

    });

  }


  // ========================================
  // CAPTURE PHOTO
  // ========================================

  function captureFrame() {

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.filter = filters[selectedFilter];

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.filter = "none";

    return canvas.toDataURL("image/jpeg", 0.94);

  }


  // ========================================
  // LOAD IMAGE
  // ========================================

  function loadImage(dataURL) {

    return new Promise((resolve, reject) => {

      const img = new Image();

      img.onload = () => resolve(img);

      img.onerror = reject;

      img.src = dataURL;

    });

  }


  // ========================================
  // CANVAS HELPERS
  // ========================================

  function drawCover(ctx, image, x, y, width, height) {

    const imageRatio = image.width / image.height;

    const targetRatio = width / height;

    let sourceX = 0;
    let sourceY = 0;

    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageRatio > targetRatio) {

      sourceWidth = image.height * targetRatio;

      sourceX = (image.width - sourceWidth) / 2;

    } else {

      sourceHeight = image.width / targetRatio;

      sourceY = (image.height - sourceHeight) / 2;

    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );

  }


  function drawText(ctx, text, x, y, size, color, align = "center") {

    ctx.fillStyle = color;

    ctx.font = `600 ${size}px "IBM Plex Mono", monospace`;

    ctx.textAlign = align;

    ctx.fillText(text, x, y);

  }


  function drawPattern(ctx, type, x, y, width, height) {

    ctx.save();

    if (type === "retro") {

      const colors = [COLORS.peach, COLORS.red];

      for (let row = 0; row < height; row += 28) {

        for (let col = 0; col < width; col += 28) {

          const offset = (Math.floor(row / 28) % 2) * 14;

          ctx.beginPath();

          ctx.fillStyle =
            colors[(Math.floor(col / 28) + Math.floor(row / 28)) % 2];

          ctx.arc(
            x + col + offset,
            y + row,
            5,
            0,
            Math.PI * 2
          );

          ctx.fill();

        }

      }

    }


    if (type === "check") {

      const cell = 24;

      for (let row = 0; row < height; row += cell) {

        for (let col = 0; col < width; col += cell) {

          const isTeal =
            (Math.floor(row / cell) + Math.floor(col / cell)) % 2 === 0;

          ctx.fillStyle = isTeal ? COLORS.teal : COLORS.butter;

          ctx.fillRect(
            x + col,
            y + row,
            cell,
            cell
          );

        }

      }

    }


    if (type === "bloom") {

      for (let row = 0; row < height; row += 32) {

        for (let col = 0; col < width; col += 32) {

          const cx = x + col + 12;
          const cy = y + row + 12;

          ctx.fillStyle = COLORS.burgundy;

          for (let petal = 0; petal < 6; petal++) {

            const angle = petal * Math.PI / 3;

            ctx.beginPath();

            ctx.ellipse(
              cx + Math.cos(angle) * 6,
              cy + Math.sin(angle) * 6,
              4,
              7,
              angle,
              0,
              Math.PI * 2
            );

            ctx.fill();

          }

          ctx.beginPath();

          ctx.fillStyle = COLORS.red;

          ctx.arc(cx, cy, 3, 0, Math.PI * 2);

          ctx.fill();

        }

      }

    }

    ctx.restore();

  }


  // ========================================
  // FRAME BACKGROUND
  // ========================================

  function drawFrameBackground(ctx, width, height, frame) {

    const padding = Math.round(width * 0.035);

    const patternArea = Math.round(width * 0.055);

    if (frame === "editorial") {

      ctx.fillStyle = COLORS.butter;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = COLORS.indigo;
      ctx.lineWidth = Math.max(3, width * 0.004);

      ctx.strokeRect(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
      );

    }


    if (frame === "retro") {

      ctx.fillStyle = COLORS.burgundy;
      ctx.fillRect(0, 0, width, height);

      drawPattern(
        ctx,
        "retro",
        0,
        0,
        width,
        height
      );

    }


    if (frame === "check") {

      ctx.fillStyle = COLORS.butter;
      ctx.fillRect(0, 0, width, height);

      drawPattern(
        ctx,
        "check",
        0,
        0,
        width,
        height
      );

    }


    if (frame === "bloom") {

      ctx.fillStyle = COLORS.peach;
      ctx.fillRect(0, 0, width, height);

      drawPattern(
        ctx,
        "bloom",
        0,
        0,
        width,
        height
      );

    }


    if (frame === "minimal") {

      ctx.fillStyle = COLORS.butter;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = COLORS.indigo;
      ctx.lineWidth = Math.max(2, width * 0.002);

      ctx.strokeRect(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
      );

      ctx.strokeRect(
        padding * 2,
        padding * 2,
        width - padding * 4,
        height - padding * 4
      );

    }

    return {
      padding,
      patternArea
    };

  }


  // ========================================
  // PHOTO PLACEMENT
  // ========================================

  function getPhotoPositions(width, height, count, layout) {

    const margin = Math.round(width * 0.065);

    const gap = Math.round(width * 0.025);

    const innerWidth = width - margin * 2;
    const innerHeight = height - margin * 2;

    const positions = [];

    if (layout === "single") {

      positions.push({
        x: margin,
        y: margin,
        w: innerWidth,
        h: innerHeight
      });

    }


    if (layout === "vertical") {

      const photoHeight =
        (innerHeight - gap * (count - 1)) / count;

      for (let i = 0; i < count; i++) {

        positions.push({

          x: margin,
          y: margin + i * (photoHeight + gap),
          w: innerWidth,
          h: photoHeight

        });

      }

    }


    if (layout === "horizontal") {

      const photoWidth =
        (innerWidth - gap * (count - 1)) / count;

      for (let i = 0; i < count; i++) {

        positions.push({

          x: margin + i * (photoWidth + gap),
          y: margin,
          w: photoWidth,
          h: innerHeight

        });

      }

    }


    if (layout === "grid") {

      const columns = Math.ceil(Math.sqrt(count));

      const rows = Math.ceil(count / columns);

      const cellWidth =
        (innerWidth - gap * (columns - 1)) / columns;

      const cellHeight =
        (innerHeight - gap * (rows - 1)) / rows;

      for (let i = 0; i < count; i++) {

        const col = i % columns;

        const row = Math.floor(i / columns);

        positions.push({

          x: margin + col * (cellWidth + gap),
          y: margin + row * (cellHeight + gap),
          w: cellWidth,
          h: cellHeight

        });

      }

    }


    if (layout === "asymmetric") {

      const firstHeight = innerHeight * 0.43;

      const remaining = innerHeight - firstHeight - gap;

      positions.push({

        x: margin,
        y: margin,
        w: innerWidth,
        h: firstHeight

      });

      const remainingCount = count - 1;

      if (remainingCount > 0) {

        const cellWidth =
          (innerWidth - gap * (remainingCount - 1)) / remainingCount;

        for (let i = 0; i < remainingCount; i++) {

          positions.push({

            x: margin + i * (cellWidth + gap),
            y: margin + firstHeight + gap,
            w: cellWidth,
            h: remaining

          });

        }

      }

    }


    if (layout === "freeform") {

      const columns = 2;

      const rows = Math.ceil(count / columns);

      const cellWidth = (innerWidth - gap) / 2;

      const cellHeight =
        (innerHeight - gap * (rows - 1)) / rows;

      for (let i = 0; i < count; i++) {

        const row = Math.floor(i / 2);

        const col = i % 2;

        const isWide = i === 0 && count > 2;

        positions.push({

          x: margin + col * (cellWidth + gap),
          y: margin + row * (cellHeight + gap),
          w: isWide ? innerWidth : cellWidth,
          h: isWide ? cellHeight * 1.5 : cellHeight

        });

      }

    }

    return positions;

  }


  // ========================================
  // OUTPUT SIZE
  // ========================================

  function getOutputSize(layout, size, count) {

    const sizes = {

      "4x6": {
        width: 1200,
        height: 1800
      },

      "4x4": {
        width: 1200,
        height: 1200
      },

      "2x6": {
        width: 600,
        height: 1800
      }

    };

    const base = sizes[size] || sizes["4x6"];

    if (layout === "vertical") {

      return {
        width: base.width,
        height: Math.max(base.height, count * 430)
      };

    }

    if (layout === "horizontal") {

      return {
        width: Math.max(base.width, count * 430),
        height: base.height
      };

    }

    if (layout === "single") {

      return base;

    }

    return {
      width: 1500,
      height: 1500
    };

  }


  // ========================================
  // COMPOSE FINAL PHOTO
  // ========================================

  async function composeFinalPhoto(photos) {

    const count = photos.length;

    const outputSize = getOutputSize(
      selectedLayout,
      selectedSize,
      count
    );

    const canvas = document.createElement("canvas");

    canvas.width = outputSize.width;
    canvas.height = outputSize.height;

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    drawFrameBackground(
      ctx,
      width,
      height,
      selectedFrame
    );

    const padding = Math.round(width * 0.065);

    const footerHeight = Math.round(height * 0.065);

    const photoAreaHeight = height - footerHeight;

    const positions = getPhotoPositions(
      width,
      photoAreaHeight,
      count,
      selectedLayout
    );

    const images = await Promise.all(
      photos.map(photo => loadImage(photo))
    );


    // Draw photo backgrounds and photos

    for (let i = 0; i < images.length; i++) {

      const position = positions[i];

      if (!position) continue;

      const border = Math.max(5, Math.round(width * 0.008));

      ctx.fillStyle = COLORS.peach;

      ctx.fillRect(
        position.x - border,
        position.y - border,
        position.w + border * 2,
        position.h + border * 2
      );

      ctx.save();

      ctx.beginPath();

      ctx.rect(
        position.x,
        position.y,
        position.w,
        position.h
      );

      ctx.clip();

      drawCover(
        ctx,
        images[i],
        position.x,
        position.y,
        position.w,
        position.h
      );

      ctx.restore();

    }


    // Footer background

    const footerY = height - footerHeight;

    ctx.fillStyle =
      selectedFrame === "retro" ? COLORS.burgundy :
      selectedFrame === "bloom" ? COLORS.burgundy :
      selectedFrame === "check" ? COLORS.teal :
      COLORS.butter;

    ctx.fillRect(
      0,
      footerY,
      width,
      footerHeight
    );


    // Footer typography

    const footerColor =
      selectedFrame === "retro" ||
      selectedFrame === "bloom" ||
      selectedFrame === "check"
        ? COLORS.peach
        : COLORS.indigo;

    const textSize = Math.max(15, Math.round(width * 0.018));

    drawText(
      ctx,
      "KLIKEBOOTH",
      width / 2,
      footerY + footerHeight * 0.43,
      textSize,
      footerColor
    );

    drawText(
      ctx,
      "PEEK A BOOTH  /  2026",
      width / 2,
      footerY + footerHeight * 0.75,
      Math.max(10, Math.round(width * 0.009)),
      footerColor
    );


    // Frame-specific decorations

    if (selectedFrame === "editorial") {

      drawText(
        ctx,
        "NO. 001",
        padding,
        height - footerHeight * 0.25,
        Math.max(11, Math.round(width * 0.012)),
        COLORS.indigo,
        "left"
      );

    }


    if (selectedFrame === "retro") {

      drawText(
        ctx,
        "GOOD TIMES",
        width / 2,
        35,
        Math.max(14, Math.round(width * 0.018)),
        COLORS.peach
      );

    }


    if (selectedFrame === "check") {

      drawText(
        ctx,
        "KLK / 001",
        width / 2,
        35,
        Math.max(14, Math.round(width * 0.018)),
        COLORS.indigo
      );

    }


    if (selectedFrame === "bloom") {

      drawText(
        ctx,
        "IN BLOOM",
        width / 2,
        35,
        Math.max(14, Math.round(width * 0.018)),
        COLORS.peach
      );

    }


    if (selectedFrame === "minimal") {

      drawText(
        ctx,
        "MEMORY NO. 001",
        width / 2,
        height - footerHeight * 0.25,
        Math.max(11, Math.round(width * 0.012)),
        COLORS.indigo
      );

    }

    return canvas.toDataURL("image/jpeg", 0.95);

  }


  // ========================================
  // CAPTURE SESSION
  // ========================================

  captureBtn.addEventListener("click", async () => {

    if (!cameraStream || isCapturing) return;

    if (video.readyState < 2) {

      updateStatus("Camera is not ready yet. Please wait.");

      return;

    }

    isCapturing = true;

    capturedPhotos = [];

    finalPhotoData = null;

    captureBtn.disabled = true;

    retakeBtn.classList.add("hidden");

    resultSection.classList.add("hidden");

    const totalShots = Number(shotCount.value);

    captureBtn.textContent = "CAPTURING...";

    updateStatus(
      "Get ready! Your photo session is starting."
    );

    try {

      for (let i = 0; i < totalShots; i++) {

        updateStatus(
          `Photo ${i + 1} of ${totalShots}. Get ready!`
        );

        await runCountdown();

        capturedPhotos.push(captureFrame());

        await new Promise(resolve => {
          setTimeout(resolve, 350);
        });

      }


      updateStatus("Creating your final photo...");

      finalPhotoData = await composeFinalPhoto(capturedPhotos);

      photoResult.src = finalPhotoData;

      resultSection.classList.remove("hidden");

      video.classList.add("hidden");

      liveFrameOverlay.classList.add("hidden");

      cameraHint.classList.add("hidden");

      downloadBtn.disabled = false;

      retakeBtn.classList.remove("hidden");

      emailInput.value = "";

      sendBtn.disabled = true;

      sendStatus.textContent = "";

      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      updateStatus("Your photo is ready!");

    } catch (error) {

      console.error("Capture error:", error);

      updateStatus(
        "Something went wrong while creating your photo. Please try again."
      );

    } finally {

      isCapturing = false;

      captureBtn.disabled = false;

      captureBtn.textContent = "CAPTURE SESSION ↗";

    }

  });


  // ========================================
  // RETAKE
  // ========================================

  retakeBtn.addEventListener("click", () => {

    capturedPhotos = [];

    finalPhotoData = null;

    photoResult.removeAttribute("src");

    resultSection.classList.add("hidden");

    video.classList.remove("hidden");

    liveFrameOverlay.classList.remove("hidden");

    cameraHint.classList.add("hidden");

    retakeBtn.classList.add("hidden");

    downloadBtn.disabled = true;

    sendBtn.disabled = true;

    emailInput.value = "";

    sendStatus.textContent = "";

    captureBtn.disabled = !cameraStream;

    captureBtn.textContent = "CAPTURE SESSION ↗";

    updateStatus("Ready for another session!");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });


  // ========================================
  // EMAIL VALIDATION
  // ========================================

  emailInput.addEventListener("input", () => {

    const email = emailInput.value.trim();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    sendBtn.disabled =
      !emailPattern.test(email) ||
      !finalPhotoData ||
      isSending;

  });


  // ========================================
  // DOWNLOAD PHOTO
  // ========================================

  downloadBtn.addEventListener("click", () => {

    if (!finalPhotoData) return;

    const link = document.createElement("a");

    link.href = finalPhotoData;

    link.download = "klikebooth-photo.jpg";

    document.body.appendChild(link);

    link.click();

    link.remove();

  });


  // ========================================
  // SEND PHOTO TO N8N
  // ========================================

  sendBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();

    if (!finalPhotoData || isSending) return;

    if (!email) {

      sendStatus.textContent = "Please enter your email address.";

      return;

    }

    isSending = true;

    sendBtn.disabled = true;

    sendBtn.textContent = "SENDING...";

    sendStatus.textContent =
      "Sending your photo. Please wait...";

    try {

      const response = await fetch(WEBHOOK_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          email: email,

          photo: finalPhotoData,

          filename: "klikebooth-photo.jpg",

          format: selectedLayout === "single" ? "single" : "strip",

          layout: selectedLayout,

          size: selectedSize,

          filter: selectedFilter,

          frame: selectedFrame

        })

      });


      if (!response.ok) {

        throw new Error(
          "Server returned status " + response.status
        );

      }

      sendStatus.textContent =
        "Your photo has been sent successfully! Check your email.";

    } catch (error) {

      console.error("Email sending error:", error);

      sendStatus.textContent =
        "Unable to send your photo. Please check your n8n workflow and try again.";

    } finally {

      isSending = false;

      sendBtn.textContent = "SEND TO EMAIL ↗";

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      sendBtn.disabled =
        !emailPattern.test(emailInput.value.trim()) ||
        !finalPhotoData;

    }

  });


  // ========================================
  // INITIAL PREVIEW
  // ========================================

  selectedFilter = "original";
  selectedLayout = photoLayout.value;
  selectedFrame = frameStyle.value;
  selectedSize = photoSize.value;

  miniOutput.dataset.layout = selectedLayout;
  miniOutput.dataset.frame = selectedFrame;

  updateLivePreview();

  layoutNote.textContent =
    layoutInformation[selectedLayout];

  updateStatus("Enter the booth to activate your camera.");


  // ========================================
  // CLEANUP
  // ========================================

  window.addEventListener("beforeunload", () => {

    stopCamera();

  });

});
