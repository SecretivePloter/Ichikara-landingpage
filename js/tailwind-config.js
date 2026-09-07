// =============================================================================
// PT. Ichikara — Tailwind CSS Configuration
// =============================================================================
// This file is loaded ONCE by all pages, immediately after the Tailwind CDN
// script. Do NOT use async or defer on this script tag.
//
// DESIGN DIRECTION: "Japanese Premium Minimal" (Ma / 間 — the beauty of empty space)
//   - Warm, near-black ink instead of corporate navy
//   - Vivid red + saturated gold accents
//   - Warm white / cream backgrounds
//   - Generous whitespace, larger radii, thin decorative lines
//
// HOW TO EDIT:
//   - Change brand colors under the "colors" section
//   - Add new spacing tokens under "spacing"
//   - Font families are set under "fontFamily"
//   All changes apply site-wide automatically.
// =============================================================================

tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {

            // -----------------------------------------------------------------
            // Colors — Japanese Premium Minimal palette
            // Primary   = Ink / near-black (#0a0a0a)
            // Secondary = Vivid red        (#c0392b)
            // Tertiary  = Saturated gold   (#b8960c)
            // Accent    = Warm cream       (#e8e0d4)
            // -----------------------------------------------------------------
            colors: {
                // --- Primary (Ink / near-black) ---
                "primary":                   "#0a0a0a",
                "primary-container":         "#2a2a2a", // slightly lighter ink for dark-button hover
                "primary-fixed":             "#e8e0d4",
                "primary-fixed-dim":         "#d8cfc0",
                "on-primary":                "#ffffff",
                "on-primary-fixed":          "#0a0a0a",
                "on-primary-fixed-variant":  "#4a4640",
                "on-primary-container":      "#b8b2a8",
                "inverse-primary":           "#d8cfc0",

                // --- Secondary (Vivid Red) ---
                "secondary":                 "#c0392b",
                "secondary-container":       "#e0584a",
                "secondary-fixed":           "#ffdad5",
                "secondary-fixed-dim":       "#ffb4a9",
                "on-secondary":              "#ffffff",
                "on-secondary-fixed":        "#410000",
                "on-secondary-fixed-variant":"#8e130c",
                "on-secondary-container":    "#650001",
                "red-hover":                 "#9c2c20", // darker red for hover states

                // --- Tertiary (Gold) ---
                "tertiary":                  "#b8960c",
                "tertiary-container":        "#d4b24c", // gold accent on dark backgrounds
                "tertiary-fixed":            "#ffdf91",
                "tertiary-fixed-dim":        "#e7c361",
                "on-tertiary":               "#ffffff",
                "on-tertiary-fixed":         "#241a00",
                "on-tertiary-fixed-variant": "#594400",
                "on-tertiary-container":     "#3d2f00",

                // --- Surfaces & Backgrounds (warm white / cream) ---
                "background":                "#fdfcfa",
                "surface":                   "#fdfcfa",
                "surface-bright":            "#ffffff",
                "surface-dim":               "#efe9e1",
                "surface-variant":           "#f0ebe4",
                "surface-container-lowest":  "#ffffff",
                "surface-container-low":     "#faf7f2",
                "surface-container":         "#f4efe8",
                "surface-container-high":    "#ece6dd",
                "surface-container-highest": "#e2dcd2", // light cream — used as text/detail on dark heroes
                "inverse-surface":           "#2a2a2a",
                "inverse-on-surface":        "#f5f2ec",
                "surface-tint":              "#8a857d",

                // --- On-surface (ink text) ---
                "on-surface":                "#1a1a1a",
                "on-surface-variant":        "#6b6660", // muted warm gray
                "on-background":             "#1a1a1a",

                // --- Outline / Border (thin warm lines) ---
                "outline":                   "#8a857d",
                "outline-variant":           "#a8a29a", // light enough to read on black footer

                // --- Error ---
                "error":                     "#ba1a1a",
                "error-container":           "#ffdad6",
                "on-error":                  "#ffffff",
                "on-error-container":        "#93000a",

                // --- Utility shortcuts ---
                "accent":                    "#e8e0d4", // warm cream accent
                "bg-gray":                   "#f7f4f0", // warm cream section background
                "border-light":              "#e8e1d6", // warm hairline border
                "text-dark":                 "#1a1a1a",
                "footer-dark":               "#0a0a0a",
            },

            // -----------------------------------------------------------------
            // Border Radius — softer, more generous
            // -----------------------------------------------------------------
            borderRadius: {
                DEFAULT: "0.5rem",  // 8px
                lg:      "0.75rem", // 12px
                xl:      "1rem",    // 16px
                "2xl":   "1.5rem",  // 24px
                full:    "9999px",  // pill / circle
            },

            // -----------------------------------------------------------------
            // Spacing tokens
            // Use these for padding/margin/gap: xs, sm, md, lg, xl, xxl
            // -----------------------------------------------------------------
            spacing: {
                xs:              "8px",
                sm:              "16px",
                md:              "24px",
                lg:              "48px",
                xl:              "100px",
                xxl:             "160px",
                base:            "8px",
                gutter:          "24px",
                "container-max": "1200px",
            },

            // -----------------------------------------------------------------
            // Letter spacing — wider tracking for premium labels
            // -----------------------------------------------------------------
            letterSpacing: {
                label: "0.15em",
            },

            // -----------------------------------------------------------------
            // Font Families
            // noto  = Noto Serif JP  (headings, brand name)
            // inter = Inter          (body text, UI)
            // -----------------------------------------------------------------
            fontFamily: {
                noto:  ["Noto Serif JP", "serif"],
                inter: ["Inter", "sans-serif"],

                // Semantic tokens (used in Tailwind class names like font-headline-h1)
                "headline-h1":        ["Noto Serif JP", "serif"],
                "headline-h2":        ["Noto Serif JP", "serif"],
                "headline-h3":        ["Noto Serif JP", "serif"],
                "headline-h1-mobile": ["Noto Serif JP", "serif"],
                "headline-h2-mobile": ["Noto Serif JP", "serif"],
                "headline-h3-mobile": ["Noto Serif JP", "serif"],
                "hero-lg":            ["Noto Serif JP", "serif"],
                "body-lg":            ["Inter", "sans-serif"],
                "body-sm":            ["Inter", "sans-serif"],
                "body-mobile":        ["Inter", "sans-serif"],
                "label-uppercase":    ["Inter", "sans-serif"],
            },

            // -----------------------------------------------------------------
            // Font Sizes (with line-height and font-weight baked in)
            // Headings larger & bolder; body bumped for readability.
            // -----------------------------------------------------------------
            fontSize: {
                "hero-lg":            ["72px", { lineHeight: "1.1", fontWeight: "700" }],
                "headline-h1":        ["56px", { lineHeight: "1.15", fontWeight: "700" }],
                "headline-h1-mobile": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
                "headline-h2":        ["40px", { lineHeight: "1.25", fontWeight: "700" }],
                "headline-h2-mobile": ["28px", { lineHeight: "1.3", fontWeight: "700" }],
                "headline-h3":        ["26px", { lineHeight: "1.4", fontWeight: "600" }],
                "headline-h3-mobile": ["21px", { lineHeight: "1.4", fontWeight: "600" }],
                "body-lg":            ["17px", { lineHeight: "1.75", fontWeight: "400" }],
                "body-mobile":        ["16px", { lineHeight: "1.7", fontWeight: "400" }],
                "body-sm":            ["14px", { lineHeight: "1.6", fontWeight: "400" }],
                "label-uppercase":    ["12px", { lineHeight: "1.0", letterSpacing: "0.15em", fontWeight: "600" }],
            },
        },
    },
};
