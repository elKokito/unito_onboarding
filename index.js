var express = require('express');
var request  = require('superagent');
var OAuth = require('oauth');
var Trello = require('node-trello');
var _ = require('lodash');
var natural = require('natural');
var bodyParser = require('body-parser');
var config = require('config');
var jsonfile = require('jsonfile');
var async = require('async');
var app = express();


app.use(express.static('public'));
app.use(bodyParser.json());

var key = config.get("trello.key");
var url = config.get("trello.url") + key;


app.get('/token', function(req, res) {
    res.redirect(url);
})

app.post("/submit_token", function(req, res) {
    var token = req.body.token;
    var pseudo_db = config.get("db.file");
    var t = new Trello(key, token);
    t.get("/1/tokens/" + token, function(err, data) {
        data.token = token;
        if(err) {
            res.statusCode = 403;
            res.send(err);
        }
        else{
            t.get("/1/members/" + data.idMember, function(err, member_data) {
                data.username = member_data.username;
                data.fullname = member_data.fullName;
                // TODO write an array on users
                jsonfile.writeFile(pseudo_db, data, function(err) {
                    res.send("thank you");
                });
            });
        }
    });
});

app.get("/member_info", function(req, res) {
    var username = req.query.username;
    var pseudo_db = config.get("db.file");
    jsonfile.readFile(pseudo_db, function(err, obj) {
        // TODO look in all entries
        if(obj.username == username) {
            var t = new Trello(key, obj.token);
            t.get("/1/members/me", function(err, data) {

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
    var username = req.query.username;
    var pseudo_db = config.get("db.file");
    jsonfile.readFile(pseudo_db, function(err, obj) {
        if(obj.username == username) {
            var labels = [];
            var t = new Trello(key, obj.token);
            t.get("/1/boards/" + req.query.id + "/cards", function(err, data) {
                _.map(data, function(card) {
                    var names = _.map(card.labels, function(label) {
                        return label.name;
                    })
                    labels = labels.concat(names);
                });
                res.send(labels);
            });
        }
    });
});

app.post("/duplicate", function(req, res) {
    var labels = req.body.labels;
    var pairs = []
    console.log(labels);
    for (var i = 0; i < labels.length; i++) {
        for(var j = i+1; j < labels.length; j++) {
            if(labels[i] != "" && labels[j] != "" && labels[i] != labels[j]) {
                var distance = natural.JaroWinklerDistance(labels[i], labels[j]);
                pairs.push([labels[i], labels[j], distance]);
            }
        }
    }
    res.send(pairs);
});

app.post("/merge", function(req, res) {
    console.log(req.body);
});


var server = app.listen(8000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('runing on %s : %s', host, port);
});
