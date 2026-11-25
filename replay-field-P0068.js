/* A common route is chosen before demand is known. The loads are optimized for each scenario. */
(() => {
 'use strict';
 const F=window.ORTOPIA_FIELD, {W,H,clamp,line,poly,box,ellipse,text,badge,road,tree,person,along}=F;
 const sessions=new WeakMap();
 const ink='#234743',teal='#267d73',orange='#b56733',cream='#fff8df';
 const positions=[[114,224],[342,335],[744,137],[342,137],[744,335]];
 const stationNames=['车库','1 号站','2 号站','3 号站','4 号站'];

 function assess(data,state){
  const {input,loads}=data;
  const tours=[];let tour=[];
  for(const id of state.order){
   tour.push(id);
   if(state.breaks.has(id)){tours.push(tour);tour=[];}
  }
  if(tour.length)tours.push(tour);
  const costs=input.c;
  let travel=0,expectedDeviation=0;const legs=[],blocked=new Set();
  for(const stops of tours){
   const chain=[0,...stops,0],choices=loads[stops.join(',')];
   for(let i=1;i<chain.length;i++)travel+=costs['('+chain[i-1]+','+chain[i]+')'];
   choices.forEach((cargo,s)=>{
    if(!cargo){blocked.add(s+1);return;}
    const scenario=input.scenarios[s+1];
    stops.forEach((id,i)=>{expectedDeviation+=scenario.p*Math.abs(cargo[i+1]-cargo[i]-scenario.q[id]);});
   });
   const cargo=choices[state.scenario-1];
   stops.forEach((id,i)=>legs.push({id,from:chain[i],incoming:cargo?.[i],outgoing:cargo?.[i+1],
                                    demand:input.scenarios[state.scenario].q[id]}));
  }
  const penalty=input.parameters.varepsilon*input.parameters.c_min*expectedDeviation;
  return {legs,travel,penalty,cost:blocked.size?null:travel+penalty,blocked:[...blocked]};
 }
 function pathBetween(a,b){
  const start=positions[a],end=positions[b];
  if(a===0||b===0){
   const far=a===0?end:start;
   const path=[positions[0],[218,224],[218,far[1]],far];
   return a===0?path:path.reverse();
  }
  if(start[0]===end[0]||start[1]===end[1])return [start,end];
  return [start,[534,start[1]],[534,end[1]],end];
 }
 function bicycle(c,x,y,s=1,col=teal){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.45;
  for(const dx of [-5,6]){c.strokeStyle='#38535b';c.beginPath();c.arc(dx,0,3.2,0,2*Math.PI);c.stroke();}
  line(c,[[-5,0],[-1,-5],[2,0],[-5,0]],col,1.4);
  line(c,[[2,0],[4,-6],[6,0]],col,1.4);line(c,[[-2,-5],[4,-5]],col,1.2);
  line(c,[[3,-7],[5,-7]],'#38535b',1.1);c.restore();
 }
 function house(c,x,y,w,h,col='#bfaf94'){
  box(c,x,y,w,h,10,[col,'#938d7d','#ece3c9']);
  for(let dx=5;dx<w-3;dx+=10){
   c.fillStyle='#668884';c.fillRect(x+dx,y-h+5,4,5);
   if(h>22)c.fillRect(x+dx,y-h+15,4,5);
  }
 }
 const back=F.cachedWorld(c=>{
  F.terrain(c,68);
  // Parcels, public green and a canal behind the arterial create landmarks around the stations.
  poly(c,[[825,-2],[877,-2],[948,73],[948,143],[866,68]],'#aacdc1','#92b8a9',3);
  road(c,[[-10,224],[218,224]],24);road(c,[[218,-9],[218,430]],17);
  for(const y of [137,335])road(c,[[205,y],[940,y]],22);
  for(const x of [342,534,744])road(c,[[x,134],[x,416]],18);
  road(c,[[0,380],[217,380]],11,false);
  for(const [x,y,w,h] of [[38,88,47,29],[106,87,49,32],[31,283,50,28],[103,302,40,25],
                          [372,215,45,26],[430,210,48,26],[574,219,50,31],[644,212,40,23],
                          [373,405,42,22],[433,400,40,25],[573,404,50,24],[642,402,44,28],
                          [831,210,38,20],[884,221,34,24],[431,54,35,17],[588,57,49,20]]){
   house(c,x,y,w,h,(x%3)?'#b5ac95':'#c49e87');
  }
  for(const [x,y] of [[38,345],[169,343],[183,284],[260,201],[280,218],[470,251],[486,236],[613,261],
                      [686,255],[847,289],[882,283],[917,281],[751,67],[794,59],[677,62],[292,39],[387,45],
                      [118,358],[153,81],[863,366],[890,370],[907,367],[799,382]])tree(c,x,y,.56);
  house(c,73,190,83,32,'#769390');
  for(let i=0;i<3;i++){c.fillStyle='#3f5c5c';c.fillRect(80+25*i,170,16,18);line(c,[[80+25*i,176],[96+25*i,176]],'#8caaa1',1.3);}
  badge(c,'调运车库',115,144,'#365c56',cream,15);
 });
 function rack(c,id,count,state,selected,activeDeviation){
  const [roadX,y]=positions[id],x=roadX+95,k=Number.isFinite(count)?count:state.base[id].d;
  c.fillStyle=selected?'#f2ebc7':'#e5e9dd';c.fillRect(x-86,y-75,171,55);
  line(c,[[x-86,y-75],[x+84,y-75],[x+84,y-20],[x-86,y-20],[x-86,y-75]],selected?'#bc853f':'#a4b2a5',selected?2.8:1.4);
  for(let i=0;i<state.base[id].H;i++){
   const sx=x-73+(i%10)*16.1,sy=y-51+Math.floor(i/10)*17;
   if(i<k)bicycle(c,sx,sy,.85);else line(c,[[sx-4,sy+2],[sx,sy],[sx+4,sy+2]],'#aeb9ac',1.2);
  }
  const shade=activeDeviation?'#925034':selected?'#745733':'#2e6057';
  badge(c,stationNames[id]+'  ·  '+k+' 辆',x,y-86,shade,cream,15);
 }
 function van(c,x,y,angle,load){
  c.save();c.translate(x,y);
  const reverse=Math.cos(angle)<-.1? -1:1;
  const vertical=Math.abs(Math.sin(angle))>.7;
  if(vertical)c.rotate(angle);
  else c.scale(reverse,1);
  ellipse(c,0,3,24,8,'#344a4636');
  for(const dx of [-14,12]){ellipse(c,dx,4,5,4,'#374c51');ellipse(c,dx,4,2.2,1.8,'#b7c3b8');}
  box(c,-22,1,31,12,5,['#226f65','#1a6159','#7fb0a0']);
  box(c,9,1,13,13,3,['#e2be76','#bb8c4a','#f6d9a2']);
  c.fillStyle='#476575';c.fillRect(14,-10,7,5);
  for(let i=0;i<Math.min(9,load||0);i++)bicycle(c,-17+(i%5)*5,-12-4*Math.floor(i/5),.42,'#bcddbe');
  c.restore();
 }
 function draw(ui,state,plan,index,t){
  const c=ui.c,{legs}=plan,base=state.base;
  const returning=index===legs.length;
  const step=returning?{from:legs.at(-1).id,id:0,incoming:legs.at(-1).outgoing}:legs[index];
  const blocked=plan.blocked.includes(state.scenario);
  const counts=Object.fromEntries(Object.entries(base).map(([id,v])=>[id,v.d]));
  const deviations={};
  if(!blocked)for(const leg of legs.slice(0,index)){
   counts[leg.id]+=leg.incoming-leg.outgoing;
   deviations[leg.id]=leg.outgoing-leg.incoming!==leg.demand;
  }
  const transit=t/6;
  let start=step.from,startLoad=step.incoming;
  const split=index>0&&!returning&&start===0;
  const previous=legs[index-1];
  const toDepot=split&&transit<.35;
  let target=step.id;
  if(toDepot){start=previous.id;target=0;startLoad=previous.outgoing;}
  const threshold=returning ? .97 : .66;
  const move=clamp(toDepot?transit/.35:split?(transit-.35)/(threshold-.35):transit/threshold);
  const path=pathBetween(start,target);
  const [vx,vy,angle]=along(path,move);
  const unload=!returning&&!toDepot&&move>=1&&!blocked;
  const delta=(step.outgoing??0)-(step.incoming??0);
  const handled=unload?Math.min(Math.abs(delta),Math.floor((transit-threshold)/(1-threshold)*Math.abs(delta)+1e-6)):0;
  if(unload){counts[step.id]-=Math.sign(delta)*handled;deviations[step.id]=handled===Math.abs(delta)&&delta!==step.demand;}
  const load=unload?step.incoming+Math.sign(delta)*handled:startLoad;
  back(c);
  for(const leg of [...legs,{from:legs.at(-1).id,id:0}]){
   line(c,pathBetween(leg.from,leg.id),'#41857977',2.5,[6,5]);
  }
  if(split)line(c,pathBetween(previous.id,0),'#41857999',2.5,[6,5]);
  line(c,path,blocked?'#b47a71':'#ad6533',4,[6,5]);
  for(const id of state.order)rack(c,id,counts[id],state,id===target,deviations[id]);
  const banner=returning?'结束调运 · 回库':toDepot?'回库换装':('第 '+(index+1)+' 站 · '+stationNames[target]);
  badge(c,banner,108,27,'#214c44',cream,16);
  badge(c,'需求情景 '+state.scenario+'  ·  车载 '+(blocked?'—':load)+' / 9',748,27,blocked?'#874f40':'#315a50',cream,16);
  if(blocked){badge(c,'该情景无法在容量及偏离范围内完成此路线',470,368,'#894a38',cream,16);return;}
  van(c,vx,vy,angle,load);
  if(unload&&handled<Math.abs(delta)){
   const phase=(((transit-threshold)/(1-threshold))*Math.abs(delta))%1;
   const carrying=phase<.5;
   const f=carrying?2*phase:2-2*phase;
   const towardStation=delta<0?f:1-f;
   const wx=vx+4+34*towardStation,wy=vy-5-23*towardStation;
   person(c,wx,wy,t,'#bd7845',false);
   if(carrying)bicycle(c,wx+7,wy,1,'#398678');
  }
  const caption=returning?'运回车库 '+load+' 辆':toDepot?'上一趟返库':unload
   ?(delta>0?'装车 ':delta<0?'卸车 ':'交接 ')+handled+' / '+Math.abs(delta)+' 辆'
   :'驶往 '+stationNames[target];
  badge(c,caption,Math.max(66,Math.min(W-68,vx)),vy+22,'#fffae9',ink,13);
 }
 function mount(host,onInteract,index,onNode,replayAction){
  const data=window.ORTOPIA_REPLAYS.P0068.bikes;
  let s=sessions.get(host);
  if(!s){
   s={order:[...data.reference],breaks:new Set(),scenario:1,base:data.input.stations};sessions.set(host,s);
  }
  const ui=F.siteShell(host,'fp-bikes','共享单车调运车与四座车站，可点站点改派。',
    '点站点改派本趟，三个需求情景共用线路。');
  let plan;
  const legIndex=Math.min(index,s.order.length-1);
  function paint(){
   plan=assess(data,s);
   const name=s.order[legIndex],cut=s.breaks.has(name);
   ui.control.innerHTML='<div class="fp-group"><strong>访问顺序</strong>'+s.order.map((id,i)=>
    '<button type="button" data-station="'+id+'" aria-pressed="'+(legIndex===i)+'" title="把 '+id+' 号站换到当前顺位">'+id+' 号</button>'+
    (i<s.order.length-1?(s.breaks.has(id)?' ↪车库 ':' → '):'')).join('')+'</div>'+
    '<div class="fp-group"><label>需求情景 <select data-scenario>'+Object.keys(data.input.scenarios).map(k=>
      '<option value="'+k+'" '+(+k===s.scenario?'selected':'')+'>'+k+'</option>').join('')+'</select></label></div>'+
    '<button type="button" data-break '+(legIndex===s.order.length-1?'disabled':'')+' aria-pressed="'+cut+'">'+(cut?'取消中途回库':'本站后先回库')+'</button>'+
    '<button type="button" data-alt>试跑换序</button><button type="button" data-reset>恢复原解</button>';
   ui.result.dataset.error=String(plan.cost===null);
   ui.result.textContent=plan.cost===null?'情景 '+plan.blocked.join('、')+' 无可行装载':
     '行驶 '+plan.travel.toFixed(3)+' ＋ 期望罚金 '+plan.penalty.toFixed(3)+' ＝ '+plan.cost.toFixed(3);
  }
  function replay(at=index){paint();if(at!==index&&onNode)onNode(at);else if(replayAction)replayAction();else host.sceneFrame(0);}
  function redirect(id){
   onInteract?.();const pos=s.order.indexOf(id);
   [s.order[legIndex],s.order[pos]]=[s.order[pos],s.order[legIndex]];
   replay(legIndex);
  }
  for(const id of s.order){
   const [x,y]=positions[id];
   F.hotspot(ui.scene,'将 '+id+' 号站换到当前访问顺位',x+95,y-53,()=>redirect(id),170,74);
  }
  ui.control.onclick=e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.dataset.station){redirect(+b.dataset.station);return;}
   onInteract?.();
   if(b.hasAttribute('data-break')){
    const id=s.order[legIndex];if(s.breaks.has(id))s.breaks.delete(id);else s.breaks.add(id);
    replay(legIndex+1);return;
   }
   s.order=[...(b.hasAttribute('data-alt')?data.alternative:data.reference)];s.breaks.clear();
   replay(b.hasAttribute('data-alt')?s.order.findIndex((id,i)=>id!==data.reference[i]):0);
  };
  ui.control.onchange=e=>{
   if(e.target.hasAttribute('data-scenario')){onInteract?.();s.scenario=+e.target.value;replay();}
  };
  host.sceneFrame=t=>draw(ui,s,plan,index,t);
  host.previewDecision=choice=>{s.order=[...(choice?data.alternative:data.reference)];s.breaks.clear();s.scenario=1;paint();host.sceneFrame(host.sceneTime||0);};
  host.bikeSnapshot=()=>({order:[...s.order],scenario:s.scenario,plan});
  paint();host.sceneFrame(host.sceneTime||0);
 }
 window.ORTOPIA_FIELD_P0068={mount};
})();
