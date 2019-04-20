import React from 'react'
import ReactDOM from 'react-dom'
import { Parallax,  ParallaxLayer } from 'react-spring/renderprops-addons'
import MapHolder from "./components/Map/MapHolder";
import CardAdder from "./components/CardAdder";

import styled from 'styled-components';
import { Controller, Scene } from 'react-scrollmagic';
import { TweenMax } from 'gsap/all';

import './App.css'

import ApolloClient from "apollo-boost";

import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
    uri: "https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
});


const ADD_LOCATION = gql`
    mutation insert_locations($objects: [locations_insert_input!]! ) {
        insert_locations(objects: $objects) {
            returning {
                id
                longitude
                longitude
                altitude
                date

            }
        }
    }`;

const  params = {
    "objects": [
        {

            "longitude": 34.345,
            "latitude": 23.23,
            "altitude": 3.45,
            "date" : "2019-03-12 01:45:00Z",
            "trip_id" : 1
        }
    ]
};

// console.log(client);
// client.mutate({mutation : ADD_LOCATION}, params);

client.mutate({
    variables: params,
    mutation: ADD_LOCATION,

})


//"https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
const StickyStyled = styled.div`
  
   
  
  .section {
    height: 100vh;
    background: rgb(2,0,36);
background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(21,114,133,1) 100%);
  }
  
  
  .smallsection {
    
    
    height: 100vh;
    font-size: 5em;
    position: relative;
    color: white;
    opacity: 0.8;
  
  }
  
  .sticky, .sticky2 {
    text-align:center;
     height: 100vh;
     z-index:99999;
     position: relative;
    width: 100%;
    
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

  state = {st : 0.1, showButtons : false, card : null}

    testTop = () => {

      (this.c.state.controller.scrollTo(d=> {
          TweenMax.to(window, 0.5, {scrollTo : {y : 0}})
      }));

        (this.c.state.controller.scrollTo(1));

    }

    test = () => {


      (this.c.state.controller.scrollTo(d=> {
          TweenMax.to(window, 0.5, {scrollTo : {y : 500}})
      }));

        (this.c.state.controller.scrollTo(1));

  }

  render() {

    return ( <StickyStyled>


        <a onClick={this.test}> test </a>

        <div>


            <ApolloProvider client={client}><Query
                query={gql`query {
                                  trip {

                                    id
                                    name

                                    trip_cards(order_by: {card_id: asc}) {
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


                    const cards = data.trip[0].trip_cards;

                   // return  <MapHolder zoom={this.state.st}/>

                    return <div >
                        <CardAdder visible={this.state.showButtons}/>

                        <Controller ref={(c) => this.c = c}>

                            <pre style={{position : 'fixed', top : 0, left : 0}}> {this.state.card && this.state.card.id} </pre>

                             <MapHolder scrollToTop={this.testTop} zoom={this.state.st} card={this.state.card}/>
                                {cards && cards.map(({card}) =>

                                    <Scene ref={card.id} key={card.id} duration={card.duration} pin={card.content.pin} offset={card.offset} >
                                        {(progresss, event) => (
                                            <div className="sticky" style={{height: card.height}}>

                                                <STWatcher update={(st) => this.setState({card, st})} progress={progresss}/>

                                                <a onClick={this.testTop}> testTop </a>

                                                {card.content.pin && <pre> {JSON.stringify(event)} </pre>}
                                                { <div className="smallsection" >

                                                    {card.content.images && card.content.images.map((d, i)=> <img key={i} style={{'width' : '100%'}} src={d.url} /> ) }

                                                    <span> { card.content.text}️ </span>
                                                  {/*  <button onClick={() => this.setState({showButtons : true})}> + </button>*/}
                                                </div>}




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