/* ===== journey: scroll-driven camera, time of day, hotspots, look-around, sound ===== */
scene.add(moonLight.target);
const CH=[
  {p:0,n:'First light'},{p:.2,n:'The plains'},{p:.42,n:'The kopje'},{p:.6,n:'Arrival'},
  {p:.74,n:'Your tent'},{p:.87,n:'Sundowner'},{p:1,n:'The fire'}
];
const K=[
  {p:0,   pos:[0,3.4,24],     tgt:[7,6.5,-60],      h:6.4},
  {p:.10, pos:[1,3.2,-8],     tgt:[-3,4.6,-70],     h:7.9},
  {p:.20, pos:[-1,3.1,-40],   tgt:[-2,3.8,-90],     h:9.5},
  {p:.31, pos:[0,3.6,-88],    tgt:[0,9.5,-190],     h:12},
  {p:.42, pos:[0,9.5,-116],   tgt:[-1,15.5,-190],    h:14.7},
  {p:.52, pos:[2,12.5,-150],  tgt:[6,14.5,-185],    h:15.9},
  {p:.60, pos:[4,15.3,-168],  tgt:[11,14.6,-182],   h:16.5},
  {p:.67, pos:[10,15,-173.5], tgt:[12,14.4,-184],   h:17.05},
  {p:.74, pos:[12,14.9,-178.5],tgt:[12.5,14.3,-185],h:17.5},
  {p:.80, pos:[11.6,14.9,-175.6],tgt:[8,14.9,-150], h:18},
  {p:.87, pos:[11.5,14.9,-174.5],tgt:[22,15.4,-120], h:18.67},
  {p:.93, pos:[3,14.9,-176],  tgt:[-1,15.2,-150],   h:19.5},
  {p:1,   pos:[-6.5,14.9,-192.5],tgt:[-4,21,-120],  h:20.5}
].map(k=>({p:k.p,pos:v3(...k.pos),tgt:v3(...k.tgt),h:k.h}));

const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function sample(p){
  let i=0;while(i<K.length-2&&p>K[i+1].p)i++;
  const a=K[Math.max(i-1,0)],b=K[i],c=K[i+1],d=K[Math.min(i+2,K.length-1)],t=clamp((p-b.p)/(c.p-b.p));
  const out={pos:v3(0,0,0),tgt:v3(0,0,0),h:lerp(b.h,c.h,t)};
  for(const k of['x','y','z']){out.pos[k]=cr(a.pos[k],b.pos[k],c.pos[k],d.pos[k],t);out.tgt[k]=cr(a.tgt[k],b.tgt[k],c.tgt[k],d.tgt[k],t)}
  return out;
}

/* ---- DOM ---- */
const journey=$('#journey'),reserveEl=$('#reserve');
let maxScroll=1;
let reserveTop=1e9;
function measure(){maxScroll=Math.max(1,journey.offsetHeight-innerHeight);reserveTop=reserveEl.offsetTop-innerHeight*.55}
function goP(p){scrollTo({top:p*maxScroll,behavior:REDUCED?'auto':'smooth'})}
function goReserve(){scrollTo({top:reserveEl.offsetTop-40,behavior:REDUCED?'auto':'smooth'})}
window.goReserve=goReserve;
const rail=$('#rail');
CH.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`${c.n}<i></i>`;b.setAttribute('aria-label','Go to '+c.n);b.onclick=()=>goP(c.p);rail.appendChild(b)});
document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');if(go){goP(CH[+go.dataset.go].p);return}
  const hold=e.target.closest('[data-hold]');if(hold){Booking.selectTent(hold.dataset.hold);goReserve();return}
  const a=e.target.closest('a[href^="#"]');
  if(a){e.preventDefault();if(a.getAttribute('href')==='#reserve')goReserve();else scrollTo({top:0,behavior:'smooth'})}
});
$('#lanternBtn').onclick=()=>setLantern(!lantern.on);

/* ---- info card ---- */
const info=$('#info');let infoP=null;
const ADDONS={balloon:'Balloon safari at dawn',guide:'Private guide & vehicle',night:'Night drive',dinner:'Bush dinner under the stars'};
function openInfo(h){
  const c=h.card;infoP=pS;
  $('#infoK').textContent=c.k;$('#infoTitle').textContent=c.t;$('#infoP').textContent=c.p;
  $('#infoDl').innerHTML=(c.dl||[]).map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
  const row=$('#infoRow');row.innerHTML='';
  if(c.add){const b=document.createElement('button');b.className='btn sm';b.type='button';
    const paint=()=>{b.textContent=Booking.has(c.add)?'Added ✓ Remove':`Add to my stay · ${Booking.price(c.add)}`};paint();
    b.onclick=()=>{Booking.toggleAddon(c.add);paint();toast(Booking.has(c.add)?`${ADDONS[c.add]} added to your stay`:`${ADDONS[c.add]} removed`)};row.appendChild(b)}
  if(c.hold){const b=document.createElement('button');b.className='btn sm';b.type='button';b.textContent='Hold this tent';b.onclick=()=>{closeInfo();Booking.selectTent('kopje');goReserve()};row.appendChild(b)}
  info.classList.add('open');
}
function closeInfo(){info.classList.remove('open');infoP=null}
$('#infoX').onclick=closeInfo;
addEventListener('keydown',e=>{if(e.key==='Escape')closeInfo()});
let toastT;function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
window.toast=toast;

/* ---- hotspots ---- */
const suiteAnch={bath:v3(S.x-2.7,FY+1.1,-181.6),bed:v3(S.x,FY+1.75,-183.6),lantern:v3(S.x+1.85,FY+1.25,-184.6),fire:v3(FIRE.x,PY+1.9,FIRE.z)};
const HS=[
  {p:[0,.14],a:ANCH.balloon,label:'Dawn balloon',card:{k:'06:15 · Above the plains',t:'Balloon safari at dawn',p:'Lift off before the sun clears the horizon and drift over the herds at first light, then land for a bush breakfast with sparkling wine.',dl:[['Lift-off','05:45 from the airstrip'],['Time aloft','About 60 minutes'],['Group size','Up to 8']],add:'balloon'}},
  {p:[.12,.3],a:ANCH.herd,label:'Wildebeest',card:{k:'The herd',t:'Wildebeest',p:'Around 1.3 million follow the rains through the Serengeti. In peak calving season roughly 8,000 calves are born each day, and most can run within minutes.',dl:[['Weight','160–260 kg'],['Top speed','About 80 km/h'],['Calving','January–March']],add:'guide'}},
  {p:[.12,.3],a:ANCH.giraffe,label:'Masai giraffe',card:{k:'Tallest animal alive',t:'Masai giraffe',p:'A bull can stand 5.5 metres tall. Look for them among the acacias in the first hour of light, when they feed before the heat.',dl:[['Height','Up to 5.5 m'],['Heart','Weighs about 11 kg'],['Best seen','06:00–08:30']],add:'guide'}},
  {p:[.12,.3],a:ANCH.elephant,label:'Elephant',card:{k:'Matriarch country',t:'African elephant',p:'Herds are led by the oldest female, who remembers where water was found decades ago. They eat around 150 kg a day.',dl:[['Weight','Up to 6 tonnes'],['Herd','10–20 related females'],['Best seen','Late afternoon']],add:'guide'}},
  {p:[.3,.56],a:ANCH.lion,label:'Lion',card:{k:'On the rock',t:'The kopje pride',p:'A kopje is a lookout, and lions know it. They rest for up to 20 hours a day and choose the warm granite at midday. After dark they hunt the plain below your tent.',dl:[['Rest','16–20 hours a day'],['Pride','Up to 15 animals'],['Best seen','Dawn and dusk']],add:'night'}},
  {p:[.64,.8],a:suiteAnch.bed,label:'The bed',card:{k:'48 m² of canvas, teak and copper',t:'King bed, under a net',p:'Cotton sheets, a mosquito net you can tuck in yourself, and a hot-water bottle at turndown. At 1,620 m the nights can fall to 12°C.',dl:[['Sleeps','2 adults, or 2 + 1 child'],['Bedding','Cotton, 400 thread count']],hold:true}},
  {p:[.64,.8],a:suiteAnch.bath,label:'Copper bath',card:{k:'Filled to order',t:'The bath',p:'Freestanding copper, positioned to face the plains. Ask at four and it is hot and waiting when the light turns.',dl:[['Water','Solar heated, always hot'],['View','Open flap, facing south']],hold:true}},
  {p:[.66,.8],a:suiteAnch.lantern,label:'Lantern',action:()=>{setLantern(!lantern.on);toast(lantern.on?'Lantern lit':'Lantern out')}},
  {p:[.9,1.01],a:suiteAnch.fire,label:'The fire',card:{k:'20:30 · The boma',t:'Dinner around the fire',p:'A long table set beside the fire, a three-course menu cooked on coals, and your host telling the story of the rock. Wildlife stays on the other side of the light.',dl:[['Served','From 20:00'],['Dress','Warm layers']],add:'dinner'}}
];
HS.forEach(h=>{
  const el=document.createElement('div');el.className='hs';
  el.innerHTML=`<button type="button" aria-label="${h.label}"><span class="ring"></span><span class="lbl">${h.label}</span></button>`;
  document.body.appendChild(el);h.el=el;
  el.querySelector('button').onclick=()=>h.action?h.action():openInfo(h);
});
const _v=new THREE.Vector3();
function updateHotspots(){
  camera.updateMatrixWorld();
  const W=innerWidth,Hh=innerHeight;
  for(const h of HS){
    const w=smooth(h.p[0]-.02,h.p[0]+.02,pS)*(1-smooth(h.p[1]-.02,h.p[1]+.02,pS));
    _v.copy(h.a).project(camera);
    const vis=w>.02&&_v.z<1&&_v.z>0&&Math.abs(_v.x)<.96&&Math.abs(_v.y)<.9;
    h.el.style.opacity=vis?w:0;
    h.el.classList.toggle('on',vis&&w>.4);
    if(vis)h.el.style.transform=`translate(${(_v.x*.5+.5)*W}px,${(-_v.y*.5+.5)*Hh}px)`;
  }
  if(infoP!==null&&Math.abs(pS-infoP)>.06)closeInfo();
}

/* ---- look-around: mouse parallax + drag ---- */
const look={mx:0,my:0,yaw:0,pitch:0,dyaw:0,dpitch:0,drag:false,lx:0,ly:0};
const cv=$('#gl');cv.style.touchAction='pan-y';
addEventListener('pointermove',e=>{look.mx=(e.clientX/innerWidth-.5)*2;look.my=(e.clientY/innerHeight-.5)*2});
cv.addEventListener('pointerdown',e=>{look.drag=true;look.lx=e.clientX;look.ly=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{
  if(!look.drag)return;
  look.dyaw=clamp(look.dyaw-(e.clientX-look.lx)*.0042,-.9,.9);look.dpitch=clamp(look.dpitch+(e.clientY-look.ly)*.003,-.4,.4);
  look.lx=e.clientX;look.ly=e.clientY;
});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{look.drag=false}));

/* ---- ambient sound (synthesised, off until asked) ---- */
const AU={ctx:null,on:false};
function audioInit(){
  const c=AU.ctx=new (window.AudioContext||window.webkitAudioContext)();
  const master=AU.master=c.createGain();master.gain.value=0;master.connect(c.destination);
  const noise=(sec,brown)=>{const b=c.createBuffer(1,c.sampleRate*sec,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(brown){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b};
  const wsrc=c.createBufferSource();wsrc.buffer=noise(4,true);wsrc.loop=true;
  const wf=c.createBiquadFilter();wf.type='lowpass';wf.frequency.value=420;AU.wind=c.createGain();AU.wind.gain.value=.05;
  wsrc.connect(wf);wf.connect(AU.wind);AU.wind.connect(master);wsrc.start();
  const o=c.createOscillator();o.frequency.value=4300;const pulse=c.createGain();pulse.gain.value=.5;
  const lf=c.createOscillator();lf.type='square';lf.frequency.value=7;const lg=c.createGain();lg.gain.value=.5;lf.connect(lg);lg.connect(pulse.gain);
  AU.crick=c.createGain();AU.crick.gain.value=0;o.connect(pulse);pulse.connect(AU.crick);AU.crick.connect(master);o.start();lf.start();
  const fsrc=c.createBufferSource();fsrc.buffer=noise(2,false);fsrc.loop=true;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=2200;AU.fire=c.createGain();AU.fire.gain.value=0;
  fsrc.connect(hp);hp.connect(AU.fire);AU.fire.connect(master);fsrc.start();
  setInterval(()=>{if(!AU.on||TIME.fire<.05)return;const t=c.currentTime;AU.fire.gain.cancelScheduledValues(t);AU.fire.gain.setValueAtTime(Math.max(.003,Math.random()*.16*TIME.fire),t);AU.fire.gain.exponentialRampToValueAtTime(.001,t+.09)},120);
  setInterval(()=>{if(!AU.on||TIME.day<.35||Math.random()<.5)return;
    const t=c.currentTime,os=c.createOscillator(),g=c.createGain(),f=2000+Math.random()*1800;
    os.frequency.setValueAtTime(f,t);os.frequency.exponentialRampToValueAtTime(f*1.5,t+.1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.16);
    os.connect(g);g.connect(master);os.start(t);os.stop(t+.2)},700);
}
$('#soundBtn').onclick=()=>{
  if(!AU.ctx)audioInit();
  AU.on=!AU.on;AU.ctx.resume();
  AU.master.gain.setTargetAtTime(AU.on?.9:0,AU.ctx.currentTime,.4);
  const b=$('#soundBtn');b.textContent=AU.on?'Sound on':'Sound off';b.setAttribute('aria-pressed',AU.on);
};
function updateAudio(t){if(!AU.on)return;AU.wind.gain.value=.045+.03*Math.sin(t*.4)*Math.sin(t*.13);AU.crick.gain.value=.028*TIME.night}

/* ---- main loop ---- */
function resize(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.fov=w/h<.9?74:w/h<1.4?64:58;camera.updateProjectionMatrix();measure();
}
addEventListener('resize',resize);resize();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
addEventListener('load',measure);

let pS=0,last=performance.now(),tt=0,frames=0,lastHour=-1,lastCh=-1;
const fwd=new THREE.Vector3(),focus=new THREE.Vector3(),sdir=new THREE.Vector3();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;tt+=dt;
  const pT=clamp(scrollY/maxScroll);
  document.body.classList.toggle('in-reserve',scrollY>reserveTop);
  pS+=(pT-pS)*(1-Math.exp(-dt*(REDUCED?30:4.5)));
  const s=sample(pS);
  const cp=s.pos;cp.y=Math.max(cp.y,H(cp.x,cp.z)+1.6)+Math.sin(tt*1.1)*.025;
  camera.position.copy(cp);camera.lookAt(s.tgt);
  // look-around
  if(!look.drag){look.dyaw*=Math.exp(-dt*1.6);look.dpitch*=Math.exp(-dt*1.6)}
  const pm=REDUCED?0:1;
  camera.rotateY(-(look.mx*.05*pm+look.dyaw));
  camera.rotateX(-look.my*.025*pm+look.dpitch);

  setTime(s.h);
  moonLight.position.copy(MOON).multiplyScalar(200).add(camera.position);moonLight.target.position.copy(camera.position);
  camera.getWorldDirection(fwd);focus.copy(camera.position).addScaledVector(fwd,24);
  sdir.copy(TIME.sunDir);sdir.y=Math.max(sdir.y,.08);sdir.normalize();
  sunLight.target.position.copy(focus);sunLight.position.copy(focus).addScaledVector(sdir,180);
  sky.position.copy(camera.position);skyMat.uniforms.time.value=tt;

  if(pS<.58)updateHerds(dt,tt);
  updateSingles(tt);updateBalloons(tt,pS);updateAtmosphere(dt,tt);updateAudio(tt);
  updateHotspots();
  renderer.render(scene,camera);

  // HUD
  const hr=Math.floor(s.h),mn=Math.floor((s.h-hr)*60/5)*5;
  const hh=hr+':'+String(mn).padStart(2,'0');
  if(hh!==lastHour){lastHour=hh;$('#hud-time').textContent=String(hr).padStart(2,'0')+':'+String(mn).padStart(2,'0')}
  let ci=0,bd=9;CH.forEach((c,i)=>{const d=Math.abs(c.p-pS);if(d<bd){bd=d;ci=i}});
  if(ci!==lastCh){lastCh=ci;$('#hud-name').textContent=CH[ci].n;[...rail.children].forEach((b,i)=>b.classList.toggle('on',i===ci))}
  if(++frames===2)$('#loader').classList.add('done');
}
requestAnimationFrame(frame);
