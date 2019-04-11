//
//
//

import * as THREE from 'three';

import AbstractRenderer from './AbstractRenderer';



import Terrain from '../Entities/Terrain'
import Noise from '../Entities/Noise'



export default class ImageRenderer extends AbstractRenderer {

  constructor(esriLoaderContext, images, trackcurve, meshes) {
    super();



    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene
    this.vertexIdx = 0;
    this.ambient = null; // three.js ambient light source

    this.images = images;
    this.meshes = meshes;


  }



  setPosition(worldPosition, object3d) {
    let pos = [0, 0, 0];

    this.esriLoaderContext.externalRenderers.toRenderCoordinates(
      this.esriLoaderContext.view,
      worldPosition,
      0,
      this.esriLoaderContext.SpatialReference.WGS84,
      pos,
      0,
      1
    );
    object3d.position.set(pos[0], pos[1], pos[2]);

    let transform = new THREE.Matrix4();
    let arr = this.esriLoaderContext.externalRenderers.renderCoordinateTransformAt(
      this.esriLoaderContext.view,
      worldPosition,
      this.esriLoaderContext.SpatialReference.WGS84,
      new Array(16)
    );
    transform.fromArray(arr);
    transform.decompose(object3d.position, object3d.quaternion, object3d.scale);

    const m2 = new THREE.Matrix4();
    m2.makeRotationX(THREE.Math.degToRad(90));
    transform.multiply(m2);
    object3d.setRotationFromMatrix(transform);
  }


  /**
   * Setup function, called once by the ArcGIS JS API.
   */
  setup(context) {

    var self = this;

    var externalRenderers = this.esriLoaderContext.externalRenderers;
    var SpatialReference = this.esriLoaderContext.SpatialReference;

    var view = context.view; //this.esriLoaderContext.view;


    // initialize the three.js renderer
    //////////////////////////////////////////////////////////////////////////////////////
    this.renderer = new THREE.WebGLRenderer({
      context: context.gl,
      //premultipliedAlpha: true,
      //alpha : true
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

    this.renderer.setRenderTarget = function (target) {
      originalSetRenderTarget(target);
      if (target == null) {
        context.bindRenderTarget();
      }
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    this.scene = new THREE.Scene();

    // setup the camera
    var cam = context.camera;
    this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);
    this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
    this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
    this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
    // Projection matrix can be copied directly
    this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

    // set positions ----------------

 /*markers*/



    const noise = Noise.generate();
    this.terrain = new Terrain( noise, 1024, 4, 64 );
    this.scene.add( this.terrain );





    this.start();

    // cleanup after ourselfs
    context.resetWebGLState();
  }


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

    //this.renderer.state.reset();

   // this.renderer.state.setBlending(THREE.NoBlending); // 0.97 fix !

   // this.renderer.render(this.scene, this.camera);

    // cleanup
    context.resetWebGLState();
  }

  start() {
    //this.scene.add(this.markerContainer);
    this.scene.add(new THREE.AmbientLight(0xeeeeee));
  }
}
