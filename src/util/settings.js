// Main settings

export function colorPresetLight() {
   let parede = 'rgb(255,246,198)'
   this.garageWalls = parede
   this.basePlaneTexture = './assets/intertravado.jpg'
   this.garageFloorTexture = './assets/paper.png'
   this.gesso = './assets/gesso.jpg'
   this.floorSides = parede
   this.secondFloorWalls = parede
   this.secondFloorTeto = './assets/teto.jpg'
   this.grass = './assets/grass.jpg'
   this.secondFloorMat = './assets/wood.png'
   this.thirdFloorMat = './assets/darkcement.jpg'
   this.cmat = './assets/porcelanatoC.png'
   this.bronze = 'rgb(128,74,1)'//'rgb(180,100,30)'
}

export function colorPresetDark() 
{
}

// Porta comum
function doorSettings() {
   this.l = 0.74
   this.p = 0.40   
   this.a = 2.20
}

// Porta principal
function doorMainSettings() {
   this.l = 0.94
   this.p = 0.40
   this.a = 2.20
}

// Porta principal
function doorVidroSettings() {
   this.l = 2.0
   this.p = 0.40
   this.a = 2.0
}

function smallWindow50x70Settings() {
   this.l = 0.80
   this.p = 0.40
   this.a = 0.60 
}

// Export settings variables
export let door = new doorSettings()
export let doorMain = new doorMainSettings()
export let doorVidro = new doorVidroSettings()
export let color = new colorPresetLight();
export let smallWindow50x70 = new smallWindow50x70Settings()
