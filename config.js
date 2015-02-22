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


//Http params
module.exports.httpParams = httpParams;
//Server params
module.exports.serverParams = serverParams;

