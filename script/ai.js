const foxyLeftDoor = lookingLeftDoor
const foxyRightDoor = lookingRightDoor

class DoorAnimatronic {
    constructor(ailevelc, currposc, maxposc, maxposinstac, directionc, walksound, frameCountc, frameNamec, timingc) {
        this.ailevel = ailevelc // Определяет шанс на передвижение
        this.currpos = currposc // Текущая позиция
        this.maxpos = maxposc
        this.maxposinsta = maxposinstac // Максимальная позиция. Дальше - смэрть
        this.direction = directionc
        this.stepSound = walksound
        this.frameCount = frameCountc
        this.frameName = frameNamec
        this.timing = timingc
    }
    addChance() {
        if (this.currpos >= this.maxpos && this.currpos != this.maxposinsta && this.direction == lookingStatus && doorClosed) {
            this.currpos = 0
            PlaySound(this.stepSound)
        } else {
            let randNum = Math.round(Math.random() * 20)
            console.log("I tried! " + randNum)
            if (!(lookingStatus == this.direction && flashlightWorking)) {
                if (this.ailevel > randNum) {
                    if (this.currpos < this.maxpos) {
                        PlaySound(this.stepSound)
                    }
                    console.log("Something's getting closer...")
                    this.currpos = this.currpos + 1
                    console.log(this.currpos)
                    if (this.currpos >= this.maxpos && lookingStatus == this.direction) {
                        PlaySound(breathingSound)
                    }
                    if (this.currpos == this.maxposinsta) {
                        killAnywhere(this.frameCount, this.frameName)
                    }
                }
            }
        }
    }
    startAI(){
        clearInterval(this.aiInterval) // never run two timers for the same animatronic
        this.aiInterval = setInterval(this.addChance.bind(this), 6000)
    }
    stopAI(){
        clearInterval(this.aiInterval)
        this.currpos = 0
        this.ailevel = 0
    }
}

class PassiveAnimatronic {
    constructor(ailevelc, currposc, maxposc, maxposinstac, frameCountc, frameNamec) {
        this.ailevel = ailevelc // Определяет шанс на передвижение
        this.currpos = currposc // Текущая позиция
        this.maxpos = maxposc
        this.maxposinsta = maxposinstac // Максимальная позиция. Дальше - смэрть
        this.frameCount = frameCountc
        this.frameName = frameNamec
    }
    addChance() {
        if (!(lookingStatus == lookingBack && flashlightWorking)) {
            console.log("Something's getting stronger...")
            this.currpos = this.currpos + this.ailevel
            console.log(this.currpos)
            if (this.currpos >= this.maxposinsta) {
                killAnywhere(this.frameCount, this.frameName)
            }
        }
    }
    startAI(){
        clearInterval(this.aiInterval)
        this.aiInterval = setInterval(this.addChance.bind(this), 5000)
    }
    stopAI(){
        clearInterval(this.aiInterval)
        this.currpos = 0
        this.ailevel = 0
    }
}

let freddy = new PassiveAnimatronic(0, 0, 80, 100, 15, "images/jumpscares/freddy-bedroom/freedy-bedroom-", () => { 
    middleButton.removeEventListener("mousedown", lightBed);
    middleButton.removeEventListener("mouseup", darkBed); 
}, 5000)
let bonnie = new DoorAnimatronic(0, 0, 4, 6, lookingLeftDoor, footstepBonnieSound, 17, "images/jumpscares/bonnie-bedroom/bonnie-bedroom-", () => { 
    middleButton.removeEventListener("mousedown", lightLeft);
    middleButton.removeEventListener("mouseup", darkLeft); 
}, 5000)
let chica = new DoorAnimatronic(0, 0, 4, 6, lookingRightDoor, footstepChicaSound, 13, "images/jumpscares/chica-bedroom/chica-bedroom-", () => { 
    middleButton.removeEventListener("mousedown", lightRight);
    middleButton.removeEventListener("mouseup", darkRight); 
}, 6000)
let foxyCloset = new PassiveAnimatronic(0, -1000, 130, 100, 19, "images/jumpscares/foxy/foxy-", () => { 
    middleButton.removeEventListener("mousedown", lightCloset);
    middleButton.removeEventListener("mouseup", darkCloset); 
}, 5000)

let foxyDoor = {
    currpos: 0,
    ailevel: 0,
    directions: [0, foxyLeftDoor, foxyRightDoor],
    directionSounds: [foxyBackSound, foxyLeftDoorSound, foxyRightDoorSound],
    addChance: function() {
        let randNum = Math.round(Math.random() * 20)
        console.log("I tried! " + randNum)
        if (this.ailevel >= randNum) {
            let index = Math.round(Math.random() * 2)
            console.log("Random number for Foxy generated! " + index)
            this.currpos = this.directions[index]
            PlaySound(this.directionSounds[index])
            if (this.currpos == lookingStatus && !flashlightWorking) {
                this.directionSounds[index].pause()
                this.currpos = this.directions[0]
                PlaySound(this.directionSounds[0])
            }
        }
    },
    enterCloset: function() {
        clearInterval(this.aiInterval)
        foxyCloset.currpos = 50
        foxyCloset.ailevel = 5
        this.ailevel = -100
        this.currpos = -1
    },
    startAI: function() {
        clearInterval(this.aiInterval)
        this.aiInterval = setInterval(this.addChance.bind(this), 5751)
    },
    stopAI: function() {
        clearInterval(this.aiInterval)
        this.ailevel = -100
        this.currpos = -1
    }
}

let hourCount = 0
var hourInterval

function startAllAI() {
    console.log("void_sex")
    // Reset everything so a new night (or a retry after dying) starts fresh
    hourCount = 0
    document.getElementById("clock").innerText = "12 AM"
    flashlightWorking = false
    doorClosed = false
    freddy.currpos = 0
    bonnie.currpos = 0
    chica.currpos = 0
    foxyDoor.currpos = 0
    foxyCloset.currpos = -1000
    freddy.ailevel = 0
    bonnie.ailevel = 0
    chica.ailevel = 0
    foxyDoor.ailevel = 0
    foxyCloset.ailevel = 0
    fredbear.ailevel = 0
    nightmare.ailevel = 0
    if (customNightMode) {
        applyCustomNightLevels()
    } else {
        // Normal night: active from 12 AM (starts where 1 AM used to be)
        freddy.ailevel = 2
        bonnie.ailevel = 3
        chica.ailevel = 3
        foxyDoor.ailevel = 4
        foxyCloset.ailevel = 3
    }
    if (isCharacterActive("freddy")) freddy.startAI()
    if (isCharacterActive("bonnie")) bonnie.startAI()
    if (isCharacterActive("chica")) chica.startAI()
    if (isCharacterActive("foxy")) {
        foxyDoor.startAI()
        foxyCloset.startAI()
    }
    if (isCharacterActive("fredbear")) fredbear.startAI()
    if (isCharacterActive("nightmare")) nightmare.startAI()
    clearInterval(hourInterval)
    hourInterval = setInterval(addHour, 70000)
}

function addHour() {
    hourCount = hourCount + 1
    if (hourCount != 6) {
        document.getElementById("clock").innerText = hourCount + " AM"
        // Custom night keeps the levels picked in the menu for the whole night.
        // The normal night already starts at the 1 AM levels, so it only ramps up from 2 AM
        // (5 AM ends up exactly as hard as before).
        if (!customNightMode && hourCount >= 2) {
            freddy.ailevel = freddy.ailevel + 2
            bonnie.ailevel = bonnie.ailevel + 3
            chica.ailevel = chica.ailevel + 3
            foxyDoor.ailevel = foxyDoor.ailevel + 4
            foxyCloset.ailevel = foxyCloset.ailevel + 3
        }
        if (hourCount == 1) {
            hideTips()
        }
    } else {
        clearInterval(hourInterval)
        stopAllAI()
        ambienceMus.pause()
        let timesId = 0
        var changeTimeInterval
        var times = ["09:66", "24:23", "56:64", "00:00", "66:34", "88:34", "06:00", "06:00", "06:00", "06:00", "06:00"]
        function changeTime() {
            document.getElementById("some-time").style.display = "block"
            document.getElementById("some-time").innerText = times[timesId]
            timesId++
            setTimeout(() => { 
                if (timesId != 10) {
                    document.getElementById("some-time").style.display = "none"
                }}, 300)
            if (timesId == 10) {
                clockAlarmSound.pause()
                clearInterval(changeTimeInterval)
                setTimeout( () => {
                    document.getElementById("hours-minutes").animate(fadeOut, fadeTiming)
                    // Leave the "YOU'RE AMAZING" screen up for a bit, then go back to the menu
                    setTimeout(returnToMenuAfterWin, 9000)
                }, 750)
            }
        }
        let finishScreenFadeIn = finishScreen.animate(fadeIn, fadeReallyFastTiming)
        finishScreen.style.display = "block"
        document.getElementById("hours-minutes").style.display = "block"
        finishScreenFadeIn.onfinish = () => {
            PlaySound(clockAlarmSound)
            changeTimeInterval = setInterval(changeTime, 500)
        }
    }
}

function returnToMenuAfterWin() {
    resetPlayer()
    gameVisuals.src = imageBedroomFront
    menuDiv.style.display = "block"
    PlaySound(menuMus)
    // The black screen from startGame() is still covering the menu, fade it away like after a death
    let blackScreenAnimAfterWin = blackScreenDiv.animate(fadeOut, fadeTiming)
    blackScreenAnimAfterWin.onfinish = () => {
        blackScreenDiv.style.display = "none"
    }
    finishScreen.style.display = "none"
    let hoursMinutes = document.getElementById("hours-minutes")
    hoursMinutes.style.display = "none"
    // Clear the finished fade animations so the 6 AM screen shows properly next time
    hoursMinutes.getAnimations().forEach(a => a.cancel())
    finishScreen.getAnimations().forEach(a => a.cancel())
    document.getElementById("some-time").style.display = "none"
}

// Puts the player back in the bedroom with nothing held down, so no
// flashlight/door state leaks from one night into the next
function resetPlayer() {
    removeEventListeners()
    clearInterval(animationInterval)
    lookingStatus = lookingCenter
    animationPlaying = false
    flashlightWorking = false
    doorClosed = false
    breathingSound.pause()
    freddleSound.pause()
}

function stopAllAI() {
    console.log("AI Stopped")
    freddy.stopAI()
    bonnie.stopAI()
    chica.stopAI()
    foxyCloset.stopAI()
    foxyCloset.currpos = -1000
    foxyDoor.stopAI()
    fredbear.stopAI()
    nightmare.stopAI()
}