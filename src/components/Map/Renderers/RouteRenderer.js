//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

// import * as turf from '@turf/turf';

import AbstractRenderer from './AbstractRenderer';

import RouteEntity from '../Entities/RouteEntityMesh';

// import RouteEntity from '../Entities/RouteEntity';

export default class RouteRenderer extends AbstractRenderer {

  constructor(
    esriLoaderContext, 
    paths
  ) {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene

    this.geo_curve_path = paths;

    this.extenalCanvas = null; // extenalCanvas;
  }

  /**
   * Setup function, called once
   */
  setup(context)
  {
    const externalRenderers = this.esriLoaderContext.externalRenderers;
    const SpatialReference = this.esriLoaderContext.SpatialReference;

    const view = context.view;

    // initialize the three.js renderer
    //////////////////////////////////////////////////////////////////////////////////////

    let canvas = null;

    /*if (false) {

      const canvas_parent = context.gl.canvas.parentElement;

      canvas = this.extenalCanvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.pointerEvents = "none";

      canvas_parent.appendChild(canvas);
    }*/

    this.renderer = new THREE.WebGLRenderer(
      this.extenalCanvas ? 
      {
        canvas : canvas,
        alpha : true
      } : 
      {
        context: context.gl
      }
    );


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

    this.scene = new THREE.Scene();

    // setup the camera
    const cam = context.camera;

    this.init(
      this.geo_curve_path[0],
      externalRenderers, 
      view, 
      SpatialReference, 
      cam
    );

    // cleanup after ourselfs
    context.resetWebGLState();
  }

  init( 
    path,
    externalRenderers, 
    view, 
    SpatialReference, 
    cam
    ) {

    const meshline = this.meshline = new RouteEntity();

    this.meshline.updateRoute(path, externalRenderers, view, SpatialReference, cam);

    meshline.setProgress(0);

    this.scene.add(meshline);

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

    if (true) {
      
      meshline.tween = new TWEEN.Tween(
      {
        persent: 0,
      })
      .to(
          {
            persent : 1
          },
          150000)
      .onUpdate(
        obj =>
        { 
          meshline.setProgress(obj.persent);
        })
      .onComplete(
        () => {

          delete meshline.tween;
        })
      .delay(2000)
      .start();
    }
  }


  setTrailLength(value) {

    if (this.meshline && this.meshline.setTrailLength) {

      this.meshline.setTrailLength(value);
    }
  }

  render(context) {

    this.renderContext = context;

    // update camera parameters
    ///////////////////////////////////////////////////////////////////////////////////
    const cam = context.camera;
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


  afterRender (view) {
  }
}
