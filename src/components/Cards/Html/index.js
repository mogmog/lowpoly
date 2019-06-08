import React, {Fragment} from 'react'

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CardWrapper from "../../CardWrapper";


class HtmlCard extends React.Component {

    render() {

        return (
            <Fragment>

                <CardWrapper style={this.props.card.wrapper}>
                    <div>
                        <div dangerouslySetInnerHTML={{ __html: this.props.card.content.html }}/>
                    </div>
                </CardWrapper>
            </Fragment>
        )
    }

}

export default HtmlCard