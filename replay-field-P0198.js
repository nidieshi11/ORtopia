/* A relay signal illustrates induced shortest-path distance on the instance's path. */
window.ORTOPIA_FIELD_P0198=(()=>{
 'use strict';
 const F=window.ORTOPIA_FIELD,{W,H,poly,line,ellipse,box,badge,text,tree,hotspot,cachedWorld}=F;
 const stations=[[55,237],[171,222],[282,247],[399,201],[518,229],[637,200],[755,229],[873,205]];
 const colors=['#45d4aa','#f1bc6a','#8cbaf3','#d99fcd','#b1ce72','#d79b82','#b6a5eb','#92ced3'];
 const dark='#193c42', white='#f3f3d8', danger='#ff9a82';
 const stored=new WeakMap();
 function landscape(c){
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#264e62');sky.addColorStop(.5,'#98b9b2');sky.addColorStop(1,'#d9cfac');
  c.fillStyle=sky;c.fillRect(0,0,W,H);ellipse(c,786,78,30,30,'#e5d7a4');
  poly(c,[[0,160],[125,98],[212,129],[326,67],[421,113],[520,83],[620,120],[736,74],[857,122],[940,92],[940,H],[0,H]],'#688e8d');
  poly(c,[[0,174],[88,142],[173,152],[286,117],[389,159],[542,125],[691,150],[808,130],[940,149],[940,H],[0,H]],'#537b73');
  for(let i=0;i<100;i++){const x=i*9.7,y=158+11*Math.sin(x*.017);poly(c,[[x-4,y],[x,y-12-(i*5%9)],[x+4,y]],'#486c66');}
  poly(c,[[0,193],[187,172],[305,190],[460,164],[609,175],[755,158],[940,163],[940,414],[0,414]],'#719286');
  poly(c,[[0,280],[200,256],[293,274],[449,248],[641,232],[786,256],[940,244],[940,414],[0,414]],'#63867f');
  const river=[[0,360],[120,321],[218,349],[343,313],[486,306],[596,270],[699,277],[820,253],[940,263]];
  line(c,river,'#a2b6a3',22);line(c,river,'#789eaa',16);line(c,river,'#a2c0c2',2);
  for(let i=0;i<39;i++){const x=(i*119+33)%939,y=248+(i*37)%81;tree(c,x,y,.32+(i%3)*.1);}
 }
 const background=cachedWorld(landscape);
 function wire(i,t){
  const [x,y]=stations[i],[xx,yy]=stations[i+1];
  return [x+(xx-x)*t,y+(yy-y)*t-43+Math.sin(t*Math.PI)*12];
 }
 function districts(cuts){
  const parts=[];let begin=0;
  for(let i=0;i<stations.length;i++)if(cuts.has(i)||i===stations.length-1){
   parts.push({start:begin,end:i,hops:i-begin});begin=i+1;
  }
  return parts;
 }
 function mast(c,index,node,color,lit){
  const [x,y]=stations[index];ellipse(c,x+3,y+4,24,7,'#21484a45');
  box(c,x-17,y+5,27,12,7,['#37575a','#2d484c','#a4b5a2']);
  for(const side of [-1,1])line(c,[[x+side*12,y-7],[x+side*3,y-45]],'#cdd6bf',2.8);
  line(c,[[x-11,y-8],[x+8,y-22],[x-6,y-31],[x+3,y-42]],'#cdd6bf',1.8);
  for(let j=0;j<3;j++){c.fillStyle=color;c.fillRect(x-12+j*6,y-3,4,4);}
  ellipse(c,x,y-44,8,8,'#264f55');ellipse(c,x,y-44,4,4,lit?white:color);
  badge(c,String(node),x,y+23,dark,white,16);
 }
 function mount(host,onInteract,index,onNode,replayAction){
  const data=window.ORTOPIA_REPLAYS.P0198,plan=data.steps[index],n=data.path.length;
  let s=stored.get(host);
  if(!s){s={};stored.set(host,s);}
  if(s.index!==index){s.index=index;s.cuts=new Set(plan.cuts);}
  const {c,scene,control,result}=F.siteShell(host,'cluster-relay','八座中继站及七条连接，点击相邻站之间的开关可划定分区。','点击线路上的分界开关。光点每经过一条边算一跳。');
  let parts=[],diameter=0,time=host.sceneTime||0;
  control.innerHTML='<div class="fp-group"><strong>分区方案</strong>'+data.steps.map((v,i)=>'<button type="button" data-scheme="'+i+'">'+v.title+'</button>').join('')+'</div>';
  function edit(next){onInteract?.();s.cuts=new Set(next);refresh();replayAction?.();}
  control.onclick=e=>{const b=e.target.closest('[data-scheme]');if(b)edit(data.steps[Number(b.dataset.scheme)].cuts);};
  const switches=[];
  for(let i=0;i<n-1;i++){
   const [x,y]=wire(i,.5);
   switches.push(hotspot(scene,'切换站 '+data.path[i]+' 与 '+data.path[i+1]+' 之间的分界',x,y,()=>{
    const next=new Set(s.cuts);if(next.has(i))next.delete(i);else next.add(i);edit(next);
   },57,54));
  }
  function refresh(){
   parts=districts(s.cuts);diameter=Math.max(...parts.map(p=>p.hops));
   switches.forEach((b,i)=>b.setAttribute('aria-pressed',String(s.cuts.has(i))));
   control.querySelectorAll('[data-scheme]').forEach(b=>{
    const cuts=data.steps[Number(b.dataset.scheme)].cuts;
    b.setAttribute('aria-pressed',String(cuts.length===s.cuts.size&&cuts.every(i=>s.cuts.has(i))));
   });
   result.dataset.error=String(diameter>data.maxDiameter);
   result.textContent=parts.length+' 个分区 · 最远 '+diameter+' 跳 / 上限 '+data.maxDiameter+' 跳';
   render(time);
  }
  function render(t){
   time=t;background(c);
   const darkStrip=c.createLinearGradient(0,305,0,H);darkStrip.addColorStop(0,'#233f4100');darkStrip.addColorStop(1,'#203d40');c.fillStyle=darkStrip;c.fillRect(0,305,W,H-305);
   badge(c,'区内最远 ≤ '+data.maxDiameter+' 跳',99,32,dark,white,15);
   badge(c,(diameter>data.maxDiameter?'超过跳数上限':'各区互达')+' · '+parts.length+' 区',W-94,32,dark,diameter>data.maxDiameter?danger:'#c8ecd2',16);
   for(let j=0;j<parts.length;j++){
    const {start,end,hops}=parts[j],color=colors[j],left=stations[start][0]-26,right=stations[end][0]+26;
    const path=stations.slice(start,end+1).map(([x,y])=>[x,y+4]);if(path.length===1)ellipse(c,path[0][0],path[0][1],24,16,color+'47');else line(c,path,color+'47',34);
    line(c,[[left,353],[left,359],[right,359],[right,353]],color,3);
    badge(c,(j+1)+'区 · '+hops+'跳',(left+right)/2,382,dark,hops>data.maxDiameter?danger:color,13);
   }
   for(let i=0;i<n-1;i++){
    const cut=s.cuts.has(i),j=parts.findIndex(p=>p.end>=i),color=colors[j];
    const pts=Array.from({length:13},(_,k)=>wire(i,k/12));
    line(c,pts,'#375659',5);line(c,pts,cut?'#ccdad1':color,2,cut?[4,5]:[]);
    const [x,y]=wire(i,.5);
    c.fillStyle=cut?'#693e37':'#294f4f';c.beginPath();c.roundRect(x-13,y-9,26,18,5);c.fill();
    line(c,[[x-7,y+2],[x-4,y+2],[x+5,y+(cut?-4:2)]],cut?'#ffb395':white,2);
    ellipse(c,x+7,y+2,2,2,white);
   }
   for(let j=0;j<parts.length;j++){
    const {start,end,hops}=parts[j],color=colors[j];
    const progress=(t%3)/3*hops,done=Math.floor(progress);
    for(let i=start;i<=end;i++)mast(c,i,data.path[i],color,i===start+done);
    const [x,y]=hops?wire(Math.min(end-1,start+done),progress-done):[stations[start][0],stations[start][1]-44];
    const tint=progress>data.maxDiameter?danger:color;
    ellipse(c,x,y,11,11,tint+'66');ellipse(c,x,y,5,5,tint);ellipse(c,x,y,2,2,white);
   }
  }
  host.sceneFrame=render;
  host.previewDecision=option=>{const alt=window.ORTOPIA_REPLAY_LOGIC.P0198[index].trial;s.cuts=new Set(data.steps[option?alt:index].cuts);refresh();};
  host.clusterSnapshot=()=>({cuts:[...s.cuts].sort(),groups:parts.map(v=>data.path.slice(v.start,v.end+1)),diameter,feasible:diameter<=data.maxDiameter});
  refresh();
 }
 return {mount};
})();
