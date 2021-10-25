import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cylinder extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  //offsets: Float32Array; // Data for bufTranslate
  subdivisions: number = 4;
  radius: number = 1.0;
  height: number = 1.0;
  transform1: Float32Array;
  transform2: Float32Array;
  transform3: Float32Array;
  transform4: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {
    let indicesArray: Array<number> = [];
    let positionsArray: Array<number> = [];

    for (var i = 0; i < this.subdivisions; i++) {
      const theta = i * 2.0 * Math.PI / this.subdivisions;
      const x = this.radius * Math.cos(theta);
      const y = this.radius * Math.sin(theta);

      positionsArray.push(x, y, 0);
      positionsArray.push(x, y, this.height);

      if (i == this.subdivisions - 1) {
        // if this is the last subdivision, link last face to first
        indicesArray.push(2 * i, 2 * i + 1, 1);
        indicesArray.push(2 * i, 0, 1);
      } else {
        indicesArray.push(2 * i, 2 * i + 1, 2 * i + 2);
        indicesArray.push(2 * i, 2 * i + 2, 2 * i + 3);
      }
    }

    this.indices = new Uint32Array(indicesArray);
    this.positions = new Float32Array(positionsArray);

  /*this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.5, -0.5, 0, 1,
                                     0.5, -0.5, 0, 1,
                                     0.5, 0.5, 0, 1,
                                     -0.5, 0.5, 0, 1]);
                                     */

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateTranslate();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cylinder`);
  }

  setInstanceVBOs(transform1: Float32Array, transform2: Float32Array, transform3: Float32Array, transform4: Float32Array, colors: Float32Array) {
    this.colors = colors;
    //this.offsets = offsets;
    this.transform1 = transform1;
    this.transform2 = transform2;
    this.transform3 = transform3;
    this.transform4 = transform4;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    //gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    //gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);

    // bind transformation matrix data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.transform1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.transform2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.transform3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform4);
    gl.bufferData(gl.ARRAY_BUFFER, this.transform4, gl.STATIC_DRAW);
  }
};

export default Cylinder;
