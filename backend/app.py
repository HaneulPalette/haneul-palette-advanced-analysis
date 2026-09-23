from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import cv2
import numpy as np
from PIL import Image
import io


app = FastAPI(
    title="Haneul Palette Advanced Analysis API"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HOME / HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "status": "online",
        "service": "Haneul Palette Advanced Analysis",
        "message": "Haneul Palette backend is running."
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# --------------------------------------------------
# IMAGE ANALYSIS TEST
# --------------------------------------------------

@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...)
):

    image_bytes = await image.read()

    try:

        pil_image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception:

        return {
            "success": False,
            "error": "Unable to read the uploaded image."
        }


    image_array = np.array(pil_image)

    height, width = image_array.shape[:2]


    return {
        "success": True,

        "message": "Image received successfully.",

        "image": {
            "width": width,
            "height": height
        }
    }
