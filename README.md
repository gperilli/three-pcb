# THREE-PCB
![ThreeJS PCB Animation](/assets/three-pcb.png)
A background design / experiment in ThreeJS.

## Downloading and Setting Up A Development Workspace

THREE-PCB here runs on HTML, CSS, and JS files - with JS modules which are supported by most modern browsers. I've left the JS modules from the THREE library in the jsm and build directories. 

The project code can be downloaded from this repository with a direct download, or alternatively, using a git clone command: git clone git@github.com:gperilli/three-pcb.git.

## Using a Local Server

The Go Live feature in Visual Studio Code, or something like WAMP can be used to run and serve the code locally. If using Visual Studio Code, the absolute url addresses pointing towards the jsm files need to be adjusted so that the Visual Studio Code server is able to serve the project. For example ``/three-pcb/jsm/stats.module.js`` will need to be changed to ``/jsm/stats.module.js``. Using something like WAMP server, the absolute url addresses should be left the same so that absolute file paths start from the base of the project.

## ``jsm/pcb-main.js``

The code that loads the pcb image and animates groups of it is in this file. There is also a shuffling function that detects when all the groups are aligned at the zero position, and then shuffles the items withtin each group. Simultaneously there is a glow effect controlled by a sine wave oscillator.