import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function createScoreScene(container:HTMLElement,reduced:MediaQueryList){
  const fallback=()=>{
    container.classList.add('score-fallback')
    container.innerHTML=[57,57,55,55].map(score=>`<span style="height:${score/57*100}%"></span>`).join('')
    return {setSpread:(v:number)=>{container.style.gap=v?'8%':'5%'}}
  }
  const canvas=document.createElement('canvas')
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true})
  if(!context)return fallback()
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true})}
  catch{return fallback()}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75))
  renderer.toneMapping=THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure=1.05
  renderer.shadowMap.enabled=true
  renderer.shadowMap.type=THREE.VSMShadowMap
  container.appendChild(renderer.domElement)
  const scene=new THREE.Scene()
  const camera=new THREE.OrthographicCamera(-6,6,5,-5,.1,50)
  const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer)
  scene.environment=generator.fromScene(room,.06).texture
  room.dispose();generator.dispose()
  const key=new THREE.DirectionalLight('#fff4e6',3.3)
  key.position.set(-3,12,5);key.castShadow=true
  key.shadow.mapSize.set(1024,1024);key.shadow.radius=5;key.shadow.blurSamples=12
  Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8})
  key.shadow.bias=-.0008
  scene.add(key)
  const fill=new THREE.DirectionalLight('#b998f1',1.8);fill.position.set(5,5,1);scene.add(fill)
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({color:'#4f274d',opacity:.19}))
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.045;scene.add(floor)
  const geometry=new RoundedBoxGeometry(1.2,.044,1.13,3,.021)
  const scores=[57,57,55,55]
  const towers=scores.map((score,i)=>{
    const material=new THREE.MeshPhysicalMaterial({color:i===1?'#e8d8f6':'#a685cb',metalness:.78,roughness:.26,clearcoat:.6})
    const mesh=new THREE.InstancedMesh(geometry,material,score)
    mesh.castShadow=true;mesh.receiveShadow=false;scene.add(mesh);return mesh
  })
  const transform=new THREE.Object3D()
  let spread=reduced.matches?0:.85,targetSpread=0,visible=false,raf=0,width=1,height=1
  function draw(){
    raf=0
    spread=reduced.matches?targetSpread:THREE.MathUtils.lerp(spread,targetSpread,.06)
    const desiredHeight=4.72+spread*1.15
    const viewWidth=Math.max(8.9,desiredHeight*width/height)
    const viewHeight=viewWidth*height/width
    camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2
    camera.position.set(0,5.4+spread*.4,18)
    camera.lookAt(0,1.96+spread*.48,0);camera.updateProjectionMatrix()
    container.parentElement!.style.setProperty('--chart-inset',`${Math.max(0,(1-8.4/viewWidth)*50)}%`)
    towers.forEach((tower,i)=>{
      for(let j=0;j<scores[i];j++){
        const t=j/56
        transform.position.set((i-1.5)*2.1+Math.sin(t*Math.PI*2)*spread*.15,j*(.069+spread*.021)+.025,Math.sin(t*Math.PI)*spread*.23)
        transform.rotation.set(0,Math.PI*.12+t*(1.9+spread*.75),0)
        transform.scale.setScalar(1);transform.updateMatrix();tower.setMatrixAt(j,transform.matrix)
      }
      tower.instanceMatrix.needsUpdate=true
    })
    renderer.render(scene,camera)
    container.dataset.settled=String(Math.abs(targetSpread-spread)<.001)
    if(visible&&Math.abs(targetSpread-spread)>.001)raf=requestAnimationFrame(draw)
  }
  function resize(){
    const rect=container.getBoundingClientRect();width=rect.width;height=rect.height
    renderer.setSize(width,height)
    if(raf)cancelAnimationFrame(raf);draw()
  }
  new ResizeObserver(resize).observe(container)
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!raf)draw()},{rootMargin:'80px'}).observe(container)
  reduced.addEventListener('change',()=>{if(!raf)raf=requestAnimationFrame(draw)})
  resize()
  return {setSpread:(v:number)=>{targetSpread=v;if(!raf)raf=requestAnimationFrame(draw)}}
}
