import React, { Fragment } from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class SaveGPSButton extends React.Component {

    render() {

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $camera : jsonb, $locations : jsonb, $location_offset : jsonb){
                update_cards(where: {id: {_eq: $id}}, _set: {camera: $camera, locations: $locations, location_offset : $location_offset}) {
                    returning {
                        id
                    }
                }
            }
        `;

        const updateCamera = (card, locations, gpsRange, camera, extent, update) => {

            const pointsInsideExtent = [];
            const indexesInsideExtent = {};

            locations.forEach((location, i) => {

                if (extent.clone().expand(1.5).contains({
                    type: "point", // autocasts as new Point()
                    x: location.longitude,
                    y: location.latitude,
                    spatialReference:{"wkid":4326}
                })) {

                    pointsInsideExtent.push(location);
                    //indexesInsideExtent[i] = true;
                }
            })




            update({variables : {"id" : this.props.card.id, "locations" : pointsInsideExtent, location_offset : [], "camera" : camera  }});
            this.props.finish();
        }

        return (

            <div style={{fontSize : '300%', zIndex : 9999998, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, left : 0}}>


            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <div onClick={() => updateCamera(this.props.card, this.props.locations, this.props.gpsRange, this.props.camera, this.props.extent, update)} >

                        <Button type="primary" shape="circle" icon="save" /></div>
                }}
            </Mutation>

            </div>

        )

    }
}


//export default ({onClick}) =>
