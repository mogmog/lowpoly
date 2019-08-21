import React from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

export default ({onClick, interactWithMap}) =>  <div onClick={onClick} style={{fontSize : '100%', zIndex : 9999998, zoom : 1, padding : '5px', position : 'fixed', top : 0, left : 0}}>

    {interactWithMap && <Button type="primary" shape="circle" icon="caret-right" /> }
    {!interactWithMap && <Button type="primary" shape="circle" icon="caret-left" /> }
</div>
