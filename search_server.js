/*

    This little node server will answer requests from the search field on webbrickworks.com and act as a proxy for elasticsearch.
    It will basically take the search query and transform it into a format, that elasticsearch understands and request it.
    It will then foramt the response to be easier readable, and less "revealing".

*/

var http = require("http"),
    url  = require('url');


var server = http.createServer(function(req, res) {

    console.log("Retrieved search request...");

    var url_parts = url.parse(req.url, true),
        query     = url_parts.query.q, // this is our search query
        data;


    console.log("Looking for '" + query + "'...");

    // now we have to make the request to elasticsearch
    var esReq = http.request({
            hostname: "localhost",
            port: 9200, // the default elasticsearch port
            path: "/blog/document/_search?q=" + query,
            method: "POST"  
        },
        function(esRes) {
        var chunks = [],
        length = 0;

        console.log('HEADERS: ' + JSON.stringify(esRes.headers));

        esRes.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });


        esRes.on('end', function() {

            var buff  = new Buffer(length),
                total = 0,
                _d, _s;

            chunks.forEach(function(chunk) {
                chunk.copy(buff, total, 0);
                total += chunk.length;
            });

            _d = JSON.parse(buff.toString());

            //console.log(require("util").inspect(_d.hits));

            data = {};
            data.total = _d.hits.total;
            data.hits = [];

            _d.hits.hits.forEach(function(hit) {
                data.hits.push({
                    title: hit._source.title,
                    url: hit._source.url
                });
            });

            console.log(data);

            _s = JSON.stringify(data);

            res.writeHead(200, {
              "Content-Type": " application/json; charset=UTF-8",
              "Accept-Ranges": "bytes",
              "Content-Length": Buffer.byteLength(_s + "\n"),
              "Connection": "close",
              "Access-Control-Allow-Origin": "http://webbrickworks.com"
            });

            res.end(_s + "\n");

        });
    });


    esReq.end();

});




server.listen(5345);
console.log("Server listening on 5345...");