(() => {
'use strict';
window.ORTOPIA_FIELD_CASES={};
const classics=new Set(["P0001", "P0012", "P0013", "P0020", "P0025", "P0045", "P0057", "P0058", "P0062", "P0068", "P0075", "P0094", "P0122", "P0145", "P0154", "P0160", "P0177", "P0182", "P0198", "P0204", "P0213", "P0214", "P0310", "P0449", "P0452"]);
let dispose=()=>{};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=v=>typeof v==='number'?new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:8}).format(v):String(v);
function mount(host,p,pack,step){
 const ctrl=new AbortController(),on=(element,event,handler)=>element.addEventListener(event,handler,{signal:ctrl.signal});
 let comparing=false,custom=null;let sample=0,channel=0,idx=0,elapsed=0,play=!matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,raf=0,last=0,hits=[],trial=false;
 const run=()=>pack.runs[sample],track=()=>run().tracks[channel],rows=()=>track().rows;
 idx=Math.min(rows().length,Math.max(1,step||1))-1;
 host.innerHTML='<article class="wrap atlas" data-problem="'+p.id+'"><div class="replay-breadcrumb"><a href="replay.html">实例仿真</a> / <a href="index.html#/problem/'+p.id+'">'+p.id+' 题目与模型</a></div><header class="atlas-title"><div><small>'+esc(p.domain)+' · '+p.id+'</small><h1>'+esc(p.title)+'</h1></div><label>实例 <select data-el="sample">'+pack.runs.map((r,i)=>'<option value="'+i+'">small / '+r.sample+'</option>').join('')+'</select></label></header><div class="atlas-tracks" data-el="tabs" aria-label="决策视图"></div><section class="atlas-stage"><div class="atlas-stage-head"><div><small data-el="kind"></small><h2 data-el="name"></h2></div><button data-action="compare" aria-pressed="false">叠加另一实例</button><span class="atlas-badge">归档解已通过检查</span></div><div class="atlas-window"><canvas data-el="canvas" aria-label="实例方案示意，亦可用下方记录按钮浏览"></canvas></div><div class="atlas-caption" data-el="caption"></div><div class="atlas-control"><button data-action="play"></button><button data-action="prev" aria-label="上一条">←</button><input data-el="range" aria-label="选择记录" type="range" min="1"><button data-action="next" aria-label="下一条">→</button><output data-el="count"></output><select data-el="speed" aria-label="播放速度"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></div></section><div class="atlas-info"><section><h3>实例记录</h3><div data-el="entries" class="atlas-records"></div></section><section><h3>当前决策</h3><p class="atlas-value" data-el="focus"></p><p data-el="compare"></p><p data-el="objective"></p></section></div><section data-el="experiment"></section><details class="atlas-proof"><summary>场景图、模型与数据来源</summary><div class="atlas-sources"><a href="'+esc(p.scene)+'" target="_blank" rel="noopener"><img loading="lazy" src="'+esc(p.scene)+'" alt="原题场景图"></a><div><p>'+esc(p.summary||p.title)+'</p><a href="index.html#/problem/'+p.id+'">阅读问题描述与数学模型 →</a><p data-el="source"></p></div></div></details></article>';
 const el=key=>host.querySelector('[data-el="'+key+'"]'),act=key=>host.querySelector('[data-action="'+key+'"]'),canvas=el('canvas');
 function currentText(row){return track().mode==='route'?row.a+' → '+row.b:value(row.v);}
 function paint(){hits=window.ORTOPIA_LANDSCAPE.frame(canvas,p,track(),idx,elapsed,comparing?pack.runs[1-sample].tracks.find(t=>t.field===track().field):null,custom);}
 function size(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));paint();}
 function controls(){
  act('play').textContent=play?'暂停':'播放';act('prev').disabled=idx===0;act('next').disabled=idx===rows().length-1;
  el('range').max=rows().length;el('range').value=idx+1;el('count').textContent=(idx+1)+' / '+rows().length;
 }
 function update(){
  const t=track(),row=rows()[idx],item=row.at||t.name;
  el('kind').textContent=t.mode==='route'?'方案分解 · 已选连接':'方案分解 · 决策取值';
  el('name').textContent=t.name;
  el('caption').textContent=t.mode==='route'?'高亮线连接该条记录的两个端点。位置和播放速度为示意。':'每个工位对应一条实例记录。选择工位可查看其取值，播放按记录顺序切换。';
  if(comparing)el('caption').textContent+=t.mode==='route'?' 紫色虚线标出另一实例在共同端点间的连接。':' 对照标签显示另一实例相同记录位置的取值。';
  if(custom?.coverage)el('caption').textContent='连线表示已选路线服务的客户。客户标牌显示覆盖次数。';
  if(custom?.share!=null)el('caption').textContent='线宽随两类承运者的订单份额变化。';
  el('entries').innerHTML=rows().map((r,j)=>'<button data-row="'+j+'" aria-pressed="'+(j===idx)+'">'+esc(r.at||t.name)+'<b>'+esc(currentText(r))+'</b></button>').join('');
  el('focus').textContent=item+'　'+currentText(row);
  const other=pack.runs[1-sample],ot=other.tracks.find(v=>v.field===t.field),or=ot?.rows.find(v=>v.at===row.at);
  el('compare').textContent=or?'同一记录位置在 '+other.sample+' 的值为 '+currentText(or)+'。':'另一实例可从页首切换查看。';
  el('objective').textContent=run().objective?'本实例归档目标值　'+run().objective:'本实例展示归档策略分项。';
  el('source').textContent='数据字段 '+t.field+' · 展示 '+rows().length+' / '+t.total+' 条。实例 SHA-256 '+run().instanceHash+' · 归档解 SHA-256 '+run().solutionHash;
  controls();paint();
 }
 function tabs(){el('tabs').innerHTML=run().tracks.map((t,i)=>'<button data-tab="'+i+'" aria-pressed="'+(channel===i)+'">'+esc(t.name)+'</button>').join('');}
 function experiment(){
  const box=el('experiment');box.innerHTML='';
  if(pack.trial&&sample===0){const t=pack.trial;
   box.innerHTML='<div class="atlas-test"><h3>改变一个决策</h3><p>固定 I001 的其他决策，比较原题检查器对两份方案的判定。</p><div><button data-trial="0" aria-pressed="'+!trial+'">归档取值 '+esc(value(t.before))+'</button> <button data-trial="1" aria-pressed="'+trial+'">改为 '+esc(value(t.after))+'</button></div><p class="atlas-result '+(trial?'failed':'')+'" role="status">'+esc(t.variable)+' = '+esc(value(trial?t.after:t.before))+'　'+(trial?'未通过 · '+esc(t.constraint)+' 触发约束检查，最大违反量 '+esc(value(t.residual)):'通过归档解可行性检查')+'</p></div>';
  }
  if(p.id==='P0004'){
   const [lo,hi]=run().tracks.find(t=>t.field==='feasible_P_interval').rows.map(r=>r.v);
   const original=run().tracks.find(t=>t.field==='P').rows[0].v;
   const div=document.createElement('div');div.className='atlas-test';div.innerHTML='<h3>调配众包订单份额</h3><p>拖动调整分给众包司机的订单份额，余量由第三方承运。实例给出的可行区间为 '+value(lo*100)+'% 至 '+value(hi*100)+'%。</p><input type="range" data-el="share" aria-label="众包份额" min="0" max="1" step="any"><p data-el="shareout" class="atlas-result" role="status"></p><button data-action="reset">恢复归档比例</button>';box.append(div);
   el('share').value=original;el('shareout').textContent='归档份额 '+value(original*100)+'%';
  }
  if(run().routes){const lab=document.createElement('div');lab.className='atlas-test';lab.innerHTML='<h3>试排覆盖路线</h3><p>勾选或撤回路线，查看有几个客户恰好得到一次服务，以及所选路线的总费用。</p><div class="atlas-route-list">'+run().routes.map((r,i)=>'<label><input type="checkbox" data-line="'+i+'" '+(r.used?'checked':'')+'> '+esc(r.id)+' · '+esc(r.customers.join('、'))+'</label>').join('')+'</div><p data-el="coverage" class="atlas-result" role="status"></p><button data-action="reset">恢复归档路线</button>';box.append(lab);coverage();}
 }
 function coverage(){const rs=run().routes;if(!rs)return;const counts=new Map(rs.flatMap(x=>x.customers).map(c=>[c,0]));let cost=0;
  host.querySelectorAll('[data-line]:checked').forEach(input=>{const r=rs[+input.dataset.line];cost+=r.cost;r.customers.forEach(c=>counts.set(c,counts.get(c)+1));});
  if(custom?.coverage){custom.coverage.picks=new Set([...host.querySelectorAll('[data-line]:checked')].map(input=>rs[+input.dataset.line].id));update();}
  const missed=[...counts].filter(([,v])=>v===0).map(([k])=>k),twice=[...counts].filter(([,v])=>v>1).map(([k])=>k);
  el('coverage').textContent='恰好一次 '+(counts.size-missed.length-twice.length)+' / '+counts.size+' · 总费用 '+value(cost)+(missed.length?' · 未覆盖 '+missed.join('、'):'')+(twice.length?' · 重复覆盖 '+twice.join('、'):'');el('coverage').classList.toggle('failed',Boolean(missed.length+twice.length));
 }
 function selected(i){custom=null;idx=Math.max(0,Math.min(i,rows().length-1));play=false;elapsed=1;update();}
 function tick(t){if(!play||document.hidden){raf=0;return;}elapsed+=Math.min(80,t-(last||t))*speed/2800;last=t;
  if(elapsed>=1){if(idx+1<rows().length){idx++;elapsed=0;update();}else{elapsed=1;play=false;controls();}}paint();raf=play?requestAnimationFrame(tick):0;
 }
 function start(){cancelAnimationFrame(raf);raf=0;last=0;if(play&&!document.hidden)raf=requestAnimationFrame(tick);}
 function toggle(){if(!play&&idx===rows().length-1&&elapsed>=1){idx=0;elapsed=0;update();}play=!play;controls();start();}
 on(host,'click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-tab')){custom=null;channel=+b.dataset.tab;idx=0;elapsed=0;tabs();update();start();}
  if(b.hasAttribute('data-row'))selected(+b.dataset.row);
  if(b.hasAttribute('data-trial')){trial=b.dataset.trial==='1';experiment();}
  if(b.dataset.action==='next')selected(idx+1);
  if(b.dataset.action==='prev')selected(idx-1);
  if(b.dataset.action==='play')toggle();
  if(b.dataset.action==='compare'){custom=null;comparing=!comparing;b.setAttribute('aria-pressed',comparing);update();}
  if(b.dataset.action==='reset'){custom=null;experiment();update();}
 });
 on(el('sample'),'change',()=>{custom=null;sample=+el('sample').value;idx=0;channel=0;elapsed=0;trial=false;tabs();update();experiment();start();});
 on(el('range'),'input',()=>selected(+el('range').value-1));
 on(el('speed'),'change',()=>{speed=+el('speed').value;});
 on(host,'change',e=>{if(e.target.hasAttribute('data-line')){custom={coverage:{routes:run().routes,picks:new Set()}};coverage();}});
 on(canvas,'click',e=>{const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)*900/b.width,y=(e.clientY-b.top)*385/b.height;const near=hits.map(h=>[Math.hypot(h.x-x,h.y-y),h.i]).sort((a,b)=>a[0]-b[0])[0];if(near&&near[0]<65)selected(near[1]);});
 on(host,'input',e=>{if(e.target!==el('share'))return;const v=Number(e.target.value),bounds=run().tracks.find(t=>t.field==='feasible_P_interval').rows.map(r=>r.v),within=v>=bounds[0]-1e-12&&v<=bounds[1]+1e-12;custom={share:v};el('shareout').textContent='众包 '+value(v*100)+'% · 第三方 '+value((1-v)*100)+'% · '+(within?'在实例给出的比例区间内':'超出实例给出的比例区间');el('shareout').classList.toggle('failed',!within);update();});
 on(document,'visibilitychange',start);
 const ro=new ResizeObserver(size);ro.observe(canvas);
 dispose=()=>{ctrl.abort();cancelAnimationFrame(raf);ro.disconnect();};
 document.title=p.title+' · 实例仿真 · ORtopia';tabs();size();update();experiment();start();window.scrollTo(0,0);
}
window.ORTOPIA_FIELD_PLAYER={supports:id=>!classics.has(id),mount,close(){dispose();dispose=()=>{};}};
})();
