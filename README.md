# ArangoDB AQL Query
`arango-aql-query`

Execute [ArangoDB](https://www.arangodb.com/) AQL queries directly from within [Atom](https://atom.io) Editor.

Query files are must have a `.aql` file extension. You may like to use [**arango-aql-language**](https://atom.io/packages/arango-aql-language) package to add syntax highlighting to your AQL files.

Query results are output to a paired results file with `.json` extension.  See settings for more information.

### Query
By default use `ctrl-q` to execute a query. If a file contains multiple queries, simply select the query to be executed and hit `ctrl-q`.

![append-results](https://raw.githubusercontent.com/clintwood/arango-aql-query/master/readme-append-results.gif)

### bindVars
Use of `bindVars` is supported by including `bindVars` JSON within comments before the query as shown below here.

![bindvars](https://raw.githubusercontent.com/clintwood/arango-aql-query/master/readme-bindvars.gif)

### Override Settings
All package settings can be temporarily overridden by placing a key value pair in the comment block above a query as shown here for `includeRequestTime` setting.

![timing setting](https://raw.githubusercontent.com/clintwood/arango-aql-query/master/readme-timing.gif)


Execution of multiple queries and many more productivity features will be release soon.

### Licence
MIT
