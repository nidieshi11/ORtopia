/* Retail drone service on a unit circular market, P0039. */
(() => {
'use strict';
const TAU = 2 * Math.PI;
const customers = [
  {name:'近区住户', side:-1, position:.24, color:'#337c95'},
  {name:'中区住户', side:1, position:.61, color:'#96621b'},
  {name:'边缘住户', side:-1, position:.95, color:'#9d4655'}
];
const fmt = (value, digits=3) => value.toLocaleString('zh-CN', {
  minimumFractionDigits:digits, maximumFractionDigits:digits
});
function economics(params) {
  const {M, lambda, m, alpha, k} = params;
  let h=0, g=0;
  for(let i=1;i<=M;i++){ h+=1/Math.sqrt(i); g+=Math.sqrt(i); }
  const salesFactor=2*lambda*m*h/Math.sqrt(M);
  const flightFactor=2*lambda*alpha*(2*g-h)/M**1.5;
  return (n, omega, beta) => {
    const sales=salesFactor*n*Math.sqrt(beta*omega);
    const flights=flightFactor*n*omega**2.5*beta**1.5, centers=k*n*n;
    return {sales, flights, centers, profit:sales-flights-centers};
  };
}

// The viewport shows a magnified arc of one centre's territory. Distances use
// unit-circle angles throughout, including the curved flight paths.
function paint(canvas, state) {
  const {n,beta,customers:stops,active,elapsed,served}=state;
  const ctx=canvas.getContext('2d'), width=840, height=360;
  ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
  const half=Math.PI/n, radius=335/Math.sin(half);
  const at=(angle,offset=0)=>[420+(radius+offset)*Math.sin(angle),202+radius-(radius+offset)*Math.cos(angle)];
  function path(points,fill,stroke,lineWidth=1){
    ctx.beginPath(); points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
  }
  function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function arc(a,b,offset,color,thick){const pts=[];for(let i=0;i<=72;i++)pts.push(at(a+(b-a)*i/72,offset));path(pts,null,color,thick);}
  function caption(text,x,y,bg){
    ctx.font='bold 14px system-ui';ctx.textAlign='center';const w=ctx.measureText(text).width+18;
    x=Math.min(width-w/2-4,Math.max(w/2+4,x));
    rect(x-w/2,y-15,w,22,bg);ctx.fillStyle='white';ctx.fillText(text,x,y+1);
  }
  function block(x,y,w,d,h,roof,side){
    const top=[[x,y-h],[x+w,y-h-4],[x+w+d,y-h-4-d*.63],[x+d,y-h-d*.63]];
    path([[x,y],[x+w,y-4],[x+w,y-h-4],[x,y-h]],'#e9dbc1','#948d79');
    path([[x+w,y-4],[x+w+d,y-4-d*.63],[x+w+d,y-h-4-d*.63],[x+w,y-h-4]],side);
    path(top,roof,'#687768');
    for(let dx=4;dx<w-4;dx+=8)rect(x+dx,y-h+4,4,5,'#70868a');
  }
  function tree(x,y,s){
    rect(x-1.4*s,y,3*s,7*s,'#81765c');dot(x,y-3*s,7*s,'#69896a');
    dot(x-2*s,y-6*s,5*s,'#90a879');
  }
  const grass=ctx.createLinearGradient(0,0,0,height);grass.addColorStop(0,'#c9d9ba');grass.addColorStop(1,'#e2e4c8');
  rect(0,0,width,height,grass);
  path([[0,0],[840,0],[840,40],[650,47],[470,30],[260,52],[80,40],[0,60]],'#9dc6c8');
  path([[0,62],[100,44],[265,56],[470,34],[648,52],[840,46]],null,'#f5edcf',5);
  // Service streets and buildings sit on either side of the circular market.
  for(const offset of [96,-71]){
    arc(-half*1.34,half*1.34,offset,'#b0b7a5',13);
    arc(-half*1.34,half*1.34,offset,'#e9e3d1',10);
  }
  for(let j=-13;j<=13;j++){
    const a=j*half/10.6;
    const [x,y]=at(a,116), [xx,yy]=at(a,-107);
    if(j%4===0){tree(x,y,1);tree(xx,yy,.95);continue;}
    block(x-10,y,18,7,10+(j*j%4)*2,j%2?'#a6755d':'#87988c','#c0af94');
    block(xx-12,yy,22,8,12,j%3?'#849693':'#aa7c63','#b8aa92');
  }
  arc(-half*1.35,half*1.35,0,'#aaa896',29);
  arc(-half*1.35,half*1.35,0,'#f4ead7',26);
  arc(-beta,beta,0,'#a0c9ad',24);arc(-beta,beta,0,'#588e79',2);
  for(const a of [-beta,beta])path([at(a,-15),at(a,15)],null,'#266951',3);
  for(const sign of [-1,1]){
    for(let i=1;i<=9;i++){const a=sign*i*half/10;path([at(a,-6),at(a,6)],null,'#fff9e7',1);}
  }
  for(let j=0;j<stops.length;j++){
    const s=stops[j], [x,y]=at(s.angle), side=j===1?-1:1;
    const [hx,hy]=at(s.angle,side*41);
    path([[hx,hy],[x,y]],null,'#ada68f',3);
    block(hx-11,hy,20,9,15,s.color,'#ad9c82');
    dot(x,y,6,s.reachable?s.color:'#918e82');
    const handoff=j===active&&s.reachable?Math.min(1,Math.max(0,(elapsed-s.travel)/.058)):0;
    const approach=j===active&&s.reachable?Math.min(1,elapsed/s.travel):0;
    const walk=j===active && served.has(j)?1-handoff:approach;
    const px=hx+8+(x-hx)*walk*.78,py=hy+(y-hy)*walk*.78;
    const stride=Math.sin(walk*Math.PI*5)*1.8;
    path([[px-2-stride,py+5],[px,py],[px+2+stride,py+5]],null,'#374740',1.6);
    rect(px-2.3,py-5,4.6,6,s.color);dot(px,py-7,2.7,'#a87955');
    if(served.has(j)){
      const u=j===active?handoff:1;
      rect(x+(hx+8-x)*u-3,y+(hy-y)*u-4,6,6,'#b57b3d');
    }
    const label=s.name+(served.has(j)?' ✓':s.reachable?'':' · 未覆盖');
    caption(label,hx,hy+(side>0?-30:24),s.reachable?s.color:'#726f63');
  }
  const [cx,cy]=at(0);
  block(cx-31,cy+46,52,19,21,'#41685b','#a39b82');
  rect(cx-15,cy+32,12,12,'#48605c');rect(cx+2,cy+31,12,12,'#48605c');
  for(let i=0;i<3;i++)rect(cx+26+i*5,cy+34-i*2,5,6,'#b58047');
  caption('零售配送中心',cx,cy+73,'#203f39');
  // The inset uses a fixed scale, so changing centre density changes the
  // absolute length of the representative service arc on the whole market.
  rect(651,8,176,64,'#f8f6ed');
  ctx.strokeStyle='#adb6ab';ctx.lineWidth=3;ctx.beginPath();ctx.arc(683,40,22,0,TAU);ctx.stroke();
  ctx.strokeStyle='#366e59';ctx.lineWidth=6;ctx.beginPath();ctx.arc(683,40,22,-Math.PI/2-beta,-Math.PI/2+beta);ctx.stroke();
  dot(683,18,3,'#233f39');
  ctx.font='bold 13px system-ui';ctx.fillStyle='#294e43';ctx.textAlign='left';
  ctx.fillText('全市场 · 单中心',716,33);
  ctx.font='13px system-ui';ctx.fillText('服务弧 '+fmt(2*beta),716,54);
  const s=stops[active];
  if(s.reachable){
    const f=Math.min(1,elapsed/s.travel);
    arc(0,s.angle*f,0,s.color,3);
    const [x,y]=at(s.angle*f);
    ctx.save();ctx.globalAlpha=.16;ctx.beginPath();ctx.ellipse(x+2,y+3,13,4,0,0,TAU);ctx.fillStyle='#1d3432';ctx.fill();ctx.restore();
    const lift=7+14*Math.sin(Math.PI*f),dy=y-lift;
    if(f<1)rect(x-3,dy+3,6,6,'#cb8c41');
    for(const dx of [-9,9])for(const dh of [-4,4]){
      path([[x,dy],[x+dx,dy+dh]],null,'#1f373a',2);
      ctx.strokeStyle='#487170';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+dx,dy+dh,5,2,0,0,TAU);ctx.stroke();
    }
    dot(x,dy,4,'#213c3e');
  }
}

function mount(host,p,pack,step){
  const model=economics(pack.parameters), ref=pack.reference, M=pack.parameters.M;
  host.innerHTML=`<article class="wrap atlas medium-world drone-world">
    <div class="replay-breadcrumb"><a href="index.html">实例仿真</a> / <a class="problem-ref"></a></div>
    <header class="atlas-title"><div><small>无人机 · P0039 · medium / I001</small><h1>圆形市场的无人机配送网络经营</h1></div></header>
    <section class="atlas-stage"><div class="atlas-stage-head"><div><small>代表中心 · 环形市场局部</small><h2>从零售中心飞到住户</h2></div><output class="m-clock"></output></div>
    <div class="atlas-window"><canvas aria-label="中心两侧的住户、可服务圆弧以及正在配送的无人机"></canvas></div>
    <div class="m-status"></div><div class="atlas-control"><button class="play"></button><input type="range" class="scrub" min="0" max="1000" aria-label="订单演示进度"><button class="restart">从头播放</button></div>
    <div class="dr-actions"><div class="dr-stops" aria-label="选择示例住户"></div><button class="fast-trial">试飞 · 航速提高 50%</button><output class="fast-result"></output></div></section>
    <div class="m-deck dr-deck"><section><h3>试调配送网络</h3><div class="dr-controls"></div><button class="restore">恢复归档方案</button></section>
    <section><h3>全市场经营结果</h3><dl class="dr-metrics"></dl><p class="dr-delta"></p></section></div>
    <details class="atlas-proof"><summary>实例与演示口径</summary><p>实例把客户均匀分布在单位圆周上。配送中心规模是连续变量，每个中心的每侧有 10,000 个时限分区。图中显示一个中心和三个代表住户，住户按中心辖区的相对位置选取。航迹与时钟按模型距离和角速度计算，三笔示例配送依次播放。模型使用连续需求率，画中的住户和出场顺序用于演示。</p><p>各区承诺时间取飞至该区外边界的时间。全市场的商品边际收益与飞行成本按所有分区求和，中心经营成本随网络规模的平方增长。时间与利润均采用实例单位。</p><code class="binding"></code></details></article>`;
  const q=s=>host.querySelector(s),canvas=q('canvas'), ctl=new AbortController();
  const on=(el,type,fn)=>el.addEventListener(type,fn,{signal:ctl.signal});
  q('.problem-ref').href='index.html#scene/'+encodeURIComponent(p.sceneId);q('.problem-ref').textContent=p.sceneName;
  q('.binding').textContent='10,003 个决策变量 · 10,001 条约束 · instance '+pack.instance+' · solution '+pack.solution;
  let n=ref.n,omega=ref.omega,frac=ref.n*ref.beta/Math.PI;
  let t=0, raf=0,last=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stops=[],duration=0,beta=0;
  const controls=[
    ['中心规模', 'n', 3, 14, ()=>n, v=>n=v],
    ['飞行角速度','omega', .5, 2.5, ()=>omega, v=>omega=v],
    ['辖区覆盖比例','coverage', .25, 1, ()=>frac, v=>frac=v]
  ];
  for(const [label,key,min,max,get,set] of controls){
    const row=document.createElement('label');
    row.innerHTML='<span>'+label+'</span><output></output><input type="range" step="0.001" min="'+min+'" max="'+max+'" data-value="'+key+'">';
    q('.dr-controls').append(row);
    on(row.querySelector('input'),'input',e=>{set(Number(e.target.value));update();});
  }
  const metricNames=['商品边际收益','飞行成本','中心经营成本','网络利润'];
  for(const label of metricNames){const dt=document.createElement('dt');dt.textContent=label;q('.dr-metrics').append(dt,document.createElement('dd'));}
  for(const [index,c] of customers.entries()){
    const button=document.createElement('button');button.textContent=c.name;button.type='button';
    on(button,'click',()=>seek(stops[index].start));q('.dr-stops').append(button);
  }
  function update(){
    beta=Math.PI/n*frac;
    duration=0;
    stops=customers.map(c=>{
      const angle=c.side*c.position*Math.PI/n;
      const zone=Math.ceil(Math.abs(angle)/beta*M),reachable=zone<=M;
      const travel=Math.abs(angle)/omega, promise=zone*beta/(M*omega);
      const start=duration;duration+=(reachable?travel:0)+.065;
      return {...c,angle,reachable,zone,travel,promise,start};
    });
    for(const [label,key,min,max,get] of controls){
      const el=q('[data-value="'+key+'"]');el.value=get();
      el.previousElementSibling.textContent=key==='coverage'?fmt(get()*100,1)+'%':fmt(get());
    }
    const v=model(n,omega,beta), cells=host.querySelectorAll('dd');
    [v.sales,v.flights,v.centers,v.profit].forEach((x,i)=>cells[i].textContent=fmt(x));
    q('.fast-result').textContent='全市场利润 '+fmt(v.profit);
    q('.dr-delta').textContent='归档利润 '+fmt(ref.profit)+'　·　当前差额 '+fmt(v.profit-ref.profit);
    t=0;last=0;draw();
  }
  function draw(){
    const active=stops.findLastIndex(c=>c.start<=t),c=stops[active],elapsed=t-c.start;
    const served=new Set(stops.flatMap((s,j)=>s.reachable && t>=s.start+s.travel?[j]:[]));
    paint(canvas,{n,beta,customers:stops,active,elapsed,served});
    q('.m-clock').textContent='本单用时 '+fmt(c.reachable?Math.min(elapsed,c.travel):0);
    q('.m-status').textContent=c.name+'　'+(c.reachable?
      (served.has(active)?'已送达':'配送中')+' · 第 '+c.zone.toLocaleString('zh-CN')+' 区 · 承诺 '+fmt(c.promise,5)+' · 单位弧长需求率 '+fmt(pack.parameters.lambda/Math.sqrt(c.promise),2)
      :'超出服务范围，本单无法受理');
    q('.play').textContent=playing?'暂停':t>=duration?'重播':'播放';
    q('.scrub').value=t/duration*1000;
    host.querySelectorAll('.dr-stops button').forEach((el,j)=>el.setAttribute('aria-pressed',String(active===j)));
  }
  function tick(now){
    if(!playing||document.hidden)return;
    t=Math.min(duration,t+Math.min(100,now-(last||now))*.000038);
    last=now;if(t>=duration)playing=false;draw();
    if(playing)raf=requestAnimationFrame(tick);
  }
  function run(){cancelAnimationFrame(raf);last=0;draw();if(playing&&!document.hidden)raf=requestAnimationFrame(tick);}
  function seek(value){playing=false;t=value;run();}
  on(q('.play'),'click',()=>{if(t>=duration)t=0;playing=!playing;run();});
  on(q('.restart'),'click',()=>{t=0;playing=true;run();});
  on(q('.scrub'),'input',e=>seek(duration*Number(e.target.value)/1000));
  on(q('.fast-trial'),'click',()=>{omega=ref.omega*1.5;playing=true;update();run();});
  on(q('.restore'),'click',()=>{n=ref.n;omega=ref.omega;frac=ref.n*ref.beta/Math.PI;update();});
  function resize(){const bounds=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(bounds.width*dpr));canvas.height=Math.max(1,Math.round(bounds.height*dpr));draw();}
  const observer=new ResizeObserver(resize);
  update();t=stops[Math.min(2,Math.max(0,(step||1)-1))].start;resize();observer.observe(canvas);on(document,'visibilitychange',run);run();scrollTo(0,0);document.title=p.title+' · ORtopia';
  return ()=>{ctl.abort();observer.disconnect();cancelAnimationFrame(raf);};
}
window.ORTOPIA_DRONE_RETAIL={mount};
})();
