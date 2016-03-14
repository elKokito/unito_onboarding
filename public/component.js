"use strict";
import React from "react";
import request from "superagent";
import * as _ from "lodash";

class IdentificationBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {username: ""};
    }

    handleUsername(e) {
        this.setState({username: e.target.value});
    }

    handleClick(e) {
        var self = this;
        request
        .get("/member_info?username=" + self.state.username)
        .end(function(err, res) {
            self.props.sendBoards(res.body, self.state.username);
            //self.setState({username: ""});
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
            console.log(res);
            self.setState({token:""});
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
        var labels = _.map(this.props.labels, function(label_pair) {
            if(label_pair.distance > 0.6) {
                i = i+1;
                var name_ = label_pair.obj1.id + ":" +  label_pair.obj2.id;
                var value1 = JSON.stringify({selected: label_pair.obj1.id, to_delete: label_pair.obj2.id});
                var value2 = JSON.stringify({selected: label_pair.obj2.id, to_delete: label_pair.obj1.id});
                return (
                    <tbody key={i} >
                        <tr>
                            <td><input type="radio" name={name_} value={value1} onChange={self.onChange.bind(self)} />{label_pair.obj1.name}</td>
                            <td><input type="radio" name={name_} value={value2} onChange={self.onChange.bind(self)} />{label_pair.obj2.name}</td>
                            <td>distance: {label_pair.distance}</td>
                        </tr>
                    </tbody>
                );
            }
        });
        if(i == 0) {
            // TODO make it more explicit that there"s no suggestion
            console.log("no suggestion");
        }
        return (
            <div>
                <table>
                    {labels}
                </table>
                <button onClick={this.handleClick.bind(this)}>merge</button>
            </div>
        );
    }
}

export {IdentificationBox, TokenBox, BoardsBox, SimilarLabelsBox};
