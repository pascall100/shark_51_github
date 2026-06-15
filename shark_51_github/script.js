
// =============== GLOBAL VARIABLES ===============
let formationCenterX = 0;
let formationCenterY = 0;
let currentFormation = 'halbkreis';
let formationModeEnabled = true;
// =============== EINFACHER LOCALSTORAGE (nur speichern) ===============
// Speichert automatisch alle 30 Sekunden
setInterval(() => {
    if (started) {
        const saveData = {
            divers: divers.map(d => ({ x: d.x, y: d.y, id: d.id, isCameraman: d.isCameraman, angle: d.angle, bob: d.bob })),
            sharks: sharks.map(s => ({ x: s.x, y: s.y, sharkType: s.sharkType, angle: s.angle, id: s.id })),
            boat: { x: boat.x, y: boat.y },
            sharkCage: sharkCage,
            documentationData: documentationData
        };
        localStorage.setItem('sharkSimulation', JSON.stringify(saveData));
        console.log("💾 Auto-Save");
    }
}, 30000);

// =============== HAUKÄFIG ===============
let sharkCage = null; // {x, y, size}
let isDraggingCage = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// =============== SHARK TYPES DATA ===============
const sharkTypes = {
    white: {
        name: "Weißer Hai",
        shortName: "Weißer",
        color: "#a0a0a0",
        size: 2.0,
        dangerLevel: 3,
        description: "Der Große Weiße Hai ist einer der bekanntesten Haie. Neugierig, kann aggressiv sein, greift aber selten Menschen an.",
        sizeRange: "4–6 Meter",
        habitat: "Weltweit in kühlen und gemäßigten Gewässern",
        behavior: "aggressive",
        image: "🦈"
    },
    reef: {
        name: "Weißspitzen-Riffhai",
        shortName: "Riffhai",
        color: "#5a7d9a",
        size: 0.9,
        dangerLevel: 2,
        description: "Häufig bei Tauchgängen in Korallenriffen zu sehen. Meist friedlich, aber neugierig. Selten aggressiv.",
        sizeRange: "1.5–2 Meter",
        habitat: "Tropische und subtropische Korallenriffe",
        behavior: "curious",
        image: "🦈"
    },
    whale: {
        name: "Walhai",
        shortName: "Walhai",
        color: "#6b8cae",
        size: 2.0,
        dangerLevel: 1,
        description: "Der größte Fisch der Welt! Harmloser Filterfresser, ernährt sich von Plankton. Sehr sanftmütig.",
        sizeRange: "4–12 Meter",
        habitat: "Tropische und subtropische Meere",
        behavior: "peaceful",
        image: "🐋"
    },
    bull: {
        name: "Bullenhai",
        shortName: "Bulle",
        color: "#656565",
        size: 1.1,
        dangerLevel: 3,
        description: "Aggressiv und territorial. Bullenhaie sind für viele Vorfälle verantwortlich, da sie oft in flachen Küstengewässern leben.",
        sizeRange: "2–3.5 Meter",
        habitat: "Weltweit in warmen Küstengewässern und Flüssen",
        behavior: "aggressive",
        image: "🦈"
    },
    nurse: {
        name: "Ammenhai",
        shortName: "Amme",
        color: "#8b6b4a",
        size: 1.0,
        dangerLevel: 1,
        description: "Friedlich und neugierig. Oft in flachem Wasser zu finden. Greift Menschen nur an, wenn provoziert.",
        sizeRange: "2–3 Meter",
        habitat: "Atlantik und östlicher Pazifik, oft in flachen Küstengewässern",
        behavior: "peaceful",
        image: "🦈"
    },
    tiger: {
        name: "Tigerhai",
        shortName: "Tiger",
        color: "#7a6b5e",
        size: 1.3,
        dangerLevel: 3,
        description: "Allesfresser mit breitem Speiseplan. Unberechenbar, aber Angriffe auf Menschen sind selten.",
        sizeRange: "3–5 Meter",
        habitat: "Tropische und subtropische Meere weltweit",
        behavior: "unpredictable",
        image: "🦈"
    },
    hammerhead: {
        name: "Hammerhai",
        shortName: "Hammer",
        color: "#8a8a8a",
        size: 1.1,
        dangerLevel: 2,
        description: "Auffällig durch seinen hammerförmigen Kopf. Meist scheu, aber neugierig. Selten aggressiv.",
        sizeRange: "2–4 Meter",
        habitat: "Weltweit in warmen Gewässern",
        behavior: "curious",
        image: "🦈"
    }
};

// =============== INIT SHARK TYPE UI ===============
function initSharkTypeUI() {
    const container = document.getElementById("shark-types-container");
    const countsContainer = document.getElementById("shark-counts-container");
    const infoBox = document.getElementById("shark-info-preview");

    for (const [key, shark] of Object.entries(sharkTypes)) {
        const cardDiv = document.createElement("div");
        cardDiv.className = `shark-card danger-${shark.dangerLevel}`;
        cardDiv.dataset.sharkKey = key;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `shark-type-${key}`;
        checkbox.value = key;
        checkbox.dataset.sharkKey = key;

        const label = document.createElement("label");
        label.className = "shark-card-label";
        label.htmlFor = `shark-type-${key}`;
        label.innerHTML = `${shark.image} <strong>${shark.name}</strong> <span style="color: ${shark.dangerLevel === 3 ? '#ff6b6b' : shark.dangerLevel === 2 ? '#ffd166' : '#06d6a0'}">${"⚠️".repeat(shark.dangerLevel)}</span>`;

        cardDiv.appendChild(checkbox);
        cardDiv.appendChild(label);

        cardDiv.addEventListener("mouseenter", () => {
            showSharkInfo(shark);
        });
        cardDiv.addEventListener("mouseleave", () => {
            infoBox.style.display = "none";
        });
        cardDiv.addEventListener("click", (e) => {
            if (e.target.type !== 'number') {
                checkbox.checked = !checkbox.checked;
                const countInput = document.getElementById(`shark-count-${key}`);
                if (countInput) {
                    countInput.disabled = !checkbox.checked;
                    if (!checkbox.checked) countInput.value = "0";
                }
                cardDiv.classList.toggle("selected", checkbox.checked);
            }
        });

        container.appendChild(cardDiv);

        const countDiv = document.createElement("div");
        countDiv.className = "count-card";

        const countLabel = document.createElement("label");
        countLabel.htmlFor = `shark-count-${key}`;
        countLabel.textContent = `${shark.shortName || shark.name}:`;

        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.id = `shark-count-${key}`;
        countInput.value = "0";
        countInput.min = "0";
        countInput.max = "5";

        countInput.disabled = true;
        checkbox.addEventListener("change", () => {
            countInput.disabled = !checkbox.checked;
            if (!checkbox.checked) countInput.value = "0";
            cardDiv.classList.toggle("selected", checkbox.checked);
        });

        countDiv.appendChild(countLabel);
        countDiv.appendChild(countInput);
        countsContainer.appendChild(countDiv);
    }

    // Standardmäßig Weißspitzen-Riffhai auswählen
    const reefCheckbox = document.getElementById("shark-type-reef");
    const reefCount = document.getElementById("shark-count-reef");
    const reefCard = document.querySelector(`.shark-card[data-shark-key="reef"]`);
    if (reefCheckbox && reefCount && reefCard) {
        reefCheckbox.checked = true;
        reefCount.disabled = false;
        reefCount.value = "3";
        reefCard.classList.add("selected");
    }
}

function showSharkInfo(shark) {
    const infoBox = document.getElementById("shark-info-preview");
    const title = document.getElementById("shark-info-title");
    const description = document.getElementById("shark-info-description");
    const dangerIcons = document.getElementById("shark-danger-icons");
    const sizeRange = document.getElementById("shark-size-range");
    const habitat = document.getElementById("shark-habitat");

    title.innerHTML = `${shark.image} ${shark.name}`;
    description.textContent = shark.description;
    dangerIcons.innerHTML = "⚠️".repeat(shark.dangerLevel);
    sizeRange.textContent = `Größe: ${shark.sizeRange}`;
    habitat.textContent = `Lebensraum: ${shark.habitat}`;

    infoBox.style.borderLeftColor = shark.dangerLevel === 3 ? "#ff6b6b" :
                                    shark.dangerLevel === 2 ? "#ffd166" : "#06d6a0";

    infoBox.style.display = "block";
}

// =============== SETUP ===============
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let divers = [];
let sharks = [];
let bubbles = [];
let smallFish = [];
let objects = [];

let boat = { x: 400, y: 140 };

let selected = null;
let started = false;
let time = 0;
let lastTime = performance.now();
let fishStartTime = 0;
let hudVisible = true;
let shakeIntensity = 0;
let hasCameraman = true;
let documentationData = {};

let bgColor1 = "#003366";
let bgColor2 = "#000d1f";

const keys = {};

// =============== INIT ===============
window.addEventListener("DOMContentLoaded", () => {
    initSharkTypeUI();

    // Event-Listener für Buttons
    document.getElementById("haikaefig-btn").addEventListener("click", toggleHaikaefig);
    document.getElementById("toggle-formation-btn").addEventListener("click", toggleFormationMode);
    document.getElementById("toggle-hud-btn").addEventListener("click", toggleHUD);

    // Hintergrundfarben-Listener
    document.getElementById("bgColor1").addEventListener("input", (e) => {
        bgColor1 = e.target.value;
    });
    document.getElementById("bgColor2").addEventListener("input", (e) => {
        bgColor2 = e.target.value;
    });
});



// =============== INPUT ===============
// Hilfsfunktion: Prüft ob ein Formular-Feld fokussiert ist
function isFormFieldFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || 
                      active.tagName === 'TEXTAREA' || 
                      active.tagName === 'SELECT');
}

// Tastatur-Events nur wenn KEIN Formular-Feld fokussiert ist
document.addEventListener("keydown", e => {
    if (!isFormFieldFocused()) {
        keys[e.key.toLowerCase()] = true;
    }
});

document.addEventListener("keyup", e => {
    if (!isFormFieldFocused()) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Escape-Taste entfernt Fokus von Formular-Feldern
document.addEventListener("keydown", e => {
    if (e.key === 'Escape') {
        document.activeElement?.blur();
    }
});

// =============== MOUSE INTERACTION ===============
canvas.addEventListener("mousedown", (e) => {
    if (!started) return;
    const mouse = getMouse(e);

    // Taucher oder Hai auswählen
    if (e.button === 0) {
        selected = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            const o = objects[i];
            if (o.type === "shark" || o.type === "diver") {
                if (Math.hypot(mouse.x - o.x, mouse.y - o.y) < 45) {
                    selected = o;
                    isDraggingCage = false;
                    return;
                }
            }
        }
    }

    // Haikäfig prüfen
    if (sharkCage) {
        const cage = sharkCage;
        if (
            mouse.x > cage.x &&
            mouse.x < cage.x + cage.size &&
            mouse.y > cage.y &&
            mouse.y < cage.y + cage.size
        ) {
            isDraggingCage = true;
            dragOffsetX = mouse.x - cage.x;
            dragOffsetY = mouse.y - cage.y;
            selected = null;
            return;
        }
    }

    // Rechtsklick: Formation verschieben
    if (e.button === 2 && formationModeEnabled) {
        e.preventDefault();
        moveFormationTo(mouse.x, mouse.y);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!started || !sharkCage || !isDraggingCage) return;
    const mouse = getMouse(e);

    sharkCage.x = mouse.x - dragOffsetX;
    sharkCage.y = mouse.y - dragOffsetY;
});

canvas.addEventListener("mouseup", () => {
    isDraggingCage = false;
});

canvas.addEventListener("mouseleave", () => {
    isDraggingCage = false;
});

// =============== TOGGLE FORMATION MODE ===============
function toggleFormationMode() {
    formationModeEnabled = !formationModeEnabled;
    const btn = document.getElementById("toggle-formation-btn");

    if (formationModeEnabled) {
        btn.textContent = "Formation verschieben: EIN";
        canvas.style.cursor = "crosshair";
        document.getElementById("formation-hint").style.display = "block";
    } else {
        btn.textContent = "Formation verschieben: AUS";
        canvas.style.cursor = "default";
        document.getElementById("formation-hint").style.display = "none";
    }
}

// =============== SURFER / LOG TOGGLE ===============
function toggleSurfer() {
    const logPanel = document.getElementById('eventLog');
    const btn = document.getElementById("surfer-btn");
    
    if (!logPanel) {
        console.error("EventLog-Panel nicht gefunden!");
        return;
    }
    
    // Prüfe aktuellen Zustand und toggle
    if (logPanel.style.display === "none" || !logPanel.style.display) {
        logPanel.style.display = "block";
        if (btn) btn.textContent = "🏄 Log: EIN";
        addToLog("📋 Log eingeblendet");
    } else {
        logPanel.style.display = "none";
        if (btn) btn.textContent = "🏄 Log: AUS";
        addToLog("📋 Log ausgeblendet");
    }
}

// =============== HUD TOGGLE ===============
// =============== HUD TOGGLE (KORRIGIERT) ===============
function toggleHUD() {
    const hud = document.getElementById("hud");
    const btn = document.getElementById("toggle-hud-btn");
    
    if (!hud) {
        console.error("HUD nicht gefunden!");
        return;
    }
    
    // Prüfe aktuellen Zustand
    if (hud.style.display === "none") {
        hud.style.display = "block";
        if (btn) btn.textContent = "HUD: EIN";
        console.log("HUD eingeschaltet");
    } else {
        hud.style.display = "none";
        if (btn) btn.textContent = "HUD: AUS";
        console.log("HUD ausgeschaltet");
    }
}

// =============== FORMATIONS ===============
function setFormation(formation) {
    if (!started || divers.length === 0) return;

    currentFormation = formation;
    const centerX = formationCenterX || canvas.width / 2;
    const centerY = formationCenterY || canvas.height / 3;
    const radius = 150;
    const diverCount = divers.length;

    switch (formation) {
        case 'halbkreis':
            const angleStep = Math.PI / (diverCount - 1);
            divers.forEach((d, i) => {
                const angle = -Math.PI / 2 + angleStep * i;
                d.x = centerX + Math.cos(angle) * radius;
                d.y = centerY + Math.sin(angle) * radius * 0.6;
            });
            break;

        case 'stern':
            const starAngleStep = (2 * Math.PI) / diverCount;
            divers.forEach((d, i) => {
                const angle = starAngleStep * i;
                d.x = centerX + Math.cos(angle) * radius;
                d.y = centerY + Math.sin(angle) * radius;
            });
            break;

        case 'linie':
            const lineSpacing = 60;
            const startX = centerX - (diverCount * lineSpacing) / 2 + lineSpacing / 2;
            divers.forEach((d, i) => {
                d.x = startX + i * lineSpacing;
                d.y = centerY;
            });
            break;
    }

    const cameraman = divers.find(d => d.isCameraman);
    if (cameraman) {
        cameraman.x = centerX;
        cameraman.y = centerY + 30;
    }

    formationCenterX = centerX;
    formationCenterY = centerY;
}

// Funktion zum Verschieben der Formation
function moveFormationTo(newX, newY) {
    if (!started || divers.length === 0) return;

    const dx = newX - formationCenterX;
    const dy = newY - formationCenterY;

    divers.forEach(d => {
        d.x += dx;
        d.y += dy;
    });

    formationCenterX = newX;
    formationCenterY = newY;

    const cameraman = divers.find(d => d.isCameraman);
    if (cameraman) {
        cameraman.x = formationCenterX;
        cameraman.y = formationCenterY + 30;
    }
}

// =============== START ===============
function start() {
    const dCount = parseInt(document.getElementById("diversCount").value);
    const startDepth = parseInt(document.getElementById("depth").value);
    hasCameraman = document.getElementById("hasCameraman").value === "true";

    divers = [];
    sharks = [];
    bubbles = [];
    smallFish = [];

    let totalSharks = 0;
    for (const [key, shark] of Object.entries(sharkTypes)) {
        const checkbox = document.getElementById(`shark-type-${key}`);
        const countInput = document.getElementById(`shark-count-${key}`);
        if (checkbox && checkbox.checked && countInput) {
            const count = parseInt(countInput.value) || 0;
            totalSharks += count;
            for (let i = 0; i < count; i++) {
                sharks.push({
                    x: 150 + Math.random() * (canvas.width * 0.35),
                    y: 120 + Math.random() * (canvas.height - 300),
                    id: sharks.length + 1,
                    type: "shark",
                    angle: Math.random() * Math.PI * 2,
                    sharkType: key,
                    size: shark.size,
                    color: shark.color
                });
            }
        }
    }

    // Falls keine Haie ausgewählt wurden, standardmäßig 3 Riffhaie hinzufügen
    if (totalSharks === 0) {
        for (let i = 0; i < 3; i++) {
            sharks.push({
                x: 150 + Math.random() * (canvas.width * 0.35),
                y: 120 + Math.random() * (canvas.height - 300),
                id: i + 1,
                type: "shark",
                angle: Math.random() * Math.PI * 2,
                sharkType: "reef",
                size: sharkTypes.reef.size,
                color: sharkTypes.reef.color
            });
        }
    }

    const totalDivers = hasCameraman ? dCount : dCount;
    formationCenterX = canvas.width / 2;
    formationCenterY = canvas.height / 3;

    for (let i = 0; i < totalDivers; i++) {
        divers.push({
            x: 0,
            y: 0,
            id: i + 1,
            type: "diver",
            bob: Math.random() * Math.PI * 2,
            angle: 0,
            stressed: false,
            isCameraman: hasCameraman && i === totalDivers - 1
        });
    }

    objects = [...divers, ...sharks];
    if (sharkCage) objects.push(sharkCage); // Haikäfig zur objects-Liste hinzufügen

    started = true;
    fishStartTime = time;

    boat.x = 350;
    boat.y = 140;

    document.getElementById("setup").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("color-picker").style.display = "block";

    setFormation('halbkreis');
    addToLog("🟢 Simulation gestartet");
}

// =============== SMALL FISH ===============
function createSmallFish() {
    smallFish = [];
    for (let i = 0; i < 4; i++) {
        smallFish.push({
            x: -60 - i * 80,
            y: canvas.height - 110 + Math.random() * 50,
            speed: 14 + Math.random() * 12,
            direction: 1,
            size: 24 + Math.random() * 12,
            bob: Math.random() * Math.PI * 2
        });
    }
}

function updateSmallFish(dt) {
    if (time - fishStartTime < 8) return;
    if (smallFish.length === 0) createSmallFish();

    smallFish.forEach(f => {
        f.x += f.speed * f.direction * dt;
        f.bob += dt * 6;

        if (f.x > canvas.width + 50 && f.direction === 1) f.direction = -1;
        if (f.x < -50 && f.direction === -1) f.direction = 1;
    });
}

function drawSmallFish() {
    if (time - fishStartTime < 8) return;

    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.5)";

    smallFish.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y + Math.sin(f.bob) * 4);
        if (f.direction === -1) ctx.scale(-1, 1);

        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#bb0000";
        ctx.beginPath();
        ctx.ellipse(-f.size*0.25, 0, f.size*0.55, f.size*0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#880000";
        ctx.beginPath();
        ctx.moveTo(-f.size*0.4, -f.size*0.35);
        ctx.lineTo(0, -f.size*0.7);
        ctx.lineTo(f.size*0.3, -f.size*0.35);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-f.size*0.85, 0);
        ctx.lineTo(-f.size*1.1, -f.size*0.35);
        ctx.lineTo(-f.size*1.1, f.size*0.35);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(f.size * 0.35, -6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(f.size * 0.4, -6, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
    ctx.shadowBlur = 0;
}

// =============== BOAT ===============
function drawBoat() {
    ctx.save();
    ctx.translate(boat.x, boat.y);

    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(-38, 14);
    ctx.lineTo(38, 14);
    ctx.lineTo(22, -14);
    ctx.lineTo(-22, -14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(2, -62);
    ctx.stroke();

    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.moveTo(2, -60);
    ctx.lineTo(38, -12);
    ctx.lineTo(2, -12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function updateBoat(dt) {
    const boatSpeed = 220;
    if (keys["t"]) boat.y -= boatSpeed * dt;
    if (keys["g"]) boat.y += boatSpeed * dt;
    if (keys["f"]) boat.x -= boatSpeed * dt;
    if (keys["h"]) boat.x += boatSpeed * dt;
}

// =============== HELPERS ===============
function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function createBubble(x, y) {
    bubbles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + 10,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 70 + 50
    });
}

function checkDistances() {
    divers.forEach(d => d.stressed = false);
    for (let d of divers) {
        for (let s of sharks) {
            if (getDistance(d, s) < 35) d.stressed = true;
        }
    }
}

function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function adjustColor(hex, amount) {
    let r = parseInt(hex.substr(1, 2), 16);
    let g = parseInt(hex.substr(3, 2), 16);
    let b = parseInt(hex.substr(5, 2), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// =============== UPDATE ===============
function update(dt) {
    if (selected) {
        const speed = 270;
        const rotSpeed = 3;

        if (selected.type === "diver") {
            if (keys["w"]) selected.y -= speed * dt;
            if (keys["s"]) selected.y += speed * dt;
            if (keys["a"]) selected.x -= speed * dt;
            if (keys["d"]) selected.x += speed * dt;
            if (Math.random() < 0.4) createBubble(selected.x - 8, selected.y + 5);
        }

        if (selected.type === "shark") {
            if (keys["i"]) selected.y -= speed * dt;
            if (keys["k"]) selected.y += speed * dt;
            if (keys["j"]) selected.x -= speed * dt;
            if (keys["l"]) selected.x += speed * dt;
        }

        if (keys["arrowleft"]) selected.angle -= rotSpeed * dt;
        if (keys["arrowright"]) selected.angle += rotSpeed * dt;
    }

    checkDistances();

    if (shakeIntensity > 0) {
        shakeIntensity -= dt * 2;
        if (shakeIntensity < 0) shakeIntensity = 0;
    }
}

// =============== DRAW BACKGROUND ===============
function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, bgColor1);
    grad.addColorStop(1, bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(100, 200, 255, 0.08)";
    ctx.lineWidth = 60;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const offset = (time * 20 + i * 80) % (canvas.width + 400) - 200;
        ctx.moveTo(offset, 0);
        ctx.quadraticCurveTo(offset + 150, canvas.height * 0.4, offset + 80, canvas.height);
        ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 80 + i * 35);
        for (let x = 0; x < canvas.width; x += 15) {
            const y = 80 + i * 35 + Math.sin(x * 0.008 + time + i) * 12;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();
    }
    drawCorals();
}

function drawCorals() {
    ctx.fillStyle = "#c23a6c";
    ctx.fillRect(canvas.width * 0.15, canvas.height - 90, 18, 90);
    ctx.beginPath();
    ctx.arc(canvas.width * 0.16, canvas.height - 95, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e05a8c";
    ctx.beginPath();
    ctx.arc(canvas.width * 0.22, canvas.height - 75, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e8c4e";
    ctx.fillRect(canvas.width * 0.65, canvas.height - 110, 22, 110);
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.67, canvas.height - 125, 35, 18, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3cb878";
    ctx.beginPath();
    ctx.arc(canvas.width * 0.72, canvas.height - 95, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c25e2e";
    ctx.fillRect(canvas.width * 0.88, canvas.height - 70, 15, 70);
    ctx.beginPath();
    ctx.arc(canvas.width * 0.89, canvas.height - 75, 20, 0, Math.PI * 2);
    ctx.fill();
}

// =============== DRAW DIVER ===============
function drawDiver(d) {
    const bob = Math.sin(time * 4 + d.bob) * 1.5;
    ctx.save();
    ctx.translate(d.x, d.y + bob);
    ctx.rotate(d.angle);

    if (d.stressed) {
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 30;
    }

    if (d.isCameraman) {
        ctx.fillStyle = "#ff8800";
    } else {
        ctx.fillStyle = "#224488";
    }
    ctx.fillRect(-10, -18, 20, 36);
    ctx.fillStyle = "#ffddaa";
    ctx.beginPath();
    ctx.arc(0, -22, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#112233";
    ctx.beginPath();
    ctx.ellipse(4, -22, 11, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, -23, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#00aaff";
    ctx.beginPath();
    ctx.moveTo(-10, 15);
    ctx.lineTo(-25, 8);
    ctx.lineTo(-25, 22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.lineTo(25, 8);
    ctx.lineTo(25, 22);
    ctx.fill();

    if (d.isCameraman) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "black";
        ctx.fillText("Kamera", 0, -35);
    }

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "black";
    ctx.fillText(d.id, 0, 0);
    ctx.restore();
}

// =============== DRAW SHARK ===============
function drawShark(s) {
    const sway = Math.sin(time * 6) * 2.5;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    const sharkType = sharkTypes[s.sharkType] || sharkTypes.reef;
    const scale = sharkType.size || 1.0;

    ctx.fillStyle = sharkType.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 55 * scale, 20 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = adjustColor(sharkType.color, -20);
    ctx.beginPath();
    ctx.moveTo(-8 * scale, -22 * scale);
    ctx.lineTo(12 * scale, 0);
    ctx.lineTo(-8 * scale, 22 * scale);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-48 * scale, 0);
    ctx.lineTo(-70 * scale, -22 * scale + sway);
    ctx.lineTo(-70 * scale, 22 * scale - sway);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${14 * scale}px Arial`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "black";
    ctx.fillText(s.id, -65 * scale, 5 * scale);

    ctx.fillStyle = "#ffeb3b";
    ctx.font = `bold ${12 * scale}px Arial`;
    ctx.fillText(sharkType.shortName || sharkType.name, -20 * scale, -30 * scale);

    if (s.sharkType === "whale") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2 * scale;
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-50 * scale, i * 10 * scale);
            ctx.lineTo(50 * scale, i * 10 * scale);
            ctx.stroke();
        }
    } else if (s.sharkType === "tiger") {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 3 * scale;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(-40 * scale, i * 15 * scale);
            ctx.lineTo(30 * scale, i * 15 * scale);
            ctx.stroke();
        }
    } else if (s.sharkType === "hammerhead") {
        ctx.fillStyle = adjustColor(sharkType.color, -10);
        ctx.beginPath();
        ctx.ellipse(-20 * scale, 0, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(20 * scale, 0, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(22 * scale, -6 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(24 * scale, -6 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBubbles(dt) {
    ctx.fillStyle = "rgba(220, 240, 255, 0.75)";
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        ctx.globalAlpha = Math.max(b.size / 7, 0.3);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        b.y -= b.speed * dt;
        b.x += Math.sin(time * 3 + i) * 20 * dt;
        b.size -= 0.5 * dt;
        if (b.size <= 0.6) bubbles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

function drawDistanceLines() {
    ctx.lineWidth = 2;
    for (let d of divers) {
        for (let s of sharks) {
            const dist = getDistance(d, s);
            if (dist > 220) continue;
            let color = dist < 30 ? "#ff2222" : dist < 100 ? "#ffaa00" : "#ffee00";
            let alpha = dist < 30 ? 0.9 : dist < 100 ? 0.7 : 0.5;
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}

function drawSelection() {
    if (!selected) return;
    const radius = selected.type === "shark" ? 68 : 42;
    if (selected.type === "shark") {
        const pulse = 0.75 + Math.sin(time * 9) * 0.25;
        ctx.strokeStyle = `rgba(255, 60, 60, ${pulse})`;
        ctx.shadowColor = "#ff2222";
        ctx.shadowBlur = 35;
    } else {
        ctx.strokeStyle = "rgba(255, 240, 100, 0.95)";
        ctx.shadowColor = "#ffeb3b";
        ctx.shadowBlur = 25;
    }
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(selected.x, selected.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// =============== DRAW SHARK CAGE ===============
function drawSharkCage() {
    if (!sharkCage) return;

    const c = sharkCage;
    const s = c.size;

    ctx.save();
    ctx.translate(c.x, c.y);

    // Schatten
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    // Dunkler Rahmen (außen)
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 9;
    ctx.strokeRect(0, 0, s, s);

    // Innenrahmen
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, s - 20, s - 20);

    // Hellere Gitterstäbe
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 9;
    const spacing = 38;

    // Vertikale Gitterstäbe
    for (let x = 25; x < s - 25; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 18);
        ctx.lineTo(x, s - 18);
        ctx.stroke();
    }

    // Horizontale Gitterstäbe
    for (let y = 25; y < s - 25; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(18, y);
        ctx.lineTo(s - 18, y);
        ctx.stroke();
    }

    // Glanz oben
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(s - 15, 15);
    ctx.stroke();

    ctx.restore();
}

// =============== MAIN DRAW ===============
function draw(dt) {
    if (shakeIntensity > 0) {
        ctx.save();
        ctx.translate(
            (Math.random() - 0.5) * shakeIntensity * 10,
            (Math.random() - 0.5) * shakeIntensity * 10
        );
    }

    drawBackground();
    drawBubbles(dt);
    drawDistanceLines();
    divers.forEach(drawDiver);
    sharks.forEach(drawShark);
    drawSmallFish();
    if (sharkCage) drawSharkCage(); // <-- Hier: Immer zeichnen, wenn sharkCage existiert
    drawBoat();
    drawSelection();

    if (shakeIntensity > 0) {
        ctx.restore();
    }
}

// =============== HUD - NEUTRALE DATENANZEIGE (KORRIGIERT) ===============
function updateHUD() {
    // 1. Zähler anzeigen (funktioniert immer)
    const infoEl = document.getElementById("info");
    if (infoEl) {
        infoEl.innerHTML = `🧑 Taucher: ${divers.length} &nbsp; 🦈 Haie: ${sharks.length}`;
    }
    
    // 2. Hole die Elemente für die neue Anzeige
    const depthEl = document.getElementById("selected-depth");
    const listEl = document.getElementById("comparison-list");
    
    // 3. Wenn die neuen Elemente nicht existieren -> alte HUD-Logik verwenden
    if (!depthEl || !listEl) {
        updateHUDFallback();
        return;
    }
    
    // 4. Wenn kein Objekt ausgewählt ist
    if (!selected) {
        depthEl.innerHTML = '--<span class="value-unit"> m</span>';
        listEl.innerHTML = '<div style="color: #aaa; text-align: center; padding: 10px;">👆 Klicke auf einen Taucher, Hai oder das Boot</div>';
        
        // Zusätzlich die alte active Anzeige leeren (optional)
        const activeEl = document.getElementById("active");
        if (activeEl) activeEl.innerHTML = "";
        return;
    }
    
    // 5. Eigene Tiefe des ausgewählten Objekts
    let selectedDepth = (selected.y / 6).toFixed(1);
    depthEl.innerHTML = `${selectedDepth}<span class="value-unit"> m</span>`;
    
    // 6. Namen des ausgewählten Objekts bestimmen
    let selectedName = "";
    if (selected.type === "diver") {
        selectedName = selected.isCameraman ? `📹 Kameramann #${selected.id}` : `🤿 Taucher #${selected.id}`;
    } else if (selected.type === "shark") {
        const sharkType = sharkTypes[selected.sharkType] || sharkTypes.reef;
        selectedName = `${sharkType.image} Hai #${selected.id} (${sharkType.name})`;
    } else if (selected === boat) {
        selectedName = `⛵ Schiff`;
    }
    
    // 7. Alle anderen Objekte sammeln
    let otherObjects = [];
    
    // Taucher hinzufügen (außer selected)
    divers.forEach(d => {
        if (d !== selected) {
            otherObjects.push({
                obj: d,
                displayName: d.isCameraman ? `📹 Kameramann #${d.id}` : `🤿 Taucher #${d.id}`,
                x: d.x,
                y: d.y
            });
        }
    });
    
    // Haie hinzufügen (außer selected)
    sharks.forEach(s => {
        if (s !== selected) {
            const sharkType = sharkTypes[s.sharkType] || sharkTypes.reef;
            otherObjects.push({
                obj: s,
                displayName: `${sharkType.image} Hai #${s.id} (${sharkType.name})`,
                x: s.x,
                y: s.y
            });
        }
    });
    
    // Boot hinzufügen (wenn nicht selected)
    if (boat !== selected) {
        otherObjects.push({
            obj: boat,
            displayName: `⛵ Schiff`,
            x: boat.x,
            y: boat.y
        });
    }
    
    // 8. HTML für die Vergleichsliste
    let comparisonHtml = `<div style="margin-bottom: 8px; color: #ffaa44; font-size: 11px;">🎯 Ausgewählt: ${selectedName}</div>`;
    
    if (otherObjects.length === 0) {
        comparisonHtml += '<div style="color: #aaa; text-align: center; padding: 10px;">Keine anderen Objekte in der Nähe</div>';
    } else {
        otherObjects.forEach(other => {
            const dx = other.x - selected.x;
            const dy = other.y - selected.y;
            const distanceMeters = (Math.hypot(dx, dy) / 6).toFixed(1);
            const verticalDiff = (other.y - selected.y) / 6;
            const verticalAbs = Math.abs(verticalDiff).toFixed(1);
            const verticalDir = verticalDiff > 0 ? '⬇️ UNTER' : (verticalDiff < 0 ? '⬆️ ÜBER' : '↔️ GLEICHE TIEFE');
            const horizontalMeters = (Math.abs(dx) / 6).toFixed(1);
            
            comparisonHtml += `
                <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: 5px; margin-bottom: 8px;">
                    <div style="color: #88ccff; font-size: 11px; margin-bottom: 6px;">📍 ${other.displayName}</div>
                    <div style="display: flex; justify-content: space-around; gap: 8px;">
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 9px; color: #aaa;">📐 DISTANZ</div>
                            <div style="font-size: 13px; font-weight: bold;">${distanceMeters} m</div>
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 9px; color: #aaa;">⬆️ VERTIKAL</div>
                            <div style="font-size: 13px; font-weight: bold;">${verticalAbs} m ${verticalDir}</div>
                        </div>
                        <div style="text-align: center; flex: 1;">
                            <div style="font-size: 9px; color: #aaa;">↔️ HORIZONTAL</div>
                            <div style="font-size: 13px; font-weight: bold;">${horizontalMeters} m</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    listEl.innerHTML = comparisonHtml;
}

// Fallback Funktion (alte HUD-Logik für Kompatibilität)
function updateHUDFallback() {
    const infoEl = document.getElementById("info");
    if (infoEl) {
        infoEl.innerHTML = `🧑 Taucher: ${divers.length} &nbsp; 🦈 Haie: ${sharks.length}`;
    }
    
    const activeEl = document.getElementById("active");
    const listDiv = document.getElementById("distance-list");
    
    if (activeEl && listDiv && selected && (selected.type === "diver" || selected.type === "shark")) {
        activeEl.innerHTML = `🎯 ${selected.type === "diver" ? (selected.isCameraman ? 'Kameramann' : 'Taucher') : 'Hai'} <b>#${selected.id}</b>`;
        
        let html = `<b>${selected.type === "diver" ? (selected.isCameraman ? 'Kameramann' : 'Taucher ' + selected.id) : 'Hai ' + selected.id} → ${selected.type === "diver" ? 'Haie' : 'Taucher'}:</b><br>`;
        const targetObjects = selected.type === "diver" ? sharks : divers;
        const sorted = [...targetObjects].sort((a, b) => getDistance(selected, a) - getDistance(selected, b));
        
        sorted.forEach(o => {
            const meters = getDistance(selected, o) / 6;
            const objType = o.type === "shark" ? sharkTypes[o.sharkType] || sharkTypes.reef : o;
            const name = o.type === "shark" ? `${objType.image} <b>${o.id} (${objType.name})</b>` : `<b>${o.isCameraman ? 'Kamera' : 'Taucher ' + o.id}</b>`;
            html += `→ ${name}: ${meters.toFixed(1)} m<br>`;
        });
        listDiv.innerHTML = html;
    } else if (activeEl && listDiv) {
        activeEl.innerHTML = "";
        listDiv.innerHTML = "";
    }
    
    // Boot-Distanzen (optional, kann bleiben)
    const boatDistanceEl = document.getElementById("boat-distance");
    if (boatDistanceEl) {
        let boatDistancesHTML = `<b>⛵ Schiff → Taucher:</b><br>`;
        divers.forEach(d => {
            const dist = getDistance(boat, d);
            const meters = dist / 6;
            boatDistancesHTML += `→ ${d.isCameraman ? 'Kamera' : 'Taucher ' + d.id}: <b>${meters.toFixed(1)} m</b><br>`;
        });
        boatDistanceEl.innerHTML = boatDistancesHTML;
    }
}
// =============== Function LOOP ===============
function loop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    const clampedDt = Math.min(dt, 0.033);

    time += clampedDt;

    if (started) {
        update(clampedDt);
        updateSmallFish(clampedDt);
        updateBoat(clampedDt);
        draw(clampedDt);
        updateHUD();
    }

    requestAnimationFrame(loop);

}

requestAnimationFrame(loop);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
});
// =============== HTML-BERICHT (SCREENSHOT + DOKUMENTATION) ===============
// =============== HILFSFUNKTION FÜR CONFIDENCE-TEXTE ===============
function getConfidenceText(value) {
    if (!value || value === '0') return 'Keine Angabe';
    const num = parseInt(value);
    switch(num) {
        case 4: return '4 - Sehr sicher';
        case 3: return '3 - Eher sicher';
        case 2: return '2 - Unsicher';
        case 1: return '1 - Sehr unsicher';
        default: return value;
    }
}
window.openHtmlReport = function() {
    // Prüfen ob Simulation läuft
    if (!started) {
        alert("Bitte starte zuerst die Simulation!");
        return;
    }
    
    // 1. Screenshot vom Canvas machen
    const screenshot = canvas.toDataURL('image/png');
    
    // 2. Event-Log aus dem bestehenden Panel auslesen
    let logHtml = "";
    if (logContentElement) {
        logHtml = logContentElement.innerHTML;
    } else {
        logHtml = "<i>Kein Event-Log verfügbar</i>";
    }
    
    // 3. Köder-Informationen sammeln
    let chumHtml = "";
    if (chumPoints.length === 0) {
        chumHtml = "<i>Keine Köder platziert</i>";
    } else {
        chumHtml = "<ul style='margin: 0; padding-left: 20px;'>";
        chumPoints.forEach(c => {
            chumHtml += `<li>${c.icon} ${c.name} (${c.quantity}x)</li>`;
        });
        chumHtml += "</ul>";
    }
    
    // 4. Hai-Arten für den Bericht sammeln
    let sharkSpeciesHtml = "";
    const sharkCountMap = {};
    sharks.forEach(s => {
        const type = s.sharkType || "reef";
        sharkCountMap[type] = (sharkCountMap[type] || 0) + 1;
    });
    for (const [type, count] of Object.entries(sharkCountMap)) {
        const sharkType = sharkTypes[type] || sharkTypes.reef;
        sharkSpeciesHtml += `${count}x ${sharkType.name}<br>`;
    }
    
    // 5. HTML-Bericht zusammenbauen
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Tauchvorfall - Simulationsbericht</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 30px;
            background: #f0f4f8;
            color: #1a2a3a;
            line-height: 1.5;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #004466, #006699);
            color: white;
            padding: 25px 30px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
        }
        .header p {
            opacity: 0.85;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 20px 30px;
            border-radius: 8px;
            color: #856404;
            font-size: 13px;
        }
        .section {
            margin: 25px 30px;
            border-bottom: 1px solid #e0e4e8;
            padding-bottom: 20px;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #004466;
            margin-bottom: 15px;
            padding-left: 12px;
            border-left: 4px solid #006699;
        }
        .subsection-title {
            font-size: 16px;
            font-weight: 600;
            color: #006699;
            margin: 15px 0 10px 0;
            padding-left: 8px;
            border-left: 3px solid #88ccff;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 12px;
            margin: 10px 0;
        }
        .info-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #1e293b;
            word-break: break-word;
        }
        .confidence-badge {
            display: inline-block;
            background: #e2e8f0;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            color: #475569;
            margin-left: 8px;
        }
        .screenshot {
            text-align: center;
            margin: 20px 0;
            background: #f8fafc;
            padding: 15px;
            border-radius: 12px;
        }
        .screenshot img {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .log-box {
            background: #1a2a3a;
            color: #cbd5e1;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        .footer {
            background: #f1f5f9;
            padding: 15px 30px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        hr {
            margin: 15px 0;
            border: none;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🦈 TAUCHVORFALL - SIMULATIONSBERICHT</h1>
        <p>Erstellt am ${new Date().toLocaleString('de-DE')} | Simulationszeit: ${time.toFixed(1)} Sekunden</p>
    </div>

    <div class="warning">
        <strong>⚠️ Hinweis zu diesem Bericht</strong><br>
        Dieser Bericht wurde mit einer Open-Source-Simulationssoftware zur Vorfall-Rekonstruktion erstellt.
        Alle Positions- und Abstandsangaben sind NICHT als reale Messungen zu verstehen.
        Der Screenshot dient der visuellen Veranschaulichung der räumlichen Situation.
    </div>

    <!-- 1. SITUATION -->
    <div class="section">
        <div class="section-title">📸 1. SITUATION (SCREENSHOT)</div>
        <div class="screenshot">
            <img src="${screenshot}" alt="Simulations-Screenshot" />
        </div>
    </div>

    <!-- 2. DOKUMENTATION -->
    <div class="section">
        <div class="section-title">📋 2. DOKUMENTATION</div>
        
        <!-- 2.1 Ereignisidentifikation -->
        <div class="subsection-title">2.1 Ereignisidentifikation</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Vorfall-ID</div><div class="info-value">${documentationData.incidentId || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.incidentId)}</span></div></div>
            <div class="info-card"><div class="info-label">Datum & Uhrzeit</div><div class="info-value">${documentationData.datetime || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.datetime)}</span></div></div>
            <div class="info-card"><div class="info-label">Ort / GPS</div><div class="info-value">${documentationData.location || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.location)}</span></div></div>
            <div class="info-card"><div class="info-label">Tauchspot</div><div class="info-value">${documentationData.diveSite || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.diveSite)}</span></div></div>
        </div>

        <!-- 2.2 Umweltbedingungen -->
        <div class="subsection-title">2.2 Umweltbedingungen</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Wassertemperatur</div><div class="info-value">${documentationData.waterTemp || '-'} °C <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.waterTemp)}</span></div></div>
            <div class="info-card"><div class="info-label">Sichtweite</div><div class="info-value">${documentationData.visibility || '-'} m <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.visibility)}</span></div></div>
            <div class="info-card"><div class="info-label">Strömung</div><div class="info-value">${documentationData.current || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.current)}</span></div></div>
            <div class="info-card"><div class="info-label">Wassertiefe</div><div class="info-value">${documentationData.depth || '-'} m <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.depth)}</span></div></div>
            <div class="info-card"><div class="info-label">Wetter / Wellengang</div><div class="info-value">${documentationData.weather || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.weather)}</span></div></div>
        </div>

        <!-- 2.3 Teilnehmer -->
        <div class="subsection-title">2.3 Teilnehmer</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Anzahl Taucher</div><div class="info-value">${documentationData.diversTotal || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.diversTotal)}</span></div></div>
            <div class="info-card"><div class="info-label">Erfahrungsstufe</div><div class="info-value">${documentationData.experience || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.experience)}</span></div></div>
            <div class="info-card"><div class="info-label">Kameramann</div><div class="info-value">${documentationData.cameraman || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.cameraman)}</span></div></div>
        </div>

        <!-- 2.4 Hai(e) -->
        <div class="subsection-title">2.4 Hai(e)</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Hai-Art(en)</div><div class="info-value">${documentationData.sharkSpecies || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.sharkSpecies)}</span></div></div>
            <div class="info-card"><div class="info-label">Geschätzte Länge</div><div class="info-value">${documentationData.sharkSize || '-'} m <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.sharkSize)}</span></div></div>
            <div class="info-card"><div class="info-label">Verhalten</div><div class="info-value">${documentationData.sharkBehavior || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.sharkBehavior)}</span></div></div>
        </div>

        <!-- 2.5 Haikäfig & Ausrüstung -->
        <div class="subsection-title">2.5 Haikäfig & Ausrüstung</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Käfig-Modell</div><div class="info-value">${documentationData.cageModel || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.cageModel)}</span></div></div>
            <div class="info-card"><div class="info-label">Käfig-Zustand</div><div class="info-value">${documentationData.cageCondition || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.cageCondition)}</span></div></div>
            <div class="info-card"><div class="info-label">Sonstige Ausrüstung</div><div class="info-value">${documentationData.equipment || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.equipment)}</span></div></div>
        </div>

        <!-- 2.6 Vorfallbeschreibung -->
        <div class="subsection-title">2.6 Ablauf / Timeline</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Vorfallbeschreibung</div><div class="info-value">${documentationData.incidentDescription || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.incident)}</span></div></div>
        </div>

        <!-- 2.7 Verletzungen -->
        <div class="subsection-title">2.7 Verletzungen & medizinische Folgen</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Verletzungen</div><div class="info-value">${documentationData.injuries || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.injuries)}</span></div></div>
            <div class="info-card"><div class="info-label">Medizinische Versorgung</div><div class="info-value">${documentationData.medical || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.medical)}</span></div></div>
        </div>

        <!-- 2.8 Zeugen & Dokumentation -->
        <div class="subsection-title">2.8 Zeugen & Dokumentation</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Zeugen</div><div class="info-value">${documentationData.witnesses || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.witnesses)}</span></div></div>
            <div class="info-card"><div class="info-label">Fotos / Videos</div><div class="info-value">${documentationData.media || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.media)}</span></div></div>
        </div>

        <!-- 2.9 Sonstiges -->
        <div class="subsection-title">2.9 Sonstige Angaben</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Sonstiges</div><div class="info-value">${documentationData.additional || '-'} <span class="confidence-badge">${getConfidenceText(documentationData.confidence?.additional)}</span></div></div>
        </div>
    </div>

    <!-- 3. SIMULATIONS-EINSTELLUNGEN -->
    <div class="section">
        <div class="section-title">⚙️ 3. SIMULATIONS-EINSTELLUNGEN</div>
        <div class="info-grid">
            <div class="info-card"><div class="info-label">Taucher (aktuell)</div><div class="info-value">${divers.length}</div></div>
            <div class="info-card"><div class="info-label">Haie (aktuell)</div><div class="info-value">${sharks.length}</div></div>
            <div class="info-card"><div class="info-label">Hai-Arten</div><div class="info-value">${sharkSpeciesHtml || '-'}</div></div>
            <div class="info-card"><div class="info-label">Haikäfig</div><div class="info-value">${sharkCage ? 'Aktiviert' : 'Nicht aktiviert'}</div></div>
            <div class="info-card"><div class="info-label">Kameramann vorhanden</div><div class="info-value">${divers.some(d => d.isCameraman) ? 'Ja' : 'Nein'}</div></div>
            <div class="info-card"><div class="info-label">Formation</div><div class="info-value">${currentFormation || 'Halbkreis'}</div></div>
            <div class="info-card"><div class="info-label">Strömungsrichtung</div><div class="info-value">${currentDirection}°</div></div>
            <div class="info-card"><div class="info-label">Strömungsgeschwindigkeit</div><div class="info-value">${currentSpeed} Knoten</div></div>
            <div class="info-card"><div class="info-label">Köder / Chum</div><div class="info-value">${chumHtml}</div></div>
        </div>
    </div>

    <!-- 4. EREIGNIS-LOG -->
    <div class="section">
        <div class="section-title">📜 4. EREIGNIS-LOG</div>
        <div class="log-box">${logHtml || '<i>Keine Ereignisse protokolliert</i>'}</div>
    </div>

    <div class="footer">
        📄 Dieser Bericht kann mit Strg+P (Windows) / Cmd+P (Mac) als PDF gespeichert oder ausgedruckt werden.<br>
        Für technische Analysen und vollständige Wiederherstellung der Simulation steht der JSON-Export zur Verfügung.
    </div>
</div>
</body>
</html>`;
    
    // 6. Neuen Tab öffnen und Bericht anzeigen
    const berichtFenster = window.open();
    if (berichtFenster) {
        berichtFenster.document.write(html);
        berichtFenster.document.close();
        addToLog("📄 HTML-Bericht geöffnet");
    } else {
        alert("Popup wurde blockiert! Bitte erlaube Popups für diese Seite.");
    }
};
// =============== TOGGLE HAIKÄFIG ===============
function toggleHaikaefig() {
    const btn = document.getElementById("haikaefig-btn");

    if (sharkCage) {
        // Käfig entfernen
        sharkCage = null;
        if (started) {
            objects = [...divers, ...sharks];
        }
        btn.classList.remove("active");
        btn.textContent = "Haikäfig: AUS";
        addToLog("🦈 Haikäfig entfernt");
    } else {
        // Käfig erstellen
        const cageSize = 480;
        sharkCage = {
            x: canvas.width / 2 - cageSize / 2,
            y: canvas.height / 2 - cageSize / 2,
            size: cageSize,
            type: "cage"
        };

        if (started) {
            objects = [...divers, ...sharks, sharkCage];
        } else {
            objects = [sharkCage]; // Sicherstellen, dass er da ist
        }

        btn.classList.add("active");
        btn.textContent = "Haikäfig: EIN";
        addToLog("🦈 Großer Haikäfig erstellt (480px)");
    }

    // WICHTIG: Immer neu zeichnen, auch vor dem Start
    draw(0.016);
}
// ====================== LOG & JSON SYSTEM ======================
// ====================== EVENT LOG (rechts oben) ======================
// ====================== EVENT LOG (links oben) ======================
// ====================== LOG & JSON SYSTEM ======================
let logContentElement = null;
let logPanelCreated = false;

function addToLog(text) {
    // Erstelle das Panel nur einmal
    if (!logPanelCreated) {
        const logDiv = document.createElement('div');
        logDiv.id = 'eventLog';
        logDiv.innerHTML = `
            <h4>📜 Event-Log</h4>
            <div id="logContent" style="max-height: 420px; overflow-y: auto;"></div>
        `;
        
        // Positionierung: Links oben
        logDiv.style.position = "fixed";
        logDiv.style.top = "20px";
        logDiv.style.left = "20px";
        logDiv.style.width = "310px";
        logDiv.style.background = "rgba(0, 25, 45, 0.95)";
        logDiv.style.border = "2px solid #00aaff";
        logDiv.style.borderRadius = "8px";
        logDiv.style.padding = "12px 14px";
        logDiv.style.zIndex = "10000";
        logDiv.style.boxShadow = "0 4px 25px rgba(0,0,0,0.7)";
        logDiv.style.color = "#ddd";
        logDiv.style.fontSize = "13.8px";
        logDiv.style.lineHeight = "1.35";
        logDiv.style.display = "block";  // Am Anfang sichtbar
        
        document.body.appendChild(logDiv);
        logContentElement = document.getElementById('logContent');
        logPanelCreated = true;
    }

    const timeStr = new Date().toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    logContentElement.innerHTML += `<strong>${timeStr}</strong> → ${text}<br>`;
    logContentElement.scrollTop = logContentElement.scrollHeight;
}

// =============== SURFER / LOG TOGGLE ===============
function toggleSurfer() {
    const logPanel = document.getElementById('eventLog');
    const btn = document.getElementById("surfer-btn");
    
    if (!logPanel) {
        console.error("EventLog-Panel nicht gefunden!");
        return;
    }
    
    // Toggle ein/aus
    if (logPanel.style.display === "none") {
        logPanel.style.display = "block";
        if (btn) btn.textContent = "🏄 Log: EIN";
    } else {
        logPanel.style.display = "none";
        if (btn) btn.textContent = "🏄 Log: AUS";
    }
}
// ==================== SPEICHERN ====================
// ====================== DOKUMENTATION ÖFFNEN ======================

// ====================== DOKUMENTATION ÖFFNEN / SCHLIESSEN ======================
window.openDocumentation = function () {
    let modal = document.getElementById('docModal');
    const btn = document.querySelector("button[onclick='openDocumentation()']");
    
    if (!modal) {
        // Modal existiert noch nicht → erstellen
        modal = document.createElement('div');
        modal.id = 'docModal';
        
        modal.innerHTML = `
            <h2>📋 Haiunfall / Käfig-Vorfall Dokumentation</h2>
            
<div style="font-size:13px; color:#aaa; margin-bottom:15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 3px solid #88aaff;">
    <strong>💡 Hinweis zur Sicherheitsbewertung:</strong><br>
    Bei Hai-Begegnungen können Stress, schlechte Sicht oder die Anzahl der Haie die Wahrnehmung beeinflussen.<br>
    <span style="font-size:12px;">📊 4 = sehr sicher &nbsp;|&nbsp; 3 = eher sicher &nbsp;|&nbsp; 2 = unsicher &nbsp;|&nbsp; 1 = sehr unsicher &nbsp;|&nbsp; 0 = keine Angabe</span>
</div>

            <!-- A. Ereignisidentifikation -->
            <div class="modal-section">
                <h2>1. Ereignisidentifikation</h2>
                <div class="modal-label">Vorfall-ID</div>
                <input type="text" id="doc_incident_id" class="modal-input" placeholder="z.B. HA-2026-EGY-001">
                <select id="conf_incident_id" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Datum & Uhrzeit des Vorfalls</div>
                <input type="text" id="doc_datetime" class="modal-input" value="${new Date().toLocaleString('de-DE')}">
                <select id="conf_datetime" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Ort / GPS-Koordinaten</div>
                <input type="text" id="doc_location" class="modal-input" placeholder="z.B. Marsa Alam, 25.1234°N 34.5678°E">
                <select id="conf_location" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Tauchspot / Name der Stelle</div>
                <input type="text" id="doc_dive_site" class="modal-input" placeholder="z.B. Elphinstone Reef">
                <select id="conf_dive_site" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- B. Umweltbedingungen -->
            <div class="modal-section">
                <h2>2. Umweltbedingungen</h2>
                <div class="modal-label">Wassertemperatur (°C)</div>
                <input type="text" id="doc_water_temp" class="modal-input">
                <select id="conf_water_temp" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Sichtweite (Meter)</div>
                <input type="text" id="doc_visibility" class="modal-input">
                <select id="conf_visibility" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Strömung (Stärke + Richtung)</div>
                <input type="text" id="doc_current" class="modal-input" placeholder="z.B. stark, nordwärts">
                <select id="conf_current" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Wassertiefe beim Vorfall (m)</div>
                <input type="text" id="doc_depth" class="modal-input">
                <select id="conf_depth" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Wetter / Wellengang</div>
                <input type="text" id="doc_weather" class="modal-input">
                <select id="conf_weather" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- C. Teilnehmer -->
            <div class="modal-section">
                <h2>3. Teilnehmer</h2>
                <div class="modal-label">Anzahl Taucher insgesamt</div>
                <input type="number" id="doc_divers_total" class="modal-input" value="${divers.length}">
                <select id="conf_divers_total" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Erfahrungsstufe der Gruppe</div>
                <input type="text" id="doc_experience" class="modal-input" placeholder="z.B. 5 Open Water, 2 Advanced">
                <select id="conf_experience" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Kameramann vorhanden?</div>
                <select id="doc_cameraman" class="modal-input">
                    <option value="">-- Bitte wählen --</option>
                    <option value="ja">Ja</option>
                    <option value="nein">Nein</option>
                </select>
                <select id="conf_cameraman" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- D. Hai(e) -->
            <div class="modal-section">
                <h2>4. Hai(e)</h2>
                <div class="modal-label">Hai-Art(en)</div>
                <input type="text" id="doc_shark_species" class="modal-input" placeholder="z.B. Weißspitzen-Riffhai, 1 Tigerhai">
                <select id="conf_shark_species" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Geschätzte Länge (Meter)</div>
                <input type="text" id="doc_shark_size" class="modal-input">
                <select id="conf_shark_size" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Anzahl der Haie</div>
                <input type="number" id="doc_shark_count" class="modal-input" value="${sharks.length}">
                <select id="conf_shark_count" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Verhalten vor dem Vorfall</div>
                <textarea id="doc_shark_behavior" class="modal-textarea" rows="3" placeholder="z.B. neugierig, kreisend, aggressiv..."></textarea>
                <select id="conf_shark_behavior" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- E. Ausrüstung / Haikäfig -->
            <div class="modal-section">
                <h2>5. Haikäfig & Ausrüstung</h2>
                <div class="modal-label">Käfig-Modell / Hersteller</div>
                <input type="text" id="doc_cage_model" class="modal-input">
                <select id="conf_cage_model" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Käfig-Maße (L×B×H)</div>
                <input type="text" id="doc_cage_size" class="modal-input">
                <select id="conf_cage_size" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Zustand des Käfigs</div>
                <input type="text" id="doc_cage_condition" class="modal-input" placeholder="z.B. intakt, verbogen, Tür defekt">
                <select id="conf_cage_condition" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Sonstige Ausrüstung (besonders relevant)</div>
                <textarea id="doc_equipment" class="modal-textarea" rows="2"></textarea>
                <select id="conf_equipment" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- J. Vorfallbeschreibung -->
            <div class="modal-section">
                <h2>6. Genauer Ablauf des Vorfalls (Timeline)</h2>
                <textarea id="doc_incident_description" class="modal-textarea" rows="6" placeholder="Chronologischer Ablauf..."></textarea>
                <select id="conf_incident" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- K. Verletzungen -->
            <div class="modal-section">
                <h2>7. Verletzungen & medizinische Folgen</h2>
                <textarea id="doc_injuries" class="modal-textarea" rows="5" placeholder="Art, Schwere, betroffene Körperteile..."></textarea>
                <select id="conf_injuries" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Erste Hilfe / Krankenhaus</div>
                <textarea id="doc_medical" class="modal-textarea" rows="3"></textarea>
                <select id="conf_medical" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- L. Zeugen & Dokumentation -->
            <div class="modal-section">
                <h2>8. Zeugen & Dokumentation</h2>
                <textarea id="doc_witnesses" class="modal-textarea" rows="3" placeholder="Namen / Positionen der Zeugen"></textarea>
                <select id="conf_witnesses" class="modal-confidence">${createConfidenceOptions()}</select>

                <div class="modal-label">Fotos / Videos vorhanden?</div>
                <input type="text" id="doc_media" class="modal-input" placeholder="Ja/Nein + Beschreibung">
                <select id="conf_media" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <!-- M. Sonstiges -->
            <div class="modal-section">
                <h2>9. Sonstige wichtige Angaben</h2>
                <textarea id="doc_additional" class="modal-textarea" rows="4" placeholder="Alles weitere, was relevant sein könnte..."></textarea>
                <select id="conf_additional" class="modal-confidence">${createConfidenceOptions()}</select>
            </div>

            <div style="text-align:right; margin-top:30px;">
                <button onclick="saveDocumentation()" style="background:#00b894; padding:12px 28px; margin-right:12px; font-size:16px;">💾 Alles Speichern</button>
                <button onclick="closeDocumentation()" style="background:#666; padding:12px 28px; font-size:16px;">Abbrechen</button>
            </div>
        `;

        document.body.appendChild(modal);
    }
    
    // TOGGLE: Wenn Modal sichtbar → ausblenden, sonst einblenden
    if (modal.style.display === "block") {
        modal.style.display = "none";
        if (btn) btn.textContent = "📋 Dokumentation";
    } else {
        // Gespeicherte Daten laden
        loadDocumentationData();
        modal.style.display = "block";
        if (btn) btn.textContent = "📋 Dokumentation ✖";
    }
};
// ==================== CONFIDENCE OPTIONS ====================

// ==================== CONFIDENCE OPTIONS (4-Stufen-Skala) ====================
// ==================== CONFIDENCE OPTIONS (4-Stufen-Skala, absteigend) ====================
function createConfidenceOptions() {
    let options = '<option value="0">-- Keine Angabe --</option>';
    options += '<option value="4">4 - Sehr sicher (direkte Beobachtung, klare Erinnerung)</option>';
    options += '<option value="3">3 - Eher sicher (kleine Unsicherheiten)</option>';
    options += '<option value="2">2 - Unsicher (Lücken, Stress, schlechte Sicht)</option>';
    options += '<option value="1">1 - Sehr unsicher (Rekonstruktion / Erinnerungslücken)</option>';
    return options;
}

// ==================== SPEICHERN ====================
window.saveDocumentation = function () {
    documentationData = {
        incidentId: document.getElementById('doc_incident_id')?.value || '',
        datetime: document.getElementById('doc_datetime')?.value || '',
        location: document.getElementById('doc_location')?.value || '',
        diveSite: document.getElementById('doc_dive_site')?.value || '',
        waterTemp: document.getElementById('doc_water_temp')?.value || '',
        visibility: document.getElementById('doc_visibility')?.value || '',
        current: document.getElementById('doc_current')?.value || '',
        depth: document.getElementById('doc_depth')?.value || '',
        weather: document.getElementById('doc_weather')?.value || '',
        diversTotal: document.getElementById('doc_divers_total')?.value || '',
        experience: document.getElementById('doc_experience')?.value || '',
        cameraman: document.getElementById('doc_cameraman')?.value || '',
        sharkSpecies: document.getElementById('doc_shark_species')?.value || '',
        sharkSize: document.getElementById('doc_shark_size')?.value || '',
        sharkCount: document.getElementById('doc_shark_count')?.value || '',
        sharkBehavior: document.getElementById('doc_shark_behavior')?.value || '',
        cageModel: document.getElementById('doc_cage_model')?.value || '',
        cageSize: document.getElementById('doc_cage_size')?.value || '',
        cageCondition: document.getElementById('doc_cage_condition')?.value || '',
        equipment: document.getElementById('doc_equipment')?.value || '',
        incidentDescription: document.getElementById('doc_incident_description')?.value || '',
        injuries: document.getElementById('doc_injuries')?.value || '',
        medical: document.getElementById('doc_medical')?.value || '',
        witnesses: document.getElementById('doc_witnesses')?.value || '',
        media: document.getElementById('doc_media')?.value || '',
        additional: document.getElementById('doc_additional')?.value || '',

        confidence: {
            incidentId: document.getElementById('conf_incident_id')?.value || '',
            datetime: document.getElementById('conf_datetime')?.value || '',
            location: document.getElementById('conf_location')?.value || '',
            diveSite: document.getElementById('conf_dive_site')?.value || '',
            waterTemp: document.getElementById('conf_water_temp')?.value || '',
            visibility: document.getElementById('conf_visibility')?.value || '',
            current: document.getElementById('conf_current')?.value || '',
            depth: document.getElementById('conf_depth')?.value || '',
            weather: document.getElementById('conf_weather')?.value || '',
            diversTotal: document.getElementById('conf_divers_total')?.value || '',
            experience: document.getElementById('conf_experience')?.value || '',
            cameraman: document.getElementById('conf_cameraman')?.value || '',
            sharkSpecies: document.getElementById('conf_shark_species')?.value || '',
            sharkSize: document.getElementById('conf_shark_size')?.value || '',
            sharkCount: document.getElementById('conf_shark_count')?.value || '',
            sharkBehavior: document.getElementById('conf_shark_behavior')?.value || '',
            cageModel: document.getElementById('conf_cage_model')?.value || '',
            cageSize: document.getElementById('conf_cage_size')?.value || '',
            cageCondition: document.getElementById('conf_cage_condition')?.value || '',
            equipment: document.getElementById('conf_equipment')?.value || '',
            incident: document.getElementById('conf_incident')?.value || '',
            injuries: document.getElementById('conf_injuries')?.value || '',
            medical: document.getElementById('conf_medical')?.value || '',
            witnesses: document.getElementById('conf_witnesses')?.value || '',
            media: document.getElementById('conf_media')?.value || '',
            additional: document.getElementById('conf_additional')?.value || ''
        }
    };

    addToLog("✅ Hai-Bericht gespeichert");
    closeDocumentation();
};

function loadDocumentationData() {
    if (!documentationData) return;
    const fields = {
        'doc_incident_id': documentationData.incidentId,
        'doc_datetime': documentationData.datetime,
        'doc_location': documentationData.location,
        'doc_dive_site': documentationData.diveSite,
        'doc_water_temp': documentationData.waterTemp,
        'doc_visibility': documentationData.visibility,
        'doc_current': documentationData.current,
        'doc_depth': documentationData.depth,
        'doc_weather': documentationData.weather,
        'doc_divers_total': documentationData.diversTotal,
        'doc_experience': documentationData.experience,
        'doc_cameraman': documentationData.cameraman,
        'doc_shark_species': documentationData.sharkSpecies,
        'doc_shark_size': documentationData.sharkSize,
        'doc_shark_count': documentationData.sharkCount,
        'doc_shark_behavior': documentationData.sharkBehavior,
        'doc_cage_model': documentationData.cageModel,
        'doc_cage_size': documentationData.cageSize,
        'doc_cage_condition': documentationData.cageCondition,
        'doc_equipment': documentationData.equipment,
        'doc_incident_description': documentationData.incidentDescription,
        'doc_injuries': documentationData.injuries,
        'doc_medical': documentationData.medical,
        'doc_witnesses': documentationData.witnesses,
        'doc_media': documentationData.media,
        'doc_additional': documentationData.additional
    };

    Object.keys(fields).forEach(id => {
        const el = document.getElementById(id);
        if (el && fields[id] !== undefined) el.value = fields[id];
    });

    // Confidence-Werte laden
    if (documentationData.confidence) {
        Object.keys(documentationData.confidence).forEach(key => {
            const el = document.getElementById('conf_' + key);
            if (el) el.value = documentationData.confidence[key];
        });
    }
}

window.closeDocumentation = function () {
    const modal = document.getElementById('docModal');
    if (modal) modal.style.display = 'none';
};
// ==================== JSON EXPORT (verbessert) ====================
// ==================== JSON EXPORT ====================
// ==================== JSON EXPORT (vollständig + Boot) ====================
// ==================== JSON EXPORT (mit Köder-Info) ====================
window.exportToJSON = function () {
    // Sammle Köder-Info (vereinfacht für Berichte)
    let chumInfo = {
        used: chumPoints.length > 0,
        types: [],
        typeNames: [],
        totalQuantity: 0,
        placedAtCage: false
    };
    
    // Köder-Typ Namen für Berichte
    const typeNamesMap = {
        fish: "Fischstücke",
        oil: "Fischöl",
        whole: "Ganzer Fisch"
    };
    
    chumPoints.forEach(chum => {
        // Köder-Typ sammeln (ohne Duplikate)
        if (!chumInfo.types.includes(chum.type)) {
            chumInfo.types.push(chum.type);
            chumInfo.typeNames.push(typeNamesMap[chum.type] || chum.type);
        }
        // Gesamtmenge
        chumInfo.totalQuantity += chum.quantity;
        // Prüfen ob Köder am Käfig platziert wurde
        if (sharkCage) {
            const cageCenterX = sharkCage.x + sharkCage.size / 2;
            const cageCenterY = sharkCage.y + sharkCage.size / 2;
            const distToCage = Math.hypot(chum.x - cageCenterX, chum.y - cageCenterY);
            if (distToCage < 100) {
                chumInfo.placedAtCage = true;
            }
        }
    });
    
    const data = {
        exportTimestamp: new Date().toISOString(),
        simulationTime: time.toFixed(1) + "s",
        diversCount: divers.length,
        sharksCount: sharks.length,
        documentation: documentationData || {},

        // =============== KÖDER-INFO (NEU) ===============
        chum: chumInfo,

        // =============== STRÖMUNGSDATEN ===============
        current: {
            direction: currentDirection,
            speed: currentSpeed
        },

        // Taucher mit Position und Winkel
        divers: divers.map(d => ({
            id: d.id,
            x: Math.round(d.x),
            y: Math.round(d.y),
            isCameraman: !!d.isCameraman,
            angle: d.angle || 0
        })),

        // Haie mit Position und Winkel
        sharks: sharks.map(s => ({
            id: s.id,
            sharkType: s.sharkType || "reef",
            x: Math.round(s.x),
            y: Math.round(s.y),
            angle: s.angle || 0
        })),

        // Boot-Position
        boat: {
            x: Math.round(boat.x),
            y: Math.round(boat.y)
        },

        // Haikäfig
        sharkCage: sharkCage
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `haibericht ${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();

    // Log mit Köder-Info
    let chumLogText = "";
    if (chumInfo.used) {
        chumLogText = `, Köder: ${chumInfo.typeNames.join(", ")} (${chumInfo.totalQuantity}x)`;
        if (chumInfo.placedAtCage) chumLogText += " am Käfig";
    }
    addToLog(`✅ JSON Export erstellt (Strömung: ${currentDirection}° / ${currentSpeed} kn, ${divers.length} Taucher, ${sharks.length} Haie${chumLogText})`);
};
// ==================== JSON IMPORT (Positionen exakt wiederherstellen) ====================
// ==================== JSON IMPORT (Positionen exakt + Boot) ====================
// ==================== JSON IMPORT (mit Köder-Wiederherstellung) ====================
window.importFromJSON = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);

                // 1. Dokumentation wiederherstellen
                if (data.documentation) {
                    documentationData = data.documentation;
                }

                // =============== STRÖMUNGSDATEN WIEDERHERSTELLEN ===============
                if (data.current) {
                    currentDirection = data.current.direction || 0;
                    currentSpeed = data.current.speed || 0;
                    
                    const dirSlider = document.getElementById("test-dir-slider");
                    const spdSlider = document.getElementById("test-spd-slider");
                    if (dirSlider) dirSlider.value = currentDirection;
                    if (spdSlider) spdSlider.value = currentSpeed;
                    
                    const rad = currentDirection * Math.PI / 180;
                    const speedPixels = currentSpeed * 8;
                    currentFlowX = Math.cos(rad) * speedPixels;
                    currentFlowY = Math.sin(rad) * speedPixels;
                    
                    const dirValue = document.getElementById("test-dir-value");
                    const spdValue = document.getElementById("test-spd-value");
                    const output = document.getElementById("test-output");
                    if (dirValue) dirValue.innerText = currentDirection + "°";
                    if (spdValue) spdValue.innerText = currentSpeed.toFixed(1);
                    if (output) {
                        output.innerHTML = `<strong>📊 Strömungsdaten:</strong><br>🔄 Importiert: ${currentDirection}° / ${currentSpeed} kn`;
                        setTimeout(() => {
                            if (dirSlider && spdSlider) {
                                dirSlider.dispatchEvent(new Event('input'));
                            }
                        }, 100);
                    }
                    
                    addToLog(`🌊 Strömung importiert: ${currentDirection}° / ${currentSpeed} Knoten`);
                }

                // =============== KÖDER-INFO IMPORTIEREN (NEU) ===============
                if (data.chum && data.chum.used) {
                    addToLog(`🪣 Köder-Info importiert: ${data.chum.typeNames.join(", ")} (${data.chum.totalQuantity}x)${data.chum.placedAtCage ? " am Käfig" : ""}`);
                    addToLog(`💡 Hinweis: Köder müssen manuell neu platziert werden (Positionen nicht im Export)`);
                }

                // 2. Simulation wiederherstellen
                if (data.divers && data.sharks) {
                    if (!started) {
                        document.getElementById("setup").style.display = "none";
                        document.getElementById("hud").style.display = "block";
                        document.getElementById("color-picker").style.display = "block";
                        started = true;
                    }

                    // Taucher exakt wiederherstellen
                    divers = data.divers.map(d => ({
                        id: d.id,
                        x: d.x || 0,
                        y: d.y || 0,
                        type: "diver",
                        bob: Math.random() * Math.PI * 2,
                        angle: d.angle || 0,
                        stressed: false,
                        isCameraman: !!d.isCameraman
                    }));

                    // Haie exakt wiederherstellen
                    sharks = data.sharks.map(s => ({
                        id: s.id,
                        x: s.x || 150 + Math.random() * 300,
                        y: s.y || 200 + Math.random() * 300,
                        type: "shark",
                        sharkType: s.sharkType || "reef",
                        angle: s.angle || Math.random() * Math.PI * 2,
                        size: sharkTypes[s.sharkType || "reef"]?.size || 1.0,
                        color: sharkTypes[s.sharkType || "reef"]?.color || "#5a7d9a"
                    }));

                    // Boot-Position wiederherstellen
                    if (data.boat) {
                        boat.x = data.boat.x || 350;
                        boat.y = data.boat.y || 140;
                    }

                    // Haikäfig
                    sharkCage = data.sharkCage || null;

                    // Objects aktualisieren
                    objects = [...divers, ...sharks];
                    if (sharkCage) objects.push(sharkCage);

                    // Formation-Center aktualisieren
                    if (divers.length > 0) {
                        formationCenterX = Math.round(
                            divers.reduce((sum, d) => sum + d.x, 0) / divers.length
                        );
                        formationCenterY = Math.round(
                            divers.reduce((sum, d) => sum + d.y, 0) / divers.length
                        );
                    }

                    addToLog(`✅ Simulation exakt importiert (${divers.length} Taucher, ${sharks.length} Haie)`);
                }

                // 3. Dokumentation ins Modal laden
                if (document.getElementById('docModal')) {
                    loadDocumentationData();
                }

                // Sofort neu zeichnen
                draw(0.016);

                addToLog(`✅ JSON-Import erfolgreich (${new Date(data.exportTimestamp).toLocaleString('de-DE')})`);

            } catch (err) {
                console.error(err);
                alert("Import-Fehler: Ungültige JSON-Datei\n\n" + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// =============== SCHRITT 6: NEUTRALE STRÖMUNGSANALYSE ===============
let currentDirection = 0;
let currentSpeed = 0;
let currentFlowX = 0;
let currentFlowY = 0;

// Neutrale Strömungswiderstands-Faktoren
const FLOW_FACTORS = {
    diver: 0.7,
    shark: 0.4,
    smallFish: 0.85,
    boat: 0.1
};

function initTestCurrent() {
    const dirSlider = document.getElementById("test-dir-slider");
    const spdSlider = document.getElementById("test-spd-slider");
    const dirValue = document.getElementById("test-dir-value");
    const spdValue = document.getElementById("test-spd-value");
    const output = document.getElementById("test-output");
    
    if (!dirSlider) return;
    
    // Neutrale Richtungstexte (nur Fakten)
    function getDirectionText(deg) {
        if (deg >= 348.75 || deg < 11.25) return "Norden ↑ (zur Oberfläche)";
        if (deg >= 11.25 && deg < 33.75) return "Nord-Nordosten ↗";
        if (deg >= 33.75 && deg < 56.25) return "Nordosten ↗";
        if (deg >= 56.25 && deg < 78.75) return "Ost-Nordosten ↗";
        if (deg >= 78.75 && deg < 101.25) return "Osten →";
        if (deg >= 101.25 && deg < 123.75) return "Ost-Südosten ↘";
        if (deg >= 123.75 && deg < 146.25) return "Südosten ↘";
        if (deg >= 146.25 && deg < 168.75) return "Süd-Südosten ↘";
        if (deg >= 168.75 && deg < 191.25) return "Süden ↓ (in die Tiefe)";
        if (deg >= 191.25 && deg < 213.75) return "Süd-Südwesten ↙";
        if (deg >= 213.75 && deg < 236.25) return "Südwesten ↙";
        if (deg >= 236.25 && deg < 258.75) return "West-Südwesten ↙";
        if (deg >= 258.75 && deg < 281.25) return "Westen ←";
        if (deg >= 281.25 && deg < 303.75) return "West-Nordwesten ↖";
        if (deg >= 303.75 && deg < 326.25) return "Nordwesten ↖";
        return "Nord-Nordwesten ↖";
    }
    
    // Neutrale Geschwindigkeitstexte (nur Messwerte)
    function getSpeedText(knots) {
        if (knots === 0) return "0 Knoten - keine Strömung";
        if (knots < 1) return `${knots.toFixed(1)} Knoten - sehr schwach`;
        if (knots < 2) return `${knots.toFixed(1)} Knoten - schwach`;
        if (knots < 3) return `${knots.toFixed(1)} Knoten - mäßig`;
        if (knots < 4) return `${knots.toFixed(1)} Knoten - deutlich`;
        if (knots < 5) return `${knots.toFixed(1)} Knoten - stark`;
        if (knots < 6) return `${knots.toFixed(1)} Knoten - sehr stark`;
        if (knots < 7) return `${knots.toFixed(1)} Knoten - extrem stark 1`;
        if (knots < 8) return `${knots.toFixed(1)} Knoten - extrem stark 2`;
        return `${knots.toFixed(1)} Knoten - maximal`;
    }
    
    // Neutrale Effektbeschreibung (nur physikalische Fakten)
    function getPhysicalEffect(deg, knots) {
        if (knots === 0) return "keine Bewegung";
        
        const isUpward = (deg >= 348.75 || deg < 11.25) || (deg >= 303.75 && deg < 348.75) || (deg >= 11.25 && deg < 78.75);
        const isDownward = (deg >= 168.75 && deg < 258.75) || (deg >= 101.25 && deg < 168.75) || (deg >= 258.75 && deg < 303.75);
        
        if (isUpward && knots > 4) return `vertikale Aufwärtsbewegung: ${(knots * 0.4).toFixed(1)} m/s`;
        if (isUpward && knots > 0) return `leichte Aufwärtsbewegung: ${(knots * 0.3).toFixed(1)} m/s`;
        
        if (isDownward && knots > 4) return `vertikale Abwärtsbewegung: ${(knots * 0.4).toFixed(1)} m/s`;
        if (isDownward && knots > 0) return `leichte Abwärtsbewegung: ${(knots * 0.3).toFixed(1)} m/s`;
        
        return `horizontale Bewegung: ${(knots * 0.5).toFixed(1)} m/s`;
    }
    
    function updateCurrentVectors() {
        const rad = currentDirection * Math.PI / 180;
        const speedPixels = currentSpeed * 8;
        currentFlowX = Math.cos(rad) * speedPixels;
        currentFlowY = Math.sin(rad) * speedPixels;
    }
    
    function update() {
        const dir = parseInt(dirSlider.value);
        const spd = parseFloat(spdSlider.value);
        
        currentDirection = dir;
        currentSpeed = spd;
        updateCurrentVectors();
        
        dirValue.innerText = dir + "°";
        spdValue.innerText = spd.toFixed(1);
        
        // Nur neutrale Fakten anzeigen
        output.innerHTML = `
            <strong>📊 Strömungsdaten:</strong><br>
            🧭 Richtung: ${getDirectionText(dir)}<br>
            💨 Geschwindigkeit: ${getSpeedText(spd)}<br>
            🌊 Physikalischer Effekt: ${getPhysicalEffect(dir, spd)}
        `;
        
        // Farbe nur nach Stärke (neutral: blau = schwach, rot = stark)
        if (spd >= 7) output.style.color = "#ff6666";
        else if (spd >= 5) output.style.color = "#ffaa66";
        else if (spd >= 3) output.style.color = "#ffcc66";
        else if (spd >= 1) output.style.color = "#88aaff";
        else output.style.color = "#88ff88";
    }
    
    dirSlider.addEventListener("input", update);
    spdSlider.addEventListener("input", update);
    
    update();
    console.log("✅ Schritt 6 - Neutrale Strömungsanzeige aktiv!");
}

// =============== VISUELLE STRÖMUNGSPFEILE ===============
function drawCurrentArrows() {
    if (currentSpeed === 0) return;
    
    const rad = currentDirection * Math.PI / 180;
    const arrowLength = 30 + currentSpeed * 3;
    const arrowCount = Math.max(6, Math.floor(8 + currentSpeed / 2));
    
    ctx.save();
    ctx.globalAlpha = Math.min(0.5, 0.15 + currentSpeed / 15);
    ctx.strokeStyle = "#88ccff";
    ctx.fillStyle = "#88ccff";
    ctx.lineWidth = Math.min(2.5, 1.5 + currentSpeed / 10);
    
    for (let i = 0; i < arrowCount; i++) {
        const x = (Date.now() * 0.05 + i * 120) % (canvas.width + 200) - 100;
        const y = 80 + i * 65 + (Math.sin(Date.now() * 0.002 + i) * 15);
        
        const dx = Math.cos(rad) * arrowLength;
        const dy = Math.sin(rad) * arrowLength;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        
        const angle = rad;
        const headSize = 7 + currentSpeed / 4;
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx - Math.cos(angle - 0.4) * headSize, y + dy - Math.sin(angle - 0.4) * headSize);
        ctx.lineTo(x + dx - Math.cos(angle + 0.4) * headSize, y + dy - Math.sin(angle + 0.4) * headSize);
        ctx.fill();
    }
    
    ctx.restore();
}

// =============== STRÖMUNG AUF OBJEKTE ===============
function applyCurrentToObjects(dt) {
    if (currentSpeed === 0) return;
    
    divers.forEach(diver => {
        diver.x += currentFlowX * FLOW_FACTORS.diver * dt;
        diver.y += currentFlowY * FLOW_FACTORS.diver * dt;
        diver.x = Math.max(30, Math.min(canvas.width - 30, diver.x));
        diver.y = Math.max(50, Math.min(canvas.height - 50, diver.y));
    });
    
    sharks.forEach(shark => {
        shark.x += currentFlowX * FLOW_FACTORS.shark * dt;
        shark.y += currentFlowY * FLOW_FACTORS.shark * dt;
        shark.x = Math.max(30, Math.min(canvas.width - 30, shark.x));
        shark.y = Math.max(50, Math.min(canvas.height - 50, shark.y));
    });
}

function applyCurrentToSmallFish(dt) {
    if (currentSpeed === 0) return;
    
    smallFish.forEach(fish => {
        fish.x += currentFlowX * FLOW_FACTORS.smallFish * dt;
        fish.y += currentFlowY * FLOW_FACTORS.smallFish * dt;
        fish.x = Math.max(-150, Math.min(canvas.width + 150, fish.x));
        fish.y = Math.max(20, Math.min(canvas.height - 30, fish.y));
    });
}

function applyCurrentToBoat(dt) {
    if (currentSpeed === 0) return;
    
    boat.x += currentFlowX * FLOW_FACTORS.boat * dt;
    boat.y += currentFlowY * FLOW_FACTORS.boat * dt;
    boat.x = Math.max(50, Math.min(canvas.width - 50, boat.x));
    boat.y = Math.max(50, Math.min(canvas.height - 50, boat.y));
}

// =============== UPDATE-FUNKTION ===============
const originalUpdate = update;

update = function(dt) {
    if (originalUpdate) originalUpdate(dt);
    applyCurrentToObjects(dt);
    applyCurrentToSmallFish(dt);
    applyCurrentToBoat(dt);
};

// =============== DRAW-FUNKTION ===============
const originalDraw = draw;

draw = function(dt) {
    if (shakeIntensity > 0) {
        ctx.save();
        ctx.translate(
            (Math.random() - 0.5) * shakeIntensity * 10,
            (Math.random() - 0.5) * shakeIntensity * 10
        );
    }

    drawBackground();
    drawBubbles(dt);
    drawDistanceLines();
    divers.forEach(drawDiver);
    sharks.forEach(drawShark);
    drawSmallFish();
    if (sharkCage) drawSharkCage();
    drawBoat();
    drawSelection();
    drawCurrentArrows();
    
    if (shakeIntensity > 0) ctx.restore();
};

// Start
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTestCurrent);
} else {
    initTestCurrent();
}
// =============== CHUM / KÖDER SYSTEM ===============

// Globale Variablen für Köder
let chumPoints = [];
let selectedChum = null;
let isDraggingChum = false;
let chumDragOffsetX = 0;
let chumDragOffsetY = 0;

// Köder-Typen mit neutralen Eigenschaften
const chumTypes = {
    fish: {
        name: "Fischstücke",
        icon: "🐟",
        color: "#cc5555",
        scentStrength: 3,
        radius: 80
    },
    
    oil: {
        name: "Fischöl",
        icon: "🛢️",
        color: "#88aa44",
        scentStrength: 4,
        radius: 120
    },
    whole: {
        name: "Ganzer Fisch",
        icon: "🐟",
        color: "#aa8844",
        scentStrength: 4,
        radius: 100
    }
};

// Köder hinzufügen
function addChum(type, x, y, quantity = 1) {
    const chumType = chumTypes[type];
    if (!chumType) return;
    
    const newChum = {
        id: Date.now() + Math.random(),
        type: type,
        quantity: quantity,
        x: x,
        y: y,
        name: chumType.name,
        icon: chumType.icon,
        color: chumType.color,
        scentStrength: chumType.scentStrength,
        radius: chumType.radius,
        createdAt: time
    };
    
    chumPoints.push(newChum);
    updateChumList();
    addToLog(`🪣 ${chumType.name} (${quantity}x) platziert an Position (${Math.round(x)}, ${Math.round(y)})`);
    
    return newChum;
}

// Chum-Liste im HUD aktualisieren
function updateChumList() {
    const listDiv = document.getElementById("chum-list");
    if (!listDiv) return;
    
    if (chumPoints.length === 0) {
        listDiv.innerHTML = '<span style="opacity: 0.5;">Keine Köder platziert</span>';
        return;
    }
    
    // Berechne Entfernung zum Käfig (falls vorhanden)
    const cage = sharkCage;
    let html = '';
    
    chumPoints.forEach(c => {
        let distanceText = '';
        if (cage) {
            const cageCenterX = cage.x + cage.size / 2;
            const cageCenterY = cage.y + cage.size / 2;
            const distToCage = Math.hypot(c.x - cageCenterX, c.y - cageCenterY);
            const distMeters = (distToCage / 6).toFixed(1);
            distanceText = ` | 📏 ${distMeters}m zum Käfig`;
        }
        
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span>${c.icon} ${c.name} (${c.quantity}x)${distanceText}</span>
                <button onclick="removeChum(${c.id})" style="width: auto; padding: 2px 8px; margin: 0; font-size: 10px;">✖</button>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}

// Einzelnen Köder entfernen
function removeChum(id) {
    const index = chumPoints.findIndex(c => c.id === id);
    if (index !== -1) {
        const removed = chumPoints[index];
        chumPoints.splice(index, 1);
        updateChumList();
        addToLog(`🗑️ Köder entfernt: ${removed.name}`);
    }
}

// Alle Köder entfernen
function clearAllChum() {
    if (chumPoints.length > 0) {
        addToLog(`🗑️ Alle ${chumPoints.length} Köder entfernt`);
        chumPoints = [];
        updateChumList();
    }
}

// Berechne Distanz zwischen zwei Punkten
function getChumDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// Berechne den Einfluss eines Köders auf einen Hai
function getChumInfluence(shark, chum) {
    const distance = getChumDistance(shark, chum);
    if (distance > chum.radius) return 0;
    
    // Einfluss = Stärke * (1 - Distanz/Radius)
    const distanceFactor = 1 - (distance / chum.radius);
    return chum.scentStrength * distanceFactor;
}

// Finde den stärksten Köder-Einfluss für einen Hai
function getStrongestChumInfluence(shark) {
    let strongest = { influence: 0, chum: null };
    
    for (const chum of chumPoints) {
        const influence = getChumInfluence(shark, chum);
        if (influence > strongest.influence) {
            strongest = { influence, chum };
        }
    }
    
    return strongest;
}

// Hai-Verhalten basierend auf Ködern anpassen
function updateSharkBehaviorWithChum(shark, dt) {
    const { influence, chum } = getStrongestChumInfluence(shark);
    
    if (influence > 0.3 && chum) {
        // Berechne Winkel zum Köder
        const angleToChum = Math.atan2(chum.y - shark.y, chum.x - shark.x);
        const currentAngle = shark.angle;
        
        // Sanfte Kursänderung Richtung Köder
        let angleDiff = angleToChum - currentAngle;
        
        // Normalisiere den Winkelunterschied
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Drehgeschwindigkeit abhängig vom Einfluss
        const turnSpeed = 1.5 * dt * Math.min(1.5, influence / 2);
        shark.angle += Math.min(Math.max(angleDiff, -turnSpeed), turnSpeed);
        
        // Geschwindigkeitsanpassung bei starkem Einfluss
        if (influence > 1.0) {
            // Hai wird aktiver
            if (Math.random() < 0.01) {
                addToLog(`🦈 Hai ${shark.id} reagiert auf ${chum.icon} ${chum.name}`);
            }
        }
        
        return true;
    }
    
    return false;
}

// Aktualisiere Köder (kein Zerfall, aber für spätere Erweiterungen)
function updateChum(dt) {
    // Hier könnte später Zerfall implementiert werden
    // Aktuell bleiben Köder dauerhaft bestehen
}

// =============== CHUM ZEICHNEN ===============
function drawChum() {
    for (const chum of chumPoints) {
        const type = chumTypes[chum.type];
        const radius = 12;
        
        ctx.save();
        
        // Wirkungsbereich (sehr dezent)
        ctx.beginPath();
        ctx.arc(chum.x, chum.y, chum.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 50, 50, 0.08)`;
        ctx.fill();
        
        // Äußerer Glanz
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        
        // Köder-Körper
        ctx.beginPath();
        ctx.arc(chum.x, chum.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = chum.color;
        ctx.fill();
        
        // Icon
        ctx.font = `${Math.min(20, radius + 6)}px Arial`;
        ctx.fillStyle = "white";
        ctx.shadowBlur = 3;
        ctx.fillText(chum.icon, chum.x - 8, chum.y + 7);
        
        // Menge anzeigen (bei mehreren)
        if (chum.quantity > 1) {
            ctx.font = "10px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 2;
            ctx.fillText(`×${chum.quantity}`, chum.x + 8, chum.y - 5);
        }
        
        ctx.restore();
    }
}

// =============== CHUM INTERAKTION MIT MAUS ===============
function initChumMouseEvents() {
    canvas.addEventListener("mousedown", (e) => {
        if (!started) return;
        const mouse = getMouse(e);
        
        // Prüfe ob ein Köder angeklickt wurde
        for (let i = chumPoints.length - 1; i >= 0; i--) {
            const chum = chumPoints[i];
            const dist = Math.hypot(mouse.x - chum.x, mouse.y - chum.y);
            if (dist < 20) {
                if (e.button === 0) {
                    // Linksklick: Auswählen/Verschieben
                    selectedChum = chum;
                    isDraggingChum = true;
                    chumDragOffsetX = chum.x - mouse.x;
                    chumDragOffsetY = chum.y - mouse.y;
                    e.preventDefault();
                } else if (e.button === 2) {
                    // Rechtsklick: Löschen
                    removeChum(chum.id);
                    e.preventDefault();
                }
                return;
            }
        }
    });
    
    canvas.addEventListener("mousemove", (e) => {
        if (!started || !isDraggingChum || !selectedChum) return;
        const mouse = getMouse(e);
        selectedChum.x = mouse.x + chumDragOffsetX;
        selectedChum.y = mouse.y + chumDragOffsetY;
        updateChumList();
    });
    
    canvas.addEventListener("mouseup", () => {
        isDraggingChum = false;
        selectedChum = null;
    });
}

// =============== CHUM PLATZIERUNGS-FUNKTIONEN ===============
function addChumAtMouse() {
    const mouse = getMouse({ clientX: canvas.width/2, clientY: canvas.height/2 });
    // Aktuelle Mausposition bekommen
    canvas.addEventListener("mousemove", function getPosition(e) {
        const type = document.getElementById("chum-type").value;
        const quantity = parseInt(document.getElementById("chum-quantity").value) || 1;
        addChum(type, e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, quantity);
        canvas.removeEventListener("mousemove", getPosition);
    });
    canvas.style.cursor = "crosshair";
    
    // Einmaliger Klick-Listener
    const clickHandler = (e) => {
        const type = document.getElementById("chum-type").value;
        const quantity = parseInt(document.getElementById("chum-quantity").value) || 1;
        const rect = canvas.getBoundingClientRect();
        addChum(type, e.clientX - rect.left, e.clientY - rect.top, quantity);
        canvas.removeEventListener("click", clickHandler);
        canvas.style.cursor = "default";
    };
    canvas.addEventListener("click", clickHandler);
    
    addToLog("🖱️ Klicke auf das Wasser, um einen Köder zu platzieren");
}

function addChumAtCage() {
    if (!sharkCage) {
        addToLog("❌ Kein Haikäfig vorhanden! Bitte zuerst Käfig aktivieren.");
        return;
    }
    
    const type = document.getElementById("chum-type").value;
    const quantity = parseInt(document.getElementById("chum-quantity").value) || 1;
    
    // Position außerhalb des Käfigs (rechte Seite, 30 Pixel Abstand)
    const cageCenterX = sharkCage.x + sharkCage.size;
    const cageCenterY = sharkCage.y + sharkCage.size / 2;
    
    addChum(type, cageCenterX + 30, cageCenterY, quantity);
}

// =============== CHUM INITIALISIERUNG ===============
function initChumSystem() {
    const addAtMouseBtn = document.getElementById("add-chum-at-mouse");
    const addAtCageBtn = document.getElementById("add-chum-at-cage");
    const clearAllBtn = document.getElementById("clear-all-chum");
    
    if (addAtMouseBtn) {
        addAtMouseBtn.addEventListener("click", addChumAtMouse);
    }
    
    if (addAtCageBtn) {
        addAtCageBtn.addEventListener("click", addChumAtCage);
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", clearAllChum);
    }
    
    initChumMouseEvents();
    console.log("✅ Chum/Köder-System initialisiert");
}

// =============== INTEGRATION IN BESTEHENDE FUNKTIONEN ===============

// Erweitere die update-Funktion
const previousUpdate = update;
update = function(dt) {
    if (previousUpdate) previousUpdate(dt);
    updateChum(dt);
    
    // Haiverhalten durch Köder beeinflussen
    sharks.forEach(shark => {
        updateSharkBehaviorWithChum(shark, dt);
    });
};

// Erweitere die draw-Funktion
const previousDraw = draw;
draw = function(dt) {
    if (previousDraw) previousDraw(dt);
    drawChum();
};

// Erweitere die start-Funktion um Chum-Initialisierung
const previousStart = start;
start = function() {
    previousStart();
    if (typeof initChumSystem === 'function') {
        initChumSystem();
    }
};

// =============== JSON EXPORT FÜR CHUM ERWEITERN ===============

const originalExportToJSON = window.exportToJSON;

window.exportToJSON = function() {
    
    originalExportToJSON();
    
    
};

// Chum-Initialisierung starten, wenn DOM bereit
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        if (started) initChumSystem();
    });
} else {
    if (typeof started !== 'undefined' && started) {
        initChumSystem();
    }
}