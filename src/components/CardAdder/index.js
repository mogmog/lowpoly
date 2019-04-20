import React, { Component, Fragment } from 'react';
import {Drawer, Button} from 'antd';

import 'antd/dist/antd.css';
import './index.css';

const options = {
    url: 'https://js.arcgis.com/4.9',
};

export default class extends Component {

    state = {zoom : 0};

    constructor() {
        super();
    }

    render() {

        return <Drawer
            title="Basic Drawer"
            placement={'bottom'}
            height={'50vh'}
            closable={false}
            visible={this.props.visible}
        >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <Button>Add text</Button>
            <Button>Add map line</Button>
            <Button>Add photo</Button>
            <Button>Add final route</Button>
            <p>Some contents...</p>
        </Drawer>

    }
}
