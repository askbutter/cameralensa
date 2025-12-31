// Basic Lux to EV conversion (approximate)
// EV = log2(Lux * 100 / K) where K is calibration constant (12.5 commonly)
export const calculateEV = (brightness0to255) => {
    // Normalize brightness to 0-1
    const normalized = brightness0to255 / 255;

    // Approximate Lux (This is a rough heuristic for camera feeds)
    // A fully white screen is approx 10,000 lux (daylight) in this mapping? 
    // This needs calibration. Let's assume linear mapping for now to get a relative EV.
    // Standard video feed is gamma corrected, so we might need to linearize.
    // Using a simplified exponential curve to map byte value to Lux.
    const lux = Math.pow(normalized * 100, 2) * 5; // Heuristic

    if (lux === 0) return -2; // Pitch black

    // EV @ ISO 100
    return Math.log2(lux / 2.5);
};

// Standard Stops
export const ISO_STOPS = [50, 100, 200, 400, 800, 1600, 3200, 6400];
export const APERTURE_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
export const SHUTTER_STOPS = [
    1 / 4000, 1 / 2000, 1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 15, 30
];

export const formatShutter = (val) => {
    if (val >= 1) return `${Math.round(val)}"`;
    return `1/${Math.round(1 / val)}`;
};

/**
 * Recalculate settings based on locked values and current EV.
 * EV = log2(N^2 / t) - log2(ISO/100)
 * targetEV is the metered EV from the scene.
 */
export const calculateSettings = (ev, currentSettings, locks) => {
    let { iso, aperture, shutter } = currentSettings;

    // Target EV for calculation (compensate for ISO)
    // Base EV is usually defined at ISO 100.
    // Exposure Formula: N^2 / t = (LS / K) = 2^EV
    // Where EV is for ISO 100.

    // Let's stick to the EV100 definition:
    // EV100 = log2(N^2) - log2(t)
    // And corrected for ISO: EV_current = EV100 + log2(ISO/100)

    // So: Scene EV (measured) = log2(N^2) - log2(t) + log2(ISO/100)

    // We want to find the missing variable that satisfies:
    // log2(N^2) - log2(t) + log2(ISO/100) = ev

    // Case 1: ISO Locked
    if (locks.iso) {
        if (locks.aperture) {
            // Find Shutter
            // log2(t) = log2(N^2) + log2(ISO/100) - ev
            const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
            const t = Math.pow(2, log2t);
            shutter = getClosest(t, SHUTTER_STOPS);
        } else {
            // Find Aperture (Default priority) or balance both?
            // Let's assume Aperture Priority if ISO is locked (user sets Aperture manually usually).
            // If Aperture is NOT locked, we assume we want to find a good Aperture for the current Shutter?
            // Let's implement logic: If ISO locked, try to keep Shutter reasonable (1/60) and find Aperture.
            // Or if Aperture locked, find Shutter.

            // Simple logic: Prioritize finding Shutter (Aperture Priority Mode essentially)
            // If both unlocked, fix ISO 400, fix Aperture f/5.6, find Shutter.

            // Let's use the current Aperture as the "Soft Lock" if not explicitly locked, 
            // effectively converting it to Aperture priority.
            const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
            const t = Math.pow(2, log2t);
            shutter = getClosest(t, SHUTTER_STOPS);
        }
    }
    // Case 2: Aperture Locked (Shutter Priority-ish or Auto ISO)
    else if (locks.aperture) {
        if (locks.shutter) {
            // Find ISO
            // log2(ISO/100) = ev - log2(N^2) + log2(t)
            const logIsoNorm = ev - Math.log2(aperture * aperture) + Math.log2(shutter);
            const isoVal = 100 * Math.pow(2, logIsoNorm);
            iso = getClosest(isoVal, ISO_STOPS);
        } else {
            // Find Shutter (Auto ISO is rare in manual film cameras, usually you lock ISO).
            // So if Aperture Locked, we usually vary Shutter.
            // Unless ISO is "Auto"?
            // Let's assume ISO is semi-fixed to 400 if unlocked.
            iso = 400;
            // Recalc shutter
            const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
            const t = Math.pow(2, log2t);
            shutter = getClosest(t, SHUTTER_STOPS);
        }
    }
    // Case 3: Nothing Locked (Full Auto)
    else {
        // Defaults
        iso = 400; // Good all-rounder
        aperture = 5.6; // Sweet spot
        // Solve Shutter
        const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
        const t = Math.pow(2, log2t);
        shutter = getClosest(t, SHUTTER_STOPS);
    }

    // If Shutter is out of bounds, we might need to adjust the others even if "Soft Locked".
    // But for simple v1, let's just clamp.

    return { iso, aperture, shutter };
};

function getClosest(val, arr) {
    return arr.reduce((prev, curr) => {
        return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
    });
}
