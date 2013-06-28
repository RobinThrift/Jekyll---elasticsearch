/*

    This little nod script takes a JSON file and compares it to it's index, to see, if the file has changed or not.
    If it has changed, or is new, update the elsaticsearch index.

    So first we require the filesystem to read the search_indexed.json, the file created by this script, to retrieve
    the documents that have already been indexed as a JS object where the key of a document is the title.

    Next we read the search_index.json file and convert it to a JS array. 
    We then loop over the array and:
        - remove the http://webbrickworks.com from the url property => $path
        - check the modified date on the file at $path
        - if the the modified date is different to the one already indexed => update()
        - if it is new => add()
        - if count == number of docuents => writeIndexed() and close()

    add(data) {
        call the elasticsearch API to add the document to the index (unsing POST)
        and add the retrieved id in data.id
        save(data);
    }

    update(data) {
        call the elasticsearch API to update the document in the index (using PUT)
        save(data)
    }

    save(data) {
        adds data to the script's indexed object for later reference (saved in seach_indexed.json later)
    }

    writeIndexed() {
        writes the $indexed object to search_indexed.json
    }

    count() {
        check if we have written all documents;
        if we have => writeIndexed() => close();
    }
*/

// modules
var fs = require("fs"),
    http = require("http"),


// variables
    httpParams = {
        hostname: "localhost",
        port: 9200, // the default elasticsearch port
        path: "/blog/document"
    },
    req, // this will hold our request
    indexed = JSON.parse(fs.readFileSync("./search_indexed.json", { encoding: "utf8" })),
    toIndex = JSON.parse(fs.readFileSync("./search_index.json", { encoding: "utf8" })),
    counter = 0; // keep track, how many docs have been indexed


function add(data) {
    httpParams.method = "POST";
    httpParams.path = "/blog/document";

    req = http.request(httpParams, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        res.on('data', function(_d) {
            data.id = JSON.parse(_d)._id;
        });

        res.on('end', function() {
            save(data);
            count();
        });
            
    });

    req.write(JSON.stringify(data));
    req.end();
}


function update(data, id) {
    httpParams.method = "PUT";
    httpParams.path = "/blog/document/" + id;

    req = http.request(httpParams, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');

        res.on('data', function(_d) {
            console.log(_d);
        });

        res.on('end', function() {
            save(data);
            count();
        });


    });

    req.write(JSON.stringify(data));
    req.end();
}


function save(data) {
    console.log(data);
    indexed[data.title] = data;
}

function writeIndexed() {
    fs.writeFile("./search_indexed.json", JSON.stringify(indexed), function() {
        close();
    });
}

function count() {
    if (++counter == toIndex.length) {
        writeIndexed();
    }
}

function close() {

    process.exit(0);

} // END OF FUNCTION close()


// this is the core of the script



// the main loop
console.log("Starting main loop...");
toIndex.forEach(function(doc) {

    var path = doc.path,
        stats = fs.statSync("." + path),
        old = indexed[doc.title];

    doc.mtime = stats.mtime.getTime();

    if (old && old.mtime !== doc.mtime) {
        update(doc, old.id);
    } else if (old == undefined) {
        add(doc);
    } else {
        count();
        console.log("No change in '" + doc.title + "'; skipped.");
    }

});