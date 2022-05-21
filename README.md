# THREE-PCB
![ThreeJS PCB Animation](/assets/three-pcb.png)
A background design / experiment in ThreeJS. Hosted on my homepage at: [https://gperilli.dev/graphicswork/three-pcb/](https://gperilli.dev/graphicswork/three-pcb/).

## Downloading and Setting Up A Development Workspace

THREE-PCB here runs on HTML, CSS, and JS files - with JS modules which are supported by most modern browsers. 

The project code can be downloaded from this repository with a direct download, or alternatively, using a git clone command: git clone ``git@github.com:gperilli/three-pcb.git``.

## Installing node packages
This project uses npm for javascript packages. To use npm, please install node, and then npm. The packages can be installed by using the command `npm install` in the project directory. All javascript packages should appear in a newly created `node_modules` directory.

## Building production code
Webpack can be used to produce minified production javascript. `npm start` will run webpack which outputs the minified javascript into the `dist` directory.

## Using a Local Server

The Go Live feature in Visual Studio Code, or something like WAMP can be used to run and serve the code locally.
