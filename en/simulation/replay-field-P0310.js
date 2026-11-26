(() => {
'use strict';
const F=window.ORTOPIA_FIELD;
const {W,H,clamp,poly,line,ellipse,box,text,badge,tree,terrain,road,along,truck,person}=F;
const raw={"L":["water","kits"],"M":["west","east"],"V":["west","east"],"groups":{"priority":["area0","area2"],"ordinary":["area1","area3"]},"D":{"area0":{"water":4,"kits":3},"area1":{"water":9,"kits":4},"area2":{"water":5,"kits":8},"area3":{"water":3,"kits":6}},"Q":{"west":{"water":7,"kits":12},"east":{"water":13,"kits":11}},"Omega":{"priority":3,"ordinary":1},"omega_r":0.9,"omega_c":0.1,"UNV":{"water":2,"kits":1},"UNL":{"west":26,"east":28},"NV":{"west":{"west":1,"east":0},"east":{"west":0,"east":1}},"CS":{"west":{"water":1,"kits":1},"east":{"water":1,"kits":1}},"CT":{"west":{"area0":{"water":1,"kits":5},"area1":{"water":2,"kits":1},"area2":{"water":1,"kits":4},"area3":{"water":1,"kits":5}},"east":{"area0":{"water":1,"kits":5},"area1":{"water":3,"kits":1},"area2":{"water":3,"kits":4},"area3":{"water":1,"kits":3}}},"u":{"area0":4,"area1":3,"area2":1,"area3":4},"normalization":{"priority":{"F1_min":0,"F1_max":1,"F2_min":0,"F2_max":200},"ordinary":{"F1_min":0,"F1_max":1,"F2_min":0,"F2_max":220}}};
const depots=['west','east'],items=['water','kits'],names=['Xicang','dongcang'],areas=['area0','area1','area2','area3'];
const goods=['Drinking water','Relief package'],colors=['#38859c','#c68a40'],stops=[[140,287],[349,300],[602,289],[800,306]],dep=[[95,118],[735,110]];
const stationX=[160,386,625,840],centerY=203,sourceX=[169,815],truckColors=['#548a79','#d08744'];
const states=new WeakMap();
const clone=o=>JSON.parse(JSON.stringify(o));
const fmt=n=>Number(n.toFixed(2)).toString();
const key=(i)=>areas[i];
function score(plan){
 const used=depots.map(d=>items.map(l=>areas.reduce((s,a)=>s+plan[d][a][l],0)));
 const volumes=used.map(v=>v[0]*raw.UNV.water+v[1]*raw.UNV.kits);
 const sums=areas.map(a=>items.map(l=>depots.reduce((s,d)=>s+plan[d][a][l],0)));
 const issues=[];
 depots.forEach((d,di)=>{
  if(volumes[di]>raw.UNL[d]+1e-8)issues.push(names[di]+' overload '+fmt(volumes[di]-raw.UNL[d])+' Volume');
  items.forEach((l,li)=>{if(used[di][li]>raw.Q[d][l]+1e-8)issues.push(names[di]+goods[li]+' Insufficient stock')});
 });
 areas.forEach((a,i)=>items.forEach((l,j)=>{if(sums[i][j]>raw.D[a][l]+1e-8)issues.push(i+' Zone '+goods[j]+' exceed demand')}));
 let value=0;
 for(const [group,members] of Object.entries(raw.groups)){
  let need=0,total=0,cost=0;
  for(const a of members)for(const l of items){need+=raw.D[a][l];for(const d of depots){let x=plan[d][a][l];total+=x;cost+=x*(raw.CS[d][l]*raw.u[a]+raw.CT[d][a][l]);}}
  const b=raw.normalization[group];
  value+=raw.Omega[group]/(raw.Omega.priority+raw.Omega.ordinary)*(raw.omega_r*(total/need-b.F1_min)/(b.F1_max-b.F1_min)-raw.omega_c*(cost-b.F2_min)/(b.F2_max-b.F2_min));
 }
 return {sums,used,volumes,value,issues};
}
function depot(c,x,y,i){
 const palette=i===0?['#88aaa0','#62867c','#cee0c9']:['#bcab86','#938266','#e2d5b4'];
 box(c,x-57,y,117,42,25,palette);box(c,x-61,y-41,125,5,26,[i?'#ad8c66':'#648e81',i?'#8d795a':'#557c6e',i?'#cab596':'#9abdad']);
 for(let j=0;j<10;j++)line(c,[[x-54+j*12,y-44],[x-30+j*12,y-55]],i?'#af9d80':'#84a499',1.3);
 for(let j=0;j<3;j++){box(c,x-50+j*35,y,26,23,0,['#4f685f','#4f685f','#4f685f']);line(c,[[x-47+j*35,y-14],[x-27+j*35,y-14]],'#8fa497',2.2)}
 for(let j=0;j<4;j++){let xx=x+60+j%2*10,yy=y-4+Math.floor(j/2)*7;box(c,xx,yy,9,7,3,['#bb945b','#9d7948','#e0bb7b'])}
}
function house(c,x,y,s,col='#b57963'){
 c.save();c.translate(x,y);c.scale(s,s);
 box(c,-17,0,34,18,10,['#e8dac1','#b5af98','#f1e6d1']);
 poly(c,[[-20,-18],[-4,-33],[21,-17]],col);poly(c,[[-4,-33],[6,-39],[32,-24],[21,-17]],col==='#688d87'?'#517a76':'#947160');
 for(let i=0;i<2;i++)box(c,-12+i*17,-5,6,7,1,['#678887','#527574','#b8c8b7']);c.restore();
}
function tent(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,[[-21,0],[4,-23],[21,0]],'#d9c298');poly(c,[[4,-23],[20,-29],[38,-7],[21,0]],'#ebe1bc');
 poly(c,[[-4,0],[4,-13],[10,0]],'#746f59');line(c,[[-26,1],[-9,-17],[4,-23],[21,-4],[27,4]],'#aa996f',1.2);c.restore();
}
let background;
function backdrop(){
 if(background)return background;
 background=F.cachedWorld(c=>{
  terrain(c,310);
  const river=[[467,-20],[433,52],[466,109],[497,165],[468,216],[448,278],[476,345],[483,445]];
  line(c,river,'#a1bda5',66);line(c,river,'#8cbdbf',58);line(c,river,'#a7ced0',42);
  for(let i=0;i<29;i++){const p=along(river,(i+.55)/29);line(c,[[p[0]-8+(i%3)*5,p[1]],[p[0]-4+(i%3)*5,p[1]-1]],'#d8ece044',1.6)}
  // Cultivated plots and service paths give the two banks distinct landmarks.
  for(const [px,py,w,h] of [[257,57,119,39],[285,116,96,29],[511,78,93,43],[801,354,107,35]]){
   poly(c,[[px,py],[px+w,py-7],[px+w-12,py+h],[px-12,py+h+7]],'#bdcba7');
   for(let j=5;j<w-6;j+=8)line(c,[[px+j,py+2-j*.05],[px+j-11,py+h+3-j*.05]],'#a8b796',2);
  }
  for(const [xx,yy] of [[283,37],[314,42],[567,51],[593,36],[217,393],[244,378],[679,365]])house(c,xx,yy,.58,'#688d87');
  for(let i=0;i<118;i++){const x=(i*191+29)%966,y=(i*83+31)%412;
    if((y<45||y>375||(x>245&&x<392&&y<135)||(x>510&&x<592&&y<145))&&Math.abs(x-466)>47)tree(c,x,y,.55+(i%4)*.11)}
  poly(c,[[18,126],[40,55],[195,42],[236,91],[203,163],[29,171]],'#c2cbb6');
  poly(c,[[655,119],[666,41],[815,34],[879,82],[855,158],[661,152]],'#c4cbb8');
  road(c,[[-30,centerY],[314,centerY],[500,centerY],[680,centerY],[W+30,centerY]],22);
  for(let j=0;j<2;j++){const [x,y]=dep[j];road(c,[[x+5,y+19],[sourceX[j],y+19],[sourceX[j],centerY]],16);depot(c,x,y,j)}
  for(let i=0;i<4;i++){const [x,y]=stops[i];road(c,[[stationX[i],centerY],[stationX[i],y-25],[x+20,y]],12,false);
   let outline=[[x-80,y+38],[x-61,y-16],[x+45,y-23],[x+75,y+21],[x+41,y+51]];poly(c,outline,'#bdc8ae');
   if(i===0){box(c,x-51,y+8,65,29,16,['#d8d8be','#a0aea0','#eedfba']);box(c,x-55,y-20,73,5,18,['#8baba0','#728e81','#b8c5ae']);line(c,[[x-25,y-12],[x-25,y]],'#ad5e4e',4);line(c,[[x-31,y-6],[x-19,y-6]],'#ad5e4e',4);tent(c,x+30,y+22,.66)}
   if(i===1){house(c,x-34,y-1,.85);house(c,x+17,y-12,.8,'#688d87');house(c,x+2,y+23,.85)}
   if(i===2){tent(c,x-39,y+8,.8);tent(c,x+5,y-6,.95);tent(c,x+18,y+25,.75)}
   if(i===3){house(c,x-29,y-5,1.05,'#688d87');house(c,x+24,y+11,.9);tent(c,x-34,y+28,.55)}
  }
  for(let di=0;di<2;di++){const [x,y]=dep[di];for(let row=0;row<2;row++)for(let j=0;j<4;j++){const xx=x-55+j*10,yy=y+15+row*6;
   box(c,xx,yy,8,5,2,row?['#668d99','#4f7883','#b4d1cb']:['#bb975e','#98804c','#dec59a'])}}
  for(let yy of [190,216]){line(c,[[426,yy],[511,yy]],'#686f68',2);for(let x=428;x<515;x+=10)line(c,[[x,yy],[x,yy-5]],'#7a8177',2)}
 });return background;
}
function route(di,area){let [x,y]=dep[di],[tx,ty]=stops[area];return [[x+7,y+19],[sourceX[di],y+19],[sourceX[di],centerY+(di?4:-4)],[stationX[area]+(di?3:-3),centerY+(di?4:-4)],[stationX[area]+(di?3:-3),ty-24],[tx+24+(di?6:-6),ty+2]]}
function drawLoad(c,x,y,frac,kit,scale=1){
 if(frac<=0)return;let count=Math.min(5,Math.ceil(frac*5));for(let i=0;i<count;i++){let xx=x+(i%3)*7*scale,yy=y+Math.floor(i/3)*5*scale;
 box(c,xx,yy,5*scale,5*scale,2*scale,kit?['#bc9559','#96774d','#dfc389']:['#4986a1','#3b7387','#a7ced2'])}
}
function reliefFrame(c,state,t){
 backdrop()(c);
 const q=clamp(t/6),a=state.area,res=state.res,d=state.depot,plan=state.plan,transfer=state.transfer;
 const blocked=!!res.issues.length;
 const transportFraction=clamp((q-.19)/.53),arrival=blocked?0:clamp((q-.72)/.25);
 if(transfer){
  const previous=route(1,0);line(c,previous,'#a14e44',2,[5,7]);
  const [ox,oy]=previous.at(-1);line(c,[[ox-5,oy-5],[ox+5,oy+5]],'#974a3f',3);line(c,[[ox+5,oy-5],[ox-5,oy+5]],'#974a3f',3);
 }
 for(let di=0;di<2;di++){
  const cargo=transfer?(di===1?[1,0]:[0,0]):items.map(l=>plan[depots[di]][key(a)][l]);
  const path=route(di,a),[dx,dy]=dep[di],amount=cargo[0]+cargo[1];
  if(amount){
   line(c,path,truckColors[di],4);line(c,path,'#fff2c6',1.7,[6,9]);
   let [x,y,angle]=along(path,blocked?0:transportFraction);
   const payload=clamp(q/.18)*(1-arrival);
   truck(c,x,y,angle,truckColors[di],0);
   c.save();c.translate(x,y);c.rotate(angle);
   for(let n=0;n<Math.ceil(payload*6);n++){c.fillStyle=n<(cargo[0]/amount)*6?'#8ed2e3':'#efcf88';c.fillRect(-17+Math.floor(n/2)*7,-6+(n%2)*6,5.5,5)}
   c.restore();
   let load=cargo.map((v,l)=>v?goods[l]+' '+fmt(v):'').filter(Boolean).join(' · ');
   if(!blocked&&q<.91)badge(c,load,x+(di?0:-4),y+(di?21:-20),di?'#875125':'#315e54','#fffbe6',12);
   if(q<.2||blocked){const f=blocked?0:clamp(q/.2);person(c,dx-9+f*16,dy+12+f*6,t*2,'#43796c');drawLoad(c,dx-11+f*17,dy+2+f*6,1,!!cargo[1],1.15)}
   if(arrival>0){let [tx,ty]=stops[a];const px=x+(tx-14-x)*arrival,py=y+(ty+18-y)*arrival;
    person(c,px,py,t*2,di?'#b26d43':'#467c70');drawLoad(c,px-2,py-8,1,!!cargo[1],1)}
  }else{const pt=path[0];truck(c,pt[0],pt[1],0,truckColors[di],0)}
  badge(c,names[di]+'  '+fmt(res.volumes[di])+' / '+raw.UNL[depots[di]],dx+10,dy-70,di===d?'#244e47':'#f8faed',di===d?'#fffde9':'#38514b');
 }
 for(let i=0;i<4;i++){
  const [sx,sy]=stops[i],priority=i===0||i===2;
  let received;
  if(transfer) received=res.sums[i].map((v,li)=>v-(i===a&&li===0?1-arrival:0));
  else received=res.sums[i].map(v=>i<a?v:i===a?v*arrival:0);
  if(i===a&&!blocked&&q>.72&&q<.97){c.beginPath();c.ellipse(sx,sy+4,41+arrival*19,17+arrival*7,0,0,Math.PI*2);c.lineWidth=2;c.strokeStyle='rgba(62,132,106,'+(1-arrival)+')';c.stroke()}
  for(let k=0;k<2;k++){let nx=sx-16+k*15,ny=sy+25+(k%2)*5;person(c,nx,ny,0,k?'#718c79':'#b77957')}
  for(let j=0;j<Math.round(received[1]/2);j++)drawLoad(c,sx+25+(j%3)*7,sy+16+Math.floor(j/3)*6,.1,1);
  for(let j=0;j<Math.round(received[0]/2);j++)drawLoad(c,sx-56+(j%3)*7,sy+22+Math.floor(j/3)*6,.1,0);
  if(transfer&&i<=1)badge(c,i===0?'redirect −1 water':'Change charge +1 water',sx,sy-54,i?'#2e6c61':'#965949','#fffce7',13);
  badge(c,(priority?'Priority':'Ordinary')+' · '+i+' Zone',sx,sy+55,i===a?'#254f47':priority?'#eee0b9':'#f6f8ea',i===a?'#fffde9':'#344e47',14);
  for(let j=0;j<2;j++){let xx=sx-46+j*50,yy=sy+77,need=raw.D[key(i)][items[j]];
   c.fillStyle='#a9b6a9';c.fillRect(xx,yy,39,4);c.fillStyle=colors[j];c.fillRect(xx,yy,39*clamp(received[j]/need),4);
   text(c,fmt(Math.round(received[j]*10)/10)+'/'+need,xx+19,yy+15,13,'#263e3c','center',700)}
 }
 badge(c,blocked?'Loading blocked':q<.19?'Loading':q<.72?'On the way to delivery':q<.97?'Unloading at the station':'Delivery completed',W-71,22,blocked?'#943e2e':'#294e48','#fffbe6',15);
}
function mount(host,onInteract,index,onNode,replayAction){
 const source=window.ORTOPIA_REPLAYS.P0310.sceneValues.shipments;
 let state=states.get(host);
 if(!state){state={plan:clone(source),depot:1,good:0};states.set(host,state)}
 state.area=index;state.transfer=false;
 const ui=F.siteShell(host,'fp-relief','The two warehouses are the loading, transportation and unloading sites for distributing materials to the four resettlement areas.','The blue bars are drinking water and the yellow bars are material packages. The warehouse label is the entire load volume.');
 function update(){
  state.res=score(state.plan);
  let d=depots[state.depot],a=key(state.area),l=items[state.good],quantity=state.plan[d][a][l];
  const group=(label,attr,values,sel)=>'<span class="fp-group"><strong>'+label+'</strong>'+values.map((v,i)=>'<button data-'+attr+'="'+i+'" aria-pressed="'+(sel===i)+'">'+v+'</button>').join('')+'</span>';
  ui.control.innerHTML=group('Shipping', 'depot',names,state.depot)+group('deliver to','area',['Zone 0','Zone 1','Zone 2','Zone 3'],state.area)+group('load','good',goods,state.good)+'<span class="fp-group"><button data-change="-0.5" '+(quantity<.5?'disabled':'')+'>− 0.5</button><strong>'+fmt(quantity)+'</strong><button data-change="0.5">+ 0.5</button></span><button class="fp-action" data-divert>Try to change the delivery: Dongcang 1 unit water from 0 District transfer 1 Zone</button><button data-reset>Restore original solution</button>';
  ui.result.dataset.error=String(!!state.res.issues.length);ui.result.textContent=state.res.issues.length?state.res.issues.join(' · '):'Feasible throughout the period · Score '+state.res.value.toFixed(6);
 }
 function run(){update();onInteract?.();if(replayAction)replayAction();else host.sceneFrame(0)}
 function select(attr,i){state[attr]=i;state.transfer=false;run()}
 function redirect(){
  // The comparison starts from the checked assignment so repeated trials have the same baseline.
  state.plan=clone(source);state.plan.east.area0.water-=1;state.plan.east.area1.water+=1;
  state.depot=1;state.area=1;state.good=0;state.transfer=true;
 }
 dep.forEach(([x,y],i)=>F.hotspot(ui.scene,'from '+names[i]+' Shipping',x,y-14,()=>select('depot',i),148,76));
 stops.forEach(([x,y],i)=>F.hotspot(ui.scene,'Delivered to '+i+' Zone',x,y-5,()=>select('area',i),142,92));
 ui.control.onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  for(let attr of ['depot','area','good'])if(b.dataset[attr]!==undefined){select(attr,+b.dataset[attr]);return}
  if(b.hasAttribute('data-reset')){state.plan=clone(source);state.transfer=false;state.area=index;state.depot=1;state.good=0}
  else if(b.hasAttribute('data-divert'))redirect();
  else{state.transfer=false;let leg=state.plan[depots[state.depot]][key(state.area)];leg[items[state.good]]=Math.max(0,leg[items[state.good]]+Number(b.dataset.change))}
  run();
 };
 host.sceneFrame=t=>reliefFrame(ui.c,state,t);
 host.previewDecision=i=>{if(i)redirect();else{state.plan=clone(source);state.transfer=false;state.area=index}update();host.sceneFrame(host.sceneTime||0)};
 update();host.sceneFrame(host.sceneTime||0);
}
window.ORTOPIA_FIELD_P0310={mount};
})();
