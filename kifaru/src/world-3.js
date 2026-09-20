/* ===== world part 3: lodge, suite interior, pool, fire, atmosphere ===== */
const lodge=new THREE.Group();scene.add(lodge);
const _mats={};
function mat(c,o){const k=c+(o?JSON.stringify(o):'');return _mats[k]||(_mats[k]=new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:0,specular:0x000000},o)))}
function glow(c,base,o){const m=new THREE.MeshPhongMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:base,shininess:0,specular:0x000000},o));glowMats.push({m,base});return m}
function put3(mesh,x,y,z,ry,parent){mesh.position.set(x,y,z);mesh.rotation.y=ry||0;mesh.castShadow=mesh.receiveShadow=true;(parent||lodge).add(mesh);return mesh}
const bx=(w,h,d,c,x,y,z,ry,parent)=>put3(new THREE.Mesh(BOX(w,h,d),typeof c==='string'?mat(c):c),x,y,z,ry,parent);
const cyl=(rt,rb,h,c,x,y,z,parent,seg=10)=>put3(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),typeof c==='string'?mat(c):c),x,y,z,0,parent);
const WOOD='#5a4331',DARK='#3b2a1e';

/* --- main boma: stone body under a thatched pyramid --- */
{
  const B={x:-2,z:-205};
  bx(16,3.6,8.5,'#7a6a58',B.x,PY+1.8,B.z);
  const wm=glow('#ffb862',1.5);
  for(let i=0;i<5;i++){
    const w=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.3),wm);w.position.set(B.x-6.4+i*3.2,PY+1.9,B.z+4.27);lodge.add(w);
  }
  const roof=new THREE.Mesh(new THREE.ConeGeometry(12.4,5.8,4,1),mat('#9c8550'));
  roof.rotation.y=Math.PI/4;roof.scale.z=.6;roof.position.set(B.x,PY+3.6+2.9,B.z+2);roof.castShadow=true;lodge.add(roof);
  bx(17,.3,3.2,WOOD,B.x,PY+.15,B.z+5.6);
  for(let i=0;i<6;i++)cyl(.18,.2,3.4,'#4a3626',B.x-7.5+i*3,PY+2,B.z+6.6);
}

/* --- decorative tents --- */
function decoTent(x,z,ry){
  const g=new THREE.Group();g.position.set(x,PY,z);g.rotation.y=ry;lodge.add(g);
  bx(5.6,.3,7,WOOD,0,.15,0,0,g);
  put3(new THREE.Mesh(BOX(4.6,2.6,5.6),glow('#d6c69f',.25)),0,1.6,-.2,0,g);
  const roof=new THREE.Mesh(prism(5.8,1.7,7.2),glow('#cbb98f',.3,{side:THREE.DoubleSide}));roof.position.set(0,2.9,.5);roof.castShadow=true;g.add(roof);
  const w=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2),glow('#ffcf86',1.6));w.position.set(0,1.6,2.62);g.add(w);
  bx(4.6,.3,2.4,WOOD,0,.15,4.7,0,g);
  cyl(.07,.07,2.6,DARK,-2.1,1.6,3.9,g);cyl(.07,.07,2.6,DARK,2.1,1.6,3.9,g);
}
decoTent(-15.5,-180,-.75);decoTent(-17.5,-193,-1.4);decoTent(19,-192,1.35);decoTent(14,-200,2.3);decoTent(-16,-202,-2.1);

/* --- pool --- */
const poolMat=new THREE.MeshBasicMaterial({color:'#7fb0c8'});
{
  bx(7.8,.5,3.8,'#8a7a66',-4,PY-.05,-172.5);
  const w=new THREE.Mesh(new THREE.PlaneGeometry(7,3),poolMat);w.rotation.x=-Math.PI/2;w.position.set(-4,PY+.21,-172.5);lodge.add(w);
  bx(.9,.25,1.9,'#efe6d4',-8.8,PY+.9,-172.5);bx(.9,.25,1.9,'#efe6d4',-10.2,PY+.9,-172.5);
}

/* --- path lanterns up to the tents --- */
[[5,-166],[8,-170],[7,-176],[-1.5,-165.5],[-8,-176],[-1,-178],[7,-186],[-8,-196]].forEach(([x,z])=>{
  cyl(.04,.05,1,DARK,x,PY+.5,z);
  const s=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),glow('#ff9f3a',.9));s.position.set(x,PY+1.08,z);lodge.add(s);
});

/* --- our tent: the suite you walk into --- */
const S={x:12,z:-181,w:7,d:9,h:3,rh:4.7},FY=PY+.25;
const suiteLight=new THREE.PointLight('#ffc27a',0,18,1.4);suiteLight.position.set(S.x,FY+2.5,S.z);scene.add(suiteLight);
const lanternLight=new THREE.PointLight('#ffb45a',0,9,1.8);lanternLight.position.set(S.x+1.85,FY+1.15,-184.6);scene.add(lanternLight);
const lantern={on:false,k:0,mat:glow('#ffc46b',.5)};
{
  const canvasW=glow('#d8c8a0',.3);
  bx(S.w+.4,.25,S.d,'#68492f',S.x,PY+.125,S.z);
  bx(S.w,S.h,.12,canvasW,S.x,FY+S.h/2,S.z-S.d/2);
  bx(.12,S.h,S.d,canvasW,S.x-S.w/2,FY+S.h/2,S.z);
  bx(.12,S.h,S.d,canvasW,S.x+S.w/2,FY+S.h/2,S.z);
  const L=S.d+4.4,roof=new THREE.Mesh(prism(S.w+1.5,S.rh-S.h,L),glow('#d6c59b',.4,{side:THREE.DoubleSide}));
  roof.position.set(S.x,FY+S.h,-185.9+L/2);roof.castShadow=true;lodge.add(roof);
  bx(.22,.22,L,DARK,S.x,FY+S.rh-.1,-185.9+L/2);
  [-2.3,0,2.3].forEach(dz=>{ /* rafters */
    const a=Math.atan2(S.rh-S.h,(S.w+1.5)/2);
    bx(4.6,.1,.12,DARK,S.x-2.05,FY+S.h+.75,S.z+dz,0).rotation.z=a;
    bx(4.6,.1,.12,DARK,S.x+2.05,FY+S.h+.75,S.z+dz,0).rotation.z=-a;
  });
  // deck out front
  bx(S.w+.4,.25,4,WOOD,S.x,PY+.125,-174.5);
  cyl(.09,.09,3.3,DARK,S.x-3.6,FY+1.6,-172.7);cyl(.09,.09,3.3,DARK,S.x+3.6,FY+1.6,-172.7);
  bx(.08,.08,4,DARK,S.x-3.6,FY+1,-174.5);bx(.08,.08,4,DARK,S.x+3.6,FY+1,-174.5);
  // lounge chairs facing the plains
  [-1.8,1.8].forEach(dx=>{
    bx(.85,.4,1.6,'#4a3626',S.x+dx,FY+.25,-174.3);
    bx(.75,.14,1.4,'#b8905a',S.x+dx,FY+.52,-174.3);
    bx(.75,.7,.12,'#b8905a',S.x+dx,FY+.85,-173.6).rotation.x=.4;
  });
  bx(.7,.06,.7,'#3b2a1e',S.x,FY+.55,-174.6);cyl(.06,.06,.55,DARK,S.x,FY+.27,-174.6);
  // rug
  bx(4.2,.03,3.2,'#7a3b2b',S.x,FY+.02,-181.1);bx(3.5,.035,2.5,'#c99a52',S.x,FY+.03,-181.1);bx(2.8,.04,1.8,'#7a3b2b',S.x,FY+.04,-181.1);
  // bed under a net
  bx(2.5,.45,2.4,DARK,S.x,FY+.22,-183.6);
  bx(2.36,.34,2.25,'#efe9df',S.x,FY+.62,-183.6);
  bx(2.7,1.5,.16,'#4a3324',S.x,FY+.75,-184.85);
  [-.6,.6].forEach(dx=>{bx(.85,.2,.5,'#fbf7ef',S.x+dx,FY+.9,-184.3);bx(.85,.2,.5,'#e9dfcc',S.x+dx*1.05,FY+.98,-184.0).rotation.x=.3});
  bx(2.36,.07,1,'#a8562a',S.x,FY+.81,-183.0);
  [[-1.4,-182.3],[1.4,-182.3],[-1.4,-184.9],[1.4,-184.9]].forEach(([dx,z])=>cyl(.04,.04,2.5,DARK,S.x+dx,FY+1.25,z));
  bx(2.9,2.2,2.7,new THREE.MeshPhongMaterial({color:'#ffffff',shininess:0,specular:0x000000,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}),S.x,FY+1.25,-183.6).castShadow=false;
  // bedside tables + the lantern
  bx(.55,.55,.55,'#4a3626',S.x-1.85,FY+.28,-184.6);bx(.55,.55,.55,'#4a3626',S.x+1.85,FY+.28,-184.6);
  cyl(.13,.13,.34,lantern.mat,S.x+1.85,FY+.75,-184.6);cyl(.16,.17,.06,DARK,S.x+1.85,FY+.58,-184.6);cyl(.02,.17,.1,DARK,S.x+1.85,FY+.95,-184.6);
  // copper bath
  const tubM=new THREE.MeshPhongMaterial({color:'#b8713a',shininess:0,specular:0x000000,emissive:'#4a2208',side:THREE.DoubleSide});
  const tub=new THREE.Mesh(new THREE.CylinderGeometry(.55,.45,.72,24,1,true),tubM);tub.scale.set(.9,1,1.9);put3(tub,S.x-2.7,FY+.36,-181.6);
  const water=new THREE.Mesh(new THREE.CircleGeometry(.5,24),new THREE.MeshBasicMaterial({color:'#8fbfd0'}));water.rotation.x=-Math.PI/2;water.scale.set(.85,1.8,1);water.position.set(S.x-2.7,FY+.58,-181.6);lodge.add(water);
  // writing desk & pendant lamps
  bx(.7,.08,1.5,'#5a4331',S.x+3.05,FY+.78,-181.4);bx(.06,.78,.06,DARK,S.x+3.05,FY+.39,-180.75);bx(.06,.78,.06,DARK,S.x+3.05,FY+.39,-182.05);
  [-1.6,1.6].forEach(dx=>{
    cyl(.01,.01,1.4,DARK,S.x+dx,FY+3.7,-181);
    const l=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),glow('#ffcf86',1.8));l.position.set(S.x+dx,FY+2.95,-181);lodge.add(l);
  });
}
function setLantern(on){lantern.on=on;const b=$('#lanternBtn');if(b)b.textContent=on?'Blow it out':'Light the lantern'}

/* --- fire pit --- */
const FIRE={x:-6,z:-187};
const fireG=new THREE.Group();fireG.position.set(FIRE.x,PY,FIRE.z);scene.add(fireG);
const flames=[];
const fireLight=new THREE.PointLight('#ff8a3a',0,20,1.6);fireLight.position.set(FIRE.x,PY+1.4,FIRE.z);scene.add(fireLight);
const fireGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ff9a48',blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:0}));
fireGlow.scale.set(6,6,1);fireGlow.position.y=1;fireG.add(fireGlow);
{
  for(let i=0;i<11;i++){const a=i/11*6.28;const s=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,0),mat('#6b6156'));put3(s,Math.cos(a)*1.05,.12,Math.sin(a)*1.05,0,fireG)}
  for(let i=0;i<5;i++){const l=cyl(.11,.11,1.5,'#2f2219',0,.2,0,fireG,7);l.rotation.z=Math.PI/2;l.rotation.y=i*1.26;l.position.y=.18+i*.02}
  for(let i=0;i<7;i++){const a=i/7*6.28+.3;const s=cyl(.3,.3,.42,'#5a4331',Math.cos(a)*3,.21,Math.sin(a)*3,fireG,9);s.rotation.y=a}
  [[.36,1.4,'#ff8a2b'],[.27,1.05,'#ffc247'],[.16,.75,'#fff0a0']].forEach(([r,h,c],i)=>{
    const g=new THREE.ConeGeometry(r,h,7,1,true);g.translate(0,h/2,0);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
    m.position.y=.3;m.userData.h=1+i*.1;fireG.add(m);flames.push(m);
  });
}
const SPK=90,spkPos=new Float32Array(SPK*3),spkV=[];
for(let i=0;i<SPK;i++){spkV.push({vx:rr(-.4,.4),vy:rr(.9,2.2),vz:rr(-.4,.4),life:rnd()*4});spkPos[i*3+1]=-99}
const spkGeo=new THREE.BufferGeometry();spkGeo.setAttribute('position',new THREE.BufferAttribute(spkPos,3));
const sparks=new THREE.Points(spkGeo,new THREE.PointsMaterial({map:GLOW,color:'#ffb060',size:.28,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));
sparks.frustumCulled=false;scene.add(sparks);

/* --- dust in the light by day, fireflies by night --- */
const DN=SMALL?140:260,dBase=new Float32Array(DN*3),dPos=new Float32Array(DN*3);
for(let i=0;i<DN*3;i++)dBase[i]=rnd();
const dGeo=new THREE.BufferGeometry();dGeo.setAttribute('position',new THREE.BufferAttribute(dPos,3));
const dust=new THREE.Points(dGeo,new THREE.PointsMaterial({map:GLOW,size:.2,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.4,color:'#ffe3a8'}));
dust.frustumCulled=false;scene.add(dust);
const DAY_C=new THREE.Color('#ffe3a8'),NIGHT_C=new THREE.Color('#c8ff7a');

function updateAtmosphere(dt,t){
  // fire
  const fk=TIME.fire;
  flames.forEach((f,i)=>{const fl=(.8+.35*Math.sin(t*9+i*2)*Math.sin(t*5.3+i)+rnd()*.12);f.scale.set(1+.1*Math.sin(t*7+i),Math.max(.01,f.userData.h*fl*fk),1+.1*Math.cos(t*6+i));f.rotation.y=t*.8+i});
  fireLight.intensity=fk*(2.4+Math.sin(t*11)*.35+rnd()*.35);
  fireGlow.material.opacity=fk*(.5+.12*Math.sin(t*8));
  sparks.material.opacity=fk;
  for(let i=0;i<SPK;i++){
    const s=spkV[i];s.life-=dt;
    if(s.life<=0){s.life=rr(2,4);spkPos[i*3]=FIRE.x+rr(-.3,.3);spkPos[i*3+1]=PY+.6;spkPos[i*3+2]=FIRE.z+rr(-.3,.3);s.vx=rr(-.35,.35);s.vy=rr(.9,2);s.vz=rr(-.35,.35)}
    spkPos[i*3]+=s.vx*dt+Math.sin(t*2+i)*.004;spkPos[i*3+1]+=s.vy*dt;spkPos[i*3+2]+=s.vz*dt;
  }
  spkGeo.attributes.position.needsUpdate=true;
  // lantern and the tent's own light
  lantern.k+=((lantern.on?1:0)-lantern.k)*Math.min(1,dt*5);
  lantern.mat.emissiveIntensity=.5+2.2*lantern.k;
  lanternLight.intensity=lantern.k*(1.3+Math.sin(t*9)*.05);
  suiteLight.intensity=1.5+TIME.glow*1.2;
  // pool mirrors the sky
  poolMat.color.copy(skyMat.uniforms.top.value).lerp(skyMat.uniforms.hor.value,.45).multiplyScalar(1.05);
  // dust / fireflies drift around the camera
  const L=46,cp=camera.position;
  for(let i=0;i<DN;i++){
    const b=i*3;
    dPos[b]=cp.x+((dBase[b]*L+t*.35*(1+dBase[b+1]))%L)-L/2;
    dPos[b+1]=cp.y-4+((dBase[b+1]*16+t*.12)%16)+Math.sin(t*.7+i)*.3;
    dPos[b+2]=cp.z+((dBase[b+2]*L-t*.2)%L+L)%L-L/2;
  }
  dGeo.attributes.position.needsUpdate=true;
  dust.material.color.copy(DAY_C).lerp(NIGHT_C,TIME.night);
  dust.material.size=.16+.1*TIME.night;
  dust.material.opacity=.32+.5*TIME.night*(.6+.4*Math.sin(t*3));
}
