import { Editor } from 'slate-react'

import { Block, Value } from 'slate'
import styled from '@emotion/styled'
import React, {Fragment} from 'react'
import bigText from './bigText'
import './TextEditor.css'

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {Button} from "antd";

/**
 * Define the default node type.
 *
 * @type {String}
 */



class TextEditor extends React.Component {
    /**
     * Deserialize the initial editor value.
     *
     * @type {Object}
     */

    state = {
        data: ''
    }

    render() {

        const { create } = this.props;

        return (
            <Fragment>

            <div className={'TextEditor'}>

                <CKEditor
                    editor={ ClassicEditor }
                    data="<p>Hello from CKEditor 5!</p>"
                    onInit={ editor => {
                        // You can store the "editor" and use when it is needed.
                        console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        this.setState({data : data});
                        console.log( { event, editor, data } );
                    } }
                    onBlur={ editor => {
                        console.log( 'Blur.', editor );
                    } }
                    onFocus={ editor => {
                        console.log( 'Focus.', editor );
                    } }
                />

                <Button onClick={() => create( {"trip_id" : 1, "type" : "Html", "height" : "100vh", "camera":  {"test" :33}, "content":  {"html" :this.state.data}})} >Add</Button>

            </div>
            </Fragment>
        )
    }
}

/**
 * Export.
 */

export default TextEditor