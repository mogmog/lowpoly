import React, {Fragment} from 'react'
import ReactDOM from 'react-dom'
import { Parallax,  ParallaxLayer } from 'react-spring/renderprops-addons'
import MapHolder from "./components/Map/MapHolder";
import CardAdder from "./components/CardAdder";
import ReactSVG from 'react-svg';
import {Slider } from 'antd';
import styled from 'styled-components';
import { Controller, Scene } from 'react-scrollmagic';
import { useSwipeable, Swipeable } from 'react-swipeable';

import AddButton from './components/AddButton'
import SaveGPSButton from './components/SaveGPSButton'
import ClearGPSButton from './components/ClearGPSButton'
import Loading from './components/Loading'

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

const client = new ApolloClient({
    uri: "https://graphqlmogmogplatts.herokuapp.com/v1alpha1/graphql"
});

const GET_TRIP = gql`query {

    graphics {
        filename
    }
    
    trip(where: {id: {_eq: 1}}) {
        id
        tile_server
        locations(order_by: {date: asc}) {
            id
            latitude
            longitude
            date

        }

        cards(order_by: {id : asc}) {
            camera
            type
            content
            speedFactor
            pin
            id
            offset
            duration
            location_offset
            altitude_adjust
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
         //   console.log(this.props.progress);
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

  state = {screenshots : {}, swiped : false, newProgress : 0, locationsWithAltitude : [], theposition : 0, speed : 0, gpsRange: null, camera : null, prog : 0, currentCard : null, st : 0.1, totalProgress : 0.0, showButtons : false, card : null, index : 0, visible : false, showCards : true, locations : []}

  testTop = (index) => {

      window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
      })

      this.setState({visible : false});

  }

    componentDidMount() {
      console.log(this.props.debug);
        this.debug = this.props.debug;//!!window.location.href.indexOf('localhost' > -1);
    }

  /*componentDidMount() {
      this.debug = true;//!!window.location.href.indexOf('localhost' > -1);



      window.addEventListener('scroll', this.listenToScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

    listenToScroll = () => {
        const winScroll =
            document.body.scrollTop || document.documentElement.scrollTop

        const height =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight



        if (this.state.card) {

            const scrolled = winScroll  / height

            let difference =   scrolled - this.state.theposition;

            //difference = difference * this.state.card.speedFactor;

            //console.log(this.state.card.speedFactor, difference);
           // if (this.card.speedFactor)
            this.setState({
                theposition:  this.state.theposition + difference
            });

        }

    }*/

    /*componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.card != this.state.card && this.state.card.locations.length ) {
            this.setState({locations : this.state.card.locations})
            alert(1);
        }

    }*/

    moveGPSSlider = (range) => {

        let card = {...this.state.card}
        card.location_offset = range;
        this.setState({card})

        //this.setState({gpsRange : range});
    }

    setScreenshot= (id, screenshot) => {
        const { screenshots } = this.state;
        screenshots[id] = screenshot;

        console.log(this.state.screenshots);

        // update state
        this.setState({
            screenshots,
        });
    }

    render() {

   // console.log(this.state.extent);

    //return  <img src={Logo} />
    return ( <StickyStyled>

        <div>
                     <div >

                        <ApolloProvider client={client}>


                            <Query
                                query={GET_TRIP} >

                                {({ loading, error, data, refetch }) => {

                                    if (loading) return <Loading/>;
                                    if (error) return <p>Error :(</p>;

                                    if (data.trip.length != 1) return <div>wtf</div>

                                    const cards = data.trip[0].cards;

                                    if (!this.transformed) {

                                        this.transformed = true;

                                        cards.forEach(card => {
                                            if (card.location_offset.length > 0) {

                                                let copy = data.trip[0].locations.slice();
                                                card.locations = copy.splice(card.location_offset[0], card.location_offset[1] - card.location_offset[0]);
                                                //debugger;
                                                //console.log(data.trip[0].locations.slice(card.location_offset[0], card.location_offset[1] - card.location_offset[0]));

                                            } else {
                                                card.locations = [];
                                            }

                                            console.log(card);
                                        });
                                    }

                                    //

                                     if (cards.length && !this.state.card) {
                                        this.setState({card : cards[0]});

                                         //cards.push({id : 'spacerCardInsert', type : 'Spacer', duration : '2000px', location_offset : [], locations : []});

                                     }

                                     if (!this.state.gpsRange) {
                                         this.setState({gpsRange : [0, data.trip[0].locations.length]})
                                     }
                                    //return  <MapHolder registerContext={c=> this.esriContext = c} camera={this.state.camera} gpsRange={this.state.gpsRange} debug={this.debug} totalProgress={0.3} showCards={this.state.showCards} updateCamera={(cam) => this.setState({camera : cam})} locations={data.trip[0].locations} scrollToTop={this.testTop} zoom={this.state.st} card={this.state.card}/>

                                    return <div >

                                        {this.debug && this.state.showCards && <AddButton  card={this.state.card} onClick={() => this.setState({visible : true})}/> }
                                        {this.debug && !this.state.showCards && <SaveGPSButton gpsRange={this.state.card.location_offset} card={this.state.card} context={this.esriContext} locationsWithAltitude={this.state.locationsWithAltitude} locations={data.trip[0].locations} extent={this.state.extent} camera={this.state.camera} finish={() => { this.setState({showCards: true})}  }/> }


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

                                            {this.debug && <CardAdder cards={cards} scrollTo={this.testTop} refetch={GET_TRIP} graphics={data.graphics} visible={true}/>}

                                        </Drawer>

                                        { false && this.debug &&
                                            <div   style = {{position:'fixed', top:'40px', left: '00px', zIndex : 999999, width:'100%'}}>
                                                {this.state.gpsRange  &&  this.state.card && <Slider value={this.state.card.location_offset } onChange={(r) => this.moveGPSSlider(r)} range step={1} min={0} max={data.trip[0].locations.length} disabled={false} /> }
                                            </div>
                                        }



                                        <MapHolder screenshots={this.state.screenshots} setScreenshot={this.setScreenshot} setLocationsWithAltitude={(l) => {this.setState({locationsWithAltitude : l})}} tile_server={data.trip[0].tile_server} alllocations={data.trip[0].locations} cards={cards} registerContext={c=> this.esriContext = c} Xcamera={this.state.camera} gpsRange={(this.state.card && this.state.card.location_offset.length) ? this.state.card.location_offset : [0, data.trip[0].locations.length]} debug={this.debug} totalProgress={this.state.newProgress} showCards={this.state.showCards} updateCamera={(cam, extent) => this.setState({camera : cam, extent})} locations={(this.state.card ? this.state.card.locations : [])} scrollToTop={this.testTop} zoom={this.state.st} card={this.state.card}/>

                                        {false && this.state.card && this.state.screenshots[this.state.card.id] && <div style={{zIndex : 9999999999999, position: 'fixed', width : '100%', height : 'auto', top : 0, left : 0}}><img src={this.state.screenshots[this.state.card.id].dataUrl} /></div>}

                                        <div >



                                                <div>




                                            <Controller ref={(c) => {this.c = c; }} >


                                                {true && cards && cards.map((card, index) =>

                                                        <Scene ref={card.id} key={card.id}  duration={card.duration + 'px'} offset={card.duration * -0.15} pin={card.pin} >
                                                            {(cardprogresss, event) => {

                                                                //this.setState({cardppp : cardprogress})
//this.p = cardprogress;

                                                                return (
                                                                    <div id={`theid${index}`} className="sticky" style={{ pointerEvents : (this.state.showCards ? 'all' : 'none'), 'opacity' : this.state.showCards ? 1 : 0.1, 'transition': 'opacity .55s ease-in-out' }}  >


                                                                        {/* <STWatcher updateP={(p) => this.setState({prog : p})} updateTotalProgress={(deltaprogress, card) => this.setState({currentCard : card, deltaprogress})} progress={cardprogresss} card={card} event={event} />*/}

                                                                        { card.type === 'Html' && <div className="smallsection" >

                                                                            <HtmlCard setSpeed={(speed) => this.setState({speed})}
                                                                                      context={this.esriContext}
                                                                                      updateCamera={(camera) => { this.setState({camera : camera})} }
                                                                                      index={index}
                                                                                      debug={this.debug}
                                                                                      clear={<ClearGPSButton finish={()=> { refetch() } } card={card}/>}
                                                                                      cardprogresss={cardprogresss}
                                                                                      updateProgress={(p) => this.setState({newProgress : p})}
                                                                                      currentCard={this.state.card}
                                                                                      card={card}
                                                                                      event={event}
                                                                                      hideCards={(card) => this.setState({card : card, showCards : false})}
                                                                                      setCard={(card) => {  this.setState({card : card})}} > ️ </HtmlCard>
                                                                        </div>}

                                                                        { card.type === 'Video' && <div className="smallsection" style={{height : card.duration}}>

                                                                            <VideoCard context={this.esriContext} debug={this.debug} clear={<ClearGPSButton finish={()=> { refetch() } } card={card}/>} cardprogress={this.state.prog} currentCard={this.state.currentCard} card={card} event={event} hideCards={() => this.setState({showCards : false})} setCard={(card) => { this.setState({card})}} > ️ </VideoCard>
                                                                        </div>}

                                                                        { card.type === 'Image' && <div className="smallsection" style={{height : card.duration}}>

                                                                            <ImageCard
                                                                                context={this.esriContext}
                                                                                updateCamera={(camera) => { this.setState({camera : camera})} }
                                                                                cardprogresss={cardprogresss}
                                                                                updateProgress={(p) => this.setState({newProgress : p})}
                                                                                debug={this.debug}
                                                                                index={index}
                                                                                clear={<ClearGPSButton finish={refetch} card={card}/>}
                                                                                card={card}
                                                                                event={event}
                                                                                currentCard={this.state.card}
                                                                                hideCards={() => this.setState({showCards : false})}
                                                                                setCard={(card) => { this.setState({card})}} />
                                                                        </div>}

                                                                        { card.type === 'Graphic' && <div className="smallsection" style={{width : '100%', textAlign : 'center'}}>

                                                                            <ReactSVG
                                                                                beforeInjection={svg => {
                                                                                    svg.setAttribute('style', 'width: 50%;');
                                                                                }}
                                                                                wrapper="span" src={`./svg/${card.content.filename}`}/>

                                                                        </div>}

                                                                        { card.type === 'Spacer' && <div className="smallsection" >
                                                                            <SpacerCard
                                                                                index={index}
                                                                                updateCamera={(camera) => { this.setState({camera : camera})} }
                                                                                debug={this.debug}
                                                                                clear={<ClearGPSButton finish={refetch} card={card}/>}
                                                                                hideCards={() => this.setState({showCards : false})}
                                                                                card={card}
                                                                                currentCard={this.state.card}
                                                                                event={event}
                                                                                setCard={(card) => {  this.setState({card : card})}} />
                                                                        </div>}


                                                                    </div>
                                                                )}}

                                                        </Scene>

                                                )}


                                            </Controller>

                                                </div>
                                        </div>

                                    </div>


                                }}

                            </Query></ApolloProvider>

                    </div>

        </div>

    </StickyStyled>)


  }
}


export default App;