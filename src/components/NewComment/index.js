import React, { Component} from 'react';
import {Button, Input, Row, Col} from 'antd';
import { FacebookProvider, LoginButton, Status } from 'react-facebook';
import {Mutation} from "react-apollo";
import gql from "graphql-tag";




const INSERT_COMMENT = gql`
    mutation insert_comments($objects : [comments_insert_input!]!){
        insert_comments(objects: $objects) {
            returning {
                id
                name
                text
            }
        }
    }

`;



export default class Example extends Component {

    state = {text : "", inputVisible : false};

    render() {

        const addComment = (card, profile, update) => {

            update({variables : {"objects" : {"card_id" : card.id, "name" : profile.name, "text" : this.state.text  }}}).then(c=> {
                this.setState({text  : '', inputVisible : false});

                this.props.updateComments(c.data.insert_comments.returning["0"]);
            });
            /*this.props.finish();*/
        }

        return (

            <Mutation mutation={INSERT_COMMENT}>
                {(update, { data }) => {
                    return  <div style={{width: '100%', float: 'right'}}>
                        <Row>
                            <Col span={20}>
                                <Input style={{display :  this.state.inputVisible ? '' : 'none' }} id={`comment_${this.props.card.id}`} value={this.state.text} placeholder='Write a comment' onChange={e => this.setState({text : e.target.value})}/>
                            </Col>
                            <Col span={3} offset={1} >
                                <Button disabled={this.state.inputVisible && this.state.text.length === 0} onClick={()=> {

                                    if (this.state.inputVisible) {
                                        addComment(this.props.card, this.props.profile, update)
                                    } else {
                                        document.getElementById(`comment_${this.props.card.id}`).focus();
                                        this.setState({inputVisible : true})
                                    }


                                }}>
                                    Add
                                </Button>
                            </Col>

                        </Row>
                    </div>

                    /*return <div onClick={() => updateCamera(this.props.card, update)}><Button type="primary" shape="circle" icon="warning" /></div>*/
                }}
            </Mutation>

        );
    }
}