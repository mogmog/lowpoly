import React, {Fragment} from 'react'

import CardWrapper from "../../CardWrapper";
import './index.css'
import {Mutation} from "react-apollo";

import gql from "graphql-tag";

class HtmlCard extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.event.type !== this.props.event.type && this.props.event.type === 'start') {
               this.props.setCard(this.props.card);
        }
    }

    render() {

        const {event} = this.props;

        const UPDATE_CARD_CONTENT = gql`
            mutation updatecard($id, : Int!, $content : jsonb, $height : String){
                update_cards(where: {id: {_eq: $id}}, _set: {content: $content, height : $height}) {
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

                    return <CardWrapper card={this.props.card} update={update} hideCards={this.props.hideCards}>
                            <div className={'htmlcard'} >
                                <pre> {JSON.stringify(this.props.event)} </pre>
                                <div dangerouslySetInnerHTML={{ __html: this.props.card.content.html }}/>
                            </div>
                        </CardWrapper>
                }}
            </Mutation>


        )
    }

}

export default HtmlCard