import React, { Component, Fragment } from 'react';
import esriLoader from 'esri-loader';
import TWEEN from '@tweenjs/tween.js';
import './MapHolder.css';

import * as THREE from 'three'; //leave this in?
import ImageRenderer from './Renderers/ImageRenderer';
import RouteRenderer from './Renderers/RouteRenderer';

const options = {
    url: 'https://js.arcgis.com/4.10',
};

const EXAGURATION = 3.5;

export default class MapHolder extends Component {

    state = {
        zoom : 0, 
        currentCard : {camera : null},
        routeTailPercentage : 0.20,
        routeLengthPercentage : 0.0,
        routeGlowPercentage : 0.0,
        locationsWithAltitude : []
    };

    constructor() {
        super();
        this.needsRedraw = true;
        this.animate = this.animate.bind(this);
    }

    esriLoad() {
        var self = this;

        return esriLoader
            .loadModules(
                [
                    'esri/core/declare',
                    'esri/request',
                    'esri/WebMap',
                    "esri/WebScene",
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
                     WebMap,
                     WebScene,
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

                    const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
                        properties: {
                            exaggeration: EXAGURATION
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
                            return this.urlTemplate
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
                                    var width = this.tileInfo.size[0];
                                    var height = this.tileInfo.size[0];

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
                        qualityProfile: "high",
                        viewingMode : "local",

                        alphaCompositingEnabled: false,

                        Xcamera : {"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-307391.4364895002,"y":7216826.400379283,"z":100001583.47221267689},"heading":326.65066251089536,"tilt":60.95428259540638},

                        camera: {"tilt":9.564290056641534,"heading":332.9405924852655,"position":{"x":4819863.103260796,"y":5203037.466432226,"z":25111011.181454599835,"spatialReference":{"wkid":102100,"latestWkid":3857}}},

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




                   /* view.watch('camera', function(newValue, oldValue, property, object) {
                        if (!self.props.showCards) {
                           // self.props.updateCamera(newValue);
                           // console.log(newValue);
                        }

                    });*/

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
                    };

                    self.props.registerContext(self.esriLoaderContext);




                    const geojson = this.props.locations.map(d=> [d.longitude, d.latitude])

                    worldGround.queryElevation(new Polyline(geojson)).then(result => {

                        this.locationsWithAltitude = [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * EXAGURATION + 0.1])];

                        console.log('cached locationWithAltitude');

                        //self.setState({locationsWithAltitude : [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * 3.6])]});

                        const yellowLineSymbol = {
                            type: 'simple-line',
                            color: [255,211,0, 0.15],
                            width: 2
                        };

                        const yellowLine = new Polyline({
                            hasZ: true,
                            paths: [result.geometry.paths[0].map(d=> [d[0], d[1], d[2] * 3.6])],



                        });

                        const yellowLineGraphic = new Graphic({
                            geometry: yellowLine,
                            symbol: yellowLineSymbol
                        });



                        var graphicsLayer = new GraphicsLayer({id : 'lineLayer'});

                        graphicsLayer.add(yellowLineGraphic);

                        map.add(graphicsLayer);

                        //map.add(yellowLineLayer);

                        self.routeRenderer = new RouteRenderer(self.esriLoaderContext, result.geometry.paths);

                        externalRenderers.add(view, self.routeRenderer);
                        self.routeRenderer.setTrailLength(this.state.routeTailPercentage);
                        self.needsRedraw = true;

                    }).catch(d=> {
                        console.log(d);
                    });

                    const images = [{"description":{"title":"Lagoon"},"id":1,"location":{"geometry":{"coordinates":[42,42,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}},{"description":{"title":"church"},"id":2,"location":{"geometry":{"coordinates":[42,42.1,400.79999923706055],"type":"Point"},"properties":{},"type":"Feature"}}];
                    //const { images } = self.props;

                    //self.routeRenderer = new RouteRenderer(self.esriLoaderContext);
                    //self.imageRenderer = new ImageRenderer(self.esriLoaderContext, images);

                    //externalRenderers.add(view, self.routeRenderer);
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


        if (that.esriLoaderContext && that.locationsWithAltitude && prevProps.gpsRange !== this.props.gpsRange) {

            const oldLayer = that.esriLoaderContext.view.map.findLayerById('lineLayer');
            oldLayer.removeAll();

            const orig = this.locationsWithAltitude[0].slice();
            const result = orig.splice(this.props.gpsRange[0], this.props.gpsRange[1] - this.props.gpsRange[0]);

            const yellowLineSymbol = {
                type: 'simple-line',
                color: [255,211,0, 0.15],
                width: 2
            };

            const yellowLine = new that.esriLoaderContext.Polyline({
                hasZ: true,
                paths: [result]
            });

            const yellowLineGraphic = new that.esriLoaderContext.Graphic({
                geometry: yellowLine,
                symbol: yellowLineSymbol
            });

            oldLayer.add(yellowLineGraphic);

        }

        /*if (that.esriLoaderContext ) {

            this.routeRenderer.setGPSRange(this.props.locations.slice(0, 1000),
                that.esriLoaderContext.externalRenderers,
                that.esriLoaderContext.view,
                that.esriLoaderContext.SpatialReference,
                that.esriLoaderContext.view.camera);

            this.needsRedraw = true;
        }*/

        /*if (this.props.currentCard !== this.state.currentCard && that.esriLoaderContext) {

            if (this.routeRenderer) {

                this.routeRenderer.setTrailLength(0.2);

                this.needsRedraw = true;
            }


            var cam = that.esriLoaderContext.view.camera.clone();

            this.setState({currentCard: this.props.currentCard})

        }*/

        if (this.props.camera != prevProps.camera && that.esriLoaderContext && that.esriLoaderContext.view) {
          //  alert(JSON.stringify(this.props.camera));
             that.esriLoaderContext.view.goTo(this.props.camera, {animate: false, duration: 0});
        }

        if (this.props.totalProgress != prevProps.totalProgress  ) {

         /*   if (this.props.currentCard && this.props.currentCard.camera ) {
                that.esriLoaderContext.view.goTo(this.props.currentCard.camera, { animate : false, duration: 0});
            }*/

           // console.log(this.props.totalProgress);

            //this.setState({routeLengthPercentage: this.props.totalProgress});

            if (this.routeRenderer) {

                this.routeRenderer.setProgress(this.props.totalProgress, this.props.card.speedFactor);

                this.needsRedraw = true;
            }
        }
    }

    componentDidMount() {
        this.esriLoad();




        //this.props.scrollToTop();
    }

    animate(time) {

        window.requestAnimationFrame(this.animate);

        if (!this.animate.last_tweens_count) this.animate.last_tweens_count = 0;

        let tweens_count = Object.keys(TWEEN._tweens).length;

        if (this.needsRedraw || tweens_count || this.animate.last_tweens_count != tweens_count) {

            if (tweens_count || this.animate.last_tweens_count != tweens_count) {

                TWEEN.update(time);
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

           {/* <input
                style = {{position:'fixed', top:'10px', left: '20px', zIndex : 999999, width:'400px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeLengthPercentage} 
                onChange={(event) => {self.onRouteLengthInputChange(event);}}
                step="0.0005"/>

            <input 
                style = {{position:'fixed', top:'50px', left: '20px', zIndex : 999999, width:'400px'}}
                type="range" 
                min="0" max="1"
                value={self.state.routeTailPercentage} 
                onChange={(event) => {self.onTailLengthInputChange(event);}}
                step="0.001"/>

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
