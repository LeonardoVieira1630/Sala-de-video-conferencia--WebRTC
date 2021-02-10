//Código principal
/*  */

//O que vai ser compartilhado.
const mediaStreamConstraints = {
    video: true
    //audio: true
};

//Leo:?
const offerOptions = {
    offerToReceiveVideo: 1,
};

const localVideo = document.getElementById('localVideo');
let localStream;
let localUserId;
let connections = [];

//função para pegar a stream do joiner
function gotRemoteStream(event, userId) {

    //"configurações" do novo vídeo.
    //Criando mais um video.
    let remoteVideo  = document.createElement('video');

    remoteVideo.setAttribute('data-socket', userId);
    remoteVideo.srcObject   = event.stream;
    remoteVideo.autoplay    = true;
    remoteVideo.muted       = true;
    remoteVideo.playsinline = true;

    //colocando na pagina.
    document.querySelector('.videos').appendChild(remoteVideo);
}

//Função para trabalhar com o ice protocol
function gotIceCandidate(fromId, candidate) {
    connections[fromId].addIceCandidate(new RTCIceCandidate(candidate)).catch(handleError);
}

//Função para começar o video/audio local
function startLocalStream() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(getUserMediaSuccess)
        .then(connectSocketToSignaling).catch(handleError);
}



function connectSocketToSignaling() {
    const socket = io.connect('http://localhost:3000', { secure: true });
    //quando tiver uma conecção:
    socket.on('connect', () => {
        localUserId = socket.id;
        //logando o id do user que entrou.
        console.log('localUser', localUserId);
        socket.on('user-joined', (data) => {
            //Leo: ???
            const clients = data.clients;
            //Leo: id de quem entrou.
            const joinedUserId = data.joinedUserId;
            console.log(joinedUserId, ' joined');
            if (Array.isArray(clients) && clients.length > 0) {
                clients.forEach((userId) => {
                    //Leo: acho: se tem nova conecção:
                    if (!connections[userId]) {
                        connections[userId] = new RTCPeerConnection(mediaStreamConstraints);
                        connections[userId].onicecandidate = () => {
                            if (event.candidate) {
                                console.log(socket.id, ' Send candidate to ', userId);
                                socket.emit('signaling', { type: 'candidate', candidate: event.candidate, toId: userId });
                            }
                        };
                        // criando novo video.
                        connections[userId].onaddstream = () => {
                            gotRemoteStream(event, userId);
                        };
                        //Passando a variavel do video (que no caso vai ser local).
                        connections[userId].addStream(localStream);
                    }
                });

                //Leo:?????
                if (data.count >= 2) {
                    connections[joinedUserId].createOffer(offerOptions).then((description) => {
                        connections[joinedUserId].setLocalDescription(description).then(() => {
                            console.log(socket.id, ' Send offer to ', joinedUserId);
                            socket.emit('signaling', {
                                toId: joinedUserId,
                                description: connections[joinedUserId].localDescription,
                                type: 'sdp'
                            });
                        }).catch(handleError);
                    });
                }
            }
        });

        
        socket.on('user-left', (userId) => {
            let video = document.querySelector('[data-socket="'+ userId +'"]');
            video.parentNode.removeChild(video);
        });

        
        socket.on('signaling', (data) => {
            gotMessageFromSignaling(socket, data);
        });
    });
}

function gotMessageFromSignaling(socket, data) {
    const fromId = data.fromId;
    if (fromId !== localUserId) {
        switch (data.type) {
            case 'candidate':
                console.log(socket.id, ' Receive Candidate from ', fromId);
                if (data.candidate) {
                    gotIceCandidate(fromId, data.candidate);
                }
                break;

            case 'sdp':
                if (data.description) {
                    console.log(socket.id, ' Receive sdp from ', fromId);
                    connections[fromId].setRemoteDescription(new RTCSessionDescription(data.description))
                        .then(() => {
                            if (data.description.type === 'offer') {
                                connections[fromId].createAnswer()
                                    .then((description) => {
                                        connections[fromId].setLocalDescription(description).then(() => {
                                            console.log(socket.id, ' Send answer to ', fromId);
                                            socket.emit('signaling', {
                                                type: 'sdp',
                                                toId: fromId,
                                                description: connections[fromId].localDescription
                                            });
                                        });
                                    })
                                    .catch(handleError);
                            }
                        })
                        .catch(handleError);
                }
                break;

        }
    }
}

//Função para pegar o local video/audio
function getUserMediaSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

//Handler de erro
function handleError(e) {
    console.log(e);
    alert('Something went wrong.');
}

startLocalStream();