import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

function arc(){
  const outer=1.85,inner=1.18,start=.13,end=Math.PI-.13
  const shape=new THREE.Shape()
  shape.absarc(0,0,outer,start,end,false)
  shape.lineTo(inner*Math.cos(end),inner*Math.sin(end))
  shape.absarc(0,0,inner,end,start,true)
  shape.closePath()
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.48,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.065,bevelThickness:.065,curveSegments:96})
  geometry.translate(0,0,-.24)
  return geometry
}

export function createLimitsScene(container:HTMLElement,reduced:MediaQueryList){
  const fallback=()=>{container.classList.add('limits-fallback');container.innerHTML='<span></span><span></span>'}
  const canvas=document.createElement('canvas'),context=canvas.getContext('webgl2',{alpha:true,antialias:true})
  if(!context){fallback();return}
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true})}catch{fallback();return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75))
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap
  container.appendChild(renderer.domElement)
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,30)
  const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer)
  scene.environment=generator.fromScene(room,.05).texture;room.dispose();generator.dispose()
  const face=new THREE.MeshPhysicalMaterial({color:'#be9ee0',metalness:.7,roughness:.25,clearcoat:.7})
  const edge=new THREE.MeshPhysicalMaterial({color:'#9273b6',metalness:.8,roughness:.19,clearcoat:1})
  const geometry=arc(),group=new THREE.Group()
  const top=new THREE.Mesh(geometry,[face,edge]),bottom=new THREE.Mesh(geometry,[face,edge])
  top.castShadow=true;bottom.castShadow=true;bottom.rotation.z=Math.PI
  group.add(top,bottom);scene.add(group)
  const key=new THREE.DirectionalLight('#fff7e8',4);key.position.set(-3,7,6);key.castShadow=true
  key.shadow.mapSize.set(1024,1024);key.shadow.radius=4;key.shadow.blurSamples=10
  Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});key.shadow.bias=-.001;scene.add(key)
  const rim=new THREE.DirectionalLight('#a185f0',2.5);rim.position.set(5,0,-3);scene.add(rim)
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({color:'#634076',opacity:.17}))
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.6;floor.receiveShadow=true;scene.add(floor)
  let progress=.5,target=.5,visible=false,raf=0
  function draw(){
    raf=0;progress=reduced.matches ? .5 : THREE.MathUtils.lerp(progress,target,.055)
    group.rotation.set(.13,-.38,-.22+progress*.08)
    top.position.set(-.08,.18+progress*.12,.05)
    bottom.position.set(.12,-.19-progress*.12,0)
    top.rotation.y=-.05+progress*.09;bottom.rotation.y=-progress*.06
    renderer.render(scene,camera)
    if(visible&&Math.abs(target-progress)>.001&&!reduced.matches)raf=requestAnimationFrame(draw)
  }
  const update=()=>{if(!visible)return;const r=container.getBoundingClientRect();target=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));if(!raf)raf=requestAnimationFrame(draw)}
  const resize=()=>{const{width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.position.set(0,.2,Math.max(9.3,8.5/camera.aspect));camera.lookAt(0,-.05,0);camera.updateProjectionMatrix();if(raf)cancelAnimationFrame(raf);draw()}
  new ResizeObserver(resize).observe(container)
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update()}).observe(container)
  addEventListener('scroll',update,{passive:true});reduced.addEventListener('change',()=>{if(!raf)raf=requestAnimationFrame(draw)})
  resize()
}
