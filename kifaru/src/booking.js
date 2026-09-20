/* ===== booking: live pricing, tents, experiences, checkout ===== */
const Booking=(function(){
  const $=(s,el=document)=>el.querySelector(s);
  const money=n=>'$'+Math.round(n).toLocaleString('en-US');
  const TENTS=[
    {id:'kopje',name:'Kopje Tent',size:'48 m²',cap:3,units:3,rate:1180,d:'King bed under a net, copper bath and a private deck facing the plains.',n:1},
    {id:'ridge',name:'Ridge Suite',size:'72 m²',cap:4,units:1,rate:1640,d:'Two rooms, a plunge pool and a dining deck on the edge of the rock.',n:2},
    {id:'baobab',name:'Family House',size:'96 m²',cap:6,units:2,rate:1420,d:'Two bedrooms and a shared lounge. Children get their own ranger.',n:3}
  ];
  const XP=[
    {id:'balloon',name:'Balloon safari at dawn',d:'An hour over the herds, then breakfast in the bush.',price:600,unit:'pp'},
    {id:'guide',name:'Private guide & vehicle',d:'Your own vehicle, guide and schedule for every day of your stay.',price:420,unit:'day'},
    {id:'night',name:'Night drive',d:'A spotlight drive in our private concession, when the hunters wake.',price:160,unit:'pp'},
    {id:'dinner',name:'Bush dinner under the stars',d:'A table beside the boma fire and three courses cooked on coals.',price:180,unit:'pp'}
  ];
  const FEE_ADULT=95,FEE_CHILD=30;
  const SEASONS=[ // by month index
    ['Festive season',1.15],['Calving season',1.1],['Calving season',1.1],['Calving season',1.1],['Green season',.78],['Green season',.78],
    ['Peak season',1.25],['Peak season',1.25],['Peak season',1.25],['Peak season',1.25],['Green season',.78],['Festive season',1.15]
  ];
  SEASONS[0]=['Calving season',1.1];

  const iso=d=>d.toISOString().slice(0,10);
  const addDays=(d,n)=>{const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x};
  const today=new Date(iso(new Date())+'T00:00:00Z');
  const st={cin:addDays(today,120),cout:addDays(today,123),adults:2,kids:0,tent:'kopje',xp:new Set(),dirty:false};
  const nightsOf=()=>Math.max(1,Math.round((st.cout-st.cin)/864e5));
  const seasonAt=i=>SEASONS[addDays(st.cin,i).getUTCMonth()];

  function quote(){
    const n=nightsOf(),t=TENTS.find(x=>x.id===st.tent),lines=[];
    let base=0,kid=0,seasons=new Set();
    for(let i=0;i<n;i++){const [name,m]=seasonAt(i);seasons.add(name);base+=t.rate*m;kid+=t.rate*m*.5}
    const guests=st.adults+st.kids;
    lines.push([`${t.name}`,base*st.adults,`${n} night${n>1?'s':''} × ${st.adults} adult${st.adults>1?'s':''}`]);
    if(st.kids)lines.push(['Children',kid*st.kids,`${n} night${n>1?'s':''} × ${st.kids} at half rate`]);
    lines.push(['Park & conservation fees',n*(st.adults*FEE_ADULT+st.kids*FEE_CHILD),'Paid to the park authority']);
    for(const x of XP)if(st.xp.has(x.id)){
      const q=x.unit==='pp'?guests:n;
      lines.push([x.name,x.price*q,x.unit==='pp'?`${guests} guest${guests>1?'s':''} × ${money(x.price)}`:`${n} day${n>1?'s':''} × ${money(x.price)}`]);
    }
    const total=lines.reduce((a,l)=>a+l[1],0);
    return {n,t,lines,total,seasons:[...seasons],guests};
  }
  function avail(t){ // sample availability, deterministic per tent and date
    const h=[...(t.id+iso(st.cin))].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
    return 1+h%t.units;
  }

  function renderTents(){
    const box=$('#tents');if(box.dataset.done)return;box.dataset.done=1;
    box.innerHTML=TENTS.map(t=>{
      let tents='';for(let i=0;i<t.n;i++){const x=10+i*36+(t.n===1?45:t.n===2?26:0),s=t.n===1?1:.72;
        tents+=`<g transform="translate(${x} ${74-58*s}) scale(${s})"><path d="M0 58 32 6l32 52Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M32 6v52M22 58l10-24 10 24" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M25 58l7-17 7 17Z" fill="#f08a2e" opacity=".85"/></g>`}
      return `<label class="tent"><input type="radio" name="tent" value="${t.id}" id="tent-${t.id}"><span class="in">
        <svg viewBox="0 0 160 84" aria-hidden="true"><path d="M0 76H160" stroke="currentColor" stroke-opacity=".35"/>${tents}</svg>
        <h3>${t.name}</h3><span class="k" style="font:400 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)">${t.size} · sleeps ${t.cap}</span>
        <p>${t.d}</p><span class="pr" data-pr="${t.id}"></span><span class="avail" data-av="${t.id}"></span></span></label>`}).join('');
    $('#xps').innerHTML=XP.map(x=>`<label class="xp" for="xp-${x.id}"><input type="checkbox" id="xp-${x.id}" value="${x.id}"><span><b>${x.name}</b><small>${x.d}</small></span><span class="pp">${money(x.price)} ${x.unit==='pp'?'pp':'/ day'}</span></label>`).join('');
    // 3D tilt
    box.querySelectorAll('.tent').forEach(el=>{
      const inn=el.querySelector('.in');
      el.addEventListener('pointermove',e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;inn.style.transform=`rotateY(${x*12}deg) rotateX(${-y*10}deg)`});
      el.addEventListener('pointerleave',()=>{inn.style.transform=''});
    });
  }

  function render(){
    const q=quote();
    $('#cin').value=iso(st.cin);$('#cout').value=iso(st.cout);$('#cout').min=iso(addDays(st.cin,1));
    $('#adults').textContent=st.adults;$('#kids').textContent=st.kids;
    $('#season').innerHTML=`${q.seasons.map(s=>`<span class="pill">${s}</span>`).join('')}<span>${q.n} night${q.n>1?'s':''} · ${q.guests} guest${q.guests>1?'s':''}</span>`;
    const [, m0]=seasonAt(0);
    TENTS.forEach(t=>{
      $(`#tent-${t.id}`).checked=t.id===st.tent;
      $(`[data-pr="${t.id}"]`).textContent=`${money(t.rate*m0)} pp / night`;
      const left=avail(t),a=$(`[data-av="${t.id}"]`);
      a.textContent=t.units===1?'Last suite on these dates':left<=1?'1 tent left on these dates':`${left} tents available`;
      a.style.color=left<=1?'var(--gold)':'var(--sage)';
    });
    XP.forEach(x=>{$(`#xp-${x.id}`).checked=st.xp.has(x.id)});
    $('#lines').innerHTML=q.lines.map(l=>`<div><span>${l[0]}<div class="sub">${l[2]}</div></span><span>${money(l[1])}</span></div>`).join('');
    $('#total').textContent=money(q.total);
    const dep=q.total*.3,due=addDays(st.cin,-60),soon=due<=today;
    $('#dep').innerHTML=soon?`Arrival is within 60 days: full payment of ${money(q.total)} is due now.`:`Deposit today: <b>${money(dep)}</b><br>Balance ${money(q.total-dep)} due ${due.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}`;
    const need=Math.ceil(q.guests/q.t.cap),left=avail(q.t),btn=$('#reserveBtn');
    btn.disabled=need>left;btn.style.opacity=btn.disabled?.5:1;
    btn.textContent=btn.disabled?`Needs ${need} tents · ${left} available`:`Reserve · pay ${soon?money(q.total):money(dep)} today`;
    const nav=$('#navCta');
    nav.textContent=st.dirty?`Your stay · ${money(q.total)}`:`Reserve · from ${money(TENTS[0].rate*.78)}`;
  }
  const touch=()=>{st.dirty=true;render()};

  function bind(){
    renderTents();
    $('#cin').addEventListener('change',e=>{const d=new Date(e.target.value+'T00:00:00Z');if(isNaN(d))return;const n=nightsOf();st.cin=d<today?today:d;st.cout=addDays(st.cin,n);touch()});
    $('#cout').addEventListener('change',e=>{const d=new Date(e.target.value+'T00:00:00Z');if(isNaN(d))return;st.cout=d<=st.cin?addDays(st.cin,1):d;touch()});
    $('#cin').min=iso(today);
    document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.step,d=+b.dataset.d;
      if(k==='adults')st.adults=clampN(st.adults+d,1,8);else st.kids=clampN(st.kids+d,0,6);touch();
    }));
    $('#tents').addEventListener('change',e=>{if(e.target.name==='tent'){st.tent=e.target.value;touch()}});
    $('#xps').addEventListener('change',e=>{const id=e.target.value;e.target.checked?st.xp.add(id):st.xp.delete(id);touch()});
    $('#reserveBtn').addEventListener('click',checkout);
    render();
  }
  const clampN=(x,a,b)=>Math.min(b,Math.max(a,x));

  /* ---- checkout (no payment is taken) ---- */
  const modal=$('#modal'),sheet=$('#sheet');
  const closeM=()=>modal.classList.remove('open');
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))closeM()});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
  function checkout(){
    const q=quote(),dep=q.total*.3;
    const fmt=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
    sheet.innerHTML=`<button class="x" type="button" data-close aria-label="Close">×</button>
      <div class="eyebrow">Almost there</div><h3 id="mTitle">Hold ${q.t.name}</h3>
      <p class="fine" style="font-size:15px">${fmt(st.cin)} to ${fmt(st.cout)} · ${q.n} night${q.n>1?'s':''} · ${q.guests} guest${q.guests>1?'s':''}<br>Total ${money(q.total)} · deposit today ${money(dep)}</p>
      <form id="guestForm" novalidate>
        <label class="f" for="gname">Lead guest name<input type="text" id="gname" autocomplete="name" required></label>
        <label class="f" for="gmail">Email for confirmation<input type="email" id="gmail" autocomplete="email" required></label>
        <button class="btn" type="submit" style="justify-content:center">Continue to secure payment</button>
      </form>`;
    modal.classList.add('open');setTimeout(()=>$('#gname').focus(),50);
    $('#guestForm').addEventListener('submit',e=>{
      e.preventDefault();const n=$('#gname'),m=$('#gmail');
      if(!n.value.trim()){n.focus();window.toast&&toast('Add the lead guest name');return}
      if(!/^\S+@\S+\.\S+$/.test(m.value)){m.focus();window.toast&&toast('Enter a valid email address');return}
      const ref='KK-'+Math.random().toString(36).slice(2,8).toUpperCase();
      sheet.innerHTML=`<button class="x" type="button" data-close aria-label="Close">×</button>
        <div class="eyebrow">Demo confirmation</div><h3 id="mTitle">Your tent is waiting, ${n.value.trim().split(' ')[0]}.</h3>
        <div class="ref">${ref}</div>
        <p class="fine" style="font-size:15px">On the live site this step opens the secure page for your ${money(dep)} deposit, and a confirmation goes to ${m.value.trim()}. This demonstration takes no payment and holds no real dates.</p>
        <button class="btn" type="button" data-close style="justify-content:center">Back to the rock</button>`;
    });
  }

  document.addEventListener('DOMContentLoaded',bind);
  if(document.readyState!=='loading')bind();

  return{
    selectTent(id){st.tent=id;st.dirty=true;render()},
    toggleAddon(id){st.xp.has(id)?st.xp.delete(id):st.xp.add(id);st.dirty=true;render()},
    has:id=>st.xp.has(id),
    price:id=>{const x=XP.find(v=>v.id===id);return money(x.price)+(x.unit==='pp'?' pp':' / day')}
  };
})();
