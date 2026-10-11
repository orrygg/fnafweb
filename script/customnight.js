// Custom Night: character selection + per-character difficulty (0-20, like the real FNAF 4 custom night).
// Load this BEFORE menu.js and ai.js so they can read the settings.

var CN_MAX_LEVEL = 20;

// customOnly: never shows up in the normal night. Starts switched off the first time.
var CN_CHARACTERS = [
    { id: "freddy",    name: "Nightmare Freddy",   defaultLevel: 5, portrait: "images/extras/freddy-extra.png" },
    { id: "bonnie",    name: "Nightmare Bonnie",   defaultLevel: 5, portrait: "images/extras/bonnie-extra.png" },
    { id: "chica",     name: "Nightmare Chica",    defaultLevel: 5, portrait: "images/extras/chica-extra.png" },
    { id: "foxy",      name: "Nightmare Foxy",     defaultLevel: 5, portrait: "images/extras/foxy-extra.png" },
    { id: "fredbear",  name: "Nightmare Fredbear", defaultLevel: 5, portrait: "images/extras/fat-extra.png", customOnly: true },
    { id: "nightmare", name: "Nightmare",          defaultLevel: 5, portrait: "images/extras/fat-black-extra.png", customOnly: true }
];

var CN_PRESETS = {
    "Easy":   1,
    "Normal": 5,
    "Hard":   12,
    "4/20":   20
};

var customNight = {};

function cnLoad() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem("fnaf4-customnight")); } catch (e) {}
    CN_CHARACTERS.forEach(function (c) {
        var s = saved && saved[c.id];
        customNight[c.id] = {
            enabled: s ? !!s.enabled : !c.customOnly,
            level: s ? cnClamp(s.level) : c.defaultLevel
        };
    });
}

function cnSave() {
    try { localStorage.setItem("fnaf4-customnight", JSON.stringify(customNight)); } catch (e) {}
}

function cnClamp(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(CN_MAX_LEVEL, n));
}

// ---- Hooks used by ai.js ----

// true = levels stay fixed all night (set from the menu), false = the normal night
// where levels start at 0 and go up every hour.
var customNightMode = false;

// True if this animatronic should appear at all tonight.
function isCharacterActive(id) {
    if (!customNightMode) {
        return !CN_CHARACTERS.some(function (c) { return c.id == id && c.customOnly; });
    }
    var c = customNight[id];
    return !!c && c.enabled && c.level > 0;
}

// 0 if disabled, otherwise 1-20.
function getAILevel(id) {
    return isCharacterActive(id) ? customNight[id].level : 0;
}

// Converts the 0-20 menu levels into the values each animatronic in ai.js uses.
// Bonnie/Chica/Foxy roll against 0-20 every few seconds, so they use the level directly.
// Freddy and Foxy-in-the-closet instead add their ailevel to a 0-100 meter every 5s;
// in the normal night they top out at 10 and 15 (5 AM), so level 20 maps a bit above that.
function applyCustomNightLevels() {
    freddy.ailevel = getAILevel("freddy") * 0.6
    bonnie.ailevel = getAILevel("bonnie")
    chica.ailevel = getAILevel("chica")
    foxyDoor.ailevel = getAILevel("foxy")
    foxyCloset.ailevel = getAILevel("foxy") * 0.8
    // Fredbear/Nightmare roll against 0-20 too (see stalkers.js)
    fredbear.ailevel = getAILevel("fredbear")
    nightmare.ailevel = getAILevel("nightmare")
}

// ---- Menu UI ----

function cnBuildMenu() {
    var list = document.getElementById("cn-characters");
    list.innerHTML = "";
    CN_CHARACTERS.forEach(function (c) {
        var card = document.createElement("div");
        card.className = "cn-card";
        card.id = "cn-card-" + c.id;
        card.innerHTML =
            '<button class="cn-toggle text-red" onclick="cnToggle(\'' + c.id + '\')"></button>' +
            '<img class="cn-portrait" src="' + c.portrait + '" alt="">' +
            '<p class="cn-name text-red">' + c.name + '</p>' +
            '<div class="cn-level-row">' +
                '<button class="cn-arrow text-red" onclick="cnChange(\'' + c.id + '\', -1)">&lt;</button>' +
                '<span class="cn-level text-red"></span>' +
                '<button class="cn-arrow text-red" onclick="cnChange(\'' + c.id + '\', 1)">&gt;</button>' +
            '</div>' +
            '<input type="range" class="cn-slider" min="0" max="' + CN_MAX_LEVEL + '" ' +
                'oninput="cnSet(\'' + c.id + '\', this.value)">';
        list.appendChild(card);
    });

    var presets = document.getElementById("cn-presets");
    presets.innerHTML = "";
    Object.keys(CN_PRESETS).forEach(function (name) {
        var b = document.createElement("button");
        b.className = "cn-preset text-red";
        b.textContent = name;
        b.onclick = function () { cnApplyPreset(CN_PRESETS[name]); };
        presets.appendChild(b);
    });

    cnRefresh();
}

function cnRefresh() {
    var anyActive = false;
    CN_CHARACTERS.forEach(function (c) {
        var s = customNight[c.id];
        var card = document.getElementById("cn-card-" + c.id);
        card.classList.toggle("cn-disabled", !s.enabled);
        card.querySelector(".cn-toggle").textContent = s.enabled ? "ON" : "OFF";
        card.querySelector(".cn-level").textContent = s.level;
        card.querySelector(".cn-slider").value = s.level;
        card.querySelector(".cn-slider").disabled = !s.enabled;
        if (isCharacterActive(c.id)) anyActive = true;
    });
    document.getElementById("cn-warning").style.visibility = anyActive ? "hidden" : "visible";
    cnSave();
}

function cnToggle(id) {
    customNight[id].enabled = !customNight[id].enabled;
    cnRefresh();
}

function cnChange(id, delta) {
    if (!customNight[id].enabled) return;
    customNight[id].level = cnClamp(customNight[id].level + delta);
    cnRefresh();
}

function cnSet(id, value) {
    customNight[id].level = cnClamp(value);
    cnRefresh();
}

function cnApplyPreset(level) {
    // Presets switch on the main four; Fredbear/Nightmare keep their ON/OFF and just get the level
    CN_CHARACTERS.forEach(function (c) {
        if (!c.customOnly) customNight[c.id].enabled = true;
        customNight[c.id].level = level;
    });
    cnRefresh();
}

function openCustomNight() {
    document.getElementById("custom-night-panel").style.display = "flex";
}

function closeCustomNight() {
    document.getElementById("custom-night-panel").style.display = "none";
}

function startCustomNight() {
    if (gameStarting) return;
    customNightMode = true;
    closeCustomNight();
    // Fredbear/Nightmare play differently from the others, so explain them first
    if (isCharacterActive("fredbear") || isCharacterActive("nightmare")) {
        cnShowBriefing();
    } else {
        startGame();
    }
}

function cnShowBriefing() {
    ["fredbear", "nightmare"].forEach(function (id) {
        document.getElementById("cn-briefing-" + id).style.display = isCharacterActive(id) ? "block" : "none";
    });
    document.getElementById("cn-nightmare-note").style.display = isCharacterActive("nightmare") ? "block" : "none";
    document.getElementById("cn-briefing").style.display = "flex";
}

function cnBriefingStart() {
    if (gameStarting) return;
    document.getElementById("cn-briefing").style.display = "none";
    startGame();
}

function cnBriefingBack() {
    document.getElementById("cn-briefing").style.display = "none";
    openCustomNight();
}

function startNormalNight() {
    if (gameStarting) return;
    customNightMode = false;
    startGame();
}

cnLoad();
document.addEventListener("DOMContentLoaded", cnBuildMenu);
