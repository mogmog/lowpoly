import React, {Fragment} from 'react'
import {Button, Slider} from 'antd';

import './index.css'

class CardWrapper extends React.Component {

    state = {
        heights : ['20vw', '50vw', '100vw', '100vh', '100vw', '130vh', '150vh', '200vh', '400vh', '800vh'],
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
        if (prevState.index && this.state.index != prevState.index) {
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
            <div className={'CardWrapper'} style={{  transition:'all 0.3s ease', height : '100%', width: '100%', backgroundColor: this.props.index % 2 ===0 ? 'transparent' : 'rgba(0,0,0,0.1)'}} >

                <div id="container" style={{height : this.props.card.duration}}>

                   {/* <pre> CC{JSON.stringify(this.props.cardprogress)} {this.state.height} </pre>*/}



                    <div id="navb" >


                        {this.props.children}

                    </div>
                    {this.props.debug && <Fragment>



                      {/*  <div id="nava" style={{zoom : 1.2}}>
                            <Button onClick={ this.changeHeightIndex } type="primary" shape="circle" icon="vertical-align-middle" />
                        </div>*/}

                        <div id="navc" style={{zoom : 1}}>
                            {this.props.card.id}
                            <Button type={this.props.card.camera ? "primary" : ""} onClick={ () => this.props.hideCards(this.props.card) } shape="circle" icon="flag" />
                        </div>

                    </Fragment>}



                </div>
            </div>
        )


    }

}

export default CardWrapper