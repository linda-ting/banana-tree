import { quat, vec3 } from 'gl-matrix';

export default class Turtle {
  position: vec3 = vec3.create();
  orientation: quat = quat.create();
  depth: number = 0;

  constructor(pos: vec3, ori: quat, depth: number) {
    this.position = pos;
    this.orientation = ori;
    this.depth = depth;
  }

  // moves turtle forward along current orientation
  moveForward() {
    //let delta: vec3 = vec3.create();
    //vec3.scale(delta, this.orientation, 10.0);
    let delta: vec3 = vec3.create();
    vec3.transformQuat(delta, vec3.fromValues(0, 0, 1), this.orientation);
    vec3.add(this.position, this.position, delta);
  }

  // TODO move in other directions

  // TODO rotate in other directions
}