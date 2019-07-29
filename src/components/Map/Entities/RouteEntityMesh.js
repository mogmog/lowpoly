import * as THREE from 'three';
import MeshLine from 'three.meshline';

const getRandomFloat = (min, max) => (Math.random() * (max - min) + min);

let dashArray = 2,
    dashOffset = 0.0,
    dashRatio = 0.2;

export default class RouteEntityMesh extends THREE.Group {

  constructor () {
    super();
  }

  setProgress(value) {
    //if (this.material.uniforms.dashOffset.value < -2) return;
    this.material.uniforms.dashOffset.value -= 0.000100;
  }

  updateRoute(path, externalRenderers, view, SpatialReference, camera)
  {

    let geometry = new THREE.Geometry();

    path.forEach(x => {
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      geometry.vertices.push(new THREE.Vector3(pos[0], pos[1], pos[2] + 15.0)); // we make all coords in global world coord sys !
      // console.log(path);
    });

    let line = new MeshLine.MeshLine();

    line.setGeometry( geometry);

    var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

    this.material = new MeshLine.MeshLineMaterial( {
      useMap: false,
      color: new THREE.Color( 0xffd300 ),
      opacity: 0.65,
      transparent : true,
      resolution: resolution,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthFunc: THREE.AlwaysDepth,
      lineWidth: 150,
      near : 1, //camera.near,
      far : 500, // camera.far,
      dashArray,
      dashOffset,
      dashRatio,

    });

    this.add(new THREE.Mesh(line.geometry, this.material));


  }



}
