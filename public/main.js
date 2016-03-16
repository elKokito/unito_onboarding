"use strict";
import React from "react";
import ReactDom from "react-dom";
import {IdentificationBox, TokenBox, BoardsBox, SimilarLabelsBox} from "./component.js";
import request from "superagent";
import NotificationSystem from 'react-notification-system';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state ={boards: [], username: "", labels: [], selected_board: ""};
    }

    componentDidMount() {
        this.notification = this.refs.notificationSystem;
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
            if(err) {
                self.notify("error", "merging error");
            }
            else{
                self.notify("success", "merge complete");
            }
        });
    }

    notify(type, msg) {
        this.notification.addNotification({
            message: msg,
            level: type,
            position: "br"
        });
    }

    render() {
        if(this.state.boards != [])
            var boardsbox = <BoardsBox boards={this.state.boards} requestBoard={this.requestBoard.bind(this)} />;
        if(this.state.labels != [])
            var similarlabelsbox = <SimilarLabelsBox labels={this.state.labels} send={this.sendDuplicateCorrection.bind(this)} />;
        return (
            <div className="container-fluid">
                <div className="row">
                    <h1>my app</h1>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <IdentificationBox sendBoards={this.submitBoards.bind(this)} notify={this.notify.bind(this)}/>
                    </div>
                    <div className="col-md-4">
                        <TokenBox notify={this.notify.bind(this)} />
                    </div>
                </div>
                <div className="row">
                    {boardsbox}
                </div>
                <div className="row">
                    {similarlabelsbox}
                </div>
                <NotificationSystem ref="notificationSystem" />
            </div>
        );
    }
}

ReactDom.render(
    <App />,
    document.getElementById("app")
);
