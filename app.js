import * as THREE from './assets/vendor/three.module.js';

const $=s=>document.querySelector(s),clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp;
const smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const colours={blue:{name:'Klein Blue',hex:'#2633d4'},orange:{name:'Burnt Orange',hex:'#c45a2d'},chalk:{name:'Warm Chalk',hex:'#e6d8c4'},plum:{name:'Deep Plum',hex:'#512f57'}};
let selectedColor='blue',selectedMaterial='boucle',progress=0,targetProgress=0,rotation=0,rotationTarget=0,active=-1;
let coverMaterial,shellMaterial,seamMaterial,scene,renderer,camera,chair,shellGroup,coverGroup,frameGroup;
const dialog=$('#spec-dialog');
function updateSpecification(){$('#finish-name').textContent=colours[selectedColor].name.toUpperCase();$('#spec-color').textContent=colours[selectedColor].name;$('#spec-material').textContent=selectedMaterial==='boucle'?'Bouclé':'Soft touch';$('#save-status').textContent='';}
function openSpec(){updateSpecification();dialog.showModal()}
$('#details-button').addEventListener('click',openSpec);$('#spec-button').addEventListener('click',openSpec);$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{selectedColor=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(coverMaterial){coverMaterial.color.set(colours[selectedColor].hex);shellMaterial.color.set(colours[selectedColor].hex).multiplyScalar(.68);seamMaterial.color.set(colours[selectedColor].hex).multiplyScalar(.6)}updateSpecification()}));
document.querySelectorAll('[data-material]').forEach(b=>b.addEventListener('click',()=>{selectedMaterial=b.dataset.material;document.querySelectorAll('[data-material]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(coverMaterial){coverMaterial.roughness=selectedMaterial==='boucle'?.94:.42;coverMaterial.bumpScale=selectedMaterial==='boucle'?.035:.003}updateSpecification()}));
$('#reset-view').addEventListener('click',()=>{rotationTarget=0});
$('#download-spec').addEventListener('click',()=>{const content=`FOLD 01\nYour design specification\n\nColour: ${colours[selectedColor].name}\nSurface: ${selectedMaterial==='boucle'?'Bouclé':'Soft touch'}\nFrame: Polished stainless steel\nDimensions: W 76 × D 82 × H 84 cm\nSeat height: 42 cm\n\nIndependent furniture concept, 2026.\nDesign study dimensions. Not in production or offered for sale.\nIndependent concept by BlackStack Studio.\n`;const link=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));link.href=url;link.download=`fold-01-${selectedColor}-${selectedMaterial}.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#save-status').textContent='Specification saved. Make room on your moodboard.'});
const sections=[...document.querySelectorAll('.chapter')],nav=[...document.querySelectorAll('.progress-nav a')];
function updateProgress(){let i=0;while(i<sections.length-1&&scrollY>=sections[i+1].offsetTop)i++;const start=sections[i].offsetTop,end=sections[i+1]?.offsetTop??start+innerHeight;targetProgress=i+clamp((scrollY-start)/(end-start),0,1);let current=Math.min(3,Math.round(targetProgress));if(current!==active){active=current;nav.forEach((a,j)=>{a.classList.toggle('active',j===current);if(j===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}}
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
const host=$('#scene');
try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color('#d9ed38');scene.fog=new THREE.Fog('#d9ed38',16,34);camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.05,80);
  scene.add(new THREE.HemisphereLight('#ffffff','#7b8143',2.9));
  const key=new THREE.DirectionalLight('#ffffff',4);key.position.set(-4.5,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-4;key.shadow.normalBias=.018;key.shadow.bias=-.00015;key.shadow.radius=4;scene.add(key);
  const rim=new THREE.DirectionalLight('#c8d8ff',2.4);rim.position.set(5,3,-4);scene.add(rim);const fill=new THREE.DirectionalLight('#ffedc2',.8);fill.position.set(-5,1,-3);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:'#d9ed38',roughness:.86}));ground.rotation.x=-Math.PI/2;ground.position.y=-.005;ground.receiveShadow=true;scene.add(ground);
  // A knitted microtexture, generated locally rather than fetched from a stock library.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#909090';ctx.fillRect(0,0,256,256);let seed=39;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){const shade=80+Math.floor(random()*100);ctx.strokeStyle=`rgb(${shade},${shade},${shade})`;ctx.lineWidth=1+random();ctx.beginPath();ctx.ellipse(x+random()*3,y+random()*3,1.1,1.8,random(),0,Math.PI*2);ctx.stroke()}const textile=new THREE.CanvasTexture(canvas);textile.wrapS=textile.wrapT=THREE.RepeatWrapping;textile.repeat.set(3,4);textile.anisotropy=4;
  coverMaterial=new THREE.MeshStandardMaterial({color:colours.blue.hex,roughness:.94,bumpMap:textile,bumpScale:.035});
  shellMaterial=new THREE.MeshStandardMaterial({color:colours.blue.hex,roughness:.54});shellMaterial.color.multiplyScalar(.68);
  const frameMaterial=new THREE.MeshStandardMaterial({color:'#c5cbcc',metalness:.75,roughness:.2});
  seamMaterial=new THREE.MeshStandardMaterial({color:'#17229c',roughness:.85});
  chair=new THREE.Group();scene.add(chair);shellGroup=new THREE.Group();coverGroup=new THREE.Group();frameGroup=new THREE.Group();chair.add(shellGroup,coverGroup,frameGroup);
  const profile=new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.74,-.54),new THREE.Vector3(0,2.52,-.7),new THREE.Vector3(0,1.9,-.73),new THREE.Vector3(0,1.4,-.42),new THREE.Vector3(0,1.18,.04),new THREE.Vector3(0,1.17,.55),new THREE.Vector3(0,1.07,.83)],false,'catmullrom',.35);
  // A closed, thick, continuous folded shell. Every layer follows this same authored profile.
  function ribbonGeometry(width,thickness,lift){const rows=86,cols=24,vertices=[],uvs=[],indices=[];for(let side=0;side<2;side++)for(let v=0;v<=rows;v++){const t=v/rows,p=profile.getPoint(t),tangent=profile.getTangent(t),ny=tangent.z,nz=-tangent.y;for(let u=0;u<=cols;u++){const a=u/cols-.5,w=width*(.96+.04*Math.cos(t*Math.PI*2)),x=a*w,edge=Math.pow(Math.abs(a)*2,3),cup=.035*edge;const n=(side===0?thickness/2:-thickness/2)+lift;vertices.push(x,p.y+ny*n+cup,p.z+nz*n+edge*.055);uvs.push(u/cols,t)}}const layer=(rows+1)*(cols+1);for(let s=0;s<2;s++)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=s*layer+r*(cols+1)+c,b=a+1,d=a+cols+1,e=d+1;if(s===0)indices.push(a,d,b,b,d,e);else indices.push(a,b,d,b,e,d)}for(let r=0;r<rows;r++)for(const c of [0,cols]){const a=r*(cols+1)+c,b=(r+1)*(cols+1)+c;indices.push(a,a+layer,b,a+layer,b+layer,b)}for(const r of [0,rows])for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+1;indices.push(a,b,a+layer,b,b+layer,a+layer)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;}
  const shell=new THREE.Mesh(ribbonGeometry(1.82,.11,0),shellMaterial);shell.castShadow=shell.receiveShadow=true;shellGroup.add(shell);
  const cover=new THREE.Mesh(ribbonGeometry(1.73,.09,.075),coverMaterial);cover.castShadow=cover.receiveShadow=true;coverGroup.add(cover);
  // Tailored piping follows the actual three-dimensional shell, no flat image on a plane.
  for(const side of [-1,1]){const points=[];for(let i=0;i<=86;i++){const t=i/86,p=profile.getPoint(t),tan=profile.getTangent(t);points.push(new THREE.Vector3(side*.83,p.y+tan.z*.13+.033,p.z-tan.y*.13+.05))}const pipe=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),86,.007,6,false),seamMaterial);pipe.castShadow=true;coverGroup.add(pipe)}
  function tube(points,radius=.034){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,70,radius,12,false),frameMaterial);mesh.castShadow=true;mesh.receiveShadow=true;frameGroup.add(mesh);return mesh;}
  for(const side of [-1,1]){const x=side*.72;tube([[x,1.29,-.38],[x,1.13,-.5],[x,.35,-.68],[x,.14,-.61],[x,.12,-.34],[x,.12,.51],[x,.19,.68],[x,.65,.67],[x,1.1,.56],[x,1.18,.4]],.036)}
  tube([[-.72,1.16,.4],[0,1.13,.42],[.72,1.16,.4]],.03);tube([[-.72,1.26,-.4],[0,1.26,-.4],[.72,1.26,-.4]],.03);
  const feetMat=new THREE.MeshStandardMaterial({color:'#28302a',roughness:.8});for(const x of [-.72,.72])for(const z of [-.47,.48]){const foot=new THREE.Mesh(new THREE.CylinderGeometry(.047,.047,.035,12),feetMat);foot.position.set(x,.066,z);frameGroup.add(foot)}
  // Small, inset fabrication plate on the rear underside.
  const plate=new THREE.Mesh(new THREE.BoxGeometry(.28,.05,.01),frameMaterial);plate.position.set(0,1.25,-.74);shellGroup.add(plate);
  let start=null;host.style.cursor='grab';
  host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;start={x:e.clientX,value:rotationTarget};host.setPointerCapture(e.pointerId);host.style.cursor='grabbing'});host.addEventListener('pointermove',e=>{if(start)rotationTarget=start.value+(e.clientX-start.x)*.006});
  function endDrag(){start=null;host.style.cursor='grab'}host.addEventListener('pointerup',endDrag);host.addEventListener('pointercancel',endDrag);
  // Touch users can use buttons without a horizontal gesture competing with native page scroll.
  const rotateButton=document.createElement('button');rotateButton.className='rotate-touch';rotateButton.textContent='TURN 45° ↻';rotateButton.setAttribute('aria-label','Rotate the chair by 45 degrees');rotateButton.addEventListener('click',()=>rotationTarget+=Math.PI/4);$('.config-foot').append(rotateButton);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.4:1.7));updateProgress()});
  let previous=performance.now();
  function render(now){requestAnimationFrame(render);if(document.hidden){previous=now;return}const dt=Math.min((now-previous)/1000,.05);previous=now;const d=1-Math.exp(-8*dt);progress=reduced.matches?targetProgress:mix(progress,targetProgress,d);rotation=mix(rotation,rotationTarget,d);const mobile=innerWidth<800;
    const sceneProgress=reduced.matches?Math.round(progress):progress;
    const exploded=smooth(.62,1.08,sceneProgress)*(1-smooth(1.35,1.8,sceneProgress));
    coverGroup.position.set(-exploded*.28,exploded*.85,exploded*.12);shellGroup.position.set(exploded*.12,exploded*.29,0);frameGroup.position.y=-exploded*.05;
    const close=smooth(1.65,2.1,sceneProgress)*(1-smooth(2.45,2.95,sceneProgress));
    const contentRight=progress>.65&&progress<1.55||progress>2.65;
    const cameraAngle=(reduced.matches?.64:mix(.64,1.0,close));
    const distance=mobile?8.7:mix(7.8,6.7,close);
    camera.position.set(Math.sin(cameraAngle)*distance,3.8+exploded*.8,Math.cos(cameraAngle)*distance);
    camera.lookAt(mobile?0:contentRight?1.15:-1.13,mobile?2.23:1.5+exploded*.3,0);
    chair.rotation.y=(reduced.matches?.0:mix(-.42,-.04,close))+rotation;
    renderer.render(scene,camera);
  }requestAnimationFrame(render);$('#loading').classList.add('done');
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('no-webgl');$('#drag-hint').textContent='STATIC PREVIEW. CONFIGURATION REMAINS AVAILABLE.'});
}catch(error){document.body.classList.add('no-webgl');$('#loading').classList.add('done');$('#drag-hint').textContent='STATIC PREVIEW. CONFIGURATION REMAINS AVAILABLE.';console.warn('Static furniture view enabled.',error.message)}
