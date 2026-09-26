// ============================================================
// HANEUL PALETTE — ADVANCED KOREAN COLOR ANALYSIS
// Browser-Based Analysis Engine
// No backend required
// ============================================================


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


// ============================================================
// 16-SEASON PALETTES
// ============================================================

const SEASON_PALETTES = {

    "Bright Spring": [
        ["Coral", "#F88379"],
        ["Peach", "#FFCBA4"],
        ["Warm Ivory", "#FFF4D6"],
        ["Golden Yellow", "#F6C453"],
        ["Tomato Red", "#E94B35"],
        ["Fresh Mint", "#9FE2BF"],
        ["Warm Aqua", "#48C9C5"],
        ["Camel", "#C19A6B"],
        ["Soft Orange", "#F4A261"],
        ["Light Teal", "#5BC0BE"],
        ["Apricot", "#FBCEB1"],
        ["Warm Beige", "#E8D3B0"],
        ["Warm Pink", "#F48FB1"],
        ["Olive", "#9A9E58"],
        ["Turquoise", "#40E0D0"],
        ["Salmon", "#FA8072"],
        ["Warm Cream", "#FFFDD0"],
        ["Coral Rose", "#F88379"],
        ["Sunflower", "#FFC512"],
        ["Warm Brown", "#8B5A2B"]
    ],

    "Light Spring": [
        ["Light Peach", "#FFDAB9"],
        ["Butter Yellow", "#FFF1A8"],
        ["Warm Ivory", "#FFF8E7"],
        ["Apricot", "#FBC4AB"],
        ["Light Coral", "#F7AFA3"],
        ["Mint", "#B8E8C8"],
        ["Aqua", "#8DD9D5"],
        ["Light Camel", "#D6B98C"],
        ["Cream", "#FFF4CE"],
        ["Warm Pink", "#F7B2C4"],
        ["Peach Pink", "#F9C5B5"],
        ["Light Gold", "#E9C46A"],
        ["Soft Turquoise", "#7DDDD3"],
        ["Light Olive", "#B5B875"],
        ["Melon", "#FDBCB4"],
        ["Warm Rose", "#EFA6A6"],
        ["Vanilla", "#F3E5AB"],
        ["Honey", "#E8B86D"],
        ["Soft Orange", "#F6A36B"],
        ["Warm Taupe", "#B8A082"]
    ],

    "True Spring": [
        ["True Coral", "#FF6F61"],
        ["Warm Red", "#E94B3C"],
        ["Golden Yellow", "#F2C94C"],
        ["Leaf Green", "#6BAA45"],
        ["Turquoise", "#30D5C8"],
        ["Warm Aqua", "#35C5B5"],
        ["Peach", "#FFB07C"],
        ["Apricot", "#FBCEB1"],
        ["Warm Pink", "#F48FB1"],
        ["Tomato", "#E64A35"],
        ["Camel", "#C19A6B"],
        ["Golden Beige", "#D6B36A"],
        ["Cream", "#FFF3D6"],
        ["Warm Orange", "#F28C28"],
        ["Olive", "#8A9A45"],
        ["Salmon", "#FA8072"],
        ["Coral Rose", "#F88379"],
        ["Honey", "#DFAE45"],
        ["Fresh Green", "#72B043"],
        ["Warm Brown", "#8B5A2B"]
    ],

    "Warm Spring": [
        ["Warm Coral", "#F26B5B"],
        ["Peach", "#F7B267"],
        ["Golden Yellow", "#E9B949"],
        ["Warm Orange", "#E88A3D"],
        ["Tomato", "#D94F3D"],
        ["Warm Aqua", "#45B8B0"],
        ["Olive", "#8E984B"],
        ["Camel", "#B8895B"],
        ["Cream", "#F8E7C2"],
        ["Warm Beige", "#D8B98A"],
        ["Apricot", "#F4B183"],
        ["Salmon", "#E98579"],
        ["Warm Pink", "#E98C9C"],
        ["Honey", "#C9953D"],
        ["Terracotta", "#C96A4B"],
        ["Moss", "#788B4A"],
        ["Golden Brown", "#9A6B35"],
        ["Ivory", "#FFF1D0"],
        ["Burnt Peach", "#D9826B"],
        ["Warm Teal", "#3D9C96"]
    ],

    "Light Summer": [
        ["Powder Blue", "#B0CFEF"],
        ["Soft Rose", "#DFA8B8"],
        ["Lavender", "#C9B6E4"],
        ["Cool Pink", "#E7A8B8"],
        ["Periwinkle", "#9FAFE5"],
        ["Soft Mint", "#B8D8CC"],
        ["Cool Ivory", "#F4F1E8"],
        ["Dusty Blue", "#91A8C2"],
        ["Mauve", "#B98FA7"],
        ["Lilac", "#C8A2C8"],
        ["Soft Aqua", "#9ED9D3"],
        ["Rose Beige", "#D8B7AE"],
        ["Blue Gray", "#A7B7C8"],
        ["Soft Plum", "#A987A8"],
        ["Blush", "#E8B4B8"],
        ["Cool Taupe", "#A99B9A"],
        ["Silver", "#C0C0C0"],
        ["Misty Blue", "#A9C6D9"],
        ["Soft Berry", "#B86F83"],
        ["Cool Pink Beige", "#D7B6B0"]
    ],

    "True Summer": [
        ["Rose", "#C97C8A"],
        ["Cool Pink", "#D88FA0"],
        ["Periwinkle", "#7F9CC6"],
        ["Blue", "#6488B8"],
        ["Lavender", "#A78BC2"],
        ["Mauve", "#A56F83"],
        ["Dusty Rose", "#B9828C"],
        ["Cool Berry", "#9E536A"],
        ["Plum", "#765276"],
        ["Soft Navy", "#536D8E"],
        ["Cool Teal", "#4D9292"],
        ["Blue Gray", "#72869B"],
        ["Cool Beige", "#B7A6A0"],
        ["Rose Brown", "#8E6864"],
        ["Lilac", "#B69AC4"],
        ["Cool Red", "#B75D6B"],
        ["Misty Blue", "#91AFC4"],
        ["Soft White", "#F2F2ED"],
        ["Silver", "#BFC4C8"],
        ["Cool Taupe", "#8D807D"]
    ],

    "Soft Summer": [
        ["Dusty Rose", "#C58B91"],
        ["Muted Mauve", "#A98591"],
        ["Dusty Blue", "#849DB5"],
        ["Soft Lavender", "#A99BBE"],
        ["Muted Plum", "#806276"],
        ["Sage", "#9EAD9A"],
        ["Soft Teal", "#729D9A"],
        ["Rose Beige", "#C5A59D"],
        ["Mushroom", "#9A8D87"],
        ["Muted Berry", "#986B79"],
        ["Smoky Blue", "#70879B"],
        ["Soft Navy", "#5B6C7D"],
        ["Cool Taupe", "#8F8580"],
        ["Dusty Pink", "#C19AA0"],
        ["Muted Lilac", "#A89AB3"],
        ["Soft White", "#ECEAE5"],
        ["Gray Green", "#87968A"],
        ["Muted Rose", "#AD777E"],
        ["Soft Plum", "#80627A"],
        ["Stone", "#9C958D"]
    ],

    "Cool Summer": [
        ["Cool Rose", "#C46F82"],
        ["Blue Pink", "#B96F8A"],
        ["Cool Blue", "#5579A8"],
        ["Periwinkle", "#8296CC"],
        ["Cool Purple", "#81659B"],
        ["Berry", "#A44E70"],
        ["Plum", "#70466E"],
        ["Cool Teal", "#438A91"],
        ["Navy", "#465B7A"],
        ["Mauve", "#9A6D87"],
        ["Cool Gray", "#8B929C"],
        ["Blue Gray", "#70869D"],
        ["Cool White", "#F4F5F4"],
        ["Rose Taupe", "#9C797A"],
        ["Lavender", "#A995C2"],
        ["Cool Red", "#B64E62"],
        ["Deep Rose", "#9A5264"],
        ["Steel Blue", "#55738D"],
        ["Cool Cocoa", "#765F5F"],
        ["Soft Silver", "#B9BEC4"]
    ],

    "Soft Autumn": [
        ["Muted Peach", "#D99A7A"],
        ["Terracotta", "#B86F52"],
        ["Warm Beige", "#C9AA83"],
        ["Olive", "#8C8F52"],
        ["Sage", "#9BA37B"],
        ["Muted Teal", "#5F8D88"],
        ["Warm Taupe", "#927A68"],
        ["Camel", "#B98B5E"],
        ["Dusty Coral", "#C87E6D"],
        ["Moss", "#747B4C"],
        ["Muted Mustard", "#C29A45"],
        ["Warm Rose", "#B97973"],
        ["Cinnamon", "#A86445"],
        ["Cream", "#F2E4C9"],
        ["Muted Gold", "#B89A54"],
        ["Warm Gray", "#8D8176"],
        ["Dusty Aqua", "#75A29B"],
        ["Soft Brown", "#87654D"],
        ["Muted Plum", "#80616A"],
        ["Warm Stone", "#A49783"]
    ],

    "True Autumn": [
        ["Rust", "#B7410E"],
        ["Burnt Orange", "#CC5500"],
        ["Mustard", "#D4A017"],
        ["Olive", "#808000"],
        ["Forest Green", "#4F6F32"],
        ["Warm Teal", "#2F8B83"],
        ["Camel", "#C19A6B"],
        ["Chocolate", "#7B4B2A"],
        ["Terracotta", "#C76D4F"],
        ["Pumpkin", "#E36C2F"],
        ["Warm Red", "#B94735"],
        ["Moss", "#71833A"],
        ["Golden Brown", "#A56A2A"],
        ["Cream", "#F4E4C1"],
        ["Copper", "#B87333"],
        ["Warm Plum", "#7E4A50"],
        ["Olive Brown", "#75623B"],
        ["Deep Beige", "#B0926B"],
        ["Warm Navy", "#405A64"],
        ["Spice", "#A65F3C"]
    ],

    "Deep Autumn": [
        ["Deep Rust", "#8E3B20"],
        ["Burnt Orange", "#A94F20"],
        ["Deep Mustard", "#A77A17"],
        ["Forest", "#345C3B"],
        ["Deep Olive", "#59632F"],
        ["Dark Teal", "#2E6664"],
        ["Chocolate", "#5A3825"],
        ["Espresso", "#4A3027"],
        ["Deep Terracotta", "#91462F"],
        ["Burgundy", "#6F3035"],
        ["Warm Plum", "#633A4A"],
        ["Deep Camel", "#966B3E"],
        ["Antique Gold", "#A77A28"],
        ["Warm Cream", "#E8D7B5"],
        ["Dark Moss", "#4D5B2D"],
        ["Copper", "#9A552D"],
        ["Deep Brown", "#593A2E"],
        ["Warm Navy", "#344C55"],
        ["Deep Coral", "#9E493E"],
        ["Olive Brown", "#61533A"]
    ],

    "Warm Autumn": [
        ["Warm Rust", "#A8462A"],
        ["Pumpkin", "#D66A2C"],
        ["Mustard", "#C49620"],
        ["Olive", "#747C32"],
        ["Moss", "#66703A"],
        ["Warm Teal", "#397D78"],
        ["Camel", "#B9854E"],
        ["Cognac", "#9A5B35"],
        ["Terracotta", "#B65D43"],
        ["Copper", "#B66A3C"],
        ["Warm Coral", "#C96758"],
        ["Golden Brown", "#9A692F"],
        ["Cream", "#F1E0BD"],
        ["Warm Beige", "#C4A273"],
        ["Spice", "#A95C36"],
        ["Warm Plum", "#77454A"],
        ["Forest", "#45603B"],
        ["Deep Gold", "#A98224"],
        ["Warm Navy", "#40575B"],
        ["Chocolate", "#70452D"]
    ],

    "Bright Winter": [
        ["Hot Pink", "#FF1493"],
        ["Fuchsia", "#FF00A8"],
        ["True Red", "#E60026"],
        ["Electric Blue", "#0066FF"],
        ["Cobalt", "#0047AB"],
        ["Emerald", "#00A86B"],
        ["Bright Turquoise", "#00C8C8"],
        ["Royal Purple", "#6A0DAD"],
        ["Magenta", "#D100D1"],
        ["Icy Pink", "#FFD6E7"],
        ["Pure White", "#FFFFFF"],
        ["Black", "#000000"],
        ["Cool Red", "#D90429"],
        ["Bright Violet", "#7F00FF"],
        ["Sapphire", "#0F52BA"],
        ["Bright Green", "#00B050"],
        ["Raspberry", "#C2185B"],
        ["Icy Blue", "#BDE0FE"],
        ["Cool Yellow", "#F1F20A"],
        ["Deep Navy", "#102A43"]
    ],

    "True Winter": [
        ["True Red", "#D90429"],
        ["Cranberry", "#9E2146"],
        ["Royal Blue", "#4169E1"],
        ["Navy", "#000080"],
        ["Emerald", "#009B77"],
        ["Cool Green", "#008F68"],
        ["Fuchsia", "#D100D1"],
        ["Plum", "#6C2E7C"],
        ["Cool Purple", "#6A4C93"],
        ["Icy Pink", "#F8C8DC"],
        ["Icy Blue", "#BDE0FE"],
        ["Pure White", "#FFFFFF"],
        ["Charcoal", "#36454F"],
        ["Black", "#000000"],
        ["Cool Gray", "#7A8490"],
        ["Berry", "#A61B46"],
        ["Sapphire", "#2554C7"],
        ["Cool Teal", "#008C95"],
        ["Silver", "#C0C0C0"],
        ["Deep Rose", "#8E354A"]
    ],

    "Deep Winter": [
        ["Deep Burgundy", "#641C34"],
        ["Wine", "#722F37"],
        ["Deep Red", "#8B1E3F"],
        ["Midnight Navy", "#191970"],
        ["Deep Cobalt", "#243B7A"],
        ["Deep Emerald", "#145A45"],
        ["Deep Teal", "#164E63"],
        ["Eggplant", "#483248"],
        ["Deep Plum", "#512A44"],
        ["Black", "#000000"],
        ["Charcoal", "#2F343B"],
        ["Cool White", "#F4F4F4"],
        ["Icy Pink", "#E9B7C4"],
        ["Icy Blue", "#A9C7E8"],
        ["Deep Berry", "#702963"],
        ["Sapphire", "#1E4D8F"],
        ["Pine", "#234F3D"],
        ["Cool Gray", "#646B73"],
        ["Deep Rose", "#743344"],
        ["Silver", "#AEB4BA"]
    ],

    "Cool Winter": [
        ["Cool Red", "#C8102E"],
        ["Berry", "#9B2242"],
        ["Fuchsia", "#C000A0"],
        ["Royal Blue", "#4169E1"],
        ["Cobalt", "#0047AB"],
        ["Emerald", "#008F68"],
        ["Cool Teal", "#007F86"],
        ["Purple", "#6A0DAD"],
        ["Plum", "#673A7A"],
        ["Icy Pink", "#F4C2D7"],
        ["Icy Blue", "#B8D8F0"],
        ["Cool White", "#F7F7F7"],
        ["Black", "#000000"],
        ["Charcoal", "#3B414A"],
        ["Cool Gray", "#7D858E"],
        ["Raspberry", "#B03060"],
        ["Sapphire", "#2456A6"],
        ["Deep Teal", "#155E63"],
        ["Cool Violet", "#7251A5"],
        ["Silver", "#C4C8CC"]
    ]
};


// ============================================================
// SEASON INFORMATION
// ============================================================

const SEASON_INFO = {

    "Bright Spring": {
        direction: "Warm",
        depth: "Light–Medium",
        quality: "Bright",
        harmony: "Warm, clear and lively colours with noticeable brightness.",
        style: "Fresh Korean-inspired styling, luminous neutrals, clear warm accents and clean silhouettes.",
        suitable: "Coral, peach, warm ivory, golden yellow, fresh mint, turquoise, warm aqua and clear warm pinks.",
        unsuitable: "Very dusty colours, heavy cool greys, extremely muted tones and overly blue-based shades."
    },

    "Light Spring": {
        direction: "Warm",
        depth: "Light",
        quality: "Light",
        harmony: "Light, warm and fresh colours create the most balanced harmony.",
        style: "Airy, soft and youthful styling with delicate warm pastels.",
        suitable: "Peach, butter yellow, warm ivory, apricot, mint, aqua and light coral.",
        unsuitable: "Very dark colours, harsh black, extremely cool jewel tones and heavy muted shades."
    },

    "True Spring": {
        direction: "Warm",
        depth: "Medium",
        quality: "Clear",
        harmony: "Warm, clear and energetic colour combinations.",
        style: "Clean, cheerful and polished styling with warm colour accents.",
        suitable: "Coral, warm red, golden yellow, turquoise, peach, leaf green and camel.",
        unsuitable: "Dusty cool colours, icy pastels and very dark winter shades."
    },

    "Warm Spring": {
        direction: "Warm",
        depth: "Medium",
        quality: "Warm",
        harmony: "Warmth is the dominant feature, supported by moderate clarity.",
        style: "Warm Korean neutrals, golden accessories and softly defined colour combinations.",
        suitable: "Warm coral, peach, golden yellow, terracotta, olive, camel and warm aqua.",
        unsuitable: "Icy blue, blue-based pink, stark white and extremely cool jewel tones."
    },

    "Light Summer": {
        direction: "Cool",
        depth: "Light",
        quality: "Light",
        harmony: "Light, cool and delicate colours create visual harmony.",
        style: "Soft, elegant and airy styling with cool pastels and delicate neutrals.",
        suitable: "Powder blue, lavender, soft rose, periwinkle, mint and cool ivory.",
        unsuitable: "Strong orange, intense mustard, heavy black and highly warm earthy colours."
    },

    "True Summer": {
        direction: "Cool",
        depth: "Medium",
        quality: "Cool",
        harmony: "Balanced cool colours with moderate contrast.",
        style: "Elegant, refined styling with rose, blue, lavender and cool neutrals.",
        suitable: "Rose, cool pink, periwinkle, blue, lavender, mauve and soft navy.",
        unsuitable: "Orange, mustard, strong camel, warm rust and yellow-based browns."
    },

    "Soft Summer": {
        direction: "Cool",
        depth: "Medium",
        quality: "Soft",
        harmony: "Muted, cool and blended colours create the most natural harmony.",
        style: "Minimal Korean styling, muted palettes, soft contrast and understated elegance.",
        suitable: "Dusty rose, muted mauve, dusty blue, sage, soft teal and mushroom.",
        unsuitable: "Neon shades, extremely bright colours, stark black and intense orange."
    },

    "Cool Summer": {
        direction: "Cool",
        depth: "Medium",
        quality: "Cool",
        harmony: "Cool, refined and moderately vivid colours.",
        style: "Polished cool-toned styling with berry, blue and refined neutrals.",
        suitable: "Cool rose, blue pink, cobalt, periwinkle, berry, plum and cool teal.",
        unsuitable: "Warm orange, pumpkin, mustard and yellow-heavy beige."
    },

    "Soft Autumn": {
        direction: "Warm",
        depth: "Medium",
        quality: "Soft",
        harmony: "Warm, muted and softly blended colours.",
        style: "Relaxed Korean-inspired neutrals, earthy softness and low-contrast combinations.",
        suitable: "Muted peach, terracotta, warm beige, olive, sage, muted teal and camel.",
        unsuitable: "Neon colours, icy pastels, stark black and highly saturated jewel tones."
    },

    "True Autumn": {
        direction: "Warm",
        depth: "Medium–Deep",
        quality: "Warm",
        harmony: "Rich warmth and natural earthiness define the palette.",
        style: "Rich earthy styling with warm metals, textured neutrals and grounded colour.",
        suitable: "Rust, burnt orange, mustard, olive, forest green, camel, chocolate and terracotta.",
        unsuitable: "Icy pastels, blue-based pinks, stark white and cool jewel colours."
    },

    "Deep Autumn": {
        direction: "Warm",
        depth: "Deep",
        quality: "Rich",
        harmony: "Deep, warm and substantial colours provide the strongest balance.",
        style: "Elegant deep neutrals, warm dark colours and sophisticated contrast.",
        suitable: "Deep rust, forest, chocolate, burgundy, deep olive, dark teal and antique gold.",
        unsuitable: "Very pale pastels, icy colours and extremely cool blue-pinks."
    },

    "Warm Autumn": {
        direction: "Warm",
        depth: "Medium–Deep",
        quality: "Warm",
        harmony: "Strong warmth with earthy richness.",
        style: "Warm, polished styling with camel, rust, olive and golden accents.",
        suitable: "Rust, pumpkin, mustard, olive, camel, cognac, copper and warm teal.",
        unsuitable: "Icy blue, cool lavender, bright fuchsia and blue-based grey."
    },

    "Bright Winter": {
        direction: "Cool",
        depth: "Medium–Deep",
        quality: "Bright",
        harmony: "Clear, vivid and cool colours create the strongest visual balance.",
        style: "Crisp Korean styling, clean contrast, jewel tones and sharp neutrals.",
        suitable: "Fuchsia, electric blue, cobalt, emerald, bright turquoise, royal purple and pure white.",
        unsuitable: "Dusty beige, muted earth tones, warm orange and overly soft colours."
    },

    "True Winter": {
        direction: "Cool",
        depth: "Medium–Deep",
        quality: "Clear",
        harmony: "Cool, clear colours with defined contrast.",
        style: "Crisp and sophisticated styling with cool jewel colours and strong neutrals.",
        suitable: "True red, royal blue, emerald, fuchsia, navy, plum and pure white.",
        unsuitable: "Orange, camel, mustard, warm beige and dusty earth tones."
    },

    "Deep Winter": {
        direction: "Cool",
        depth: "Deep",
        quality: "Deep",
        harmony: "Deep cool colours and strong contrast create the most balanced appearance.",
        style: "Elegant dramatic styling with deep neutrals, jewel tones and cool metallics.",
        suitable: "Deep burgundy, midnight navy, deep emerald, plum, black and sapphire.",
        unsuitable: "Very pale warm pastels, orange, mustard and light earthy colours."
    },

    "Cool Winter": {
        direction: "Cool",
        depth: "Medium–Deep",
        quality: "Cool",
        harmony: "Cool, crisp and sophisticated colours.",
        style: "Modern Korean styling with cool jewel colours and refined neutrals.",
        suitable: "Cool red, berry, fuchsia, royal blue, cobalt, emerald, purple and icy pink.",
        unsuitable: "Warm orange, pumpkin, camel, mustard and yellow-heavy browns."
    }
};


// ============================================================
// IMAGE ANALYSIS
// ============================================================

function loadImage(file) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () =>
            reject(new Error("The image could not be loaded."));

        img.src = URL.createObjectURL(file);

    });

}


// ------------------------------------------------------------
// RGB → HSL
// ------------------------------------------------------------

function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;

    const l = (max + min) / 2;

    if (max !== min) {

        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {

            case r:
                h = (g - b) / d +
                    (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };

}


// ------------------------------------------------------------
// Skin candidate detection
// ------------------------------------------------------------

function isSkinPixel(r, g, b) {

    const hsl = rgbToHsl(r, g, b);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const spread = max - min;

    // Avoid very dark / very bright background pixels
    if (r < 35 || g < 25 || b < 20) {
        return false;
    }

    if (r > 250 && g > 250 && b > 250) {
        return false;
    }

    // Broad skin range.
    // Designed to include a wide range of natural skin tones.
    const warmSkin =
        r >= g &&
        g >= b - 8 &&
        r - b >= 8;

    const neutralSkin =
        r >= b &&
        g >= b &&
        r - b >= 5;

    const hueSkin =
        hsl.h <= 55 ||
        hsl.h >= 345;

    const reasonableSaturation =
        hsl.s >= 8 &&
        hsl.s <= 85;

    const reasonableLightness =
        hsl.l >= 12 &&
        hsl.l <= 88;

    return (
        (warmSkin || neutralSkin) &&
        hueSkin &&
        reasonableSaturation &&
        reasonableLightness &&
        spread >= 5
    );

}


// ------------------------------------------------------------
// Get candidate pixels
// ------------------------------------------------------------

function getSkinPixels(image) {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    const maxSize = 900;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    const scale =
        Math.min(1, maxSize / Math.max(width, height));

    width = Math.round(width * scale);
    height = Math.round(height * scale);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    const data =
        ctx.getImageData(
            0,
            0,
            width,
            height
        ).data;


    const pixels = [];

    // Central facial area.
    // We intentionally avoid the extreme edges/background.
    const regions = [

        {
            x1: 0.30,
            y1: 0.20,
            x2: 0.70,
            y2: 0.78
        },

        {
            x1: 0.20,
            y1: 0.28,
            x2: 0.80,
            y2: 0.72
        }

    ];


    for (
        let regionIndex = 0;
        regionIndex < regions.length;
        regionIndex++
    ) {

        const region =
            regions[regionIndex];

        const startX =
            Math.floor(width * region.x1);

        const endX =
            Math.floor(width * region.x2);

        const startY =
            Math.floor(height * region.y1);

        const endY =
            Math.floor(height * region.y2);


        for (
            let y = startY;
            y < endY;
            y += 4
        ) {

            for (
                let x = startX;
                x < endX;
                x += 4
            ) {

                const index =
                    (y * width + x) * 4;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                if (a < 180) {
                    continue;
                }

                if (
                    isSkinPixel(
                        r,
                        g,
                        b
                    )
                ) {

                    pixels.push({
                        r,
                        g,
                        b
                    });

                }

            }

        }

    }


    return pixels;

}


// ============================================================
// STATISTICS
// ============================================================

function median(values) {

    if (!values.length) {
        return 0;
    }

    const sorted =
        [...values].sort(
            (a, b) => a - b
        );

    const middle =
        Math.floor(sorted.length / 2);

    if (sorted.length % 2) {
        return sorted[middle];
    }

    return (
        sorted[middle - 1] +
        sorted[middle]
    ) / 2;

}


function trimmedMean(values, trim = 0.10) {

    if (!values.length) {
        return 0;
    }

    const sorted =
        [...values].sort(
            (a, b) => a - b
        );

    const cut =
        Math.floor(
            sorted.length * trim
        );

    const trimmed =
        sorted.slice(
            cut,
            sorted.length - cut
        );

    if (!trimmed.length) {
        return median(values);
    }

    return (
        trimmed.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / trimmed.length
    );

}


// ============================================================
// SKIN METRICS
// ============================================================

function calculateMetrics(pixels) {

    if (!pixels.length) {

        throw new Error(
            "Not enough visible skin was detected. Please use a clear front-facing photograph."
        );

    }


    const rValues =
        pixels.map(p => p.r);

    const gValues =
        pixels.map(p => p.g);

    const bValues =
        pixels.map(p => p.b);


    const r =
        trimmedMean(rValues);

    const g =
        trimmedMean(gValues);

    const b =
        trimmedMean(bValues);


    const hslValues =
        pixels.map(
            p =>
                rgbToHsl(
                    p.r,
                    p.g,
                    p.b
                )
        );


    const lightness =
        median(
            hslValues.map(
                x => x.l
            )
        );


    const saturation =
        median(
            hslValues.map(
                x => x.s
            )
        );


    const warmth =
        ((r - b) * 0.75) +
        ((g - b) * 0.25);


    const redGreenDifference =
        r - g;


    const chroma =
        saturation;


    return {
        r,
        g,
        b,
        warmth,
        lightness,
        saturation,
        chroma,
        redGreenDifference,
        sampleCount: pixels.length
    };

}


// ============================================================
// UNDERTONE
// ============================================================

function determineUndertone(metrics) {

    if (metrics.warmth >= 15) {
        return "Warm";
    }

    if (metrics.warmth <= 5) {
        return "Cool";
    }

    return "Neutral";

}


// ============================================================
// DEPTH
// ============================================================

function determineDepth(metrics) {

    if (metrics.lightness >= 68) {
        return "Light";
    }

    if (metrics.lightness <= 38) {
        return "Deep";
    }

    return "Medium";

}


// ============================================================
// COLOUR QUALITY
// ============================================================

function determineQuality(metrics) {

    if (metrics.chroma >= 42) {
        return "Bright";
    }

    if (metrics.chroma <= 22) {
        return "Soft";
    }

    return "Balanced";

}


// ============================================================
// SEASON ENGINE
// ============================================================

function determineSeason(
    undertone,
    depth,
    quality,
    metrics
) {

    const warm =
        metrics.warmth;

    const light =
        metrics.lightness;

    const chroma =
        metrics.chroma;


    // --------------------------------------------------------
    // WARM FAMILY
    // --------------------------------------------------------

    if (undertone === "Warm") {

        // Bright Spring
        if (
            chroma >= 42 &&
            light >= 58
        ) {
            return "Bright Spring";
        }


        // Light Spring
        if (
            light >= 68 &&
            chroma < 42
        ) {
            return "Light Spring";
        }


        // Deep Autumn
        if (
            light <= 42 &&
            warm >= 22
        ) {
            return "Deep Autumn";
        }


        // Soft Autumn
        if (
            chroma <= 22 &&
            light < 68
        ) {
            return "Soft Autumn";
        }


        // Warm Autumn
        if (
            light < 58 &&
            warm >= 25
        ) {
            return "Warm Autumn";
        }


        // True Autumn
        if (
            light < 62
        ) {
            return "True Autumn";
        }


        // True Spring
        if (
            chroma >= 28
        ) {
            return "True Spring";
        }


        return "Warm Spring";
    }


    // --------------------------------------------------------
    // COOL FAMILY
    // --------------------------------------------------------

    if (undertone === "Cool") {

        // Bright Winter
        if (
            chroma >= 42 &&
            light < 70
        ) {
            return "Bright Winter";
        }


        // Deep Winter
        if (
            light <= 38
        ) {
            return "Deep Winter";
        }


        // Light Summer
        if (
            light >= 68 &&
            chroma <= 35
        ) {
            return "Light Summer";
        }


        // Soft Summer
        if (
            chroma <= 22
        ) {
            return "Soft Summer";
        }


        // Cool Winter
        if (
            chroma >= 34 &&
            light < 58
        ) {
            return "Cool Winter";
        }


        // True Winter
        if (
            chroma >= 30 &&
            light < 55
        ) {
            return "True Winter";
        }


        // True Summer
        if (
            light < 68
        ) {
            return "True Summer";
        }


        return "Cool Summer";
    }


    // --------------------------------------------------------
    // NEUTRAL
    // --------------------------------------------------------

    if (light >= 68) {

        if (chroma <= 28) {
            return "Light Summer";
        }

        return "Light Spring";
    }


    if (light <= 38) {

        if (warm >= 0) {
            return "Deep Autumn";
        }

        return "Deep Winter";
    }


    if (chroma <= 22) {

        if (warm >= 0) {
            return "Soft Autumn";
        }

        return "Soft Summer";
    }


    if (warm >= 0) {

        if (chroma >= 42) {
            return "Bright Spring";
        }

        return "True Spring";
    }


    if (chroma >= 42) {
        return "Bright Winter";
    }

    return "True Summer";

}


// ============================================================
// FULL ANALYSIS
// ============================================================

async function analyseImage(file) {

    const image =
        await loadImage(file);

    const pixels =
        getSkinPixels(image);


    // Require enough usable pixels
    if (pixels.length < 150) {

        throw new Error(
            "Not enough clear facial skin was detected. Please upload a front-facing photo taken in natural light."
        );

    }


    const metrics =
        calculateMetrics(pixels);


    const undertone =
        determineUndertone(metrics);


    const depth =
        determineDepth(metrics);


    const quality =
        determineQuality(metrics);


    const season =
        determineSeason(
            undertone,
            depth,
            quality,
            metrics
        );


    const info =
        SEASON_INFO[season];


    return {

        season,

        undertone,

        depth,

        chroma: quality,

        palette:
            SEASON_PALETTES[season],

        suitable:
            info.suitable,

        unsuitable:
            info.unsuitable,

        style:
            info.style,

        harmony:
            info.harmony,

        metrics

    };

}


// ============================================================
// ANALYZE BUTTON
// ============================================================

analyzeBtn.addEventListener(
    "click",
    async () => {

        if (
            !imageInput.files ||
            imageInput.files.length === 0
        ) {

            loadingText.textContent =
                "Please upload a clear front-facing photograph.";

            return;

        }


        const imageFile =
            imageInput.files[0];


        if (
            !imageFile.type.startsWith("image/")
        ) {

            loadingText.textContent =
                "Please select a valid image file.";

            return;

        }


        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "Analysing...";

        loadingText.textContent =
            "Please wait while Haneul Palette analyses your colours...";

        resultWrapper.style.display =
            "none";


        try {

            const result =
                await analyseImage(
                    imageFile
                );


            displayAnalysisResults(
                result
            );


            loadingText.textContent =
                "Your Haneul Palette analysis is ready.";


        } catch (error) {

            console.error(
                "Haneul Palette analysis error:",
                error
            );


            loadingText.textContent =
                error.message ||
                "Something went wrong while analysing the image. Please try again.";

        } finally {

            analyzeBtn.disabled =
                false;

            analyzeBtn.textContent =
                "Start Analysis";

        }

    }
);


// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayAnalysisResults(data) {

    resultWrapper.style.display =
        "block";


    // --------------------------------------------------------
    // Season
    // --------------------------------------------------------

    seasonResult.innerHTML = `
        <h3>Your Colour Season</h3>
        <p>${escapeHTML(data.season)}</p>
    `;


    // --------------------------------------------------------
    // Undertone
    // --------------------------------------------------------

    directionResult.innerHTML = `
        <h3>Undertone</h3>
        <p>${escapeHTML(data.undertone)}</p>
    `;


    // --------------------------------------------------------
    // Depth
    // --------------------------------------------------------

    depthResult.innerHTML = `
        <h3>Depth</h3>
        <p>${escapeHTML(data.depth)}</p>
    `;


    // --------------------------------------------------------
    // Quality
    // --------------------------------------------------------

    qualityResult.innerHTML = `
        <h3>Colour Quality</h3>
        <p>${escapeHTML(data.chroma)}</p>
    `;


    // --------------------------------------------------------
    // Palette
    // --------------------------------------------------------

    let paletteHTML = `
        <h3>Your Personal Palette</h3>
        <div class="palette-grid">
    `;


    data.palette.forEach(
        colour => {

            paletteHTML += `
                <div class="palette-item">

                    <div
                        class="palette-swatch"
                        style="background:${escapeAttribute(colour[1])};"
                    ></div>

                    <span>
                        ${escapeHTML(colour[0])}
                    </span>

                </div>
            `;

        }
    );


    paletteHTML += `
        </div>
    `;


    paletteResult.innerHTML =
        paletteHTML;


    // --------------------------------------------------------
    // Suitable
    // --------------------------------------------------------

    suitableResult.innerHTML = `
        <h3>Colours That Suit You</h3>
        <p>${escapeHTML(data.suitable)}</p>
    `;


    // --------------------------------------------------------
    // Unsuitable
    // --------------------------------------------------------

    unsuitableResult.innerHTML = `
        <h3>Colours to Approach Carefully</h3>
        <p>${escapeHTML(data.unsuitable)}</p>
    `;


    // --------------------------------------------------------
    // Style
    // --------------------------------------------------------

    styleResult.innerHTML = `
        <h3>Styling Direction</h3>
        <p>${escapeHTML(data.style)}</p>
    `;


    // --------------------------------------------------------
    // Harmony
    // --------------------------------------------------------

    harmonyResult.innerHTML = `
        <h3>Your Colour Harmony</h3>
        <p>${escapeHTML(data.harmony)}</p>
    `;


    // --------------------------------------------------------
    // PDF
    // --------------------------------------------------------

    pdfBtn.style.display =
        "block";


    pdfBtn.onclick = () => {

        generatePDF(data);

    };

}


// ============================================================
// PDF GENERATION
// ============================================================

async function loadScript(src) {

    return new Promise(
        (resolve, reject) => {

            if (
                document.querySelector(
                    `script[src="${src}"]`
                )
            ) {

                resolve();
                return;

            }


            const script =
                document.createElement(
                    "script"
                );

            script.src = src;

            script.onload =
                resolve;

            script.onerror =
                reject;

            document.head.appendChild(
                script
            );

        }
    );

}


async function generatePDF(data) {

    try {

        pdfBtn.disabled =
            true;

        pdfStatus.textContent =
            "Preparing your personalized PDF...";


        await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        );

        await loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        );


        const pdf =
            new window.jspdf.jsPDF(
                "p",
                "mm",
                "a4"
            );


        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();


        // ----------------------------------------------------
        // Create temporary PDF content
        // ----------------------------------------------------

        const container =
            document.createElement(
                "div"
            );


        container.style.position =
            "fixed";

        container.style.left =
            "-10000px";

        container.style.top =
            "0";

        container.style.width =
            "794px";

        container.style.padding =
            "50px";

        container.style.boxSizing =
            "border-box";

        container.style.background =
            "linear-gradient(135deg,#fff4f8,#f8f1ff,#eef8ff)";

        container.style.fontFamily =
            "Arial, sans-serif";

        container.style.color =
            "#3d3542";


        container.innerHTML = `

            <div style="
                text-align:center;
                margin-bottom:30px;
            ">

                <img
                    src="assets/logo.png"
                    style="
                        width:90px;
                        height:90px;
                        object-fit:contain;
                    "
                >

                <h1 style="
                    margin:12px 0 4px;
                    font-size:28px;
                ">
                    HANEUL PALETTE
                </h1>

                <p style="
                    margin:0;
                    font-size:16px;
                ">
                    Advanced Korean Color Analysis
                </p>

            </div>


            <div style="
                background:rgba(255,255,255,.75);
                border-radius:18px;
                padding:25px;
            ">

                <h2>Your Colour Season</h2>

                <h1 style="
                    font-size:30px;
                    margin-top:5px;
                ">
                    ${escapeHTML(data.season)}
                </h1>


                <h3>Undertone</h3>
                <p>${escapeHTML(data.undertone)}</p>


                <h3>Depth</h3>
                <p>${escapeHTML(data.depth)}</p>


                <h3>Colour Quality</h3>
                <p>${escapeHTML(data.chroma)}</p>


                <h2>Your Personal Palette</h2>

                <div style="
                    display:grid;
                    grid-template-columns:
                    repeat(4,1fr);
                    gap:12px;
                ">

                    ${data.palette.map(
                        colour => `
                            <div style="
                                text-align:center;
                                font-size:11px;
                            ">

                                <div style="
                                    height:45px;
                                    background:${escapeAttribute(colour[1])};
                                    border-radius:7px;
                                    margin-bottom:5px;
                                "></div>

                                ${escapeHTML(colour[0])}

                            </div>
                        `
                    ).join("")}

                </div>


                <h2>Colours That Suit You</h2>

                <p>
                    ${escapeHTML(data.suitable)}
                </p>


                <h2>Colours to Approach Carefully</h2>

                <p>
                    ${escapeHTML(data.unsuitable)}
                </p>


                <h2>Styling Direction</h2>

                <p>
                    ${escapeHTML(data.style)}
                </p>


                <h2>Colour Harmony</h2>

                <p>
                    ${escapeHTML(data.harmony)}
                </p>

            </div>


            <p style="
                text-align:center;
                margin-top:25px;
                font-size:11px;
            ">
                Haneul Palette © Advanced Korean Color Analysis
            </p>

        `;


        document.body.appendChild(
            container
        );


        const canvas =
            await html2canvas(
                container,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false
                }
            );


        document.body.removeChild(
            container
        );


        const imageData =
            canvas.toDataURL(
                "image/png"
            );


        const imageRatio =
            canvas.width /
            canvas.height;


        const pdfWidth =
            pageWidth - 20;

        const pdfHeight =
            pdfWidth / imageRatio;


        let remainingHeight =
            pdfHeight;

        let position = 10;


        pdf.addImage(
            imageData,
            "PNG",
            10,
            position,
            pdfWidth,
            pdfHeight,
            undefined,
            "FAST"
        );


        remainingHeight -=
            pageHeight - 20;


        while (
            remainingHeight > 0
        ) {

            position =
                remainingHeight -
                pdfHeight +
                10;

            pdf.addPage();

            pdf.addImage(
                imageData,
                "PNG",
                10,
                position,
                pdfWidth,
                pdfHeight,
                undefined,
                "FAST"
            );

            remainingHeight -=
                pageHeight - 20;

        }


        pdf.save(
            "Haneul-Palette-Advanced-Color-Analysis.pdf"
        );


        pdfStatus.textContent =
            "Your personalized PDF is ready.";

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );


        pdfStatus.textContent =
            "The PDF could not be generated. Please try again.";

    } finally {

        pdfBtn.disabled =
            false;

    }

}


// ============================================================
// SECURITY HELPERS
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(value)
        .replace(
            /"/g,
            ""
        )
        .replace(
            /'/g,
            ""
        );

}
