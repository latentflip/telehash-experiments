var fs = require('fs');
var telehash = require('telehash');

telehash.add(require('./sock'));

telehash.generate(function (err, endpoint) {

  telehash.mesh({ id: endpoint }, function (err, mesh) {

    mesh.accept = mesh.link;

    console.log(JSON.stringify(mesh.json()));

    fs.writeFileSync(__dirname + '/server.json', JSON.stringify(mesh.json()));
  });
});


// Start express server on 3000
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello, world!');
});

var server = app.listen(3000, '127.0.0.1', function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
