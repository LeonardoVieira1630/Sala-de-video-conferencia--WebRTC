//Contem os testes das funções que utilizam tempo .

jest.mock('./func_info.js')



const {pegarTempo, pegarDataAtual} = require('./func_time');


describe('Testes para as funções que trabalham com o tempo', ()=> {
	it('Testando o funcionamento de pegarTempo.', ()=> {
		expect(pegarTempo()).toEqual("00666")
	})
	
	it('Testando o funcionamento de pegarDataAtual.', ()=>{
		expect(pegarDataAtual()).toEqual("31/10/2020 21:00:00")
	})

})