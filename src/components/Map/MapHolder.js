import React, { Component, Fragment } from 'react';
import esriLoader from 'esri-loader';
import TWEEN from '@tweenjs/tween.js';
import './MapHolder.css';

import * as THREE from 'three'; //leave this in?

import RouteRenderer from './Renderers/RouteRenderer';
import ImageRenderer from './Renderers/ImageRenderer';

const options = {
    url: 'https://js.arcgis.com/4.12',
};

const _EXAGURATION = 2.5;
const _EXAGURATION_ADJUST = 1.005;

const yellowLineSymbol = {
    type: 'simple-line',
    color: [255,211,0, 0.2],
    width: 2
};

const redLineSymbol = {
    type: 'simple-line',
    color: [255,0,0, 0.55],
    width: 2
};

export default class MapHolder extends Component {

    static EXAGURATION = _EXAGURATION;
    static EXAGURATION_ADJUST = _EXAGURATION_ADJUST;

    state = {
        zoom : 0,

        currentCard : {camera : null},
        routeTailPercentage : 0.05,
        routeLengthPercentage : 0.0,
        routeGlowPercentage : 0.0,
        locationsWithAltitude : []
    };

    constructor() {
        super();
        this.needsRedraw = true;
        this.coords = { x: 0, y: 0 }; // Start at (0, 0)
        this.animate = this.animate.bind(this);
    }

    esriLoad() {
        var self = this;

        return esriLoader
            .loadModules(
                [
                    'esri/core/declare',
                    'esri/request',
                    "esri/core/watchUtils",
                    'esri/WebMap',
                    "esri/WebScene",
                    "esri/Camera",
                    'esri/views/SceneView',
                    'esri/layers/BaseTileLayer',
                    'esri/layers/BaseElevationLayer',

                    'esri/layers/GraphicsLayer',
                    'esri/layers/ElevationLayer',
                    'esri/layers/MapImageLayer',
                    'esri/geometry/Extent',
                    'esri/geometry/Multipoint',
                    'esri/geometry/Point',
                    'esri/geometry/Polyline',
                    'esri/symbols/SimpleLineSymbol',
                    'esri/symbols/TextSymbol',
                    'esri/views/3d/externalRenderers',
                    'esri/geometry/SpatialReference',
                    'esri/geometry/support/webMercatorUtils',
                    'esri/geometry/geometryEngine',
                    'esri/Graphic',
                    "esri/symbols/LineSymbol3D",
                    "esri/symbols/LineSymbol3DLayer",
                ],
                options
            )
            .then(
                ([
                     declare,
                     esriRequest,
                     watchUtils,
                     WebMap,
                     WebScene,
                     Camera,
                     SceneView,
                     BaseTileLayer,
                     BaseElevationLayer,
                     GraphicsLayer,
                     ElevationLayer,
                     MapImageLayer,
                     Extent,
                     Multipoint,
                     Point,
                     Polyline,
                     SimpleLineSymbol,
                     TextSymbol,
                     externalRenderers,
                     SpatialReference,
                     webMercatorUtils,
                     geometryEngine,
                     Graphic,
                     LineSymbol3D,
                     LineSymbol3DLayer
                 ]) => {

                    console.log(esriRequest);
                    const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
                        properties: {
                            exaggeration: _EXAGURATION
                        },

                        load: function() {
                            this._elevation = new ElevationLayer({
                                url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
                            });

                            // wait for the elevation layer to load before resolving load()
                            this.addResolvingPromise(this._elevation.load());
                        },

                        // Fetches the tile(s) visible in the view
                        fetchTile: function(level, row, col) {
                            return this._elevation.fetchTile(level, row, col).then(
                                function(data) {
                                    var exaggeration = this.exaggeration;
                                    for (var i = 0; i < data.values.length; i++) {
                                        data.values[i] = data.values[i] * exaggeration;
                                    }

                                    return data;
                                }.bind(this)
                            );
                        }
                    });

                    const GreyLayer = BaseTileLayer.createSubclass({
                        properties: {
                            urlTemplate: null,
                        },

                        // generate the tile url for a given level, row and column
                        getTileUrl: function(level, row, col) {

                            //console.log(this.urlTemplate);

                            return self.props.tile_server
                                .replace('{z}', level)
                                .replace('{x}', col)
                                .replace('{y}', row);
                        },

                        // This method fetches tiles for the specified level and size.
                        // Override this method to process the data returned from the server.
                        fetchTile: function(level, row, col) {
                            // call getTileUrl() method to construct the URL to tiles
                            // for a given level, row and col provided by the LayerView
                            var url = this.getTileUrl(level, row, col);

                            // request for tiles based on the generated url
                            return esriRequest(url + "?blankTile=false", {
                                responseType: 'image',
                            }).then(
                                function(response) {


                                    // when esri request resolves successfully
                                    // get the image from the response
                                    var image = response.data;
                                    var width = this.tileInfo.size[0] * 1;
                                    var height = this.tileInfo.size[0] * 1;

                                    // create a canvas with 2D rendering context
                                    var canvas = document.createElement('canvas');
                                    var context = canvas.getContext('2d');
                                    canvas.width = width;
                                    canvas.height = height;

                                    context.fillStyle = 'rgba(0, 0, 0, 1)';

                                    context.globalAlpha = 1;
                                    context.fillRect(0, 0, width, height);
                                    context.globalCompositeOperation = 'luminosity';
                                    context.drawImage(image, 0, 0, width, height);

                                    return canvas;
                                }.bind(this)
                            );
                        },
                    });

                    // Create a new instance of the TintLayer and set its properties
                    const greyTileLayer = new GreyLayer({
                        opacity : 1,
                        urlTemplate:
                            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        title: 'Black and White',
                    });

                    var worldGround = new ElevationLayer({
                        url:
                            'http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
                        visible: false,
                    });

                    const map = new WebMap({

                        ground: {
                            layers: [new ExaggeratedElevationLayer()]
                        },
                        layers: [greyTileLayer],
                    });

                    const view = new SceneView({
                        map: map,

                        // center : [20.438086772337208, 42.389699080958245],
                        container: 'viewDiv',

                        viewingMode : "local",

                        qualityProfile: "high",

                        alphaCompositingEnabled: false,

                        camera: this.props.cards.length && this.props.cards[0].camera || {"tilt":9.564290056641534,"heading":332.9405924852655,"position":{"x":4819863.103260796,"y":5203037.466432226,"z":25111011.181454599835,"spatialReference":{"wkid":102100,"latestWkid":3857}}},

                        ui: {
                            components: []
                        },
                        environment: {

                            background: {
                                type: "color",
                                color: [255, 252, 244, 0]
                            },

                            // disable stars
                            starsEnabled: false,
                            //disable atmosphere
                            atmosphereEnabled: true,
                        },
                    });




                    view.watch('camera', function(newValue, oldValue, property, object) {
                        if (!self.props.showCards) {
                            self.props.updateCamera(newValue, view.extent);
                           // console.log(newValue);
                        }

                    });

                    view.when(x=> {

                        var camera = view.camera.clone();
                        self.originalCamera = view.camera.clone();
                        var center = view.center.clone();
                        var scale = view.scale;

                        var i = 0;

                        if (false) self.rotator = window.setInterval(d=> {

                            var newCenter = center.clone();
                            newCenter.x -= i * scale /3000 ;
                            i++;

                            view.goTo({
                                center: newCenter,
                                scale: scale,
                                heading: camera.heading,
                                tilt: camera.tilt
                            }, { animate: false });
                        }, 1/30);
                    })


                    self.esriLoaderContext = {
                        declare,
                        WebMap,
                        SceneView,
                        GraphicsLayer,
                        SpatialReference,
                        externalRenderers,
                        geometryEngine,
                        Graphic,
                        Point,
                        Polyline,
                        SimpleLineSymbol,
                        view,
                        webMercatorUtils,
                        worldGround
                    };

                    self.props.registerContext(self.esriLoaderContext);




                    const geojson = this.props.alllocations.map(d=> [d.longitude, d.latitude])

                    //console.log("geojson")
                    //console.log(geojson)
                    worldGround.queryElevation(new Polyline(geojson)).then(result => {

                        //for
                       this.props.setLocationsWithAltitude(result.geometry.paths);

                       console.log(result.geometry.paths);

                       this.props.cards.forEach(card => {
                           
                           if (card.locations.length) {

                               const yellowLine = new Polyline({
                                   hasZ: true,
                                   paths: [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * (_EXAGURATION * card.altitude_adjust)])],
                               });

                               var graphicsLayer = new GraphicsLayer({ id : 'CardLayer' + card.id, visible : false});

                               //graphicsLayer.hide();

                               const redLineGraphic = Graphic({
                                   geometry: yellowLine,
                                   symbol: yellowLineSymbol
                               });

                               graphicsLayer.add(redLineGraphic);
                               map.add(graphicsLayer);
                           }

                       });
                       



                        /*3d stuff*/
                        self.routeRenderer = new RouteRenderer(self.esriLoaderContext, []);
                        externalRenderers.add(view, self.routeRenderer);


                        const images = [{"description":{"title":"Lagoon"},"id":1,"location":{"geometry":{"coordinates":[42,42,1400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}},{"description":{"title":"church"},"id":2,"location":{"geometry":{"coordinates":[42,42.1,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}}];
                        //const { images } = self.props;

                        //self.routeRenderer = new RouteRenderer(self.esriLoaderContext);
                        //self.imageRenderer = new ImageRenderer(self.esriLoaderContext, images);

                        //externalRenderers.add(view, self.routeRenderer);


                        self.routeRenderer.setTrailLength(this.state.routeTailPercentage);
                        self.needsRedraw = true;

                    }).catch(d=> {
                        console.log(d);
                    });







                    //externalRenderers.add(view, self.imageRenderer);

                    window.requestAnimationFrame(self.animate);

                }
            )
            .catch(err => {
                console.error(err);
            });
    }

    getLoc =(longitude, latitude, zoom) => {

        //return this.originalCamera;

        var camera = this.originalCamera;
        camera.position.longitude = longitude;
        camera.position.latitude = latitude;
        camera.position.z = zoom;
        camera.tilt = -20;

        return camera;
    }

    componentDidUpdate(prevProps, prevState) {

        let that = this;
        const camera = this.props.card && this.props.card.camera;


        /*if gps range slider is changed*/
        if (false && that.esriLoaderContext && that.locationsWithAltitude && prevProps.gpsRange !== this.props.gpsRange)         {



            const oldLayer = that.esriLoaderContext.view.map.findLayerById('lineLayer');
            if (oldLayer) oldLayer.removeAll();

            const orig = this.locationsWithAltitude[0].slice();
            const result = orig.splice(this.props.gpsRange[0], this.props.gpsRange[1] - this.props.gpsRange[0]);

            //console.log(result);

            const yellowLine = new that.esriLoaderContext.Polyline({
                hasZ: true,
                paths: [result]
            });

            const yellowLineGraphic = new that.esriLoaderContext.Graphic({
                geometry: yellowLine,
                symbol: yellowLineSymbol
            });

            if (oldLayer) oldLayer.add(yellowLineGraphic);

        }

        if (true && prevProps.locations != this.props.locations && this.props.locations && this.props.locations.length && this.esriLoaderContext && this.esriLoaderContext.externalRenderers && this.routeRenderer) {

            that.routeRenderer.setProgress(0);
            that.needsRedraw = true;

            //const wholeroutegeojson = this.props.alllocations.map(d=> [d.longitude, d.latitude])
            //const geojson = this.props.locations.map(d=> [d.longitude, d.latitude])

            console.log(this.props);
            const orig = this.props.locationsWithAltitude[0].slice();
            const result = orig.splice(this.props.card.location_offset[0], this.props.card.location_offset[1] - this.props.card.location_offset[0]);

           // debugger;

            console.log(result);

            that.esriLoaderContext.view.goTo(this.props.card.camera, {animate: false, duration: 1000}).then(x=> {

                that.esriLoaderContext.view.map.layers.items.forEach(layer => {
                      if (layer.type == 'graphics') layer.visible = false;
                });

                const cardLayer = that.esriLoaderContext.view.map.findLayerById('CardLayer' + this.props.card.id);
                cardLayer.visible = true;

                console.log(this.props.card);

                this.routeRenderer.setGPSRange([result.map(d=> [d[0], d[1], d[2] * (_EXAGURATION * this.props.card.altitude_adjust)])],
                    that.esriLoaderContext.externalRenderers,
                    that.esriLoaderContext.view,
                    that.esriLoaderContext.SpatialReference,
                    that.esriLoaderContext.view.camera);

                that.routeRenderer.setTrailLength(0.25);
                const time = 6000;
                var start = null;
                const incrementProgress = (timestamp) => {
                    if (!start) start = timestamp;
                    var progress = timestamp - start;
                    that.routeRenderer.setProgress(progress/time);

                    //if (progress > 5800) that.routeRenderer.setTrailLength(0.25 - 0.25 * (progress/time));

                    that.needsRedraw = true;
                    if (progress < time) {
                        window.requestAnimationFrame(incrementProgress);
                    }
                }

                window.requestAnimationFrame(incrementProgress);

                //console.log(cardLayer);

                //cardLayer.show();
               /* this.esriLoaderContext.worldGround.queryElevation(new this.esriLoaderContext.Polyline(wholeroutegeojson)).then(result => {

                    //this.locationsWithAltitude = [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * (_EXAGURATION * _EXAGURATION_ADJUST)])];

                    //this.props.setLocationsWithAltitude(this.locationsWithAltitude);

                    const oldLayer = that.esriLoaderContext.view.map.findLayerById('lineLayer');
                    oldLayer.removeAll();

                    const yellowLine1 = new that.esriLoaderContext.Polyline({
                        hasZ: true,
                        paths: [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * (_EXAGURATION * this.props.card.altitude_adjust)])],
                    });

                    const redLineGraphic = new that.esriLoaderContext.Graphic({
                        geometry: yellowLine1,
                        symbol: yellowLineSymbol
                    });

                    oldLayer.add(redLineGraphic);*/


                //}).then(()=> {

                   /* return this.esriLoaderContext.worldGround.queryElevation(new this.esriLoaderContext.Polyline(geojson)).then(result => {

                        if (result) {

                            this.routeRenderer.setGPSRange([result.geometry.paths[0].map(d=> [d[0], d[1], d[2]  * (_EXAGURATION * this.props.card.altitude_adjust)])],
                                that.esriLoaderContext.externalRenderers,
                                that.esriLoaderContext.view,
                                that.esriLoaderContext.SpatialReference,
                                that.esriLoaderContext.view.camera);

                           /!* const oldLayer = that.esriLoaderContext.view.map.findLayerById('lineCardLayer');
                            oldLayer.removeAll();

                            const redLine = new that.esriLoaderContext.Polyline({
                                hasZ: true,
                                paths: [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * (_EXAGURATION * this.props.card.altitude_adjust)])],
                            });

                            const redLineGraphic = new that.esriLoaderContext.Graphic({
                                geometry: redLine,
                                symbol: redLineSymbol
                            });*!/



                            that.routeRenderer.setTrailLength(0.25);
                            const time = 6000;
                            var start = null;
                            const incrementProgress = (timestamp) => {
                                if (!start) start = timestamp;
                                var progress = timestamp - start;
                                that.routeRenderer.setProgress(progress/time);

                                //if (progress > 5800) that.routeRenderer.setTrailLength(0.25 - 0.25 * (progress/time));

                                that.needsRedraw = true;
                                if (progress < time) {
                                    window.requestAnimationFrame(incrementProgress);
                                }
                            }



                            window.requestAnimationFrame(incrementProgress);


                        }

                    })*/



            });






        }

    }

    componentDidMount() {
        this.esriLoad();


      //this.props.lToTop();
    }

    animate(time) {

        window.requestAnimationFrame(this.animate);

        if (!this.animate.last_tweens_count) this.animate.last_tweens_count = 0;

        let tweens_count = Object.keys(TWEEN._tweens).length;

        if (this.needsRedraw || tweens_count || this.animate.last_tweens_count != tweens_count) {

            if (tweens_count || this.animate.last_tweens_count != tweens_count) {

                //alert('in here')
                TWEEN.update(time);
                //console.log(time);
            }

            if (
                this.esriLoaderContext &&
                this.esriLoaderContext.externalRenderers &&
                this.esriLoaderContext.view &&
                this.esriLoaderContext.view._stage
            ) {
                this.esriLoaderContext.externalRenderers.requestRender(this.esriLoaderContext.view);

                this.needsRedraw = false;
            }
        }

        this.animate.last_tweens_count = tweens_count;
    }

    onTailLengthInputChange(event) {

        const value = parseFloat(event.target.value) || 0.0;

        this.setState({routeTailPercentage: value});

        if (this.routeRenderer) {

            this.routeRenderer.setTrailLength(value);

            this.needsRedraw = true;
        }
    }

    onRouteLengthInputChange(event) {

        const value = parseFloat(event.target.value) || 0.0;

        this.setState({routeLengthPercentage: value});

        if (this.routeRenderer) {

            this.routeRenderer.setProgress(value);

            this.needsRedraw = true;
        }
    }

    onGlowInputChange(event) {

        const value = parseFloat(event.target.value) || 0.0;

        this.setState({routeGlowPercentage: value});

        if (this.routeRenderer) {

            this.routeRenderer.setGlow(value);

            this.needsRedraw = true;
        }
    }

    render() {

        const self = this;
        return (
        <Fragment>

            <div 
                id="viewDiv" 
                className={'viewDiv'} />

           {/* {this.props.debug && <div>*/}

         {/*  <input
                style = {{position:'fixed', top:'10px', left: '20px', zIndex : 999999, width:'400px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeLengthPercentage} 
                onChange={(event) => {self.onRouteLengthInputChange(event);}}
                step="0.00005"/>

           <input
                style = {{position:'fixed', top:'50px', left: '20px', zIndex : 999999, width:'400px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeTailPercentage} 
                onChange={(event) => {self.onTailLengthInputChange(event);}}
                step="0.001"/>*/}


                {/*

            <input 
                style = {{position:'fixed', top:'90px', left: '20px', zIndex : 999999, width:'400px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeGlowPercentage} 
                onChange={(event) => {self.onGlowInputChange(event);}}
                step="0.001"/>*/}
            {/*\</div>*/}

        </Fragment>);
    }
}
