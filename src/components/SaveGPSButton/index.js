import React from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class SaveGPSButton extends React.Component {


    render() {

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $camera : jsonb){
                update_cards(where: {id: {_eq: $id}}, _set: {camera: $camera}) {
                    returning {
                        id
                    }
                }
            }
        `;

        const updateCamera = (card, camera, update) => {

            console.log(this.props);
            //alert(this.props.card.id);
           // debugger;
            update({variables : {"id" : this.props.card.id, "camera" : this.props.context.view.camera.clone().toJSON()  }});
            this.props.finish();
        }

        return (

            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <div onClick={() => updateCamera(this.props.card, this.props.camera,  update)} style={{fontSize : '300%', zIndex : 9999998, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, right : 0}}><Button type="primary" shape="circle" icon="save" /></div>
                }}
            </Mutation>

        )

    }
}


//export default ({onClick}) =>
