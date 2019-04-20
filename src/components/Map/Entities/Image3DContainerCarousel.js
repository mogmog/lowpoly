//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import Image3D from './Image3D';
import Image3DContainer from './Image3DContainer';

export default class Image3DContainerCarousel extends Image3DContainer {
  constructor() {
    super();

    var self = this;

    self.groupImage = new Image3D({
      color: 0x4648a2,
      opacity: 1,
    });

    self.add(self.groupImage);

    var sprite = new THREE.Sprite();
    sprite.position.set(140, 180, 0);
    sprite.scale.set(100, 100, 100);

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.width = 64;
    canvas.height = 64;

    sprite.material = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthTest: true,
      depthWrite: true,
    });

    self.groupImage.add(sprite);

    function drawNumber(num) {
      let ctx = canvas.getContext('2d');

      let x = 32;
      let y = 32;
      let radius = 30;
      let startAngle = 0;
      let endAngle = Math.PI * 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.fill();

      ctx.strokeStyle = 'rgb(255, 255, 255)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.stroke();

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(num, x, y);

      sprite.material.map.needsUpdate = true;
    }

    drawNumber(0);

    // now override the base class

    var add_base = this.add.bind(self);

    self.add = function(object) {
      add_base(object);

      object.action_data.grid = {};
      object.action_data.grid.action = null;

      object.visible = false;

      let objectCount = self.children.length - 1; // -1, because self.groupImage is not used for calc

      // makeGrid();

      drawNumber(objectCount);
    };

    var remove_base = this.remove.bind(self);

    self.remove = function(object) {
      remove_base(object);

      let objectCount = self.children.length - 1;

      // makeGrid();

      drawNumber(objectCount);
    };
  }

  mouseover(event) {
    return true;
  }

  mouseout(event) {
    return true;
  }

  mouseup(event) {
    var self = this;

    function makeGrid() {
      let objectCount = self.children.length - 1; // -1, because self.groupImage is not used for calc

      let width = 750 / 2; // TODO  - remove static size - 750;

      let margin = 50;

      let pos_x = 0; // - ( width + margin ) / 2 * objectCount / 2;

      let step = width + margin;

      var arr = [];

      for (let i = 0; i < self.children.length; i++) {
        let object = self.children[i];

        if (self.groupImage === object) continue;

        arr.push({
          object: object,
          x: pos_x,
        });

        pos_x += step;
      }

      return arr;
    }

    var camera = event.camera;

    var picked_object = event.path[event.path.length - 2]; // because last - is this object

    let grid_action_timeout = 300;

    let grid = makeGrid();

    if (picked_object == self.groupImage) {
      for (let i = 0; i < grid.length; i++) {
        let grid_obj = grid[i];

        let object = grid_obj.object;

        object.visible = true;

        if (object.action_data.grid.action) object.action_data.grid.action.stop();

        object.action_data.grid.action = new TWEEN.Tween({
          pos_x: object.position.x,
        })
          .to(
            {
              pos_x: grid_obj.x,
            },
            grid_action_timeout
          )
          .onUpdate(function(obj) {
            grid_obj.object.position.x = obj.pos_x;
          })
          .onComplete(function() {
            delete object.action_data.grid.action;
          })
          //.delay(Math.floor(Math.random() * 100))
          .start();
      }

      self.groupImage.visible = false;

      Image3D.zoomToCamera(this, camera);
    } else {
      for (let i = 0; i < grid.length; i++) {
        let grid_obj = grid[i];

        let object = grid_obj.object;

        if (object.action_data.grid.action) object.action_data.grid.action.stop();

        object.action_data.grid.action = new TWEEN.Tween({
          pos_x: object.position.x,
        })
          .to(
            {
              pos_x: 0,
            },
            grid_action_timeout
          )
          .onUpdate(function(obj) {
            grid_obj.object.position.x = obj.pos_x;
          })
          .onComplete(function() {
            delete object.action_data.grid.action;
          })
          //.delay(Math.floor(Math.random() * 100))
          .start();
      }

      Image3D.zoomToCamera(this, camera, function() {
        for (let i = 0; i < self.children.length; i++) {
          let object = self.children[i];

          object.visible = false;
        }

        self.groupImage.visible = true;
      });
    }

    // self.groupImage.material.color = new THREE.Color(Math.floor(Math.random() * Math.floor(0xffffff)));

    /*for ( let i = 0; i < this.children.length; i++)
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
    */

    return true;
  }
}
