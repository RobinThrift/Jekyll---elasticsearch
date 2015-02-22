/*

    This little node server will answer requests from the search field on webbrickworks.com and act as a proxy for elasticsearch.
    It will basically take the search query and transform it into a format, that elasticsearch understands and request it.
    It will then foramt the response to be easier readable, and less "revealing".

*/

var http = require('http'),
    url  = require('url'),
    config = require('./config.js'),
    httpParams = config.httpParams,
    serverParams = config.serverParams;


var server = http.createServer(function(req, res) {

    console.log("Retrieved search request...");

    var url_parts = url.parse(req.url, true),
        query     = url_parts.query.q || '', // this is our search query
        data;


    console.log("Looking for '" + query + "'...");

    var req = {
        hostname: httpParams.hostname,
        port: httpParams.port,
        path: httpParams.index + httpParams.actions['search'] + query,
        method: 'POST'
    };

    // now we have to make the request to elasticsearch
    var esReq = http.request(req,
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

            console.log(_d);

            data = {};
            
            data.hits = [];

            if (_d.status === 200) {
                data.total = _d.hits.total;
                _d.hits.hits.forEach(function(hit) {
                    data.hits.push({
                        title: hit._source.title,
                        url: hit._source.url
                    });
                });
            } else {
                data.error = _d.error;
            }

            //console.log(require("util").inspect(_d.hits));


           
            console.log(data);

            _s = JSON.stringify(data);

            res.writeHead(200, {
              "Content-Type": " application/json; charset=UTF-8",
              "Accept-Ranges": "bytes",
              "Content-Length": Buffer.byteLength(_s + "\n"),
              "Connection": "close",
              "Access-Control-Allow-Origin": "YOUR_DOMAIN"
            });

            res.end(_s + "\n");

        });
    });


    esReq.end();

});




server.listen(serverParams.port);
console.log("Server listening on " + serverParams.port + "...");