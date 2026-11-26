/* P0154 small/I001. Position integrates the source acceleration/cruise/braking profile. */
(() => {
 'use strict';
 const F=window.ORTOPIA_FIELD;
 const {W,H,clamp,poly,line,ellipse,text,badge,tree,cachedWorld}=F;
 const sessions=new WeakMap(), left=58,right=882, spacing=(right-left)/9;
 const xAt=(station,direction)=>direction?right-station*spacing:left+station*spacing;
 function city(c) {
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#bfd5d9');sky.addColorStop(.48,'#f0e9d2');sky.addColorStop(1,'#a2b89c');
  c.fillStyle=sky;c.fillRect(0,0,W,H);ellipse(c,760,53,28,28,'#f7e7b7');
  poly(c,[[0,132],[0,91],[92,78],[132,92],[197,62],[355,112],[437,78],[522,94],[648,67],[796,108],[940,78],[940,145]],'#a9b6a2');
  for(let i=0;i<31;i++){
   const x=(i*127)%948-12,y=139+(i%3)*5,h=19+(i*19)%56,w=13+(i*17)%37;
   F.box(c,x,y,w,h,5,['#a3b2ad','#8eaaa3','#c6d2bf']);
   for(let dx=4;dx<w-3;dx+=8)for(let dy=6;dy<h-4;dy+=10){c.fillStyle=(i+dx+dy)%4?'#768e88':'#dadab6';c.fillRect(x+dx,y-dy,4,4);}
  }
  poly(c,[[0,148],[940,142],[940,414],[0,414]],'#ccd2b8');
  for(let i=0;i<36;i++)tree(c,(i*91)%950,145+(i%7)*3,.38+(i%3)*.13);
  for(const y of [203,290]){
   c.fillStyle='#9eaba2';c.fillRect(0,y-3,W,20);c.fillStyle='#6c827b';c.fillRect(0,y+17,W,7);
   for(let x=24;x<W;x+=73){poly(c,[[x,y+23],[x+21,y+23],[x+15,y+29],[x+13,y+48],[x+6,y+48],[x+5,y+29]],'#82958a');}
   for(let x=0;x<W;x+=12)line(c,[[x,y-1],[x+2,y+7]],'#63776f',2);
   line(c,[[0,y-2],[W,y-2]],'#495d58',2);line(c,[[0,y+6],[W,y+6]],'#596967',2);
   for(let s=0;s<10;s++){const x=xAt(s,0);c.fillStyle='#d9c9ab';c.fillRect(x-17,y-3,34,4);
    if(y===203){line(c,[[x-12,y-7],[x-12,y-23],[x+12,y-23],[x+12,y-7]],'#6f8478',2);poly(c,[[x-20,y-25],[x+16,y-25],[x+21,y-22],[x-16,y-22]],'#5c8177');}
   }
  }
  for(let s=0;s<10;s++)badge(c,'S'+(s+1),xAt(s,0),244,'#e9ecd9','#425b53',13);
  for(let i=0;i<23;i++)tree(c,(i*103+53)%W,366+(i%4)*6,.4+(i%3)*.13);
 }
 const backdrop=cachedWorld(city);
 function position(train,gap,now) {
  let age=now-train.id*gap;if(age<0)return null;
  for(const p of train.profile){
   if(age<p.duration){
    const a=Math.min(age,p.acceleration_seconds),u=clamp(age-a,0,p.cruise_seconds),b=clamp(age-a-u,0,p.deceleration_seconds);
    const dist=p.v_in*a+.5*p.acceleration*a*a+p.v_cru*u+p.v_cru*b+.5*p.deceleration*b*b;
    return {s:p.section+clamp(dist/p.length),sec:p.section};
   }
   age-=p.duration;
  }
  return age<65?{s:9,sec:null}:null;
 }
 function coach(c,x,y,d,id,isThrough){
  c.save();c.translate(x,y);c.scale(d?-1:1,1);
  const paint=isThrough?'#256d79':'#b46041';
  for(let j=0;j<2;j++){
   const a=-18+j*19;
   c.fillStyle='#34494b';c.fillRect(a+2,-5,15,3);ellipse(c,a+5,-2,2.5,2.5,'#333f40');ellipse(c,a+14,-2,2.5,2.5,'#333f40');
   c.fillStyle='#f3ecda';c.beginPath();c.roundRect(a,-15,18,12,3);c.fill();
   c.fillStyle=paint;c.fillRect(a,-8,18,3);c.fillStyle='#345761';for(let z=2;z<16;z+=5)c.fillRect(a+z,-13,4,4);
  }
  c.restore();badge(c,(d?'↓':'↑')+(id+1),x,y-28,'#254740','#f7fbeb',12);
 }
 function render(ui,model,state,index,t) {
  const c=ui.c, gap=state.gap;
  const base=[0,333,860,2040,2710],window=state.inspect||[base[index],base[index+1]];
  const now=window[0]+(window[1]-window[0])*clamp(t/6);
  backdrop(c);
  const positions=model.trains.map(train=>({...train,position:position(train,gap,now)}));
  let conflict=false;
  for(const direction of [0,1]){
   const y=direction?290:203;
   let entry=0;
   for(let s=0;s<model.model.durations.length;s++){
    const duration=model.model.durations[s],fixed=!model.model.moving_sections.includes(s);
    const a=xAt(s,direction),b=xAt(s+1,direction),start=Math.min(a,b);
    const occupied=positions.filter(v=>v.direction===direction&&v.position?.sec===s).length;
    // A fixed block remains protected for delta seconds after a predecessor leaves.
    const violated=fixed&&[1,2].some(id=>now>=entry+id*gap&&now<entry+(id-1)*gap+duration+model.model.delta);
    conflict ||= violated;
    if(occupied||violated){c.fillStyle=violated?'#d661486b':'#4caba959';c.fillRect(start,y+9,Math.abs(b-a),7);}
    if(fixed){
     const protectedBlock=model.trains.some(tr=>tr.direction===direction&&now>=entry+tr.id*gap&&now<entry+tr.id*gap+duration+model.model.delta);
     line(c,[[a,y+1],[a,y-12]],'#475851',2);ellipse(c,a,y-13,3.5,3.5,protectedBlock?'#e2794f':'#608e67');
    }
    entry+=duration;
   }
   for(const train of positions.filter(v=>v.direction===direction&&v.position))coach(c,xAt(train.position.s,direction),y-3,direction,train.id,train.type==='through');
  }
  badge(c,'运行 '+Math.floor(now/60)+'分 '+String(Math.floor(now%60)).padStart(2,'0')+'秒',112,28,'#274741','#f3f6e6',16);
  badge(c,'同向间隔 '+gap+' 秒',W-109,28,'#edf2e4','#244b45',16);
  if(conflict)badge(c,'后车提前进入保护区',W/2,335,'#973f33','#fff4df',18);
 }
 function mount(host,onInteract,index,onNode,replayAction){
  const model=window.ORTOPIA_REPLAYS.P0154.field;
  let state=sessions.get(host);if(!state){state={gap:model.archived};sessions.set(host,state);}
  state.inspect=null;
  const ui=F.siteShell(host,'metro-grid','双向通勤地铁六列车的实际运行过程','实线区间的信号灯表示固定闭塞占用，红色轨道表示保护时间冲突。');
  ui.control.innerHTML='<label class="fp-group"><strong>发车间隔</strong><input aria-label="发车间隔（秒）" type="range" min="240" max="333" step="1"><output></output></label><div class="fp-group"><button data-gap="240">紧密发车</button><button data-gap="'+model.best+'">最短可行间隔</button><button data-gap="'+model.archived+'">恢复归档</button></div>';
  const slider=ui.control.querySelector('input');
  function refresh(){
   const r=model.plans[state.gap];
   slider.value=state.gap;ui.control.querySelector('output').textContent=state.gap+' 秒';
   ui.result.dataset.error=String(!r.valid);
   const fixed=r.errors.fixed_block;
   const braking=Object.entries(r.errors).filter(([k])=>k.startsWith('safety')).map(([,v])=>v);
   ui.result.textContent=(r.valid?'可行':fixed?'固定闭塞保护欠 '+fixed.toFixed(0)+' 秒':'制动安全余量欠 '+Math.max(...braking).toFixed(2)+' 秒')+' · '+(r.valid?'终到合计 ':'试排终到合计 ')+r.total+' 秒';
   for(const b of ui.control.querySelectorAll('[data-gap]'))b.setAttribute('aria-pressed',String(+b.dataset.gap===state.gap));
  }
  function change(gap){onInteract?.();state.gap=gap;state.inspect=[480+gap-45,480+Math.max(gap,320)+45];refresh();replayAction?.();host.sceneFrame(0);}
  slider.oninput=()=>change(+slider.value);
  ui.control.onclick=e=>{const b=e.target.closest('button[data-gap]');if(b)change(+b.dataset.gap);};
  F.hotspot(ui.scene,'缩短同向发车间隔',left,202,()=>change(240),70,82);
  F.hotspot(ui.scene,'按最短可行间隔调度',right,289,()=>change(model.best),70,72);
  host.sceneFrame=t=>render(ui,model,state,index,t);
  host.previewDecision=i=>{state.gap=i?240:model.archived;state.inspect=i?[675,840]:null;refresh();host.sceneFrame(host.sceneTime||0);};
  refresh();host.sceneFrame(host.sceneTime||0);
 }
 window.ORTOPIA_FIELD_P0154={mount};
})();
