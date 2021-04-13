
//Variables that we will use to work with the client:
const localVideo = document.getElementById('localVideo');
const room = 'Sala-do-leo'; //prompt("Enter room name:");
const cm = new ClientMesh(room);
//const socket=0;


//Getting the user media:
function mediaOfTheUser(mediaStream) {
    localVideo.srcObject = mediaStream;
}


//Function to get the remote stream:
function remoteStream (evt) {    
    console.log('User id: ', evt.id);

    //Creating and Setting the new video.
    const remoteVideo  = document.createElement('video');
    remoteVideo.setAttribute('data-socket', evt.id);
    remoteVideo.srcObject   = evt.stream;
    remoteVideo.autoplay    = true;
    remoteVideo.muted       = true; 
    remoteVideo.playsinline = true;

    //Putting it on the html page:
    document.querySelector('.videos').appendChild(remoteVideo);
}


//Removing the user that is going out the room:
function removeFromHtml(userId) {
    let video = document.querySelector('[data-socket="'+ userId +'"]');
    video.parentNode.removeChild(video);
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

/*
cm.on('Manda', evt=> {
    console.log('chegou no cliente essa desgraçada');
});
*/


