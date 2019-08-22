import React, {Fragment} from 'react'
import {Button, Input} from 'antd';
import {Motion, spring} from 'react-motion';
import { FacebookProvider, LoginButton, Profile } from 'react-facebook';
import Login from './../Login'
import NewComment from './../NewComment'

import './index.css'
import {ApolloProvider} from "react-apollo";

class Comments extends React.Component {

    state = {allComments : false};

    render() {

        return (

            <div className="commentcontainer">

                {this.props.comments.map((comment, i) =>

                <div className="commentmsg" key={i} style={{display : i > 2 ? 'none' : ''}}>
                        <div className="bubble altfollow">
                            <div className="txt">
                        <span className="name alt"> {comment.name}
                        </span>

                                <p className="message">{comment.text}</p>
                            </div>
                            <div className="bubble-arrow alt"></div>
                        </div>
                    </div>
                )}

                {!this.state.allComments && this.props.comments.length > 2 &&  <Button onClick={()=> this.setState({allComments : true})} style={{float: 'right'}}>See all {this.props.comments.length} comments</Button> }

                {this.state.allComments && this.props.comments.map((comment, i) =>

                    <Motion defaultStyle={{x: 0}} style={{x: spring(this.state.allComments ? 100 : 0)}}>
                        {value =>

                            <div className="commentmsg" key={i} style={{height : value.x + '%', display: i <= 2 ? 'none' : ''}}>
                                <div className="bubble altfollow">
                                    <div className="txt">
                        <span className="name alt"> {comment.name}
                        </span>

                                        <p className="message">{comment.text}</p>
                                    </div>
                                    <div className="bubble-arrow alt"></div>
                                </div>
                            </div>
                        }
                    </Motion>
                )}



                <FacebookProvider appId="701543783645741">
                    <Profile>
                        {({ loading, profile }) => (

                            <div>
                                {!profile && <Login/>}

                                {profile && <NewComment updateComments={this.props.updateComments} card={this.props.card} profile={profile}/> }

                            </div>
                        )}
                    </Profile>
                </FacebookProvider>

            </div>
                )


    }

}

export default Comments