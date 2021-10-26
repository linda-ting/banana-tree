import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cylinder extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
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
    let normalsArray: Array<number> = [];

    for (var i = 0; i < this.subdivisions; i++) {
      const theta = i * 2.0 * Math.PI / this.subdivisions;
      const x = this.radius * Math.cos(theta);
      const y = this.radius * Math.sin(theta);
      positionsArray.push(x, y, 0, 1);
      positionsArray.push(x, y, this.height, 1);

      var nextTheta;
      if (i == this.subdivisions - 1) {
        nextTheta = 0.0;
      } else {
        nextTheta = (i + 1) * 2.0 * Math.PI / this.subdivisions;
      }
      const nextX = this.radius * Math.cos(nextTheta);
      const nextY = this.radius * Math.sin(nextTheta);
      positionsArray.push(nextX, nextY, 0, 1);
      positionsArray.push(nextX, nextY, this.height, 1);

      // calculate normals
      let normal: vec3 = vec3.create();
      vec3.normalize(normal, vec3.fromValues((x + nextX) / 2.0, (y + nextY) / 2.0, 0));
      normalsArray.push(normal[0], normal[1], 0, 0);
      normalsArray.push(normal[0], normal[1], 0, 0);
      normalsArray.push(normal[0], normal[1], 0, 0);
      normalsArray.push(normal[0], normal[1], 0, 0);

      // write triangle indices
      indicesArray.push(4 * i, 4 * i + 3, 4 * i + 1);
      indicesArray.push(4 * i, 4 * i + 2, 4 * i + 3);

      /*
      let normal: vec3 = vec3.create();
      vec3.normalize(normal, vec3.fromValues(x, y, 0));
      normalsArray.push(normal[0], normal[1], 0);
      normalsArray.push(normal[0], normal[1], 0);

      if (i == this.subdivisions - 1) {
        // if this is the last subdivision, link last face to first
        indicesArray.push(2 * i, 2 * i + 1, 1);
        indicesArray.push(2 * i, 0, 1);
      } else {
        indicesArray.push(2 * i, 2 * i + 1, 2 * i + 2);
        indicesArray.push(2 * i, 2 * i + 2, 2 * i + 3);
      }*/
    }

    this.indices = new Uint32Array(indicesArray);
    this.positions = new Float32Array(positionsArray);
    this.normals = new Float32Array(normalsArray);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateCol();
    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    
    console.log(`Created cylinder`);
  }

  setInstanceVBOs(transform1: Float32Array, transform2: Float32Array, transform3: Float32Array, transform4: Float32Array) {
    //this.colors = colors;
    this.transform1 = transform1;
    this.transform2 = transform2;
    this.transform3 = transform3;
    this.transform4 = transform4;

    /*
    // bind colors
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
*/

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
