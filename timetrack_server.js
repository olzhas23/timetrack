var http = require('http');
var work = require('./lib/timetrack');
var mysql = require('mysql');
var connection = mysql.createConnection(
{
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'timetrack',
	//socketPath  : '/var/run/mysqld/mysqld.sock'
});

//
var server = http.createServer(function createServer(req, res){
	switch (req.method){
		case 'POST':
		switch (req.url){
			case '/':
				work.add(connection, req, res);
				break;
			case '/archive':
				work.archive(connection, req, res);
				break;
			case '/delete':
				work.delete(connection, req, res);
				break;

		}
		break;
	case 'GET':
		switch(req.url){
			case '/':
				work.show(connection,res);
				break;
			case '/archived':
				work.showArchived(connection,res);
		}
		break;
	}
});
//create db
connection.connect(function(err, conn){
	if (err){
	console.log ('couldnt conect to db', err);
	process.exit(1);}
});

connection.query (
	"CREATE TABLE IF NOT EXISTS work("
		+"id INT (10) NOT NULL AUTO_INCREMENT,"
		+"hours DECIMAL (5,2) DEFAULT 0,"
		+"date DATE,"
		+"archived INT (1) DEFAULT 0, "
		+"description LONGTEXT, "
		+"PRIMARY KEY(id))",
function db(err){
	if (err) throw err;
	console.log('Server startedd ....');
	server.listen(3000, '127.0.0.1');
}
);