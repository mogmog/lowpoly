import React, {Fragment} from 'react'
import Cropper from 'react-easy-crop'
import SaveButton from "./../../SaveButton";
import CardWrapper from './../../CardWrapper'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

export default class ImageCard extends React.Component {
    state = {
        image: this.props.card.content.image.secure_url, //
        crop:  { x: 0, y: 0 },
        zoom:  1.2,
        aspect: 4 / 3,
    }

    onCropChange = crop => {
        this.setState({ crop })
    }

    onCropComplete = (croppedArea, croppedAreaPixels) => {
        console.log(croppedArea, croppedAreaPixels)
    }

    onZoomChange = zoom => {
        this.setState({ zoom })
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

                    let create = (params) => {

                        /*add a new field for crop*/
                        let newContent = this.props.card.content;
                        newContent.crop = this.state.crop;
                        newContent.zoom = this.state.zoom;

                        update({variables : {"id" : this.props.card.id, "content" : newContent }});
                    };

                    return <CardWrapper update={update} card={this.props.card}>

                            <div>

                            <img src={this.state.image}/>
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