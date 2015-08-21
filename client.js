var fs = require('fs');
var telehash = require('telehash');

//var readline = require('readline');
//var rl = readline.createInterface({
//  input: process.stdin,
//  output: process.stdout,
//  terminal: false
//});
//rl.once('line', function (line){
//});


telehash.add(require('./sock'));

telehash.generate(function (err, endpoint) {

  telehash.mesh({ id: endpoint }, function (err, mesh) {

    mesh.accept = mesh.link;

    var meshServer = JSON.parse(fs.readFileSync(__dirname + '/server.json').toString());
    mesh.link(meshServer, function (err, link) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      setTimeout(function () {
        var stream = link.connect({
          dst: { ip: '127.0.0.1', port: 3000 },
          src: { ip: '127.0.0.1', port: 4000 }
        });
      }, 100);
    });
  });
});
