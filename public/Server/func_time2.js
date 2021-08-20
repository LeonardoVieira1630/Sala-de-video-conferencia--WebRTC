const {pegarTempo} = require('./func_time');


//Compara o tempo entre a hora atual e a hora anterior
function compararTempo(hora){
	const horaAqui = pegarTempo();
    //let conta = horaAqui + "-" + hora;
    let res = (horaAqui-hora)/2;

	if(res<0){
		let temp = horaAqui*10-hora;
		res = temp;
	}
	return res; 
}

exports.compararTempo = compararTempo;