import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class SpacerCard extends React.Component {
    state = {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

       // console.log(this.props.currentCard.id, this.props.event.progress);
        if (this.props.event.type != prevProps.event.type && this.props.event.type === 'start') {

            //console.log(this.props.cardprogresss);
            //console.log("started");

            this.props.setCard(this.props.card);
            //alert('set' + this.props.card.id)
            this.props.card.camera && this.props.updateCamera(this.props.card.camera);



        }
    }

    render() {

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $content : jsonb, $height : String){
                update_cards(where: {id: {_eq: $id}}, _set: {content: $content, height : $height}) {
                    returning {
                        id
                    }
                }
            }
        `;


        return (

            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <CardWrapper debug={this.props.debug} update={update} card={this.props.card} hideCards={this.props.hideCards}>


                    </CardWrapper>
                }}
            </Mutation>

          )

    }
}