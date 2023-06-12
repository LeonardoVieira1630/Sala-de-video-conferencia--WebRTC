/*
  +++Cliente to WebRTC_Mesh room+++
  To understand about how this code works, please take a look at the README in the project.
    
*/


class ClientMesh{
  //Variables that we will use in the code:
  constructor() {
    this.localStream;
    this.localUserId;
    this.connections = new Map();
    this.events = {};
    this.dataChannels = new Map(); 
    this.remoteStreams = new Map();

  }

  //Internal Functions that we will call:


  //Function to handle with the events:
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
  }

  //Function to handle with the messages:
  emit(eventName, args) {
    this.events[eventName].forEach((callback) => {
      callback(args);
    });
  }

  gotIceCandidate(fromId, candidate) {
    this.connections.get(fromId)
    .addIceCandidate(new RTCIceCandidate(candidate))
  }
  
  sendMessage(message) {
    console.log(message);
    
    const iterator = this.dataChannels.values();
    for (let i = 0; i < this.dataChannels.size; i++) { //Leo
      const dc = iterator.next().value;
      dc.send(message);
    }
  }

  

  async creatingAnswerFunction(data, mediaStream){
    const fromId = data.fromId;
    this.connections.set(fromId,this.createConnection(fromId, mediaStream) );

    const connection = this.connections.get(fromId);
    console.log(this.socket.id, " Receive offer from ", fromId);

    await connection.setRemoteDescription(
      new RTCSessionDescription(data.description)
    );

    let description = await connection.createAnswer();

    await connection.setLocalDescription(description);
    
    this.socket.emit("answer", {
      type: "answer",
      toId: fromId,
      description: connection.localDescription,
    });
  }


  async creatingOfferFunction(pc, joinedUserId){
    let description = await pc.createOffer();

    await pc.setLocalDescription(description);
    
    console.log(this.socket.id, " Send offer to ", joinedUserId);
    this.socket.emit("offer", {
      type: "offer",
      toId: joinedUserId,
      description: pc.localDescription,  
    });
  };

  async callStats(pc, userId){ 
    //Parte de estatísticas
    const dadosIntervalo = new Object;
    const dadoInicial = {
      packetsLost: 0,
      packetsReceived: 0, 
      packetsSent: 0,
      bytesSent: 0,
      bytesReceived: 0,
      dataChannelsOpened: 0,
      dataChannelsClosed: 0,
      remoteCandidateId: null,
      localCandidateId: null,
      totalEncodeTime: 0, 

    };
    
    //Atualiza os stats e a latência a cada 1 seg.
    setInterval(() => {
      this.statistics(pc,userId,dadoInicial,dadosIntervalo);

    },1000) 

  }


  //Função para pegar as estatísticas do WebRTC
  async statistics(pc,userId,dadoInicial,dadosIntervalo){
    
    if (this.connections.get(userId)) {
      const stats = await pc.getStats(null); //Pegando todas as estatísticas da conexão.

      stats.forEach(report => {
        if ( report.type == "inbound-rtp" ){
          dadosIntervalo.packetsLost = report.packetsLost - dadoInicial.packetsLost;
          dadoInicial.packetsLost = report.packetsLost;
        } 
        if ( report.type == "transport" ){
          let rpr = report.packetsReceived;
          let rps = report.packetsSent;
          let rbs = report.bytesSent;
          let rbr = report.bytesReceived;

          dadosIntervalo.packetsReceived = rpr - dadoInicial.packetsReceived;
          dadosIntervalo.packetsSent = rps - dadoInicial.packetsSent;
          dadosIntervalo.bytesSent = rbs - dadoInicial.bytesSent;
          dadosIntervalo.bytesReceived =rbr - dadoInicial.bytesReceived;

          dadoInicial.packetsReceived = rpr;
          dadoInicial.packetsSent = rps;
          dadoInicial.bytesSent = rbs;
          dadoInicial.bytesReceived = rbr;
        } 
        if(report.type == "peer-connection"){
          dadosIntervalo.dataChannelsOpened = report.dataChannelsOpened;
          dadosIntervalo.dataChannelsClosed = report.dataChannelsClosed;

        }
        if(report.type == "candidate-pair"){
          dadosIntervalo.localCandidateId = report.localCandidateId;
          dadosIntervalo.remoteCandidateId = report.remoteCandidateId;
        }
        
        if(report.type == "outbound-rtp"){
          dadosIntervalo.totalEncodeTime = report.totalEncodeTime;
        }
        
      })
      this.socket.emit('stats',dadosIntervalo, userId);
    }  
  
  };


  //Main Functions:

  //Called to Create a new connection
  createConnection(userId, mediaStream) {
    const pc = new RTCPeerConnection();
    let track = 0;

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        console.log(this.socket.id, " Send candidate to ", userId);
        this.socket.emit("candidate", {
        type: "candidate",
        candidate: evt.candidate,
        toId: userId,
        });
      }
    };

    pc.ontrack = (evt) => {
      // add the first track to my corresponding user.
      const remoteStream = this.remoteStreams.get(userId);
      if (remoteStream) {
        remoteStream.addTrack(evt.track);
        track = 1;
      }
      
      // add the second track to my corresponding user.
      else {
        const remoteStream = new MediaStream;
        this.emit("remoteStream", { stream: remoteStream, id: userId });
        remoteStream.addTrack(evt.track);
        this.remoteStreams.set(userId, remoteStream);

      }
    };

    // track receives objects of type MediaStreamTrack from the returned array
    // by .getTracks. This addTrack function "calls" onTrack.
    for (const track of mediaStream.getTracks()) {
      pc.addTrack(track);
    }


    pc.ondatachannel = (evt) => {
      const dc = evt.channel;
      dc.onopen = () => {
        console.log("DataChannel aberto com ", userId );
      };
      dc.onmessage = (evt) => {
        this.emit("message", evt.data);
      };
      dc.onclose = () => {
        console.log("DataChannel fechado");
      };
      this.dataChannels.set(userId,dc);
    };

    this.connections.set(userId, pc);

    this.callStats(pc, userId);

    return pc;
  }
  
  
  //It will control the main part of the client (Signaling parts && Offer/ Answer && Connections).
  connectSocketToSignaling(mediaStream) {
    this.socket = io.connect();

    this.socket.on("user-joined", (room) => {

      const joinedUserId = room.joinedUserId;
      console.log(joinedUserId, " joined");        

      const userId = joinedUserId; 
      //Who is entering now, goes inside the if.
      //The others (that are already in the room) don't go inside.
      if (userId != this.socket.id) {
          
        const pc = this.createConnection(joinedUserId, mediaStream);

        //criando data channel do peer que acabou de entrar.
        const dc = pc.createDataChannel("teste1");

        dc.onopen = () => {
          console.log("Data channel aberto com ", joinedUserId);
        };

        dc.onmessage = (evt) => {
          this.emit("message", evt.data);
        };

        dc.onclose = () => {
          console.log("Data channel fechado");
        };
        this.dataChannels.set(userId,dc);

        this.connections.set(userId, pc);

        this.creatingOfferFunction(this.connections.get(userId) , joinedUserId);

      }
      
    });


    //Remove the video from the guy that is going out.
    this.socket.on("user-left", (userId) => {
      this.emit("user-left", userId);
      this.remoteStreams.delete(userId.id);
      this.dataChannels.delete(userId);
      if (userId == this.socket.id){
        this.connections.forEach(user => {
          this.connections.delete(user);
        })
        console.log('entra aqui')
      }
      else this.connections.delete(userId);

      console.log('Conexões do usuário: ',this.connections);
      console.log('DataChannels do usuário: ',this.dataChannels)
      

    });


    //Listening the candidate event.
    this.socket.on("candidate", (data) => {
      const fromId = data.fromId;
      //Works with the candidate part:
      console.log(this.socket.id, " Receive Candidate from ", fromId);
      
      if (data.candidate) {
        //this.gotIceCandidate(fromId, data.candidate);
        this.gotIceCandidate(fromId, data.candidate)
      }
    
    });


    //Listening the offer and create an answer.
    this.socket.on("offer", (data) => {
      //this.creatingAnswerFunction(data, mediaStream);  
      const fromId = data.fromId;
        if (data.description) {
          this.connections.set(fromId, this.createConnection(fromId, mediaStream));

          const connection = this.connections.get(fromId);
          console.log(this.socket.id, " Receive offer from ", fromId);
          connection.setRemoteDescription(
          new RTCSessionDescription(data.description)
          );

          connection.createAnswer()
          .then((description) => {
              return connection.setLocalDescription(description);
          })
          .then(() => {
              this.socket.emit("answer", {
              type: "answer",
              toId: fromId,
              description: connection.localDescription,
              });
          })
          .catch((e) => console.log("Error: ", e));

        }
    });


    //Listening the answer.
    this.socket.on("answer", (data) => {
      const fromId = data.fromId;
      console.log("Resposta recebida de:", fromId);
      const connection = this.connections.get(fromId);

      connection
      .setRemoteDescription(new RTCSessionDescription(data.description))
      .catch((e) => console.log("Error: ", e));
    });


    // Resposta ao envio de mensagens do servidor
    this.socket.on("atualizar_mensagens", (dados) => {
      //Mandando atualizar la no client.
      this.emit("atualizar_mensagens", dados);
    });

    //Resposta à atualização de usuários.
    this.socket.on("atualizar_usuários", (usuários) => { 
      //Mandando atualizar la no client.
      this.emit("atualizar_usuários", usuários);
    });

    
    this.socket.on("atualizar_hora", (dataFormatada) => {
      this.socket.emit("atualizar_hora", (dataFormatada))
    });
    

  }

 
  

  //Function to start every thing:
   startLocalStream() {

    navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true
      //{ width: 800, height: 600 } -> Ja tive que especificar por causa do firefox.
    })
    .then((mediaStream) => {
      this.localStream = mediaStream;
      this.emit("localStream", mediaStream);
      this.connectSocketToSignaling(mediaStream);
      console.log("Pegando userMedia com constraints:", {
        video: true,
        audio: true,
      });
    })
    .catch((e) => console.log("Error: ", e));
  }


}