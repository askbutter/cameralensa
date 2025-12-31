/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cosmic-bg': '#0f0c29', // Deep Purple/Black
                'cosmic-card': 'rgba(255, 255, 255, 0.08)',
                'cosmic-text': '#E0E7FF', // Soft Blue/White
                'cosmic-accent': '#00f3ff', // Cyan Neon
                'cosmic-soft': '#d946ef', // Hot Pink/Magenta
            },
            fontFamily: {
                'soft': ['"Quicksand"', 'sans-serif'],
                'sans': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'star': '0 0 15px rgba(224, 231, 255, 0.15)',
            }
        },
    },
    plugins: [],
}
