import * as THREE from 'three';

import { GUI } from '/src/lil-gui.module.min.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SVGLoader } from '/node_modules/three/examples/jsm/loaders/SVGLoader.js';


const pcbMain = function () {
    let camera, stats;
			let composer, renderer, mixer, gui, guiData, clock;
			let group;
			class SvgSubGroup {
					constructor(n) {
						this.n = n;
						this.meshes = [];
						this.length = 0;
					}
				}
			let svgSubGroups = [];
			svgSubGroups[0] = new SvgSubGroup(70);
			svgSubGroups[1] = new SvgSubGroup(70);
			svgSubGroups[2] = new SvgSubGroup(70);
			svgSubGroups[3] = new SvgSubGroup(70);
			let paths;
			let slideOne;
			let slideTwo;
			let slideThree;
			let slideFour;
			let circuitGlow;
			
			const manager = new THREE.LoadingManager();	

			const params = {
				exposure: 1,
				bloomStrength: 1.5,
				bloomThreshold: 0,
				bloomRadius: 0
			};
			
            function createGUI(scene, bloomPass) {
                if ( gui ) gui.destroy();
                gui = new GUI();
				gui.close();
                //gui.add( guiData, 'currentURL', {
                //    "Circuit": '/assets/circuit.svg',
//
//
                //} ).name( 'SVG File' ).onChange( update );
//
                //gui.add( guiData, 'drawStrokes' ).name( 'Draw strokes' ).onChange( update );
                //gui.add( guiData, 'drawFillShapes' ).name( 'Draw fill shapes' ).onChange( update );
                //gui.add( guiData, 'strokesWireframe' ).name( 'Wireframe strokes' ).onChange( update );
                //gui.add( guiData, 'fillShapesWireframe' ).name( 'Wireframe fill shapes' ).onChange( update );
                // bloom
                gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
                renderer.toneMappingExposure = Math.pow( value, 4.0 );
                } );

                gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
                bloomPass.threshold = Number( value );
                } );

                gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
                bloomPass.strength = Number( value );
                } );

                gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
                bloomPass.radius = Number( value );
                } );
                function update() {
                    loadSVG( guiData.currentURL, scene );
                }
            }
	


            function init(scene, bloomPass) {

                const container = document.getElementById( 'container' );

                //stats = new Stats();
                //container.appendChild( stats.dom );

                clock = new THREE.Clock();
                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                renderer.outputEncoding = THREE.sRGBEncoding; //from svgloader
                renderer.toneMapping = THREE.ReinhardToneMapping;
                container.appendChild( renderer.domElement );

                camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
                //var camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
                camera.position.set( -40, 4.5, -10.5 );
                scene.add( camera );

                const controls = new OrbitControls( camera, renderer.domElement );
                controls.maxPolarAngle = Math.PI * 0.5;


                scene.add( new THREE.AmbientLight( 0x404040 ) );

                const pointLight = new THREE.PointLight( 0xffffff, 1 );
                camera.add( pointLight );

                const renderScene = new RenderPass( scene, camera );

                bloomPass.threshold = params.bloomThreshold;
                bloomPass.strength = params.bloomStrength;
                bloomPass.radius = params.bloomRadius;

                composer = new EffectComposer( renderer );
                composer.addPass( renderScene );
                composer.addPass( bloomPass );

                guiData = {
                    currentURL: '/assets/circuit.svg',
                    drawFillShapes: true,
                    drawStrokes: true,
                    fillShapesWireframe: false,
                    strokesWireframe: false
                };

                window.addEventListener( 'resize', onWindowResize );

            }

			
			


			function onWindowResize() {
				const width = window.innerWidth;
				const height = window.innerHeight;
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height );
				composer.setSize( width, height );
			}

			
			
			/////////////////////////////
			class Glow {
				constructor(frequency, amplitude) {
					this.frequency = frequency;
					this.amplitude = amplitude;
					this.glowClock = new THREE.Clock(true);
					this.oscillatorRunning = false;
				}
			}

			function startGlowOscillator(glow) {
				console.log("glow oscillator started");
				glow.oscillatorRunning = true;
				glow.glowClock.start();
			}

			function oscillateGlow(glow) {
				let y = Math.sin(((Math.PI * 2) / glow.frequency) * glow.glowClock.getElapsedTime());
				renderer.toneMappingExposure = Math.pow( ((y * 0.1) + 1), 4.0 );
			}

			////////////////////////////
			class svgSlide {
				constructor(duration, slideDistance, slideDirection) {
					this.sliding = false;
					this.slideOut = false;
					this.slideDirection = slideDirection;
					this.svgSlideClock = new THREE.Clock(true);
					this.duration = duration;
					this.slideDistance = slideDistance;
					this.slideOrigin = 0;
					this.slideDestination = slideDistance * slideDirection;
					this.stoppedTime = 0;
					this.zAlpha = 0;
				}
			}

			function startSvgSlide(slide) {
				//console.log("slide animation started");							
				 // direction reversal
				slide.slideDistance = slide.slideDistance * slide.slideDirection;
				slide.slideDestination = slide.slideOrigin + (slide.slideDistance * slide.slideDirection);
				///////////////////////////////
				slide.sliding = !slide.sliding;
				slide.svgSlideClock.start();
			}
			
			let b, c;
			function slideSvg(svgSubGroup, slide) {
				let t = slide.svgSlideClock.getElapsedTime();// - slide.stoppedTime;// - slide.stoppedTime;//elapsed time
					b = slide.slideOrigin;// * (slide.slideDirection * -1);//slide.slideOrigin; // starting point
					c = slide.slideDistance;// distance
				let d = slide.duration;// + slide.stoppedTime; // duration
				slide.zAlpha = easeOutExpo(t, b, c, d);				
				function setMeshPositions(svgSubGroup, slide) {
					svgSubGroup.meshes.forEach( mesh => {
						mesh.position.z = slide.zAlpha; 
					});
				}
				if (t >= d) {
					slide.sliding = false; // stop the slide
					setMeshPositions(svgSubGroup, slide); // set to destination position
					slide.svgSlideClock.stop(); // stop the clock
					slide.slideDirection = slide.slideDirection * -1;
					slide.slideOrigin = slide.zAlpha;					
					startSvgSlide(slide); // restart motion in reverse
				} else {
					setMeshPositions(svgSubGroup, slide);
				}
			}

			
			manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
				console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
				svgSubGroups.forEach( subGroup => {
				});

				let meshesList = group.children;
				const shuffledMeshesList = meshesList.sort(() => Math.random() - 0.5)

				for (let i = (svgSubGroups[0].n * 0); i < (svgSubGroups[0].n * 1); i++) {
					svgSubGroups[0].meshes.push(shuffledMeshesList[i])
				}

				for (let i = (svgSubGroups[1].n * 1); i < (svgSubGroups[1].n * 2); i++) {
					svgSubGroups[1].meshes.push(shuffledMeshesList[i])
				}

				for (let i = (svgSubGroups[2].n * 2); i < (svgSubGroups[2].n * 3); i++) {
					svgSubGroups[2].meshes.push(shuffledMeshesList[i])
				}

				for (let i = (svgSubGroups[3].n * 3); i < (svgSubGroups[3].n * 4); i++) {
					svgSubGroups[3].meshes.push(shuffledMeshesList[i])
				}

				//duration, distance, direction
				slideOne = new svgSlide(3, 5, 1);// negative
				slideTwo = new svgSlide(3, 5, 1);// positive
				slideThree = new svgSlide(1, 1, 1);// negative
				slideFour = new svgSlide(1, 1, -1); // positive
				circuitGlow = new Glow(3, 10);

				setTimeout(() => {startSvgSlide(slideOne)}, 0);
				setTimeout(() => {startSvgSlide(slideTwo)}, 6000);
				setTimeout(() => {startSvgSlide(slideThree)}, 1000);
				setTimeout(() => {startSvgSlide(slideFour)}, 3000);
				startGlowOscillator(circuitGlow);
				animate();

			};
			/////////////////////////



			function loadSVG( url, scene ) {
				const helper = new THREE.GridHelper( 160, 10 );
				helper.rotation.x = Math.PI / 2;
				//scene.add( helper );
				const loader = new SVGLoader( manager );
				
				group = new THREE.Group();
				loader.load( url, function ( data ) {
                    paths = data.paths;
                    
                    group.scale.multiplyScalar( 0.25 );
                    group.position.x = -35;
                    group.position.y = 25;
                    group.position.z = 0;
                    group.scale.y *= - 1;

                    for ( let i = 0; i < paths.length; i ++ ) {
                        const path = paths[ i ];
                        const fillColor = path.userData.style.fill;
                        if ( guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none' ) {

                            const material = new THREE.MeshBasicMaterial( {
                                color: new THREE.Color().setStyle( fillColor ).convertSRGBToLinear(),
                                opacity: path.userData.style.fillOpacity,
                                transparent: true,
                                side: THREE.DoubleSide,
                                depthWrite: false,
                                wireframe: guiData.fillShapesWireframe
                            } );

                            const shapes = SVGLoader.createShapes( path );
							
                            for ( let j = 0; j < shapes.length; j ++ ) {
                                const shape = shapes[ j ];
                                const geometry = new THREE.ShapeGeometry( shape );
									const mesh = new THREE.Mesh( geometry, material );
                                	group.add( mesh );
                            }
							
                        }

                        const strokeColor = path.userData.style.stroke;

                        if ( guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none' ) {
                            const material = new THREE.MeshBasicMaterial( {
                                color: new THREE.Color().setStyle( strokeColor ).convertSRGBToLinear(),
                                opacity: path.userData.style.strokeOpacity,
                                transparent: true,
                                side: THREE.DoubleSide,
                                depthWrite: false,
                                wireframe: guiData.strokesWireframe
                            } );

                            for ( let j = 0, jl = path.subPaths.length; j < jl; j ++ ) {
                                const subPath = path.subPaths[ j ];
                                const geometry = SVGLoader.pointsToStroke( subPath.getPoints(), path.userData.style );
                                if ( geometry ) {
									const mesh = new THREE.Mesh( geometry, material );
                                    group.add( mesh );
                                }
                            }
                        }
						
	            	}

                
                scene.add( group );
                mixer = new THREE.AnimationMixer( group );
            	} );

			}

        	

			

			function animate() {

				requestAnimationFrame( animate );

				if (slideOne.sliding == true) {
					slideSvg(svgSubGroups[0], slideOne);
				}
				if (slideTwo.sliding == true) {
					slideSvg(svgSubGroups[1], slideTwo);
				}
				if (slideThree.sliding == true) {
					slideSvg(svgSubGroups[2], slideThree);
				}
				if (slideFour.sliding == true) {
					slideSvg(svgSubGroups[3], slideFour);
				}
				if (circuitGlow.oscillatorRunning == true) {
					oscillateGlow(circuitGlow);
				}
				
				const delta = clock.getDelta();
				mixer.update( delta );
				//stats.update();
				composer.render();
				
			}
		 //////////////////////////////////////////////

		/////////////////////////////////////////////

		const scene = new THREE.Scene();
		const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		init(scene, bloomPass);	
		loadSVG('/assets/circuit.svg', scene);	
		createGUI(scene, bloomPass);

		/////////////////////////////////////////////
}

window.addEventListener('DOMContentLoaded', (event) => {
  pcbMain();
});