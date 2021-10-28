import {mat4, quat, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Cylinder from './geometry/Cylinder';
import Mesh from './geometry/Mesh';
import ScreenQuad from './geometry/ScreenQuad';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem'

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  numIter: 6,
  axiom: "FFFFFFFA[///----FFF++++B]A///A////A///A//A",
  angle: 20
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Cylinder;
let leaf: Mesh;
let banana: Mesh;
let lsystem: LSystem;
let time: number = 0.0;

function readObj(filename: string) : string {
  var outstr = "";
  var client = new XMLHttpRequest();
  client.open('GET', filename, false);
  client.onreadystatechange = function() {
    if(client.status === 200 || client.status == 0)
    {
      //alert(client.responseText);
      outstr = client.responseText;
    }
  }
  client.send(null);
  return outstr;
}

function loadLSystem() {
  // TODO init banana obj from mesh

  let leafObjStr: string = readObj("./src/lsystem/obj/banana_leaf.obj");
  leaf = new Mesh(leafObjStr, vec3.fromValues(0, 0, 0));
  leaf.create();

  cylinder = new Cylinder();
  cylinder.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  lsystem = new LSystem(cylinder, leaf, banana);
  lsystem.expand();
  lsystem.draw();
}

function loadScene() {
  cylinder = new Cylinder();
  cylinder.create();
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  const iterControl = gui.add(controls, 'numIter', 1, 10).step(1);
  iterControl.onChange(function() {
    lsystem.setAxiom(controls.axiom);
    lsystem.setNumIter(controls.numIter);
  });
  const axiomControl = gui.add(controls, 'axiom');
  axiomControl.onFinishChange(function() {
    lsystem.setAxiom(controls.axiom);
  });
  const angleControl = gui.add(controls, 'angle');
  angleControl.onFinishChange(function() {    
    lsystem.setAxiom(controls.axiom);
    lsystem.setAngle(controls.angle);
  });

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);
  gl.enable(gl.DEPTH_TEST);

  // Initial call to load scene
  //loadScene();
  loadLSystem();

  const camera = new Camera(vec3.fromValues(20, 70, 20), vec3.fromValues(0, 6, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.9, 0.72, 0, 1);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [cylinder, leaf]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
