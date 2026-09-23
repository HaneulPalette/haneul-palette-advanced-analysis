// ============================================================
// HANEUL PALETTE — ADVANCED ANALYSIS
// Frontend connection
// ============================================================


// ------------------------------------------------------------
// BACKEND URL
// ------------------------------------------------------------
//
// IMPORTANT:
// We will replace this URL after the Python backend is deployed.
//
// DO NOT change this yet.
// ------------------------------------------------------------

const BACKEND_URL = "YOUR_BACKEND_URL";


// ------------------------------------------------------------
// PAGE ELEMENTS
// ------------------------------------------------------------

const imageInput = document.getElementById("imageInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingText = document.getElementById("loadingText");

const resultWrapper = document.getElementById("resultWrapper");

const seasonResult = document.getElementById("seasonResult");
const directionResult = document.getElementById("directionResult");
const depthResult = document.getElementById("depthResult");
const qualityResult = document.getElementById("qualityResult");

const paletteResult = document.getElementById("paletteResult");

const suitableResult = document.getElementById("suitableResult");
const unsuitableResult = document.getElementById("unsuitableResult");

const styleResult = document.getElementById("styleResult");
const harmonyResult = document.getElementById("harmonyResult");

const pdfBtn = document.getElementById("pdfBtn");
const pdfStatus = document.getElementById("pdfStatus");


// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

resultWrapper.style.display = "none";

loadingText.textContent = "";


// ------------------------------------------------------------
// ANALYZE BUTTON
// ------------------------------------------------------------

analyzeBtn.addEventListener("click", async () => {

    // --------------------------------------------------------
    // Check image
    // --------------------------------------------------------

    if (
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        loadingText.textContent =
            "Please upload a clear front-facing photograph.";

        return;
    }


    // --------------------------------------------------------
    // Check backend URL
    // --------------------------------------------------------

    if (
        BACKEND_URL === "YOUR_BACKEND_URL" ||
        !BACKEND_URL
    ) {

        loadingText.textContent =
            "The analysis server is not connected yet.";

        return;
    }


    // --------------------------------------------------------
    // Get selected image
    // --------------------------------------------------------

    const imageFile = imageInput.files[0];


    // --------------------------------------------------------
    // Basic file validation
    // --------------------------------------------------------

    if (!imageFile.type.startsWith("image/")) {

        loadingText.textContent =
            "Please select a valid image file.";

        return;
    }


    // --------------------------------------------------------
    // Show loading
    // --------------------------------------------------------

    analyzeBtn.disabled = true;

    analyzeBtn.textContent =
        "Analysing...";

    loadingText.textContent =
        "Please wait while Haneul Palette analyses your colours...";

    resultWrapper.style.display = "none";


    // --------------------------------------------------------
    // Prepare image for backend
    // --------------------------------------------------------

    const formData = new FormData();

    formData.append(
        "image",
        imageFile
    );


    try {

        // ----------------------------------------------------
        // Send image to Python backend
        // ----------------------------------------------------

        const response = await fetch(
            BACKEND_URL + "/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        // ----------------------------------------------------
        // Check server response
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );
        }


        const data = await response.json();


        // ----------------------------------------------------
        // Check analysis result
        // ----------------------------------------------------

        if (!data.success) {

            throw new Error(
                data.error ||
                "Analysis could not be completed."
            );
        }


        // ----------------------------------------------------
        // Display results
        // ----------------------------------------------------

        displayAnalysisResults(data);


        loadingText.textContent =
            "Your Haneul Palette analysis is ready.";


    } catch (error) {

        console.error(
            "Haneul Palette analysis error:",
            error
        );


        loadingText.textContent =
            "Something went wrong while analysing the image. Please try again.";

    } finally {

        analyzeBtn.disabled = false;

        analyzeBtn.textContent =
            "Start Analysis";
    }

});


// ------------------------------------------------------------
// DISPLAY ANALYSIS RESULTS
// ------------------------------------------------------------

function displayAnalysisResults(data) {

    resultWrapper.style.display = "block";


    // --------------------------------------------------------
    // Season
    // --------------------------------------------------------

    if (data.season) {

        seasonResult.innerHTML = `
            <h3>Your Colour Season</h3>
            <p>${escapeHTML(data.season)}</p>
        `;

    } else {

        seasonResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Direction
    // --------------------------------------------------------

    if (data.undertone) {

        directionResult.innerHTML = `
            <h3>Undertone</h3>
            <p>${escapeHTML(data.undertone)}</p>
        `;

    } else {

        directionResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Depth
    // --------------------------------------------------------

    if (data.depth) {

        depthResult.innerHTML = `
            <h3>Depth</h3>
            <p>${escapeHTML(data.depth)}</p>
        `;

    } else {

        depthResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Quality / Chroma
    // --------------------------------------------------------

    if (data.chroma) {

        qualityResult.innerHTML = `
            <h3>Colour Quality</h3>
            <p>${escapeHTML(data.chroma)}</p>
        `;

    } else {

        qualityResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Palette
    // --------------------------------------------------------

    if (
        Array.isArray(data.palette) &&
        data.palette.length > 0
    ) {

        let paletteHTML = `
            <h3>Your Personal Palette</h3>
            <div class="palette-grid">
        `;


        data.palette.forEach(
            colour => {

                if (
                    typeof colour === "object" &&
                    colour !== null
                ) {

                    const name =
                        colour.name || "";

                    const hex =
                        colour.hex || "#eeeeee";


                    paletteHTML += `
                        <div class="palette-item">

                            <div
                                class="palette-swatch"
                                style="background:${escapeAttribute(hex)};"
                            ></div>

                            <span>
                                ${escapeHTML(name)}
                            </span>

                        </div>
                    `;

                } else {

                    paletteHTML += `
                        <div class="palette-item">

                            <div
                                class="palette-swatch"
                                style="background:#eeeeee;"
                            ></div>

                            <span>
                                ${escapeHTML(String(colour))}
                            </span>

                        </div>
                    `;
                }

            }
        );


        paletteHTML += `
            </div>
        `;


        paletteResult.innerHTML =
            paletteHTML;

    } else {

        paletteResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Suitable colours
    // --------------------------------------------------------

    if (data.suitable) {

        suitableResult.innerHTML = `
            <h3>Colours That Suit You</h3>
            <p>${escapeHTML(data.suitable)}</p>
        `;

    } else {

        suitableResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Unsuitable colours
    // --------------------------------------------------------

    if (data.unsuitable) {

        unsuitableResult.innerHTML = `
            <h3>Colours to Approach Carefully</h3>
            <p>${escapeHTML(data.unsuitable)}</p>
        `;

    } else {

        unsuitableResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Styling
    // --------------------------------------------------------

    if (data.style) {

        styleResult.innerHTML = `
            <h3>Styling Direction</h3>
            <p>${escapeHTML(data.style)}</p>
        `;

    } else {

        styleResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // Harmony
    // --------------------------------------------------------

    if (data.harmony) {

        harmonyResult.innerHTML = `
            <h3>Your Colour Harmony</h3>
            <p>${escapeHTML(data.harmony)}</p>
        `;

    } else {

        harmonyResult.innerHTML = "";
    }


    // --------------------------------------------------------
    // PDF
    // --------------------------------------------------------

    if (data.pdf_url) {

        pdfBtn.style.display =
            "block";

        pdfBtn.onclick = () => {

            window.open(
                data.pdf_url,
                "_blank"
            );

        };

    } else {

        pdfBtn.style.display =
            "none";
    }

}


// ------------------------------------------------------------
// SAFE HTML TEXT
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ------------------------------------------------------------
// SAFE CSS ATTRIBUTE
// ------------------------------------------------------------

function escapeAttribute(value) {

    return String(value)
        .replace(/"/g, "")
        .replace(/'/g, "");

}


// ------------------------------------------------------------
// PDF BUTTON
// ------------------------------------------------------------

pdfBtn.addEventListener(
    "click",
    () => {

        if (pdfStatus) {

            pdfStatus.textContent =
                "Your personalized PDF is being prepared...";
        }

    }
);
