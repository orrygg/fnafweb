// Nightmare Fredbear and Nightmare (Custom Night only).
// There are no in-game frames for them, so they're drawn as a sprite (their extras picture)
// on top of the current view.
//
// How they work:
// - Every few seconds they roll against their level (0-20). On a hit they laugh and show up
//   at one spot: the left door, the right door, the closet or on the bed.
// - Doors: you hear breathing. DON'T use the light (that's a jumpscare), hold the door shut until he leaves.
// - Closet: hold the closet doors shut until he leaves. The light is safe here.
// - Bed: shine the light on him until he leaves.
// - Leave him alone for too long and he gets you, wherever you are.
// Nightmare is the harder one: he moves more often, waits less and takes longer to get rid of.

const STALKER_SPOTS = [lookingLeftDoor, lookingRightDoor, lookingClosetClose, lookingBack]
let stalkerLayer = document.getElementById("stalker-layer")
let stalkerOverlay = document.getElementById("stalker-overlay")
// Extra copies of the picture for the biting jumpscare (see drawChompJumpscare)
let stalkerMouth = document.getElementById("stalker-mouth")
let stalkerHead = document.getElementById("stalker-head")
let stalkerLaughSound = document.getElementById("stalker-laugh")
stalkerLaughSound.preservesPitch = false // let playbackRate make the giggle deeper

class Stalker {
    constructor(options) {
        Object.assign(this, options)
        this.ailevel = 0
        this.spot = 0
        this.held = 0
    }
    tick() {
        if (this.spot) return
        let randNum = Math.round(Math.random() * 20)
        if (this.ailevel > randNum) {
            this.appear()
        }
    }
    appear() {
        let freeSpots = STALKER_SPOTS.filter(spot => !stalkerAt(spot))
        if (freeSpots.length == 0) return
        this.spot = freeSpots[Math.floor(Math.random() * freeSpots.length)]
        this.held = 0
        // Level 1 gives the full patience, level 20 the minimum
        let patience = this.patienceMax - (this.patienceMax - this.patienceMin) * (this.ailevel - 1) / 19
        this.deadline = Date.now() + patience * 1000
        console.log(this.id + " moved to " + this.spot)
        stalkerLaughSound.playbackRate = this.laughRate
        PlaySound(stalkerLaughSound)
        // Standing at that door right now with it open? Then he's right in front of you
        if ((this.spot == lookingLeftDoor || this.spot == lookingRightDoor) && lookingStatus == this.spot && !doorClosed && !animationPlaying) {
            PlaySound(breathingSound)
        }
    }
    leave() {
        console.log(this.id + " left " + this.spot)
        let leaveSounds = {
            [lookingLeftDoor]: footstepBonnieSound,
            [lookingRightDoor]: footstepChicaSound,
            [lookingClosetClose]: foxyBackSound,
            [lookingBack]: foxyBackSound,
        }
        PlaySound(leaveSounds[this.spot])
        this.spot = 0
        this.held = 0
    }
    // Called every STALKER_UPDATE_MS while the night is running
    update(dt) {
        if (!this.spot || this.peeking || isGettingJumpscared) return
        let pushingBack = lookingStatus == this.spot && (this.spot == lookingBack ? flashlightWorking : doorClosed)
        this.held = pushingBack ? this.held + dt : 0
        let holdNeeded = this.spot == lookingBack ? this.holdBed : this.holdDoor
        if (this.held >= holdNeeded) {
            this.leave()
        } else if (!pushingBack && Date.now() > this.deadline) {
            this.kill()
        }
    }
    // Ran out of time: gets you from anywhere (blackout first, like Freddy/Bonnie/Chica in the bedroom)
    kill() {
        stalkerJumpscaring = this
        killAnywhere(this.jumpscareFrames, null, () => {}, drawStalkerJumpscare)
    }
    // Shone the light on him at a door: he peeks round the door frame for a moment, then lunges
    spotted() {
        if (this.peeking) return
        this.peeking = true
        animationPlaying = true // too late to walk away now
        updateStalkerOverlay()
        setTimeout(() => {
            this.peeking = false
            if (this.spot) this.jumpscare() // unless the night ended in the meantime
        }, 700)
    }
    jumpscare() {
        stalkerJumpscaring = this
        animationJumpscareBase(this.jumpscareFrames, null, () => {}, drawStalkerJumpscare)
    }
    startAI() {
        clearInterval(this.aiInterval)
        this.spot = 0
        this.held = 0
        this.aiInterval = setInterval(this.tick.bind(this), this.tickMs)
    }
    stopAI() {
        clearInterval(this.aiInterval)
        this.spot = 0
        this.held = 0
        this.ailevel = 0
    }
}

let fredbear = new Stalker({
    id: "fredbear",
    sprite: "images/extras/fat-extra.png",
    tickMs: 6000,
    patienceMax: 25, // seconds before he attacks, at level 1
    patienceMin: 12, // ...and at level 20
    holdDoor: 3000,  // ms the door/closet has to stay shut
    holdBed: 1500,   // ms the light has to stay on him
    laughRate: 0.6,
    jumpscareFrames: 55, // 40ms each: picks you up, then bites three times
    jawSplit: 25,        // % from the top of his picture where the upper and lower teeth meet
})

let nightmare = new Stalker({
    id: "nightmare",
    sprite: "images/extras/fat-black-extra.png",
    tickMs: 4500,
    patienceMax: 20,
    patienceMin: 9,
    holdDoor: 4000,
    holdBed: 2500,
    laughRate: 0.45,
    jumpscareFrames: 55,
    jawSplit: 30,
})

let stalkers = [fredbear, nightmare]

// The stalker at that spot (lookingLeftDoor, lookingRightDoor, lookingClosetClose or lookingBack), if any
function stalkerAt(spot) {
    return stalkers.find(s => s.spot == spot)
}

let stalkerJumpscaring = null

function drawStalkerJumpscare(frame, frameCount) {
    let s = stalkerJumpscaring
    stalkerLayer.className = s.jawSplit ? "stalker-jumpscare chomp" : "stalker-jumpscare"
    stalkerLayer.style.display = "block"
    stalkerOverlay.className = s.id
    stalkerOverlay.src = s.sprite
    if (s.jawSplit) {
        drawChompJumpscare(s, frame, frameCount)
        return
    }
    let scale = 0.6 + 1.8 * frame / frameCount
    let shakeX = Math.round((Math.random() - 0.5) * 50)
    let shakeY = Math.round((Math.random() - 0.5) * 30)
    stalkerOverlay.style.transform = "translateX(-50%) translate(" + shakeX + "px, " + shakeY + "px) scale(" + scale + ")"
}

// Fredbear and Nightmare grab you: he rises up in front of you and lifts you (the room drops away and tilts),
// pulls you up to his face, then snaps his jaw open and shut three times.
// His picture is split where the teeth meet (jawSplit): the top part moves to open the jaw and a
// darkened copy behind both parts shows the inside of his mouth.
function drawChompJumpscare(s, frame, frameCount) {
    if (frame == 1) {
        stalkerHead.src = s.sprite
        stalkerMouth.src = s.sprite
        stalkerHead.className = s.id
        stalkerMouth.className = s.id
        stalkerHead.style.clipPath = "inset(0 0 " + (100 - s.jawSplit) + "% 0)"
        stalkerOverlay.style.clipPath = "inset(" + s.jawSplit + "% 0 0 0)"
        stalkerMouth.style.clipPath = "inset(" + (s.jawSplit - 7) + "% 0 " + (100 - s.jawSplit - 7) + "% 0)"
    }
    let t = frame / frameCount
    let lift = 1 - Math.pow(1 - Math.min(t / 0.4, 1), 3) // 0 -> 1 while he picks you up (eased)
    let bite = Math.max(0, (t - 0.4) / 0.6)              // 0 -> 1 while he bites
    let open = Math.abs(Math.sin(bite * 3 * Math.PI))    // three open-and-shut bites
    let scale = 1 + lift * 1.3 + bite * 0.5
    let rise = (1 - lift) * 60                           // starts below the screen
    let shakeAmount = 8 + open * 30
    let shakeX = Math.round((Math.random() - 0.5) * shakeAmount)
    let shakeY = Math.round((Math.random() - 0.5) * shakeAmount)
    let body = "translateX(-50%) translate(" + shakeX + "px, " + shakeY + "px) translateY(" + rise + "%) scale(" + scale + ")"
    stalkerOverlay.style.transform = body
    stalkerMouth.style.transform = body + " scaleX(1.25)" // wider, so the tilted head never shows the room behind
    stalkerHead.style.transform = body + " translateY(" + (-open * 5) + "%) rotate(" + (-open * 3) + "deg)"
    // Being lifted: the room sinks and tilts, swaying a little in his grip
    let sway = Math.sin(t * 9) * 1.5 * lift
    gameVisuals.style.transform = "scale(1.15) translateY(" + (lift * 20) + "%) rotate(" + (-lift * 5 + sway) + "deg)"
}

function clearStalkerJumpscare() {
    stalkerJumpscaring = null
    stalkerOverlay.style.transform = ""
    stalkerOverlay.style.clipPath = ""
    stalkerHead.style.transform = ""
    stalkerMouth.style.transform = ""
    gameVisuals.style.transform = ""}

// Shows him when you shine the light on the bed or into the closet, or while he peeks at a door
function updateStalkerOverlay() {
    if (stalkerJumpscaring) {
        if (isGettingJumpscared) return // keep the jumpscare on screen until the dead screen covers it
        clearStalkerJumpscare()
    }
    let visible = stalkers.find(s => s.peeking)
    let layerClass
    if (visible) {
        layerClass = visible.spot == lookingLeftDoor ? "peek-left" : "peek-right"
    } else if ((lookingStatus == lookingBack || lookingStatus == lookingClosetClose) && flashlightWorking && !doorClosed) {
        visible = stalkerAt(lookingStatus)
        layerClass = lookingStatus == lookingBack ? "spot-bed" : "spot-closet"
    }
    if (visible) {
        stalkerLayer.className = layerClass
        stalkerOverlay.className = visible.id
        if (!stalkerOverlay.src.endsWith(visible.sprite)) stalkerOverlay.src = visible.sprite
        stalkerLayer.style.display = "block"
    } else {
        stalkerLayer.style.display = "none"
    }
}

const STALKER_UPDATE_MS = 100
setInterval(() => {
    stalkers.forEach(s => s.update(STALKER_UPDATE_MS))
    updateStalkerOverlay()
}, STALKER_UPDATE_MS)
