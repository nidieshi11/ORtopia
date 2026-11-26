(() => {
'use strict';
window.ORTOPIA_FIELD_CASES={};
const classic=new Set(["P0001", "P0012", "P0013", "P0020", "P0025", "P0045", "P0057", "P0058", "P0062", "P0068", "P0075", "P0094", "P0122", "P0145", "P0154", "P0160", "P0177", "P0182", "P0198", "P0204", "P0213", "P0214", "P0310", "P0449", "P0452"]);
const fmt=n=>typeof n==='number'?n.toLocaleString('zh-CN',{maximumFractionDigits:5}):String(n);
let clear=()=>{};
function mount(host,p,pack,step){
 if(p.id==="P0039"){clear=window.ORTOPIA_DRONE_RETAIL.mount(host,p,pack,step);return;}
 const ctl=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:ctl.signal});
 const travel=['clock','route','coverage'].includes(pack.kind),data=pack.events;
 const low=travel?Math.min(...data.map(r=>r[3])):0,high=travel?Math.max(...data.map(r=>r[4])):data.length;
 const span=high-low,points=[...new Set(travel?data.flatMap(r=>r.slice(3,5)):[...data.keys(),data.length])].sort((a,b)=>a-b);
 let t=points[Math.min(points.length-1,Math.max(0,(step||1)-1))],playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,rate=1,omit='',share=null,raf=0,last=0,cache=-1;
 const pick=s=>host.querySelector(s);
 host.innerHTML='<article class="wrap atlas medium-world"><div class="replay-breadcrumb"><a href="replay.html">实例仿真</a> / <a class="problem-ref"></a></div><header class="atlas-title"><div><small class="meta"></small><h1></h1></div></header><div class="m-facts"></div><section class="atlas-stage"><div class="atlas-stage-head"><div><small class="type"></small><h2></h2></div><output class="m-clock"></output></div><div class="atlas-window"><canvas aria-label="动态实例现场"></canvas></div><div class="m-status" aria-live="off"></div><div class="atlas-control"><button class="play"></button><button class="prev" aria-label="上一事件">←</button><input class="scrub" type="range" min="0" max="1000" aria-label="场景进度"><button class="next" aria-label="下一事件">→</button><select class="rate" aria-label="播放速度"><option>0.5×</option><option selected>1×</option><option>2×</option><option>4×</option></select><button class="restart">重播</button></div></section><div class="m-deck"><section><h3>现场事件</h3><ol class="m-log"></ol></section><section><h3 class="trial-title"></h3><div class="m-input"></div><p class="m-explain"></p></section></div><details class="atlas-proof"><summary>实例与数据来源</summary><p class="info"></p><code class="binding"></code></details></article>';
 const canvas=pick('canvas'),log=pick('.m-log'),play=pick('.play'),scrub=pick('.scrub'),box=pick('.m-input');
 pick('.problem-ref').href='index.html#scene/'+encodeURIComponent(p.sceneId);pick('.problem-ref').textContent=p.sceneName;pick('h1').textContent=p.title;pick('h2').textContent=pack.title;
 pick('.meta').textContent=p.sceneName+' · '+p.id;pick('.m-facts').textContent='medium / I001　 ·　'+fmt(pack.variables)+' 个决策变量　 ·　'+(pack.lower?'至少 ':'')+fmt(pack.constraints)+' 条约束';
 pick('.type').textContent=({clock:'实例时钟',route:'路线执行顺序',coverage:'覆盖方案部署',series:'归档序列',allocation:'订单池分流',build:'方案部署'})[pack.kind];
 pick('.info').textContent=pack.field+'　·　'+(travel?'本视图选取 '+data.length+' 个连接事件':'展示 '+data.length+' / '+fmt(pack.total)+' 项记录')+'。'+(travel?(pack.kind==='clock'?'时刻来自归档解，地图采用示意布局。':'按已选连接演示，步长为显示顺序。'):'方案展开顺序与动画速度用于演示。');
 pick('.binding').textContent='Git blob · instance '+pack.instance+' · solution '+pack.solution+(pack.objective?' · 归档目标值 '+pack.objective:'');
 const alternate=pack.kind==='allocation';
 if(alternate){
  pick('.trial-title').textContent='调配订单';box.innerHTML='<label>众包份额 <input type="range" min="0" max="100" step="1"><output></output></label>';
  const slider=box.querySelector('input');slider.value=data[0][1]*100;
  function split(){share=Number(slider.value)/100;box.querySelector('output').textContent=slider.value+'%';draw();}
  on(slider,'input',split);box.querySelector('output').textContent=slider.value+'%';
  pick('.m-explain').textContent='按当前比例分配 50 份等量订单，对照归档份额 '+fmt(data[0][1]*100)+'%。';
 }else{
  pick('.trial-title').textContent=travel?'暂停一个运行单元':'暂缓一项配置';
  const select=document.createElement('select');select.setAttribute('aria-label','选择对照项');select.add(new Option('完整归档方案',''));
  for(const name of new Set(data.map(v=>v[0])))select.add(new Option(name,name));
  box.append(select);on(select,'change',()=>{omit=select.value;cache=-1;draw();});
  pick('.m-explain').textContent=travel?'选中一个单元后，将它从演示中移出。沿时间轴观察其余单元以及已到达的端点。':'可暂缓其中一项，观察展示范围内的配置缺口。原实例的其余决策保持归档取值。';
  if(pack.kind==='series'){pick('.trial-title').textContent='查看归档观测';select.options[0].textContent='跟随播放';select.onchange=()=>{if(select.value){playing=false;t=data.findIndex(r=>r[0]===select.value);omit='';}draw();};pick('.m-explain').textContent='选择观测位置可以跳转至对应帧。';}
 }
 function draw(){
  const result=window.ORTOPIA_LANDSCAPE.frame(canvas,p,pack,0,t,null,{omit,share});if(!result)return;
  pick('.m-status').textContent=result.text;pick('.m-clock').textContent=(pack.kind==='clock'?'t = ':'进度 ')+(pack.kind==='clock'?fmt(t):Math.round(100*(t-low)/span)+'%');
  play.textContent=playing?'暂停':'播放';scrub.value=(t-low)/span*1000;
  let i=0;while(i+1<points.length&&points[i+1]<=t)i++;
  if(i!==cache){cache=i;log.replaceChildren();const events=travel?data.filter(r=>r[3]<=t&&r[0]!==omit).sort((a,b)=>b[3]-a[3]).slice(0,4):data.slice(Math.max(0,Math.min(data.length-1,Math.floor(t))-3),Math.floor(t)+1).reverse();
   for(const r of events){const li=document.createElement('li');li.textContent=travel?r[0]+'　'+r[1]+' → '+r[2]+'　('+fmt(r[3])+' – '+fmt(r[4])+')':r[0]+'　'+fmt(r[1])+(r[0]===omit?'　暂缓':'');log.append(li);}
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
