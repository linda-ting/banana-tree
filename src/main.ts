import {mat4, quat, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cylinder from './geometry/Cylinder';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './lsystem/Turtle'
import ExpansionRule from './lsystem/ExpansionRule'
import DrawingRule from './lsystem/DrawingRule'

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Cylinder;
let time: number = 0.0;

function loadLSystem() {
  // create geometry
  cylinder = new Cylinder();
  cylinder.create();
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // set up instanced rendering data arrays
  let n: number = 0;
  let transformsArray1: number[] = [];
  let transformsArray2: number[] = [];
  let transformsArray3: number[] = [];
  let transformsArray4: number[] = [];
  let colorsArray: number[] = [];

  let numIter: number = 3;
  let axiom: string = "F";

  let expansionRules: Map<string, ExpansionRule> = new Map();
  expansionRules.set("F", new ExpansionRule("F", "FF"));
  // TODO create & populate these rules

  let drawingRules: Map<string, DrawingRule> = new Map();
  drawingRules.set("F", new DrawingRule("F", cylinder, () => {
    let transform: mat4 = mat4.create();
    let scale: vec3 = vec3.fromValues(1, 1, 1);
    //mat4.fromRotationTranslation(transform, turtle.orientation, turtle.position);
    mat4.fromRotationTranslationScale(transform, turtle.orientation, turtle.position, scale);

    transformsArray1.push(transform[0], transform[1], transform[2], transform[3]);
    transformsArray2.push(transform[4], transform[5], transform[6], transform[7]);
    transformsArray3.push(transform[8], transform[9], transform[10], transform[11]);
    transformsArray4.push(transform[12], transform[13], transform[14], transform[15]);

    /*
    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);
    colorsArray.push(1.0);*/
  }));
  // TODO create & populate these rules

  var expandedAxiom = "";
  for (var iter = 0; iter < numIter; iter++) {
    for (var i = 0; i < axiom.length; i++) {
      var symbol = axiom[i];

      if (symbol == "[" || symbol == "]") {
        expandedAxiom += symbol;
        continue;
      }

      let expansionRule = expansionRules.get(symbol);
      if (expansionRule) {
        // if rule exists for this character, add expanded expression
        var expandedSymbol = expansionRule.expand();
        expandedAxiom += expandedSymbol;
      } else {
        // otherwise, leave as is
        expandedAxiom += symbol;
      }
    }

    // replace axiom
    axiom = expandedAxiom;
    expandedAxiom = "";
  }
  console.log(axiom);

  let stack: Turtle[] = [];
  let turtle: Turtle = new Turtle(vec3.fromValues(0, 0, 0), quat.fromValues(0, 0, 0, 1), 0);

  // draw expanded symbols
  for (var i = 0; i < axiom.length; i++) {
    var symbol = axiom[i];

    if (symbol == "[") {
      // push new Turtle to stack
      let newTurtle: Turtle = new Turtle(turtle.position, turtle.orientation, turtle.depth + 1);
      stack.push(newTurtle);
      continue;
    } else if (symbol == "]") {
      // pop Turtle off of stack
      turtle = stack.pop();
      continue;
    } else if (symbol == "F") {
      turtle.moveForward();
    }
    // TODO other symbols modify turtle orientation and position

    let drawingRule = drawingRules.get(symbol);
    if (drawingRule == null) continue;
    drawingRule.draw();
    n++;
  }

  let transforms1: Float32Array = new Float32Array(transformsArray1);
  let transforms2: Float32Array = new Float32Array(transformsArray2);
  let transforms3: Float32Array = new Float32Array(transformsArray3);
  let transforms4: Float32Array = new Float32Array(transformsArray4);
  //let colors: Float32Array = new Float32Array(colorsArray);

  cylinder.setInstanceVBOs(transforms1, transforms2, transforms3, transforms4);
  cylinder.setNumInstances(n);
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

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  //loadScene();
  loadLSystem();

  const camera = new Camera(vec3.fromValues(10, 20, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

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
    //renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [cylinder]);
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
