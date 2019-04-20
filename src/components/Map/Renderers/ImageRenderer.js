//
//
//

import * as THREE from 'three';

import AbstractRenderer from './AbstractRenderer';

import Image3D from '../Entities/Image3D';
import ImageFrame from '../Entities/ImageFrame';
import Image3DContainer from '../Entities/Image3DContainer';
import Image3DContainerCarousel from '../Entities/Image3DContainerCarousel';

export default class ImageRenderer extends AbstractRenderer
{

  constructor(esriLoaderContext, images, trackcurve)
  {
    super();

    this.esriLoaderContext = esriLoaderContext;

    this.renderer = null; // three.js renderer
    this.camera = null; // three.js camera
    this.scene = null; // three.js scene
    this.vertexIdx = 0;
    this.ambient = null; // three.js ambient light source

    console.log(images);

    this.images = images;

    this.geo_curve_path = [
      // should be set by trackcurve !
      [-110.7395240072906, 32.33625842258334, 2500],
      [-110.7395240072906, 32.33625842258334, 2500],
      [-110.7395240072906, 32.34625842258334, 2500],
    ].map(x => {
      x[0] = x[0] + Math.random() / 10;
      x[1] = x[1] + Math.random() / 10;
      return x;
    });
  }

  showImage(image) {

    const imageOnMap = this.images3dContainer.children.find((_image) => _image.config.id === image.id);

    if (imageOnMap) {
      Image3D.zoomToCamera(imageOnMap, this.camera);
    }

  }

  /**
   * Setup function, called once by the ArcGIS JS API.
   */
  setup(context) {

    var self = this;

    var externalRenderers = this.esriLoaderContext.externalRenderers;
    var SpatialReference = this.esriLoaderContext.SpatialReference;

    var view = context.view; //this.esriLoaderContext.view;

    function setPosition(worldPosition, object3d)
    {
      let pos = [0, 0, 0];

      externalRenderers.toRenderCoordinates(
          view,
          worldPosition,
          0,
          SpatialReference.WGS84,
          pos,
          0,
          1
      );
      object3d.position.set(pos[0], pos[1], pos[2]);

      let transform = new THREE.Matrix4();
      let arr = externalRenderers.renderCoordinateTransformAt(
          view,
          worldPosition,
          SpatialReference.WGS84,
          new Array(16)
      );
      transform.fromArray(arr);
      transform.decompose(object3d.position, object3d.quaternion, object3d.scale);

      const m2 = new THREE.Matrix4();
      m2.makeRotationX(THREE.Math.degToRad(90));
      transform.multiply(m2);
      object3d.setRotationFromMatrix(transform);
    }

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

    this.renderer.setRenderTarget = function(target) {
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

    //lat longs
    const curve_path = [];

    this.geo_curve_path.forEach(x => {
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      curve_path.push(new THREE.Vector3(pos[0], pos[1], pos[2])); // we make all coords in global world coord sys !
    });

    let curve = new THREE.CatmullRomCurve3(curve_path);

    this.images3dContainer = new Image3DContainer(curve);

    let imgs = this.images.map(config => new ImageFrame(config));

    for (let i = 0; i < imgs.length; i++)
    {
      this.images3dContainer.add(imgs[i]);
    }

    for (let i = 0; i < this.images3dContainer.children.length; i++)
    {
      let image3d = this.images3dContainer.children[i];

      setPosition( image3d.config.location.geometry.coordinates, image3d);
    }

    // create curve
    //var tubeGeometry = new THREE.TubeBufferGeometry(curve, 50, 200, 28, false);
    //var material = new THREE.MeshNormalMaterial({
    //  side: THREE.FrontSide,
    //  transparent: true,
    //  opacity: 0.3,
    //});
    //this.route = new THREE.Mesh(tubeGeometry, material);

    if (true)
    {

      this.images3DContainerCarousel = new Image3DContainerCarousel();

      setPosition(
          [
            42.6210941952765,
            42.06134876641631,
            600.7899992370605
          ], this.images3DContainerCarousel);

      let imgs = this.images.map(config => new ImageFrame(config));

      for (let i = 0; i < imgs.length; i++)
      {
        this.images3DContainerCarousel.add(imgs[i]);
      }

    }
    //

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

    // this.scene.add(this.route);

    this.scene.add(this.images3dContainer);

    if ( this.images3DContainerCarousel )
    {
      this.scene.add(this.images3DContainerCarousel);
    }

    this.scene.add(new THREE.AmbientLight(0xeeeeee));
  }
}
