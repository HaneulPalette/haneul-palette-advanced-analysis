const imageInput = document.getElementById("imageInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingText = document.getElementById("loadingText");

analyzeBtn.addEventListener("click", async () => {

    if (!imageInput.files || imageInput.files.length === 0) {

        loadingText.textContent =
            "Please upload a clear photograph first.";

        return;
    }

    loadingText.textContent =
        "Connecting to Haneul Palette analysis...";

});
