import * as THREE from 'three';
import MeshLine from 'three.meshline';
import * as turf from '@turf/turf';

export default class MeshLineEntity extends THREE.Group {

  constructor () {
    super();

    this.dashArray = 0.6;
    this.dashOffset = 0;
    this.dashRatio = 0.45;

    //this.makeLine();
  }

  updateRoute(path, externalRenderers, view, SpatialReference, camera) {

    let geometry = new THREE.Geometry();

    //let geojson = turf.lineString(path);


    //let options = { resolution : 10420 };

    //var points = turf.bezierSpline(geojson, options);

   // console.log(path);

    //let points = turf.interpolate(geojson, 100, options);

    path[0].forEach(x => {

      //x[2] = 2000;
     // console.log(x);
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      geometry.vertices.push(new THREE.Vector3(pos[0], pos[1], pos[2] + 1 )); // we make all coords in global world coord sys !

    });

    this.line = new MeshLine.MeshLine();

    this.line.setGeometry( geometry, function( p ) { return p * 1 } );

    var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
    this.material = new MeshLine.MeshLineMaterial( {

      color: new THREE.Color( 	0xffd300  ),
      opacity: 0.7,//params.strokes ? .5 : 1,
      dashArray: this.dashArray,
      dashOffset: this.dashOffset,
      dashRatio: this.dashRatio,
      resolution: resolution,
      sizeAttenuation: false,
      lineWidth: 30,
      near: camera.near,
      far: camera.far,
      depthWrite: true,
      depthTest: true,
      alphaTest: 0.5,
      transparent: true
    });

    this.mesh = new THREE.Mesh( this.line.geometry, this.material );

    this.add(this.mesh);

  }

  setProgress() {
    if (this.material) this.material.uniforms.dashOffset.value -= 0.0001;
  }



}
