import React from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class ClearGPSButton extends React.Component {


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

        const updateCamera = (card, update) => {

            update({variables : {"id" : this.props.card.id, "camera" : null  }});
            this.props.finish();
        }

        return (

            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <div onClick={() => updateCamera(this.props.card, update)}><Button type="primary" shape="circle" icon="warning" /></div>
                }}
            </Mutation>

        )

    }
}


//export default ({onClick}) =>
