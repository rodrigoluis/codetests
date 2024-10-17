import * as THREE from 'three';
import {TrackballControls} from './build/jsm/controls/TrackballControls.js';
import {FlyControls} from './build/jsm/controls/FlyControls.js';
import {OBJLoader} from './build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from './build/jsm/loaders/MTLLoader.js';
import {initRenderer, 
   initDefaultBasicLight,
   InfoBox,
   onWindowResize,
   getMaxSize,
   setMaterial,
   createGroundPlaneXZ} from './util/util.js';
import GUI from './util/dat.gui.module.js';
import {color} from "./util/settings.js";
import { setVRMode,
         moveVR} from "./util/VRMode.js";
var scene = new THREE.Scene();    // Create main scene
let clock = new THREE.Clock();
var renderer = initRenderer();    // View function in util/utils
   renderer.setClearColor(new THREE.Color(color.sky));

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;

let flyMode = false;

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
initDefaultBasicLight(scene, true, new THREE.Vector3(6, 25, 35), 100, 1024, 0.1, 400, 0.4) ;	
initDefaultBasicLight(scene, false, new THREE.Vector3(0, 50, 0), 100, 1024, 0.1, 400, 0.2) ;	


// var light = initDefaultSpotlight(scene, new THREE.Vector3(-10, -2, -2)); // Use default light
// //    light.target.position.y = 0.5
// // Main camera
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(2, 1, 3);    
  camera.up.set( 0, 1, 0 );

// Main camera
let cameraFly = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
  cameraFly.position.set(2, 1, 3);    
  cameraFly.up.set( 0, 1, 0 );

  // Enable mouse rotation, pan, zoom etc.
let trackballControls = new TrackballControls( camera, renderer.domElement );

let flyCamera = new FlyControls( cameraFly, renderer.domElement );
   flyCamera.movementSpeed = 1;
   flyCamera.domElement = renderer.domElement;
   flyCamera.rollSpeed = 0.2;

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 7 );
scene.add( axesHelper );

//-- Create VR button and settings ---------------------------------------------------------------

// VR Camera
var cameraVR = setVRMode(renderer, scene)

// create base plan
let basePlane = createGroundPlaneXZ(10, 10, 10, 10, 0, -0.01, 0.5)
    basePlane.material = setMaterial(null,color.basePlaneTexture, 15, 15);
scene.add(basePlane);

// let groundPlane = createGroundPlaneXZ(5, 5, 10, 10, 0, -0.02, 0.5)
//     groundPlane.material = setMaterial(null,color.sand, 15, 15);
// scene.add(groundPlane);


//-- CREATING THE EQUIRECTANGULAR MAP ---------------------------------------------------------------------
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( color.panorama );
	textureEquirec.mapping = THREE.EquirectangularReflectionMapping; // Reflection as default
	textureEquirec.encoding = THREE.sRGBEncoding;
// Set scene's background as a equirectangular map
scene.background = textureEquirec;

// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");


loadOBJFile('./sweetHomeExport/', 'layout13', true, 2.0);

buildInterface();
animate();

function loadOBJFile(modelPath, modelName, visibility, desiredScale)
{
  var mtlLoader = new MTLLoader( );
  mtlLoader.setPath( modelPath );
  mtlLoader.load( modelName + '.mtl', function ( materials ) {
      materials.preload();

      var objLoader = new OBJLoader( );
      objLoader.setMaterials(materials);
      objLoader.setPath(modelPath);
      objLoader.load( modelName + ".obj", function ( obj ) {
         obj.name = modelName;
         obj.visible = visibility;
         obj.traverse( function (child)
         {
            if( child.isMesh ){
               child.castShadow = true;
               //child.receiveShadow = true;               
            }
            if( child.material ) child.material.side = THREE.DoubleSide; 
         });

         var obj = normalizeAndRescale(obj, desiredScale);
         var obj = fixPosition(obj);

         scene.add ( obj );
         //assetManager[modelName] = obj;
      });
  });
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); 
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}


function buildInterface()
{
 
   // Interface
   var controls = new function ()
   {
      this.speed = flyCamera.movementSpeed;      
      this.flyMode = false;

      this.onFlyMode = function(){
         flyMode = this.flyMode;
      };
      this.onUpdateSpeed = function(){
         flyCamera.movementSpeed = this.speed;
       };      
   }; 

   var gui = new GUI();
   gui.add(controls, 'flyMode', true)
      .onChange(function() { controls.onFlyMode() })
      .name("Fly Mode"); 
   gui.add(controls, 'speed', 0.01, 1.0)
      .name("Fly Speed")
      .onChange(function(e) { controls.onUpdateSpeed() });       
}

//-- Main loop -----------------------------------------------------------------------------------
function animate() 
{
	renderer.setAnimationLoop( render );
}

function render()
{
  //stats.update(); // Update FPS

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
     moveVR( flyCamera.movementSpeed); 
     renderer.render(scene, cameraVR) // Render scene
  }
}
