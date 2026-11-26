(() => {
'use strict';
const labs=window.ORTOPIA_LABS=Object.create(null);
function el(name,cls,txt){const node=document.createElement(name);if(cls)node.className=cls;if(txt!=null)node.textContent=txt;return node;}
function link(url,txt){const node=el('a','',txt);node.href=url;return node;}
const collectionTitle=batch=>batch==='remaining'?'Extended simulation collection':batch==='world20'?'Continuous simulations':'Original simulation collection';
function list(host,cases,batch='lab20'){
 const main=el('article','wrap replay-page sim-directory batch-index');
 const nav=el('div','replay-breadcrumb');nav.append(link('index.html','Simulations'));main.append(nav);
 const entriesForBatch=Object.entries(labs).filter(([,lab])=>(lab.batch||'lab20')===batch);
 const title=collectionTitle(batch);
 const head=el('header','replay-heading');head.append(el('h1','',title),el('p','',entriesForBatch.length+' medium-scale instances by domain'));main.append(head);
 const byScene=new Map();
 for(const [id,lab] of entriesForBatch){
  const p=cases.get(id);if(!p)continue;
  if(!byScene.has(p.sceneName))byScene.set(p.sceneName,[]);
  byScene.get(p.sceneName).push([p,lab]);
 }
 for(const [name,entries] of byScene){
  const section=el('section'),items=el('ul','sim-list');section.append(el('h2','',name),items);
  entries.sort(([a],[b])=>a.id.localeCompare(b.id));
  for(const [p,lab] of entries){const li=el('li'),a=link('replay.html#'+p.id,'');a.append(el('small','',p.id),el('span','',lab.title));li.append(a);items.append(li);}
  main.append(section);
 }
 host.replaceChildren(main);document.title=title+' · ORtopia';scrollTo(0,0);
}
function mount(host,p,pack,step){
 const lab=labs[p.id],data=pack.lab,ctl=new AbortController();
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:ctl.signal});
 host.innerHTML=`<article class="wrap atlas medium-world batch-world"><div class="replay-breadcrumb"></div>
 <header class="atlas-title"><div><small class="lab-meta"></small><h1></h1></div></header>
 <section class="atlas-stage"><div class="atlas-stage-head"><h2></h2><output class="lab-clock"></output><button class="lab-expand">Expand view</button></div>
 <div class="atlas-window"><canvas class="lab-canvas"></canvas></div>
 <div class="lab-decisions"><p></p><div class="lab-choices" aria-label="Choose a plan"></div></div>
 <div class="atlas-control"><button class="lab-play"></button><input class="lab-scrub" type="range" min="0" max="1000" aria-label="Simulation progress"><select class="lab-speed" aria-label="Playback speed"><option>0.5×</option><option selected>1×</option><option>2×</option><option>4×</option></select><button class="lab-reset">Reset to reference plan</button></div></section>
 <dl class="lab-metrics"></dl><details class="atlas-proof"><summary>Instance and experiment scope</summary><p></p><code></code></details></article>`;
 const q=sel=>host.querySelector(sel),stage=q('.atlas-stage'),map=q('.lab-canvas'),btn=q('.lab-play'),scrub=q('.lab-scrub'),group=q('.lab-choices'),dl=q('.lab-metrics');
 const heading=q('.atlas-stage-head'),clock=q('.lab-clock'),article=q('article');
 q('.replay-breadcrumb').append(link('index.html#scene/'+p.sceneId,p.sceneName),' / ',link('replay.html#'+(lab.batch||'lab20'),collectionTitle(lab.batch)));
 q('article').dataset.problem=p.id;q('.lab-meta').textContent=p.id+' · '+pack.sample;q('h1').textContent=p.title;q('h2').textContent=lab.title;
 q('.lab-decisions p').textContent=lab.action;map.setAttribute('aria-label',lab.title);
 q('.atlas-proof p').textContent=lab.scope;
 q('.atlas-proof code').textContent='Instance '+pack.instance+' · Solution '+pack.solution+' · '+pack.variables.toLocaleString()+' decision variables · '+(pack.lower?'at least ':'')+pack.constraints.toLocaleString()+' constraints';
 const baseline=[{at:0,choice:0}];
 let history=baseline.slice(),mode=0,f=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,rate=1,last=0,raf=0;
 let viewIndex=0,chapterSelect,chapterMode;
 if(lab.views){
  article.classList.add('district-world');
  q('h1').textContent=lab.title;
  q('.atlas-proof p').textContent=p.title+'.'+lab.scope;
  heading.querySelector('h2').remove();
  const cameras=el('div','lab-views');cameras.setAttribute('role','group');cameras.setAttribute('aria-label','Camera views');
  for(const [i,label] of lab.views.entries()){
   const button=el('button','',label);button.type='button';button.setAttribute('aria-pressed',String(i===0));
   on(button,'click',()=>{
    viewIndex=i;
    Array.from(cameras.children).forEach((other,j)=>other.setAttribute('aria-pressed',String(j===i)));
    paint();
   });
   cameras.append(button);
  }
  heading.insertBefore(cameras,q('.lab-expand'));
 }
 if(lab.chapters){
  chapterSelect=el('select','lab-chapters');chapterSelect.setAttribute('aria-label','Jump to a simulation event');
  q('.lab-speed').after(chapterSelect);
  on(chapterSelect,'change',()=>{
   if(chapterSelect.value==='')return;
   f=Number(chapterSelect.value);chapterSelect.selectedIndex=0;start();
  });
 }
 function selected(){return lab.live?(history.findLast(v=>v.at<=f+1e-12)?.choice??0):mode;}
 function endTime(){return lab.endAt?lab.endAt(data,selected()):1;}
 const choices=lab.choices.map((name,i)=>{
  const b=el('button','',name);group.append(b);on(b,'click',()=>{
   if(lab.live){
    if(f===1){f=0;history=[];playing=true;}
    history=history.filter(h=>h.at<f);history.push({at:f,choice:i});
   }else mode=i;
   start();
  });return b;
 });
 function paint(){
  const choice=selected(),s=lab.frame(data,choice,f,history),ref=(!choice&&(!lab.live||history.every(h=>!h.choice)))?s:lab.frame(data,0,f,baseline);
  lab.draw(map,s,data,choice,f,viewIndex);
  if(chapterSelect && chapterMode!==choice){
   chapterMode=choice;
   chapterSelect.replaceChildren(new Option('Jump to event',''));
   for(const {label,at} of lab.chapters(data,choice))chapterSelect.add(new Option(label,String(at)));
  }
  const end=endTime(),finished=f>=end;
  clock.textContent=s.clock??('Progress '+Math.round(100*f)+'%');
  scrub.max=Math.ceil(end*1000);scrub.value=finished?scrub.max:Math.round(f*1000);btn.textContent=playing?'Pause':finished?'Replay':'Play';
  choices.forEach((b,i)=>b.setAttribute('aria-pressed',String(choice===i)));
  while(dl.children.length<s.metrics.length){const card=el('div');card.append(el('dt'),el('dd'),el('small'));dl.append(card);}
  for(let j=0;j<dl.children.length;j++){
   const card=dl.children[j],m=s.metrics[j];card.hidden=!m;if(!m)continue;
   const [label,value]=m;const [dt,dd,compare]=card.children;
   if(dt.textContent!==String(label))dt.textContent=label;
   if(dd.textContent!==String(value))dd.textContent=value;
   const reference=ref.metrics.find(v=>v[0]===label)?.[1],text=reference!=null&&String(value)!==String(reference)?'Reference at this time: '+reference:'';
   if(compare.textContent!==text)compare.textContent=text;
  }
 }
 function tick(now){
  if(!playing||document.hidden)return;
  const end=endTime();
  f=Math.min(end,f+Math.min(120,now-(last||now))*rate/(1000*(lab.duration||23)));
  last=now;if(f>=end)playing=false;paint();if(playing)raf=requestAnimationFrame(tick);
 }
 function start(){cancelAnimationFrame(raf);last=0;const end=endTime();if(f>=end){f=end;playing=false;}paint();if(playing&&!document.hidden)raf=requestAnimationFrame(tick);}
 on(btn,'click',()=>{if(f>=endTime())f=0;playing=!playing;start();});
 on(scrub,'input',()=>{f=Number(scrub.value)/1000;playing=false;start();});
 on(q('.lab-reset'),'click',()=>{history=baseline.slice();mode=0;f=0;playing=false;start();});
 on(q('.lab-speed'),'change',e=>rate=parseFloat(e.target.value));
 const dialog=el('dialog','atlas medium-world batch-world lab-dialog'),anchor=document.createComment('simulation stage');stage.before(anchor);host.append(dialog);
 if(lab.views)dialog.classList.add('district-world');
 dialog.setAttribute('aria-label',lab.title);const expand=q('.lab-expand');
 on(expand,'click',()=>{if(dialog.open){dialog.close();return;}dialog.append(stage);dialog.showModal();expand.textContent='Collapse view';});
 on(dialog,'close',()=>{anchor.after(stage);expand.textContent='Expand view';expand.focus();});
 function resize(){const r=map.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);map.width=Math.max(1,Math.round(r.width*d));map.height=Math.max(1,Math.round(r.height*d));paint();}
 const ro=new ResizeObserver(resize);ro.observe(map);on(document,'visibilitychange',start);
 if(step>1 && pack.events.length>1)f=Math.min(1,(step-1)/(pack.events.length-1));
 resize();start();document.title=p.title+' · ORtopia';scrollTo(0,0);
 return ()=>{ctl.abort();ro.disconnect();cancelAnimationFrame(raf);};
}
window.ORTOPIA_LAB_PLAYER={list,mount};
})();
