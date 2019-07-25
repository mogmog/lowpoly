import React, {Fragment} from 'react'
import {Button} from 'antd';

import './index.css'

class CardWrapper extends React.Component {

    state = {
        heights : ['20vw', '50vw', '100vw', '100vh', '100vw', '130vh', '150vh', '200vh'],
        index : 0,
        height : '50vw'
    }

    componentDidMount() {
        const height = this.state.heights.find(d=> d === this.props.card.height);

        if (height) {
            this.setState({height : height})
            this.setState({index : this.state.heights.indexOf(this.props.card.height)})
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.index != prevState.index) {
            const newHeight = this.state.heights[this.state.index];
            this.setState({height : newHeight})
            this.props.update({variables : {"id" : this.props.card.id, "content" : this.props.card.content, "height" :  this.state.heights[this.state.index] }});
        }
    }

    changeHeightIndex = () => {
        this.setState({index : (this.state.index + 1) % this.state.heights.length})
    }

    render() {

        return (
            <div className={'CardWrapper'} style={{  transition:'all 0.3s ease', width: '100%', background: 'transparent', height : this.state.height}} >
                <div id="container">

                    <div id="navb" >

                        {this.props.children}

                    </div>

                    <div id="nava" style={{zoom : 1.2}}>
                        <Button onClick={ this.changeHeightIndex } type="primary" shape="circle" icon="vertical-align-middle" />
                    </div>

                    <div id="navc" style={{zoom : 1.2}}>
                        <Button onClick={ this.props.hideCards } shape="circle" icon="flag" />
                    </div>

                </div>
            </div>
        )


    }

}

export default CardWrapper