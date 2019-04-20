//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as turf from '@turf/turf';

import AbstractRenderer from './AbstractRenderer';

import RouteEntity from '../Entities/RouteEntity';

export default class RouteRenderer extends AbstractRenderer {
  constructor(esriLoaderContext) {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene
    this.vertexIdx = 0;
    this.ambient = null; // three.js ambient light source

    this.geo_curve_path = [
      [121.6330941952765, 25.06334876641631, 19.799999237060547],
      [121.63292722776532, 25.06322412751615, 19],
      [121.63276956416667, 25.063085993751884, 19.799999237060547],
      [121.63261651061475, 25.062967473641038, 21.600000381469727],
      [121.63244836963713, 25.062837218865752, 21.799999237060547],
      [121.63230814039707, 25.06270512007177, 24.399999618530273],
      [121.63216346874833, 25.062573524191976, 23.600000381469727],
      [121.63202122785151, 25.062446538358927, 23.399999618530273],
      [121.63186809048057, 25.0623011123389, 25],
      [121.63173724897206, 25.0621578656137, 25.600000381469727],

    ];
  }

  /**
   * Setup function, called once
   */
  setup(context)
  {

    var self = this;

    var externalRenderers = this.esriLoaderContext.externalRenderers;
    var SpatialReference = this.esriLoaderContext.SpatialReference;

    var view = context.view; //this.esriLoaderContext.view;

    const pts = [];

   /* //lat longs
    const curve_path = [];
    const simplificationTolerance = 0.0001;

    let geojson = turf.lineString(this.geo_curve_path);
    let options = { tolerance: simplificationTolerance, highQuality: true };
    let simplified = turf.simplify(geojson, options);

    simplified.geometry.coordinates.forEach(x => {
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      curve_path.push(new THREE.Vector3(pos[0], pos[1], pos[2])); // we make all coords in global world coord sys !
    });

    const curve = new THREE.CatmullRomCurve3(curve_path);*/

    this.route = new RouteEntity();

    this.route.updateRoute(this.geo_curve_path, externalRenderers, view, SpatialReference);

    this.currentStep = 0.0;
    this.route.setProgress(this.currentStep);

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
    this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);
    this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
    // Projection matrix can be copied directly
    this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

    this.start();

    // cleanup after ourselfs
    context.resetWebGLState();
  }



  onSwipe(isLeft, event) {}

  render(context) {

    var view = context.view; //this.esriLoaderContext.view;

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

    this.scene.add(this.route);

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

    var object = this.route;

    object.tween = new TWEEN.Tween(
      {
        persent: 0,
      })
      .to(
        {
          persent : 1
        },
        3500)
      .onUpdate(
        function(tween_obj)
        {
          object.setProgress(tween_obj.persent);
        })
      .onComplete(function() {

        delete object.tween;
      })
      .delay(1000)
      .start();
  }
}
