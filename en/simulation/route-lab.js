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
   if(load>x.vehicle_capacity)errors.push('Vehicle '+(index+1)+' Loading capacity '+load+' Exceed capacity '+x.vehicle_capacity+'. ');
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
     const id=stop.id===x.end_depot?'Return to the parking lot':stop.id;
     errors.push(id+' earliest arrival '+f(stop.arrival,5)+', later than the upper limit '+f(x.time_upper[stop.id],5)+', beyond '+f(stop.late,5)+'. ');
    }
   }
  }
  if(cycle&&!errors.length)errors.push('The time recursion of all arcs forms a positive-length closed loop, and it is impossible to schedule a moment that satisfies all constraints at the same time.');
  if(!cycle)for(const n of nodes){
   if(t[n]>x.time_upper[n]+eps&&!errors.length)errors.push(n+' The time required to satisfy all arcs at the same time '+f(t[n],5)+' exceeds its upper limit '+f(x.time_upper[n],5)+'. ');
  }
  for(let mask=1;mask<2**x.customers.length;mask++){
   const ids=x.customers.filter((_,i)=>mask&(1<<i));
   const minExits=Math.ceil(ids.reduce((sum,n)=>sum+x.demand[n],0)/x.vehicle_capacity);
   const exits=[...arcs].filter(([k,a])=>active.has(k)&&ids.includes(a.from)&&!ids.includes(a.to)).length;
   if(exits<minExits){errors.push('Customer collection '+ids.join(', ')+' At least required '+minExits+' Route arcs leaving this collection.');break;}
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
  let svg='<svg class="rl-map" viewBox="0 0 408 280" role="img" aria-label="The driving direction of both vehicles and the actual customer location"><defs><pattern id="rl-grid" width="17" height="17" patternUnits="userSpaceOnUse"><path d="M17 0H0V17" fill="none" stroke="#b4c5ba" stroke-width=".6"/></pattern></defs><rect width="408" height="280" rx="9" fill="#edf1e7"/><rect width="408" height="280" fill="url(#rl-grid)"/>';
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
   const label=n===x.start_depot?'Vehicle depot':n,up=n!=='v3';
   svg+='<text x="'+a+'" y="'+(b+(up?-13:22))+'" text-anchor="middle" font-size="13" font-weight="700" stroke="#edf1e7" stroke-width="4" paint-order="stroke" fill="#18352c">'+escape(label)+'</text>';
  }
  return svg+'</svg>';
 }
 function routeEditor(routes){
  return routes.map((r,k)=>'<div class="rl-route rl-car-'+k+'"><strong>Vehicle '+(k+1)+'</strong><span class="rl-depot">Vehicle depot</span><span>›</span>'+
   r.map(n=>'<button type="button" data-stop="'+escape(n)+'" aria-label="Select customer '+escape(n)+' Exchange order" aria-pressed="'+(n===selectedStop)+'">'+escape(n)+'</button><span>›</span>').join('')+
   '<span class="rl-depot">Vehicle depot</span></div>').join('');
 }
 function tripTable(x,result){
  return result.trips.map((trip,k)=>{
   const body=trip.stops.map(stop=>{
    const end=stop.id===x.end_depot;
    return '<tr'+(stop.late>eps?' class="rl-late"':'')+'><th scope="row">'+(end?'Return':escape(stop.id))+'</th><td>'+f(stop.arrival,5)+'</td><td>'+f(stop.service,5)+'</td><td>'+f(stop.wait,5)+'</td><td>'+f(x.time_lower[stop.id],5)+' – '+f(x.time_upper[stop.id],5)+'</td></tr>';
   }).join('');
   return '<div class="rl-trip rl-car-'+k+'"><h4>Vehicle '+(k+1)+' <small>Loading capacity '+trip.load+' / '+x.vehicle_capacity+' · Energy consumption '+f(trip.energy,5)+'</small></h4><div class="rl-table-scroll"><table><thead><tr><th>Stop</th><th>Arrives</th><th>Arrange time</th><th>waiting</th><th>time window</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
  }).join('');
 }
 async function mount(container,onInteract){
  if(!container)return;
  try{model=model||prepare(await load());}catch(e){container.textContent='Failed to load route trial data.';console.error(e);return;}
  if(!container.isConnected)return;
  if(!selection)selection=model.recorded.map(r=>r.slice());
  const m=model,x=m.x;
  function paint(){
   const r=evaluate(x,m.arcs,selection),valid=!r.errors.length;
   const status=!valid?'Violation of constraints':Math.abs(r.energy-m.best.energy)<eps?'Feasible · Minimum energy consumption':'Feasible';
   const message=!valid?r.errors[0]:(Math.abs(r.energy-m.best.energy)<eps?'This allocation and access sequence achieves the lowest energy consumption of this instance.':'Current energy consumption is higher than feasible minimum '+f(r.energy-m.best.energy,5)+'. ');
   container.innerHTML='<section class="route-lab" aria-label="Delivery route trial arrangement"><header><div><h2>Trial delivery route</h2><p>Click on two customers to swap locations, or adjust the number of stops each of the two vehicles delivers. Both vehicles depart from and return to the same parking lot. </p></div></header>'+
    '<div class="rl-columns"><div>'+drawMap(x,selection)+'<div class="rl-map-key"><span>solid line · Vehicle 1</span><span>dashed line · Vehicle 2</span></div></div>'+
    '<div class="rl-controls">'+routeEditor(selection)+'<label>Number of delivery stations per vehicle <select aria-label="Number of delivery stations per vehicle" data-split>'+[1,2,3].map(k=>'<option value="'+k+'"'+(k===selection[0].length?' selected':'')+'>'+k+' Station / '+(4-k)+' Station</option>').join('')+'</select></label>'+
    '<p class="rl-hint" aria-live="polite">'+(selectedStop?'Selected '+escape(selectedStop)+', select another customer to exchange.':'The order can be adjusted within the same vehicle, or customers can be exchanged across vehicles.')+'</p>'+
    '<div class="rl-presets"><button type="button" data-plan="recorded">Example solution</button><button type="button" data-plan="other">Another possible solution</button><button type="button" data-plan="invalid">Low energy consumption timeout example</button></div></div></div>'+
    '<div class="rl-result '+(valid?'rl-ok':'rl-bad')+'" role="status"><strong>'+status+'</strong><b>Energy consumption '+f(r.energy,6)+'</b><span>'+escape(message)+'</span></div>'+
    '<p class="rl-enum">Swapping the numbers of two cars counts as the same plan. total '+m.count+' kind of distribution and order, among which '+m.feasibleCount+' satisfies all constraints, and the minimum energy consumption is '+f(m.best.energy,6)+'. </p>'+
    '<details class="rl-detail"><summary>Check the arrival time and capacity of the two vehicles</summary><div class="rl-tables">'+tripTable(x,r)+'</div><p>A feasible solution is to calculate the arrangement time based on all arc constraints; the two vehicles share the return time, so you can wait if you arrive early. The timeout scheme marks conflicts according to the earliest arrival time of each vehicle. Time, capacity, and energy consumption all use instance units.. </p></details></section>';
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
