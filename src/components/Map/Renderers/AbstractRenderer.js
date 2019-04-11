//
//
//

import * as THREE from 'three';

function AbstractRenderer() {
  this.camera = new THREE.PerspectiveCamera();
  this.scene = new THREE.Scene();
}

// static - used for redraw
AbstractRenderer.prototype.needRedraw = false;

AbstractRenderer.prototype.setup = function() {
  throw 'AbstractRenderer.prototype.setup';
};

//AbstractRenderer.prototype.onRequestAnimationFrame = function(time){throw "AbstractRenderer.prototype.onRequestAnimationFrame"};

AbstractRenderer.prototype.start = function() {
  throw 'AbstractRenderer.prototype.start';
};

AbstractRenderer.prototype.render = function() {
  throw 'AbstractRenderer.prototype.render';
};

AbstractRenderer.prototype.onSwipe = function(isLeft, event) {
  throw 'AbstractRenderer.prototype.onSwipe';
};

AbstractRenderer.prototype.onMouseMove = function(mouse, event) {
  var camera = this.camera;

  if (!camera) return;

  var raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(this.scene.children || [], true);

  if (intersects.length > 0) {
    let object = intersects[0].object;

    if (this.onMouseMove.current !== object) {
      //
      if (this.onMouseMove.current)
        AbstractRenderer.prototype.___bubble_event(this.onMouseMove.current, 'mouseout', {
          camera: camera,
        });

      AbstractRenderer.prototype.___bubble_event(object, 'mouseover', {
        camera: camera,
      });

      this.onMouseMove.current = object;
    }
  } else {
    if (this.onMouseMove.current)
      AbstractRenderer.prototype.___bubble_event(this.onMouseMove.current, 'mouseout', {
        camera: camera,
      });

    this.onMouseMove.current = null;
  }
};

AbstractRenderer.prototype.onMouseDown = function(mouse, event) {
  var camera = this.camera;

  if (!camera) return;

  if (event.which === 1) {
    var raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;

      AbstractRenderer.prototype.___bubble_event(object, 'mousedown', {
        camera: camera,
      });
    }
  }
};

AbstractRenderer.prototype.onMouseUp = function(mouse, event) {
  var camera = this.camera;

  if (!camera) return;

  if (event.which === 1) {
    var raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;

      AbstractRenderer.prototype.___bubble_event(object, 'mouseup', {
        camera: camera,
      });
    }
  }
};

AbstractRenderer.prototype.___bubble_event = function(object, f_name, event) {
  if (!object) return;

  if (!event.path) event.path = [];

  event.path.push(object);

  if (object[f_name]) {
    let bStopPropagation = object[f_name](event);

    if (bStopPropagation) return;
  }

  AbstractRenderer.prototype.___bubble_event(object.parent, f_name, event);
};

export default AbstractRenderer;
