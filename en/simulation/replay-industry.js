/* Miniature industrial environments. Operational states come from the archived replay frames. */
'use strict';
window.ORTOPIA_INDUSTRY = (() => {
 const ids=new Set(['P0013','P0020','P0057','P0062','P0075','P0213','P0214']);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=v=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:3}):'';
 const line=(d,stroke,w=2,extra='')=>'<path d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
 const path=(d,fill,extra='')=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
 const rect=(x,y,w,h,fill,r=0)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" rx="'+r+'"/>';
 const circle=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
 const ellipse=(x,y,rx,ry,c)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+c+'"/>';
 const word=(x,y,s,size=13,ink='#264c47',anchor='middle',weight=600)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+ink+'">'+esc(s)+'</text>';
 const group=(x,y,body,scale=1,attrs='')=>'<g transform="translate('+x+' '+y+') scale('+scale+')" '+attrs+'>'+body+'</g>';
 const spin=(sec,reverse=false)=>'<animateTransform attributeName="transform" type="rotate" from="0" to="'+(reverse?-360:360)+'" dur="'+sec+'s" repeatCount="indefinite"/>';
 const animate=(a,values,sec,repeat='indefinite')=>'<animate attributeName="'+a+'" values="'+values+'" dur="'+sec+'s" repeatCount="'+repeat+'" fill="freeze"/>';
 const swing=(a,b,d,cy=0)=>'<animateTransform attributeName="transform" type="rotate" values="'+a+' 0 '+cy+';'+b+' 0 '+cy+';'+a+' 0 '+cy+'" dur="'+d+'s" repeatCount="indefinite"/>';
 const travel=(curve,seconds,repeat='1')=>'<animateMotion path="'+curve+'" dur="'+seconds+'s" repeatCount="'+repeat+'" fill="freeze"/>';
 function many(count,fn){return Array.from({length:count},(_,k)=>fn(k)).join('');}
 function defs(){return '<defs><clipPath id="iw-film"><rect width="820" height="440"/></clipPath><linearGradient id="iw-sky" x2=".2" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#badfe7"/><stop offset="1" stop-color="#edf0d9"/></linearGradient><linearGradient id="iw-soil" x1="0" x2=".2" y2="1"><stop stop-color="#a7bc91"/><stop offset="1" stop-color="#d5dfb0"/></linearGradient><linearGradient id="iw-floor" x2=".1" y2="1"><stop stop-color="#bac9bc"/><stop offset="1" stop-color="#e0dfca"/></linearGradient><linearGradient id="iw-metal"><stop stop-color="#587780"/><stop offset=".38" stop-color="#adbdba"/><stop offset=".73" stop-color="#d7dfcd"/><stop offset="1" stop-color="#758f8c"/></linearGradient><linearGradient id="iw-cylinder"><stop stop-color="#447c81"/><stop offset=".28" stop-color="#8bb6a8"/><stop offset=".64" stop-color="#c1daca"/><stop offset="1" stop-color="#507f7a"/></linearGradient><linearGradient id="iw-glass" x2=".65" y2="1"><stop stop-color="#d4f1ee"/><stop offset=".5" stop-color="#9ac2c5"/><stop offset="1" stop-color="#58888d"/></linearGradient><pattern id="iw-tile" width="56" height="28" patternUnits="userSpaceOnUse"><path d="M0 0L28 14 56 0M28 14V28" fill="none" stroke="#587567" stroke-opacity=".14" stroke-width=".9"/></pattern><pattern id="iw-hatch" width="9" height="8" patternUnits="userSpaceOnUse"><path d="M-3 8l8-8m1 8 8-8" stroke="#926d36" stroke-width="3"/></pattern></defs>';}
 function tree(x,y,z=1){
  const crown=path('M-4 -39Q-22 -37 -15 -19Q-24 -7 -9 -5Q-2 1 9 -5Q23 -4 19 -17Q22 -29 12 -32Q8 -42 -4 -39Z','#588e68')+ellipse(-6,-26,10,9,'#75a478')+ellipse(6,-16,12,10,'#65996e')+ellipse(-3,-33,6,4,'#8ab27d');
  return group(x,y,ellipse(5,2,18,4,'#72987873')+rect(-2,-16,5,19,'#796649',1)+crown,z);
 }
 function outside(){
  let distant=path('M0 133Q95 78 175 108T340 111Q410 55 500 106T650 92Q715 64 820 116V170H0Z','#abc8b3')+path('M0 147Q104 104 198 131T348 122T519 137Q627 103 716 129T820 126V183H0Z','#8eb299');
  return rect(0,0,820,440,'url(#iw-sky)')+ellipse(631,47,33,33,'#fff3c577')+path('M35 58Q45 46 63 50Q78 35 95 51Q119 46 128 60Z','#eef5e7')+path('M341 72Q355 61 371 66Q386 50 402 67Q423 62 432 74Z','#eaf3e6')+distant+rect(0,148,820,292,'url(#iw-soil)')+many(34,k=>tree(k*25-8,155+Math.sin(k*4)*8,.36+(k%3)*.07))+
   path('M-30 190L250 141 869 225 820 419 60 424Z','#bfc7b0')+path('M-30 190L250 141 869 225 820 419 60 424Z','url(#iw-tile)')+
   line('M-30 354Q155 383 283 389T569 403Q700 400 844 385','#acb2a1',30)+line('M-30 354Q155 383 283 389T569 403Q700 400 844 385','#dedec9',23)+line('M-30 354Q155 383 283 389T569 403Q700 400 844 385','#fff6cf',1.7,'stroke-dasharray="12 13"')+
   many(5,k=>tree(23+k*179,427+(k%2)*5,.52));
 }
 function factoryHall(){
  const aisleLights = many(5,i=>group(61+i*162,0,line('M0 0v11','#647679',2)+path('M-13 23l7-11H6l8 11Z','#738783')+ellipse(0,23,13,2.5,'#fae6ae')));
  const racks = many(2,i=>group(220+i*299,150,rect(0,-30,43,27,'#68817a')+rect(-2,-32,47,3,'#496b66')+rect(-2,-17,47,3,'#496b66')+many(3,j=>rect(3+j*13,-29,10,11,['#b9a078','#c2b18a','#9ba79a'][j],1)+rect(3+j*13,-13,10,10,'#9fa695',1))+line('M0 0V-31m43 0v31','#5a7168',3)));
  return rect(0,0,820,440,'#e3e5d5')+rect(0,0,820,167,'#bdccc6')+many(8,k=>group(k*109-11,22,rect(0,0,92,77,'#6f8989')+rect(3,3,86,68,'url(#iw-glass)')+line('M32 3v68m28-68v68M3 34h85','#789397',3)))+
    rect(0,128,820,20,'#74978d')+rect(0,145,820,35,'#a9bcaf')+path('M0 164L820 156V440H0Z','url(#iw-floor)')+path('M0 164L820 156V440H0Z','url(#iw-tile)')+
    many(6,k=>group(k*161-2,0,path('M0 0H13L20 167H2Z','#687f7d')+rect(0,0,15,6,'#49676b')+rect(1,128,16,15,'#e2bd64')+rect(1,128,16,15,'url(#iw-hatch)')))+
    rect(0,0,820,13,'#546d72')+aisleLights+line('M0 97H820','#e9b965',6)+line('M0 103H820','#8e6546',2)+
    racks+group(32,139,rect(0,-22,23,21,'#c98a5e',2)+rect(3,-18,17,4,'#8d6950')+circle(6,-5,2,'#859478'))+
    line('M-8 354Q110 373 204 377L830 423','#e8c968',4)+line('M0 358Q110 377 204 381L820 427','#f4ead0',1);
 }
 // An oblique cutaway block, with the front edge on the camera-facing side.
 function block(x,y,w,h,d,front,top,side){
  return group(x,y,rect(0,-h,w,h,front)+path('M0 '+(-h)+'l'+d+' '+(-d*.48)+'h'+w+'l'+(-d)+' '+d*.48+'Z',top)+path('M'+w+' 0v'+(-h)+'l'+d+' '+(-d*.48)+'v'+h+'Z',side));
 }
 function house(x,y,w,h,d,name='',accent='#79a7a3'){
  let face=block(0,0,w,h,d,'#d6ddd2','#ebeee0','#94aaa3')+rect(0,-h,w,6,accent);
  face+=many(Math.max(1,Math.floor((w-22)/20)),k=>rect(7+k*20,-h+15,15,14,'#537a80',1)+rect(8+k*20,-h+16,6,5,'#a5c6bf'))+rect(w-22,-23,14,23,'#67867e')+rect(w-20,-21,10,8,'#a7bdb0');
  return group(x,y,ellipse(w*.6+d,-2,w*.65,10,'#42584624')+face+(name?group(w*.41,-8,rect(-25,-10,50,13,'#42645a',2)+word(0,0,name,9,'#fffade')):''));
 }
 function worker(x,y,options={}){
  const {walk=false,work=false,cap='#efb94e',jacket='#d87743',scale=1,id='',from=null}=options;
  const changes=from && (from[0]!==x||from[1]!==y);
  function gait(deg,opposite){
    const repeat=changes?'3':'indefinite';
    return '<animateTransform attributeName="transform" type="rotate" values="'+deg+';'+opposite+';'+deg+'" dur=".56s" repeatCount="'+repeat+'" fill="remove"/>';
  }
  function leg(phase){return '<g transform="translate('+phase*2.7+' -12)"><g>'+((walk||changes)?gait(-29*phase,29*phase):'')+
    path('M-1.9 -1L2 -1L2.4 9.8L4.7 10.5L5.3 13L-.8 13L-2 8.2Z','#334b53')+line('M1.1 1L.8 7.8','#4c6371',1)+'</g></g>';}
  function arm(phase){return '<g transform="translate('+phase*3.8+' -22.5)"><g>'+
    ((walk||changes)?gait(25*phase,-25*phase):'')+(work?'<animateTransform attributeName="transform" type="rotate" values="-36;-74;-36" begin="'+(changes?'1.68s':'0s')+'" dur="1.35s" repeatCount="indefinite"/>':'')+
    line('M0 0l'+(phase*1.4)+' 5.2','#476c70',3.5)+line('M'+(phase*1.4)+' 5l2.2 4.0','#d2a27e',2.8)+circle(phase*1.4+2.2,9.5,1.6,'#deb291')+'</g></g>';}
  const body=leg(-1)+leg(1)+arm(-1)+path('M-4.6 -22.8Q-.7 -26 4.7 -23l1 12Q.6 -9.8 -5.1 -11Z',jacket)+
   line('M-2.8 -20l2.6 7.6 3.3-7.5','#f4d676',1.6)+line('M-4.2 -13.9l9 .2','#f8df8f',1.6)+rect(-4.5,-11.8,9.4,1.6,'#4a5e59')+arm(1)+
   rect(-1.7,-26.6,4.5,4.1,'#c39878',1)+path('M-4 -28.5Q-4.5 -33 1 -33.7Q6 -33 5.6 -28.8L7 -27.5L5.5 -26.8Q4.5 -23.7 .4 -24.7Q-3.5 -25.8 -4 -28.5Z','#ddb08a')+
   path('M-4.8 -29.6Q-5 -36.8 .8 -36.5Q6 -36.5 6.4 -31.1L8.4 -30.2Q2.8 -28.8 -4.8 -29.6Z',cap)+line('M.7 -36.2l.8 4.3','#fff0a6',1.2)+circle(4.4,-28.5,.6,'#536667');
  return group(x,y,'<g data-actor="'+esc(id||'staff')+'">'+(changes?travel('M'+(from[0]-x)+' '+(from[1]-y)+' L0 0',1.68):'')+group(0,0,ellipse(2,2,9,2.6,'#354d422e')+body+(id?word(0,14,id,9,'#334f46'):'') ,scale*1.13)+'</g>');
 }
 function placard(x,y,title,sub='',color='#315749'){
  const w=Math.max(46,Math.max(...[title,sub].map(v=>[...String(v)].reduce((s,c)=>s+(/[\x00-\x7f]/.test(c)?7:13),0)))+17);
  return group(x,y,rect(-w/2,-15,w,sub?37:23,'#fffdf0ed',5)+rect(-w/2,-15,3,sub?37:23,color,2)+word(0,1,title,13)+ (sub?word(0,16,sub,11,'#5b6b55'):''));
 }
 function pole(x,y,scale=1){
  return group(x,y,ellipse(6,1,18,4,'#415d4e28')+line('M-16 0L-4 -82l4 -17 4 17L16 0 M-12 -9L12 -34l-18-14 11-13-9-14 M12 -8L-10 -33l16-14 -9-13 6-14','#566b69',2.8)+line('M-21 -74L0 -84l21 10Z M-25 -54L0 -66l25 12Z','#556f70',2.6)+many(4,k=>line('M'+[-21,21,-25,25][k]+' '+[-74,-74,-54,-54][k]+'v5','#477a7d',3.4)),scale);
 }
 function cable(d,live=true,reverse=false){
  return line(d,'#677976',2.3)+(live?'<path d="'+d+'" fill="none" stroke="#f8c45a" stroke-width="3" stroke-dasharray="4 30" stroke-linecap="round">'+animate('stroke-dashoffset',reverse?'0;34':'34;0',1.3)+'</path>':'');
 }
 function wind(x,y,k,active=true){
  const blades=many(3,i=>'<g transform="rotate('+i*120+')">'+path('M-3 1Q-9 -9 -4 -21L1 -50Q4 -48 2 -20L3 -3Z','#f8f4dd','stroke="#8ca4a0" stroke-width=".8"')+'</g>');
  return group(x,y,ellipse(10,1,20,4,'#55795b36')+path('M-5 0L-2 -84H2L6 0Z','#e8e9d4')+line('M3 -81L6 -1','#a1b3a7',2)+group(0,-83,'<g>'+ (active?spin(4.5+k):'')+blades+'</g>'+circle(0,0,4,'#58827d')),k);
 }
 function fan(x,y,active=true,size=1){
  const blades=many(4,i=>'<g transform="rotate('+90*i+')">'+path('M0 0Q-4 -2 -2 -7Q4 -13 6 -8Q9 -4 0 0Z','#a3b9ad')+'</g>');
  return group(x,y,circle(0,0,11,'#344e50')+'<g>'+(active?spin(1.8):'')+blades+'</g>'+circle(0,0,2,'#c3c8ac'),size);
 }
 function steam(x,y,active){
  if(!active)return '';
  return group(x,y,many(4,i=>'<ellipse cx="0" cy="0" rx="8" ry="5" fill="#fffcdf" opacity="0"><animate attributeName="cy" values="0;-41" dur="3.5s" begin="-'+i*.83+'s" repeatCount="indefinite"/><animate attributeName="cx" values="0;22" dur="3.5s" begin="-'+i*.83+'s" repeatCount="indefinite"/><animate attributeName="rx" values="7;19" dur="3.5s" begin="-'+i*.83+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.55;0" dur="3.5s" begin="-'+i*.83+'s" repeatCount="indefinite"/></ellipse>'));
 }
 function generator(x,y,on){
  return group(x,y,group(106,-43,rect(-5,-66,11,67,'url(#iw-metal)')+rect(-5,-48,11,8,'#b87758')+rect(-6,-67,13,5,'#5f7474')+steam(0,-68,on))+
    house(0,0,128,49,22,'','#639c8d')+block(13,-48,46,15,13,'#98a69b','#c3cbbc','#88988f')+fan(31,-40,on,.8)+fan(57,-40,on,.8)+
    rect(3,-8,92,6,'#83998e')+circle(116,-35,3,on?'#b9dc6d':'#b8b6a5'));
 }
 function storage(x,y,level){
  return group(x,y,block(-4,4,122,5,28,'#a6b5a4','#c3cbbc','#8b9c90')+block(0,0,111,43,26,'#6c9891','#bdd0b7','#557d79')+many(14,k=>line('M'+(4+7.5*k)+' -37v33','#89aaa0',1))+rect(6,-33,79,15,'#345958',2)+many(14,k=>rect(8+5.35*k,-30,4,9,level==null?'#9bb6a5':k/14<level?'#c6dc81':'#4f7470',.5))+line('M89 -37v32','#365f58',2)+circle(100,-27,3,'#d4c991'));
 }
 function tank(x,y,w,h){
  return group(x,y,ellipse(5,1,w*.59,8,'#42584625')+rect(-w/2,-h,w,h,'url(#iw-cylinder)')+ellipse(0,0,w/2,7,'#86a799')+ellipse(0,-h,w/2,8,'#b6c9b6')+line('M'+(-w/2)+' '+(-h*.55)+'q'+(w/2)+' 10 '+w+' 0','#6b9687',2)+line('M'+(w*.29)+' '+(-h)+'v'+h+'m5 0v-'+h,'#506a64',1.8)+many(6,k=>line('M'+(w*.29)+' '+(-h+5+7*k)+'h5','#506a64',1.25)));
 }
 function substation(x,y){
  return group(x,y,block(-8,4,116,5,23,'#aaa99b','#d3d3b8','#91a296')+many(3,k=>group(k*33,-2,block(0,0,26,26,10,'#788d88','#acb6a8','#5a7674')+many(2,j=>group(7+j*12,-25,line('M0 0v-12','#596a65',3)+many(3,h=>ellipse(0,-3-h*3.4,3.3,1,'#364f50'))))))+line('M7 -39Q24 -32 39 -39T72 -39','#5e6e65',1.35));
 }
 function pipe(d,live=false){
  return line(d,'#627e80',12)+line(d,'#9fbdb5',8)+line(d,'#c5d5bf',2.3)+ (live?'<path d="'+d+'" fill="none" stroke="#4f9c9b" stroke-width="4" stroke-dasharray="6 20">'+animate('stroke-dashoffset','26;0',1.15)+'</path>':'');
 }
 function fore(){return tree(28,411,.81)+tree(789,415,.9)+tree(809,406,.54);}
 function inspector(x,y,motion,scale=.93){return group(0,0,'<g>'+travel(motion,7.5,'indefinite')+worker(x,y,{walk:true,scale,cap:'#f0c265',jacket:'#447e87'})+'</g>');}
 function caption(x,y,txt){return word(x,y,txt,13,'#41685a');}
 const val=(s,id)=>s.changes.find(c=>c.id===id)?.value||'';
 const metric=(s,label)=>s.metrics.find(m=>m.label===label)?.value||'';
 function outdoors(d,i,trial){
  const s=d.steps[i];let scene=outside(), annotations='';
  if(d.id==='P0213'){
   const points=[[104,268],[306,226],[500,298],[688,246]];
   scene+=house(34,202,87,41,20,'entrance station')+house(654,197,93,38,18,'exit station')+tank(85,260,68,39)+tank(708,243,64,39);
   const anchors=points.map(([x,y])=>[x,y]);
   for(let j=0;j<3;j++){const [x,y]=anchors[j],[a,b]=anchors[j+1];
    const k='M'+x+' '+y+' L'+((x+a)/2)+' '+((y+b)/2+12)+' L'+a+' '+b;
    scene+=pipe(k,true);
    if(i===j)annotations+=placard((x+a)/2,(y+b)/2-27,['Pipe E0','Resistor E1','Pipe E2'][j],trial?'traffic '+n(trial.flow):metric(s,'traffic')?'traffic '+metric(s,'traffic'):'');
   }
   points.forEach(([x,y],k)=>{
    scene+=group(x,y,ellipse(2,4,18,5,'#67867b55')+rect(-8,-16,16,20,'url(#iw-metal)',3)+rect(-12,-17,24,5,'#6e8982',2)+line('M0 -17v-11','#426764',3)+ellipse(0,-30,10,3,'#ae6c4d')+circle(8,-9,5,'#e9e7cf')+line('M8 -9l2 -3','#526968',1));
    annotations+=placard(x,y+31,'Node '+k,trial?'Pressure '+n(trial.pressures[k]):val(s,'v'+k));
   });
   scene+=inspector(270,334,'M0 0l32 -8 -32 8');
  }else if(d.id==='P0214'){
   const selected=new Set(s.changes.filter(c=>c.value==='Schedule maintenance').map(c=>c.id));
   const scenario=/^(?:scenario|scene)/i.test(s.time ?? '');
   const maintenance=new Map();
   for(const frame of d.steps)for(const c of frame.changes)if(c.value==='Schedule maintenance')maintenance.set(c.id,frame.time+' Overhaul');
   if(trial){
    selected.clear();maintenance.clear();
    for(const [asset,period] of Object.entries(trial.periodByAsset)){
     if(period<=2)maintenance.set(asset,'No. '+period+' Periodic maintenance');
     if(!scenario && i+1===period && period<=2)selected.add(asset);
    }
   }
   scene+=pole(686,223,1.08)+pole(778,193,.78)+cable('M686 142Q735 169 778 137',false)+generator(124,225,false)+generator(387,244,false)+substation(650,291)+house(43,319,83,31,19,'Duty room');
   const sites={G1:[186,244],G2:[451,262],L1:[690,294]};
   for(const [id,[x,y]] of Object.entries(sites)){
    const work=selected.has(id);
    if(work){scene+=worker(x+38,y+7,{work:true,jacket:'#d68643',scale:.96});scene+=group(x+18,y+6,rect(-12,-11,26,10,'#c2a05a',1)+rect(-12,-10,26,8,'url(#iw-hatch)')+line('M-9 -1v5m20-5v5','#6d7162',2));}
    annotations+=placard(x,y+38,id,work?'Maintenance in this period':trial?(maintenance.get(id)||'No maintenance this period'):scenario?(maintenance.get(id)||'No maintenance this period'):s.time==='No maintenance during the planning period'?(s.active.includes(id)?'No maintenance this period':''):'No maintenance in this issue');}
   scene+=inspector(214,319,'M0 0l38 8 -38 -8',.98);
   if(scenario)scene+=worker(132,328,{work:true,jacket:'#588a78'});
  }else if(d.id==='P0013'){
   const charge=/Storage charge ([\d.]+)/.exec(s.detail), discharge=/discharge ([\d.]+)/.exec(s.detail);
   const charging=Number(charge?.[1])>0, discharging=Number(discharge?.[1])>0;
   const windMW=/Wind power ([\d.]+) MW/.exec(s.detail)?.[1],thermalMW=trial?trial.thermal:/thermal generation ([\d.]+) MW/.exec(s.detail)?.[1];
   scene+=wind(112,219,.77,Number(windMW)>0)+wind(180,227,.58,Number(windMW)>0)+pole(694,204,1)+pole(781,178,.70)+cable('M696 129Q738 157 781 125',true)+generator(268,242,Number(thermalMW)>0)+
    cable('M179 227Q246 258 315 253T418 264',Number(windMW)>0)+cable('M372 242Q395 255 418 264',Number(thermalMW)>0)+
    cable('M418 264Q525 272 626 258',true)+cable('M418 264L399 278L438 295',charging||discharging,discharging)+
    circle(418,264,4,'#d6bc74')+substation(626,268)+storage(425,321,null)+inspector(222,302,'M0 0l26 7 -26 -7');
   annotations+=placard(138,265,'Wind power',windMW+' MW')+placard(333,272,'Thermal generation',thermalMW+' MW')+placard(491,351,'energy storage',charging?'charge '+charge[1]+' MW':discharging?'Release '+discharge[1]+' MW':'standby')+placard(686,295,'Electricity sold',trial?'net electricity sales '+n(trial.sold)+' MW':val(s,s.active[0]));
  }else if(d.id==='P0057'){
   const power=trial?trial.power:d.trend.points[i].value,on=power>1e-6;
   scene+=pole(699,210,1.09)+pole(780,181,.73)+cable('M698 130Q743 160 780 126',on)+house(51,197,93,38,24,'Measuring room')+
    tank(124,260,76,60)+tank(183,237,62,50)+pipe('M151 262L223 273L257 251L324 266',on)+generator(320,275,on)+
    substation(607,268)+cable('M450 266Q513 283 558 261T637 260',on)+worker(513,299,{work:on,scale:.88})+worker(100,308,{jacket:'#4b8094',scale:.85});
   annotations+=placard(147,304,'Remaining fuel amount',n(trial?trial.remaining:s.level))+placard(386,309,'Thermal power unit',n(power)+' MW')+placard(662,300,'Market',val(s,'sale'));
  }else{
   const charged=trial?trial.charge>0:s.links.some(([from,to])=>from==='grid'&&to==='bat'),discharged=trial?trial.discharge>0:s.links.some(([from,to])=>from==='bat'&&to==='grid');
   const energy=trial?trial.energy:s.level;
   const ratio=Math.max(0,Math.min(1,(energy-d.minCapacity)/(d.capacity-d.minCapacity))); // range above the modeled minimum
   scene+=pole(582,214,1.12)+pole(735,189,.85)+cable('M582 132Q655 173 735 126',charged||discharged,charged)+house(70,205,91,39,23,'control room')+
    house(362,208,84,33,17,'inverter')+substation(577,271)+storage(150,283,ratio)+
    cable('M258 270L322 287L390 259L425 266L503 244L588 257',charged||discharged,charged)+inspector(347,312,'M0 0l26 -6 -26 6');
   annotations+=placard(211,313,'energy storage device','Stock '+n(energy))+placard(635,300,'power grid',trial?(charged?'Charging '+n(trial.charge):discharged?'generate electricity '+n(trial.discharge):'No power exchange'):val(s,'grid'))+caption(397,345,charged?'Grid power transmission · charging':discharged?'Energy storage supplies power to the grid':'No power exchange in this period');
  }
  return scene+annotations+fore();
 }
 function machine(x,y,id,job){
  const active=job&&job!=='Idle';
  const shell=ellipse(12,5,73,13,'#4562542a')+block(-56,1,103,41,23,'#658f87','#c1d4bc','#48746f')+block(-54,-35,89,19,23,'#aac1b5','#d7e0c9','#789e96')+
    rect(-42,-39,55,25,'#344f53',4)+rect(-39,-37,48,19,'url(#iw-glass)',2)+line('M-16 -37v19','#638786',2)+rect(19,-35,16,19,'#3d5959',2)+rect(21,-33,12,6,active?'#b1dfa7':'#79968c')+circle(24,-21,2,'#dfb85d')+circle(31,-21,2,'#a8d193')+
    '<g transform="translate(-20 -24)">'+(active?'<g>'+travel('M-10 0H9H-10',1.3,'indefinite')+line('M0 -11v8','#587476',4)+circle(0,-1,3,'#f2c16e')+'</g>':'')+'</g>'+
    many(7,i=>line('M'+(-36+i*6)+' -8h3','#396762',1.5))+rect(26,-9,11,4,active?'#c9e78c':'#9cad92',1)+rect(-47,1,9,3,'#4d6057')+rect(32,1,9,3,'#4d6057')+word(2,-1,id,13,'#fffae5');
  return group(x,y,shell,1,'data-machine="'+id+'"');
 }
 function precedenceBoard(ops,now){
  // Place each operation after its true predecessors, even when they belong to different jobs.
  const level=new Map(),position=new Map(),byId=new Map(ops.map(op=>[op.id,op]));
  function depth(op){
   if(!level.has(op.id))level.set(op.id,op.predecessors.length?1+Math.max(...op.predecessors.map(id=>depth(byId.get(id)))):0);
   return level.get(op.id);
  }
  const rows=new Map();
  for(const op of ops){
   const col=depth(op),row=rows.get(col)||0;rows.set(col,row+1);
   position.set(op.id,[19+col*146,26+row*35]);
  }
  let content=rect(0,0,447,103,'#173c39f7',6)+word(18,17,'Process precursor relationship',13,'#e2ecde','start',700);
  for(const op of ops)for(const pred of op.predecessors){
   const [x,y]=position.get(pred),[tx,ty]=position.get(op.id);
   const ready=byId.get(pred).end<=now,color=ready?'#add09c':'#718987';
   content+=line('M'+(x+109)+' '+(y+13)+'L'+(tx-3)+' '+(ty+13),color,1.4)+
    path('M'+(tx-7)+' '+(ty+10)+'l5 3-5 3z',color);
  }
  for(const op of ops){
   const [x,y]=position.get(op.id);
   const state=now>=op.end?'Completed':now>=op.start?'In process':op.predecessors.every(id=>byId.get(id).end<=now)?'Can start work':'Waiting for the precursor';
   const fill=state==='In process'?'#f4d48c':state==='Completed'?'#c6dfc0':state==='Can start work'?'#b1dfe2':'#546d6b';
   content+='<g data-operation="'+esc(op.id)+'" data-status="'+esc(state)+'"><title>'+esc(op.id+' · '+state+' · precursor '+(op.predecessors.join(', ')||'None'))+'</title>'+
    rect(x,y,108,26,fill,3)+word(x+54,y+17,op.id+' '+state,12,state==='Waiting for the precursor'?'#f5faf3':'#254440')+'</g>';
  }
  return group(349,14,content);
 }
 function workshop(d,i,trial){
  const actual=d.steps[i];
  let s=actual;
  if(trial?.batch){
   const assignments=new Map(trial.batch.flatMap(b=>[[b.machine,b.op],[b.technician,b.op]]));
   s={...actual,links:trial.batch.map(b=>[b.machine,b.technician]),changes:d.entities.map(r=>({id:r.id,value:assignments.get(r.id)||'Idle'}))};
  }
  const m={M1:[151,259],M2:[400,228],M3:[647,267]},idle={T1:[190,338],T2:[385,342],T3:[575,350]};
  function at(step,id){
   const pair=step?.links.find(l=>l[1]===id);
   if(!pair)return idle[id];const [x,y]=m[pair[0]];return [x+48,y+17];
  }
  let body=factoryHall()+house(630,158,113,30,14,'tool room')+many(3,k=>rect(290+k*29,149,21,18,'#a9a78b',1));
  const original=window.ORTOPIA_REPLAY_LOGIC?.[d.id]?.[0]?.operations||[];
  const ops=original.map(op=>({...op,...trial?.batch?.find(b=>b.op===op.id)}));
  for(const [id,[x,y]] of Object.entries(m)){
   const active=ops.some(op=>op.machine===id && op.start<=s.clock && s.clock<op.end);
   if(active)body+='<ellipse cx="'+(x+4)+'" cy="'+(y+7)+'" rx="83" ry="17" fill="#ffd88b4d" stroke="#e5ba65" stroke-width="2.7"/>';
   body+=machine(x,y,id,val(s,id));
  }
  for(const id of Object.keys(idle)){
   const to=at(s,id),was=at(d.steps[i-1],id),moved=to[0]!==was[0]||to[1]!==was[1],working=s.links.some(l=>l[1]===id);
   body+=worker(...to,{jacket:{T1:'#c37b4d',T2:'#538baa',T3:'#79935a'}[id],work:working,walk:!working&&moved,from:moved?was:null,id,scale:1.12});
  }
  for(const [id,[x,y]] of Object.entries(m)){
   const active=ops.find(op=>op.machine===id && op.start<=s.clock && s.clock<op.end);
   body+=placard(x,y+31,active?id+' + '+active.technician:id,active?active.id:val(s,id));
  }
  body+=ops.length?precedenceBoard(ops,s.clock):'';
  const note=trial?.blocked||trial?.bound||(trial?.batch?'This batch of construction will start at the same time, and the final completion time will be '+n(Math.max(...trial.batch.map(b=>b.end))):'');
  if(note)body+=group(190,379,rect(0,0,440,32,trial.blocked?'#784b37':'#27575b',4)+word(220,21,note,15,'#fff7db'));
  return body;
 }
 function rail(x1,y1,x2,y2,width){
  const len=Math.hypot(x2-x1,y2-y1),deg=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
  return group(x1,y1,'<g transform="rotate('+deg+')">'+rect(0,-width/2,len,width,'#647b78',3)+rect(0,-width/2+3,len,width-6,'#a4b2a7',2)+many(Math.floor(len/8),k=>line('M'+(5+k*8)+' '+(-width/2+5)+'v'+(width-10),'#788f85',2))+line('M0 '+(-width/2)+'h'+len,'#d7c17c',2)+line('M0 '+width/2+'h'+len,'#e2cf97',2)+'</g>');
 }
 function arm(x,y,on){
  return group(x,y,ellipse(1,2,17,6,'#7f8c7a')+rect(-10,-6,21,8,'#c69756',3)+
   '<g>'+(on?swing(-10,8,2.2):'')+line('M0 -5l9 -24 -13 -14','#976739',8)+line('M0 -6l9 -23 -13 -14','#e0ae61',5)+circle(9,-29,4,'#597370')+line('M-4 -43l-10 4 -3 7','#536966',3)+'</g>');
 }
 function car(x,y,c,route,mark){
  const col=c.colour==='2'?['#d0835e','#efb48b','#9b5a45']:['#5b91a4','#a4c9cf','#487184'];
  const marker=mark?'<ellipse cx="1" cy="3" rx="36" ry="9" fill="none" stroke="'+(mark==='release'?'#197660':'#b06a20')+'" stroke-width="3"/>'+
   group(0,-45,rect(-22,0,44,17,mark==='release'?'#17634d':'#7d501e',3)+word(0,13,mark,11,'#fffbee','middle',700)):'';
  const body=marker+ellipse(3,1,30,6,'#4c5a542e')+many(2,k=>group(-15+32*k,-2,ellipse(0,0,5,6,'#405351')+circle(0,0,2,'#bdbeb0')))+path('M-28 -8L-22 -14L-8 -16L-1 -22L14 -21L23 -14L30 -10V-4L25 -2H-27Z',col[0])+
   path('M-22 -14l9-4 10 -1 7 -7 14 1 7 8 -2 3 -8 -7 -14 -1 -7 6Z',col[1])+path('M0 -21l12 1 7 6 -23 -1Z','#b4d8d6')+line('M6 -21v7','#506f76',1.6)+rect(-27,-8,5,2,'#eac686',1)+rect(25,-9,4,2,'#fff2bf',1)+word(6,-4,String(c.id),10,'#fffdeb','middle',750);
  return group(x,y,'<g data-car="'+c.id+'">'+(route?travel(route,4.7):'')+body+'</g>');
 }
 function assembly(d,i,direct=false){
  const f=d.factory;
  const empty=()=>({arrival:null,departure:null,queues:Object.fromEntries(f.lanes.map(l=>[l,[]])),discharged:[]});
  function frame(index){
   if(index<0)return empty();
   const recorded=d.steps[index].factory;
   if(!direct)return recorded;
   // With unchanged upstream order, every arriving car may pass straight through its assigned lane.
   const arrived=d.steps.slice(0,index+1).map(step=>step.factory.arrival).filter(id=>id!=null);
   return {...empty(),arrival:recorded.arrival,departure:recorded.arrival,discharged:arrived};
  }
  const fr=frame(i),prev=frame(i-1);
  const incoming=k=>[80+k*9,181+k*38],middle=k=>[392,210+(k-1)*74],out=k=>[628+k*23,184+k*38];
  function locate(frame,c){
   if(frame.discharged.includes(c.id))return out(frame.discharged.indexOf(c.id));
   if(frame.queues[c.lane]?.includes(c.id))return middle(c.lane);
   return incoming(c.id-1);
  }
  let body=factoryHall()+house(18,145,107,34,15,'Painting section')+house(636,146,119,35,14,'Final assembly section')+
   line('M134 349L176 349L176 185L202 185M176 210H211M176 284H211M535 210h42v143h48M535 284h42','#afb49e',15)+line('M134 349L176 349L176 185L202 185M176 210H211M176 284H211M535 210h42v143h48M535 284h42','#ebd68f',1.5,'stroke-dasharray="9 7"')+
   rail(83,182,124,348,45)+rail(201,210,544,210,45)+rail(201,284,544,284,45)+rail(621,185,725,350,48)+arm(274,202,fr.arrival!=null)+arm(492,280,fr.departure!=null)+worker(185,326,{work:true,jacket:'#5b8d9c'})+worker(585,311,{work:fr.departure!=null,jacket:'#be8050'});
  for(const c of f.cars){
   const p=locate(prev,c),t=locate(fr,c);let route='';
   if(p[0]!==t[0]||p[1]!==t[1]){
    let pts=[p];
    if(c.id===fr.arrival){const mid=middle(c.lane);pts.push([175,p[1]],[206,mid[1]],mid);}
    if(c.id===fr.departure){const mid=middle(c.lane);pts.push([540,mid[1]],[575,t[1]]);}
    pts.push(t);route=pts.map(([x,y],k)=>(k?'L':'M')+(x-t[0])+' '+(y-t[1])).join(' ');
   }
   const mark=c.id===fr.departure?'release':fr.queues[c.lane]?.[0]===c.id?'Leave a car':'';
   body+=car(...t,c,route,mark);
  }
  const incomingCar=f.cars.find(c=>c.id===fr.arrival);
  for(const lane of f.lanes){
   const atGate=[...prev.queues[lane],...(incomingCar?.lane===lane?[fr.arrival]:[])];
   const head=atGate[0],chosen=head!=null&&head===fr.departure;
   const label=head==null?'empty':('Vehicle '+head+(chosen?' release':' Leave a car'));
   const y=middle(lane)[1];
   body+=group(208,y-42,rect(0,0,151,22,chosen?'#17634d':'#44574e',4)+word(75,15,'Tao '+lane+' leader · '+label,13,'#fffbed','middle',700));
  }
  const slots=f.cars.map((_,j)=>{
   const id=fr.discharged[j],isNew=id!=null&&id===fr.departure;
   return group(95+j*69,0,rect(0,0,61,24,isNew?'#ebce87':id!=null?'#c5dfc0':'#546b65',3)+word(30,17,id!=null?'Vehicle '+id:'—',13,id!=null?'#27483e':'#dae4d9','middle',700));
  }).join('');
  body+=group(198,396,rect(0,-5,450,34,'#173c39f7',5)+word(48,16,'Final assembly sequence',15,'#f3f3df','middle',700)+slots);
  if(direct)body+=group(528,19,rect(0,0,255,34,'#204b50',4)+word(125,22,'Comparison: Send directly to final assembly in the order of arrival.',15,'#f6f4e4'));
  return body+placard(110,381,'Painting export')+placard(703,379,'Final assembly entrance',fr.discharged.length+' / '+f.cars.length);
 }
 const headers={P0013:'Combined wind, thermal and storage power station',P0057:'thermal power plant',P0062:'Energy storage power station',P0075:'Multi-resource processing workshop',P0213:'Steady state pipe network',P0214:'Joint maintenance site',P0020:'Body cushioning and assembly workshop'};
 const notes={P0013:'Each frame independently displays the joint scheduling of a scenario tree node.',P0213:'The three sections of pipeline maintain the same steady-state flow rate and can be viewed in order by connection.',P0214:'The four cost scenarios share the same maintenance plan.',P0075:'Technicians and machines are paired according to actual occupation of the process.',P0020:'The vehicle number, warehousing lane and assembly sequence are from the example solution.',P0062:'The battery bright grid displays the position of the ending stock in the allowable range.',P0057:'The limit is taken from the remaining model fuel limit at the end of the current period.'};
 function render(stage,d,i){
  const s=d.steps[i],isAssembly=d.id==='P0020';
  const baseBody=isAssembly?'<g data-fifo-view="selected">'+assembly(d,i)+'</g><g data-fifo-view="direct" display="none">'+assembly(d,i,true)+'</g>':d.id==='P0075'?workshop(d,i):outdoors(d,i);
  const body=isAssembly?baseBody:'<g data-industry-original="">'+baseBody+'</g><g data-industry-trial="" display="none"></g>';
  const heading=s.time||s.title;
  stage.innerHTML='<figure class="industry-world" style="margin:0;background:#253c36"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 440" width="100%" role="img" aria-label="'+esc(headers[d.id]+' · '+s.title)+'" style="width:100%;height:auto;display:block;font-family:Microsoft YaHei,Segoe UI,sans-serif">'+defs()+'<g clip-path="url(#iw-film)">'+body+
   group(18,15,rect(0,0,Math.max(154,[...heading].length*12+27),45,'#fdfbf0ec',5)+word(9,17,headers[d.id],14,'#2d584a','start',700)+word(9,34,heading,11,'#687e6d','start',500))+'</g></svg><figcaption style="background:#f4f6ed;color:#536b5a;padding:5px 12px;font-size:.76rem">'+esc(notes[d.id])+' Layout and personnel action instructions. </figcaption></figure>';
  if(isAssembly){
   stage.previewDecision=optionIndex=>{
    const direct=Number(optionIndex)===1;
    stage.querySelector('[data-fifo-view="selected"]')?.setAttribute('display',direct?'none':'inline');
    stage.querySelector('[data-fifo-view="direct"]')?.setAttribute('display',direct?'inline':'none');
   };
  }else{
   stage.previewDecision=optionIndex=>{
    const logic=window.ORTOPIA_REPLAY_LOGIC?.[d.id]?.[i],choice=Number(optionIndex);
    const trial=logic?.trials?.[choice-1],selected=stage.querySelector('[data-industry-original]'),alternative=stage.querySelector('[data-industry-trial]');
    if(!selected||!alternative)return;
    selected.setAttribute('display',trial?'none':'inline');alternative.setAttribute('display',trial?'inline':'none');
    if(!trial)return;
    const option=logic.comparison.options[choice];
    const name='Compare · '+option.label;
    alternative.innerHTML=(d.id==='P0075'?workshop(d,i,trial):outdoors(d,i,trial))+
     group(18,68,rect(0,0,Math.max(154,[...name].length*14+18),26,'#235357',3)+word(9,18,name,13,'#fff8d9','start',700));
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)for(const a of alternative.querySelectorAll('animate,animateMotion,animateTransform'))a.remove();
    const svg=stage.querySelector('svg');svg.setCurrentTime(stage.sceneTime||0);
   };
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)for(const a of stage.querySelectorAll('animate,animateMotion,animateTransform'))a.remove();
 }
 // Common physical equipment for the interactive P0013 station and its playback view.
 function dispatchScene({on,gen,charge,discharge,stored,capacity,sale,selected}){
  const wire=(d,live,reverse=false)=>cable(d,live,reverse);
  const focus=(id,x,y,rx,ry)=>id===selected?'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#e6dc9a" fill-opacity=".32" stroke="#ad842e" stroke-width="2.5" stroke-dasharray="7 3"/>':'';
  const drawing=outside()+focus('wind',125,224,103,14)+focus('thermal',341,245,88,17)+focus('storage',480,323,78,14)+focus('market',663,266,76,16)+
   wire('M135 225Q244 257 324 250T409 265',true)+wire('M349 245Q366 263 409 265',on&&gen>1e-7)+
   wire('M409 265Q520 274 630 256',sale>1e-7)+wire('M409 265L409 280L449 300',charge+discharge>1e-7,discharge>charge)+
   wind(103,219,.88,true)+wind(174,225,.61,true)+generator(267,241,on)+storage(421,320,Math.max(0,Math.min(1,stored/capacity)))+
   substation(620,263)+pole(690,205,1)+pole(781,178,.70)+wire('M692 130Q736 156 781 125',sale>1e-7)+
   circle(409,265,5,'#efbf60')+inspector(251,304,'M0 0l42 4 -42 -4')+worker(574,270,{work:true,jacket:'#508887',scale:.76});
  return '<svg class="el-physical" viewBox="22 88 779 294" role="img" aria-label="Power flow between wind farms, thermal power units, energy storage stations and power grids">'+defs()+drawing+'</svg>';
 }
 return {supports:id=>ids.has(id),render,dispatchScene};
})();
