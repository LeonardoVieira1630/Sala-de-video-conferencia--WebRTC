//Contem as funções de inf que precisam ser mockadas para efetuar testes.

//mockando new date
function newDate(){
	const mockDate = new Date("2020-11-01T00:00:00.666Z");
	return mockDate
}

exports.newDate = newDate;

