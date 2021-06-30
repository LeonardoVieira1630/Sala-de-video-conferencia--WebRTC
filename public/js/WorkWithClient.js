
//Variables that we will use to work with the client:
const localVideo = document.getElementById('localVideo');
const room = 'Sala-do-leo'; //prompt("Enter room name:");
const cm = new ClientMesh(room);


//Getting the user media:
function mediaOfTheUser(mediaStream) {
    localVideo.srcObject = mediaStream;
}


//Function to get the remote stream:
function remoteStream (evt) {    

    //Creating and Setting the new video.
    const remoteVideo  = document.createElement('video');
    remoteVideo.setAttribute('data-socket', evt.id);
    remoteVideo.srcObject   = evt.stream;
    remoteVideo.autoplay    = true;
    remoteVideo.muted       = true; 
    remoteVideo.playsinline = true;

    //Putting it on the html page:
    document.querySelector('#videoRemoto').appendChild(remoteVideo);
}


//Removing the user that is going out the room:
function removeFromHtml(userId) {
    let video = document.querySelector('[data-socket="'+ userId +'"]');
    video.parentNode.removeChild(video);
}



//Chat: 

var form = document.getElementById("chat");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  var mensagem = document.getElementById("texto_mensagem").value;
  var usuário = document.getElementById("lista_usuários").value; // Usuário selecionado na lista lateral direita

  // Evento acionado no servidor para o envio da mensagem
  // junto com o nome do usuário selecionado da lista
  cm.socket.emit( "enviar_mensagem", { msg: mensagem, usu: usuário }, () => {
      document.getElementById("texto_mensagem").value = "";
    }
  );

});




//Pega o nome do usuário que entrou para coloca-lo no chat.
var acesso = document.getElementById('login');
acesso.addEventListener('submit', (event) => {

    //Faz "para" o envio do formulário.
    event.preventDefault();

    //Emit que alguém entrou 
    cm.socket.emit('entrar', document.getElementById('apelido').value , function(valido) { 

        //Verifica a validade do nome digitado.
        if(valido){
            // Caso não exista nenhum usuário com o mesmo nome, o painel principal é exibido
            document.getElementById('acesso_usuário_hide').style.display = 'none';
            document.getElementById('sala_chat').style.display = 'block';

        }else{
            // Do contrário o campo de mensagens é limpo e é apresentado um alert
            document.getElementById('acesso_usuário').value='';
            alert("Não é possível entra na sala com esse nome :/ ");
        }
    });

});



//Chamada para atualizar as mensagens da sala:
function atualizar_mensagens (dados) {
  // novo parágrafo.
  var new_paragraph = document.createElement("p");

  //Definindo a classificação da mensagem.
  if (dados.tipo == "sistema") new_paragraph.setAttribute("class", "sistema");
  else new_paragraph.setAttribute("class", "privada");

  //add msg para o paragrafo.
  new_paragraph.appendChild(document.createTextNode(dados.msg));

  //add novo paragrafo com msg para o histórico.
  var histórico = document.getElementById("histórico_mensagens");
  histórico.appendChild(new_paragraph);

  //Scroll the chat to the bottom.
  histórico.scrollTop = histórico.scrollHeight;
 
}


//Chamada para atualizar os usuários da sala:
function atualizar_usuários (usuários){

    //Pegando a lista de usuários no html.
    var lista = document.getElementById('lista_usuários');

    //Limpando a lista de usuários.
    lista.options.length = 0;


    //Criando options para os usuários.
    var new_option = document.createElement('option'); 
    new_option.setAttribute('class', 'font_participantes');

    //Escrevendo título.
    new_option.appendChild(document.createTextNode('Participantes:'));
    lista.appendChild(new_option);

    console.log('=> Há ' + usuários.length + ' usuários na sala. <=')
    
    //Colocando os users no html um por um.
    var i;
    for ( i = 0; i < usuários.length; i++){
        var option_user = document.createElement('option');
        option_user.setAttribute('class', 'font_users');
        option_user.appendChild(document.createTextNode(usuários[i]));
        lista.appendChild(option_user);
    }

}




//Starting the client
cm.startLocalStream();

    
cm.on('localStream', evt=>{
    mediaOfTheUser(evt);
});


cm.on('remoteStream', (evt)=>{
    remoteStream(evt);
});


cm.on('user-left', evt=>{
    removeFromHtml(evt);
});


cm.on("atualizar_mensagens", (evt) => {
  atualizar_mensagens(evt);
});

cm.on("atualizar_usuários", (evt) => {
  atualizar_usuários(evt);
});
