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
import SaveGPSButton from './components/SaveGPSButton'
import ClearGPSButton from './components/ClearGPSButton'
import Loading from './components/Loading'

//import Logo from '../public/svg/mountain.svg';

import 'antd/dist/antd.css';

import './App.css'

import {Button, Drawer} from 'antd';

import ApolloClient from "apollo-boost";

import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import HtmlCard from "./components/Cards/Html";
import ImageCard from "./components/Cards/Image";
import VideoCard from "./components/Cards/Video";
import SpacerCard from "./components/Cards/Spacer";
import ProductBreakdownCard from "./components/Cards/ProductBreakdown";
import ProfitCard from "./components/Cards/ProfitCard";

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
            pin
            id
            offset
            duration
            locations
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
    background : white;
 
  }
  
  .smallsection {
   
    font-size: 2.7em;
    color: white;
  }
  
  .sticky{
    
     z-index:99999;
     position: relative;
     width: 100%;
     height: 100%;
    
    
   
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

    state = {id : null};

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.progress !== prevProps.progress) {
            console.log(this.props.progress);
            this.props.updateP(this.props.progress);
        }


       // console.log(this.props.event);
      //  console.log(this.props.card.id, prevProps.card.id);
       // console.log(prevProps.progress, this.props.progress)

        //waht does this do
        /*if (  prevProps.event.type !==  'enter' && this.props.event.type ===  'enter' ) {
            //console.log('zero')
            this.props.updateTotalProgress(this.props.progress, this.props.card );
           // console.log(this.props.card);
        }*/

       /* /!*happens when a new card with progress 0 is hit*!/
        if (this.props.progress < prevProps.progress) {
            this.props.updateTotalProgress(this.props.progress);
        }*/


        // console.log(this.state.totalProgress);

       /* if (prevProps.card.id !== this.props.card.id) {
            console.log(this.props.card.id);
        }


        if (prevProps.event.state=== undefined && this.props.event.state === 'DURING') {


           // if (prevProps.card != this.props.card) {
                this.props.updateProgress(this.props.progress, this.props.card);
           // }
        }*/



    }

    render() {

        return  null;
    }
}

class App extends React.Component {

  state = {gpsRange: [], camera : null, prog : 0, currentCard : null, st : 0.1, totalProgress : 0.0, showButtons : false, card : null, index : 0, visible : false, showCards : true, locations : []}

  testTop = (index) => {

      window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
      })

      this.setState({visible : false});

  }

  componentDidMount() {
      this.debug = !!window.location.href.indexOf('localhost' > -1);
  }

    /*componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.card != this.state.card && this.state.card.locations.length ) {
            this.setState({locations : this.state.card.locations})
            alert(1);
        }

    }*/

    render() {

    //return  <img src={Logo} />
    return ( <StickyStyled>

        <div>



            <ApolloProvider client={client}>

                {this.state.showCards && <AddButton onClick={() => this.setState({visible : true})}/> }
                {!this.state.showCards && <SaveGPSButton card={this.state.currentCard} context={this.esriContext} camera={this.state.camera} finish={() => { this.setState({showCards: true})}  }/> }

                <Query
                    query={GET_TRIP} >

                {({ loading, error, data, refetch }) => {

                    if (loading) return <Loading/>;
                    if (error) return <p>Error :(</p>;

                    if (data.trip.length != 1) return <div>wtf</div>

                    const cards = data.trip[0].cards;

                   /* if (!this.state.currentCard) {
                        console.log('setting card');
                        this.setState({currentCard : cards[0]});
                    }*/

                    return <div >

                       {/* <pre style={{position : 'fixed'}}>{this.state.totalProgress / cards.length} </pre>*/}

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

                        <MapHolder registerContext={c=> this.esriContext = c} camera={this.state.camera} gpsRange={this.state.gpsRange} debug={this.debug} totalProgress={this.state.prog} showCards={this.state.showCards} updateCamera={(cam) => this.setState({camera : cam})} locations={data.trip[0].locations} scrollToTop={this.testTop} zoom={this.state.st} currentCard={this.state.currentCard}/>

                        <div >


                         <Controller ref={(c) => this.c = c}>

                            {/* <Scene  duration={'150%'} pin={false} >
                                 <div  className="sticky"><div>Pin Test</div></div>
                             </Scene>

                             <Scene offset='250' duration={'400%'} pin={true} >
                                 <div  className="sticky"><div>

                                     <video ref={this.ref} style={{height : '100vw', width : 'auto'}}  controls id="VideoId">
                                         <source src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" type="video/mp4"/>
                                     </video>

                                 </div></div>
                             </Scene>*/}

                             {true && cards && cards.map((card, index) =>

                                    <Scene ref={card.id} key={card.id} offset={card.offset} duration={card.duration} pin={card.pin} enabled={true}  >
                                        {(cardprogress, event) => {

                                            //console.log(progresss);


                                            return (
                                            <div id={`theid${index}`} className="sticky" style={{height: card.duration.replace('%', 'vh'),  pointerEvents : (this.state.showCards ? 'all' : 'none'), 'opacity' : this.state.showCards ? 1 : 0.1, 'transition': 'opacity .55s ease-in-out' }}  >

                                                <STWatcher updateP={() => this.setState({prog : cardprogress})} updateTotalProgress={(deltaprogress, card) => this.setState({currentCard : card})} progress={cardprogress} card={card} event={event} />

                                               { card.type === 'Html' && <div className="smallsection" style={{height : card.duration.replace('%', 'vh')}}>
                                                  {/* {JSON.stringify(this.state.gpsRange)}*/}
                                                    {cardprogress}
                                                    <HtmlCard context={this.esriContext} updateCamera={(camera) => { this.setState({camera : camera})} } setGPSRange={(r) => this.setState({gpsRange : r})} debug={this.debug} clear={<ClearGPSButton finish={()=> { refetch() } } card={card}/>} cardprogress={cardprogress} currentCard={this.state.currentCard} card={card} event={event} hideCards={() => this.setState({showCards : false})} setCard={(card) => { this.setState({card})}} > ️ </HtmlCard>
                                                </div>}

                                                { card.type === 'Video' && <div className="smallsection" >
                                                    {cardprogress}
                                                    <VideoCard context={this.esriContext} debug={this.debug} clear={<ClearGPSButton finish={()=> { refetch() } } card={card}/>} cardprogress={this.state.prog} currentCard={this.state.currentCard} card={card} event={event} hideCards={() => this.setState({showCards : false})} setCard={(card) => { this.setState({card})}} > ️ </VideoCard>
                                                </div>}

                                                { card.type === 'Image' && <div className="smallsection" >
                                                   {cardprogress}
                                                    <ImageCard context={this.esriContext} updateCamera={(camera) => { this.setState({camera : camera})} } progress={cardprogress} debug={this.debug} clear={<ClearGPSButton finish={refetch} card={card}/>} card={card} event={event} hideCards={() => this.setState({showCards : false})} setCard={(card) => { this.setState({card})}} />
                                                </div>}

                                                { card.type === 'Graphic' && <div className="smallsection" style={{width : '100%'}}>

                                                    <ReactSVG
                                                        beforeInjection={svg => {
                                                            svg.setAttribute('style', 'width: 100%;');
                                                        }}
                                                        wrapper="span" src={`./svg/${card.content.filename}`}/>

                                                </div>}

                                                { card.type === 'Spacer' && <div className="smallsection" >
                                                    <SpacerCard debug={this.debug} clear={<ClearGPSButton finish={refetch} card={card}/>} hideCards={() => this.setState({showCards : false})} card={card} event={event} setCard={(card) => { this.setState({card})}} />
                                                 </div>}


                                            </div>
                                        )}}

                                    </Scene>

                                )}

                        </Controller>
                        </div>

                    </div>


                }}

            </Query></ApolloProvider>


        </div>

    </StickyStyled>)


  }
}


export default App;