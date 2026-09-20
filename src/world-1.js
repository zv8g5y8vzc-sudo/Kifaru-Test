/* ===== Kifaru Kopje · world part 1: renderer, sky, terrain, flora ===== */
const $=(s,el=document)=>el.querySelector(s);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
let _seed=11;const rnd=()=>{_seed=(_seed*16807)%2147483647;return (_seed-1)/2147483646};
const rr=(a,b)=>a+(b-a)*rnd();
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SMALL=innerWidth<720;

const PY=13;                       // plateau height (the kopje top)
const KC={x:0,z:-190};             // kopje centre
function H(x,z){
  const s0=Math.sin(x*.021+1.3)*Math.cos(z*.017)*2.2+Math.sin(x*.05+z*.043)*.8+Math.sin(z*.011+x*.007)*3;
  const s=smooth(24,64,Math.hypot(x-KC.x,z-KC.z));
  return s0*s+PY*(1-s);
}

let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:!SMALL,powerPreference:'high-performance'});
}catch(e){renderer=null}
if(!renderer){
  document.body.classList.add('no-webgl');
  $('#loader').classList.add('done');
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,SMALL?1.5:2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xffffff,.0026);
const camera=new THREE.PerspectiveCamera(58,1,.3,1500);
scene.add(camera);

const hemi=new THREE.HemisphereLight(0xffffff,0x5a4630,.6);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xffffff,1);
sunLight.castShadow=true;
sunLight.shadow.mapSize.set(SMALL?1024:2048,SMALL?1024:2048);
Object.assign(sunLight.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:420});
sunLight.shadow.bias=-.0006;sunLight.shadow.normalBias=.06;
scene.add(sunLight,sunLight.target);
const moonLight=new THREE.DirectionalLight(0x8fa8ff,0);scene.add(moonLight);
const MOON=new THREE.Vector3(.3,.38,.87).normalize();

/* ---- sky dome ---- */
const skyMat=new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color()},moonDir:{value:MOON},night:{value:0},time:{value:0}},
  vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`
  varying vec3 vDir;uniform vec3 top,hor,sunDir,sunCol,moonDir;uniform float night,time;
  float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  void main(){
    vec3 d=normalize(vDir);
    float h=clamp(d.y,0.,1.);
    vec3 col=mix(hor,top,pow(h,.5));
    float s=max(dot(d,sunDir),0.);
    float up=smoothstep(-.25,.05,sunDir.y);
    col+=sunCol*(pow(s,900.)*4.+pow(s,14.)*.42+pow(s,3.)*.16)*up;
    col=mix(col,hor*.7,smoothstep(0.,-.2,d.y));
    vec3 sp=floor(d*380.);float hs=hash(sp);
    float st=step(.9972,hs)*(.65+.35*sin(time*2.5+hs*90.));
    col+=vec3(.85,.9,1.)*st*night*smoothstep(.0,.35,d.y);
    float m=smoothstep(.9988,.9993,dot(d,moonDir));
    col+=vec3(.95,.95,.85)*m*night*1.2+vec3(.5,.55,.8)*pow(max(dot(d,moonDir),0.),40.)*.25*night;
    gl_FragColor=vec4(col,1.);
  }`
});
const sky=new THREE.Mesh(new THREE.SphereGeometry(1000,32,20),skyMat);
sky.frustumCulled=false;sky.renderOrder=-1;scene.add(sky);

/* sun-elevation colour stops: e, sky top, horizon, sun light, hemi, sun intensity */
const ST=[
  [-.30,'#03040c','#0a0f22','#000000',.30,0],
  [-.10,'#0a0d2c','#2a2352','#303060',.36,0],
  [ .00,'#252a63','#f0703c','#ff7a38',.44,.55],
  [ .10,'#4468ab','#f6b070','#ffa860',.5,.85],
  [ .35,'#3a80c6','#cde0e8','#ffe2b8',.5,1.0],
  [ .90,'#2a72c2','#bcd9ea','#fff3dc',.55,1.1]
].map(a=>({e:a[0],top:new THREE.Color(a[1]),hor:new THREE.Color(a[2]),sun:new THREE.Color(a[3]),amb:a[4],sl:a[5]}));
const _c=new THREE.Color();
function stopAt(e){
  let i=0;while(i<ST.length-2&&e>ST[i+1].e)i++;
  const a=ST[i],b=ST[i+1],t=clamp((e-a.e)/(b.e-a.e));
  return {top:a.top.clone().lerp(b.top,t),hor:a.hor.clone().lerp(b.hor,t),sun:a.sun.clone().lerp(b.sun,t),amb:lerp(a.amb,b.amb,t),sl:lerp(a.sl,b.sl,t)};
}

const TIME={h:0,e:0,night:0,day:1,fire:0,glow:0,sunDir:new THREE.Vector3()};
const glowMats=[];            // {m, base} emissive materials that brighten at dusk
function setTime(h){
  const f=(h-6.33)/12.34;
  const E=Math.sin(Math.PI*clamp(f,-.2,1.2))*1.2;
  const th=.15*Math.PI+clamp(f,-.1,1.1)*.7*Math.PI;
  const sd=TIME.sunDir.set(Math.sin(th)*Math.cos(E),Math.sin(E),-Math.cos(th)*Math.cos(E)).normalize();
  const e=sd.y,s=stopAt(e);
  TIME.h=h;TIME.e=e;
  TIME.night=smooth(.02,-.2,e);
  TIME.day=smooth(.05,.3,e);
  TIME.fire=smooth(.25,-.06,e);
  TIME.glow=smooth(.4,-.05,e);
  const u=skyMat.uniforms;
  u.top.value.copy(s.top);u.hor.value.copy(s.hor);u.sunCol.value.copy(s.sun);u.sunDir.value.copy(sd);u.night.value=TIME.night;
  scene.fog.color.copy(s.hor);
  scene.fog.density=lerp(.0026,.0022,TIME.night);
  hemi.color.copy(s.top).lerp(s.hor,.5).lerp(_c.set('#ffffff'),.25);
  hemi.groundColor.set('#5a4630').multiplyScalar(.4+.6*TIME.day);
  hemi.intensity=s.amb;
  sunLight.color.copy(s.sun);sunLight.intensity=s.sl;
  sunLight.userData.dir=sd;
  moonLight.intensity=.42*TIME.night;
  moonLight.position.copy(MOON).multiplyScalar(200).add(camera.position);
  for(const g of glowMats)g.m.emissiveIntensity=g.base*(.12+.88*TIME.glow);
}

/* ---- geometry helpers ---- */
function build(parts){                // merge parts into one non-indexed, vertex-coloured geometry
  const P=[],N=[],C=[];let n=0;
  for(const pt of parts){
    const g=pt.g.index?pt.g.toNonIndexed():pt.g.clone();
    if(pt.m)g.applyMatrix4(pt.m);
    const p=g.attributes.position.array,nm=g.attributes.normal.array,col=new THREE.Color(pt.c||'#ffffff'),cc=[];
    for(let i=0;i<p.length;i+=9){
      let c=col;
      if(pt.fn)c=pt.fn((p[i]+p[i+3]+p[i+6])/3,(p[i+1]+p[i+4]+p[i+7])/3,(p[i+2]+p[i+5]+p[i+8])/3,col)||col;
      for(let k=0;k<3;k++)cc.push(c.r,c.g,c.b);
    }
    P.push(p);N.push(nm);C.push(Float32Array.from(cc));n+=p.length;
  }
  const cat=(arr)=>{const o=new Float32Array(n);let k=0;for(const a of arr){o.set(a,k);k+=a.length}return o};
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(cat(P),3));
  g.setAttribute('normal',new THREE.BufferAttribute(cat(N),3));
  g.setAttribute('color',new THREE.BufferAttribute(cat(C),3));
  return g;
}
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
function M(x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  _q.setFromEuler(_e.set(rx,ry,rz));
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),_q.clone(),new THREE.Vector3(sx,sy,sz));
}
const BOX=(w,h,d,sx=1,sy=1,sz=1)=>new THREE.BoxGeometry(w,h,d,sx,sy,sz);
const VMAT=()=>new THREE.MeshLambertMaterial({vertexColors:true});
function prism(w,h,l){
  const a=[-w/2,0,-l/2],b=[w/2,0,-l/2],c=[0,h,-l/2],d=[-w/2,0,l/2],e=[w/2,0,l/2],f=[0,h,l/2],v=[];
  const tri=(p,q,r)=>v.push(...p,...q,...r);
  tri(a,c,b);tri(d,e,f);tri(a,d,f);tri(a,f,c);tri(b,c,f);tri(b,f,e);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;
}
function glowTex(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);
}
const GLOW=glowTex();

/* ---- terrain ---- */
{
  const g=new THREE.PlaneGeometry(900,900,SMALL?170:260,SMALL?170:260);
  g.rotateX(-Math.PI/2);g.translate(0,0,-170);
  const pos=g.attributes.position,col=new Float32Array(pos.count*3);
  const cA=new THREE.Color('#9a8552'),cB=new THREE.Color('#6f7640'),cC=new THREE.Color('#5c4e40'),cD=new THREE.Color('#b3a06a'),t=new THREE.Color();
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),y=H(x,z);pos.setY(i,y);
    const n=Math.sin(x*.07)*Math.sin(z*.05)+Math.sin(x*.19+z*.13)*.5+Math.sin(x*.011-z*.013)*.8;
    t.copy(cA).lerp(cB,clamp((n+1.2)/2.4)).lerp(cD,clamp(n*.35-.1));
    t.lerp(cC,smooth(60,28,Math.hypot(x-KC.x,z-KC.z))*.95);
    const j=(Math.sin(i*12.9898)*43758.5453%1)*.05;
    col[i*3]=clamp(t.r+j);col[i*3+1]=clamp(t.g+j);col[i*3+2]=clamp(t.b+j);
  }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
  mesh.receiveShadow=true;scene.add(mesh);
}

/* ---- distant hills ---- */
{
  const g=new THREE.ConeGeometry(1,1,7,1);
  const mat=new THREE.MeshLambertMaterial({color:'#6b6a7c',flatShading:true});
  for(let i=0;i<22;i++){
    const a=i/22*Math.PI*2+rnd()*.2,r=rr(520,640),m=new THREE.Mesh(g,mat);
    if(a>.1&&a<1.1)continue;   // keep the sunrise sector clear
    m.scale.set(rr(120,240),rr(35,95),rr(80,140));
    m.position.set(Math.sin(a)*r,m.scale.y*.5-6,-170-Math.cos(a)*r);
    m.rotation.y=rnd()*6;scene.add(m);
  }
}

/* ---- acacia trees ---- */
const trees=[];
{
  const trunk=build([
    {g:new THREE.CylinderGeometry(.16,.34,4.6,6),m:M(0,2.3,0),c:'#3d2d22'},
    {g:new THREE.CylinderGeometry(.09,.16,2.4,5),m:M(.9,4.9,0,1,1,1,0,0,-.75),c:'#3d2d22'},
    {g:new THREE.CylinderGeometry(.09,.16,2.4,5),m:M(-.8,4.9,.2,1,1,1,0,0,.8),c:'#3d2d22'}
  ]);
  const can=build([
    {g:new THREE.SphereGeometry(1,9,5),m:M(0,5.9,0,5.6,1.05,5.2),c:'#56642f'},
    {g:new THREE.SphereGeometry(1,8,5),m:M(2.6,5.4,1.1,3.4,.85,3.2),c:'#4c5a2b'},
    {g:new THREE.SphereGeometry(1,8,5),m:M(-2.7,5.5,-.8,3.6,.9,3.1),c:'#5a6832'}
  ]);
  const N=SMALL?90:150,tm=new THREE.InstancedMesh(trunk,VMAT(),N+3),cm=new THREE.InstancedMesh(can,VMAT(),N+3);
  const d=new THREE.Object3D();let k=0;
  const put=(x,z,s)=>{
    d.position.set(x,H(x,z)-.1,z);d.rotation.set(0,rnd()*6.28,0);d.scale.set(s,s*rr(.9,1.15),s);d.updateMatrix();
    tm.setMatrixAt(k,d.matrix);cm.setMatrixAt(k,d.matrix);
    cm.setColorAt(k,_c.setHSL(rr(.1,.25),rr(.2,.4),rr(.72,.95)));k++;
    trees.push({x,z,s});
  };
  put(12,-9,1.6);put(-34,-52,1.3);put(30,-60,1.5);   // framing trees for the opening shots
  for(let i=0;i<N;i++){
    const x=rr(-230,230),z=rr(80,-300),dk=Math.hypot(x-KC.x,z-KC.z);
    if(dk<62||(Math.abs(x)<9&&z<40&&z>-175))continue;
    put(x,z,rr(.7,1.5));
  }
  tm.count=cm.count=k;
  tm.castShadow=cm.castShadow=true;tm.receiveShadow=cm.receiveShadow=true;
  scene.add(tm,cm);
}

/* ---- grass tufts & small rocks ---- */
{
  const g=build([
    {g:new THREE.ConeGeometry(.09,.8,3),m:M(0,.4,0,1,1,1,.15,0,.1),c:'#ffffff'},
    {g:new THREE.ConeGeometry(.09,.65,3),m:M(.14,.32,.05,1,1,1,-.1,1,-.2),c:'#ffffff'},
    {g:new THREE.ConeGeometry(.09,.9,3),m:M(-.12,.45,-.06,1,1,1,.05,2,.25),c:'#ffffff'}
  ]);
  const N=SMALL?2600:6000,gm=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({vertexColors:true}),N),d=new THREE.Object3D();let k=0;
  for(let i=0;i<N;i++){
    const x=rr(-55,55),z=rr(50,-172);
    if(Math.hypot(x-KC.x,z-KC.z)<28)continue;
    d.position.set(x,H(x,z),z);d.rotation.set(0,rnd()*6,0);const s=rr(.35,.85);d.scale.set(s,s*rr(.8,1.5),s);d.updateMatrix();
    gm.setMatrixAt(k,d.matrix);gm.setColorAt(k,_c.setHSL(rr(.11,.17),rr(.35,.55),rr(.4,.62)));k++;
  }
  gm.count=k;gm.receiveShadow=true;scene.add(gm);
}
