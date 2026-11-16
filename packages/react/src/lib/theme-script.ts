/* Server-safe theme constants (no "use client"), so a root layout can inline the script. */

export const THEME_STORAGE_KEY = "orra-theme";
export const ACCENT_STORAGE_KEY = "orra-accent";
export const ACCENT_STYLE_ID = "orra-accent-style";

/**
 * Inline script for <head> that applies the stored mode before first paint.
 * Usage (Next.js): <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 */
export const themeScript = `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}");var d=m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var a=localStorage.getItem("${ACCENT_STORAGE_KEY}");if(a){var s=document.createElement("style");s.id="${ACCENT_STYLE_ID}";s.textContent=JSON.parse(a).css;document.head.appendChild(s)}}catch(e){}})();`;
