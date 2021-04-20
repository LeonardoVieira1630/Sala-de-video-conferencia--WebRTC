/*
    +++Cliente to WebRTC_Mesh room+++
    To understand about how this code works, please take a look at the README in the project.
    
*/


class ClientMesh {

    //Variables that we will use in the code:
    constructor(){
        this.localStream;
        this.localUserId;
        this.connections = [];
        this.events = {};
    }
    


    //Internal Functions that we will call: 

    //Function to work with the the ice candidate:
    gotIceCandidate (fromId, candidate) {
        this.connections[fromId]
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.log('Error: ',e));
    }



    //Function to handle with the events:
    on(eventName, callback){
        if (!this.events[eventName]) {
          this.events[eventName] = [];
        }
    
        this.events[eventName].push(callback);
    }
    


    //Function to handle with the messages:
    emit(eventName, args){
        this.events[eventName].forEach((callback)=>{
            callback(args);
        });
    }



    //Main Functions: 

    //It will control the main part of the client (Signaling parts && Offer/ Answer && Connections).
    connectSocketToSignaling(mediaStream) {
        this.socket = io.connect();
        var socket = this.socket;// TODO

        
        
        

        var form = document.getElementById('chat');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            var mensagem = document.getElementById('texto_mensagem').value;
            var usuário = document.getElementById('lista_usuários').value; // Usuário selecionado na lista lateral direita

            // Evento acionado no servidor para o envio da mensagem
            // junto com o nome do usuário selecionado da lista
            socket.emit("enviar_mensagem", {msg: mensagem, usu: usuário}, function(){//TODO
                
                document.getElementById('texto_mensagem').value='';
            });




        });
          


        //When someone connect:
        this.socket.on('connect', () => {

            this.localUserId = this.socket.id;
            //logando o id do user que entrou.
            console.log('localUser', this.localUserId);


            //Pega o nome do usuário que entrou para coloca-lo no chat.
            var acesso = document.getElementById('login');
            acesso.addEventListener('submit', (event) => {

                //Faz "para" o envio do formulário.
                event.preventDefault();

                //Emit que alguém entrou 
                socket.emit('entrar', document.getElementById('apelido').value , function(valido) { 

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


            
            this.socket.on('user-joined', (room) => { 
                const clients = room.clients;
                const joinedUserId = room.joinedUserId;
                console.log(joinedUserId, ' joined');
          

                clients.forEach((userId) => {
                    //Who is entering now, goes inside the if.
                    //The others (that are already in the room) don't go inside.
                    if (!this.connections[userId]) {

                        const pc = new RTCPeerConnection(mediaStream);
                        let track = 0;
                        
                        //console.log('Passou aqui ----');

                        pc.ontrack = evt => {

                            // add the first track to my corresponding user.                            
                            if(track==0){
                              pc.addTrack(evt.track);
                              track=1;
                            }

                            // add the second track to my corresponding user.                           
                            else{
                                this.emit('remoteStream', {stream: mediaStream, id:userId})
                                pc.addTrack(evt.track);
                            }
                            
                        }
                        
                        // track receives objects of type MediaStreamTrack from the returned array
                        // by .getTracks. This addTrack function "calls" onTrack.
                        for(const track of mediaStream.getTracks()){
                            pc.addTrack(track);
                        }
                        


                        this.connections[userId] = pc;
                        this.connections[userId].onicecandidate = evt => {

                            if (evt.candidate) {
                                console.log(this.socket.id, ' Send candidate to ', userId);
                                this.socket.emit('candidate', 
                            {type: 'candidate', candidate: evt.candidate, toId: userId}); 
                            };
                        
                        };
                      
                    }
                });

                

                //With more then one, it runs and we send offers to connect

                if (room.count >= 2) {
                    const description = this.connections[joinedUserId].createOffer(); 
                    this.connections[joinedUserId].setLocalDescription(description)
                    .then(() => {
                        console.log(this.socket.id, ' Send offer to ', joinedUserId);
                        this.socket.emit('offer', { 
                            type: 'offer', 
                            toId: joinedUserId, 
                            description: this.connections[joinedUserId].localDescription
                        });
                    })
                    .catch(e => console.log('Error: ',e));
                    
                }  

            });

            

            //Remove the video from the guy that is going out.
            this.socket.on('user-left', (userId) => {
                this.emit('user-left', userId);
            });

            

            this.socket.on('candidate', (data) => {
                const fromId = data.fromId;
                //Works with the candidate part:
                if (fromId !== this.localUserId) {
                   console.log(this.socket.id, ' Receive Candidate from ', fromId);
                   if (data.candidate) {
                    this.gotIceCandidate(fromId, data.candidate);
                   }
               };     
            });


            
            this.socket.on('offer', (data) => {
                const fromId = data.fromId;
                if (data.fromId !== this.localUserId && data.description) { 

                    const connection = this.connections[fromId];
                    console.log(this.socket.id, ' Receive offer from ', fromId);
                    connection.setRemoteDescription(new RTCSessionDescription(data.description));

                    const description  = connection.createAnswer();
                    connection.setLocalDescription(description)
                    .then(() => {this.socket.emit('answer',{
                        type: 'answer', 
                        toId: fromId, 
                        description: connection.localDescription 
                        })
                    })
                    .catch(e => console.log('Error: ',e))
                     
                }     
            })



            this.socket.on('answer', (data) => {
                if (data.fromId !== this.localUserId && data.description ) { 

                    const fromId = data.fromId;
                    console.log('Resposta recebida de:' ,fromId);
                    const connection = this.connections[fromId];

                    connection.setRemoteDescription(new RTCSessionDescription(data.description))
                    .catch(e => console.log('Error: ',e));
                }
            });  


           
            // Resposta ao envio de mensagens do servidor
            this.socket.on("atualizar_mensagens", function(dados){

                // novo parágrafo.
                var new_paragraph = document.createElement('p'); 
                
                //Definindo a classificação da mensagem.
                if(dados.tipo == 'sistema') new_paragraph.setAttribute('class', 'sistema');
                else new_paragraph.setAttribute('class', 'privada');

                //add msg para o paragrafo.            
                new_paragraph.appendChild(document.createTextNode(dados.msg)); 

                //add novo paragrafo com msg para o histórico.
                var histórico = document.getElementById('histórico_mensagens');
                histórico.appendChild(new_paragraph);

                //Scroll the chat to the bottom.
                histórico.scrollTop = histórico.scrollHeight;
                

            });


            this.socket.on("atualizar_usuários", function(usuários){

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

            }); 


        });

    }


   
    // Starting the client: 

    //Function to start every thing:
    startLocalStream() {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        .then(mediaStream =>{
            this.localStream = mediaStream;
            this.emit('localStream', mediaStream);
            this.connectSocketToSignaling(mediaStream);
            console.log("Pegando userMedia com constraints:", { video: true,audio: true});
            
        })
        .catch(e => console.log('Error: ',e));
        
    }
} 

