//
//
//

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import * as turf from '@turf/turf';

import AbstractRenderer from './AbstractRenderer';


import RouteEntity from '../Entities/RouteEntity';
import Image3DContainerCarousel from "../Entities/Image3DContainerCarousel";
import ImageFrame from "../Entities/ImageFrame";

export default class RouteRenderer extends AbstractRenderer {
  constructor(esriLoaderContext) {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene

    this.geo_curve_path = [
      [
        42.8704202846265,
        40.02966235244786,
        2099.657375873945
      ],
      [
        42.87211869744003,
        40.03113720496235,
        2036.89979246589
      ],
      [
        42.87198297446272,
        40.03262750718271,
        1900.839241186053
      ],
      [
        42.87082980490037,
        40.03345572830564,
        1926.279232576324
      ],
      [
        42.86886442808706,
        40.03400846524369,
        2011.649432186644
      ],
      [
        42.86706941202392,
        40.0347672031743,
        2082.440245441202
      ],
      [
        42.86635185101711,
        40.03532606629669,
        2055.201799807556
      ],
      [
        42.8658668958608,
        40.03598607110853,
        2040.463115691764
      ],
      [
        42.8658668958608,
        40.03598607110853,
        2040.463115691764
      ],
      [
        42.8658668958608,
        40.03598607110853,
        2040.463115691764
      ],

      [
        42.8658668958608,
        41.63598607110853,
        2040.463115691764
      ],

      [
        42.8658668958608,
        43.63598607110853,
        2040.463115691764
      ]
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

    var view = context.view;

    this.route = new RouteEntity(this.geo_curve_path);






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

    this.route.updateRoute(this.geo_curve_path, externalRenderers, view, SpatialReference, cam);

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
//alert(1)
    this.scene.add(this.route);

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

    var object = this.route;
var cam = this.camera;
    //this.route

    object.tween = new TWEEN.Tween(
      {
        persent: 0,
      })
      .to(
        {
          persent : 1
        },
        15000)
      .onUpdate(
        function(tween_obj)
        {

         // console.log(cam);

          object.setProgress(tween_obj.persent);
        })
      .onComplete(function() {

        delete object.tween;
      }).delay(5000)

      .start();
  }
}
