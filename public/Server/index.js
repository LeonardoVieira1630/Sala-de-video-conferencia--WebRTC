//Código da parte do servidor.

const {pegarDataAtual, pegarTempo} = require('./func_time');
const {compararTempo} = require('./func_time2');
const {armazenaMensagem} = require('./func_info');
const {funcClients, funcStats, funcClientsId, funcLength, app} = require('./func_info');
const express = require('express'); // pegando a biblioteca express
const server = express();
const http = require('http').Server(server); //server recebendo express
const io = require('socket.io')(http);
const usuários = new Map(); // Lista de usuários (nome + socket.id)
const nomes = []; // Contem os nomes. Usada também para o numero de users na sala.
const stats = new Map(); //Contem as estatísticas Do WebRTC de cada connection.
let ultimas_mensagens = []; // Lista com ultimas mensagens enviadas no chat
var peers = 0; //Armazena informações sobre os peers.
const Latência = new Map(); //Contem as informações de latência de cada peer.
const HOST = '0.0.0.0'

server.use(express.json());

//Pegando os clientes da sala.
server.get("/clients", function(req,res){	 
	
	let obj = funcClients(usuários);
	if(obj == 0) return res.status(204).json();
	res.json(obj);

});

//Pegando as stats dos clientes da sala.
server.get("/stats", function(req,res){	

	let obj = funcStats(stats);
	if(obj == 0) return res.status(204).json();
	res.json(obj);
});

//		Latência.set(peers,res);

//Disponibilizando a latência dos peers.
server.get("/latencia", function(req,res){
	let i=0;
	let lat = new Array();
	
	Latência.forEach((value, name) =>{
		lat[i] = name
		++i
		lat[i] = value
		++i
	})
	
	if(lat == 0) return res.status(204).json();
	res.json(lat);

})

//Pegando um usuário específico da sala + suas stats.
server.get("/clients/:id", function(req,res){	
	
    let id = req.params; 
	let obj = funcClientsId(usuários, stats, id);
	if(obj == 0) return res.status(204).json();
	res.json(obj);

});


//Pegando a quantidade de pessoas na sala.
server.get("/length", function(req,res){

	let obj = funcLength(nomes);
	res.json(obj);

});
 

server.use(express.static('public'));


//Porta onde esta sendo executado
http.listen(3000,HOST, () => {
  console.log('Server está la na porta 3000');
});


//Manda o index pro navegador.
server.get('/', function(req, res){
    res.sendFile(__dirname + '../index');     
});





//Aqui acontece se tiver uma connection (io.on). Basicamente controla a entrada e a saida de pessoas.
io.on('connection', function (socket) {
    io.emit('user-joined', { clients:  Object.keys(io.sockets.clients().sockets), count: io.engine.clientsCount, joinedUserId: socket.id});
    let data = new Date();
    
    socket.on('candidate', function(data) { 
        io.to(data.toId).emit('candidate', { fromId: socket.id, ...data });
    });


    socket.on('offer', function(data) { 
        
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

    socket.on('answer', function(data) { 
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
    });


    socket.on('disconnect', function() {
		
        io.sockets.emit('user-left', socket.id);
        delete nomes[socket.apelido];
		usuários.delete(socket.apelido); 
		stats.delete(socket.id); 
		Latência.delete(socket.id); 

		var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};


		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala		
		io.sockets.emit("atualizar_usuários", Object.keys(nomes));
		io.sockets.emit("atualizar_mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem, ultimas_mensagens);
    });



    // Método de resposta ao evento de entrar
	socket.on('entrar', function(apelido, callback){
		if(!usuários.get(apelido)){
					
			socket.apelido = apelido;
			nomes[apelido] = socket;			
			usuários.set(apelido, socket); // Adicionando o nome de usuário a lista armazenada no servidor
			usuários.forEach(i=>{obj = i})

			var mensagem = "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala";
			var obj_mensagem = {msg: mensagem, tipo: 'sistema'};

			io.sockets.emit("atualizar_usuários", Object.keys(nomes)); // Enviando a nova lista de usuários
			
			io.sockets.emit("atualizar_mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem, ultimas_mensagens); // Guardando a mensagem na lista de histórico

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
			armazenaMensagem(obj_mensagem, ultimas_mensagens); // Armazenando a mensagem
		}else{
			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuários.get(usuário).emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
	});


	//Escuta quando as stats devem ser atualizadas.
	socket.on("stats", function(dados, userId){
		peers = userId;
		let dado = pegarTempo();
		stats.set(userId, dados);
		socket.emit("atualizar_hora", (userId, dado))
	});

	//Usada para achar a latência
	socket.on('atualizar_hora', function(dado){
		let res;
		res = compararTempo(dado);
		Latência.set(peers,res);
		
	});
	

});

//Print da latência e stats no console
setInterval(() => {
	if(Latência.size>1) console.log(Latência);
},5000) 

