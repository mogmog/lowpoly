import React, {Fragment} from 'react';

import App   from './App'
import Upload   from './Upload'

import {Route, BrowserRouter, Redirect, Router} from 'react-router-dom';

export default class extends React.Component {

  constructor(props) {
    super(props);

    this.state = {


    }

  }

  componentDidMount() {



  }

  componentWillUnmount() {

  }

  render () {

    const { authState, form, user, isAdmin } = this.state;
    const {  history } = this.props;


    //if (this.state.loading) return <Loading/>;

    if (true)   return (
        <Router history={history}>

            <Fragment>
                        <Route path="/comealive" render={()=><App debug={true} />}  />
                        <Route path="/upload"    render={()=><Upload />}  />
                        <Route exact path="/"    render={() => (<App debug={false}/>)} />

            </Fragment>
        </Router>
    )


  }
}