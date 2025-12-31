export const calculateEV = (brightness0to255) => {
    // Normalize brightness to 0-1
    const normalized = brightness0to255 / 255;

    // Heuristic mapping
    const lux = Math.pow(normalized * 100, 2) * 5;

    if (lux === 0) return -2;

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

function getClosest(val, arr) {
    return arr.reduce((prev, curr) => {
        return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
    });
}

/**
 * Recalculate settings based on locked values and current EV.
 */
export const calculateSettings = (ev, currentSettings, locks) => {
    let { iso, aperture, shutter } = currentSettings;

    // EXPOSURE FORMULA: ev = log2(N^2) - log2(t) + log2(ISO/100)

    // LOGIC:
    // 1. Identify which variables are LOCKED.
    // 2. Solve for the UNLOCKED variable.
    // 3. If multiple unlocked, prioritize: Fix ISO -> Fix Aperture -> Solve Shutter.

    // Case 1: All Locked (Do nothing, or warn?)
    if (locks.iso && locks.aperture && locks.shutter) {
        return { iso, aperture, shutter };
    }

    // Case 2: 2 Locked, 1 Unlocked (Deterministic)
    if (locks.iso && locks.aperture) {
        // Solve Shutter: log2(t) = log2(N^2) + log2(ISO/100) - ev
        const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
        shutter = getClosest(Math.pow(2, log2t), SHUTTER_STOPS);
    }
    else if (locks.iso && locks.shutter) {
        // Solve Aperture: log2(N^2) = ev + log2(t) - log2(ISO/100)
        let logN2 = ev + Math.log2(shutter) - Math.log2(iso / 100);
        let apertureVal = Math.sqrt(Math.pow(2, logN2));
        aperture = getClosest(apertureVal, APERTURE_STOPS);
    }
    else if (locks.aperture && locks.shutter) {
        // Solve ISO: log2(ISO/100) = ev - log2(N^2) + log2(t)
        let logIso = ev - Math.log2(aperture * aperture) + Math.log2(shutter);
        let isoVal = 100 * Math.pow(2, logIso);
        iso = getClosest(isoVal, ISO_STOPS);
    }

    // Case 3: 1 Locked, 2 Unlocked (Heuristic)
    else if (locks.iso) {
        // ISO Locked. Prefer calculating Shutter (Aperture Priority-ish).
        // Keep Aperture fixed at current unless it's impossible?
        // Let's just hold current Aperture constant (effectively Soft Lock) and solve Shutter.
        const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
        shutter = getClosest(Math.pow(2, log2t), SHUTTER_STOPS);
    }
    else if (locks.aperture) {
        // Aperture Locked. Prefer calculating Shutter.
        // Soft Lock ISO (current).
        const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
        shutter = getClosest(Math.pow(2, log2t), SHUTTER_STOPS);
    }
    else if (locks.shutter) {
        // Shutter Locked. Prefer calculating Aperture.
        // Soft Lock ISO (current).
        let logN2 = ev + Math.log2(shutter) - Math.log2(iso / 100);
        let apertureVal = Math.sqrt(Math.pow(2, logN2));
        aperture = getClosest(apertureVal, APERTURE_STOPS);
    }

    // Case 4: None Locked (Full Auto)
    else {
        // Default: Fix ISO 400, Fix Aperture f/5.6, Solve Shutter
        iso = 400; // Reset to reasonable base if everything unlocked
        aperture = 5.6;
        const log2t = Math.log2(aperture * aperture) + Math.log2(iso / 100) - ev;
        shutter = getClosest(Math.pow(2, log2t), SHUTTER_STOPS);
    }

    return { iso, aperture, shutter };
};
