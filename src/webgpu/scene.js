// `Module 3: Scene ===`;

export function Scene() {
  this.objects = [];
}

Scene.prototype.add = function (object) {
  this.objects.push(object);
};

Scene.prototype.getObjects = function (object) {
  return this.objects;
};
