import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

import './index.css'

export default class ImageCard extends React.Component {
    state = {
        image: this.props.card.content.image.secure_url.replace('upload/', 'upload/w_2500/'), //
        crop:  { x: 0, y: 0 },
        zoom:  1.2,
        aspect: 4 / 3,
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        /*if (prevProps.event.type !== this.props.event.type && this.props.event.type === 'start') {
               this.props.setCard(this.props.card);
        }*/

        if (prevProps.cardprogresss != this.props.cardprogresss) {
            //  console.log(this.props.card.id, this.props.cardprogresss);

            if (this.props.card.id === this.props.currentCard.id) {
                this.props.updateProgress(this.props.cardprogresss);
            }
        }

        if (this.props.event.type != prevProps.event.type && this.props.event.type === 'start') {

            //console.log(this.props.cardprogresss);
            //console.log("started");

            this.props.setCard(this.props.card);
            //alert('moved to camera' + this.props.card.id)
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


                    return <CardWrapper debug={this.props.debug} clear={this.props.clear} update={update} card={this.props.card} hideCards={this.props.hideCards}>

                            <div style={{textAlign : 'center'}} >



                            <img className={'ImageCard ' + (this.props.card.content.image.height > this.props.card.content.image.width ? 'portrait' : 'landscape')} src={this.state.image}/>
                           {/* <Cropper
                                style={{cropAreaStyle :{color : 'rgba(0,0,0,0.9)'}}}
                                showGrid={false}
                                cropSize={{height: window.outerWidth, width : window.outerWidth}}
                                image={this.state.image}
                                crop={this.state.crop}
                                zoom={this.state.zoom}
                                aspect={this.state.aspect}
                                onCropChange={this.onCropChange}
                                onCropComplete={this.onCropComplete}
                                onZoomChange={this.onZoomChange}
                            />*/}

                           {/* <SaveButton onClick={() =>  {  create();   } }/>*/}

                        </div>
                    </CardWrapper>
                }}
            </Mutation>

          )

    }
}