
//Pegando o webdriver do selenium
const {Builder, By, Key, Util} = require('selenium-webdriver');

//Pegando funções auxiliares.
const {load_lat, getCapabilities, load_stats, sleep} = require('./func_test_main')
let driver1, driver2;


//Func que abre os dois peers para a execução dos testes.
async function peers (){
    //Abrindo chrome e firefox
    driver1 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver1.get('http://localhost:3000/');
    await sleep(1000);
    await driver1.findElement(By.name('apelido')).sendKeys('Teste1', Key.RETURN);


    driver2 = await new Builder().withCapabilities(getCapabilities('chrome')).build();
    await driver2.get('http://localhost:3000/');
    await sleep(1000);

    await driver2.findElement(By.name('apelido')).sendKeys('Teste2 ', Key.RETURN);
    //await driver2.findElement(By.name('apertar')).click();

    return [driver1, driver2]

}


describe('Testes automatizados', ()=>{

    //Aumentando o valor máximo de simulação
    jest.setTimeout(15000);


    it('Testando abrir dois peers de maneira automatizada.', async ()=>{

        [driver1, driver2] = await peers();
        expect(driver1).toBeDefined()
        expect(driver2).toBeDefined()
 
    })


    it('Testando troca de mensagens pelo chat.', async ()=>{

        //Escrevendo mensagem 
        await driver1.findElement(By.name('texto_mensagem')).sendKeys('Opa, tudo bem ai?', Key.RETURN);
        // para se o chrome for enviar //await driver1.findElement(By.name('b_envia_msm')).click();
        const msm = await driver2.findElement(By.name('histórico_mensagens')).findElement(By.className('privada')).getText();

        expect(msm).toMatch('Teste1 diz: Opa, tudo bem ai?');
    
    }, 120000)


    it('Testando latência', async ()=>{

        //Espera 2000s para abrir as páginas certinho.
        await sleep(1000)
        let lat = await load_lat();

        //Verificando se a resposta da url pe condizente.
        expect(lat.length).toEqual(4)

        //lat[1] é a latência do primeiro peer e lat[3] é a do segundo.
        expect(lat[1]).toBeLessThan(20);
        expect(lat[3]).toBeLessThan(20);

    })
    

    it('Testando estatísticas dos peers', async ()=>{

        //ATENÇÃO: Os stats só podem ser medidos no chrome
        await sleep(6000)
        let stats =  await load_stats();
        
        await driver1.quit();
        await driver2.quit();


        //Testando dados do primeiro peer
        let peer1 = Object.values(stats)[0];
        expect(peer1.packetsLost).toBeLessThan(100);
        expect(peer1.dataChannelsOpened).toEqual(1);
        expect(peer1.dataChannelsClosed).toEqual(0);
        expect(peer1.packetsReceived).toBeGreaterThan(90);
        expect(peer1.bytesReceived).toBeGreaterThan(10000);
        expect(peer1.bytesSent).toBeGreaterThan(10000);

        //Testando dados do segundo peer
        let peer2 = Object.values(stats)[0];
        expect(peer2.packetsLost).toBeLessThan(100);
        expect(peer2.dataChannelsOpened).toEqual(1);
        expect(peer2.dataChannelsClosed).toEqual(0);
        expect(peer2.packetsReceived).toBeGreaterThan(90);
        expect(peer2.bytesReceived).toBeGreaterThan(10000);
        expect(peer2.bytesSent).toBeGreaterThan(10000);

    })

})
