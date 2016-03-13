'use strict';
import React from 'react';
import request from 'superagent';
import * as _ from 'lodash';

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
                <input type='text' placeholder='username' onChange={this.handleUsername.bind(this)} value={this.state.username} />
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
                <input type='text' placeholder='token' onChange={this.handleToken.bind(this)} value={this.state.token} />
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
        this.props.requestBoard(e.target.getAttribute('data-boardid'));
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
        console.log(this.state);
        this.props.send(this.state);
    }

    onChange(e) {
        var name = e.target.name;
        this.setState({[name]: e.target.value});
        console.log(e.target);
    }

    render() {
        var self = this;
        var labels = _.map(this.props.labels, function(label) {
            if(label[2] > 0.6) {
                var key_ = label[0] + ":" + label[1] + ":" +  label[2];
                var name_ = label[0] + ":" + label[1] + ":" + label[2];
                return (
                    <tbody>
                        <tr>
                            <td><input type="radio" name={name_} value={label[0]} key={key_} onChange={self.onChange.bind(self)} />{label[0]}</td>
                            <td><input type="radio" name={name_} value={label[1]} key={key_} onChange={self.onChange.bind(self)} />{label[1]}</td>
                            <td>distance: {label[2]}</td>
                        </tr>
                    </tbody>
                );
            }
        });
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
