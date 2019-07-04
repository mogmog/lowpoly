import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import Spinner from 'react-spinkit';

class App extends Component {
    constructor() {
        super();
        this.state = {
            images: [],
            selectedFile: null,
            loading: false,
        };
    }

    componentDidMount() {
        this.setState({
            loading: true,
        });




    }

    fileChangedHandler = event => {
        const file = event.target.files[0];
        this.setState({ selectedFile: file });
    };

    uploadImage = event => {
        event.preventDefault();

        if (!this.state.selectedFile) return;

        this.setState({
            loading: true,
        });

        const formData = new FormData();
        formData.append('file', this.state.selectedFile, this.state.selectedFile.name);
        formData.append('upload_preset',  'ml_default' );

        const url = `https://api.cloudinary.com/v1_1/db8uwhsbg/upload`;

        axios.post(url, formData).then(({ data }) => {

            this.props.saveImage(data);

            this.setState({
                loading: false,
            });
        });
    };

    render() {
        const image = (url, index) => (
            <pre> {index} </pre>
        );

        const images = this.state.images.map((e, i) => image(e, i));

        return (
            <div className="App">

                <form method="post" onSubmit={this.uploadImage}>
                    <label className="label" htmlFor="gallery-image">
                        Choose an image to upload
                    </label>
                    <input
                        type="file"
                        onChange={this.fileChangedHandler}
                        id="gallery-image"
                        accept=".jpg, .jpeg, .png"
                    />
                    <button type="submit">Upload!</button>
                </form>


            </div>
        );
    }
}

export default App;