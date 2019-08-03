

//
//
//

import * as _three from 'three';
import * as turf from "@turf/turf/index";

const THREE = _three; // extension fix - ad hoc

export default class RouteEntity extends THREE.Group {

  constructor ( config ) {

    super();

    this.config = Object.assign({
      color : 0xffdb58,
      transparent : true,
      opacityVisible : 0.8, 
      opacityHidden : 0.2
    }, config || {});

    this.currentPersentage = -1.0;
    this.currentTrailLength = 1.0;
  }

  updateRoute(path, externalRenderers, view, SpatialReference)
  {
    while(this.children.length) {

      const obj = this.children[0];

      if (obj.geometry) {

        obj.geometry.dispose();
      }
  
      if (obj.material) {
  
        obj.material.dispose();
      }

      this.remove(obj);
    }

    //lat longs
    const curve_path = [];
    const simplificationTolerance = 0.0001;

    let geojson = turf.lineString(path);
    let options = { tolerance: simplificationTolerance, highQuality: true };
    let simplified = turf.simplify(geojson, options);

    const zAddition = 150;

    simplified.geometry.coordinates.forEach(x => {
      let pos = [0, 0, 0];
      externalRenderers.toRenderCoordinates(view, x, 0, SpatialReference.WGS84, pos, 0, 1);
      curve_path.push(new THREE.Vector3(pos[0], pos[1], pos[2] + zAddition)); 
      // we make all coords in global world coord sys !
    });

    const curve = new THREE.CatmullRomCurve3(curve_path);

    var extrudeSettings = {
      steps: curve_path.length * 4,
      bevelEnabled: false, // this be always false in ExtrudeBufferGeometryWithLength
      extrudePath: curve,
    };

    const w = 40;

    const squareShape = new THREE.Shape();
    squareShape.moveTo(0, 0);
    squareShape.lineTo(0, w);
    //squareShape.lineTo(w, w);
    //squareShape.lineTo(w, 0);
    //squareShape.lineTo(0, 0);

    const geometry = new THREE.ExtrudeBufferGeometry(squareShape, extrudeSettings);

    const material = new THREE.MeshPhongMaterial({
      side: THREE.FrontSide,
      transparent: this.config.transparent,
      opacity: this.config.opacityHidden,
      color: this.config.color,
    });

    const materialAnim = new MeshPhongCustomMaterial({
      side: THREE.FrontSide,
      transparent: this.config.transparent,
      opacity: this.config.opacityVisible,
      color: this.config.color,
    });

    this.route1 = new THREE.Mesh(geometry, material);

    this.route1.visible = this.config.opacityHidden > 0.0;

    const linePoints = [];

    var geometryAnim = new THREE.ExtrudeBufferGeometryWithLength(squareShape, extrudeSettings, linePoints);

    const extrudePts = curve.getSpacedPoints( extrudeSettings.steps );
    const line_material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const line_geometry = new THREE.Geometry();
    for (let i = 0; i < extrudePts.length; i++) {
      line_geometry.vertices.push(extrudePts[i]);
    }
    this.route_line = new THREE.Line( line_geometry, line_material );

    // mesh
    this.route2 = new THREE.Mesh(geometryAnim, materialAnim);

    this.route2.setProgress = function(persentage) {
        this.material.uniforms.progress.value = persentage;
    };

    this.route2.setTrailLength = function(value) { // 0.0 - 1.0
      this.material.uniforms.trail.value = value;
  };

    if (this.currentPersentage === -1)
      this.route2.setProgress(1.0);
    else
      this.route2.setProgress(this.currentPersentage);

    this.route2.setTrailLength(this.currentTrailLength);

    this.add(this.route1);
    this.add(this.route2);

    if (this.route_line) {
      this.add(this.route_line);
    }
  }

  setProgress(persentage)
  {
    this.currentPersentage = persentage;

    if (this.route2)
      this.route2.setProgress(persentage);
  }

  setGlow(value) { // 0 - 1
  }

  setTrailLength(value) { // 0.0 - 1.0

    this.currentTrailLength = value;

    if (this.route2)
      this.route2.setTrailLength(value);
  }
}

function MeshPhongCustomMaterial( parameters ) {

  THREE.MeshPhongMaterial.call( this );

  this.setValues( parameters );

  this.type = "MeshPhongCustomMaterial";

  this.uniforms = THREE.UniformsUtils.merge( [
    THREE.UniformsLib.common,
    THREE.UniformsLib.specularmap,
    THREE.UniformsLib.envmap,
    THREE.UniformsLib.aomap,
    THREE.UniformsLib.lightmap,
    THREE.UniformsLib.emissivemap,
    THREE.UniformsLib.bumpmap,
    THREE.UniformsLib.normalmap,
    THREE.UniformsLib.displacementmap,
    THREE.UniformsLib.gradientmap,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.lights,
    {
      emissive: { value: new THREE.Color( 0x000000 ) },
      specular: { value: new THREE.Color( 0x111111 ) },
      shininess: { value: 30 }
    }
  ]);

  this.uniforms.progress = { value : 1.0 };
  this.uniforms.trail = { value : 1.0 };

  this.vertexShader = `
    #define PHONG
    varying vec3 vViewPosition;
    #ifndef FLAT_SHADED
      varying vec3 vNormal;
    #endif

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    attribute float current_length_normalized;
    varying float v_current_length_normalized;

    void main() {

      v_current_length_normalized = current_length_normalized;

      #include <uv_vertex>
      #include <uv2_vertex>
      #include <color_vertex>
      #include <beginnormal_vertex>
      #include <morphnormal_vertex>
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      #include <defaultnormal_vertex>
      
      #ifndef FLAT_SHADED
        vNormal = normalize( transformedNormal );
      #endif
      
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>

      vViewPosition = - mvPosition.xyz;

      #include <worldpos_vertex>
      #include <envmap_vertex>
      #include <shadowmap_vertex>
      #include <fog_vertex>
    }
  `; // THREE.ShaderChunk.meshphong_vert;

  this.fragmentShader =`
      #define PHONG

      uniform vec3 diffuse;
      uniform vec3 emissive;
      uniform vec3 specular;
      uniform float shininess;
      uniform float opacity;

      uniform float progress; // custom progress route
      uniform float trail; // custom trail route

      #include <common>
      #include <packing>
      #include <dithering_pars_fragment>
      #include <color_pars_fragment>
      #include <uv_pars_fragment>
      #include <uv2_pars_fragment>
      #include <map_pars_fragment>
      #include <alphamap_pars_fragment>
      #include <aomap_pars_fragment>
      #include <lightmap_pars_fragment>
      #include <emissivemap_pars_fragment>
      #include <envmap_pars_fragment>
      #include <gradientmap_pars_fragment>
      #include <fog_pars_fragment>
      #include <bsdfs>
      #include <lights_pars_begin>
      #include <lights_phong_pars_fragment>
      #include <shadowmap_pars_fragment>
      #include <bumpmap_pars_fragment>
      #include <normalmap_pars_fragment>
      #include <specularmap_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>

      varying float v_current_length_normalized;

      void main() {

        #include <clipping_planes_fragment>

        if (v_current_length_normalized >= progress)
        {
          discard;
          return;
        }

        if (trail < 1.0)
        {
          if (v_current_length_normalized < progress - trail)
          {
            discard;
            return;
          }
        }

        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;

        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
        #include <aomap_fragment>

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

        #include <envmap_fragment>

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );

        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
      }
    `; // THREE.ShaderChunk.meshphong_frag;
}

MeshPhongCustomMaterial.prototype = Object.create( THREE.MeshPhongMaterial.prototype );
MeshPhongCustomMaterial.prototype.constructor = THREE.MeshPhongMaterial;

MeshPhongCustomMaterial.prototype.isMeshPhongMaterial = true;

THREE.ExtrudeBufferGeometryWithLength = function( shapes, options, linePoints ) {

  THREE.BufferGeometry.call( this );

  this.type = 'ExtrudeBufferGeometry';

  this.parameters = {
    shapes: shapes,
    options: options
  };

  shapes = Array.isArray( shapes ) ? shapes : [ shapes ];

  var scope = this;

  var verticesArray = [];
  var uvArray = [];
  var currentLengthNormalizedArray = [];
  var currentWidthNormalizedArray = [];

  for ( var i = 0, l = shapes.length; i < l; i ++ ) {

    var shape = shapes[ i ];
    addShape( shape );

  }

  // build geometry

  this.addAttribute( 'position', new THREE.Float32BufferAttribute( verticesArray, 3 ) );
  this.addAttribute( 'current_length_normalized', new THREE.Float32BufferAttribute( currentLengthNormalizedArray, 1 ) );
  this.addAttribute( 'current_width_normalized', new THREE.Float32BufferAttribute( currentWidthNormalizedArray, 1 ) );
  this.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvArray, 2 ) );

  this.computeVertexNormals();

  // functions

  function addShape( shape ) {

    var WorldUVGenerator = {

      generateTopUV: function ( geometry, vertices, indexA, indexB, indexC ) {

        var a_x = vertices[ indexA * 3 ];
        var a_y = vertices[ indexA * 3 + 1 ];
        var b_x = vertices[ indexB * 3 ];
        var b_y = vertices[ indexB * 3 + 1 ];
        var c_x = vertices[ indexC * 3 ];
        var c_y = vertices[ indexC * 3 + 1 ];

        return [
          new THREE.Vector2( a_x, a_y ),
          new THREE.Vector2( b_x, b_y ),
          new THREE.Vector2( c_x, c_y )
        ];

      },

      generateSideWallUV: function ( geometry, vertices, indexA, indexB, indexC, indexD ) {

        var a_x = vertices[ indexA * 3 ];
        var a_y = vertices[ indexA * 3 + 1 ];
        var a_z = vertices[ indexA * 3 + 2 ];
        var b_x = vertices[ indexB * 3 ];
        var b_y = vertices[ indexB * 3 + 1 ];
        var b_z = vertices[ indexB * 3 + 2 ];
        var c_x = vertices[ indexC * 3 ];
        var c_y = vertices[ indexC * 3 + 1 ];
        var c_z = vertices[ indexC * 3 + 2 ];
        var d_x = vertices[ indexD * 3 ];
        var d_y = vertices[ indexD * 3 + 1 ];
        var d_z = vertices[ indexD * 3 + 2 ];

        if ( Math.abs( a_y - b_y ) < 0.01 ) {

          return [
            new THREE.Vector2( a_x, 1 - a_z ),
            new THREE.Vector2( b_x, 1 - b_z ),
            new THREE.Vector2( c_x, 1 - c_z ),
            new THREE.Vector2( d_x, 1 - d_z )
          ];

        } else {

          return [
            new THREE.Vector2( a_y, 1 - a_z ),
            new THREE.Vector2( b_y, 1 - b_z ),
            new THREE.Vector2( c_y, 1 - c_z ),
            new THREE.Vector2( d_y, 1 - d_z )
          ];

        }

      }
    };

    var placeholder = [];
    var placeholder_length = [];

    // options

    var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;
    var steps = options.steps !== undefined ? options.steps : 1;
    var depth = options.depth !== undefined ? options.depth : 100;

    var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true;
    var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6;
    var bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 2;
    var bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

    var extrudePath = options.extrudePath;

    var uvgen = options.UVGenerator !== undefined ? options.UVGenerator : WorldUVGenerator;

    // deprecated options

    if ( options.amount !== undefined ) {

      console.warn( 'THREE.ExtrudeBufferGeometry: amount has been renamed to depth.' );
      depth = options.amount;

    }

    //

    bevelEnabled = false;  // TODO !

    var extrudePts, extrudeByPath = false;
    var splineTube, binormal, normal, position2;

    if ( extrudePath ) {

      extrudePts = extrudePath.getSpacedPoints( steps );

      extrudeByPath = true;
      bevelEnabled = false; // bevels not supported for path extrusion

      // SETUP TNB variables

      // TODO1 - have a .isClosed in spline?

      splineTube = extrudePath.computeFrenetFrames( steps, false );

      // console.log(splineTube, 'splineTube', splineTube.normals.length, 'steps', steps, 'extrudePts', extrudePts.length);

      binormal = new THREE.Vector3();
      normal = new THREE.Vector3();
      position2 = new THREE.Vector3();

    }

    // Safeguards if bevels are not enabled

    if ( ! bevelEnabled ) {

      bevelSegments = 0;
      bevelThickness = 0;
      bevelSize = 0;

    }

    // Variables initialization

    var ahole, h, hl; // looping of holes

    var shapePoints = shape.extractPoints( curveSegments );

    var vertices = shapePoints.shape;
    var holes = shapePoints.holes;

    var reverse = ! THREE.ShapeUtils.isClockWise( vertices );

    if ( reverse ) {

      vertices = vertices.reverse();

      // Maybe we should also check if holes are in the opposite direction, just to be safe ...

      for ( h = 0, hl = holes.length; h < hl; h ++ ) {

        ahole = holes[ h ];

        if ( THREE.ShapeUtils.isClockWise( ahole ) ) {

          holes[ h ] = ahole.reverse();

        }

      }

    }


    var faces = THREE.ShapeUtils.triangulateShape( vertices, holes );

    /* Vertices */

    var contour = vertices; // vertices has all points but contour has only points of circumference

    for ( h = 0, hl = holes.length; h < hl; h ++ ) {

      ahole = holes[ h ];

      vertices = vertices.concat( ahole );

    }


    function scalePt2( pt, vec, size ) {

      if ( ! vec ) console.error( "THREE.ExtrudeGeometry: vec does not exist" );

      return vec.clone().multiplyScalar( size ).add( pt );

    }

    var b, bs, t, z,
      vert, vlen = vertices.length,
      face, flen = faces.length;


    // Find directions for point movement


    function getBevelVec( inPt, inPrev, inNext ) {

      // computes for inPt the corresponding point inPt' on a new contour
      //   shifted by 1 unit (length of normalized vector) to the left
      // if we walk along contour clockwise, this new contour is outside the old one
      //
      // inPt' is the intersection of the two lines parallel to the two
      //  adjacent edges of inPt at a distance of 1 unit on the left side.

      var v_trans_x, v_trans_y, shrink_by; // resulting translation vector for inPt

      // good reading for geometry algorithms (here: line-line intersection)
      // http://geomalgorithms.com/a05-_intersect-1.html

      var v_prev_x = inPt.x - inPrev.x,
        v_prev_y = inPt.y - inPrev.y;
      var v_next_x = inNext.x - inPt.x,
        v_next_y = inNext.y - inPt.y;

      var v_prev_lensq = ( v_prev_x * v_prev_x + v_prev_y * v_prev_y );

      // check for collinear edges
      var collinear0 = ( v_prev_x * v_next_y - v_prev_y * v_next_x );

      if ( Math.abs( collinear0 ) > Number.EPSILON ) {

        // not collinear

        // length of vectors for normalizing

        var v_prev_len = Math.sqrt( v_prev_lensq );
        var v_next_len = Math.sqrt( v_next_x * v_next_x + v_next_y * v_next_y );

        // shift adjacent points by unit vectors to the left

        var ptPrevShift_x = ( inPrev.x - v_prev_y / v_prev_len );
        var ptPrevShift_y = ( inPrev.y + v_prev_x / v_prev_len );

        var ptNextShift_x = ( inNext.x - v_next_y / v_next_len );
        var ptNextShift_y = ( inNext.y + v_next_x / v_next_len );

        // scaling factor for v_prev to intersection point

        var sf = ( ( ptNextShift_x - ptPrevShift_x ) * v_next_y -
            ( ptNextShift_y - ptPrevShift_y ) * v_next_x ) /
          ( v_prev_x * v_next_y - v_prev_y * v_next_x );

        // vector from inPt to intersection point

        v_trans_x = ( ptPrevShift_x + v_prev_x * sf - inPt.x );
        v_trans_y = ( ptPrevShift_y + v_prev_y * sf - inPt.y );

        // Don't normalize!, otherwise sharp corners become ugly
        //  but prevent crazy spikes
        var v_trans_lensq = ( v_trans_x * v_trans_x + v_trans_y * v_trans_y );
        if ( v_trans_lensq <= 2 ) {

          return new THREE.Vector2( v_trans_x, v_trans_y );

        } else {

          shrink_by = Math.sqrt( v_trans_lensq / 2 );

        }

      } else {

        // handle special case of collinear edges

        var direction_eq = false; // assumes: opposite
        if ( v_prev_x > Number.EPSILON ) {

          if ( v_next_x > Number.EPSILON ) {

            direction_eq = true;

          }

        } else {

          if ( v_prev_x < - Number.EPSILON ) {

            if ( v_next_x < - Number.EPSILON ) {

              direction_eq = true;

            }

          } else {

            if ( Math.sign( v_prev_y ) === Math.sign( v_next_y ) ) {

              direction_eq = true;

            }

          }

        }

        if ( direction_eq ) {

          // console.log("Warning: lines are a straight sequence");
          v_trans_x = - v_prev_y;
          v_trans_y = v_prev_x;
          shrink_by = Math.sqrt( v_prev_lensq );

        } else {

          // console.log("Warning: lines are a straight spike");
          v_trans_x = v_prev_x;
          v_trans_y = v_prev_y;
          shrink_by = Math.sqrt( v_prev_lensq / 2 );

        }

      }

      return new THREE.Vector2( v_trans_x / shrink_by, v_trans_y / shrink_by );

    }


    var contourMovements = [];

    for ( var i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

      if ( j === il ) j = 0;
      if ( k === il ) k = 0;

      //  (j)---(i)---(k)
      // console.log('i,j,k', i, j , k)

      contourMovements[ i ] = getBevelVec( contour[ i ], contour[ j ], contour[ k ] );

    }

    var holesMovements = [],
      oneHoleMovements, verticesMovements = contourMovements.concat();

    for ( h = 0, hl = holes.length; h < hl; h ++ ) {

      ahole = holes[ h ];

      oneHoleMovements = [];

      for ( i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

        if ( j === il ) j = 0;
        if ( k === il ) k = 0;

        //  (j)---(i)---(k)
        oneHoleMovements[ i ] = getBevelVec( ahole[ i ], ahole[ j ], ahole[ k ] );

      }

      holesMovements.push( oneHoleMovements );
      verticesMovements = verticesMovements.concat( oneHoleMovements );

    }


    // Loop bevelSegments, 1 for the front, 1 for the back

    for ( b = 0; b < bevelSegments; b ++ ) {

      //for ( b = bevelSegments; b > 0; b -- ) {

      t = b / bevelSegments;
      z = bevelThickness * Math.cos( t * Math.PI / 2 );
      bs = bevelSize * Math.sin( t * Math.PI / 2 );

      // contract shape

      for ( i = 0, il = contour.length; i < il; i ++ ) {

        vert = scalePt2( contour[ i ], contourMovements[ i ], bs );

        v( vert.x, vert.y, - z );

      }

      // expand holes

      for ( h = 0, hl = holes.length; h < hl; h ++ ) {

        ahole = holes[ h ];
        oneHoleMovements = holesMovements[ h ];

        for ( i = 0, il = ahole.length; i < il; i ++ ) {

          vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

          v( vert.x, vert.y, - z );

        }

      }

    }

    bs = bevelSize;

    // Back facing vertices

    var currentLength = 0;
    var fullLength = 0;

    var vertices_max =
    {
      x : 0,
      y : 0
    };

    for ( i = 0; i < vlen; i ++ ) {

      vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

      vertices_max.x = Math.max(vertices_max.x, vert.x);
      vertices_max.y = Math.max(vertices_max.y, vert.y);
    }

    for ( let i = 1; i < extrudePts.length; i++ )
    {
        let a = new THREE.Vector3().copy( extrudePts[ i - 1 ] );
        let b = new THREE.Vector3().copy( extrudePts[ i ] );

        let length = a.distanceTo( b );

        fullLength += length;
    }

    for ( i = 0; i < vlen; i ++ ) {

      // vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

      vert = vertices[ i ];

      if ( ! extrudeByPath ) {

        v( vert.x, vert.y, 0 );

      } else {

        // v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

        normal.copy( splineTube.normals[ 0 ] ).multiplyScalar( vert.x );
        binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar( vert.y );

        position2.copy( extrudePts[ 0 ] ).add( normal ).add( binormal );

        let length = 0.0;// currentLength / fullLength;

        v( position2.x, position2.y, position2.z, length);

      }

    }

    // Add stepped vertices...
    // Including front facing vertices

    var s;

    for ( s = 1; s <= steps; s ++ ) {

      let a = new THREE.Vector3().copy( extrudePts[ s - 1 ] );
      let b = new THREE.Vector3().copy( extrudePts[ s ] );

      currentLength += a.distanceTo( b );;

      for ( i = 0; i < vlen; i ++ ) {

        // vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

        vert = vertices[ i ];

        if ( ! extrudeByPath ) {

          v( vert.x, vert.y, depth / steps * s );

        } else {

          // v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

          normal.copy( splineTube.normals[ s ] ).multiplyScalar( vert.x );
          binormal.copy( splineTube.binormals[ s ] ).multiplyScalar( vert.y );

          position2.copy( extrudePts[ s ] ).add( normal ).add( binormal );

          const length = currentLength / fullLength;
          
          const width = 0;

          v( position2.x, position2.y, position2.z, length, width );

        }

      }

    }

    // Add bevel segments planes

    var bAddBevelSegments = false;

    if (bAddBevelSegments)
    {
      //for ( b = 1; b <= bevelSegments; b ++ ) {
      for ( b = bevelSegments - 1; b >= 0; b -- ) {

        t = b / bevelSegments;
        z = bevelThickness * Math.cos( t * Math.PI / 2 );
        bs = bevelSize * Math.sin( t * Math.PI / 2 );

        // contract shape

        for ( i = 0, il = contour.length; i < il; i ++ ) {

          vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
          v( vert.x, vert.y, depth + z );

        }

        // expand holes

        for ( h = 0, hl = holes.length; h < hl; h ++ ) {

          ahole = holes[ h ];
          oneHoleMovements = holesMovements[ h ];

          for ( i = 0, il = ahole.length; i < il; i ++ ) {

            vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

            if ( ! extrudeByPath ) {

              v( vert.x, vert.y, depth + z );

            } else {

              v( vert.x, vert.y + extrudePts[ steps - 1 ].y, extrudePts[ steps - 1 ].x + z );

            }

          }

        }

      }
    }

    /* Faces */

    // Top and bottom faces

    // buildLidFaces();

    // Sides faces

    buildSideFaces();

    /////  Internal functions

    function buildLidFaces() {

      var start = verticesArray.length / 3;

      if ( bevelEnabled ) {

        var layer = 0; // steps + 1
        var offset = vlen * layer;

        // Bottom faces

        for ( i = 0; i < flen; i ++ ) {

          face = faces[ i ];
          f3( face[ 2 ] + offset, face[ 1 ] + offset, face[ 0 ] + offset );

        }

        layer = steps + bevelSegments * 2;
        offset = vlen * layer;

        // Top faces

        for ( i = 0; i < flen; i ++ ) {

          face = faces[ i ];
          f3( face[ 0 ] + offset, face[ 1 ] + offset, face[ 2 ] + offset );

        }

      } else {

        // Bottom faces

        for ( i = 0; i < flen; i ++ ) {

          face = faces[ i ];
          f3( face[ 2 ], face[ 1 ], face[ 0 ] );

        }

        // Top faces

        for ( i = 0; i < flen; i ++ ) {

          face = faces[ i ];
          f3( face[ 0 ] + vlen * steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps );

        }

      }

      scope.addGroup( start, verticesArray.length / 3 - start, 0 );

    }

    // Create faces for the z-sides of the shape

    function buildSideFaces() {

      var start = verticesArray.length / 3;
      var layeroffset = 0;
      sidewalls( contour, layeroffset );
      layeroffset += contour.length;

      for ( h = 0, hl = holes.length; h < hl; h ++ ) {

        ahole = holes[ h ];
        sidewalls( ahole, layeroffset );

        //, true
        layeroffset += ahole.length;

      }

      scope.addGroup( start, verticesArray.length / 3 - start, 1 );
    }

    function sidewalls( contour, layeroffset ) {

      var j, k;
      i = contour.length;

      while ( -- i >= 0 ) {

        j = i;
        k = i - 1;
        if ( k < 0 ) k = contour.length - 1;

        //console.log('b', i,j, i-1, k,vertices.length);

        var s = 0,
          sl = steps + bevelSegments * 2;

        for ( s = 0; s < sl; s ++ ) {

          var slen1 = vlen * s;
          var slen2 = vlen * ( s + 1 );

          var a = layeroffset + j + slen1,
            b = layeroffset + k + slen1,
            c = layeroffset + k + slen2,
            d = layeroffset + j + slen2;

          f4( a, b, c, d );

        }

      }

    }

    function v( x, y, z, currentLength) {

      placeholder.push( x );
      placeholder.push( y );
      placeholder.push( z );

      placeholder_length.push(currentLength);
    }


    function f3( a, b, c ) {

      addVertex( a );
      addVertex( b );
      addVertex( c );

      var nextIndex = verticesArray.length / 3;
      var uvs = uvgen.generateTopUV( scope, verticesArray, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

      addUV( uvs[ 0 ] );
      addUV( uvs[ 1 ] );
      addUV( uvs[ 2 ] );

    }

    function f4( a, b, c, d ) {

      addVertex( a );
      addVertex( b );
      addVertex( d );

      addVertex( b );
      addVertex( c );
      addVertex( d );


      var nextIndex = verticesArray.length / 3;
      var uvs = uvgen.generateSideWallUV( scope, verticesArray, nextIndex - 6, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

      addUV( uvs[ 0 ] );
      addUV( uvs[ 1 ] );
      addUV( uvs[ 3 ] );

      addUV( uvs[ 1 ] );
      addUV( uvs[ 2 ] );
      addUV( uvs[ 3 ] );

    }

    function addVertex( index ) {

      verticesArray.push( placeholder[ index * 3 + 0 ] );
      verticesArray.push( placeholder[ index * 3 + 1 ] );
      verticesArray.push( placeholder[ index * 3 + 2 ] );

      let length = placeholder_length[ index ];

      currentLengthNormalizedArray.push( length );
    }

    function addUV( vector2 ) {

      uvArray.push( vector2.x );
      uvArray.push( vector2.y );

    }

  }

};

THREE.ExtrudeBufferGeometryWithLength.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.ExtrudeBufferGeometryWithLength.prototype.constructor = THREE.ExtrudeBufferGeometryWithLength;

/*THREE.ExtrudeBufferGeometryWithLength.prototype.toJSON = function () {

  var data = THREE.BufferGeometry.prototype.toJSON.call( this );

  var shapes = this.parameters.shapes;
  var options = this.parameters.options;

  return toJSON( shapes, options, data );

};*/
