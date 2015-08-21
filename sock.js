var net = require('net');
//var streamlib = require('stream');
//var lob = require('lob-enc');

// implements https://github.com/telehash/telehash.org/blob/v3/v3/channels/sock.md
exports.name = 'sock';

exports.mesh = function(mesh, cbMesh)
{
  var ext = {open:{}};

  ext.link = function(link, cbLink)
  {

    // ask this link to create a socket to the given args.ip and args.port
    link.connect = function(args, cbMessage)
    {
      var json = {
        type: 'sock',
        dst: args.dst,
      };

      var channel = link.x.channel({ json: json });
      channel.send({ json: json });
      channel.receiving = function (err, packet, done) {
        console.log('RECEIVE');
        console.log({ err: err, packet: packet.json });
        done();
      };

      if (args.src) {
        var server = net.createServer(function (socket) {
          var stream = mesh.streamize(channel);
          stream.pipe(socket);
          socket.pipe(stream);
          //socket.on('data', function (d) {
          //  //d = d.toString();
          //  //d = d.replace(new RegExp(args.src.port, 'g'), args.dst.port);
          //  stream.write(d);
          //  console.log('>', d.toString());
          //});
          //stream.on('data', function (d) {
          //  console.log('<', d.toString());
          //  socket.write(d);
          //});
        });
        server.listen(args.src.port, '127.0.0.1');
      }

      //channel.send({ json: {
      //  sock: 'connect',
      //  dst: args
      //}});

      console.log('Send connect');
    }

    // ask the link to create a server for us, args.port and args.type is udp/tcp
    link.sock_bound = {};
    link.server = function(args, cbAccept, cbServer)
    {
      console.log('LINK SERVER');
      // udp messages, fire cbAccept, cbServer returns a message method
      // if no cbServer, no bind request, is just default accept
    }

    // just like mesh.sock for incoming requests on this link only
    link.sock = function(cbPolicy) {
      console.log('LINK SOCK');
    }

    cbLink();
  }

  // process any incoming connect/bind requests
  mesh.sock = function(cbPolicy) {
    console.log('MESH SOCK');
  }

  ext.open.sock = function(args, open, cbOpen){
    var json = open.json;
    var link = this;

    var channel = link.x.channel(open);
    var sockStream = mesh.streamize(channel);

    var client = new net.Socket();

    client.connect(json.dst.port, '127.0.0.1', function () {
      client.pipe(sockStream);
      sockStream.pipe(client);
      sockStream.on('data', function (d) {
        console.log('>', d.toString());
        client.write(d);
      });
      client.on('data', function (d) {
        console.log('<', d.toString());
        sockStream.write(d);
      });
    });

    cbOpen();
  }

  cbMesh(undefined, ext);
}
