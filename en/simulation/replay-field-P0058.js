(() => {
 'use strict';
 const F=window.ORTOPIA_FIELD;
 const phases=['early','up','flat','down'];
 const phaseNames=["first issue","Upward","Smooth","Downward"];
 const centers=[425,626,827], docks={A:147,B:258};
 const sessions=new WeakMap();
 const mint='#73dbc1', gold='#f4be66', dim='#a5b5b4';
 const color=s=>s==='A'?mint:gold;
 const {line,ellipse,box,text,badge,clamp,along,poly}=F;

 function rect(c,x,y,w,h,fill){
  c.fillStyle=fill;c.fillRect(x,y,w,h);
 }
 function hubFloor(c){
  const wall=c.createLinearGradient(0,0,0,220);
  wall.addColorStop(0,'#24383e');wall.addColorStop(1,'#597371');
  rect(c,0,0,F.W,F.H,wall);
  for(let i=0;i<8;i++){
   const x=6+i*127;
   line(c,[[x,0],[x,144]],'#80938c',3);
   line(c,[[x,2],[x+125,141]],'#455b5e',3);
  }
  const slab=c.createLinearGradient(0,112,0,F.H);
  slab.addColorStop(0,'#93a39a');slab.addColorStop(.7,'#b4bdb0');slab.addColorStop(1,'#bfc4b5');
  poly(c,[[0,127],[F.W,118],[F.W,F.H],[0,F.H]],slab);
  for(let i=-6;i<17;i++)line(c,[[i*82+220,122],[i*112-5,414]],'#83969060',1);
  for(let i=0;i<10;i++)line(c,[[0,134+i*i*3.7],[940,130+i*i*3.7]],'#778b8250',1);
  line(c,[[232,208],[905,208]],'#f4d782',2,[12,9]);
  line(c,[[232,266],[905,266]],'#f4d782',2,[12,9]);
  // Overhead cable tray, loading lanes and a grated trench.
  for(let i=0;i<2;i++)line(c,[[0,38+i*7],[229,38+i*7],[264,20+i*7],[940,20+i*7]],'#85968f',3);
  for(let j=0;j<17;j++)line(c,[[16+j*54,38],[16+j*54,46]],'#afbbb1',2);
  for(let j=0;j<37;j++)line(c,[[242+j*18,278],[249+j*18,275]],'#778b86',1);
 }
 function warehouse(c,s,y,remaining,t){
  const tone=color(s);
  ellipse(c,112,y+12,94,9,'#354d4d33');
  box(c,20,y+3,131,56,20,['#4a6463','#385154','#a1b0a5']);
  rect(c,31,y-40,65,42,'#1e373a');
  for(let j=0;j<4;j++){
   rect(c,35,y-37+j*9,57,6,j<remaining?tone:'#435959');
   line(c,[[39,y-34+j*9],[48,y-34+j*9]],'#526e68',1.3);
  }
  rect(c,104,y-34,31,30,'#2d4648');rect(c,108,y-30,23,18,'#536e6d');
  ellipse(c,130,y-3,3,3,remaining?tone:'#777e72');
  box(c,137,y+7,37,9,9,['#87988f','#667b74','#bac8b8']);
  for(let j=0;j<6;j++)line(c,[[140+j*5,y-2],[148+j*5,y-7]],'#627b74',1);
  badge(c,"Supplier "+s,88,y-61,'#263d40',tone,15);
  text(c,"left "+remaining,114,y-21,13,'#f1f0d9','center');
 }
 function serverRack(c,x,bottom,load,occupancy,early,now){
  if(!occupancy){
   poly(c,[[x,bottom],[x+29,bottom],[x+40,bottom-6],[x+11,bottom-6]],'#62736e','#c5d0b9');
   line(c,[[x,bottom-1],[x,bottom-64],[x+29,bottom-64],[x+29,bottom-1]],early?'#a0c8af':'#aab7a6',1.2,[4,4]);
   text(c,early?"pre-built":"empty",x+15,bottom-25,11,'#c9d5bc','center');return;
  }
  box(c,x,bottom,29,66,10,['#274246','#1c3136','#8da69c']);
  for(let j=0;j<6;j++){
   const y=bottom-59+j*8;
   rect(c,x+3,y,23,6,load?'#607a74':'#354e50');
   for(let k=0;k<4;k++)rect(c,x+5+k*3,y+2,1,2,'#253b40');
   ellipse(c,x+22,y+3,1.35,1.35,load?color(load[1]):'#4b6261');
  }
  if(load){
   text(c,load[0],x+15,bottom-6,10,'#fff8e3','center',650);
   if(Math.floor(now*3)%2===0)rect(c,x+20,bottom-57,3,2,'#fff0a6');
  }
 }
 function center(c,i,expanded,known,extra,phase,t,installed){
  const x=centers[i], y=172, early=phase==='early';
  ellipse(c,x+5,y+5,78,8,'#30494450');
  box(c,x-70,y,128,95,19,['#576e6e','#3d5759','#b3c0b4']);
  rect(c,x-66,y-86,120,79,'#273f43');
  line(c,[[x-61,y-12],[x+48,y-12]],'#77928a',1);
  serverRack(c,x-47,y-10,early?(known&&installed.has(known[0])?known:null):known,true,false,t);
  serverRack(c,x+4,y-10,extra&&installed.has(extra[0])?extra:null,expanded&&!early,expanded&&early,t);
  badge(c,"Computer room L"+i,x,y-117,'#234547','#f1f0db',17);
  badge(c,expanded?(early?"Expansion ordered":"Extension is enabled"):"Keep original seat",x,y+17,expanded?'#e0eacd':'#eee1c8',expanded?'#345843':'#6d5139',13);
 }
 function cart(c,x,y,angle,s,carrying){
  c.save();c.translate(x,y);
  if(Math.cos(angle)<0)c.scale(-1,1);
  ellipse(c,0,3,18,4,'#3f535052');
  box(c,-17,0,29,6,6,['#395354','#283f40','#acc0ae']);
  ellipse(c,-10,1,3.7,3.7,'#263a3e');ellipse(c,10,1,3.7,3.7,'#263a3e');
  if(carrying){
   box(c,-12,-5,20,14,7,['#52716f','#395957','#b2c2af']);
   rect(c,-10,-17,15,4,color(s));rect(c,-9,-10,12,1.5,'#b3c6b6');
  }
  rect(c,11,-8,4,3,'#ffda83');c.restore();
 }
 const base=F.cachedWorld(hubFloor);
 function render(c,state,t){
  const {phase,plan,mask}=state;
  const early=phase==='early';
  const loads=early?plan.early:plan.scenarios[phase].loads;
  const inventory={...state.data.stock};
  if(!early)for(const [,s] of plan.early)inventory[s]--;
  const deliveries=[], installed=new Set();
  for(let i=0;i<loads.length;i++){
   const [d,s,location]=loads[i];
   if(!s)continue;
   const id=Number(location.slice(1));
   const offset=i*.57;
   const p=clamp((t-.25-offset)/3.55);
   const x0=174, y0=docks[s]+4;
   const laneY=215+i*15, targetX=centers[id]+14;
   const path=[[x0,y0],[205,y0],[258,laneY],[targetX,laneY],[targetX,177]];
   if(t>=offset+.3)inventory[s]--;
   if(t>=offset+3.95)installed.add(d);
   deliveries.push({d,s,path,p,t0:offset,targetX});
  }
  base(c);
  text(c,"Cloud device deployment center",126,22,19,'#ebefdf','center',680);
  badge(c,"Current working conditions · "+phaseNames[phases.indexOf(phase)],613,37,'#263f43','#d6e9d9',14);
  for(const item of deliveries){
   line(c,item.path,'#627c7159',3);
   line(c,item.path,color(item.s),1.6,[5,5]);
  }
  for(const s of ['A','B'])warehouse(c,s,docks[s],inventory[s],t);
  for(let i=0;i<3;i++){
   const k='L'+i;
   center(c,i,mask[i],plan.early.find(v=>v[2]===k),early?null:loads.find(v=>v[2]===k),phase,t,installed);
  }
  for(const item of deliveries){
   if(t<item.t0)continue;
   const [x,y,a]=along(item.path,item.p);
   if(t<item.t0+4.85){
    cart(c,x,y,a,item.s,!installed.has(item.d));
    if(!installed.has(item.d))badge(c,item.d,x,y-33,'#2d4547','#fbf7df',12);
   }
   if(t>item.t0+3.75){
    const dx=clamp((t-item.t0-3.75)*2);
    F.person(c,item.targetX-17+11*dx,181-5*dx,clamp((t-item.t0-3.75)/.8)*6,'#de9750',dx>.5);
   }
  }
  // The receiving manifest describes the active scenario, including rejected orders.
  rect(c,0,304,940,110,'#263c3f');rect(c,0,304,940,3,'#66837b');
  text(c,"Arrival list",25,333,18,'#ecedda','left',650);
  text(c,early?"Known requests":phaseNames[phases.indexOf(phase)]+"Scenario",25,366,14,'#c2d4c9');
  for(let i=0;i<loads.length;i++){
   const [d,s,loc]=loads[i],x=155+i*251;
   const st=!s?"not satisfied":installed.has(d)?"Already installed":"Rack to be installed";
   rect(c,x,320,224,70,'#354f51');
   rect(c,x,320,4,70,s?color(s):'#d48d72');
   text(c,d,x+13,340,18,'#fff8df');
   text(c,st,x+206,340,14,s?'#d8e9dc':'#ffc2a6','right');
   text(c,s?"Supplier "+s+"   → Computer room "+loc:"No equipment delivery scheduled",x+13,371,15,s?'#d6e4db':'#f8c4aa');
  }
 }
 function mount(host,onInteract,index,onNode,replayAction){
  const data=window.ORTOPIA_REPLAYS.P0058.lab;
  if(!sessions.has(host))sessions.set(host,{mask:[1,1,1],supplier:'B',archived:true});
  const st=sessions.get(host);st.phase=phases[index];st.data=data;
  const ui=F.siteShell(host,'cloud-deployment',"The two suppliers deliver equipment to three computer rooms, and click on the computer room to change the later machine locations.","The first delivery location is fixed; the three later scenarios will respectively undertake the same remaining inventory.");
  function button(attr,value,label,selected){
   return '<button type="button" data-'+attr+'="'+value+'" aria-pressed="'+selected+'">'+label+'</button>';
  }
  function update(){
   st.plan=st.archived?data.baseline:data.plans[st.mask.join('')+st.supplier];
   const risk=Math.max(...Object.values(st.plan.scenarios).map(v=>v.cost));
   const total=risk+st.plan.first;
   const current=st.plan.scenarios[st.phase];
   const loads=current?current.loads:st.plan.early;
   const missed=loads.filter(r=>!r[1]).map(r=>r[0]);
   ui.scene.parentElement.querySelector('.fp-foot span').textContent=phaseNames[index]+" · Delivery "+(loads.length-missed.length)+'/'+loads.length+
     (missed.length?" · Not satisfied "+missed.join('、'):'')+
     (current?" · Cost of this scenario "+current.cost:" · New aircraft seats will be activated later")+(st.archived?" · Archive solutions":" ·Rearranged later");
   ui.control.innerHTML="<span class=\"fp-group\"><strong>Later expansion</strong>"+
     centers.map((x,i)=>button('site',i,'L'+i+' '+(st.mask[i]?"open":"close"),!!st.mask[i])).join('')+'</span>'+
     "<span class=\"fp-group\"><strong>P0 Supplier</strong>"+['A','B'].map(s=>button('supplier',s,s,s===st.supplier)).join('')+'</span>'+
     "<span class=\"fp-group\"><strong>View</strong>"+phases.map((p,i)=>button('phase',i,phaseNames[i],p===st.phase)).join('')+'</span>'+
     "<button type=\"button\" data-reset>Recovery archive solution</button>";
   ui.result.textContent="first issue "+st.plan.first+" ＋ later stage CVaR "+risk+' ＝ '+total+" (The lower the better)";
  }
  function act(site,supplier){
   if(site===null && supplier===st.supplier)return;
   onInteract?.();
   if(site!==null)st.mask[site]=1-st.mask[site];
   if(supplier)st.supplier=supplier;
   st.archived=false;
   update();
   if(site!==null&&index===0&&onNode)onNode(1);else replayAction?.();
   if(!replayAction)host.sceneFrame(0);
  }
  for(let i=0;i<3;i++)F.hotspot(ui.scene,"Switch L"+i+" Later expansion",centers[i],116,()=>act(i,null),153,135);
  for(const s of ['A','B'])F.hotspot(ui.scene,"Change to supplier "+s+" Undertake P0",85,docks[s]-24,()=>act(null,s),154,80);
  ui.control.onclick=e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.dataset.site!==undefined)act(Number(b.dataset.site),null);
   else if(b.dataset.supplier)act(null,b.dataset.supplier);
   else if(b.dataset.phase!==undefined){onInteract?.();onNode?.(Number(b.dataset.phase));}
   else if(b.hasAttribute('data-reset')){onInteract?.();st.mask=[1,1,1];st.supplier='B';st.archived=true;update();replayAction?.();}
  };
  host.sceneFrame=t=>render(ui.c,st,t);
  host.previewDecision=alternative=>{
   st.mask=alternative?[1,0,1]:[1,1,1];st.supplier='B';st.archived=!alternative;
   update();host.sceneFrame(host.sceneTime||0);
  };
  host.cloudSnapshot=()=>({phase:st.phase,mask:[...st.mask],supplier:st.supplier,plan:st.plan});
  update();host.sceneFrame(host.sceneTime||0);
 }
 window.ORTOPIA_FIELD_P0058={mount};
})();
