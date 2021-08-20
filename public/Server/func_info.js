//Arquivo que contem as funções do servidor que gerenciam informações da API.

function newDate(){
	const dataAtual = new Date();
	return dataAtual
}

exports.newDate = newDate;



// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem, ultimas_mensagens){
	if(ultimas_mensagens.length > 5){
		ultimas_mensagens.shift();
	}
	ultimas_mensagens.push(mensagem);

	return ultimas_mensagens
};
exports.armazenaMensagem = armazenaMensagem;



//Aqui contem funções da parte de estatísticas do server.
function funcClients(usuários){
	let temp = new Map();
	usuários.forEach((socket, apelido)=>{
		if(socket.id) temp[apelido] = socket.id;
		//else temp[apelido] = socket;
		else temp.set(apelido, socket)
	})

	let obj = {
		'Os usuários na sala são': temp
	}
	if (!temp) return obj = 0;

	return temp
}
exports.funcClients = funcClients;



function funcStats(stats){

	let temp = new Map();
	
	stats.forEach((stat, userId)=>{
		if (userId == 'socket_test')	temp.set(userId, stat)
		else temp[userId] = stat;
	})

	let obj = {
		'As estatísticas dos users são ': temp
	}

	if (!temp) return obj = 0;
	//console.log(temp)
	return temp
}
exports.funcStats = funcStats;



function funcClientsId (usuários,stats,id){

	let obj;
	let temp = new Map();

	usuários.forEach((apelido, socket)=>{
		if(socket.id) temp[apelido] = socket.id;
		else temp[apelido] = socket

	})

	let sss;
	if (!temp[id.id] && !temp[id]) return  obj =0;
	else if(!temp[id.id]) sss = temp[id]
	else sss = temp[id.id] 
	let stat = stats.get(sss);


	obj = {
		'O usuário pedido é ': sss ,
		'Suas estatísticas são ': stat
	}
	return obj
}
exports.funcClientsId = funcClientsId;



function funcLength(nomes){
	let obj = {
		'Numero de clientes na sala atualmente' : Object.keys(nomes).length
	};
	return obj
}
exports.funcLength = funcLength;


function app(latencia){
	
	var lat
	if(latencia == 0){
		console.log(latencia)
		return lat
	}
	else{
		lat = latencia
		return lat
	}

}
exports.app = app;