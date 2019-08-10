import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import ReactPlayer from 'react-player'
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class VideoCard extends React.Component {

    componentDidMount() {
        let that = this;

        let scrollPlay = () => {
            //var frameNumber  = window.pageYOffset/500;
            if (this.player) {
                this.player.currentTime = this.props.cardprogress * 10;
            }

            window.requestAnimationFrame(scrollPlay);
        }

        //window.requestAnimationFrame(scrollPlay);



    }




    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.player && this.props.event && this.props.event.state === 'DURING' && prevProps.cardprogress != this.props.cardprogress) {


            if (this.props.cardprogress) {

               this.player.play();

                //console.log(this.player.currentTime = this.props.cardprogress * 10);

                //this.player.seekTo(this.props.cardprogress  );
               // console.log(prevProps.cardprogress);
            }

           // this.props.setCard(this.props.card);
        }
    }

    ref = player => {
        this.player = player
this.loaded = false;
let that = this;
      /*  !this.loaded && player && player.addEventListener("canplaythrough", function() {
           //alert(1);
           that.loaded = true;
        }, false);*/

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
video

                                {this.props.cardprogress}

                               {/* <VideoScroll
                                    onLoad={props =>
                                        setStyles(props.wrapperEl, props.videoEl, 20)
                                    }
                                    playbackRate={15}
                                    style={{ position: 'sticky' }}
                                >
                                    <video
                                        tabIndex="0"
                                        autobuffer="autobuffer"
                                        preload="preload"
                                        style={{ width: '100%', objectFit: 'contain' }}
                                        playsInline
                                    >
                                        <source type="video/mp4" src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" />
                                    </video>
                                </VideoScroll>*/}

                                <video autobuffer="autobuffer" preload="preload" ref={this.ref} width="100%" controls id="VideoId" muted={true} autoPlay={true} loop={true}>
                                    <source src={this.props.card.content.image.url} type="video/mp4"/>
                                </video>

                               {/* <ReactPlayer
                                    ref={this.ref}
                                    className='react-player'
                                    width='auto'
                                    height='100vw'
                                    muted={true}
                                    playing={false}
                                    controls={true}
                                    url={'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'}

                                />*/}

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