let leftButton = document.getElementById("turn-left")
let rightButton = document.getElementById("turn-right")
let middleButton = document.getElementById("go-front")
let backButton = document.getElementById("turn-back")

function removeEventListeners () {
    leftButton.replaceWith(leftButton.cloneNode(true));
    rightButton.replaceWith(rightButton.cloneNode(true));
    middleButton.replaceWith(middleButton.cloneNode(true));
    document.removeEventListener("mouseup", openLeftDoor)
    document.removeEventListener("mouseup", openRightDoor)
    document.removeEventListener("mouseup", openCloset)
    console.log(middleButton)
    leftButton = document.getElementById("turn-left")
    rightButton = document.getElementById("turn-right")
    middleButton = document.getElementById("go-front")
}

// LOOK HANDLERS

function rightLook() {
    if (!animationPlaying && lookingStatus != lookingLeftDoor && lookingStatus != lookingRightDoor && lookingStatus != lookingClosetClose && lookingStatus != lookingBack) {
        function checkHover() {
            if (document.getElementById("turn-right").matches(':hover')) {
                rightLook()
            }
        }
        if (lookingStatus == lookingLeft) {
            animationStandard(true, "./images/bedroom/bedroom-front-left-", 4, imageBedroomFront, lookingCenter, lookingLeft, imageBedroomFront)
            setTimeout(checkHover, 350)
        } else if (lookingStatus == lookingCenter) {
            animationStandard(false, "./images/bedroom/bedroom-front-right-", 4, imageBedroomFront, lookingCenter, lookingRight, imageBedroomRight)
        }
    }
}

function leftLook() {
    if (!animationPlaying && lookingStatus != lookingLeftDoor && lookingStatus != lookingRightDoor && lookingStatus != lookingClosetClose && lookingStatus != lookingBack) {
        function checkHover() {
            if (document.getElementById("turn-left").matches(':hover')) {
                leftLook()
            }
        }
        if (lookingStatus == lookingRight) {
            // animationRightCenter(true)
            animationStandard(true, "./images/bedroom/bedroom-front-right-", 4, imageBedroomFront, lookingCenter, lookingLeft, imageBedroomFront)
            setTimeout(checkHover, 350)
        } else if (lookingStatus == lookingCenter) {
            animationStandard(false, "./images/bedroom/bedroom-front-left-", 4, imageBedroomFront, lookingCenter, lookingLeft, imageBedroomLeft)
        }
    }
}

function lookBack () {
    if (!animationPlaying) {
        switch (lookingStatus) {
            case lookingBack:
                animationBack(true)
                break
            case lookingLeftDoor:
                breathingSound.pause()
                animationDoorGetCloser(true, "./images/left-door/door-left-enter-", 18, lookingLeftDoor, lightLeft, darkLeft, bonnie.currpos, bonnie.maxpos, imageDoorLeft, leftButton)
                break
            case lookingRightDoor:
                breathingSound.pause()
                animationDoorGetCloser(true, "./images/right-door/right-door-go-", 15, lookingRightDoor, lightRight, darkRight, chica.currpos, chica.maxpos, imageDoorRight, rightButton)
                break
            case lookingClosetClose:
                animationClosetApproach(true)
                break
            default:
                animationBack(false)
                break
        }
    }
}

// "Turn back" only fires on mouseover, so if the mouse was already resting on the strip
// when an animation finished, nothing would happen until you moved out and back in.
function checkBackHover() {
    if (document.getElementById("turn-back").matches(":hover")) {
        lookBack()
    }
}

// CLICK HANDLERS

function middleClickHandler() {
    console.log(lookingStatus)
    if (!animationPlaying) {
        if (lookingStatus == lookingCenter) {
            PlaySound(lightSound)
            animationCenterGo()
        }
    }
}

function leftClickHandler () {
    if (!animationPlaying) {
        if (lookingStatus == lookingLeft) {
            PlaySound(lightSound)
            animationDoorsStart("./images/bedroom/bedroom-front-left-go-", 5, function(){ return animationDoorGetCloser(false, "./images/left-door/door-left-enter-", 18, lookingLeftDoor, lightLeft, darkLeft, bonnie.currpos, bonnie.maxpos, imageDoorLeft, leftButton)})
        } else if (lookingStatus == lookingLeftDoor) {
            doorCloseBase("images/left-door/door-left-close-", 10, false, imageDoorLeft, leftButton, openLeftDoor)
        } else if (lookingStatus == lookingClosetClose) {
            doorCloseBase("images/closet/closet-close-", 5, false, imageCloset, leftButton, openCloset, lookingClosetClose)
        }
    }
}

// Holding the closet shut pushes Foxy back. One timer for the whole game
// (it used to start a new one on every click, stacking up and making Foxy weaker over time).
function decreaseClosetFoxy() {
    if (lookingStatus == lookingClosetClose && doorClosed && foxyCloset.currpos > 6) {
        foxyCloset.currpos = foxyCloset.currpos - 6
    }
}
setInterval(decreaseClosetFoxy, 1000)

function rightClickHandler () {
    if (!animationPlaying) {
        if (lookingStatus == lookingRight) {
            PlaySound(lightSound)
            animationDoorsStart("./images/bedroom/bedroom-front-right-go-", 5, function(){ return animationDoorGetCloser(false, "./images/right-door/right-door-go-", 15, lookingRightDoor, lightRight, darkRight, chica.currpos, chica.maxpos, imageDoorRight, rightButton)})
        } else if (lookingStatus == lookingRightDoor) {
            doorCloseBase("images/right-door/right-door-close-", 11, false, imageDoorRight, rightButton, openRightDoor)
        }
    }
}

// LIGHT HANDLERS

function lightBed(event) {
    if (!animationPlaying && !isGettingJumpscared) {
        flashlightWorking = true
        PlaySound(lightSound)
        if (freddy.currpos >= 10 && freddy.currpos < 80) {
            PlaySound(freddleSound)
        }
        freddyHandler()
    }
}
function darkBed(event) {
    if (!animationPlaying) {
        flashlightWorking = false
        PlaySound(lightSound)
        gameVisuals.src = imageBedroomBed
        freddleSound.pause()
    }
}

function lightLeft(event) {
    if (!animationPlaying) {
        flashlightWorking = true
        PlaySound(lightSound)
        if (stalkerAt(lookingLeftDoor)) {
            stalkerAt(lookingLeftDoor).spotted()
            return
        }
        if (bonnie.currpos >= bonnie.maxpos) {
            animationJumpscareBase(18, "images/jumpscares/bonnie-door/bonnie-door-", () => { 
                middleButton.removeEventListener("mousedown", lightLeft);
                middleButton.removeEventListener("mouseup", darkLeft); 
            })
        }
        else if (bonnie.currpos >= 1) {
            bonnie.currpos = 0
            if (foxyDoor.currpos == foxyLeftDoor) {
                foxyDoor.currpos = 0
            }
            doorAnimatronicAnimHide("images/left-door/door-left-close-bonnie-go-", 9, "images/left-door/door-left-light-no.png")
        } else if (foxyDoor.currpos == foxyLeftDoor) {
            foxyDoor.currpos = 0
            doorAnimatronicAnimHide("images/left-door/door-left-close-foxy-go-", 6, "images/left-door/door-left-light-no.png")
        } else {
            gameVisuals.src = "images/left-door/door-left-light-no.png"
        }
    }
}
function darkLeft(event) {
    flashlightWorking = false
    PlaySound(lightSound)
    gameVisuals.src = imageDoorLeft
}

function lightRight(event) {
    if (!animationPlaying) {
        flashlightWorking = true
        PlaySound(lightSound)
        if (stalkerAt(lookingRightDoor)) {
            stalkerAt(lookingRightDoor).spotted()
            return
        }
        if (chica.currpos >= chica.maxpos) {
            animationJumpscareBase(16, "images/jumpscares/chica-door/chica-door-", () => { 
                middleButton.removeEventListener("mousedown", lightRight);
                middleButton.removeEventListener("mouseup", darkRight); 
            })
        }
        else if (chica.currpos >= 1) {
            chica.currpos = 0
            if (foxyDoor.currpos == foxyRightDoor) {
                foxyDoor.currpos = 0
            }
            doorAnimatronicAnimHide("images/right-door/door-right-close-chica-go-", 13, "images/right-door/right-door-light-no.png")
        } else if (foxyDoor.currpos == foxyRightDoor) {
            foxyDoor.currpos = 0
            doorAnimatronicAnimHide("images/right-door/door-right-close-foxy-go-", 6, "images/right-door/right-door-light-no.png")
        } else {
            gameVisuals.src = "images/right-door/right-door-light-no.png"
        }
    }
}
function darkRight(event) {
    flashlightWorking = false
    PlaySound(lightSound)
    gameVisuals.src = imageDoorRight
}

function lightCloset(event) {
    if (!animationPlaying) {
        flashlightWorking = true
        PlaySound(lightSound)
        if (foxyCloset.currpos >= 85) {
            gameVisuals.src = "images/closet/closet-light-foxy-3.png"
        } else if (foxyCloset.currpos >= 50) {
            gameVisuals.src = "images/closet/closet-light-foxy-2.png"
        } else if (foxyCloset.currpos >= 20) {
            gameVisuals.src = "images/closet/closet-light-foxy-1.png"
        } else if (foxyCloset.currpos > 0) {
            gameVisuals.src = "images/closet/closet-light-foxy-0.png"
        } else {
            gameVisuals.src = "images/closet/closet-light-empty.png"
        }
    }
}
function darkCloset(event) {
    flashlightWorking = false
    PlaySound(lightSound)
    gameVisuals.src = imageCloset
}