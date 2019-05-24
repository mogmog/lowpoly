import React from 'react'
import {Button} from 'antd'

import 'antd/dist/antd.css';

export default ({onClick}) =>  <div onClick={onClick} style={{fontSize : '300%', zIndex : 9999999, zoom : 2, padding : '10px', position : 'fixed', bottom : 0, right : 0}}><Button type="primary" shape="circle" icon="plus-circle" /></div>
