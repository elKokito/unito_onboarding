'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import {IdentificationBox, TokenBox, BoardsBox, SimilarLabelsBox} from './component.js';
import request from 'superagent';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state ={boards: [], username: "", labels: []};
    }

    submitBoards(boards, username) {
        this.setState({boards: boards, username: username});
        //this.forceUpdate();
    }

    requestBoard(boardid) {
        var self = this;
        request
        .get("/board_labels?id=" + boardid + "&username=" + self.state.username)
        .end(function(err, res) {
            request
            .post("/duplicate")
            .send({labels: res.body})
            .end(function(err, res) {
                console.log(res);
                self.setState({labels: res.body});
            });
        });
    }

    sendDuplicateCorrection(obj) {
        var self = this;
        console.log('sending to server:');
        console.log(obj);
        request
        .post("/merge")
        .send(obj)
        .end(function(err, res) {
            console.log(res);
        });
    }
    render() {
        if(this.state.boards != [])
            var boardsbox = <BoardsBox boards={this.state.boards} requestBoard={this.requestBoard.bind(this)} />;
        if(this.state.labels != [])
            var similarlabelsbox = <SimilarLabelsBox labels={this.state.labels} send={this.sendDuplicateCorrection.bind(this)} />;
        return (
            <div>
                <h1>my app</h1>
                <IdentificationBox sendBoards={this.submitBoards.bind(this)}/>
                {boardsbox}
                {similarlabelsbox}
            </div>
        );
    }
}

ReactDom.render(
    <App />,
    document.getElementById('app')
);
