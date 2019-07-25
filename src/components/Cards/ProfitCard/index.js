import React from 'react';
import { VictoryAnimation, VictoryLabel, VictoryPie, VictoryBar, VictoryChart , VictoryTheme, VictoryLine} from 'victory';
import {Card, Col, Row} from 'antd';

export default class extends React.Component {
    constructor() {
        super();

        this.state = {
            chartWidth: 0
        }

    }

    componentDidMount() {
        this.setState({
            chartWidth: window.innerWidth
        });
        window.addEventListener('resize', this.updateDimensions.bind(this));
        // remove this on unmount
    }

    updateDimensions(event) {
        this.setState({
            chartWidth: event.target.innerWidth
        })
    }


        render() {

            const size = 330;

            return (
                <Card>
                    <Row>
                        <Col span={24}>


                            <svg viewBox={"0 0" + " "+ this.state.chartWidth +" " + "350"}  preserveAspectRatio="none" width="100%">
                                <VictoryChart
                                    domainPadding={{x: 40}}
                                    standalone={false}
                                    width={this.state.chartWidth}
                                    height={350}
                                >
                                    <VictoryLine
                                        height={200}
                                        style={{
                                            data: { stroke: "#c43a31" },
                                            parent: { border: "1px solid #ccc"}
                                        }}
                                        data={this.props.card.content.data}
                                    />

                                </VictoryChart>
                            </svg>




                        </Col>


                    </Row>


                </Card>
            );
        }


}