import * as THREE from 'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import { FlyControls } from '../../build/jsm/controls/FlyControls.js';
import {initRenderer, 
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        degreesToRadians} from "../libs/util/util.js";
import {createFirstFloor} from './firstFloor.js'
import {createSecondFloor} from './secondFloor.js'
import {createThirdFloor} from './thirdFloor.js'
import {color} from "./util/settings.js";
import { setVRMode,
         moveVR} from "./util/VRMode.js";

var stats = new Stats();          // To show FPS information
var scene = new THREE.Scene();    // Create main scene
let clock = new THREE.Clock();
var renderer = initRenderer();    // View function in util/utils
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;

let flyMode = true;

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
initDefaultBasicLight(scene, true, new THREE.Vector3(25, 30, 20), 100, 1024, 0.1, 200) ;	

// Main camera
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(21, 12, 12);    
  camera.up.set( 0, 1, 0 );

// Main camera
let cameraFly = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  cameraFly.position.set(21, 12, 12);    
  cameraFly.up.set( 0, 1, 0 );

  // Enable mouse rotation, pan, zoom etc.
let trackballControls = new TrackballControls( camera, renderer.domElement );
   //trackballControls.target.set(7,0,3);
   trackballControls.target.set(10,3,-4);   

let flyCamera = new FlyControls( cameraFly, renderer.domElement );
   flyCamera.movementSpeed = 5;
   flyCamera.domElement = renderer.domElement;
   flyCamera.rollSpeed = 0.2;


// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 7 );
scene.add( axesHelper );

//-- Create VR button and settings ---------------------------------------------------------------

// VR Camera
var cameraVR = setVRMode(renderer, scene)

//-- First Floor ---------------------------------------------
let firstFloor = createFirstFloor(color);
scene.add(firstFloor);

// //-- Second Floor ---------------------------------------------
// let secondFloor = createSecondFloor(color);
// scene.add(secondFloor);

// //-- Third Floor ---------------------------------------------
// let thirdFloor = createThirdFloor(color);
// //thirdFloor.visible = false;
// scene.add(thirdFloor);

// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");

buildInterface();
animate();


function buildInterface()
{
   // Interface
   var controls = new function ()
   {
      this.flyMode = true;

      this.onFlyMode = function(){
         flyMode = this.flyMode;
      };
   }; 

  var gui = new GUI();
  gui.add(controls, 'flyMode', true)
    .onChange(function() { controls.onFlyMode() })
    .name("Fly Mode");  
  //gui.add(firstFloor, 'visible', true).name("First Floor");
//   gui.add(secondFloor, 'visible', true).name("Second Floor");
//   gui.add(thirdFloor, 'visible', true).name("Third Floor");
}

//-- Main loop -----------------------------------------------------------------------------------
function animate() 
{
	renderer.setAnimationLoop( render );
}

function render()
{
  stats.update(); // Update FPS

   if(!renderer.xr.isPresenting)
   {
      if(flyMode)
      {
         flyCamera.update(clock.getDelta()); 
         renderer.render(scene, cameraFly) // Render scene
      }
      else
      {
         trackballControls.update(); // Enable mouse movements
         renderer.render(scene, camera) // Render scene
      }
  }
  else
  {
     moveVR(); 
     renderer.render(scene, cameraVR) // Render scene
  }
}
