import React from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

export default ({onClick, card}) =>  <div onClick={onClick} style={{fontSize : '300%', zIndex : 9999998, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, left : 0}}>


    <Button type="primary" shape="circle" icon="plus-circle" />
</div>
