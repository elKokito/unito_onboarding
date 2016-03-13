'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import {IdentificationBox, TokenBox, BoardsBox, SimilarLabelsBox} from './component.js';
import request from 'superagent';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state ={boards: [], username: "", labels: [], selected_board: ""};
    }

    submitBoards(boards, username) {
        this.setState({boards: boards, username: username});
    }

    requestBoard(boardid) {
        var self = this;
        this.state.selected_board = boardid;
        request
        .get("/board_labels?id=" + boardid + "&username=" + self.state.username)
        .end(function(err, res) {
            request
            .post("/duplicate")
            .send({labels: res.body})
            .end(function(err, res) {
                self.setState({labels: res.body});
            });
        });
    }

    sendDuplicateCorrection(obj) {
        var self = this;
        this.state.labels = obj;
        request
        .post("/merge")
        .send(self.state)
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
