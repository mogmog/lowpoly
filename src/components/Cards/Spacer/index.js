import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";
import HtmlCard from "../../../App";

export default class SpacerCard extends React.Component {
    state = {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        /*if (prevProps.event.type !== this.props.event.type && this.props.event.type === 'start') {
               this.props.setCard(this.props.card);
        }*/

        if (prevProps.cardprogresss != this.props.cardprogresss) {
           // console.log(this.props.cardprogresss);

            if (this.props.card.id === this.props.currentCard.id) {
                this.props.updateProgress(this.props.cardprogresss);
            }
        }

        if (this.props.event.type != prevProps.event.type && this.props.event.type === 'start') {

            //console.log(this.props.cardprogresss);
            //console.log("started");

            this.props.setCard(this.props.card);
            // alert('set' + this.props.card.id)
            this.props.card.camera && this.props.updateCamera(this.props.card.camera);



        }


        if (this.props.card && this.props.currentcard && this.props.card.id === this.props.currentcard.id) {
            // console.log('fired')
            //  console.log(this.props, this.props.event.state)
            //alert(JSON.stringify(this.props.card.camera));
            //this.props.updateCamera(this.props.card.camera);
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

                    return <CardWrapper  index={this.props.index} debug={this.props.debug} update={update} card={this.props.card} hideCards={this.props.hideCards}>
                                <div style={{height : this.props.card.duration }}>
                                </div>

                    </CardWrapper>
                }}
            </Mutation>

          )

    }
}