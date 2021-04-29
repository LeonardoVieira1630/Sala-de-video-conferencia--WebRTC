/*
    +++Cliente to WebRTC_Mesh room+++
    To understand about how this code works, please take a look at the README in the project.
    
*/



class ClientMesh {
  //Variables that we will use in the code:
  constructor() {
    this.localStream;
    this.localUserId;
    this.connections = [];
    this.events = {};
    this.dataChannels = []; //Leo
  }

  //Internal Functions that we will call:

  //Function to work with the the ice candidate:
  gotIceCandidate(fromId, candidate) {
    this.connections[fromId]
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((e) => console.log("Error: ", e));
  }

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

  
  sendMessage(message) {
    console.log(message);
    /*
    const iterator = this.dataChannels.values();
    for (let i = 0; i < this.dataChannels.size; i++) { //Leo
      const dc = iterator.next().value;
      dc.send(message);
    }
    */
  }
  

  //Main Functions:

  //It will control the main part of the client (Signaling parts && Offer/ Answer && Connections).
  connectSocketToSignaling(mediaStream) {
    this.socket = io.connect();
    var socket = this.socket; // TODO

    //When someone connect:
    this.socket.on("connect", () => {
      this.localUserId = this.socket.id;
      //logando o id do user que entrou.
      console.log("localUser", this.localUserId);

      this.socket.on("user-joined", (room) => {
        const clients = room.clients;
        const joinedUserId = room.joinedUserId;
        console.log(joinedUserId, " joined");

        //const userId = joinedUserId;
        clients.forEach((userId) => {
          

          
          //Who is entering now, goes inside the if.
          //The others (that are already in the room) don't go inside.
          if (!this.connections[userId] && userId != this.socket.id) {
            //

            //const userId = joinedUserId;

            console.log(this.localUserId)

            console.log('entra no if')
            const pc = new RTCPeerConnection(mediaStream);
            let track = 0;

            //console.log('Passou aqui ----');

            pc.ontrack = (evt) => {
              // add the first track to my corresponding user.
              if (track == 0) {
                pc.addTrack(evt.track);
                track = 1;
              }

              // add the second track to my corresponding user.
              else {
                this.emit("remoteStream", { stream: mediaStream, id: userId });
                pc.addTrack(evt.track);
              }
            };

            // track receives objects of type MediaStreamTrack from the returned array
            // by .getTracks. This addTrack function "calls" onTrack.
            for (const track of mediaStream.getTracks()) {
              pc.addTrack(track);
            }

            //criando data channel do peer que acabou de entrar.
            const dc = pc.createDataChannel("teste1");

            dc.onopen = () => {
              console.log("data channel aberto");
            };

            dc.onmessage = (evt) => {
              this.emit("message", evt.data);
            };

            dc.onclose = () => {
              console.log("Data channel fechado");
            };
            this.dataChannels[userId] = dc;

            
            this.connections[userId] = pc;
            this.connections[userId].onicecandidate = (evt) => {
              if (evt.candidate && this.socket.id != userId) {
                console.log(this.socket.id, " Send candidate to ", userId);
                this.socket.emit("candidate", {
                  type: "candidate",
                  candidate: evt.candidate,
                  toId: userId,
                });
              }
            };
          }


          //console.log(this.connections);
        });

        //With more then one, it runs and we send offers to connect

        if (this.socket.id != joinedUserId) {
          //

          /*this.connections[this.socket.id].onicecandidate = (evt) => {
            if (evt.candidate && this.socket.id != joinedUserId) {
              console.log(this.socket.id, " Send candidate to ", joinedUserId);
              this.socket.emit("candidate", {
                type: "candidate",
                candidate: evt.candidate,
                toId: joinedUserId,
              });
            }
          };*/



          const description = this.connections[joinedUserId].createOffer();

          this.connections[joinedUserId]
            .setLocalDescription(description)
            .then(() => {
              console.log(this.socket.id, " Send offer to ", joinedUserId);
              this.socket.emit("offer", {
                type: "offer",
                toId: joinedUserId,
                description: this.connections[joinedUserId].localDescription,
              });
            })
            .catch((e) => console.log("Error: ", e));
        }
      });

      //Remove the video from the guy that is going out.
      this.socket.on("user-left", (userId) => {
        this.emit("user-left", userId);
      });


      this.socket.on("candidate", (data) => {
        const fromId = data.fromId;
        //Works with the candidate part:
        console.log(this.socket.id, " Receive Candidate from ", fromId);
        if (data.candidate) {
          this.gotIceCandidate(fromId, data.candidate);
        }
      
      });

      this.socket.on("offer", (data) => {
        const fromId = data.fromId;
        if (data.fromId !== this.localUserId && data.description) {
          const connection = this.connections[fromId];
          console.log(this.socket.id, " Receive offer from ", fromId);
          connection.setRemoteDescription(
            new RTCSessionDescription(data.description)
          );

          const description = connection.createAnswer();
          connection
            .setLocalDescription(description)
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

      this.socket.on("answer", (data) => {
        if (data.fromId !== this.localUserId ) {
          const fromId = data.fromId;
          console.log("Resposta recebida de:", fromId);
          const connection = this.connections[fromId];

          connection
            .setRemoteDescription(new RTCSessionDescription(data.description))
            .catch((e) => console.log("Error: ", e));
        }
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
    });
  }

  // Starting the client:

  //Function to start every thing:
  startLocalStream() {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
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

