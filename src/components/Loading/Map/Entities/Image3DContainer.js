//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import Image3D from "./Image3D";

export default class Image3DContainer extends THREE.Group {
  constructor(trackcurve) {
    // url, position

    super();

    var self = this;

    var add_base = this.add.bind(this);

    self.add = function(object) {

      if (!object.action_data)
        object.action_data = {
          mouseover: {},
          mousedown: {},
          mouseup: {},
        };

      add_base(object);

      object.mouseover = function(){
        return false;
      }

      object.mouseout = function(){
        return false;
      }

      object.mousedown = function(){
        return false;
      }

      object.mouseup = function(){
        return false;
      }

    };

    self.trackcurve = trackcurve;
  }

  mouseover(event)
  {
    return true;
  }

  mouseout(event)
  {
    return true;
  }

  mouseup(event)
  {
    var camera = event.camera;

    var picked_object = event.path[event.path.length - 2]; // because last - is this object

    for ( let i = 0; i < this.children.length; i++)
    {
      let object = this.children[i];

      if (picked_object === object)
        continue;

      if (object.action_data &&
          object.action_data.mouseup &&
          object.action_data.mouseup.state &&
          object.action_data.mouseup.state.isFitToCamera)
      {
        Image3D.zoomToCamera(object, camera);
      }
    }

    Image3D.zoomToCamera(picked_object, camera);

    //let count = this.children.length;
    //if (!this.trackcurve)
    //  return false;

    //var step = 1.0 / count, j = 0;
    //for ( let i = 0; i < count; i++)
    //{
    //  let object = this.children[i];
    //  move_objects_to_path(object, this.trackcurve.getPointAt(j));
    //  j += step;
    //}

    return true;
  }

  static move_objects_to_path(in_object, point)
  {
    var action_timeout = 400;

    var object = in_object;

    if (!object.action_data)
      object.action_data = {
        mouseover: {},
        mousedown: {},
        mouseup: {},
      };

    var action_data = object.action_data;

    if (action_data.mouseup.action) return;

    if (!action_data.mouseup.state) {
      action_data.mouseup.state = {
        isMovedToPath: true,
      };
    } else if (action_data.mouseup.state.isMovedToPath) {
      //
      action_data.mouseup.state.isMovedToPath = false;
    } else if (!action_data.mouseup.state.isMovedToPath) {
      //
      action_data.mouseup.state.isMovedToPath = true;
    }

    var to = {
      pos_x: point.x,
      pos_y: point.y,
      pos_z: point.z,
      /*up_x : parameters.up.x,
              up_y : parameters.up.y,
              up_z : parameters.up.z,
              rot_x : parameters.rotation.x,
              rot_y : parameters.rotation.y,
              rot_z : parameters.rotation.z*/
    };

    if (action_data.mouseup.state.isMovedToPath) {
      //
      action_data.mouseup.state.originalPosition =
        //
        {
          pos_x: object.position.x,
          pos_y: object.position.y,
          pos_z: object.position.z,
          /*up_x : object.up.x,
                  up_y : object.up.y,
                  up_z : object.up.z,
                  rot_x : object.rotation.x,
                  rot_y : object.rotation.y,
                  rot_z : object.rotation.z*/
        };
    } else to = action_data.mouseup.state.originalPosition;

    action_data.mouseup.action = new TWEEN.Tween({
      pos_x: object.position.x,
      pos_y: object.position.y,
      pos_z: object.position.z,
      /*up_x : object.up.x,
              up_y : object.up.y,
              up_z : object.up.z,
              rot_x : object.rotation.x,
              rot_y : object.rotation.y,
              rot_z : object.rotation.z*/
    })
      .to(to, action_timeout)
      .onUpdate(function(obj) {
        var tween_object = {
          position: {
            x: obj.pos_x,
            y: obj.pos_y,
            z: obj.pos_z,
          },
          /*up : {
                      x : obj.up_x,
                      y : obj.up_y,
                      z : obj.up_z
                  },
                  rotation : new THREE.Vector3(
                      obj.rot_x,
                      obj.rot_y,
                      obj.rot_z
                  )*/
        };

        object.position.set(
          tween_object.position.x,
          tween_object.position.y,
          tween_object.position.z
        );
        //object.up.set(tween_object.up.x, tween_object.up.y, tween_object.up.z);
        //object.rotation.set(tween_object.rotation.x, tween_object.rotation.y, tween_object.rotation.z);
      })
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(function() {
        delete action_data.mouseup.action;
      })
      .start();
  }
}
