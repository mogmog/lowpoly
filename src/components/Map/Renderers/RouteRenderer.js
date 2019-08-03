//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import AbstractRenderer from './AbstractRenderer';

import RouteEntity from '../Entities/RouteEntity';
import RouteEntityMesh from '../Entities/RouteEntityMesh';


export default class RouteRenderer extends AbstractRenderer {

  constructor(esriLoaderContext, paths) {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene

    this.geo_curve_path = paths;
  }

  /**
   * Setup function, called once
   */
  setup(context)
  {
    var self = this;

    var externalRenderers = this.esriLoaderContext.externalRenderers;
    var SpatialReference = this.esriLoaderContext.SpatialReference;

    var view = context.view;

    // initialize the three.js renderer
    //////////////////////////////////////////////////////////////////////////////////////
    this.renderer = new THREE.WebGLRenderer({
      context: context.gl,
      //premultipliedAlpha: false
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);

    // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
    this.renderer.autoClear = false;
    this.renderer.autoClearDepth = false;
    this.renderer.autoClearStencil = false;
    this.renderer.autoClearColor = false;

    this.renderer.localClippingEnabled = true; // need fo clipping plane usage

    // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
    // We have to inject this bit of code into the three.js runtime in order for it to bind those
    // buffers instead of the default ones.

    var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);

    this.renderer.setRenderTarget = function(target) {
      originalSetRenderTarget(target);
      if (target == null) {
        context.bindRenderTarget();
      }
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    self.scene = new THREE.Scene();

    // setup the camera
    var cam = context.camera;
    /* this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);
     this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
     this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
     this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
     // Projection matrix can be copied directly
     this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
    */

    // this.route = new RouteEntityMesh();
    // this.route.updateRoute(this.geo_curve_path, externalRenderers, view, SpatialReference, cam);

    this.meshline = new RouteEntityMesh({
      opacityVisible : 0.8, 
      opacityHidden : 0.0
    });
    this.meshline.updateRoute(this.geo_curve_path[0], externalRenderers, view, SpatialReference, cam);
    this.meshline.setProgress(0);

    this.start();

    // cleanup after ourselfs
    context.resetWebGLState();
  }

  render(context) {

    var view = context.view;

    // update camera parameters
    ///////////////////////////////////////////////////////////////////////////////////
    var cam = context.camera;
    this.camera = new THREE.PerspectiveCamera(cam.fov, cam.aspect, cam.near, cam.far);
    this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
    // Projection matrix can be copied directly
    this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

    // draw the scene
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    this.renderer.state.reset();

    this.renderer.state.setBlending(THREE.NoBlending); // 0.97 fix !

    this.renderer.render(this.scene, this.camera);

    // cleanup
    context.resetWebGLState();
  }

  start() {

    this.scene.add(this.meshline);

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

    //const meshline = this.meshline;

    /*meshline.tween = new TWEEN.Tween(
      {
        persent: 0,
      })
      .to(
          {
            persent : 1
          },
          150000)
      .onUpdate(
          function(tween_obj)
          { 
            meshline.setProgress(tween_obj.persent, false);
          })
      .onComplete(function() {

        delete meshline.tween;
      })
      .delay(2000).start();*/
  }

  setTrailLength(value) {

    if (!this.meshline) return;

    value = parseFloat(value) || 0.0;

    this.meshline.setTrailLength(value);
  }

  setGlow(value) {

    if (!this.meshline) return;

    value = parseFloat(value) || 0.0;

    this.meshline.setGlow(value);
  }

  setProgress(value) {

    if (!this.meshline) return;

    value = parseFloat(value) || 0.0;

    this.meshline.setProgress(value);
  }
}
