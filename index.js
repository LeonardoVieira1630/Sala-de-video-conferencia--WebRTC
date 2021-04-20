//Código da parte do servidor.


const express = require('express'); // pegando a biblioteca express
const server = express();
const http = require('http').Server(server); //server recebendo express
const io = require('socket.io')(http);
var usuários = []; // Lista de usuários
var ultimas_mensagens = []; // Lista com ultimas mensagens enviadas no chat



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


    socket.on('offer', function(data) { 
        //console.log("Enviando Offer para: ", data.toId);
       //TODO:não emitir para todo mundo da sala.
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

    socket.on('answer', function(data) { 
        //console.log("Enviando Answer para: ", data.toId);
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
    });


    socket.on('disconnect', function() {
        io.sockets.emit('user-left', socket.id);

        delete usuários[socket.apelido];
		var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};


		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala		
		io.sockets.emit("atualizar_usuários", Object.keys(usuários));
		io.sockets.emit("atualizar_mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem);
    });



    // Método de resposta ao evento de entrar
	socket.on('entrar', function(apelido, callback){
		if(!(apelido in usuários)){
			socket.apelido = apelido;
			usuários[apelido] = socket; // Adicionando o nome de usuário a lista armazenada no servidor

			var mensagem = "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala";
			var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

			io.sockets.emit("atualizar_usuários", Object.keys(usuários)); // Enviando a nova lista de usuários
			io.sockets.emit("atualizar_mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem); // Guardando a mensagem na lista de histórico

			callback(true);
		}else{
			callback(false);
		}

	});


	socket.on("enviar_mensagem", function(dados, callback){

		var mensagem_enviada = dados.msg;
		var usuário = dados.usu;
		if(usuário == null) usuário = ''; // Caso não tenha um usuário, a mensagem será enviada para todos da sala

		mensagem_enviada = "[ " + pegarDataAtual() + " ] " + socket.apelido + " diz: " + mensagem_enviada;
		var obj_mensagem = {msg: mensagem_enviada, tipo: ''};

		if(usuário == ''){
			io.sockets.emit("atualizar_mensagens", obj_mensagem);
			armazenaMensagem(obj_mensagem); // Armazenando a mensagem
		}else{
			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuários[usuário].emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
	});

    

});

// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual(){
	var dataAtual = new Date();
	var dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
	var mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
	var ano = dataAtual.getFullYear();
	var hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
	var minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
	var segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

	var dataFormatada = dia + "/" + mes + "/" + ano + " " + hora + ":" + minuto + ":" + segundo;
	return dataFormatada;
}


// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}

	ultimas_mensagens.push(mensagem);
}

