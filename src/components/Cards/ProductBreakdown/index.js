import React from 'react';
import { VictoryAnimation, VictoryLabel, VictoryPie, VictoryBar, VictoryChart } from 'victory';
import {Row, Col, Card} from 'antd';

export default class extends React.Component {
    constructor() {
        super();

    }

    render() {

        const size = 330;

        return (
            <Card>
            <Row>
                <Col span={18}>
                <svg width={size} height={size}>

                    <VictoryPie
                        standalone={false}
                        animate={{ duration: 1500 }}
                        width={size}
                        height={size}
                        data={[{x: 1, y :2}]}
                    />

                   {/* <VictoryPie
                        standalone={false}
                        animate={{ duration: 1500 }}
                        width={size} height={size}
                        data={this.state.data}
                        innerRadius={size/3}
                        cornerRadius={size/3}
                        labelComponent={<g />}
                        style={{
                            data: { fill: (d) => {
                                    const color =  "#107BFB";
                                    return d.x === 1 ? color : "transparent";
                                }
                            }
                        }}
                    />*/}


                </svg>
                </Col>

                <Col span={6}>
                    <h1> You sell black plates</h1>
                </Col>
            </Row>


            </Card>
        );
    }
}