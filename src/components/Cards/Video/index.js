import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import ReactPlayer from 'react-player'
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class VideoCard extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.event != prevProps.event && this.props.event.type === 'enter') {

            this.props.setCard(this.props.card,x=> {
                this.props.card.camera && this.props.updateCamera(this.props.card.camera);
            });

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

                    const setStyles = (wrapperEl, videoEl, playbackRate) => {
                        wrapperEl.style.marginTop = `calc(180% - ${Math.floor(videoEl.duration) *
                        playbackRate +
                        'px'})`
                        wrapperEl.style.marginBottom = `calc(180% - ${Math.floor(videoEl.duration) *
                        playbackRate +
                        'px'})`
                    }

                    return <CardWrapper debug={this.props.debug} clear={this.props.clear} update={update} card={this.props.card} hideCards={this.props.hideCards}>

                            <div style={{height: '100vh'}}>

                                <video autobuffer="autobuffer" playsInline preload="preload" ref={this.ref} width="100%" controls={this.props.card.controls} id="VideoId" muted={true} autoPlay={true} loop={true}>
                                    <source src={this.props.card.content.image.url} type="video/mp4"/>
                                </video>

                        </div>
                    </CardWrapper>
                }}
            </Mutation>

          )

    }
}