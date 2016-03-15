/* jshint node: true */
/* jshint esversion: 6 */
"use strict";
var express = require("express");
var request  = require("superagent");
var OAuth = require("oauth");
var Trello = require("node-trello");
var _ = require("lodash");
var natural = require("natural");
var bodyParser = require("body-parser");
var config = require("config");
var jsonfile = require("jsonfile");
var async = require("async");
var app = express();


app.use(express.static("public"));
app.use(bodyParser.json());

var key = config.get("trello.key");
var url = config.get("trello.url") + key;


app.get("/token", function(req, res) {
    res.redirect(url);
});

app.post("/submit_token", function(req, res) {
    // TODO change console.log for connect logger
    console.log("/submit_token");
    var token = req.body.token;
    var pseudo_db = config.get("db.file");
    var t = new Trello(key, token);
    t.get("/1/tokens/" + token, function(err, data) {
        if(err) {
            res.statusCode = 403;
            res.send(err);
        }
        else{
            data.token = token;
            t.get("/1/members/" + data.idMember, function(err, member_data) {
                data.username = member_data.username;
                data.fullname = member_data.fullName;
                jsonfile.readFile(pseudo_db, function(err, db) {
                    // TODO update token if pre-existing user
                    db.push(data)
                    jsonfile.writeFile(pseudo_db, db, function(err) {
                        res.send("thank you");
                    });
                });
            });
        }
    });
});

app.get("/member_info", function(req, res) {
    console.log("/member_info");
    var username = req.query.username;
    var pseudo_db = config.get("db.file");
    jsonfile.readFile(pseudo_db, function(err, db) {
        var user = null;
        for(var i = 0; i < db.length; i++) {
            if(username == db[i].username)
                user = db[i];
        }
        if(user) {
            var t = new Trello(key, user.token);
            t.get("/1/members/me", function(err, data) {

                // TODO run parallel instead of map
                async.map(
                    data.idBoards,
                    function(id, cb) {
                        t.get("/1/boards/" + id, function(err, board_data) {
                            cb(null, board_data);
                        });
                    },
                    function(err, results) {
                        res.send(results);
                    }
                );

            });
        }
        else {
            res.statusCode = 400;
            res.send("error user without token");
        }
    });
});

app.get("/board_labels", function(req, res) {
    console.log("/board_labels");
    var username = req.query.username;
    var pseudo_db = config.get("db.file");
    jsonfile.readFile(pseudo_db, function(err, db) {
        var user = null;
        for(var i = 0; i < db.length; i++) {
            if(username == db[i].username)
                user = db[i];
        }
        if(user) {
            var labels = [];
            var t = new Trello(key, user.token);
            t.get("/1/boards/" + req.query.id + "/cards", function(err, data) {
                _.map(data, function(card) {
                    var names = _.map(card.labels, function(label) {
                        return {name: label.name, id: label.id} ;
                    });
                    labels = labels.concat(names);
                });
                res.send(labels);
            });
        }
    });
});

app.post("/duplicate", function(req, res) {
    console.log("/duplicate");
    var labels = req.body.labels;
    var pairs = [];
    for (var i = 0; i < labels.length; i++) {
        for(var j = i+1; j < labels.length; j++) {
            if(labels[i].name !== "" && labels[j].name !== "" && labels[i].name !== labels[j].name) {
                var distance = natural.JaroWinklerDistance(labels[i].name, labels[j].name);
                var obj1 = {name: labels[i].name, id: labels[i].id};
                var obj2 = {name: labels[j].name, id: labels[j].id};
                pairs.push({obj1, obj2, distance});
            }
        }
    }
    res.send(pairs);
});

app.post("/merge", function(req, res) {
    console.log("/merge");
    var boardid = req.body.selected_board;
    var username = req.body.username;
    var pseudo_db = config.get("db.file");
    var labels_to_update = req.body.labels;
    var labelid = "56e2efa2152c3f92fd61ed3d";
    // TODO refactor callbacks of callbacks
    jsonfile.readFile(pseudo_db, function(err, db) {
        var user = null;
        for(var i = 0; i < db.length; i++) {
            if(username == db[i].username)
                user = db[i];
        }
        if(user) {
            var t = new Trello(key, user.token);
            t.get("/1/boards/" + boardid + "/cards", function(err, data) {
                _.map(data, function(card) {
                    for(var i = 0; i < labels_to_update.length; i++){
                        if(card.idLabels.indexOf(labels_to_update[i].to_delete) != -1){
                            var label_to_delete = labels_to_update[i].to_delete;
                            var label_to_add = labels_to_update[i].selected;
                            t.post("/1/cards/" + card.id + "/idLabels", {value: label_to_add}, function(err, r) {
                                if(err)
                                    console.log(err);
                            });
                            t.del("/1/cards/" + card.id + "/idLabels/" + label_to_delete, function(err, r){
                                if(err)
                                    console.log(err);
                            });
                        }
                    }
                });
                res.send();
            });
        }
    });
});


var server = app.listen(8000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("runing on %s : %s", host, port);
});
