import React, {Fragment} from 'react'

import CardWrapper from "../../CardWrapper";
import './index.css'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

class HtmlCard extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {

        /*if (prevProps.event.type !== this.props.event.type && this.props.event.type === 'start') {
               this.props.setCard(this.props.card);
        }*/

        if (this.props.event.type != prevProps.event.type && this.props.event.type === 'start') {
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

        const {event, clear} = this.props;

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $content : jsonb, $duration : String){
                update_cards(where: {id: {_eq: $id}}, _set: {content: $content, duration : $duration}) {
                    returning {
                        id
                    }
                }
            }
        `;

        //console.log(this.props.event)

        return (

            <Mutation mutation={UPDATE_CARD_CONTENT}>
                {(update, { data }) => {

                    return <CardWrapper setGPSRange={this.props.setGPSRange} debug={this.props.debug} clear={clear} card={this.props.card} update={update} clearMap={this.props.clearMap} hideCards={this.props.hideCards}>
                            <div className={'htmlcard'} style={{height : this.props.card.duration}}>

                                <div dangerouslySetInnerHTML={{ __html: this.props.card.content.html }}/>
                               {/* <pre style={{position : 'absolute', textAlign : 'bottom'}}>{this.props.cardprogress} </pre>*/}
                            </div>
                        </CardWrapper>
                }}
            </Mutation>


        )
    }

}

export default HtmlCard