import React, { Component, useState } from 'react';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import {Button, Carousel, Modal} from "antd";
import 'antd/dist/antd.css';
import './index.css'
import TextEditor from "./TextEditor";
import {Image} from 'cloudinary-react';
import GraphicsGrid from "./GraphicsGrid";  // or 'antd/dist/antd.less'
import ImageUpload from './../ImageUpload'
import ImageCard from './../Cards/Image'

const ADD_CARDS = gql`
    mutation insert_cards($objects: [cards_insert_input!]!) {
        insert_cards(objects: $objects) {
            returning {
                id
                camera
                content
            }
        }
    }
`;

const AddCard = ({cards, graphics, refetch, scrollTo}) => {

    const [newCard, setCard] = useState(null);

    return (
        <Mutation mutation={ADD_CARDS} refetchQueries={[{query : refetch}]}>
            {(addCard, { data }) => {

                let create = (card) => {
                   //e.preventDefault();

                    const spacer = {"trip_id" : 1, "type" : "Spacer", "offset" : "0px", "height" : "1000px", "camera":  null, "content":  {}}
                    const cards = [card]

                    addCard({variables : {"objects" : cards}}).then(d=> {
                       scrollTo(cards.length);
                        //setCard(d.data.insert_cards.returning[0]);
                        alert('done')
                    });

                };

                return  <form >

                            <Carousel accessibility={false} swipe={true}>

                                <div style={{height : '400px', overflow : 'scroll'}}>
                                    <TextEditor create={create}/>
                                </div>

                                <div><h1> Add an graphic </h1>

                                    <GraphicsGrid onClick={(filename) => create({"trip_id" : 1, "type" : "Graphic", "offset" : "0%", "duration" : "1000px", "camera":  null, "content":  {filename : filename}} )} graphics={graphics}/>

                                {/*<Button onClick={create('Graphic',{"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button></div>
*/}
                                </div>
                                <div>
                                    <ImageUpload saveImage={(image) => create( {"trip_id" : 1, "type" : "Image", "offset" : "0%", "duration" : "1000px", "camera":  null, "content":  {"image" :image}})} style={{width : '70%', height : '100px', marginBottom : '10px'}}/>

                                </div>


                            </Carousel>

                            {/*<ul style={{paddingLeft : '0px', paddingTop : '100px'}}>
                                <li> <Button onClick={create} style={{width : '100%', height : '100px', marginBottom : '10px'}}>Text</Button></li>
                                <li> <Button onClick={create} style={{width : '100%', height : '100px', marginBottom : '10px'}}>Image</Button></li>
                                <li> <Button onClick={create} style={{width : '100%', height : '100px', marginBottom : '10px'}}>Route</Button></li>
                            </ul>*/}

                        </form>
            }}
        </Mutation>
    );
};

export default AddCard;