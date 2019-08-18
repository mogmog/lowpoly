import React, { Component } from 'react';
import axios from 'axios';

import { Upload, message, Button, Icon, Spin } from 'antd';

export default class Demo extends React.Component {
    state = {
        fileList: [],
        uploading: false,
    };

    handleUpload = () => {
        const { fileList } = this.state;
        const formData = new FormData();
        fileList.forEach(file => {
            formData.append('files[]', file);
        });

        this.setState({
            uploading: true,
        });

       // const formData = new FormData();

        //fileList.forEach(file => {
            formData.append('file', fileList[0]);
        //});

        //formData.append('file', this.state.selectedFile, this.state.selectedFile.name);
        formData.append('upload_preset',  'ml_default' );

        const url = `https://api.cloudinary.com/v1_1/db8uwhsbg/upload`;

        axios.post(url, formData).then(({ data }) => {

            this.props.saveImage(data);
            this.setState({uploading : false});


        }).then(()=> {
            message.success('upload success.');
        }).catch(x=> {
            message.error(JSON.stringify(x));
        }) ;



    };

    render() {
        const { uploading, fileList } = this.state;
        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }), x=> {
                    this.handleUpload();
                });
                //
                return false;
            },
            fileList,
        };

        return (
            <div>
                <Upload {...props}  fileList={false}>
                    <Spin spinning={uploading}>
                    <Button style={{height : '100px', width : '100%'}}>
                        <Icon type="upload" /> Select Video
                    </Button>
                    </Spin>
                </Upload>
               {/* <Button
                    type="primary"
                    onClick={this.handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                >
                    {uploading ? 'Uploading' : 'Start Upload'}
                </Button>*/}
            </div>
        );
    }
}


/*class App extends Component {
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

                <Upload {...props}>
                    <Button>
                        <Icon type="upload" /> Upload Image
                    </Button>
                </Upload>

               {/!* <form method="post" onSubmit={this.uploadImage}>
                    <label className="label" htmlFor="gallery-image">
                        Choose an image to upload
                    </label>
                    <input
                        type="file"
                        onChange={this.fileChangedHandler}
                        id="gallery-image"
                        accept=".jpg, .jpeg, .png, .mp4"
                    />
                    <button type="submit">Upload!</button>
                </form>*!/}


            </div>
        );
    }
}*/

//export default App;