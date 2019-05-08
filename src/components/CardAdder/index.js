import React, { Component } from 'react';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import {Button, Carousel} from "antd";
import 'antd/dist/antd.css';
import TextEditor from "./TextEditor";  // or 'antd/dist/antd.less'
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

const AddCard = () => {

    return (
        <Mutation mutation={ADD_CARDS}>
            {(addTodo, { data }) => {

                let create = e => (type, params) => {
                    e.preventDefault();
                    addTodo(params);
                };

                return  <form style={{'transform' : 'translateY(100%)'}}>

                            <Carousel accessibility={false} swipe={true}>
                                <div> <TextEditor/>  <Button onClick={create('Text', {"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button> </div>

                                <div><h1> Add an photo </h1> <Button onClick={create('Photo', {"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button></div>

                                <div><h1> Add an graphic </h1> <Button onClick={create('Graphic',{"objects" : [{"trip_id" : 1, "type" : "Text", "height" : "100vh", "camera":  {"test" :33}, "content":  {"text" :"this is plain text"}}]})} style={{width : '70%', height : '100px', marginBottom : '10px'}}>Add</Button></div>

                                <div><h1> ADd spacer gap</h1></div>

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