import React from 'react'
import ReactDOM from 'react-dom'
import { Parallax,  ParallaxLayer } from 'react-spring/renderprops-addons'
import MapHolder from "./components/Map/MapHolder";

import styled from 'styled-components';
import { Controller, Scene } from 'react-scrollmagic';
import { Tween, Timeline } from 'react-gsap';
import './App.css'

import ApolloClient from "apollo-boost";

import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
    uri: "https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
});

//"https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
const StickyStyled = styled.div`
  
   
  
  .section {
    height: 100vh;
    background: rgb(2,0,36);
background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(21,114,133,1) 100%);
  }
  
  
  .smallsection {
    
    
    height: 35vh;
    font-size: 5em;
    position: relative;
    color: white;
    background: rgba(27, 29, 35, 0.6);
    z-index: 99999999999999;
    opacity: 0.8;
   
    
  
   opacity: 0.8;
  
  }
  
  .sticky, .sticky2 {
    text-align:center;
     height: 100vh;
     z-index:99999;
     position: relative;
    width: 100%;
     height: 100vh;
    & .animation {
      width: 100vw;
      height: 100vh;
      
      
    }
    .heading {
      position: absolute;
      height: 100%;
      width: 100%;
      h2 {
        font-size: 40px;
        position: absolute;
        bottom: 10%;
        left: 10%;
        margin: 0;
      }
    }


  
  overflow: hidden;
  .panel {
    text-align: center;
  }
  
  .panel span {
    position: relative;
    display: block;
    overflow: visible;
    font-size: 80px;
  }
  
  .panel.blue {
    background-color: #3883d8;
  }
  
  .panel.turqoise {
    background-color: #38ced711;
  }
  
  .panel.green {
    background-color: #22d65911;
    
  }
  
  .panel.bordeaux {
    background-color: #95354311;
  }



`;





class STWatcher extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.progress != this.props.progress) {
            this.props.update(this.props.progress);
        }
    }

    render() {

        return  null;
    }
}

class App extends React.Component {

  state = {st : 0.1}



    test = () => {
        window.scroll({top: 1500, left: 0, behavior: 'smooth' })

  }

  render() {

     //console.log(this.state.st);



    //return <MapHolder zoom={this.state.st/1000}/>;

    return ( <StickyStyled>



        <div>


            <ApolloProvider client={client}><Query
                query={gql`query {
                                  trip {

                                    id
                                    name

                                    trip_cards {
                                      card {
                                        camera
                                        content
                                        id
                                        offset
                                        duration
                                        height
                                      }
                                    }

                                  }
                                }`}
                                            >
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>;
                    if (error) return <p>Error :(</p>;

                    if (data.trip.length != 1) return <div>wtf</div>

                    const trip = data.trip[0];

                    return <div >


                        <Controller ref={(c) => this.c = c}>

                            <MapHolder zoom={this.state.st}/>

                                {trip.trip_cards.map(({card}) =>

                                    <Scene key={card.id} duration={card.duration} pin={false} offset={card.offset} >
                                        {(progresss, event) => (
                                            <div className="sticky" style={{height: card.height}}>
                                                <STWatcher update={(st) => this.setState({st})} progress={progresss}/>

                                                {card.content.text && <div className="smallsection" > {card.content.text}️</div>}

                                            </div>
                                        )}

                                    </Scene>

                                )}

                        </Controller>
                    </div>


                }}

            </Query></ApolloProvider>

         {/*   <Controller ref={(c) => this.c = c}>

                <MapHolder zoom={this.state.st}/>


                <Scene duration={'400%'} pin={false} offset={'-50%'} >
                    {(progresss, event) => (
                        <div className="sticky" style={{height: '100vh'}}>
                            <STWatcher update={(st) => this.setState({st})} progress={progresss}/>
                        </div>
                    )}

                </Scene>







                <Scene duration={'100%'} pin={false} offset={'-150%'} >
                    {(progresss, event) => (
                        <div className="sticky">



                            <div className="smallsection" > Paul and Graham are off to Armenia  🚵‍♂ ️🚵‍♂️ 🚵‍♂ ️🚵‍♂ ️🚵‍♂ ️🚵‍♂️</div>

                        </div>
                    )}

                </Scene>







                <Scene duration={'100%'} pin={false} offset={0} >
                    {(progresss, event) => (
                        <div className="sticky">



                            <div className={'animation'}>
                                <img src="https://placeimg.com/1000/1000/any" alt="" />
                            </div>

                        </div>
                    )}

                </Scene>


                <div className="smallsection" > ther ewould be content here </div>

                <Scene duration={'100%'} pin={false} offset={0} >
                    {(progresss, event) => (
                        <div className="sticky">



                            <div className={'animation'}>
                                <img src="https://placeimg.com/1000/1000/any" alt="" />
                            </div>

                        </div>
                    )}

                </Scene>



            </Controller>*/}
        </div>
        <div className="section" />
    </StickyStyled>)


  }
}


export default App;