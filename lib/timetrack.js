var qs = require('querystring');

exports.sendHtml = function sendHtml(res, html){
	res.setHeader('Content-Type', 'text/html');
	res.setHeader('Content-Length', Buffer.byteLength(html));
	res.end(html);
};

exports.parseReceivedData = function receivedData(req, cb){
	var body = '';
	req.setEncoding('utf8');
	req.on('data', function data(chunk){ body += chunk});
	req.on('end', function end (){
		var data = qs.parse(body);
		cb(data);
	});
};

exports.actionForm = function actionForm(id, path, label){
	var html = '<form method = "POST" action="'+ path +'">'+
	'<input type="hidden" name = "id" value = "' + id +'">'+
	'<input type="submit" value= " ' + label+'" />'+
	'</form>';
	return html;
};

//adding a work record
exports.add = function addwork(db, req, res){
	exports.parseReceivedData(req, function parse(work){
		db.query(
			"INSERT INTO work (hours, date, description)"+
			"VALUES(?,?,?)",
			[work.hours, work.date, work.description],
			function (err){
				if (err) throw err;
				exports.show(db, res);
			});
	});
};

//delete work record

exports.delete = function deletework(db, req, res){
	exports.parseReceivedData(req, function(work){
		db.query(
			"DELETE FROM work WHERE id = ?",
			[work.id],
			function(err){
				if (err) throw err;
				exports.show(db, res);
			});
	});
};
//archving a work record

exports.archive = function archive(db, req,res){
	exports.parseReceivedData(req, function(work){
		db.query(
			"UPDATE work SET archived = 1 WHERE id = ?",
			[work.id],
			function(err){
				if (err) throw err;
				exports.show(db, res);
			});
	});
};
//retrieving work records

exports.show = function show (db,res, showArchived){
	var query = "SELECT * FROM work"; +
	"WHERE archived=? "+
	"ORDER BY date ASC";

	var archiveVale = (showArchived) ? 1:0;
	db.query(
		query,
		[archiveVale],
		function(err, rows){
			if (err) throw err;
			html = (showArchived)
			? ''
			: '<a href="/archived">archived work</a><br />';
			html += exports.workHitlistHtml(rows);
			html += exports.workFormHtml();
			exports.sendHtml(res, html);
		});
};
exports.showArchived = function showArch(db,res){
	exports.show (db, res, true);
};

//render work records

exports.workHitlistHtml = function workHitList(rows){
	var html = '<table>';
	for (var i in rows){
		html += '<tr>';
		html += '<td>' + rows[i].date + '</td>';
		html += '<td>' + rows[i].hours + '</td>';
		html += '<td>' + rows[i].description + '</td>';
		if (!rows[i].archived) {
			html += '<td>' + exports.workArchiveForm(rows[i].id)+ '</td>';

		}
		html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
		html += '</td>';

	}
	html +='</table>';
	return html;
};

exports.workFormHtml = function workformhtml(){
	var html = '<form method="POST" action="/">'+
		'<p> Date (YYYY-MM-DD:) <br/><input name="date" type ="text"><p/>'+
		'<p> Hours worked: <br/><input name = "hours" type = "text"></p>'+
		'<p>Description:<br/>'+
		'<textarea name="description" ></textarea></p>'+
		'<input type="submit" value = "Add" />'+
		'</form>';
		return html;
};

//render archive button form

exports.workArchiveForm = function renderarchform(id){
	return exports.actionForm(id, '/archive', 'Archive');
};

//render delete button form
exports.workDeleteForm = function renderdeleteform(id){
	return exports.actionForm(id, '/delete','Delete');
};
