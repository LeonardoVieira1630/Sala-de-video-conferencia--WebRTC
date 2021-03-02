# Sala WebRTC-Mesh:


<p align="center">
<img src="https://img.shields.io/badge/contributors-1-brightgreen"/>
<img src="https://img.shields.io/badge/version-1.0.0-blue"/>
<img src="https://img.shields.io/github/languages/count/Ffquenome/WebRTC-Mesh"/>
</p>


# What is this for?

This project is a a WebRTC - Mesh room. In other words, this is a video conferences room that uses Mesh architecture in its construction.

-> Video conference room.

-> Mesh architecture.

-> Video and audio.

-> WebRTC

## Modules and requirements:

:warning: Node.js

:warning: Socket.io

:warning: Express


## Installation

In the terminal, clone the project:

```bash
 git clone https://github.com/Ffquenome/WebRTC-Mesh.git
```
After it, download the modules:


```bash
 npm i
```


## Putting it to work!!

In the terminal type this:

```python
  Node index.js
```

This way, you will start the server. 

Now open: http://localhost:8080/ in work browser and that is it. :punch:


## What is each file?

We basically have 4 four main files:

1- Main.js (will contain the client part).

2- WorkWithClient.js (will contain the code that will manage the client's part).

3- index.html ("Front-end" part of the room).

4- index.css ("Front-end" part of the room). 



## Methods:
### startLocalStream()

Start the application and signalization:

#### **Exemple**

```javascript
cm.startLocalStream();
```

### emit(eventName, args)

Emits an event determined by _eventName_, with the arguments passed in _args_.

&nbsp;

| Parameters      | Description                                           |
| --------------- | ------------------------------------------------------|
| _**eventName**_ | String with the name of de event that will be emitted  |
| _**args**_      | Args that will be emitted with the event               |

&nbsp;


#### **Exemple**

In this exemple, we emit _user-left_ with the user id in _args_.

```javascript
   this.emit('user-left', userId);
```

### on(eventName, callback)

Listen _eventName_ and execute a function passed in _callback_ with de args passed by the método **emit()**.

&nbsp;
| Parameters      | Description                                           |
| --------------- |-------------------------------------------------------|
| _**eventName**_ |String with the name of the event tha will be executed.|
| _**callback**_  |This function will be executed when the event is emitted. This function has the argument _args_ passed by the método **emit()**|

#### **Exemple**

 In this example, the _localStream_ event is listened to and a handleUserMedia function is performed with the evt argument, which, according to the _emit () _ method example, is _mediaStream_.

```javascript
cml.on("localStream", (evt) => {
  handleUserMedia(evt);
});
```

//////////////////////////////////////////////////////////////////////////
## **Events**


### 'RemoteStream'

This event is triggered when obtaining a remote stream. It receives an _MediaStream_ with an audio and video stream from the local peer as an argument.

&nbsp;

#### **Exemple**

In the exemple, the remote stream is received in the event and after ir, added in the DOM localVideo element.

```javascript

function RemoteStream (evt) {    
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


cm.on('remoteStream', (evt)=>{
    RemoteStream(evt);
})
```


### 'user-left'

This event is triggered when another peer disconnects from the room. It takes as an argument a string with the id of the peer that it disconnected.

&nbsp;

#### **Exemple**

In the example, the peerId of the peer you disconnected is received and used to remove the video element from the container that has the _peerId_ as its id.

```javascript

function removeFromHtml(userId) {
    let video = document.querySelector('[data-socket="'+ userId +'"]');
    video.parentNode.removeChild(video);
}
cm.on('user-left', evt=>{
    removeFromHtml(evt);
});
```


