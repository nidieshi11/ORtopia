(() => {
'use strict';
const host=document.querySelector('#content');
const directoryHeading=document.querySelector('.directory-heading');
const ids=window.ORTOPIA_REPLAY_IDS;
const sceneByProblem=new Map();
const sceneTopics=window.ORTOPIA_SCENE_TOPICS??{};
const topicByProblem=new Map();
for(const topics of Object.values(sceneTopics)){
 for(const {label,ids} of topics){
  for(const id of ids)topicByProblem.set(id,label);
 }
}
for(const sections of Object.values(window.ORTOPIA_SUBDOMAINS)){
 for(const section of sections){
  for(const id of section.ids)sceneByProblem.set(id,section);
 }
}
const cases=new Map(window.ORTOPIA_SIMULATIONS.map(p=>{
 const scene=sceneByProblem.get(p.id);
 return [p.id,{...p,sceneId:scene?.key??p.domainId,sceneName:scene?.label??p.domain,topicLabel:topicByProblem.get(p.id)??'待分类'}];
}));
const q=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>typeof v==='number'?v.toLocaleString('zh-CN',{maximumFractionDigits:6}):String(v??'');
const fmt=(v,u)=>esc(num(v))+(u?' '+esc(u):'');
const tones=['#276859','#a85630','#4a778c','#715b8a','#8c712f','#316887','#965a64','#606b40'];
const tint=['#e7f0e9','#fbebde','#e7f0f4','#eee8f2','#f6efdb','#e0ecf4','#f7e7e8','#edf0e3'];
const promises=new Map();
const decisionUI=window.ORTOPIA_DECISIONS;
const labs={
 P0058:{scripts:['replay-field-common.js','replay-field-P0058.js'],api:'ORTOPIA_FIELD_P0058',link:'部署云服务器',name:'云数据中心',description:'改变机房建设和服务器订单，观察不同需求下的交付与成本。'},
 P0068:{scripts:['replay-field-common.js','replay-field-P0068.js'],api:'ORTOPIA_FIELD_P0068',link:'试排单车调运',name:'共享单车调运现场',description:'改变车站访问顺序，查看调运车的路径、装卸与站内库存。'},
 P0154:{scripts:['replay-field-common.js','replay-field-P0154.js'],api:'ORTOPIA_FIELD_P0154',link:'调节列车运行',name:'通勤地铁运营现场',description:'调节列车发车间隔，观察沿线列车运行和方案指标。'},
 P0198:{scripts:['replay-field-common.js','replay-field-P0198.js'],api:'ORTOPIA_FIELD_P0198',link:'划分中继网络',name:'中继网络分区',description:'点击相邻站之间的开关，试着用尽量少的分区，让每区内任意两站都能在两跳内互达。'},
 P0204:{scripts:['replay-field-common.js','replay-field-P0204.js'],api:'ORTOPIA_FIELD_P0204',link:'调度泊位和岸桥',name:'集装箱码头',description:'改动靠泊和岸桥安排，观察船舶等待及装卸进度。'},
 P0013:{scripts:['data/energy-lab-P0013.js','replay-field-common.js','replay-energy-world.js','replay-energy-lab.js'],api:'ORTOPIA_ENERGY_LAB',link:'进入风火储电站',name:'风火储联合电站',description:'扳动炉前开关，看火电、储能和并网电量怎样改变。'},
 P0045:{scripts:['data/marketing-lab-P0045.js','replay-marketing-lab.js'],api:'ORTOPIA_MARKETING_LAB',link:'动手分配渠道',name:'客户与渠道分配台',description:'同一位客户可以按比例分给多个渠道。这是连续线性规划，12 位客户共享客群配额和预算。调整一位客户，再看其他客户要怎样配合。'},
 P0057:{scripts:['replay-field-P0057.js'],api:'ORTOPIA_FIELD_P0057',link:'进入燃料电站',name:'燃料电站',description:'改变机组出力，看看这期烧掉的燃料还能不能留给下个高价时段。'},
 P0062:{scripts:['replay-field-P0062.js'],api:'ORTOPIA_FIELD_P0062',first:2,link:'操纵抽水蓄能机组',name:'抽水蓄能电站',description:'选择抽水、发电或静置，观察水往哪边走。'},
 P0213:{scripts:['replay-gas-world.js','replay-field-P0213.js'],api:'ORTOPIA_FIELD_P0213',link:'调节天然气供送',name:'天然气输配现场',description:'上下拖动入口压力表或末站流量计，让气量够用、沿线压力合规。'},
 P0214:{scripts:['replay-field-common.js','replay-field-P0214.js'],api:'ORTOPIA_FIELD_P0214',link:'安排检修',name:'设备检修现场',description:'选择设备和检修时段，观察哪些设备停转、哪些仍在生产。'},
 P0310:{scripts:['replay-field-common.js','replay-field-P0310.js'],api:'ORTOPIA_FIELD_P0310',link:'调配救灾物资',name:'救灾物资配送现场',description:'从仓库调拨物资，跟着车看收货点的余缺怎样变化。'}
};
const labScripts=new Map();
function loadLab(id){
 const lab=labs[id];if(!lab)return;
 if(!promises.has(id)){
  const script=src=>{
   if(labScripts.has(src))return labScripts.get(src);
   const promise=new Promise((resolve,reject)=>{
   const el=document.createElement('script');el.src=src;el.onload=resolve;
   el.onerror=()=>{el.remove();labScripts.delete(src);reject(Error(src));};document.head.append(el);
   });labScripts.set(src,promise);return promise;
  };
  const request=lab.scripts.reduce((ready,src)=>ready.then(()=>script(src)),Promise.resolve()).catch(error=>{promises.delete(id);throw error;});
  promises.set(id,request);
 }
 return promises.get(id);
}
let logic=[], selectedOption=0;
let data=null,current=0,timer=0,mode='',rate=1,renderToken=0;
const byId=new Map(),groups=new Map();
// A single clock drives step navigation, SVG, CSS and canvas actors. Time is in presentation seconds.
const stepSeconds=6;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let elapsed=0, playing=false,continuous=false,finished=false,lastTick=0,svgRoots=[],cssTracks=[];
function applyTime(){
 const stage=q('stage');if(!stage)return;
 stage.sceneTime=elapsed;
 for(const svg of svgRoots)svg.setCurrentTime(elapsed);
 for(const track of cssTracks)track.currentTime=elapsed*1000;
 stage.sceneFrame?.(elapsed);
 const meter=q('motion-progress');if(meter)meter.style.transform='scaleX('+Math.min(1,elapsed/stepSeconds)+')';
}
function transportStatus(){
 const stage=q('stage'),button=q('play');if(stage)stage.dataset.playing=String(playing);
 if(button){button.textContent=playing?'Ⅱ 暂停':'▶ 连播';button.setAttribute('aria-label',playing?'暂停场景':'连续播放各步');}
}
function stop(){
 playing=false;continuous=false;if(timer)cancelAnimationFrame(timer);timer=0;lastTick=0;
 transportStatus();
}
function bindSceneClock(){
 const stage=q('stage');
 svgRoots=[...stage.querySelectorAll('svg')].filter(svg=>!svg.ownerSVGElement && typeof svg.pauseAnimations==='function');
 svgRoots.forEach(svg=>svg.pauseAnimations());
 cssTracks=stage.getAnimations({subtree:true}).filter(track=>typeof CSSAnimation!=='undefined' && track instanceof CSSAnimation);
 cssTracks.forEach(track=>track.pause());
 applyTime();transportStatus();
}
function tick(stamp){
 if(!playing)return;
 const delta=lastTick?Math.max(0,stamp-lastTick)/1000:0;lastTick=stamp;
 elapsed=Math.min(stepSeconds,elapsed+delta*rate);applyTime();
 if(elapsed>=stepSeconds){
   const next=nextInPlayback();
   if(continuous&&next!==null){go(next);lastTick=stamp;}
   else{finished=next===null;stop();return;}
 }
 timer=requestAnimationFrame(tick);
}
function run(advance){
 stop();continuous=advance;playing=true;lastTick=0;transportStatus();timer=requestAnimationFrame(tick);
}
function previewStep(index){
 stop();go(index);replayAction();
}
function replayAction(){
 elapsed=0;finished=false;applyTime();
 if(!reduced.matches&&!document.hidden)run(false);else{stop();elapsed=stepSeconds;applyTime();}
}
function nextInPlayback(){
 const next=q('stage')?.nextSceneStep;
 if(next)return next();
 return current<data.steps.length-1?current+1:null;
}
function loadDataset(id,folder,registry){
 const key=folder+'/'+id;
 if(window[registry]?.[id])return Promise.resolve(window[registry][id]);
 if(!promises.has(key)){
  const request=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.fetchPriority='high';script.src='data/'+key+'.js';
   script.onload=()=>window[registry]?.[id]?resolve(window[registry][id]):reject(Error(key));
   script.onerror=()=>{script.remove();reject(Error(key));};document.head.append(script);
  }).catch(err=>{promises.delete(key);throw err;});
  promises.set(key,request);
 }
 return promises.get(key);
}
const rootLink='<a href="replay.html">实例仿真</a>';
const sceneGroups=new Map();
for(const id of ids){
 const p=cases.get(id);
 if(!p)continue;
 if(!sceneGroups.has(p.sceneId))sceneGroups.set(p.sceneId,{name:p.sceneName,domainId:p.domainId,items:[]});
 sceneGroups.get(p.sceneId).items.push(p);
}
function categoryLink(p){
 return '<a href="index.html#scene/'+encodeURIComponent(p.sceneId)+'">'+esc(p.sceneName)+'</a>';
}
function simulationList(key,items){
 const topics=new Map((sceneTopics[key]??[]).map(({label})=>[label,[]]));
 for(const p of items){
  if(!topics.has(p.topicLabel))topics.set(p.topicLabel,[]);
  topics.get(p.topicLabel).push(p);
 }
 const problems=[...topics.values()].flat();
 const links=problems.map(p=>`<li><a href="replay.html#${p.id}">
   <small>${p.id}</small>
   <span class="sim-info"><span class="sim-name">${esc(p.title)}</span><span class="sim-topic">${esc(p.topicLabel)}</span></span>
   <i aria-hidden="true">→</i>
  </a></li>`).join('');
 return `<ul class="sim-list">${links}</ul>`;
}
function directory(key){
 const group=sceneGroups.get(key);
 document.title=(group?group.name+' · ':'')+'实例仿真 · ORtopia';
 if(!group){
  const groups=[...sceneGroups].sort((a,b)=>a[1].domainId.localeCompare(b[1].domainId));
  const links=groups.map(([id,scene])=>{
   const count=scene.items.length;
   return `<a href="#scene/${encodeURIComponent(id)}">
     <strong>${esc(scene.name)}</strong>
     <span class="scene-count">${count} 个实例</span>
     <i class="scene-chevron" aria-hidden="true"></i>
    </a>`;
  }).join('');
  directoryHeading.innerHTML=`<h1>实例仿真</h1><p>${groups.length} 类业务场景 · ${ids.length} 个仿真实例</p>`;
  host.innerHTML=`<div class="replay-page sim-directory scene-index">
    <nav class="scene-groups" aria-label="按场景选择实例">${links}</nav>
   </div>`;
  return;
 }
 host.innerHTML='<div class="wrap replay-page sim-directory topic-directory"><div class="replay-breadcrumb"><a href="index.html">实例仿真</a> / '+esc(group.name)+'</div><header class="replay-heading"><h1>'+esc(group.name)+'</h1><p>'+group.items.length+' 个实例</p></header>'+simulationList(key,group.items)+'</div>';
}
async function openPage(){
 directoryHeading.replaceChildren();
 const token=++renderToken;window.ORTOPIA_FIELD_PLAYER.close();stop();leaveTheater();data=null;elapsed=0;finished=false;svgRoots=[];cssTracks=[];
 let route=location.hash.slice(1);
 if(['lab20','world20','remaining'].includes(route)){window.ORTOPIA_LAB_PLAYER.list(host,cases,route);return;}
 if(route.startsWith('scene/')){
  const key=route.slice(6);
  if(!sceneGroups.has(key))history.replaceState(null,'',location.pathname+location.search);
  directory(key);window.scrollTo(0,0);return;
 }
 if(route.startsWith('/problem/'))route=route.slice(9);
 else if(route.startsWith('/')||route==='content')route='';
 if(!route){directory();return;}
 // An optional one-based step lets a shared scene open directly at its action.
 const match=/^(P\d{4})(?:\/([1-9]\d*))?$/.exec(route);
 const id=match?.[1];
 if(!id||!ids.includes(id)){host.innerHTML='<div class="wrap load">此题暂未提供实例仿真。 '+rootLink+'</div>';return;}
 host.innerHTML='<div class="wrap load">正在读取 '+id+' 的实例解…</div>';
 const problem=cases.get(id);
 try{
  if(window.ORTOPIA_FIELD_PLAYER.supports(id)){
   const pack=await loadDataset(id,'field-scenes','ORTOPIA_FIELD_CASES');
   if(token!==renderToken)return;
   window.ORTOPIA_FIELD_PLAYER.mount(host,problem,pack,Number(match[2]||1));
   showDetailTopic(problem);
   return;
  }
  const [r,rows]=await Promise.all([loadDataset(id,'replays','ORTOPIA_REPLAYS'),loadDataset(id,'replay-logic','ORTOPIA_REPLAY_LOGIC'),loadLab(id)]);if(token!==renderToken)return;
  if(rows.length!==r.steps.length)throw Error('Replay decision count mismatch');
  logic=rows;selectedOption=0;
  data=r;current=Math.min(Number(match[2]||labs[id]?.first||1),r.steps.length)-1;byId.clear();groups.clear();
  for(const a of r.entities){byId.set(String(a.id),a);if(!groups.has(a.group))groups.set(a.group,groups.size);}
  mode=(labs[id]||sceneRenderer(id))?'simulation':r.schedule?.events?.length?'schedule':r.layout==='map'?'map':r.trend?.points?.length?'trend':'lanes';
  shell(problem);showDetailTopic(problem);paint();window.scrollTo(0,0);if(!reduced.matches&&!document.hidden)run(Boolean(labs[id]&&id!=='P0045'&&!match[2]));
 }catch(e){if(token===renderToken)host.innerHTML='<div class="wrap load">实例解未能载入。 '+rootLink+'</div>';}
}
function showDetailTopic(problem){
 if(!problem.topicLabel)return;
 const tag=document.createElement('span');
 tag.className='sim-topic';
 tag.textContent=problem.topicLabel;
 const heading=host.querySelector('h1');
 const titleBlock=document.createElement('div');
 heading.replaceWith(titleBlock);
 titleBlock.append(heading,tag);
}
function sceneRenderer(id){
 if(id==='P0020' && window.ORTOPIA_FACTORY)return window.ORTOPIA_FACTORY;
 return [window.ORTOPIA_CARE,window.ORTOPIA_TRANSPORT,window.ORTOPIA_INDUSTRY,window.ORTOPIA_STUDIO,window.ORTOPIA_SYSTEMS].find(v=>v?.supports(id));
}
function shell(p){
 const r=data;document.title=p.id+' · 实例仿真 · ORtopia';
 const source='assets/replays/'+p.id+'/';
 const modes=[[r.layout==='map'?'map':'lanes',r.layout==='map'?'位置与路径':'现场对象']];
 if(labs[p.id]||sceneRenderer(p.id))modes.unshift(['simulation',labs[p.id]?'交互试排':'实例现场']);
 if(r.schedule?.events?.length)modes.push(['schedule','资源排程']);
 if(r.trend?.points?.length)modes.push(['trend',r.trend.label||'指标变化']);
 host.innerHTML='<div class="wrap replay-page world-page'+(labs[p.id]?' has-planning-lab':'')+'"><div class="replay-breadcrumb">'+rootLink+' / '+categoryLink(p)+'</div>'+
 '<div class="replay-heading"><div class="replay-meta">'+p.id+' · '+esc(p.sceneName)+' · '+esc(r.instance)+'</div><h1>'+esc(decisionUI.questions[p.id]||r.title||p.title)+'</h1><p>'+esc(labs[p.id]?.description||r.description)+'</p></div>'+
 '<div class="replay-layout"><section class="replay-console"><div class="board-head"><strong id="live-title">实例现场</strong><div class="mode-switch">'+modes.map(([k,v])=>'<button data-mode="'+k+'" aria-pressed="'+(k===mode)+'">'+esc(v)+'</button>').join('')+'</div></div>'+
 '<div id="world-viewport" tabindex="0" aria-label="仿真现场，可在近看时滚动"><div id="stage"></div></div><div class="motion-meter" aria-hidden="true"><i id="motion-progress"></i></div><div class="play-controls"><div class="play-row"><button id="prev" aria-label="上一步">←</button><button id="play">▶ 播放</button><button id="next" aria-label="下一步">→</button><button id="repeat-step" title="从头回放当前一步">重播本步</button><label class="speed"><select id="rate" aria-label="播放速度"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><button type="button" id="closer" aria-pressed="false">近看</button><button type="button" id="theater" aria-pressed="false">放大现场</button><span id="step-count"></span></div><input id="scrub" aria-label="仿真步数" type="range" min="1" max="'+r.steps.length+'" value="1"></div></section>'+
 '<aside class="replay-detail">'+(labs[p.id]?'<h2 class="reference-heading">原解逐步对照</h2>':'')+'<div class="decision-card" id="step-info" aria-live="polite"></div><details class="world-source"><summary>查看本步数据与场景说明</summary><div id="step-record"></div><p id="layout-note"></p></details></aside></div>'+
 '<section class="replay-bottom"><div><strong>已校验解的目标值</strong><p>'+esc(r.objective.label)+'　<b title="'+esc(r.objective.value)+'">'+fmt(r.objective.value,r.objective.unit)+'</b></p></div><div class="source-links"><a download href="'+source+'instance.json">实例数据 ↓</a><a download href="'+source+'solution.json">求解结果 ↓</a><a download href="'+source+'verification.json">校验记录 ↓</a></div></section>'+
 '<details class="step-index"><summary>全部 '+r.steps.length+' 步</summary><div>'+r.steps.map((s,i)=>'<button data-jump="'+i+'"><small>'+String(i+1).padStart(2,'0')+'</small> '+esc(s.title)+'</button>').join('')+'</div></details></div>';
 if(labs[p.id]&&p.id!=='P0045'){
  const aside=host.querySelector('.replay-detail'),details=document.createElement('details');
  const summary=document.createElement('summary');summary.textContent='查看原解与逐步比较';
  aside.querySelector('.reference-heading')?.remove();
  details.className='original-plan';details.append(summary,...aside.childNodes);aside.append(details);
 }
 if(p.id==='P0182'){
  const experiment=document.createElement('section');experiment.className='route-experiment';
  q('step-info').closest('.replay-layout').after(experiment);
  const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='lab-shortcut';shortcut.textContent='自己试排两辆车的路线 ↓';shortcut.onclick=()=>{stop();experiment.scrollIntoView({block:'start'});experiment.querySelector('button,select')?.focus({preventScroll:true});};
  q('step-info').after(shortcut);
  window.ORTOPIA_ROUTE_LAB.mount(experiment,stop);
 }
 q('rate').value=String(rate);
}
function info(){
 const st=data.steps[current], count=data.steps.length;
 q('live-title').textContent=(mode==='simulation' && labs[data.id])?labs[data.id].name:st.title;
 q('step-count').textContent=(current+1)+' / '+count;q('prev').disabled=current===0;q('next').disabled=current===count-1;
 q('scrub').value=current+1;
 decisionUI.panel(q('step-info'),logic,current,st,selectedOption);
 q('step-record').innerHTML='<p>'+esc(st.detail)+'</p><dl>'+st.metrics.map(m=>'<div><dt>'+esc(m.label)+'</dt><dd>'+fmt(m.value,m.unit)+'</dd></div>').join('')+'</dl>';
 host.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-current',String(+b.dataset.jump===current)));
}
function label(id){return byId.get(String(id))?.label||String(id);}
function changeMap(st){return new Map((st.changes||[]).map(c=>[String(c.id),num(c.value)+(c.unit?' '+c.unit:'')]));}
function movement(st){
 const changes=changeMap(st),active=new Set([...st.active.map(String),...changes.keys(),...st.links.flat().map(String)]);
 const stage=q('stage'),isMap=mode==='map';stage.innerHTML='';
 const field=document.createElement('div');field.className='field '+(isMap?'map-field':'lane-field');stage.append(field);
 const shown=new Map();
 function chip(a,container){
  const id=String(a.id),i=groups.get(a.group)%tones.length,n=document.createElement('div');
  n.className='actor'+(active.has(id)?' active':'');n.style.setProperty('--actor',tones[i]);n.style.setProperty('--tint',tint[i]);
  n.innerHTML='<span class="actor-dot"></span><span>'+esc(a.label)+'</span>'+(changes.has(id)?'<b>'+esc(changes.get(id))+'</b>':'');
  n.title=a.label+' · '+a.group+(changes.has(id)?' · '+changes.get(id):'');container.append(n);shown.set(id,n);return n;
 }
 if(isMap){
  const placed=[];
  for(const a of data.entities){
   if(!Number.isFinite(a.x)||!Number.isFinite(a.y))continue;
   const n=chip(a,field);n.classList.add('map-actor');
   n.style.left=(8+84*a.x)+'%';n.style.top=(10+79*a.y)+'%';
   // Offset only the label when two locations have nearly identical plotted coordinates.
   const close=placed.filter(k=>Math.abs(k.x-a.x)<.1&&Math.abs(k.y-a.y)<.045).length;
   n.style.setProperty('--offset',(close%2===0?-22:6+Math.floor(close/2)*15)+'px');placed.push(a);
  }
  const rest=data.entities.filter(a=>!shown.has(String(a.id)));
  if(rest.length){const rack=document.createElement('div');rack.className='unmapped';stage.append(rack);rest.forEach(a=>chip(a,rack));}
 }else{
  for(const group of groups.keys()){
   const lane=document.createElement('div');lane.className='lane';lane.innerHTML='<div class="lane-title">'+esc(group)+'</div><div class="lane-items"></div>';
   field.append(lane);data.entities.filter(a=>a.group===group).forEach(a=>chip(a,lane.lastChild));
  }
 }
 drawLines(field,shown,st,isMap);
}
function drawLines(field,shown,st,isMap){
 const box=field.getBoundingClientRect();if(!box.width||!box.height)return;
 const point=id=>{
  const n=shown.get(String(id));if(!n||!field.contains(n))return null;
  const r=(isMap?n.querySelector('.actor-dot'):n).getBoundingClientRect();
  return {x:r.x+r.width/2-box.x,y:r.y+r.height/2-box.y};
 };
 const lines=[],used=new Set();
 for(const [a,b] of st.links.concat((st.moves||[]).map(m=>[m.from,m.to]))){
  const u=point(a),v=point(b),key=JSON.stringify([a,b]);
  if(!u||!v||used.has(key))continue;used.add(key);
  const dx=v.x-u.x,dy=v.y-u.y;
  const d=Math.abs(dx)+Math.abs(dy)<1?'M'+u.x+' '+u.y+' c-35 -42 35 -42 1 0':
    'M'+u.x+' '+u.y+' Q'+((u.x+v.x)/2+(isMap?0:Math.min(35,Math.abs(dy)*.2)))+' '+((u.y+v.y)/2+(isMap?0:Math.abs(dy)<10?-28:0))+' '+v.x+' '+v.y;
  lines.push('<path d="'+d+'" fill="none" stroke="#167563" stroke-width="2.7" stroke-linecap="round"/>');
  if((st.moves||[]).some(m=>String(m.from)===String(a)&&String(m.to)===String(b))&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
    lines.push('<circle r="6" fill="#d97838" stroke="white" stroke-width="2"><animateMotion path="'+d+'" dur="1.6s" fill="freeze"/></circle>');
 }
 if(lines.length)field.insertAdjacentHTML('afterbegin','<svg class="flow-overlay" width="100%" height="100%" aria-hidden="true">'+lines.join('')+'</svg>');
 if(st.links.length||st.moves?.length){
 const text=document.createElement('div');text.className='flow-list';
 const links=st.moves?.length?st.moves.map(m=>[m.from,m.to,m.label]):st.links;
 for(const [a,b,l] of links){const item=document.createElement('span');item.textContent=label(a)+' → '+label(b)+(l?' · '+l:'');text.append(item);}
 q('stage').append(text);
 }
}
function scheduleChart(){
 const clock=data.steps[current].clock;
 const sc=data.schedule,ev=sc.events,rows=[...new Set(ev.map(e=>e.resource))];
 const lo=Math.min(...ev.map(e=>e.start)),hi=Math.max(...ev.map(e=>e.end)),span=hi-lo||1;
 let html='<div class="gantt"><div class="g-axis"><strong>'+esc(sc.unit||'时间')+'</strong><div><span>'+num(lo)+'</span><span>'+num((lo+hi)/2)+'</span><span>'+num(hi)+'</span></div></div>';
 for(const r of rows){
  const events=ev.filter(e=>e.resource===r).sort((a,b)=>a.start-b.start||a.end-b.end);
  const ends=[];const bars=events.map(e=>{
   let line=ends.findIndex(x=>x<=e.start);if(line<0)line=ends.length;ends[line]=e.end;
   const text=e.label+' · '+e.start+'–'+e.end+' '+(sc.unit||'');
   return '<div class="g-event '+(Number.isFinite(clock)?(e.start<=clock&&clock<e.end?'now':e.end<=clock?'past':'future'):(e.step===current+1?'now':e.step<current+1?'past':'future'))+'" title="'+esc(text)+'" style="top:'+(5+line*29)+'px;left:'+((e.start-lo)/span*100)+'%;width:'+((e.end-e.start)/span*100)+'%">'+esc(e.label)+'</div>';
  });
  html+='<div class="g-row"><strong>'+esc(r)+'</strong><div class="g-track" style="min-height:'+(10+ends.length*29)+'px">'+bars.join('')+'</div></div>';
 }
 q('stage').innerHTML=html+'</div>';
}
function trendChart(){
 const tr=data.trend,pts=tr.points,W=780,H=300,pad=58,lo=Math.min(0,...pts.map(p=>p.value)),hi=Math.max(...pts.map(p=>p.value),lo+1);
 const point=(p,i)=>[pad+i*(W-pad*2)/Math.max(1,pts.length-1),H-44-(p.value-lo)*(H-85)/(hi-lo)];
 let h='<svg class="trend-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(tr.label)+'">';
 for(let i=0;i<=4;i++){const y=H-44-i*(H-85)/4;h+='<path d="M'+pad+' '+y+'h'+(W-2*pad)+'" stroke="#d6e3dc"/><text x="'+(pad-9)+'" y="'+(y+4)+'" text-anchor="end">'+num(Math.round((lo+(hi-lo)*i/4)*100)/100)+'</text>';}
 const visible=pts.map((p,i)=>({p,xy:point(p,i)})).filter(v=>v.p.step<=current+1);
 h+='<polyline points="'+visible.map(v=>v.xy.join(',')).join(' ')+'" fill="none" stroke="#167664" stroke-width="3"/>';
 pts.forEach((p,i)=>{const [x,y]=point(p,i);if(p.step<=current+1)h+='<circle cx="'+x+'" cy="'+y+'" r="'+(p.step===current+1?6:3)+'" fill="'+(p.step===current+1?'#c07536':'#167664')+'"><title>'+esc(p.time)+' · '+fmt(p.value,tr.unit)+'</title></circle>';if(i===0||i===pts.length-1||pts.length<=10)h+='<text x="'+x+'" y="'+(H-14)+'" text-anchor="middle">'+esc(p.time)+'</text>';});
 q('stage').innerHTML=h+'</svg>';
}
function paint(){
 if(!data)return;info();const note=q('layout-note');
 note.textContent=mode==='schedule'?'按实际起止时间排列 · 深绿色为本步，浅色为后续安排':mode==='trend'?data.trend.label+'（'+(data.trend.unit||'实例单位')+'）':data.layoutNote||'';
 if(mode==='simulation'&&data.id==='P0452')note.textContent='基地与居住区位置为示意，访问安排和行程时长取自本实例解。';
 q('stage').sceneFrame=null;q('stage').previewDecision=null;q('stage').nextSceneStep=null;q('stage').sceneTime=elapsed;q('stage').dataset.playing=String(playing);q('stage').dataset.mode=mode;
 const stage=q('stage');
 if(mode==='simulation' && labs[data.id]){
  const lab=window[labs[data.id].api];
  lab.mount(stage,()=>{stop();if(selectedOption){selectedOption=0;info();}},current,previewStep,replayAction,
    index=>{stop();go(index);if(!reduced.matches&&!document.hidden)run(true);else{elapsed=stepSeconds;applyTime();}});
 }else if(mode==='simulation')sceneRenderer(data.id).render(stage,data,current);
 else if(mode==='schedule')scheduleChart();else if(mode==='trend')trendChart();else movement(data.steps[current]);
 bindSceneClock();if(selectedOption)q('stage').previewDecision?.(selectedOption);
 host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
}
function go(n){current=Math.max(0,Math.min(data.steps.length-1,n));elapsed=0;finished=false;selectedOption=0;paint();}
function start(){
 if(selectedOption){selectedOption=0;q('stage').previewDecision?.(0);info();}
 if(finished || (nextInPlayback()===null&&elapsed>=stepSeconds))go(0);
 else if(elapsed>=stepSeconds)go(nextInPlayback());
 run(true);
}
function leaveTheater(){
 document.body.classList.remove('world-theater');
 if(q('theater')){q('theater').textContent='放大现场';q('theater').setAttribute('aria-pressed','false');}
}
function toggleTheater(){
 if(document.body.classList.contains('world-theater'))leaveTheater();
 else{document.body.classList.add('world-theater');q('theater').textContent='收起现场';q('theater').setAttribute('aria-pressed','true');}
 window.dispatchEvent(new Event('resize'));
}
host.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(!data)return;
 if(b.hasAttribute('data-option')){
  stop();selectedOption=Number(b.dataset.option);q('stage').previewDecision?.(selectedOption);decisionUI.panel(q('step-info'),logic,current,data.steps[current],selectedOption);
  q('step-info').querySelector('[data-option="'+selectedOption+'"]')?.focus({preventScroll:true});return;
 }
 if(b.hasAttribute('data-compare-step')){previewStep(Number(b.dataset.compareStep));return;}
 if(b.dataset.mode){mode=b.dataset.mode;paint();return;}
 if(b.id==='play'){if(playing)stop();else start();return;}
 if(b.id==='repeat-step'){previewStep(current);return;}
 if(b.id==='theater'){toggleTheater();return;}
 if(b.id==='closer'){
   const v=q('world-viewport'),on=v.classList.toggle('closer');
   b.setAttribute('aria-pressed',String(on));b.textContent=on?'还原':'近看';
   v.scrollLeft=on?(v.scrollWidth-v.clientWidth)*.5:0;v.scrollTop=on?(v.scrollHeight-v.clientHeight)*.5:0;
   if(['lanes','map'].includes(mode))paint();
   return;
 }
 if(b.id==='prev'||b.id==='next'||b.hasAttribute('data-jump')){previewStep(b.id==='prev'?current-1:b.id==='next'?current+1:+b.dataset.jump);}
});
host.addEventListener('input',e=>{if(e.target.id==='scrub')previewStep(+e.target.value-1);});
host.addEventListener('change',e=>{if(e.target.id==='rate'){rate=+e.target.value;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')leaveTheater();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('hashchange',openPage);
let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(data&&['lanes','map'].includes(mode))paint();},150)});
openPage();
})();
