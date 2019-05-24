import React, { Component } from 'react';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import {Button, Carousel} from "antd";
import 'antd/dist/antd.css';
import TextEditor from "./TextEditor";
import GraphicsGrid from "./GraphicsGrid";  // or 'antd/dist/antd.less'
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

    return (
        <Mutation mutation={ADD_CARDS} refetchQueries={[{query : refetch}]}>
            {(addTodo, { data }) => {

                let create = (params) => {
                   //e.preventDefault();

                    addTodo({variables : {"objects" : [params]}}).then(d=> {
                        scrollTo(cards.length);
                    });

                };

                return  <form >

                            <Carousel accessibility={false} swipe={true}>

                                <div style={{height : '400px', overflow : 'scroll'}}>

                                    {/*<p style={{fontSize : '100%'}} contentEditable={true}>I can be editted</p>*/}
                                    <TextEditor/>

                                    <Button onClick={() => create( {"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button> </div>

                                {/*  <div> <TextEditor/>  <Button onClick={create('Text', {"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button> </div>

                                <div><h1> Add an photo </h1> <Button onClick={create('Photo', {"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button></div>
*/}
                                <div><h1> Add an graphic </h1>

                                    <GraphicsGrid onClick={(filename) => create({"trip_id" : 1, "type" : "Graphic", "height" : "100vh", "camera":  {"test" :33}, "content":  {filename : filename}} )} graphics={graphics}/>

                                {/*<Button onClick={create('Graphic',{"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button></div>
*/}
                                <div><h1> ADd spacer gap</h1></div>
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