// Generated from tokens.json (design system "Teachers app design system" v2, package 2.1.1) by scripts/build.mjs. Do not edit.

// Colour from a CSS variable with opacity support (`bg-accent/50`). Without an opacity
// (Tailwind then passes undefined or `var(--tw-bg-opacity)`) the bare variable is kept.
const color = (name) => ({ opacityValue } = {}) =>
  opacityValue === undefined || String(opacityValue).startsWith('var(')
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) ${Number(opacityValue) * 100}%, transparent)`;

module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "surface": color("surface"),
        "raised": color("raised"),
        "neutral-soft": color("neutral-soft"),
        "text": color("text"),
        "text-muted": color("text-muted"),
        "border": color("border"),
        "border-strong": color("border-strong"),
        "accent": color("accent"),
        "accent-hover": color("accent-hover"),
        "on-accent": color("on-accent"),
        "accent-soft": color("accent-soft"),
        "success": color("success"),
        "success-soft": color("success-soft"),
        "warning": color("warning"),
        "warning-fill": color("warning-fill"),
        "warning-icon": color("warning-icon"),
        "on-warning": color("on-warning"),
        "warning-soft": color("warning-soft"),
        "info": color("info"),
        "info-soft": color("info-soft"),
        "danger": color("danger"),
        "danger-soft": color("danger-soft"),
        "on-danger": color("on-danger"),
        "focus": color("focus"),
        "brand": color("brand"),
        "on-brand": color("on-brand")
      },
      "borderColor": {
        "DEFAULT": "var(--border)"
      },
      "fontFamily": {
        "sans": "var(--font-sans)"
      },
      "fontSize": {
        "heading-1": [
          "24px",
          {
            "lineHeight": "30px",
            "fontWeight": "700"
          }
        ],
        "heading-2": [
          "20px",
          {
            "lineHeight": "26px",
            "fontWeight": "700"
          }
        ],
        "heading-3": [
          "18px",
          {
            "lineHeight": "24px",
            "fontWeight": "700"
          }
        ],
        "item": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "body": [
          "15px",
          {
            "lineHeight": "22px",
            "fontWeight": "400"
          }
        ],
        "label": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "600"
          }
        ],
        "caption": [
          "13px",
          {
            "lineHeight": "18px",
            "fontWeight": "400"
          }
        ],
        "student-instruction": [
          "20px",
          {
            "lineHeight": "26px",
            "fontWeight": "700"
          }
        ],
        "student-sentence": [
          "18px",
          {
            "lineHeight": "36px",
            "fontWeight": "400"
          }
        ],
        "student-body": [
          "17px",
          {
            "lineHeight": "25px",
            "fontWeight": "400"
          }
        ],
        "student-score": [
          "56px",
          {
            "lineHeight": "62px",
            "fontWeight": "700"
          }
        ]
      },
      "spacing": {
        "space-4": "var(--space-4)",
        "space-8": "var(--space-8)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        "space-24": "var(--space-24)",
        "space-32": "var(--space-32)",
        "space-48": "var(--space-48)"
      },
      "borderRadius": {
        "xs": "var(--radius-xs)",
        "md": "var(--radius-md)",
        "lg": "var(--radius-lg)",
        "pill": "var(--radius-pill)"
      },
      "boxShadow": {
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)"
      },
      "height": {
        "control-lg": "var(--control-lg)",
        "control-md": "var(--control-md)",
        "control-sm": "var(--control-sm)",
        "touch-min": "var(--touch-min)",
        "touch-student": "var(--touch-student)"
      },
      "minHeight": {
        "control-lg": "var(--control-lg)",
        "control-md": "var(--control-md)",
        "control-sm": "var(--control-sm)",
        "touch-min": "var(--touch-min)",
        "touch-student": "var(--touch-student)"
      },
      "width": {
        "control-lg": "var(--control-lg)",
        "control-md": "var(--control-md)",
        "control-sm": "var(--control-sm)",
        "touch-min": "var(--touch-min)",
        "touch-student": "var(--touch-student)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)"
      },
      "minWidth": {
        "control-lg": "var(--control-lg)",
        "control-md": "var(--control-md)",
        "control-sm": "var(--control-sm)",
        "touch-min": "var(--touch-min)",
        "touch-student": "var(--touch-student)"
      },
      "maxWidth": {
        "dialog-sm": "var(--dialog-sm)",
        "dialog-md": "var(--dialog-md)",
        "dialog-lg": "var(--dialog-lg)"
      },
      "size": {
        "control-lg": "var(--control-lg)",
        "control-md": "var(--control-md)",
        "control-sm": "var(--control-sm)",
        "touch-min": "var(--touch-min)",
        "touch-student": "var(--touch-student)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)"
      }
    }
  }
};
