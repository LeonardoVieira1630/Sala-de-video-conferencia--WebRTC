# Sala WebRTC-Mesh:

<p align="center">
<img src="https://img.shields.io/badge/contributors-1-brightgreen"/>
<img src="https://img.shields.io/badge/version-1.0.0-blue"/>
<img src="https://img.shields.io/aur/last-modified/:WebRTC-Mesh"/>
<img src="https://img.shields.io/aur/maintainer/:Ffquenome"/>
</p>



# What is this for?

This project is a a WebRTC - Mesh room. In other words, this is a videoconference room that uses Mesh architecture in its construction.

-> Videoconference room.

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

Inthe terminal type this:

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

Start the aplication and sinalization:

#### **Exemplo**

```javascript
cm.startLocalStream();
```
