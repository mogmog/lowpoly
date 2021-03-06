import React from 'react'
import ReactDOM from 'react-dom'
import { Parallax,  ParallaxLayer } from 'react-spring/renderprops-addons'
import MapHolder from "./components/Map/MapHolder";
import CardAdder from "./components/CardAdder";
import ReactSVG from 'react-svg';

import styled from 'styled-components';
import { Controller, Scene } from 'react-scrollmagic';
import { TweenMax } from 'gsap/all';

import AddButton from './components/AddButton'

//import Logo from '../public/svg/mountain.svg';

import 'antd/dist/antd.css';

import './App.css'

import {Button, Drawer} from 'antd';

import ApolloClient from "apollo-boost";

import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
    uri: "https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
});

const GET_TRIP = gql`query {

    graphics {
        filename
    }
    
    trip(where: {id: {_eq: 1}}) {
        id
        locations(order_by: {date: desc}) {
            latitude
            longitude
            date

        }

        cards(order_by: {id : asc}) {
            camera
            type
            content
            id
            offset
            duration
            height
        }
    }

}

`;

/*const ADD_LOCATION = gql`
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
};*/

// console.log(client);
// client.mutate({mutation : ADD_LOCATION}, params);

/*client.mutate({
    variables: params,
    mutation: ADD_LOCATION,

})*/


//"https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
const StickyStyled = styled.div`
  
  .section {
    height: 100vh;
    background: rgb(2,0,36);
background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(21,114,133,1) 100%);
  }
  
  
  .smallsection {
    
    
   
    font-size: 5em;
    position: relative;
    color: white;
    opacity: 1;
  
  }
  
  .sticky, .sticky2 {
    text-align:center;
    
     z-index:99999;
     position: relative;
    width: 100%;
    
   
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

  state = {st : 0.1, showButtons : false, card : null, index : 0, visible : false}

    testTop = (index) => {

        //var start = scene.scrollOffset();
        //var end = scene.scrollOffset() + scene.duration();

        window.scrollTo({
            top: window.scrollY - ( 1* window.innerHeight),
            behavior: 'smooth',
        })

       // console.log(this.c);
     /* (this.c.state.controller.scrollTo(d=> {
          TweenMax.to(window, 2.5, {scrollTo : 5702 })
      }));*/

        //(this.c.state.controller.scrollTo('#theid' + index -1));

    }



  render() {

    //return  <img src={Logo} />
    return ( <StickyStyled>


        <AddButton onClick={() => this.setState({visible : true})}/>

       {/* <a onClick={this.testTop}> {this.state.index } </a>*/}

        <div>


            <ApolloProvider client={client}><Query
                query={GET_TRIP}
                                            >
                {({ loading, error, data }) => {
                    if (loading) return <p>Loading...</p>;
                    if (error) return <p>Error :(</p>;

                    if (data.trip.length != 1) return <div>wtf</div>

                    const cards = data.trip[0].cards;

                    console.log(cards);
                    //return  <MapHolder zoom={this.state.st} locations={data.trip[0].locations}/>

                   // return <div> {JSON.stringify(cards)} </div>
                    return <div >

                        <Drawer
                            title="Add"
                            placement={'top'}
                            closable={true}
                            height = '90vh'
                            style={{zIndex : 99999999}}
                            onClose={() => this.setState({visible : false})}
                            visible={this.state.visible}
                        >

                            <CardAdder cards={cards} scrollTo={this.testTop} refetch={GET_TRIP} graphics={data.graphics} visible={true}/>

                        </Drawer>

                        <Controller ref={(c) => this.c = c}>

                             <MapHolder locations={data.trip[0].locations} scrollToTop={this.testTop} zoom={this.state.st} card={this.state.card}/>

                             {cards && cards.map((card, index) =>

                                    <Scene ref={card.id} key={card.id} duration={card.duration || '100%'} pin={card.content.pin} offset={card.offset || 0} >
                                        {(progresss, event) => (
                                            <div id={`theid${index}`} className="sticky" style={{height: '100vh'}}>

                                                <STWatcher update={(st) => this.setState({card, st, index})} progress={progresss}/>

                                                { card.type === 'Text' && <div className="smallsection" >
                                                    <span> { card.content.text}️ </span>
                                                </div>}

                                                { card.type === 'Image' && <div className="smallsection" >
                                                    {card.content.images && card.content.images.map((d, i)=> <img key={i} style={{'width' : '100%', height: 'auto'}} src={d.url} /> ) }
                                                </div>}


                                                { card.type === 'Graphic' && <div className="smallsection" style={{width : '100%'}}>

                                                    <ReactSVG
                                                        beforeInjection={svg => {
                                                            svg.setAttribute('style', 'width: 100%;');
                                                        }}
                                                        wrapper="span" src={`./svg/${card.content.filename}`}/>

                                                </div>}

                                            </div>
                                        )}

                                    </Scene>

                                )}



                           {/* <Scene key={'new'}  duration={'100%'} height={'200px'}   >

                                <h1 block type='primary' onClick={()=> this.setState({visible : true})}>Add</h1>
                            </Scene>*/}

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