import React from 'react'

import 'antd/dist/antd.css';

import {Upload, Icon, message} from 'antd';

import ApolloClient from "apollo-boost";

import gql from "graphql-tag";

import gpxparser from './lib/gpx-parse'
import {ApolloProvider, Mutation} from "react-apollo";

const client = new ApolloClient({
    uri: "https://beatroute2019.herokuapp.com/v1/graphql"
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



class Avatar extends React.Component {
    state = {
        loading: false,
    };



    render() {
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const {imageUrl} = this.state;
        return (


            <ApolloProvider client={client}>
            <Mutation mutation={ADD_LOCATION}>
                {(addLocations, {data}) => {

                    let create = (locations) => {

                        addLocations({variables: {"objects": locations}}).then(d => {
                            alert(1)
                        });

                    };

                    return <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}


                        action={(file) => {

                            var reader = new FileReader();
                            reader.onload = function(event) {

                                var gpx = new gpxparser(); //Create gpxParser Object
                                gpx.parse(event.target.result); //

                                let date = gpx.metadata.time;

                                const objects = [];

                                gpx.tracks.forEach(track => {
                                    track.points.forEach((point, i) => {
                                        //console.log(point);
                                        //console.log(track);
                                        if (i % 3 === 0) objects.push({latitude : point.lat, longitude : point.lon, altitude : point.ele, trip_id : 1, date : point.time});
                                    })

                                   // console.log(objects);
                                })

                                create(objects);


                            };
                            reader.readAsText(file);


                        }}

                    >
                        {uploadButton}
                    </Upload>
                }}
            </Mutation>
            </ApolloProvider>
        )
    }

}


export default Avatar;