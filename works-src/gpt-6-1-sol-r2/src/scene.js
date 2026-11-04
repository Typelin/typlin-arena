import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createSculpture(host, { dark = false, interactive = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    host.classList.add('no-webgl');
    return { setSpread() {}, setRotation() {}, reset() {} };
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = dark ? 1.0 : 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 50);
  camera.position.set(0, .2, 8.6);
  camera.lookAt(0, 0, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .05);
  scene.environment = environment.texture;
  scene.environmentIntensity = dark ? .78 : .72;
  room.dispose();
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xfff4dc, 2.5);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.normalBias = .03;
  key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd4f2ef, 2.2);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff632b, 2.5, 10, 2);
  warm.position.set(0, -.4, 2);
  scene.add(warm);

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const silver = new THREE.MeshStandardMaterial({ color: 0x879990, metalness: 1, roughness: .29 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xc59069, metalness: 1, roughness: .25 });
  const orange = new THREE.MeshPhysicalMaterial({ color: 0xd94412, metalness: .2, roughness: .29, clearcoat: .65 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x344240, metalness: .9, roughness: .3 });
  const layers = [];
  const total = 42;
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1) * 2 - 1;
    const radius = .99 + .79 * Math.sqrt(Math.max(0, 1 - t * t));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .042, 12, 160), i % 9 === 0 ? edge : silver);
    ring.position.z = t * 1.12;
    ring.castShadow = true;
    ring.receiveShadow = true;
    layers.push({ mesh: ring, z: ring.position.z, t });
    sculpture.add(ring);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(.71, 64, 48), orange);
  core.castShadow = true;
  sculpture.add(core);
  const equator = new THREE.Mesh(new THREE.TorusGeometry(.716, .012, 8, 120), graphite);
  equator.rotation.x = Math.PI / 2;
  sculpture.add(equator);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(.80, .048, 16, 100), silver);
  inner.rotation.x = Math.PI / 2.8;
  sculpture.add(inner);

  // Turned rim and fasteners give the shell a structural edge.
  for (const z of [-1.13, 1.13]) {
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(1, .063, 16, 128), graphite);
    rimMesh.position.z = z;
    rimMesh.castShadow = true;
    sculpture.add(rimMesh);
    for (let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      const fastener=new THREE.Mesh(new THREE.SphereGeometry(.027,8,6),edge);
      fastener.position.set(Math.cos(a),Math.sin(a),z+.045*Math.sign(z));
      sculpture.add(fastener);
    }
  }

  // A matte floor receives a real soft shadow beneath the metal ribs.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .035 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.12;
  floor.receiveShadow = true;
  scene.add(floor);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width=256;
  shadowCanvas.height=256;
  const context=shadowCanvas.getContext('2d');
  const falloff=context.createRadialGradient(128,128,10,128,128,125);
  falloff.addColorStop(0,'rgba(15,32,19,.28)');
  falloff.addColorStop(.4,'rgba(15,32,19,.13)');
  falloff.addColorStop(1,'rgba(15,32,19,0)');
  context.fillStyle=falloff;
  context.fillRect(0,0,256,256);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(5.8,4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,opacity:dark?.7:1}));
  contact.rotation.x=-Math.PI/2;
  contact.position.set(.25,-2.10,.2);
  scene.add(contact);

  let width = 1;
  let height = 1;
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = width < 500 ? 9.5 : 8.5;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '150px' }).observe(host);
  let spreadTarget = 0;
  let spread = 0;
  let rotation = 0;
  let dragging = false;
  let pointerX = 0;
  let targetY = 0;
  let currentY = 0;
  if (interactive) {
    host.addEventListener('pointerdown', (event) => {
      dragging = true;
      pointerX = event.clientX;
      host.setPointerCapture(event.pointerId);
    });
    host.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      targetY += (event.clientX - pointerX) * .008;
      pointerX = event.clientX;
    });
    host.addEventListener('pointerup', () => { dragging = false; });
    host.addEventListener('pointercancel', () => { dragging = false; });
  }
  let frame = 0;
  const started = performance.now();
  function render() {
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden) return;
    const elapsed = (performance.now()-started)/1000;
    spread += (spreadTarget - spread) * (reduced.matches ? 1 : .075);
    currentY += (targetY - currentY) * .08;
    sculpture.rotation.set(.33 + (reduced.matches ? 0 : Math.sin(elapsed * .23) * .07), -.55 + currentY + rotation, -.32);
    if (!reduced.matches) sculpture.rotation.y += Math.sin(elapsed * .13) * .12;
    sculpture.position.y = reduced.matches ? 0 : Math.sin(elapsed * .5) * .04;
    sculpture.scale.setScalar(interactive ? 1-spread*.18 : 1);
    for (const layer of layers) {
      layer.mesh.position.z = layer.z * (1 + spread * 1.55);
      layer.mesh.position.x = Math.sin(layer.t * Math.PI) * spread * .55;
      layer.mesh.rotation.y = Math.sin(layer.t * Math.PI) * spread * .25;
    }
    core.rotation.y = reduced.matches ? .4 : elapsed * .1;
    renderer.render(scene, camera);
  }
  render();
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    renderer.dispose();
    environment.dispose();
  }, { once: true });
  return {
    setSpread(value) { spreadTarget = value; },
    setRotation(value) { rotation = value; },
    reset() { spreadTarget=0;rotation=0;targetY=0; },
  };
}

export function createScoreWheel(host) {
  let renderer;
  try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }
  catch { host.classList.add('score-fallback'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.setClearColor(0x000000,0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,50);
  camera.position.set(0,0,10);
  const environmentMaker=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  scene.environment=environmentMaker.fromScene(room,.03).texture;
  scene.environmentIntensity=.9;
  environmentMaker.dispose();room.dispose();
  const key=new THREE.DirectionalLight(0xffe8be,3.5);
  key.position.set(-3,5,5);scene.add(key);
  const side=new THREE.DirectionalLight(0xffa173,2);
  side.position.set(5,-3,2);scene.add(side);
  const cream=new THREE.MeshStandardMaterial({color:0xe9d1ac,metalness:.7,roughness:.32});
  const dark=new THREE.MeshStandardMaterial({color:0x4a4e33,metalness:.85,roughness:.3});
  const base=new THREE.MeshStandardMaterial({color:0x223c2c,metalness:.75,roughness:.3});
  const wheel=new THREE.Group();
  scene.add(wheel);
  const blades=[];
  for(let i=0;i<100;i++) {
    const a=Math.PI/2-i*Math.PI/50;
    const half=.022;
    const shape=new THREE.Shape();
    const inner=1.95;
    const outer=i%5===0?2.88:2.72;
    shape.moveTo(Math.cos(a-half)*inner,Math.sin(a-half)*inner);
    shape.lineTo(Math.cos(a-half)*outer,Math.sin(a-half)*outer);
    shape.absarc(0,0,outer,a-half,a+half,false);
    shape.lineTo(Math.cos(a+half)*inner,Math.sin(a+half)*inner);
    shape.absarc(0,0,inner,a+half,a-half,true);
    const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:8}),i<55?cream:dark);
    const z=Math.sin(i*Math.PI/50)*.12;
    mesh.position.z=z;
    blades.push({mesh,z,index:i});wheel.add(mesh);
  }
  const inside=new THREE.Mesh(new THREE.CylinderGeometry(1.85,1.85,.2,160),base);
  inside.rotation.x=Math.PI/2;
  inside.position.z=-.1;
  wheel.add(inside);
  const bevel=new THREE.Mesh(new THREE.TorusGeometry(1.86,.035,12,160),cream);
  bevel.position.z=.04;wheel.add(bevel);
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w<500?9.8:9.8;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(host);resize();
  let visible=false;
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:'100px'}).observe(host);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let frame=0;
  function animate(){
    frame=requestAnimationFrame(animate);
    if(!visible||document.hidden)return;
    const rect=host.getBoundingClientRect();
    const progress=reduced.matches?0:Math.max(-1,Math.min(1,(innerHeight*.5-rect.top)/innerHeight));
    wheel.rotation.set(.13+progress*.09,-.12,progress*.035);
    for(const {mesh,z,index} of blades) mesh.position.z=z+(reduced.matches?0:Math.sin(progress*Math.PI+index*.063)*.08);
    renderer.render(scene,camera);
  }
  animate();
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);renderer.dispose();},{once:true});
}
