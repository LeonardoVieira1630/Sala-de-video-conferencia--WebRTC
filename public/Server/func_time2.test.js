
//Segunda parte do teste das funções de tempo. Essa func esta separada
//pois depende que pegarTempo esteja mockada.
const {compararTempo} = require('./func_time2');

jest.mock('./func_time.js')

describe('Segunda parte dos testes de funções de tempo.', ()=>{
	it('Testando o funcionamento de compararTempo', ()=>{
		let hora ="0000";
		expect(compararTempo(hora)).toEqual(0)
	})
})
