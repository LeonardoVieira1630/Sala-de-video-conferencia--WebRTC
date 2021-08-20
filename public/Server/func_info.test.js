//Contem testes da parte das funções do servidor que gerenciam informações da API.

const {funcClients, funcStats, funcClientsId, funcLength, armazenaMensagem} = require('./func_info');


describe('Teste das funções da parte estatística e informações da API.', ()=>{

	it('Testando funcClients.', ()=>{

		let usuários = new Map();
		let socket = 'id_socket'
		let lba = 'teste_nome'
		usuários.set(socket, lba);
		expect(funcClients(usuários).has('id_socket')).toEqual(true)

	})
	it('Testando funcStats.', ()=>{

		let stats = new Map
		stats.set("socket_test", {"localCandidateId":"RTCIceCandidate_mq91Yb5m",
		"remoteCandidateId":"RTCIceCandidate_R9IcpdXY","packetsLost":0,
		"totalEncodeTime":18.157,"dataChannelsOpened":1,"dataChannelsClosed":0,
		"packetsReceived":464,"packetsSent":482,"bytesSent":453539,"bytesReceived":429132})
		expect(funcStats(stats).has('socket_test')).toEqual(true)

	})
	it('Testando funcClientsId.', ()=>{

		let id = 'teste_nome';

		let stats = new Map
		stats.set("id_socket", {"localCandidateId":"RTCIceCandidate_mq91Yb5m",
		"remoteCandidateId":"RTCIceCandidate_R9IcpdXY","packetsLost":0,
		"totalEncodeTime":18.157,"dataChannelsOpened":1,"dataChannelsClosed":0,
		"packetsReceived":464,"packetsSent":482,"bytesSent":453539,"bytesReceived":429132})
		
		let usuários = new Map();
		let socket = 'id_socket'
		let lba = 'teste_nome'
		usuários.set(socket, lba);
		expect(funcClientsId(usuários,stats,id))
		.toEqual({"O usuário pedido é ": "id_socket", 
		"Suas estatísticas são ": {"bytesReceived": 429132,
		"bytesSent": 453539, "dataChannelsClosed": 0,
		"dataChannelsOpened": 1, "localCandidateId": "RTCIceCandidate_mq91Yb5m", 
		"packetsLost": 0, "packetsReceived": 464, "packetsSent": 482, 
		"remoteCandidateId": "RTCIceCandidate_R9IcpdXY", "totalEncodeTime": 18.157}});
		
	})
	it('Testando funcLength', ()=>{
		let nomes = ['leo', 'teste', 'jão']
		expect(funcLength(nomes)).toEqual({"Numero de clientes na sala atualmente": 3});
	})
	it('Testando funcionamento de armazenaMensagem.', ()=>{
		let mensagem = 'mensagem2';
		let ultimas_mensagens = ['Mensagem0', 'mensagem1'];
		expect(armazenaMensagem(mensagem, ultimas_mensagens)).toEqual(["Mensagem0", "mensagem1", "mensagem2"])
	})
	
})