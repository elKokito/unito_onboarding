"use strict";
import React from "react";
import request from "superagent";
import * as _ from "lodash";
import Set from "collections/set";
import NotificationSystem from 'react-notification-system';

class IdentificationBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {username: ""};
    }


    handleUsername(e) {
        this.setState({username: e.target.value});
    }

    handleClick(e) {
        e.preventDefault();
        var self = this;
        request
        .get("/member_info?username=" + self.state.username)
        .end(function(err, res) {
            if(err) {
                self.props.notify("error", res.text);
            }
            else {
                self.props.sendBoards(res.body, self.state.username);
            }
        });
    }

    render() {
        return (
            <div>
                <input type="text" placeholder="username" onChange={this.handleUsername.bind(this)} value={this.state.username} />
                <button onClick={this.handleClick.bind(this)}>enter</button>
            </div>
        );
    }

};

class TokenBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {token: ""};
    }

    handleToken(e) {
        this.setState({token: e.target.value});
    }

    handleClick(e) {
        var self = this;
        request
        .post("/submit_token")
        .send({token: this.state.token})
        .end(function(err, res) {
            if(err) {
                self.props.notify("error", "invalid token");
            }
            else {
                self.props.notify("success", "token submitted");
                self.setState({token:""});
            }
        });
    }

    render() {
        return (
            <div>
                <input type="text" placeholder="token" onChange={this.handleToken.bind(this)} value={this.state.token} />
                <button onClick={this.handleClick.bind(this)}>submit token</button>
                <a href="/token" target="_blank">get token</a>
            </div>
        );
    }
};

class BoardsBox extends React.Component {
    constructor(props) {
        super(props)
    }

    handleClick(e) {
        this.props.requestBoard(e.target.getAttribute("data-boardid"));
    }

    render() {
        var self = this;
        var buttons = _.map(this.props.boards, function(board) {
            return <button key={board.id} data-boardid={board.id} onClick={self.handleClick.bind(self)} >{board.name}</button>;
        });
        return (
            <div>
                {buttons}
            </div>
        );
    }
}

class SimilarLabelsBox extends React.Component {

    constructor(props) {
        super(props)
    }

    handleClick(e) {
        var replacements = _.valuesIn(this.state);
        replacements = _.map(replacements, function(obj) {
            return JSON.parse(obj);
        });
        this.props.send(replacements);
    }

    onChange(e) {
        var name = e.target.name;
        this.setState({[name]: e.target.value});
    }

    render() {
        var self = this;
        var i = 0;
        var names = new Set();
        var button = null;
        var labels = _.map(this.props.labels, function(label_pair) {
            var name_ = label_pair.obj1.id + ":" +  label_pair.obj2.id;
            if(label_pair.distance > 0.6 && !names.has(name_)) {
                i = i+1;
                var value1 = JSON.stringify({selected: label_pair.obj1.id, to_delete: label_pair.obj2.id});
                var value2 = JSON.stringify({selected: label_pair.obj2.id, to_delete: label_pair.obj1.id});
                names.add(name_);
                return (
                    <tbody key={i} >
                        <tr>
                            <td>
                                <div className="radio">
                                    <label><input type="radio" name={name_} value={value1} onChange={self.onChange.bind(self)} />
                                    {label_pair.obj1.name}
                                    </label>
                                </div>
                            </td>
                            <td>
                                <div className="radio">
                                    <label><input type="radio" name={name_} value={value2} onChange={self.onChange.bind(self)} />
                                    {label_pair.obj2.name}
                                    </label>
                                </div>
                            </td>
                            <td>distance: {label_pair.distance}</td>
                        </tr>
                    </tbody>
                );
            }
        });
        console.log(this.show);
        if(i == 0) {
            // TODO make it more explicit that there"s no suggestion
            console.log("no suggestion");
            button = null;
        }
        else {
            // show merge button
            button = <button onClick={this.handleClick.bind(this)}>merge</button>;
        }
        return (
            <div>
                <table className="table">
                    {labels}
                </table>
                {button}
            </div>
        );
    }
}

export {IdentificationBox, TokenBox, BoardsBox, SimilarLabelsBox};
