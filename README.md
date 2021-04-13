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

-> Chat.

-> WebRTC

&nbsp;
## Modules and requirements:

-> Node.js

-> Socket.io

-> Express

&nbsp;
## Installation

In the terminal, clone the project:

```bash
 git clone https://github.com/Ffquenome/WebRTC-Mesh.git
```
After it, download the modules:

```bash
 npm i
```

&nbsp;
## Putting it to work!!

In the terminal type this:

```bash
  node index.js
```

This way, you will start the server. 

Now open: http://localhost:8080/ in work browser and that is it.

&nbsp;
## What is each file?

We basically have 4 four main files:

**1**- Main.js (will contain the client part).

**2**- WorkWithClient.js (will contain the code that will manage the client's part).

**3**- index.html ("Front-end" part of the room).

**4**- index.css ("Front-end" part of the room). 

&nbsp;

## Methods:
### **startLocalStream()**

Start the application and signalization:

&nbsp;
#### **Exemple**

```javascript
cm.startLocalStream();
```

&nbsp;
### **on(eventName, callback)**

Listen _eventName_ and execute a function passed in _callback_ with de args passed by the **emit()** function.
&nbsp;
| Parameters      | Type    | Description                                  |
| --------------- |-------- |----------------------------------------------|
| _**eventName**_ |String|String with the name of the event that will be executed.|
| _**callback**_  |Function|This function will be executed when the event is emitted. This function has the argument _args_ passed by the function **emit()**.|

&nbsp;
#### **Exemple**

 In this example, the _localStream_ event is listened to and a handleUserMedia function is performed with the evt argument, which, according to the _emit () _ method example, is _mediaStream_.

```javascript
cml.on("localStream", (evt) => {
  handleUserMedia(evt);
});
```
&nbsp;
## **Events**


### **'remoteStream'**

This event is triggered when obtaining a remote stream. It receives an _MediaStream_ with an audio and video stream from the local peer as an argument.

&nbsp;


| Parameters      |Type| Description                                           |
| --------------- |------|-------------------------------------------------------|
| _**evt**_       |Array| It is an array the has the media stream constraints {video: true, audio: true} and the id of the user that calls the event.|


&nbsp;
#### **Exemple**

In the exemple, the remote stream is received in the event and after ir, added in the DOM localVideo element.



``` javascript
cm.on('remoteStream', (evt)=>{
    remoteStream(evt);
})
```


The called function remoteStream is used like showed billow:
```javascript

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
```

&nbsp;
### **'user-left'**

This event is triggered when another peer disconnects from the room. It takes as an argument a string with the id of the peer that it disconnected.

&nbsp;


| Parameters      |Type| Description                                           |
| --------------- |--|---------------------------------------------------------|
| _**evt**_ |String| It is the id of the user the wants to exit the room.|


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


&nbsp;
### **'localStream'**

This event is triggered when the first user join the room. It takes the video and audio configurations as the argument and call a function to use it to be the user stream.

&nbsp;


| Parameters      |Type | Description                                           |
| --------------- |------|-------------------------------------------------------|
| _**evt**_ |Array  | It is an array the has the media stream constraints {video: true, audio: true}.|

&nbsp;


#### **Exemples**


```javascript
cm.on('localStream', evt=>{
    mediaOfTheUser(evt);
});
```

&nbsp;


Here, we can see the user stream being caught a specified by the media stream the is called when the event 'localStream' is triggered. 

```javascript
//Getting the user media:
function mediaOfTheUser(mediaStream) {
    localVideo.srcObject = mediaStream;
}
```
