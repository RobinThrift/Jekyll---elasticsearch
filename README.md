Ever wanted to make your Jekyll site searchable? Well now you can! 

Using the power of [elasticsearch](http://elasticsearch.org) and Node!

In this repository you will find a little Jekyll template that will render a JSON file that is easily parsable and contains all the relevant information.
This JSON file will then be used by <code>indexer.js</code> to index your site via the elasticsearch API. If you only changed a file, it will update the entry and not create a new one, preventing duplicate entries. See <code>indexer.js</code> for more info on how it works.

Then start <code>search_server.js</code> to act as a proxy between the client and elasticsearch. Make sure to add <code>Header set Access-Control-Allow-Origin "domain:port"</code> to your <code>.htaccess</code>.

Every time you update your Jekyll blog you will have to run <code>node indexer.js</code> in order to update the index.


In order to use the scripts, add your *INDEX* and *TYPE* to <code>indexer.js</code> and <code>search_server.js</code>. You will also have to edit the <code>Access-Control-Allow-Origin</code> in <code>search_server.js</code> to allow your client side code to access the proxy.