#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;

const vec4 lightPos = vec4(5, 15, 10, 1);

void main()
{
  // transform using input transformation
  mat4 transform = mat4(vs_Transform1, vs_Transform2, vs_Transform3, vs_Transform4);
  fs_Pos = transform * vs_Pos;
  vec3 newNor = (transform * vs_Nor).xyz;
  fs_Nor = vec4(normalize(newNor), 1);
  fs_Col = vs_Col;
  fs_LightVec = lightPos - fs_Pos;
  
  gl_Position = u_ViewProj * fs_Pos;
}
