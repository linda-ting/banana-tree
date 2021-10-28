import {vec3, mat4} from 'gl-matrix';
import Cylinder from '../geometry/Cylinder';
import Mesh from '../geometry/Mesh';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule'
import DrawingRule from './DrawingRule'

export default class LSystem {
  numIter: number = 7;
  axiom: string = "FFFFFFFA[///----FFF++++B]A///A////A///A//A";
  angle: number = 20;
  expansionRules: Map<string, ExpansionRule> = new Map();
  drawingRules: Map<String, DrawingRule> = new Map();
  turtle: Turtle;
  cylinder: Cylinder;
  leaf: Mesh;
  banana: Mesh;

  numCyl: number = 0;
  cylTransfArrX: number[] = [];
  cylTransfArrY: number[] = [];
  cylTransfArrZ: number[] = [];
  cylTransfArrW: number[] = [];
  cylColorArr: number[] = [];

  numLeaf: number = 0;
  leafTransfArrX: number[] = [];
  leafTransfArrY: number[] = [];
  leafTransfArrZ: number[] = [];
  leafTransfArrW: number[] = [];
  leafColorArr: number[] = [];

  numBanana: number = 0;
  banaTransfArrX: number[] = [];
  banaTransfArrY: number[] = [];
  banaTransfArrZ: number[] = [];
  banaTransfArrW: number[] = [];
  banaColorArr: number[] = [];

  constructor(cylinder: Cylinder, leaf: Mesh, banana: Mesh) {
    this.cylinder = cylinder;
    this.leaf = leaf;
    this.banana = banana;
    this.init();
  }

  init() {
    this.expansionRules.set("A", new ExpansionRule("A", "[F^///---A][&\\++G]"));
    this.expansionRules.set("G", new ExpansionRule("G", "+F+E"));
    this.expansionRules.set("B", new ExpansionRule("B", "[^^C][^^--C][&&++C][///dB]&-C"));

    // branch
    this.drawingRules.set("F", new DrawingRule("F", this.cylinder, () => {
      let transform: mat4 = this.turtle.getTransformation();
      this.cylTransfArrX.push(transform[0], transform[1], transform[2], transform[3]);
      this.cylTransfArrY.push(transform[4], transform[5], transform[6], transform[7]);
      this.cylTransfArrZ.push(transform[8], transform[9], transform[10], transform[11]);
      this.cylTransfArrW.push(transform[12], transform[13], transform[14], transform[15]);
      this.cylColorArr.push(0.3, 0.2, 0.1, 1);
      this.numCyl++;
    }));

    // leaves
    this.drawingRules.set("E", new DrawingRule("E", this.leaf, () => {
      let transform: mat4 = this.turtle.getTransformation();
      this.leafTransfArrX.push(transform[0], transform[1], transform[2], transform[3]);
      this.leafTransfArrY.push(transform[4], transform[5], transform[6], transform[7]);
      this.leafTransfArrZ.push(transform[8], transform[9], transform[10], transform[11]);
      this.leafTransfArrW.push(transform[12], transform[13], transform[14], transform[15]);
      this.leafColorArr.push(0.4, 0.8, 0.3, 1);
      this.numLeaf++;
    }));

    // CHANGE CYLINDER TO BANANA!!!
    // banana
    this.drawingRules.set("C", new DrawingRule("C", this.cylinder, () => {
      let transform: mat4 = this.turtle.getTransformation();
      this.cylTransfArrX.push(transform[0], transform[1], transform[2], transform[3]);
      this.cylTransfArrY.push(transform[4], transform[5], transform[6], transform[7]);
      this.cylTransfArrZ.push(transform[8], transform[9], transform[10], transform[11]);
      this.cylTransfArrW.push(transform[12], transform[13], transform[14], transform[15]);
      this.cylColorArr.push(0.9, 0.7, 0.1, 1);
      this.numCyl++;
      /*
      this.banaTransfArrX.push(transform[0], transform[1], transform[2], transform[3]);
      this.banaTransfArrY.push(transform[4], transform[5], transform[6], transform[7]);
      this.banaTransfArrZ.push(transform[8], transform[9], transform[10], transform[11]);
      this.banaTransfArrW.push(transform[12], transform[13], transform[14], transform[15]);
      this.banaColorArr.push(0.9, 0.7, 0.1, 1);
      this.numBanana++;
      */
    }));
  }

  reset() {
    this.numCyl = 0;
    this.numLeaf = 0;
    this.numBanana = 0;

    // TODO fix smth with instance vbos (coloring) after resetting/redrawing

    this.cylTransfArrX = [];
    this.cylTransfArrY = [];
    this.cylTransfArrZ = [];
    this.cylTransfArrW = [];

    this.leafTransfArrX = [];
    this.leafTransfArrY = [];
    this.leafTransfArrZ = [];
    this.leafTransfArrW = [];

    this.banaTransfArrX = [];
    this.banaTransfArrY = [];
    this.banaTransfArrZ = [];
    this.banaTransfArrW = [];
  }

  expand() {
    var expandedAxiom = "";
    for (var iter = 0; iter < this.numIter; iter++) {
      for (var i = 0; i < this.axiom.length; i++) {
        var symbol = this.axiom[i];
  
        if (symbol == "[" || symbol == "]") {
          expandedAxiom += symbol;
          continue;
        }
  
        let expansionRule = this.expansionRules.get(symbol);
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
      this.axiom = expandedAxiom;
      expandedAxiom = "";
    }
    console.log(this.axiom);
  }

  // draws l system after it has been expanded
  draw() {
    let stack: Turtle[] = [];
    this.turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0), vec3.fromValues(1, 0, 0), 0);
  
    // draw expanded symbols
    let depth: number = 0;
    for (var i = 0; i < this.axiom.length; i++) {
      var symbol = this.axiom[i];
  
      if (symbol == "[") {
        // push new Turtle to stack
        depth++;
        let newTurtle: Turtle = new Turtle(vec3.clone(this.turtle.position), 
                                           vec3.clone(this.turtle.forward), 
                                           vec3.clone(this.turtle.up), 
                                           vec3.clone(this.turtle.right), 
                                           depth);
        stack.push(newTurtle);
        continue;
      } else if (symbol == "]") {
        depth--;
        this.turtle = stack.pop();
        continue;
      } else if (symbol == "F" || symbol == "f") {
        this.turtle.moveUp();
      } else if (symbol == "d") {
        this.turtle.moveDown();
      } else if (symbol == "+") {
        this.turtle.rotateForward(this.angle);
      } else if (symbol == "-") {
        this.turtle.rotateForward(-this.angle);
      } else if (symbol == "&") {
        this.turtle.rotateRight(this.angle);
      } else if (symbol == "^") {
        this.turtle.rotateRight(-this.angle);
      } else if (symbol == "\\") {
        this.turtle.rotateUp(this.angle);
      } else if (symbol == "/") {
        this.turtle.rotateUp(-this.angle);
      }
  
      let drawingRule = this.drawingRules.get(symbol);
      if (drawingRule == null) continue;
      drawingRule.draw();
    }
  
    let cylTransfX: Float32Array = new Float32Array(this.cylTransfArrX);
    let cylTransfY: Float32Array = new Float32Array(this.cylTransfArrY);
    let cylTransfZ: Float32Array = new Float32Array(this.cylTransfArrZ);
    let cylTransfW: Float32Array = new Float32Array(this.cylTransfArrW);
    let cylColors: Float32Array = new Float32Array(this.cylColorArr);
    this.cylinder.setInstanceVBOs(cylTransfX, cylTransfY, cylTransfZ, cylTransfW, cylColors);
    this.cylinder.setNumInstances(this.numCyl);
  
    let leafTransfX: Float32Array = new Float32Array(this.leafTransfArrX);
    let leafTransfY: Float32Array = new Float32Array(this.leafTransfArrY);
    let leafTransfZ: Float32Array = new Float32Array(this.leafTransfArrZ);
    let leafTransfW: Float32Array = new Float32Array(this.leafTransfArrW);
    let leafColors: Float32Array = new Float32Array(this.leafColorArr);
    this.leaf.setInstanceVBOs(leafTransfX, leafTransfY, leafTransfZ, leafTransfW, leafColors);
    this.leaf.setNumInstances(this.numLeaf);
  }

  // something has been updated! re-expand the axiom and redraw
  redraw() {
    this.reset();
    this.expand();
    this.draw();
  }

  // set number of iterations
  setNumIter(iter: number) {
    this.numIter = iter;
    this.redraw();
  }

  // set new axiom
  setAxiom(axiom: string) {
    this.axiom = axiom;
    console.log("new axiom: " + this.axiom);
    this.redraw();
  }

  // set default rotation angle
  setAngle(angle: number) {
    this.angle = angle;
    this.redraw();
  }
}