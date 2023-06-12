//Contem as funções do server que manipulam o tempo.

const {newDate} = require('./func_info');


//Pega o tempo atual
function pegarTempo(){
	const dataAtual = newDate();

	const segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();
	const milliseconds = (dataAtual.getMilliseconds()<10 ? '0' : '') + dataAtual.getMilliseconds();

	const obj=[segundo, milliseconds];
	const dataFormatada = segundo + milliseconds ;
	return dataFormatada;
		
}
exports.pegarTempo = pegarTempo;


// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual(){
	const dataAtual = newDate();
	const dia = (dataAtual.getDate()<10 ? '0' : '') + dataAtual.getDate();
	const mes = ((dataAtual.getMonth() + 1)<10 ? '0' : '') + (dataAtual.getMonth() + 1);
	const ano = dataAtual.getFullYear();
	const hora = (dataAtual.getHours()<10 ? '0' : '') + dataAtual.getHours();
	const minuto = (dataAtual.getMinutes()<10 ? '0' : '') + dataAtual.getMinutes();
	const segundo = (dataAtual.getSeconds()<10 ? '0' : '') + dataAtual.getSeconds();

	const dataFormatada = dia + "/" + mes + "/" + ano + " " + hora + ":" + minuto + ":" + segundo;

	return dataFormatada;
}
exports.pegarDataAtual = pegarDataAtual;


