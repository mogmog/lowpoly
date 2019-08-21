import React, { Component} from 'react';
import {Button} from 'antd';
import { FacebookProvider, LoginButton, Status } from 'react-facebook';

export default class Example extends Component {
    handleResponse = (data) => {

        localStorage.setItem({name : data.profile.name})
        console.log(data);
    }

    handleError = (error) => {
        this.setState({ error });
    }

    render() {
        return (
            <FacebookProvider appId="701543783645741">

                <Status>
                    {({ loading, status }) => (
                        <div>
                            {/*{status === 'connected' &&
                            <Button type="primary" shape="circle" icon="plus-circle" />
                            }*/}

                            {status !== 'connected' &&
                            <LoginButton
                                scope="email"
                                onCompleted={this.handleResponse}
                                onError={this.handleError}
                            >
                                <a>Login to comment</a>
                            </LoginButton>
                            }



                        </div>
                    )}
                </Status>



            </FacebookProvider>
        );
    }
}