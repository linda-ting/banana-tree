#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec3 a = vec3(.8,.7,.6);
  vec3 b = vec3(.3,.2,.7);
  vec3 c = vec3(.2,.5,.7);
  vec3 d = vec3(1,.5,.2);
  float t = 0.1 * fs_Pos.y + 0.05 * fs_Pos.x + 0.002 * u_Time;
  out_Col = vec4(palette(t, a, b, c, d), 1.0);
}
