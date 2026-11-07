import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import fontSource from './helvetiker.json?raw'

export function createPortrait(container:HTMLElement,reduced:MediaQueryList){
 const canvas=document.createElement('canvas')
 const context=canvas.getContext('webgl2',{alpha:true,antialias:true})
 if(!context)return {setMode:(v:number)=>{container.dataset.mode=String(v)},setScroll:(_:number)=>{}}
 const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true})
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0,0)
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap
 container.append(canvas);container.classList.add('is-rendered')
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100)
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04)
 scene.environment=env.texture;room.dispose();pmrem.dispose()
 const key=new THREE.DirectionalLight('#f6fff0',3);key.position.set(-4,9,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.04;key.shadow.radius=4;scene.add(key)
 const rim=new THREE.DirectionalLight('#cfff64',4);rim.position.set(7,4,-5);scene.add(rim,new THREE.AmbientLight('#c8ddcf',1.3))
 key.shadow.blurSamples=12;key.shadow.radius=5
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.72;floor.receiveShadow=true;scene.add(floor)
 const font=new FontLoader().parse(JSON.parse(fontSource)),word=new THREE.Group()
 const front=new THREE.MeshPhysicalMaterial({color:'#123d32',metalness:.7,roughness:.24,clearcoat:1})
 const side=new THREE.MeshPhysicalMaterial({color:'#567b66',metalness:.8,roughness:.28,clearcoat:1})
 const acid=new THREE.MeshPhysicalMaterial({color:'#d8ff36',metalness:.2,roughness:.3})
 const letters:THREE.Group[]=[];let cursor=0
 for(const char of 'GPT'){
  const geometry=new TextGeometry(char,{font,size:3.15,depth:.8,curveSegments:16,bevelEnabled:true,bevelSegments:5,bevelThickness:.065,bevelSize:.045})
  geometry.computeBoundingBox();const width=geometry.boundingBox!.max.x
  const letter=new THREE.Group(),mesh=new THREE.Mesh(geometry,[front,side]);mesh.castShadow=true;mesh.receiveShadow=true;letter.add(mesh)
  for(let j=1;j<=5;j++){const slice=new THREE.Mesh(geometry,j===5?acid:new THREE.MeshPhysicalMaterial({color:j%2?'#d8e7db':'#4f6a5c',metalness:.45,roughness:.32}));slice.scale.z=.09;slice.position.z=-j*.28;slice.castShadow=true;letter.add(slice)}
  letter.position.x=cursor;word.add(letter);letters.push(letter);cursor+=width+.23
 }
 word.position.set(-cursor/2,-1.5,0);scene.add(word)
 const orbit=new THREE.Group();scene.add(orbit)
 const textures:THREE.CanvasTexture[]=[]
 for(let mode=0;mode<3;mode++){
  const c=document.createElement('canvas');c.width=512;c.height=384;const ctx=c.getContext('2d')!
  ctx.fillStyle=mode===1?'#d8ff36':'#e9ece5';ctx.fillRect(0,0,512,384);ctx.fillStyle='#102c27';ctx.font='18px "IBM Plex Mono", monospace';ctx.fillText(['TEXT / INPUT','IMAGE / INPUT','CODE / INPUT'][mode],28,36)
  ctx.strokeStyle='#789084';ctx.strokeRect(16,16,480,352)
  if(mode===0){ctx.font='bold 84px "Space Grotesk Variable"';ctx.fillText('Aa',30,155);ctx.font='18px "IBM Plex Mono"';['Read. Connect.','Make it clear.','Find the evidence.'].forEach((s,i)=>ctx.fillText(s,30,220+i*35))}
  if(mode===1){ctx.strokeStyle='#102c27';ctx.lineWidth=4;ctx.strokeRect(40,74,432,258);ctx.fillStyle='#102c27';ctx.beginPath();ctx.moveTo(45,328);ctx.lineTo(170,160);ctx.lineTo(250,240);ctx.lineTo(340,120);ctx.lineTo(468,328);ctx.fill();ctx.beginPath();ctx.arc(120,120,22,0,Math.PI*2);ctx.fill()}
  if(mode===2){ctx.font='34px "IBM Plex Mono"';['const result = {','  goal: "clear",','  evidence: true','};','verify(result);'].forEach((s,i)=>ctx.fillText(s,28,108+i*48))}
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture)
 }
 const cards:THREE.Mesh[]=[]
 for(let i=0;i<19;i++){
  const material=new THREE.MeshBasicMaterial({map:textures[0],side:THREE.DoubleSide})
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.12,.018),material),a=i/19*Math.PI*1.45-.6
  mesh.position.set(Math.cos(a)*5,Math.sin(a)*2.9+.9,-3.7+i%3*.4);mesh.rotation.set(-.18,Math.sin(a)*.4,a*.14);mesh.scale.setScalar(.58+(i%4)*.13);mesh.castShadow=true;orbit.add(mesh);cards.push(mesh)
 }
 let mode=0,current=0,scroll=0,scrollTarget=0,visible=true,raf=0,last=0,elapsed=0,px=0,py=0,targetX=0,targetY=0
 const bases=letters.map(l=>l.position.clone())
 function draw(time:number){
  raf=0;const dt=Math.min(.05,(time-last)/1000||.016);last=time
  const k=reduced.matches?1:1-Math.exp(-dt*5)
  current+=(mode-current)*k;scroll+=(scrollTarget-scroll)*k;px+=(targetX-px)*k;py+=(targetY-py)*k
  if(!reduced.matches)elapsed+=dt
  letters.forEach((l,i)=>{l.position.copy(bases[i]);l.position.z=Math.sin(current*Math.PI/2+i)*current*.9;l.position.x+=(i-1)*current*.16;l.position.y=Math.sin(i*1.4+current)*current*.15;l.rotation.y=Math.sin(current*Math.PI*.5)*(i-1)*.2;l.children.forEach((slice,j)=>{if(j>0)slice.position.z=-j*(.28+current*.17)})})
  word.rotation.z=-.055;word.rotation.y=-.12+px*.05
  orbit.rotation.z=-current*.22;cards.forEach((card,i)=>{card.rotation.y=Math.sin(i*.7)*.3+current*.15;const a=i/19*Math.PI*1.45-.6;card.position.y=Math.sin(a)*2.9+.9+(reduced.matches?0:Math.sin(elapsed*.55+i)*.035);card.scale.setScalar((.58+(i%4)*.13)*(1+current*.2))})
  const aspect=container.clientWidth/Math.max(1,container.clientHeight),distance=aspect<1?21:16
  camera.position.set(5-current*2.2+px*.55,4.6+py*.4+scroll*1.5,distance-current*.3-scroll*1.3);camera.lookAt(0,.1,-current*.4)
  renderer.render(scene,camera);container.dataset.ready='true';container.dataset.settled=String(Math.abs(current-mode)<.002)
  if(visible&&(!reduced.matches||Math.abs(current-mode)>.001||Math.abs(scroll-scrollTarget)>.001))raf=requestAnimationFrame(draw)
 }
 function request(){if(!raf)raf=requestAnimationFrame(draw)}
 const resize=()=>{const r=container.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();request()}
 new ResizeObserver(resize).observe(container)
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)request()}).observe(container)
 container.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=container.getBoundingClientRect();targetX=(e.clientX-r.left)/r.width-.5;targetY=(e.clientY-r.top)/r.height-.5})
 container.addEventListener('pointerleave',()=>{targetX=targetY=0})
 reduced.addEventListener('change',()=>{targetX=targetY=0;request()});resize()
 return {setMode:(v:number)=>{mode=v;cards.forEach(card=>(card.material as THREE.MeshStandardMaterial).map=textures[v]);request()},setScroll:(v:number)=>{scrollTarget=reduced.matches?0:v;request()}}
}
