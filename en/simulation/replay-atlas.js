(() => {
'use strict';
window.ORTOPIA_FIELD_CASES={};
const classic=new Set(["P0001", "P0012", "P0013", "P0020", "P0025", "P0045", "P0057", "P0058", "P0062", "P0068", "P0075", "P0094", "P0122", "P0145", "P0154", "P0160", "P0177", "P0182", "P0198", "P0204", "P0213", "P0214", "P0310", "P0449", "P0452"]);
const fmt=n=>typeof n==='number'?n.toLocaleString('en',{maximumFractionDigits:5}):String(n);
let clear=()=>{};
function mount(host,p,pack,step){
 if(pack.lab && window.ORTOPIA_LABS[p.id]){clear=window.ORTOPIA_LAB_PLAYER.mount(host,p,pack,step);return;}
 if(pack.road){clear=window.ORTOPIA_ROAD_WORLD.mount(host,p,pack,step);return;}
 if(p.id==="P0039"){clear=window.ORTOPIA_DRONE_RETAIL.mount(host,p,pack,step);return;}
 const ctl=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:ctl.signal});
 const travel=['clock','route','coverage'].includes(pack.kind),data=pack.events;
 const low=travel?Math.min(...data.map(r=>r[3])):0,high=travel?Math.max(...data.map(r=>r[4])):data.length;
 const span=high-low,points=[...new Set(travel?data.flatMap(r=>r.slice(3,5)):[...data.keys(),data.length])].sort((a,b)=>a-b);
 let t=points[Math.min(points.length-1,Math.max(0,(step||1)-1))],playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,rate=1,omit='',share=null,raf=0,last=0,cache=-1;
 const pick=s=>host.querySelector(s);
 host.innerHTML='<article class="wrap atlas medium-world"><div class="replay-breadcrumb"><a href="replay.html">Simulations</a> / <a class="problem-ref"></a></div><header class="atlas-title"><div><small class="meta"></small><h1></h1></div></header><div class="m-facts"></div><section class="atlas-stage"><div class="atlas-stage-head"><div><small class="type"></small><h2></h2></div><output class="m-clock"></output></div><div class="atlas-window"><canvas aria-label="Animated simulation"></canvas></div><div class="m-status" aria-live="off"></div><div class="atlas-control"><button class="play"></button><button class="prev" aria-label="Previous event">←</button><input class="scrub" type="range" min="0" max="1000" aria-label="Simulation progress"><button class="next" aria-label="Next event">→</button><select class="rate" aria-label="Playback speed"><option>0.5×</option><option selected>1×</option><option>2×</option><option>4×</option></select><button class="restart">Restart</button></div></section><div class="m-deck"><section><h3>Event log</h3><ol class="m-log"></ol></section><section><h3 class="trial-title"></h3><div class="m-input"></div><p class="m-explain"></p></section></div><details class="atlas-proof"><summary>Instance and data sources</summary><p class="info"></p><code class="binding"></code></details></article>';
 const canvas=pick('canvas'),log=pick('.m-log'),play=pick('.play'),scrub=pick('.scrub'),box=pick('.m-input');
 pick('.problem-ref').href='index.html#scene/'+encodeURIComponent(p.sceneId);pick('.problem-ref').textContent=p.sceneName;pick('h1').textContent=p.title;pick('h2').textContent=pack.title;
 pick('.meta').textContent=p.sceneName+' · '+p.id;pick('.m-facts').textContent='medium / I001 ·'+fmt(pack.variables)+' decision variables ·'+(pack.lower?'at least ':'')+fmt(pack.constraints)+' constraints';
 pick('.type').textContent=({clock:'Instance clock',route:'Route sequence',coverage:'Coverage deployment',series:'Recorded sequence',allocation:'Order allocation',build:'Plan implementation'})[pack.kind];
 pick('.info').textContent=pack.field+'·'+(travel?'This view shows '+data.length+' route events':'Showing '+data.length+' / '+fmt(pack.total)+' records')+'. '+(travel?(pack.kind==='clock'?'Times are taken from the recorded solution. The map is schematic.':'Selected connections are shown in sequence.'):'The sequence and playback speed are for illustration.');
 pick('.binding').textContent='Git blob · instance '+pack.instance+' · solution '+pack.solution+(pack.objective?' · Recorded objective '+pack.objective:'');
 const alternate=pack.kind==='allocation';
 if(alternate){
  pick('.trial-title').textContent='Allocate orders';box.innerHTML='<label>Crowdsourced share <input type="range" min="0" max="100" step="1"><output></output></label>';
  const slider=box.querySelector('input');slider.value=data[0][1]*100;
  function split(){share=Number(slider.value)/100;box.querySelector('output').textContent=slider.value+'%';draw();}
  on(slider,'input',split);box.querySelector('output').textContent=slider.value+'%';
  pick('.m-explain').textContent='Allocate 50 equal orders using the current share. The recorded share is '+fmt(data[0][1]*100)+'%. ';
 }else{
  pick('.trial-title').textContent=travel?'Pause a unit':'Defer an assignment';
  const select=document.createElement('select');select.setAttribute('aria-label','Select an item');select.add(new Option('Complete solution',''));
  for(const name of new Set(data.map(v=>v[0])))select.add(new Option(name,name));
  box.append(select);on(select,'change',()=>{omit=select.value;cache=-1;draw();});
  pick('.m-explain').textContent=travel?'Select a unit to remove it from the simulation. Use the timeline to see which destinations the remaining units reach.':'Defer one assignment to see the resulting gap. Other assignments keep their recorded values.';
  if(pack.kind==='series'){pick('.trial-title').textContent='Inspect observations';select.options[0].textContent='Follow playback';select.onchange=()=>{if(select.value){playing=false;t=data.findIndex(r=>r[0]===select.value);omit='';}draw();};pick('.m-explain').textContent='Choose an observation to jump to its frame.';}
 }
 function draw(){
  const result=window.ORTOPIA_LANDSCAPE.frame(canvas,p,pack,0,t,null,{omit,share});if(!result)return;
  pick('.m-status').textContent=result.text;pick('.m-clock').textContent=(pack.kind==='clock'?'t = ':'Progress ')+(pack.kind==='clock'?fmt(t):Math.round(100*(t-low)/span)+'%');
  play.textContent=playing?'Pause':'Play';scrub.value=(t-low)/span*1000;
  let i=0;while(i+1<points.length&&points[i+1]<=t)i++;
  if(i!==cache){cache=i;log.replaceChildren();const events=travel?data.filter(r=>r[3]<=t&&r[0]!==omit).sort((a,b)=>b[3]-a[3]).slice(0,4):data.slice(Math.max(0,Math.min(data.length-1,Math.floor(t))-3),Math.floor(t)+1).reverse();
   for(const r of events){const li=document.createElement('li');li.textContent=travel?r[0]+''+r[1]+' → '+r[2]+'('+fmt(r[3])+' – '+fmt(r[4])+')':r[0]+''+fmt(r[1])+(r[0]===omit?'Deferred':'');log.append(li);}
  }
 }
 function tick(now){raf=0;if(!playing||document.hidden)return;const dt=Math.min(90,now-(last||now));last=now;t=Math.min(high,t+span*dt*rate/(Math.min(48,Math.max(12,points.length*.65))*1000));if(t>=high)playing=false;draw();if(playing)raf=requestAnimationFrame(tick);}
 function start(){cancelAnimationFrame(raf);last=0;if(playing&&!document.hidden)raf=requestAnimationFrame(tick);draw();}
 function seek(x){playing=false;t=Math.max(low,Math.min(high,x));start();}
 on(play,'click',()=>{if(t===high)t=low;playing=!playing;start();});on(pick('.restart'),'click',()=>{t=low;playing=true;start();});
 on(scrub,'input',()=>seek(low+span*scrub.value/1000));on(pick('.rate'),'change',e=>{rate=parseFloat(e.target.value);});
 on(pick('.prev'),'click',()=>seek(points.filter(x=>x<t-1e-7).at(-1)??low));on(pick('.next'),'click',()=>seek(points.find(x=>x>t+1e-7)??high));
 function resize(){const b=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(b.width*d));canvas.height=Math.max(1,Math.round(b.height*d));draw();}
 const ro=new ResizeObserver(resize);ro.observe(canvas);on(document,'visibilitychange',start);
 clear=()=>{ctl.abort();ro.disconnect();cancelAnimationFrame(raf);};document.title=p.title+' · ORtopia';resize();start();scrollTo(0,0);
}
window.ORTOPIA_FIELD_PLAYER={supports:id=>!classic.has(id),mount,close(){clear();clear=()=>{};}};
})();
