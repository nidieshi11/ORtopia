'use strict';
window.ORTOPIA_ROUTE_LAB=(()=>{
 const eps=1e-8;
 const colors=['#287969','#b25c37'];
 const keyOf=(a,b)=>a+'>'+b;
 const planKey=routes=>routes.map(r=>r.join(',')).sort().join('|');
 const f=(n,d=4)=>Number(n.toFixed(d)).toString();
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let request,model,selection,selectedStop=null;
 function load(){
  if(window.ORTOPIA_P0182_DATA)return Promise.resolve(window.ORTOPIA_P0182_DATA);
  if(!request)request=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='data/route-lab-P0182.js';
   script.onload=()=>window.ORTOPIA_P0182_DATA?resolve(window.ORTOPIA_P0182_DATA):reject(Error('data missing'));
   script.onerror=()=>{script.remove();reject(Error('data missing'));};
   document.head.appendChild(script);
  }).catch(e=>{request=null;throw e;});
  return request;
 }
 function evaluate(x,arcs,routes){
  const active=new Set(),t={...x.time_lower},nodes=Object.keys(t),errors=[];
  const trips=routes.map((r,index)=>{
   const seq=[x.start_depot,...r,x.end_depot], stops=[];
   let load=0,energy=0;
   for(let j=1;j<seq.length;j++){
    const [a,b]=[seq[j-1],seq[j]],key=keyOf(a,b),arc=arcs.get(key);
    active.add(key);energy+=arc.energy;
    load+=x.demand[b]||0;
    stops.push({id:b,from:a,travel:arc.travel});
   }
   if(load>x.vehicle_capacity)errors.push('车辆 '+(index+1)+' 载量 '+load+' 超过容量 '+x.vehicle_capacity+'。');
   return {stops,load,energy};
  });
  // For each candidate even a nonselected arc imposes a time inequality relaxed by its own M.
  // All waiting offsets may be zero; increasing one only strengthens those lower bounds.
  let changed=false;
  for(let pass=0;pass<nodes.length;pass++){
   changed=false;
   for(const [key,a] of arcs){
    const bound=t[a.from]+a.travel-(active.has(key)?0:a.M);
    if(bound>t[a.to]+eps){t[a.to]=bound;changed=true;}
   }
   if(!changed)break;
  }
  const cycle=changed;
  // Physical arrival on selected legs is meaningful even for a rejected plan.
  // In a feasible plan the displayed timestamps witness all arcs, including the shared return copy.
  for(const trip of trips){
   let previous=x.time_lower[x.start_depot];
   for(const stop of trip.stops){
    stop.arrival=previous+stop.travel;
    stop.service=Math.max(stop.arrival,x.time_lower[stop.id]);
    stop.wait=stop.service-stop.arrival;
    previous=stop.service;
    stop.late=Math.max(0,stop.service-x.time_upper[stop.id]);
    if(stop.late>eps){
     const id=stop.id===x.end_depot?'车场返程':stop.id;
     errors.push(id+' 最早到达 '+f(stop.arrival,5)+'，晚于上限 '+f(x.time_upper[stop.id],5)+'，超出 '+f(stop.late,5)+'。');
    }
   }
  }
  if(cycle&&!errors.length)errors.push('全部弧的时间递推形成正长度闭环，无法安排同时满足所有约束的时刻。');
  if(!cycle)for(const n of nodes){
   if(t[n]>x.time_upper[n]+eps&&!errors.length)errors.push(n+' 同时满足全部弧所需的时刻 '+f(t[n],5)+' 超出其上限 '+f(x.time_upper[n],5)+'。');
  }
  for(let mask=1;mask<2**x.customers.length;mask++){
   const ids=x.customers.filter((_,i)=>mask&(1<<i));
   const minExits=Math.ceil(ids.reduce((sum,n)=>sum+x.demand[n],0)/x.vehicle_capacity);
   const exits=[...arcs].filter(([k,a])=>active.has(k)&&ids.includes(a.from)&&!ids.includes(a.to)).length;
   if(exits<minExits){errors.push('客户集合 '+ids.join('、')+' 至少需要 '+minExits+' 条离开该集合的路线弧。');break;}
  }
  if(!errors.length){
   for(const trip of trips)for(const stop of trip.stops){
    stop.arrival=t[stop.from]+stop.travel;stop.service=t[stop.id];stop.wait=Math.max(0,stop.service-stop.arrival);
   }
  }
  return {trips,errors,energy:trips.reduce((sum,trip)=>sum+trip.energy,0)};
 }
 function prepare(data){
  const x=data.instance,arcs=new Map();
  x.arcs.forEach(([from,to],i)=>arcs.set(keyOf(from,to),{from,to,energy:x.arc_energy[i],travel:x.distance[i]/x.speed[i],M:x.time_M[i]}));
  const plans=[];
  function enumerate(prefix,remaining){
   if(remaining.length){
    for(const n of remaining)enumerate([...prefix,n],remaining.filter(p=>p!==n));
    return;
   }
   for(let k=1;k<prefix.length;k++){
    const routes=[prefix.slice(0,k),prefix.slice(k)];
    if(routes[0][0]>routes[1][0])continue;
    const key=planKey(routes),r=evaluate(x,arcs,routes),reference=data.oracle[key];
    if(!reference||(r.errors.length===0)!==reference[0]||Math.abs(r.energy-reference[1])>eps)throw Error('Route model mismatch: '+key);
    plans.push({routes,...r});
   }
  }
  enumerate([],x.customers);
  if(plans.length!==Object.keys(data.oracle).length)throw Error('Incomplete enumeration');
  plans.sort((a,b)=>a.energy-b.energy);
  const feasible=plans.filter(p=>!p.errors.length);
  if(Math.abs(feasible[0].energy-data.recordedEnergy)>eps)throw Error('Minimum objective differs');
  return {x,arcs,recorded:data.recorded,best:feasible[0],other:feasible.find(r=>r.energy>feasible[0].energy+eps),
          invalid:plans.find(p=>p.errors.length),count:plans.length,feasibleCount:feasible.length};
 }
 function drawMap(x,routes){
  const all=[x.start_depot,...x.customers],coords=all.map(n=>x.coordinates[n]);
  const xs=coords.map(v=>v[0]),ys=coords.map(v=>v[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const scale=Math.min(322/(maxX-minX),226/(maxY-minY));
  function point(n){const [a,b]=x.coordinates[n];return [204+(a-(minX+maxX)/2)*scale,140-(b-(minY+maxY)/2)*scale];}
  let svg='<svg class="rl-map" viewBox="0 0 408 280" role="img" aria-label="两辆车的行驶方向和实际客户位置"><defs><pattern id="rl-grid" width="17" height="17" patternUnits="userSpaceOnUse"><path d="M17 0H0V17" fill="none" stroke="#b4c5ba" stroke-width=".6"/></pattern></defs><rect width="408" height="280" rx="9" fill="#edf1e7"/><rect width="408" height="280" fill="url(#rl-grid)"/>';
  routes.forEach((r,k)=>{
   const seq=[x.start_depot,...r,x.end_depot];
   for(let i=1;i<seq.length;i++){
    const [ax,ay]=point(seq[i-1]),[bx,by]=point(seq[i]);
    const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    const cx=(ax+bx)/2+nx*11, cy=(ay+by)/2+ny*11;
    const mx=(ax+2*cx+bx)/4,my=(ay+2*cy+by)/4,angle=Math.atan2(dy,dx)*180/Math.PI;
    svg+='<path d="M'+ax+' '+ay+' Q'+cx+' '+cy+' '+bx+' '+by+'" fill="none" stroke="'+colors[k]+'" stroke-width="3.25" '+(k?'stroke-dasharray="8 3"':'')+'/>'+
     '<path transform="translate('+mx+' '+my+') rotate('+angle+')" d="m6 0-10-5 2 5-2 5z" fill="'+colors[k]+'"/>';
   }
  });
  for(const n of all){
   const [a,b]=point(n);
   if(n===x.start_depot){
    svg+='<rect x="'+(a-8)+'" y="'+(b-8)+'" width="16" height="16" rx="3" fill="#30483d" stroke="#fff" stroke-width="2"/>';
   }else{
    svg+='<circle cx="'+a+'" cy="'+b+'" r="7" fill="'+colors[routes.findIndex(r=>r.includes(n))]+'" stroke="white" stroke-width="2"/>';
   }
   const label=n===x.start_depot?'车场':n,up=n!=='v3';
   svg+='<text x="'+a+'" y="'+(b+(up?-13:22))+'" text-anchor="middle" font-size="13" font-weight="700" stroke="#edf1e7" stroke-width="4" paint-order="stroke" fill="#18352c">'+escape(label)+'</text>';
  }
  return svg+'</svg>';
 }
 function routeEditor(routes){
  return routes.map((r,k)=>'<div class="rl-route rl-car-'+k+'"><strong>车辆 '+(k+1)+'</strong><span class="rl-depot">车场</span><span>›</span>'+
   r.map(n=>'<button type="button" data-stop="'+escape(n)+'" aria-label="选取客户 '+escape(n)+' 交换顺序" aria-pressed="'+(n===selectedStop)+'">'+escape(n)+'</button><span>›</span>').join('')+
   '<span class="rl-depot">车场</span></div>').join('');
 }
 function tripTable(x,result){
  return result.trips.map((trip,k)=>{
   const body=trip.stops.map(stop=>{
    const end=stop.id===x.end_depot;
    return '<tr'+(stop.late>eps?' class="rl-late"':'')+'><th scope="row">'+(end?'返场':escape(stop.id))+'</th><td>'+f(stop.arrival,5)+'</td><td>'+f(stop.service,5)+'</td><td>'+f(stop.wait,5)+'</td><td>'+f(x.time_lower[stop.id],5)+' – '+f(x.time_upper[stop.id],5)+'</td></tr>';
   }).join('');
   return '<div class="rl-trip rl-car-'+k+'"><h4>车辆 '+(k+1)+' <small>载量 '+trip.load+' / '+x.vehicle_capacity+' · 能耗 '+f(trip.energy,5)+'</small></h4><div class="rl-table-scroll"><table><thead><tr><th>站点</th><th>抵达</th><th>安排时刻</th><th>等候</th><th>时间窗</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
  }).join('');
 }
 async function mount(container,onInteract){
  if(!container)return;
  try{model=model||prepare(await load());}catch(e){container.textContent='路线试排数据载入失败。';console.error(e);return;}
  if(!container.isConnected)return;
  if(!selection)selection=model.recorded.map(r=>r.slice());
  const m=model,x=m.x;
  function paint(){
   const r=evaluate(x,m.arcs,selection),valid=!r.errors.length;
   const status=!valid?'违反约束':Math.abs(r.energy-m.best.energy)<eps?'可行 · 最低能耗':'可行';
   const message=!valid?r.errors[0]:(Math.abs(r.energy-m.best.energy)<eps?'此分配与访问顺序达到本实例的最低能耗。':'当前能耗比可行最低值高 '+f(r.energy-m.best.energy,5)+'。');
   container.innerHTML='<section class="route-lab" aria-label="配送路线试排"><header><div><h2>试排配送路线</h2><p>点选两个客户交换位置，也可以调整两辆车各送几站。两辆车都从同一车场出发并返回。</p></div></header>'+
    '<div class="rl-columns"><div>'+drawMap(x,selection)+'<div class="rl-map-key"><span>实线 · 车辆 1</span><span>虚线 · 车辆 2</span></div></div>'+
    '<div class="rl-controls">'+routeEditor(selection)+'<label>每车配送站数 <select aria-label="每车配送站数" data-split>'+[1,2,3].map(k=>'<option value="'+k+'"'+(k===selection[0].length?' selected':'')+'>'+k+' 站 / '+(4-k)+' 站</option>').join('')+'</select></label>'+
    '<p class="rl-hint" aria-live="polite">'+(selectedStop?'已选 '+escape(selectedStop)+'，再选一个客户交换。':'可在同车内调序，也可跨车交换客户。')+'</p>'+
    '<div class="rl-presets"><button type="button" data-plan="recorded">实例解</button><button type="button" data-plan="other">另一可行方案</button><button type="button" data-plan="invalid">低能耗超时例</button></div></div></div>'+
    '<div class="rl-result '+(valid?'rl-ok':'rl-bad')+'" role="status"><strong>'+status+'</strong><b>能耗 '+f(r.energy,6)+'</b><span>'+escape(message)+'</span></div>'+
    '<p class="rl-enum">对调两辆车的编号算同一方案。共 '+m.count+' 种分配与顺序，其中 '+m.feasibleCount+' 种满足全部约束，最低能耗为 '+f(m.best.energy,6)+'。</p>'+
    '<details class="rl-detail"><summary>查看两车的到站时间与载量</summary><div class="rl-tables">'+tripTable(x,r)+'</div><p>可行方案按全部弧约束计算安排时刻；两车共用返场时刻，早到可等候。超时方案按各车最早可到时间标出冲突。时间、容量与能耗均沿用实例单位。</p></details></section>';
  }
  function edit(ev){
   const el=ev.target.closest('[data-stop],[data-plan],[data-split]');
   if(!el||el.matches('[data-split]')&&ev.type!=='change'||!el.matches('[data-split]')&&ev.type!=='click')return;
   onInteract?.();
   let focus;
   if(el.dataset.stop){
    const next=el.dataset.stop;
    if(selectedStop&&selectedStop!==next){
     selection=selection.map(route=>route.map(id=>id===next?selectedStop:id===selectedStop?next:id));selectedStop=null;
    }else selectedStop=selectedStop===next?null:next;
    focus='[data-stop="'+next+'"]';
   }else if(el.dataset.plan){
    const opt=el.dataset.plan==='recorded'?m.recorded:m[el.dataset.plan].routes;
    selection=opt.map(r=>r.slice());selectedStop=null;focus='[data-plan="'+el.dataset.plan+'"]';
   }else{
    const k=Number(el.value),all=selection.flat();
    selection=[all.slice(0,k),all.slice(k)];selectedStop=null;focus='[data-split]';
   }
   const details=container.querySelector('details').open;
   paint();container.querySelector('details').open=details;container.querySelector(focus)?.focus({preventScroll:true});
  }
  paint();container.onclick=edit;container.onchange=edit;
 }
 return {mount};
})();
