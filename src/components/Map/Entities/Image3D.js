//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class Image3D extends THREE.Mesh {
  constructor(config) {
    // url, position

    super();

    this.config = config;

    let texture;

    if (this.config.url) {
      let textureLoader = new THREE.TextureLoader(new THREE.LoadingManager());
      texture = textureLoader.load(this.config.url);
    }

    let color = this.config.hasOwnProperty('color') ? this.config.color : 0xffffff;
    let opacity = this.config.hasOwnProperty('opacity') ? this.config.opacity : 1.0;

    let geometry = new THREE.BoxGeometry(20000, 32000, 2000, 1, 1, 1);

    let material = new THREE.MeshBasicMaterial({
      map: texture,
      color: color,
      opacity: 1,
      transparent: true,
      //depthTest: true,
      //depthWrite: true,
      //polygonOffset: true,
      //polygonOffsetFactor: -4,
      wireframe: false,
      //blending : THREE.MultiplyBlending
    });

    this.geometry = geometry;
    this.material = material;

    this.action_data = {
      mouseover: {},
      mousedown: {},
      mouseup: {},
    };
  }

  mouseover(event) {
    this.material.color = new THREE.Color(0x0000ff);
    this.material.needsUpdate = true;
    return true;
  }

  mouseout(event) {
    this.material.color = new THREE.Color(0xffffff);
    this.material.needsUpdate = true;
    return true;
  }

  mouseup(event) {
    var camera = event.camera;

    Image3D.zoomToCamera(this, camera);

    return true;
  }

  static zoomToCamera(object, camera, onComplete) {
    var action_timeout = 300;

    if (!object.action_data)
      object.action_data = {
        mouseover: {},
        mousedown: {},
        mouseup: {},
      };

    var action_data = object.action_data;

    if (action_data.mouseup.action) action_data.mouseup.action.stop();

    if (!action_data.mouseup.state) {
      action_data.mouseup.state = {
        isFitToCamera: true,
      };
    } else if (action_data.mouseup.state.isFitToCamera) {
      action_data.mouseup.state.isFitToCamera = false;
    } else if (!action_data.mouseup.state.isFitToCamera) {
      action_data.mouseup.state.isFitToCamera = true;
    }

    var parameters = {};
    fitObjectToCamera(camera, object, parameters);

    var to = {
      pos_x: parameters.position.x,
      pos_y: parameters.position.y,
      pos_z: parameters.position.z,
      up_x: parameters.up.x,
      up_y: parameters.up.y,
      up_z: parameters.up.z,
      rot_x: parameters.rotation.x,
      rot_y: parameters.rotation.y,
      rot_z: parameters.rotation.z,
    };

    if (action_data.mouseup.state.isFitToCamera) {
      //
      action_data.mouseup.state.originalPosition =
        //
        {
          pos_x: object.position.x,
          pos_y: object.position.y,
          pos_z: object.position.z,
          up_x: object.up.x,
          up_y: object.up.y,
          up_z: object.up.z,
          rot_x: object.rotation.x,
          rot_y: object.rotation.y,
          rot_z: object.rotation.z,
        };
    } else {
      to = action_data.mouseup.state.originalPosition;
    }

    action_data.mouseup.action = new TWEEN.Tween({
      pos_x: object.position.x,
      pos_y: object.position.y,
      pos_z: object.position.z,
      up_x: object.up.x,
      up_y: object.up.y,
      up_z: object.up.z,
      rot_x: object.rotation.x,
      rot_y: object.rotation.y,
      rot_z: object.rotation.z,
    })
      .to(to, action_timeout)
      .onUpdate(function(obj) {
        var tween_object = {
          position: {
            x: obj.pos_x,
            y: obj.pos_y,
            z: obj.pos_z,
          },
          up: {
            x: obj.up_x,
            y: obj.up_y,
            z: obj.up_z,
          },
          rotation: new THREE.Vector3(obj.rot_x, obj.rot_y, obj.rot_z),
        };

        object.position.set(
          tween_object.position.x,
          tween_object.position.y,
          tween_object.position.z
        );
        object.up.set(tween_object.up.x, tween_object.up.y, tween_object.up.z);
        object.rotation.set(
          tween_object.rotation.x,
          tween_object.rotation.y,
          tween_object.rotation.z
        );
      })
      .onComplete(function() {
        delete action_data.mouseup.action;

        if (onComplete) onComplete();
      })
      .start();
  }
}

var fitObjectToCamera = function(camera, object, parameters) {
  function visibleBox(camera, z) {
    var t = Math.tan(THREE.Math.degToRad(camera.fov) / 2);
    var h = t * 2 * z;
    var w = h * camera.aspect;
    return new THREE.Box2(new THREE.Vector2(-w, h), new THREE.Vector2(w, -h));
  }

  let boundingBox = new THREE.Box3().setFromObject(object);

  var boundingSphere = new THREE.Sphere();

  boundingBox.getBoundingSphere(boundingSphere);

  let center = boundingSphere.center;

  let radius = boundingSphere.radius;

  let box = visibleBox(camera, radius);

  let dist = radius * box.min.y;

  let vector = new THREE.Vector3();
  camera.getWorldDirection(vector);
  vector.multiplyScalar(dist);
  vector.add(camera.position);

  var tmp_obj = new THREE.Object3D(); // simplest way to get rotation
  tmp_obj.position.set(vector.x, vector.y, vector.z);
  tmp_obj.up.set(camera.up.x, camera.up.y, camera.up.z);
  tmp_obj.lookAt(camera.position);

  parameters.position = tmp_obj.position;
  parameters.up = tmp_obj.up;
  parameters.rotation = tmp_obj.rotation;
};
