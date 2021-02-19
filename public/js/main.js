//Variables and configuration -----------------------------------------------------------------
    
    //Media configuration:
    const mediaStreamConstraints = {
        video: true,
        audio: true
    };


    //Some variables that i will need to use:
    const localVideo = document.getElementById('localVideo');
    let localStream;
    let localUserId;
    let connections = [];
    //const socket = io.connect('http://localhost:3000', { secure: true });
    

//Functions that we will call: ----------------------------------------------------------------

    //Function to get the joiners stream:
    function gotRemoteStream(event, userId) {

        //Criating and configurating the new video.
        let remoteVideo  = document.createElement('video');
        remoteVideo.setAttribute('data-socket', userId);
        remoteVideo.srcObject   = event.stream;
        remoteVideo.autoplay    = true;
        remoteVideo.muted       = true; // to dismute //Leo
        remoteVideo.playsinline = true;

        //Puting it on the html page:
        document.querySelector('.videos').appendChild(remoteVideo);
    }


    //Function to work with the the ice candidate:
    function gotIceCandidate(fromId, candidate) {
        connections[fromId]
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(handleError);
    }


    //Function to start the local stream:
    function startLocalStream() {
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(getUserMediaSuccess)
        .then(connectSocketToSignaling)
        .catch(handleError);
    }


    
    //Called when we have a new candidate.
    function gotMessageFromSignalingAndItIsCandidate(socket, data) {
        const fromId = data.fromId;
        if (fromId !== localUserId) {
            console.log(socket.id, ' Receive Candidate from ', fromId);
            if (data.candidate) {
                gotIceCandidate(fromId, data.candidate);
            }
                
        };
    };
   

    //Called when we have an offer -> do an answer
    function gotMessageFromSignalingAndItIsSdp(socket, data) {
        const fromId = data.fromId;
        if (fromId !== localUserId) {
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
                        }).catch(handleError);
                    }
                })
                .catch(handleError);
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



//Main maneger of functions: ----------------------------------------------------------------


    function connectSocketToSignaling() {
        const socket = io.connect();

        //When someone connect:
        socket.on('connect', () => {
            localUserId = socket.id;
            //logando o id do user que entrou.
            console.log('localUser', localUserId);


            socket.on('user-joined', (room) => { //room=data
                const clients = room.clients;
                const joinedUserId = room.joinedUserId;
                console.log(joinedUserId, ' joined');

                
                clients.forEach((userId) => {
                    //Who is entering now, goes inside the if.
                    //The others (that are aredy in the room) dont go inside.
                    if (!connections[userId]) {
                        connections[userId] = new RTCPeerConnection(mediaStreamConstraints);
                        connections[userId].onicecandidate = () => {

                            //This part need to be fixed //Leo
                            if (event.candidate) {
                                console.log(socket.id, ' Send candidate to ', userId);
                                socket.emit('signaling', 
                                {type: 'candidate', candidate: event.candidate, toId: userId}); 
                            };
                            
                            
                        };

                        //New video to the new guy.
                        connections[userId].onaddstream = () => {
                            gotRemoteStream(event, userId);
                            
                        };
                        
                        //Adding the new video.
                        connections[userId].addStream(localStream);
                        
                    }

                });


                //With more then one, it runs and we send offers to connect
                if (room.count >= 2) {
                    console.log(room.count + ' Guys in the room');
                    connections[joinedUserId].createOffer()
                    .then((description) => {
                        connections[joinedUserId].setLocalDescription(description)
                        .then(() => {
                            console.log(socket.id, ' Send offer to ', joinedUserId);
                            socket.emit('signaling', {
                                toId: joinedUserId,
                                description: connections[joinedUserId].localDescription,
                                type: 'sdp'
                            });
                        })
                        .catch(handleError);
                    });
                }
                

            });

            
            //Remove the video from the guy that is going out.
            socket.on('user-left', (userId) => {
                let video = document.querySelector('[data-socket="'+ userId +'"]');
                video.parentNode.removeChild(video);
            });

            
            //Maneger of the signaling messages
            socket.on('signaling', (data) => {
                switch (data.type) {
                    case 'candidate':
                    gotMessageFromSignalingAndItIsCandidate(socket, data);
                    case 'sdp': //Session Description Protocol
                    gotMessageFromSignalingAndItIsSdp(socket, data);
                }
            });
        });
    }



// Starting the code: -----------------------------------------------------------------------
    startLocalStream();