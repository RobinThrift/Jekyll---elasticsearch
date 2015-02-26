//Configurations
var httpParams = {
    hostname: 'localhost',
    port: 9200, // the default elasticsearch port
    index: '/INDEX/TYPE/',
    actions: {
    	'search': '_search?q='
    }
};

var serverParams = {
	port: 5345
};

var files = {
	indexed: './search_indexed.json',
	toIndex: './search_index.json'
};


//Http params
module.exports.httpParams = httpParams;
//Server params
module.exports.serverParams = serverParams;
//files
module.exports.files = files;

