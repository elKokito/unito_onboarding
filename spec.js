var request = require("supertest");
var server = require("./index.js");

describe('loading express', function() {

    it("responds to /", function testSlash(done) {
        request(server)
            .get("/")
            .expect(200, done);
    });

    it("redirect to", function testToken(done) {
        request(server)
            .get("/token")
            .expect('Location', /trello.com/, done)
            .expect('Location', /authorize\?scope=read%2Cwrite&name=OnboardingApp&response_type=token&expiration=never&key=/, done);
    });

    it("submit token", function testSumbitToken(done) {
        request(server)
            .post("/submit_token")
            .send("aaaaaaaaaaaaaa")
            .expect(403, done);
            done();
    });

    it("get member info", function testMemberinfo(done) {
        request(server)
            .get("/member_info")
            .expect(400, "error user without token", done);
    });

    it("get cards of boards", function testCardsBoards(done) {
        request(server)
            .get("/board_labels")
            .expect(400, "error user without token", done);
    });

    it("return duplicate proximity", function testDuplicate(done) {
        var duplicate = {labels: [{name: 'test', id: 1},
                                  {name: 'test1', id: 2},
                                  {name: 'zzzzz', id: 3}]};
        request(server)
            .post("/duplicate")
            .send(duplicate)
            .expect(200, done);
    });

    it("merge selected duplicate", function testMerge(done) {
        request(server)
            .post("/merge")
            .expect(400, done);
    });
});
