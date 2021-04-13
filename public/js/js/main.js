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

        
        // Quando dou submit na mensagem:
        $("form#chat").submit(function(e){//TODO
            e.preventDefault(); // para não enviar o formulário 

            var mensagem = $(this).find("#texto_mensagem").val();
            var usuário = $("#lista_usuários").val(); // Usuário selecionado na lista lateral direita

            // Evento acionado no servidor para o envio da mensagem
            // junto com o nome do usuário selecionado da lista
            socket.emit("enviar_mensagem", {msg: mensagem, usu: usuário}, function(){//TODO
                $("form#chat #texto_mensagem").val("");
            });
            
        }); 



        //When someone connect:
        this.socket.on('connect', () => {
            this.localUserId = this.socket.id;
            //logando o id do user que entrou.
            console.log('localUser', this.localUserId);


            $("form#login").submit(function(e){
                e.preventDefault();
                //TODO: não funciona this.socket.emit
                // Evento enviado quando o usuário insere um apelido

                
                socket.emit('entrar', $(this).find("#apelido").val(), function(valido) { 
                    if(valido){
                        
                        // Caso não exista nenhum usuário com o mesmo nome, o painel principal é exibido
                        $("#acesso_usuário_hide").hide();
                        $("#sala_chat").show();
                    }else{
                        // Do contrário o campo de mensagens é limpo e é apresentado um alert
                        $("#acesso_usuário").val("");
                        alert("Nome já utilizado nesta sala");
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
                    console.log(room.count + ' Guys in the room');
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
                var mensagem_formatada = $("<p />").text(dados.msg).addClass(dados.tipo);

                //Add the message
                $("#histórico_mensagens").append(mensagem_formatada);
                
                //Scroll the chat to the bottom.
                $('#histórico_mensagens')[0].scrollTop = $('#histórico_mensagens')[0].scrollHeight; 
            });


            this.socket.on("atualizar_usuários", function(usuários){
                $("#lista_usuários").empty();
                $("#lista_usuários").append("<option value=''>Todos</option>");
                    $.each(usuários, function(índice){
                    var opção_usuário = $("<option />").text(usuários[índice]);
                    $("#lista_usuários").append(opção_usuário);
                });
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

