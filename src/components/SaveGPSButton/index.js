import React, { Fragment } from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class SaveGPSButton extends React.Component {

    render() {

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $camera : jsonb, $locations : jsonb){
                update_cards(where: {id: {_eq: $id}}, _set: {camera: $camera, locations: $locations}) {
                    returning {
                        id
                    }
                }
            }
        `;

        const updateCamera = (card, locations, gpsRange, camera, update) => {

            const orig = locations.slice();

            let selectedLocations = [];

            if (gpsRange) {
                selectedLocations = orig.splice(gpsRange[0], gpsRange[1] - gpsRange[0]);
            } else {
                selectedLocations = card.locations;
            }


            alert(selectedLocations.length);

           // debugger;
            update({variables : {"id" : this.props.card.id, "locations" : selectedLocations, "camera" : this.props.context.view.camera.clone().toJSON()  }});
            this.props.finish();
        }

        return (

            <div style={{fontSize : '300%', zIndex : 9999998, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, left : 0}}>


            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <div onClick={() => updateCamera(this.props.card, this.props.locations, this.props.gpsRange, this.props.camera,  update)} >

                        <Button type="primary" shape="circle" icon="save" /></div>
                }}
            </Mutation>

            </div>

        )

    }
}


//export default ({onClick}) =>
