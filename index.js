//Código da parte do servidor.


const express = require('express'); // pegando a biblioteca express
const server = express();
const http = require('http').Server(server); //server recebendo express
const io = require('socket.io')(http);


server.use(express.static('public'));


//Porta onde esta sendo executado
http.listen(8080, () => {
    console.log('Server está la na porta 8080');
});


//Manda o index pro navegador.
server.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html'); 
});


//Aqui acontece se tiver uma connection (io.on). Basicamente controla a entrada e a saida de pessoas.
io.on('connection', function (socket) {
    io.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
    
    
    
    socket.on('candidate', function(data) { 
        io.to(data.toId).emit('candidate', { fromId: socket.id, ...data });
    });

    
   /*
    socket.on('sdp', function(data) { 
        io.to(data.toId).emit('sdp', { fromId: socket.id, ...data });
    });
*/


    socket.on('offer', function(data) { 
        //console.log("Enviando Offer para: ", data.toId);
       
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

    socket.on('answer', function(data) { 
        //console.log("Enviando Answer para: ", data.toId);
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
    });


    socket.on('disconnect', function() {
        io.sockets.emit('user-left', socket.id);
    });



});