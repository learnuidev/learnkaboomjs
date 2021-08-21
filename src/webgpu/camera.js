import { mat4, vec3 } from "gl-matrix";

export function Camera({ x, y, z, rotX, rotY, rotZ, fovy, aspect, near, far }) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.rotX = rotX || 0;
  this.rotY = rotY || 0;
  this.rotZ = rotZ || 0;

  this.fovy = fovy || (2 * Math.PI) / 5;
  this.aspect = aspect || 16 / 9;

  this.near = near || 1;
  this.far = far || 1000;
}

Camera.prototype.getViewMatrix = function () {
  let viewMatrix = mat4.create();

  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(this.x, this.y, this.z),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0)
  );

  mat4.rotateX(viewMatrix, viewMatrix, this.rotX);
  mat4.rotateY(viewMatrix, viewMatrix, this.rotY);
  mat4.rotateZ(viewMatrix, viewMatrix, this.rotZ);
  return viewMatrix;
};

Camera.prototype.getProjectionMatrix = function () {
  let projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    this.fovy,
    this.aspect,
    this.near,
    this.far
  );
  return projectionMatrix;
};

Camera.prototype.getCameraViewProjMatrix = function () {
  const viewProjMatrix = mat4.create();
  const view = this.getViewMatrix();
  const proj = this.getProjectionMatrix();
  mat4.multiply(viewProjMatrix, proj, view);
  return viewProjMatrix;
};
