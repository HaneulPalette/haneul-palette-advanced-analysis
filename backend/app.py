import os
import io
import json
import random
import string
import tempfile
import traceback

import cv2
import numpy as np
import gspread

from PIL import Image

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from google.oauth2.service_account import Credentials

from reportlab.platypus import (
    SimpleDocTemplate,
    Spacer,
    Paragraph,
    Table,
    TableStyle
)

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)

from reportlab.platypus.flowables import Image as RLImage
from reportlab.platypus.flowables import HRFlowable

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Haneul Palette Advanced Analysis API",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# GOOGLE SHEETS
# ============================================================

SHEET_ID = "1AzIVX4w5SH23RklNbtDiRZ5x0VihKeEo0pnK0Fw7_ak"

SHEET_NAME = "Form Responses"

TEMP_RESULTS = {}


def get_google_sheet():

    credentials_json = os.environ.get(
        "GOOGLE_SERVICE_ACCOUNT_JSON"
    )

    if not credentials_json:

        raise RuntimeError(
            "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing."
        )

    credentials_info = json.loads(
        credentials_json
    )

    scope = [
        "https://www.googleapis.com/auth/spreadsheets"
    ]

    creds = Credentials.from_service_account_info(
        credentials_info,
        scopes=scope
    )

    client = gspread.authorize(creds)

    return client.open_by_key(
        SHEET_ID
    ).worksheet(
        SHEET_NAME
    )


# ============================================================
# USER ID
# ============================================================

def generate_user_id():

    chars = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=7
        )
    )

    return f"HP_AA_{chars}"


# ============================================================
# FACE + COLOR ANALYSIS
# ============================================================

def extract_skin_region(face):

    hsv = cv2.cvtColor(
        face,
        cv2.COLOR_BGR2HSV
    )

    lower = np.array(
        [0, 20, 70],
        dtype=np.uint8
    )

    upper = np.array(
        [20, 255, 255],
        dtype=np.uint8
    )

    mask = cv2.inRange(
        hsv,
        lower,
        upper
    )

    skin = cv2.bitwise_and(
        face,
        face,
        mask=mask
    )

    return skin


def extract_face_skin(image):

    img = cv2.cvtColor(
        np.array(image),
        cv2.COLOR_RGB2BGR
    )

    height, width = img.shape[:2]

    max_size = 700

    if width > max_size:

        scale = max_size / width

        img = cv2.resize(
            img,
            (
                int(width * scale),
                int(height * scale)
            )
        )

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades +
        "haarcascade_frontalface_default.xml"
    )

    gray = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(80, 80)
    )

    if faces is None or len(faces) == 0:

        return None

    x, y, w, h = faces[0]

    return img[
        y:y+h,
        x:x+w
    ]


def calculate_skin_metrics(face):

    if face is None or face.size == 0:

        return {
            "r": 0,
            "g": 0,
            "b": 0,
            "brightness": 0,
            "saturation": 0,
            "warm_score": 0,
            "contrast": 0
        }

    skin = extract_skin_region(face)

    pixels = skin.reshape(
        -1,
        3
    )

    pixels = pixels[
        np.any(
            pixels > 0,
            axis=1
        )
    ]

    if len(pixels) == 0:

        return {
            "r": 0,
            "g": 0,
            "b": 0,
            "brightness": 0,
            "saturation": 0,
            "warm_score": 0,
            "contrast": 0
        }

    pixels = pixels.astype(
        np.float32
    )

    max_val = np.max(pixels)

    if max_val != 0:

        pixels = (
            pixels / max_val
        ) * 255

    avg_color = np.mean(
        pixels,
        axis=0
    )

    std_color = np.std(
        pixels,
        axis=0
    )

    r, g, b = avg_color

    brightness = np.mean(
        avg_color
    )

    saturation = np.mean(
        std_color
    )

    warm_score = (
        (r - b) * 1.2
        +
        (r - g) * 0.8
    )

    contrast = np.max(
        std_color
    )

    return {
        "r": float(r),
        "g": float(g),
        "b": float(b),
        "brightness": float(brightness),
        "saturation": float(saturation),
        "warm_score": float(warm_score),
        "contrast": float(contrast)
    }


# ============================================================
# UNDERTONE
# ============================================================

def determine_undertone(metrics):

    warm_score = metrics["warm_score"]

    brightness = metrics["brightness"]

    saturation = metrics["saturation"]

    contrast = metrics["contrast"]


    if warm_score >= 20:

        base = "Warm"

    elif warm_score <= -15:

        base = "Cool"

    else:

        base = "Neutral"


    if brightness >= 175:

        depth = "Light"

    elif brightness <= 115:

        depth = "Deep"

    else:

        depth = "Medium"


    if saturation >= 32 and contrast >= 38:

        chroma = "Bright"

    elif saturation <= 18:

        chroma = "Soft"

    else:

        chroma = "Balanced"


    undertone = f"{base} {depth}"

    return undertone, chroma


# ============================================================
# 16-SEASON ENGINE
# ============================================================

def determine_season(
    undertone,
    chroma,
    metrics
):

    brightness = metrics["brightness"]

    saturation = metrics["saturation"]

    contrast = metrics["contrast"]

    warm_score = metrics["warm_score"]


    if warm_score >= 22:

        if (
            brightness >= 170
            and
            saturation >= 30
        ):

            return "Bright Spring"

        elif (
            brightness >= 168
            and
            saturation < 30
        ):

            return "Light Spring"

        elif (
            saturation >= 24
            and
            contrast >= 32
        ):

            return "True Spring"

        else:

            return "Warm Spring"


    elif warm_score >= 4:

        if (
            contrast >= 42
            and
            brightness <= 145
        ):

            return "Deep Autumn"

        elif saturation <= 18:

            return "Soft Autumn"

        elif saturation <= 24:

            return "True Autumn"

        else:

            return "Warm Autumn"


    elif warm_score <= -22:

        if (
            contrast >= 45
            and
            saturation >= 30
        ):

            return "Bright Winter"

        elif contrast >= 40:

            return "True Winter"

        elif brightness <= 120:

            return "Deep Winter"

        else:

            return "Cool Winter"


    else:

        if brightness >= 168:

            return "Light Summer"

        elif saturation <= 16:

            return "Soft Summer"

        elif contrast <= 28:

            return "True Summer"

        else:

            return "Cool Summer"


# =========================
# COLOR PALETTES
# =========================

SEASON_PALETTES = {

    "Bright Spring": [
        "Coral", "Peach", "Warm Ivory", "Golden Yellow",
        "Tomato Red", "Fresh Mint", "Warm Aqua", "Camel",
        "Soft Orange", "Light Teal", "Apricot", "Warm Beige",
        "Warm Pink", "Olive", "Turquoise", "Salmon",
        "Warm Cream", "Coral Rose", "Sunflower", "Warm Brown"
    ],

    "True Spring": [
        "Golden Peach", "Warm Coral", "Sunflower", "Warm Aqua",
        "Cream", "Camel", "Fresh Green", "Apricot",
        "Warm Pink", "Honey Beige", "Golden Brown", "Coral Red",
        "Light Olive", "Soft Yellow", "Warm Mint", "Melon",
        "Warm Teal", "Ivory", "Peach Beige", "Golden Nude"
    ],

    "Light Spring": [
        "Light Peach", "Butter Yellow", "Soft Coral", "Mint",
        "Warm Sky Blue", "Light Aqua", "Ivory", "Cream Beige",
        "Warm Pink", "Golden Ivory", "Apricot", "Soft Gold",
        "Warm Lavender", "Light Camel", "Soft Teal", "Fresh Green",
        "Warm Rose", "Peach Nude", "Light Olive", "Pale Coral"
    ],

    "Warm Spring": [
        "Warm Orange", "Tomato Red", "Golden Brown", "Warm Beige",
        "Olive", "Sunflower", "Warm Green", "Peach",
        "Coral", "Honey", "Warm Camel", "Warm Cream",
        "Terracotta", "Warm Aqua", "Golden Yellow", "Copper",
        "Warm Mint", "Salmon", "Apricot", "Warm Nude"
    ],

    "Light Summer": [
        "Powder Blue", "Soft Lavender", "Cool Pink", "Light Gray",
        "Dusty Rose", "Cool Beige", "Soft Navy", "Silver",
        "Muted Lilac", "Soft Mauve", "Cool Aqua", "Rose Beige",
        "Soft Plum", "Cool Denim", "Light Berry", "Smoky Blue",
        "Cool Taupe", "Dusty Blue", "Cool Mint", "Soft Rose"
    ],

    "True Summer": [
        "Dusty Rose", "Cool Pink", "Muted Blue", "Lavender",
        "Soft Navy", "Cool Taupe", "Powder Blue", "Soft Berry",
        "Muted Plum", "Cool Gray", "Rose Beige", "Mauve",
        "Cool Lilac", "Smoky Blue", "Muted Teal", "Cool Cocoa",
        "Dusty Lavender", "Cool Rose", "Silver Gray", "Soft Denim"
    ],

    "Soft Summer": [
        "Dusty Blue", "Muted Mauve", "Soft Plum", "Cool Taupe",
        "Dusty Lavender", "Smoky Rose", "Cool Gray", "Muted Teal",
        "Soft Navy", "Rose Beige", "Cool Cocoa", "Soft Berry",
        "Muted Lilac", "Dusty Pink", "Soft Denim", "Cool Mint",
        "Silver Gray", "Soft Aqua", "Muted Blue", "Cool Rose"
    ],

    "Cool Summer": [
        "Cool Pink", "Berry", "Lavender", "Cool Navy",
        "Rose", "Soft White", "Silver Gray", "Plum",
        "Smoky Blue", "Cool Beige", "Soft Purple", "Cool Mauve",
        "Dusty Rose", "Soft Lilac", "Blue Gray", "Cool Denim",
        "Muted Berry", "Soft Aqua", "Cool Mint", "Rose Taupe"
    ],

    "Soft Autumn": [
        "Dusty Olive", "Muted Rust", "Warm Taupe", "Soft Camel",
        "Terracotta", "Warm Beige", "Coffee Brown", "Muted Peach",
        "Soft Mustard", "Olive Green", "Muted Coral", "Warm Khaki",
        "Dusty Rose", "Chocolate Brown", "Warm Nude", "Muted Gold",
        "Cinnamon", "Caramel", "Soft Copper", "Muted Sage"
    ],

    "True Autumn": [
        "Rust", "Terracotta", "Olive", "Warm Brown",
        "Camel", "Mustard", "Warm Beige", "Coffee",
        "Muted Peach", "Burnt Orange", "Warm Khaki", "Chocolate",
        "Copper", "Golden Brown", "Warm Taupe", "Warm Nude",
        "Caramel", "Soft Gold", "Cinnamon", "Warm Cream"
    ],

    "Deep Autumn": [
        "Deep Olive", "Espresso", "Chocolate Brown", "Dark Rust",
        "Deep Camel", "Warm Charcoal", "Forest Green", "Coffee Brown",
        "Warm Burgundy", "Copper", "Deep Teal", "Burnt Orange",
        "Golden Brown", "Dark Mustard", "Rich Beige", "Deep Khaki",
        "Warm Navy", "Deep Bronze", "Dark Cinnamon", "Warm Cocoa"
    ],

    "Warm Autumn": [
        "Golden Brown", "Mustard", "Olive", "Warm Rust",
        "Camel", "Coffee", "Copper", "Terracotta",
        "Warm Beige", "Caramel", "Chocolate", "Burnt Orange",
        "Warm Green", "Deep Peach", "Golden Yellow", "Warm Cream",
        "Warm Nude", "Cinnamon", "Warm Khaki", "Bronze"
    ],

    "Bright Winter": [
        "Electric Blue", "Hot Pink", "Pure White", "Black",
        "Ruby Red", "Cool Emerald", "Icy Pink", "Silver",
        "Bright Purple", "Cool Cyan", "Magenta", "Cool Navy",
        "Cool Gray", "Icy Lavender", "Berry", "Cool Mint",
        "Bright Red", "Royal Blue", "Fuchsia", "Cool White"
    ],

    "True Winter": [
        "Black", "Pure White", "Royal Blue", "Emerald",
        "Cool Red", "Magenta", "Cool Gray", "Silver",
        "Berry", "Deep Purple", "Cool Navy", "Icy Pink",
        "Cool Mint", "Cool Lavender", "Blue Black", "Ruby",
        "Cool Charcoal", "Icy Blue", "Bright Cyan", "Cool Plum"
    ],

    "Deep Winter": [
        "Black", "Deep Navy", "Cool Charcoal", "Wine Red",
        "Deep Emerald", "Cool Espresso", "Cool Plum", "Berry",
        "Royal Blue", "Dark Gray", "Cool White", "Icy Pink",
        "Silver", "Deep Purple", "Cool Mint", "Blue Black",
        "Cool Burgundy", "Cool Teal", "Deep Cyan", "Cool Cocoa"
    ],

    "Cool Winter": [
        "Cool Blue", "Fuchsia", "Black", "Pure White",
        "Cool Pink", "Royal Blue", "Silver", "Berry",
        "Cool Lavender", "Cool Navy", "Emerald", "Cool Gray",
        "Icy Purple", "Cool Cyan", "Magenta", "Blue Black",
        "Cool Mint", "Ruby", "Deep Plum", "Cool Charcoal"
    ]
}

# =========================
# MAKEUP ENGINE
# =========================

MAKEUP_GUIDE = {

    "Bright Spring": {
        "lipsticks": ["Warm Coral", "Fresh Peach", "Tomato Red", "Warm Rose", "Bright Apricot"],
        "blush": ["Coral Peach", "Warm Pink", "Apricot Glow"],
        "eyeshadow": ["Warm Gold", "Champagne Bronze", "Peach Brown"],
        "foundation": "Warm Golden Beige"
    },

    "True Spring": {
        "lipsticks": ["Golden Peach", "Warm Coral", "Honey Nude", "Apricot", "Warm Rose"],
        "blush": ["Golden Apricot", "Peach Coral", "Warm Glow"],
        "eyeshadow": ["Soft Gold", "Warm Bronze", "Honey Brown"],
        "foundation": "Golden Warm Beige"
    },

    "Light Spring": {
        "lipsticks": ["Soft Peach", "Light Coral", "Warm Nude Pink", "Apricot Nude", "Peach Beige"],
        "blush": ["Soft Apricot", "Peach Pink", "Light Coral"],
        "eyeshadow": ["Champagne", "Soft Gold", "Light Warm Taupe"],
        "foundation": "Light Warm Ivory"
    },

    "Warm Spring": {
        "lipsticks": ["Warm Orange", "Terracotta Coral", "Golden Peach", "Warm Nude", "Apricot"],
        "blush": ["Warm Peach", "Golden Coral", "Soft Orange"],
        "eyeshadow": ["Bronze Gold", "Warm Copper", "Camel Brown"],
        "foundation": "Warm Beige"
    },

    "Light Summer": {
        "lipsticks": ["Cool Pink", "Rose Nude", "Soft Mauve", "Dusty Rose", "Cool Berry"],
        "blush": ["Soft Rose", "Cool Pink", "Dusty Mauve"],
        "eyeshadow": ["Cool Taupe", "Soft Lavender", "Silver Pink"],
        "foundation": "Light Neutral Cool Beige"
    },

    "True Summer": {
        "lipsticks": ["Rose Mauve", "Dusty Pink", "Muted Berry", "Cool Rose", "Soft Plum"],
        "blush": ["Rose Pink", "Soft Mauve", "Cool Berry"],
        "eyeshadow": ["Dusty Lavender", "Cool Taupe", "Smoky Rose"],
        "foundation": "Neutral Cool Beige"
    },

    "Soft Summer": {
        "lipsticks": ["Muted Rose", "Dusty Berry", "Soft Mauve", "Cool Nude", "Muted Plum"],
        "blush": ["Dusty Pink", "Muted Rose", "Soft Berry"],
        "eyeshadow": ["Smoky Taupe", "Muted Lavender", "Cool Beige"],
        "foundation": "Soft Neutral Beige"
    },

    "Cool Summer": {
        "lipsticks": ["Berry Pink", "Cool Rose", "Soft Plum", "Cool Mauve", "Rosewood"],
        "blush": ["Cool Rose", "Berry Pink", "Soft Plum"],
        "eyeshadow": ["Cool Gray", "Dusty Purple", "Smoky Blue"],
        "foundation": "Cool Beige"
    },

    "Soft Autumn": {
        "lipsticks": ["Muted Cinnamon", "Warm Nude", "Soft Terracotta", "Muted Peach", "Dusty Coral"],
        "blush": ["Warm Beige Peach", "Muted Coral", "Soft Apricot"],
        "eyeshadow": ["Olive Brown", "Warm Taupe", "Bronze Gold"],
        "foundation": "Neutral Warm Beige"
    },

    "True Autumn": {
        "lipsticks": ["Rust Brown", "Terracotta", "Warm Brick", "Burnt Peach", "Copper Nude"],
        "blush": ["Warm Rust", "Apricot Brown", "Muted Coral"],
        "eyeshadow": ["Copper", "Olive Bronze", "Chocolate Brown"],
        "foundation": "Golden Tan Beige"
    },

    "Deep Autumn": {
        "lipsticks": ["Deep Cinnamon", "Chocolate Nude", "Warm Burgundy", "Rust Brown", "Espresso"],
        "blush": ["Warm Bronze", "Deep Peach", "Muted Rust"],
        "eyeshadow": ["Espresso Brown", "Deep Olive", "Bronzed Copper"],
        "foundation": "Deep Warm Beige"
    },

    "Warm Autumn": {
        "lipsticks": ["Burnt Orange", "Warm Brick", "Terracotta Nude", "Copper Peach", "Warm Brown"],
        "blush": ["Golden Bronze", "Warm Coral", "Burnt Peach"],
        "eyeshadow": ["Warm Copper", "Camel Brown", "Olive Gold"],
        "foundation": "Warm Golden Tan"
    },

    "Bright Winter": {
        "lipsticks": ["Fuchsia", "Cool Ruby", "Berry Pink", "Cherry Red", "Cool Magenta"],
        "blush": ["Cool Berry", "Bright Pink", "Icy Rose"],
        "eyeshadow": ["Silver", "Charcoal", "Cool Navy"],
        "foundation": "Cool Neutral Ivory"
    },

    "True Winter": {
        "lipsticks": ["Ruby Red", "Berry Wine", "Cool Cherry", "Magenta", "Cool Plum"],
        "blush": ["Cool Berry", "Rose Pink", "Cool Plum"],
        "eyeshadow": ["Black Gray", "Silver", "Cool Charcoal"],
        "foundation": "Cool Neutral Beige"
    },

    "Deep Winter": {
        "lipsticks": ["Deep Berry", "Wine Red", "Cool Espresso", "Dark Plum", "Black Cherry"],
        "blush": ["Deep Rose", "Cool Berry", "Wine Pink"],
        "eyeshadow": ["Black", "Deep Navy", "Cool Espresso"],
        "foundation": "Deep Cool Beige"
    },

    "Cool Winter": {
        "lipsticks": ["Cool Pink", "Berry Red", "Icy Plum", "Cool Fuchsia", "Cherry Pink"],
        "blush": ["Berry Pink", "Cool Rose", "Icy Mauve"],
        "eyeshadow": ["Silver Gray", "Cool Navy", "Cool Purple"],
        "foundation": "Cool Ivory Beige"
    }
}

# =========================
# HAIR GUIDE
# =========================

HAIR_GUIDE = {

    "Bright Spring": [
        "Warm Chocolate Brown",
        "Golden Brown",
        "Honey Brown",
        "Soft Copper"
    ],

    "True Spring": [
        "Golden Brown",
        "Warm Chestnut",
        "Honey Caramel",
        "Soft Auburn"
    ],

    "Light Spring": [
        "Light Golden Brown",
        "Honey Blonde",
        "Soft Caramel",
        "Warm Beige Brown"
    ],

    "Warm Spring": [
        "Copper Brown",
        "Golden Auburn",
        "Warm Chestnut",
        "Rich Honey Brown"
    ],

    "Light Summer": [
        "Soft Ash Brown",
        "Cool Beige Blonde",
        "Muted Mocha",
        "Dusty Ash Blonde"
    ],

    "True Summer": [
        "Soft Ash Brown",
        "Muted Cocoa",
        "Cool Mocha",
        "Dusty Brown"
    ],

    "Soft Summer": [
        "Muted Ash Brown",
        "Taupe Brown",
        "Cool Mushroom Brown",
        "Dusty Cocoa"
    ],

    "Cool Summer": [
        "Cool Espresso",
        "Ash Brown",
        "Smoky Brunette",
        "Cool Dark Brown"
    ],

    "Soft Autumn": [
        "Chestnut Brown",
        "Warm Espresso",
        "Muted Copper",
        "Caramel Brown"
    ],

    "True Autumn": [
        "Rich Chestnut",
        "Golden Copper",
        "Warm Chocolate",
        "Cinnamon Brown"
    ],

    "Deep Autumn": [
        "Deep Espresso",
        "Dark Chocolate Brown",
        "Warm Black Brown",
        "Dark Chestnut"
    ],

    "Warm Autumn": [
        "Copper Brown",
        "Golden Chestnut",
        "Warm Caramel",
        "Bronze Brown"
    ],

    "Bright Winter": [
        "Blue Black",
        "Cool Espresso",
        "Glossy Black Brown",
        "Deep Cool Brunette"
    ],

    "True Winter": [
        "Jet Black",
        "Cool Black Brown",
        "Deep Espresso",
        "Dark Ash Brown"
    ],

    "Deep Winter": [
        "Black Espresso",
        "Cool Ebony",
        "Dark Plum Brown",
        "Deep Charcoal Brown"
    ],

    "Cool Winter": [
        "Cool Black",
        "Dark Ash Brown",
        "Smoky Espresso",
        "Cool Deep Brunette"
    ]
}

# =========================
# ACCESSORIES GUIDE
# =========================

ACCESSORIES = {

    "Bright Spring": {
        "jewelry": "Gold and Warm Rose Gold",
        "frames": "Warm Brown, Honey, Gold"
    },

    "True Spring": {
        "jewelry": "Rich Gold and Golden Rose Gold",
        "frames": "Warm Camel, Honey Brown, Olive Gold"
    },

    "Light Spring": {
        "jewelry": "Light Gold and Soft Rose Gold",
        "frames": "Champagne Beige, Light Camel, Soft Peach Brown"
    },

    "Warm Spring": {
        "jewelry": "Golden Bronze and Warm Gold",
        "frames": "Warm Olive, Copper Brown, Camel"
    },

    "Light Summer": {
        "jewelry": "Soft Silver and Rose Silver",
        "frames": "Cool Beige, Soft Gray, Dusty Mauve"
    },

    "True Summer": {
        "jewelry": "Soft Silver and Rose Silver",
        "frames": "Cool Gray, Mauve Brown, Dusty Blue"
    },

    "Soft Summer": {
        "jewelry": "Muted Silver and Soft Pewter",
        "frames": "Taupe Gray, Smoky Rose, Muted Navy"
    },

    "Cool Summer": {
        "jewelry": "Bright Silver and White Gold",
        "frames": "Cool Gray, Navy, Smoky Plum"
    },

    "Soft Autumn": {
        "jewelry": "Muted Gold and Antique Gold",
        "frames": "Olive Brown, Coffee, Camel"
    },

    "True Autumn": {
        "jewelry": "Rich Gold, Bronze, and Antique Copper",
        "frames": "Warm Chestnut, Olive, Bronze Brown"
    },

    "Deep Autumn": {
        "jewelry": "Dark Gold, Bronze, and Oxidized Metals",
        "frames": "Espresso Brown, Deep Olive, Warm Charcoal"
    },

    "Warm Autumn": {
        "jewelry": "Golden Bronze and Copper Gold",
        "frames": "Camel Brown, Warm Olive, Cinnamon"
    },

    "Bright Winter": {
        "jewelry": "Silver, Platinum, and White Gold",
        "frames": "Black, Bright Navy, Crystal Gray"
    },

    "True Winter": {
        "jewelry": "Silver and White Gold",
        "frames": "Black, Silver, Cool Navy"
    },

    "Deep Winter": {
        "jewelry": "Gunmetal Silver and Platinum",
        "frames": "Black, Charcoal, Deep Burgundy"
    },

    "Cool Winter": {
        "jewelry": "Bright Silver and Icy White Gold",
        "frames": "Cool Black, Navy, Icy Gray"
    }
}


# =========================
# DETAILED EXPLANATIONS
# =========================

def generate_explanation(season, undertone, chroma):

    explanations = {

        "Bright Spring": f"""
Your features reflect the lively clarity of Bright Spring palettes.
Your {undertone.lower()} undertone harmonizes beautifully with energetic warm shades, fresh brightness, and high chroma combinations.
Coral, peach, warm aqua, sunflower yellow, and bright camel naturally illuminate your complexion while maintaining youthful vibrancy.
Overly muted or dusty shades may reduce your natural brightness and create visual heaviness.
Fresh glowing makeup, radiant gold jewelry, and luminous styling create exceptional harmony for your appearance.
""",

        "True Spring": f"""
Your coloring aligns beautifully with the balanced warmth of True Spring harmony.
Your {undertone.lower()} undertone is enhanced by clear warm shades, lively saturation, and naturally radiant combinations.
Golden peach, apricot, honey beige, warm coral, fresh green, and soft turquoise brighten your complexion beautifully.
Extremely cool or icy tones may create visual imbalance and reduce skin harmony.
Elegant warm layering, glowing textures, and golden accessories elevate your natural freshness effortlessly.
""",

        "Light Spring": f"""
Your appearance reflects the airy softness of Light Spring palettes.
Your {undertone.lower()} undertone harmonizes with delicate warmth, soft brightness, and lightly luminous shades.
Butter yellow, pale coral, warm ivory, mint, light aqua, and soft peach naturally enhance your complexion gently.
Very dark or overly muted shades may overpower your natural softness.
Soft luxury styling, delicate gold jewelry, and fresh pastel combinations create graceful refinement.
""",

        "Warm Spring": f"""
Your coloring harmonizes with the rich warmth of Warm Spring palettes.
Your {undertone.lower()} undertone thrives in warm vibrant shades with healthy brightness and energetic depth.
Warm orange, sunflower yellow, coral red, olive green, apricot, and warm beige create glowing harmony with your complexion.
Cool icy tones may reduce facial warmth and appear disconnected from your natural features.
Golden accessories, warm makeup tones, and radiant styling create exceptional balance for your appearance.
""",

        "Light Summer": f"""
Your features reflect the soft elegance of Light Summer harmony.
Your {undertone.lower()} undertone works beautifully with cool airy shades, gentle softness, and refined pastel balance.
Powder blue, cool pink, lavender, soft gray, dusty rose, and cool aqua naturally soften and brighten your complexion.
Harsh dark contrasts or heavy warm tones may overpower your natural harmony.
Silver jewelry, soft romantic fabrics, and elegant cool layering enhance your overall sophistication beautifully.
""",

        "True Summer": f"""
Your natural coloring reflects the graceful softness of True Summer palettes.
Your {undertone.lower()} undertone harmonizes with cool muted elegance, refined softness, and balanced depth.
Dusty rose, lavender, smoky blue, cool taupe, muted berry, and soft navy enhance your complexion with smooth sophistication.
Overly warm oranges or extremely bright neon shades may create imbalance and reduce harmony.
Soft monochromatic styling, silver jewelry, and cool romantic tones create luxurious refinement for your appearance.
""",

        "Soft Summer": f"""
Your appearance aligns with the muted elegance of Soft Summer harmony.
Your {undertone.lower()} undertone is enhanced by soft cool neutrals, smoky depth, and delicate muted sophistication.
Dusty blue, muted mauve, cool taupe, soft plum, smoky rose, and muted teal naturally harmonize with your complexion.
Very bright or heavily saturated colors may overpower your natural softness.
Elegant layering, soft tailoring, silver accessories, and blended cool palettes create timeless sophistication.
""",

        "Cool Summer": f"""
Your features reflect the graceful coolness of Cool Summer palettes.
Your {undertone.lower()} undertone harmonizes beautifully with icy softness, cool clarity, and balanced contrast.
Berry pink, lavender, cool navy, smoky blue, silver gray, and cool rose naturally enhance your complexion elegantly.
Warm earthy shades may create visual heaviness and reduce natural freshness.
Cool silver jewelry, soft flowing fabrics, and refined cool-toned styling elevate your appearance beautifully.
""",

        "Soft Autumn": f"""
Your features naturally align with the understated elegance of Soft Autumn harmony.
Your {undertone.lower()} undertone is enhanced by earthy muted warmth, balanced softness, and medium-depth luxury neutrals.
Muted rust, olive green, warm taupe, cinnamon brown, dusty peach, caramel, and cocoa create natural richness beautifully.
Icy shades or sharp contrasts may appear visually harsh against your natural softness.
Textured fabrics, antique gold jewelry, and earthy luxury palettes create timeless sophistication.
""",

        "True Autumn": f"""
Your appearance reflects the rich warmth of True Autumn palettes.
Your {undertone.lower()} undertone harmonizes beautifully with earthy depth, golden richness, and warm muted intensity.
Rust, terracotta, mustard, olive, chocolate brown, camel, and copper enhance your complexion naturally.
Extremely cool or icy shades may reduce your skin’s natural warmth and depth.
Warm layering, luxurious earthy textures, and rich gold accessories create powerful harmony for your features.
""",

        "Deep Autumn": f"""
Your features align with the dramatic richness of Deep Autumn harmony.
Your {undertone.lower()} undertone thrives in deep earthy warmth, luxurious contrast, and bold muted richness.
Espresso brown, forest green, deep olive, dark rust, bronze, warm burgundy, and deep camel create striking balance.
Very pale icy shades may weaken your natural intensity.
Structured luxury styling, rich textures, and bold warm neutrals enhance your sophisticated appearance powerfully.
""",

        "Warm Autumn": f"""
Your coloring harmonizes with the golden richness of Warm Autumn palettes.
Your {undertone.lower()} undertone is enhanced by warm earthy depth, muted luxury tones, and natural richness.
Terracotta, mustard, olive, camel, bronze, cinnamon, warm beige, and burnt orange beautifully complement your complexion.
Cool icy shades may reduce warmth and create imbalance.
Warm textures, layered styling, and rich gold accessories create elegant harmony for your appearance.
""",

        "Bright Winter": f"""
Your appearance aligns with the striking brilliance of Bright Winter palettes.
Your {undertone.lower()} undertone is enhanced by vivid cool clarity, high contrast, and crisp saturation.
Electric blue, fuchsia, ruby red, icy pink, pure white, and cool emerald create exceptional vibrancy beautifully.
Muted warm tones may reduce your facial definition and brightness.
Sharp tailoring, glossy textures, bold contrasts, and cool metallic finishes create exceptional harmony.
""",

        "True Winter": f"""
Your features reflect the bold sophistication of True Winter harmony.
Your {undertone.lower()} undertone harmonizes with cool intensity, strong contrast, and jewel-toned elegance.
Black, royal blue, emerald, ruby red, icy white, and cool plum naturally intensify your facial definition beautifully.
Warm muted shades may reduce clarity and visual sharpness.
Structured styling, polished silver accessories, and dramatic contrast combinations enhance your appearance powerfully.
""",

        "Deep Winter": f"""
Your features reflect the dramatic sophistication of Deep Winter harmony.
Your {undertone.lower()} undertone harmonizes with deep contrast, cool richness, and bold jewel-toned elegance.
Black, royal blue, deep emerald, cool burgundy, icy white, and deep plum intensify your natural definition beautifully.
Muted earthy shades may reduce your visual sharpness and clarity.
Monochromatic dark styling, polished silver accessories, and luxury contrast combinations elevate your intensity powerfully.
""",

        "Cool Winter": f"""
Your appearance reflects the crisp elegance of Cool Winter palettes.
Your {undertone.lower()} undertone thrives in cool clarity, icy sophistication, and refined contrast.
Cool blue, berry pink, icy lavender, cool navy, silver gray, and pure white naturally sharpen and brighten your complexion.
Warm earthy tones may appear visually disconnected from your natural harmony.
Cool metallic jewelry, sleek tailoring, and icy polished styling create exceptional refinement for your appearance.
"""
    }

    return explanations.get(
        season,
        f"""
Your features harmonize beautifully with the {season} palette.
Your {undertone.lower()} undertone is enhanced by balanced tonal coordination and refined seasonal harmony.
"""
    )
