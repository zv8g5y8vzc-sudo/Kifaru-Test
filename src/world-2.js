/* ===== world part 2: fauna, kopje boulders, balloons ===== */
const ANCH={};                       // world anchors for the hotspots
const v3=(x,y,z)=>new THREE.Vector3(x,y,z);

/* --- species geometry (local +x is forward) --- */
const GD=new THREE.Color('#7a4a26'),GL=new THREE.Color('#d3a25c');
const giraffePatch=(x,y,z)=>(Math.sin(x*7)*Math.sin(y*6+1)+Math.sin(z*9+x*2)*.6>.25?GD:GL);
const legs=(sx,h,y,c,xs,zs,fn)=>{const a=[];for(const x of xs)for(const z of zs)a.push({g:BOX(sx,h,sx,1,4,1),m:M(x,y,z),c,fn});return a};

const G_WILDE=build([
  {g:BOX(1.5,.75,.55),m:M(0,1.15,0),c:'#6a5c4c'},
  {g:BOX(.5,.4,.5),m:M(.45,1.6,0),c:'#5a4d40'},
  {g:BOX(.4,.5,.35),m:M(.9,1.4,0,1,1,1,0,0,-.5),c:'#3f372f'},
  {g:BOX(.6,.42,.34),m:M(1.2,1.2,0),c:'#2d2825'},
  {g:BOX(.06,.5,.06),m:M(-.8,1.0,0),c:'#2d2825'},
  ...legs(.14,.85,.42,'#3a322b',[-.55,.55],[-.2,.2])
]);
const zebraStripe=(x)=>(Math.floor(x*6+40)%2?new THREE.Color('#e9e5dc'):new THREE.Color('#1c1b1b'));
const zebraLeg=(x,y)=>(Math.floor(y*7)%2?new THREE.Color('#e9e5dc'):new THREE.Color('#1c1b1b'));
const G_ZEBRA=build([
  {g:BOX(1.6,.8,.55,12,1,1),m:M(0,1.2,0),c:'#fff',fn:(x)=>zebraStripe(x)},
  {g:BOX(.4,.55,.3,3,1,1),m:M(1.0,1.5,0,1,1,1,0,0,-.55),c:'#fff',fn:(x)=>zebraStripe(x*1.2)},
  {g:BOX(.62,.3,.28),m:M(1.34,1.5,0),c:'#2b2726'},
  {g:BOX(.1,.32,.08),m:M(.85,1.85,0,1,1,1,0,0,-.4),c:'#1c1b1b'},
  ...legs(.13,.82,.41,'#fff',[-.6,.6],[-.18,.18],(x,y)=>zebraLeg(x,y))
]);
const G_GIRAFFE=build([
  {g:BOX(1.7,1.2,.6,6,3,3),m:M(0,3.1,0),c:'#fff',fn:giraffePatch},
  {g:BOX(.4,3.2,.3,1,7,1),m:M(1.15,4.9,0,1,1,1,0,0,-.32),c:'#fff',fn:giraffePatch},
  {g:BOX(.75,.32,.28),m:M(2.05,6.55,0,1,1,1,0,0,-.2),c:'#c69354'},
  {g:BOX(.06,.3,.06),m:M(1.75,6.85,.08),c:'#4a3320'},
  {g:BOX(.06,.3,.06),m:M(1.75,6.85,-.08),c:'#4a3320'},
  {g:BOX(.06,1.1,.06),m:M(-.9,2.9,0),c:'#4a3320'},
  ...legs(.2,2.6,1.3,'#fff',[-.6,.6],[-.2,.2],(x,y,z)=>(y>1.6?giraffePatch(x,y,z):GL))
]);
const G_ELE=build([
  {g:BOX(3,2.2,1.6),m:M(0,2.7,0),c:'#7f7a75'},
  {g:BOX(1.2,1.6,1.3),m:M(1.9,3.0,0),c:'#77726d'},
  {g:BOX(.4,1.9,.4),m:M(2.65,1.9,0,1,1,1,0,0,.15),c:'#77726d'},
  {g:BOX(.12,1.4,1.1),m:M(1.55,3.3,.95,1,1,1,0,-.25,0),c:'#6d6863'},
  {g:BOX(.12,1.4,1.1),m:M(1.55,3.3,-.95,1,1,1,0,.25,0),c:'#6d6863'},
  {g:BOX(.9,.1,.1),m:M(2.75,2.4,.42),c:'#efe6d0'},
  {g:BOX(.9,.1,.1),m:M(2.75,2.4,-.42),c:'#efe6d0'},
  {g:BOX(.08,.9,.08),m:M(-1.55,2.6,0),c:'#5f5b57'},
  ...legs(.62,1.9,.95,'#726d68',[-.95,.95],[-.55,.55])
]);
const G_LION=build([
  {g:BOX(1.1,.7,.65),m:M(-.1,.55,0),c:'#b98b4e'},
  {g:BOX(.7,1.0,.6),m:M(.35,.75,0,1,1,1,0,0,-.2),c:'#b98b4e'},
  {g:BOX(.5,.45,.45),m:M(.85,1.3,0),c:'#c49a5c'},
  {g:BOX(.55,.75,.8),m:M(.7,1.2,0),c:'#6f4423'},
  {g:BOX(.2,.15,.16),m:M(1.15,1.2,0),c:'#3b2a1e'},
  {g:BOX(.16,.7,.16),m:M(.75,.3,.22),c:'#b98b4e'},
  {g:BOX(.16,.7,.16),m:M(.75,.3,-.22),c:'#b98b4e'},
  {g:BOX(.9,.08,.08),m:M(-.95,.18,.1),c:'#a67a40'},
  {g:BOX(.16,.16,.16),m:M(-1.4,.2,.1),c:'#3b2a1e'}
]);

/* --- herds (instanced, drift slowly) --- */
const herds=[];
function herd(geo,n,cx,cz,r,heading){
  const mesh=new THREE.InstancedMesh(geo,VMAT(),n),it=[];
  mesh.castShadow=true;mesh.frustumCulled=false;scene.add(mesh);
  for(let i=0;i<n;i++){
    const a=rnd()*6.28,d=Math.sqrt(rnd())*r;
    it.push({x:cx+Math.cos(a)*d,z:cz+Math.sin(a)*d,h:heading+rr(-.5,.5),v:rr(.25,.8),ph:rnd()*6,s:rr(.85,1.15)});
    mesh.setColorAt(i,_c.setHSL(0,0,rr(.78,.98)));
  }
  herds.push({mesh,it,cx,cz,r});
}
const nWil=SMALL?.6:1;
herd(G_WILDE,Math.round(70*nWil),-22,-80,24,-Math.PI/2);
herd(G_WILDE,Math.round(45*nWil),60,-118,40,-Math.PI/2);
herd(G_WILDE,Math.round(26*nWil),22,-46,12,-Math.PI/2);
herd(G_ZEBRA,26,26,-104,14,-Math.PI/2+.6);
herd(G_ZEBRA,18,-48,-92,12,-Math.PI/2-.4);
ANCH.herd=v3(-7,H(-7,-84)+3.2,-84);
const _d=new THREE.Object3D();
function updateHerds(dt,t){
  for(const h of herds){
    const lim=(h.r*1.35)**2;
    h.it.forEach((a,i)=>{
      a.x+=Math.cos(a.h)*a.v*dt;a.z+=Math.sin(a.h)*a.v*dt;
      if((a.x-h.cx)**2+(a.z-h.cz)**2>lim){a.x=h.cx-(a.x-h.cx)*.92;a.z=h.cz-(a.z-h.cz)*.92}
      _d.position.set(a.x,H(a.x,a.z)+Math.abs(Math.sin(t*a.v*3+a.ph))*.06,a.z);
      _d.rotation.set(0,-a.h,0);_d.scale.setScalar(a.s);_d.updateMatrix();h.mesh.setMatrixAt(i,_d.matrix);
    });
    h.mesh.instanceMatrix.needsUpdate=true;
  }
}

/* --- singles: giraffes, elephants --- */
const singles=[];
function single(geo,x,z,yaw,s,sway){
  const m=new THREE.Mesh(geo,VMAT());m.position.set(x,H(x,z),z);m.rotation.y=yaw;m.scale.setScalar(s);
  m.castShadow=m.receiveShadow=true;scene.add(m);singles.push({m,yaw,sway});return m;
}
single(G_GIRAFFE,10,-70,Math.PI/2+.5,1,.04);
single(G_GIRAFFE,16,-79,Math.PI/2-.3,.92,.05);
single(G_GIRAFFE,5,-87,Math.PI/2+.9,1.08,.03);
ANCH.giraffe=v3(10+1.3,H(10,-70)+6.7,-70-.9);
single(G_ELE,-40,-104,Math.PI/2+.6,1.05,.02);
single(G_ELE,-34,-113,Math.PI/2+.1,.8,.02);
ANCH.elephant=v3(-40+1.5,H(-40,-104)+4.6,-104-.8);
function updateSingles(t){singles.forEach((s,i)=>{s.m.rotation.y=s.yaw+Math.sin(t*.25+i*2)*s.sway})}

/* --- kopje boulders --- */
const boulders=[];
{
  const g=new THREE.IcosahedronGeometry(1,1);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.22*Math.sin(x*3.1+y*2.3)*Math.cos(z*2.7)+.1*Math.sin(y*7+z*5);
    p.setXYZ(i,x*n,y*n*.85,z*n);
  }
  g.computeVertexNormals();
  const N=110,bm=new THREE.InstancedMesh(g,new THREE.MeshPhongMaterial({flatShading:true,shininess:0,specular:0x000000}),N),d=new THREE.Object3D();let k=0;
  const put=(x,z,sx,sy,sz,lift=.35)=>{
    if(k>=N)return;
    d.position.set(x,H(x,z)+sy*lift,z);d.rotation.set(rr(-.2,.2),rnd()*6,rr(-.2,.2));d.scale.set(sx,sy,sz);d.updateMatrix();
    bm.setMatrixAt(k,d.matrix);bm.setColorAt(k,_c.setHSL(rr(.06,.1),rr(.06,.16),rr(.34,.48)));k++;
    boulders.push({x,z,sx,sy});
  };
  put(-11,-167.5,3.2,1.9,2.6,.5);ANCH.lion=v3(-11,H(-11,-167.5)+1.9*.5+1.9*.85+.9,-167.5);
  put(23,-167.5,2.4,1.5,2.1);
  for(let i=0;i<30;i++){ // rocks scattered down the front slope, clear of the road
    const phi=rr(-.95,.95),r=rr(30,60),s=rr(.7,2.3),x=Math.sin(phi)*r;
    if(Math.abs(x)<8)continue;
    put(x,KC.z+Math.cos(phi)*r,s,s*rr(.6,1),s*rr(.8,1.2),.3);
  }
  for(let i=0;i<50;i++){
    const phi=rr(.8,Math.PI*2-.8),r=rr(24,44),s=rr(2,7);
    put(Math.sin(phi)*r,KC.z+Math.cos(phi)*r,s,s*rr(.7,1.1),s*rr(.8,1.2),.25);
  }
  bm.count=k;bm.castShadow=bm.receiveShadow=true;scene.add(bm);
}
{ // the lion, resting on the front boulder and watching the road in
  const l=new THREE.Mesh(G_LION,VMAT());
  l.position.set(-11.4,ANCH.lion.y-.9,-167.5);l.rotation.y=-1.15;l.scale.setScalar(1.25);l.castShadow=true;scene.add(l);
  ANCH.lion.y+=1.1;
}

/* --- hot-air balloons --- */
const balloons=[];
{
  const pts=[];
  for(let i=0;i<=24;i++){const t=i/24;pts.push(new THREE.Vector2(Math.max(.001,Math.sin(Math.PI*Math.pow(t,.72))*(1-.38*(1-t))),t))}
  const cols=['#e8482f','#f4c25a','#f1e6d0','#2f6f6e'].map(c=>new THREE.Color(c));
  const lathe=new THREE.LatheGeometry(pts,48);
  const env=build([{g:lathe,m:M(0,0,0,7,17,7),c:'#fff',fn:(x,y,z)=>cols[Math.floor((Math.atan2(z,x)+Math.PI)/(Math.PI*2)*12)%4]}]);
  const basket=build([{g:BOX(1.4,1,1.4),m:M(0,-1.6,0),c:'#6a4a30'},{g:BOX(.06,1.4,.06),m:M(.6,-.6,.6),c:'#2b2620'},{g:BOX(.06,1.4,.06),m:M(-.6,-.6,-.6),c:'#2b2620'},{g:BOX(.06,1.4,.06),m:M(.6,-.6,-.6),c:'#2b2620'},{g:BOX(.06,1.4,.06),m:M(-.6,-.6,.6),c:'#2b2620'}]);
  const em=new THREE.MeshLambertMaterial({vertexColors:true,emissive:'#ff8a3a',emissiveIntensity:0,side:THREE.DoubleSide});
  const mk=(x,y,z,s,ph)=>{
    const g=new THREE.Group();
    g.add(new THREE.Mesh(env,em),new THREE.Mesh(basket,VMAT()));
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ffb060',blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    fl.scale.set(6,6,1);fl.position.y=-.1;g.add(fl);
    g.position.set(x,y,z);g.scale.setScalar(s);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);
    balloons.push({g,y,x,ph,fl});return g;
  };
  mk(-15,16,-118,1.3,0);mk(38,42,-250,.65,2);mk(-70,34,-310,.55,4);
  ANCH.balloon=v3(-15,16+11,-118);
  balloons.em=em;
}
function updateBalloons(t,p){
  balloons.forEach(b=>{b.g.visible=p<.3});
  balloons.forEach(b=>{b.g.position.y=b.y+Math.sin(t*.35+b.ph)*1.3;b.g.position.x=b.x+Math.sin(t*.08+b.ph)*4;b.fl.material.opacity=.55+.4*Math.sin(t*7+b.ph)*Math.sin(t*3.1)});
  balloons.em.emissiveIntensity=.22*TIME.night+.06;
}
