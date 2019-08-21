import React, {Fragment} from 'react'
import {Button, Input} from 'antd';
import { FacebookProvider, LoginButton, Profile } from 'react-facebook';
import Login from './../Login'
import NewComment from './../NewComment'

import './index.css'

class Comments extends React.Component {

    render() {

        return (

            <div className="commentcontainer">

                {this.props.comments.map((comment, i) =>

                    <div className="commentmsg" key={i}>
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