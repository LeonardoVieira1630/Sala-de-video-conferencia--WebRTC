//Código da parte do servidor.


const express = require('express'); // pegando a biblioteca express
const server = express();
const http = require('http').Server(server); //server recebendo express
const io = require('socket.io')(http);
const usuários = new Map(); // Lista de usuários (nome + socket.id)
const nomes = []; // Contem os nomes. Usada também para o numero de users na sala.
const stats = new Map(); //Contem as estatísticas Do WebRTC de cada connection.
let ultimas_mensagens = []; // Lista com ultimas mensagens enviadas no chat

server.use(express.json());


//Pegando os clientes da sala.
server.get("/clients", function(req,res){	 
	
	let temp = new Map();
	usuários.forEach((socket, apelido)=>{
		temp[apelido] = socket.id;
	})

	if (!temp) return res.status(204).json();

	let obj = {
		'Os usuários na sala são': temp
	}
	res.json(obj);

});

//Pegando as stats dos clientes da sala.
server.get("/stats", function(req,res){	

	let temp = new Map();
	stats.forEach((stat, userId)=>{
		temp[userId] = stat;
	})

	if (!temp) return res.status(204).json();

	let obj = {
		'As estatísticas dos users são ': temp
	}
	res.json(obj);
});


//Pegando um usuário específico da sala + suas stats.
server.get("/clients/:id", function(req,res){	

	let{ id } = req.params;

	if (!usuários.get(id)){
		let obj = 'Vixi, esse usuário não existe na sala.';
		if (!usuários[id]) return res.status(204).json();
		return res.json(obj);
	} 

	let temp = new Map();
	temp[id] = usuários.get(id).id;

	let stat = stats.get(temp[id]);

	let obj = {
		'O usuário pedido é ': temp ,
		'Suas estatísticas são ': stat
	}

	res.json(obj);

});


//Pegando a quantidade de pessoas na sala.
server.get("/length", function(req,res){
	let obj = {
		'Numero de clientes na sala atualmente' : Object.keys(nomes).length
	};
	
	res.json(obj);
});
 

server.use(express.static('public'));


//Porta onde esta sendo executado
http.listen(3000, () => {
  console.log('Server está la na porta 3000');
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
        
        io.to(data.toId).emit('offer', { fromId: socket.id, ...data });
    });

    socket.on('answer', function(data) { 
        io.to(data.toId).emit('answer', { fromId: socket.id, ...data });
    });


    socket.on('disconnect', function() {
		
        io.sockets.emit('user-left', socket.id);

        delete nomes[socket.apelido];
		usuários.delete(socket.apelido); 
		var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
		var obj_mensagem = {msg: mensagem, tipo: 'sistema'};


		// No caso da saída de um usuário, a lista de usuários é atualizada
		// junto de um aviso em mensagem para os participantes da sala		
		io.sockets.emit("atualizar_usuários", Object.keys(nomes));
		io.sockets.emit("atualizar_mensagens", obj_mensagem);

		armazenaMensagem(obj_mensagem);
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
			usuários.get(usuário).emit("atualizar_mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
	});


	socket.on("stats", function(dados, userId){
		functionStats(dados,userId);
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


function functionStats(dados,userId){

	const peers = {};
	peers.userId = userId;
	peers.stats = dados;
	
	stats.set(peers.userId, peers.stats);

};
