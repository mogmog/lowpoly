import React, { Fragment } from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class SaveGPSButton extends React.Component {

    render() {

        const UPDATE_CARD_CONTENT_WITH_LOCATIONS = gql`
            mutation updatecard($id, : Int!, $location_offset : jsonb){
                update_cards(where: {id: {_eq: $id}}, _set: { location_offset : $location_offset}) {
                    returning {
                        id
                    }
                }
            }
        `;

        const UPDATE_CARD_CAMERA = gql`
            mutation updatecard($id, : Int!, $camera : jsonb){
                update_cards(where: {id: {_eq: $id}}, _set: {camera: $camera}) {
                    returning {
                        id
                    }
                }
            }
        `;

        const updateLocationAndCamera = (card, locations,  locationsWithAltitude, gpsRange, camera, extent, update, withLocations) => {

            const pointsInsideExtent = [];
            const indexesInsideExtent = [];

            let first = 0, last = 0;
            //if (withLocations) {
                //console.log();

                locations.forEach((location, i) => {

                    //console.log(locationsWithAltitude[0][i][2]);

                    if (extent.clone().expand(1.0).contains({
                        type: "point", // autocasts as new Point()
                        hasZ : true,
                        x: location.longitude,
                        y: location.latitude,
                        z : locationsWithAltitude[0][i][2],
                        spatialReference:{"wkid":4326}
                    })) {
                        pointsInsideExtent.push(location);
                        indexesInsideExtent.push(i);
                    }
                })
            //}
            //alert(JSON.stringify(indexesInsideExtent));
            update({variables : {"id" : this.props.card.id, location_offset : [indexesInsideExtent[0], indexesInsideExtent[indexesInsideExtent.length - 1]]   }});
            this.props.finish();
        }

        const updateCamera = (card,  camera, update) => {

            update({variables : {"id" : this.props.card.id, "camera" : camera  }});
            this.props.finish();
        }


        return (

            <div style={{fontSize : '300%', zIndex : 9999998, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, left : 0}}>



            <Mutation mutation={UPDATE_CARD_CONTENT_WITH_LOCATIONS}>
                {(update_locations, { data }) => {

                    return <div  >
                         <Button onClick={() => updateLocationAndCamera(this.props.card, this.props.locations, this.props.locationsWithAltitude, this.props.gpsRange, this.props.camera, this.props.extent, update_locations)} type="primary" shape="circle" icon="save" />
                    </div>
                }}
            </Mutation>


            <Mutation mutation={UPDATE_CARD_CAMERA}>
                {(update_camera, { data }) => {

                    return <div  >
                        <Button onClick={() => updateCamera(this.props.card,  this.props.camera, update_camera)} type="primary" shape="circle"> </Button>
                    </div>
                }}
            </Mutation>

            </div>

        )

    }
}


//export default ({onClick}) =>
