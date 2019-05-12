import React, { Component } from 'react';
import ReactSVG from 'react-svg';
import Masonry from 'react-masonry-css'
import './index.css'

const GraphicsGrid = ({graphics}) => {

    return (
        <div className={'container'}>


                        {graphics.map(d=> <div className={'item'}> <ReactSVG  wrapper="span"  beforeInjection={svg => {
                                svg.setAttribute('style', 'width: 100px; height: 100px');



                        }} src={`./svg/${d.filename}`}/> </div>)}



        </div>
    );
};

export default GraphicsGrid;