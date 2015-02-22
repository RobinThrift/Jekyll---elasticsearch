//Configurations
var httpParams = {
    hostname: 'localhost',
    port: 9200, // the default elasticsearch port
    path: '/INDEX/TYPE/_search?q='
};


//Http params
module.exports.httpParams = httpParams;
