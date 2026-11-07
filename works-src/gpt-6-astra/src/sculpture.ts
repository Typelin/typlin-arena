import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

class Knot extends THREE.Curve<THREE.Vector3> {
  constructor(){super()}
  getPoint(t: number, target = new THREE.Vector3()) {
    const a=t*Math.PI*2
    const r=1.48+.57*Math.cos(3*a)
    return target.set(r*Math.cos(2*a),r*Math.sin(2*a),.66*Math.sin(3*a))
  }
}

function makeRibbon(offset:number) {
  const curve=new Knot()
  const segments=420,sides=24
  const frames=curve.computeFrenetFrames(segments,true)
  const positions:number[]=[],indices:number[]=[]
  for(let i=0;i<=segments;i++) {
    const t=i/segments,center=curve.getPoint(t)
    const normal=frames.normals[i],binormal=frames.binormals[i]
    const angle=t*Math.PI*4+.35
    for(let j=0;j<=sides;j++) {
      const a=j/sides*Math.PI*2
      const x=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.4)*.37+offset
      const y=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.4)*.065
      const nx=x*Math.cos(angle)-y*Math.sin(angle)
      const ny=x*Math.sin(angle)+y*Math.cos(angle)
      positions.push(center.x+normal.x*nx+binormal.x*ny,center.y+normal.y*nx+binormal.y*ny,center.z+normal.z*nx+binormal.z*ny)
      if(i<segments&&j<sides){const p=i*(sides+1)+j;indices.push(p,p+sides+1,p+1,p+1,p+sides+1,p+sides+2)}
    }
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
  geometry.setIndex(indices);geometry.computeVertexNormals()
  return geometry
}

export function createSculpture(container:HTMLDivElement, reduced:MediaQueryList) {
  const fallback=()=>{container.classList.add('fallback');container.innerHTML='<span class="fallback-loop"></span><span class="fallback-loop"></span><span class="fallback-loop"></span>';return {setUnfold:(v:number)=>container.style.setProperty('--unfold',String(v))}}
  const canvas=document.createElement('canvas')
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true})
  if(!context)return fallback()
  let renderer:THREE.WebGLRenderer
  try {renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'high-performance'})}
  catch {return fallback()}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75))
  renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.toneMapping=THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure=1.28
  container.appendChild(renderer.domElement)
  const scene=new THREE.Scene()
  const camera=new THREE.PerspectiveCamera(35,1,.1,50)
  camera.position.set(0,0,10.2)
  const pmrem=new THREE.PMREMGenerator(renderer)
  const room=new RoomEnvironment()
  const env=pmrem.fromScene(room,.04)
  scene.environment=env.texture
  room.dispose();pmrem.dispose()
  const group=new THREE.Group()
  const ribbons=[-.79,0,.79].map((offset,i)=>{
    const material=new THREE.MeshPhysicalMaterial({color:['#9a7cc9','#e5d7f9','#bba8e6'][i],metalness:.9,roughness:.22,clearcoat:1,clearcoatRoughness:.15,iridescence:.23,iridescenceIOR:1.4,side:THREE.DoubleSide})
    const mesh=new THREE.Mesh(makeRibbon(offset),material)
    group.add(mesh);return mesh
  })
  scene.add(group)
  const key=new THREE.DirectionalLight('#fff8ee',5)
  key.position.set(-3,6,4);scene.add(key)
  const fill=new THREE.DirectionalLight('#7761ff',3)
  fill.position.set(4,-2,1);scene.add(fill)
  const rim=new THREE.DirectionalLight('#ffd0b3',4)
  rim.position.set(-5,-2,-3);scene.add(rim)
  let target=0,unfold=0,visible=true,mouseX=0,mouseY=0,px=0,py=0
  let tick=0,last=0,raf=0
  function render(time:number) {
    raf=0
    const dt=Math.min((time-last)/1000,.04);last=time
    if(!reduced.matches)tick+=dt
    unfold=reduced.matches?target:THREE.MathUtils.lerp(unfold,target,.06)
    px=THREE.MathUtils.lerp(px,mouseX,.035);py=THREE.MathUtils.lerp(py,mouseY,.035)
    group.rotation.set(.3+py*.12,-.3+px*.18,.18+Math.sin(tick*.18)*.06)
    group.rotation.y+=unfold*.55
    group.scale.setScalar(1-unfold*.13)
    ribbons.forEach((mesh,i)=>{
      mesh.position.x=(i-1)*unfold*1.15
      mesh.position.z=(i-1)*unfold*.55
      mesh.rotation.z=(i-1)*unfold*.23
    })
    renderer.render(scene,camera)
    if(visible&&(!reduced.matches||Math.abs(target-unfold)>.001))raf=requestAnimationFrame(render)
  }
  const resize=()=>{const{width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=Math.max(10.2,10.5/camera.aspect);camera.updateProjectionMatrix();if(raf)cancelAnimationFrame(raf);render(performance.now())}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container)
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(render)});observer.observe(container)
  container.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=container.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width-.5;mouseY=(e.clientY-r.top)/r.height-.5})
  container.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0})
  reduced.addEventListener('change',()=>{if(!raf)raf=requestAnimationFrame(render)})
  resize()
  return {setUnfold:(v:number)=>{target=v;if(!raf)raf=requestAnimationFrame(render)}}
}
