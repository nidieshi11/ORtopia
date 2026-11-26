'use strict';
window.ORTOPIA_MARKETING_LAB=(()=>{
 const data=window.ORTOPIA_MARKETING_DATA;
 const names=["Email","Push notification","Coupon"],colors=['#007768','#af592f','#6950a3'];
 const dot=(a,b)=>a.reduce((sum,v,k)=>sum+v*b[k],0);
 const fmt=(n,d=4)=>Number(n.toFixed(d)).toLocaleString('en-US',{maximumFractionDigits:d});
 const states=new WeakMap(),tol=1e-7;
 function score(plan){
  const rules=data.rules.map(r=>{
   const value=dot(r.coeff,plan),slack=r.op==='≤'?r.bound-value:value-r.bound;
   return {...r,value,slack};
  });
  return {value:dot(data.revenue,plan),rules,broken:rules.filter(r=>r.slack < -tol)};
 }
 // Solve max c*x subject to Ax<=b, x>=0. A phase-I artificial column provides a
 // feasible basis when some b are negative. Bland's ordering resolves degenerate ties.
 function maximize(A,b,c){
  const m=b.length,n=c.length,last=n+1,eps=1e-9;
  const basic=Array.from({length:m},(_,i)=>n+i),free=Array.from({length:n+1},(_,i)=>i);
  free[n]=-1;
  const t=Array.from({length:m+2},()=>new Float64Array(n+2));
  for(let i=0;i<m;i++){t[i].set(A[i]);t[i][n]=-1;t[i][last]=b[i];}
  c.forEach((v,j)=>{t[m][j]=-v;});t[m+1][n]=1;
  function pivot(row,col){
   const factor=t[row][col];
   for(let i=0;i<m+2;i++)if(i!==row){
    const ratio=t[i][col]/factor;
    if(ratio!==0)for(let j=0;j<n+2;j++)if(j!==col)t[i][j]-=ratio*t[row][j];
    t[i][col]=-ratio;
   }
   for(let j=0;j<n+2;j++)if(j!==col)t[row][j]/=factor;
   t[row][col]=1/factor;
   [basic[row],free[col]]=[free[col],basic[row]];
  }
  function phase(objective){
   for(let iter=0;iter<15000;iter++){
    let col=-1,row=-1;
    for(let j=0;j<=n;j++)if(!(objective===m && free[j]===-1) && t[objective][j]<-eps && (col<0||free[j]<free[col]))col=j;
    if(col<0)return;
    for(let i=0;i<m;i++)if(t[i][col]>eps){
     const ratio=t[i][last]/t[i][col],best=row<0?Infinity:t[row][last]/t[row][col];
     if(ratio<best-eps || (Math.abs(ratio-best)<=eps && basic[i]<basic[row]))row=i;
    }
    if(row<0)throw Error('bounded allocation LP has an unbounded direction');
    pivot(row,col);
   }
   throw Error('LP iteration limit');
  }
  let row=b.indexOf(Math.min(...b));
  if(b[row]<-eps){
   pivot(row,n);phase(m+1);
   if(t[m+1][last]<-eps)return null;
   row=basic.indexOf(-1);
   if(row>=0){
    let col=-1;
    for(let j=0;j<=n;j++)if(Math.abs(t[row][j])>eps && (col<0||free[j]<free[col]))col=j;
    if(col>=0)pivot(row,col);
   }
  }
  phase(m);
  const x=Array(n).fill(0);
  basic.forEach((v,i)=>{if(v>=0&&v<n)x[v]=t[i][last];});return x;
 }
 function repair(plan,client){
  const fixed=[client*3,client*3+1,client*3+2];
  const free=data.revenue.map((_,i)=>i).filter(i=>!fixed.includes(i));
  const A=[],b=[];
  for(const rule of data.rules){
   const sign=rule.op==='≤'?1:-1;
   A.push(free.map(i=>sign*rule.coeff[i]));
   b.push(sign*(rule.bound-fixed.reduce((sum,i)=>sum+plan[i]*rule.coeff[i],0)));
  }
  free.forEach((v,k)=>{const bound=free.map((_,i)=>i===k?1:0);A.push(bound);b.push(1);});
  const sol=maximize(A,b,free.map(i=>data.revenue[i]));
  if(!sol)return null;
  const out=plan.slice();
  free.forEach((idx,k)=>out[idx]=Math.max(0,Math.min(1,sol[k])));
  if(score(out).broken.length || sol.some(v=>v< -tol || v>1+tol))throw Error('allocation solution failed residual check');
  return out;
 }
 const icon=[
  '<rect x="-14" y="-10" width="28" height="20" rx="3"/><path d="m-13-8 13 10L13-8"/>',
  '<rect x="-9" y="-14" width="18" height="28" rx="4"/><path d="M-3 9h6m-15-14-4 2m27-2 4 2"/>',
  '<path d="M-14-9h28v6q-6 3 0 6v6h-28V3q6-3 0-6z"/><path d="m-2 4 6-8"/>'
 ];
 function scene(state){
  const label=data.clients[state.client],offset=state.client*3;
  const group=Object.entries(data.groups).find(([,ids])=>ids.includes(label))[0];
  const person='<circle cx="83" cy="91" r="17" fill="#dfb393"/><path d="M67 88q2-28 22-16 9 3 11 16l-8-8-5 4-6-4-13 10z" fill="#53463e"/><path d="M52 128q3-23 30-24 28 0 34 24" fill="#527e70"/>';
  const rowVals=names.map((v,k)=>state.x[offset+k]);
  const lines=names.map((name,j)=>{
   const y=47+j*61,v=rowVals[j],end=365,path='M169 105 C240 105 267 '+y+' '+end+' '+y;
   const wide=Math.max(1.4,v*21);
   const gsum=data.groups[group].reduce((acc,id)=>acc+state.x[data.clients.indexOf(id)*3+j],0);
   return '<path d="'+path+'" fill="none" stroke="'+colors[j]+'" opacity="'+(v>.00001?.56:.23)+'" stroke-width="'+wide+'" '+(v<.00001?'stroke-dasharray="3 6"':'')+'/><path class="mk-flow-curve" d="'+path+'" fill="none" stroke="none"/>'+
    (v>1e-6?'<circle class="mk-dot" data-channel="'+j+'" r="'+(2.8+v*3.3)+'" fill="'+colors[j]+'" stroke="#fff9ea" stroke-width="1.3"/>':'')+
    '<g class="mk-channel-target" role="button" tabindex="0" data-mk-channel="'+j+"\" aria-label=\"Assign customer "+label+" All shares of"+name+"\"><title>trial investment 100% "+name+'</title><rect x="363" y="'+(y-23)+'" rx="9" width="176" height="46" fill="#fefdf5" stroke="'+colors[j]+'" stroke-width="1.2"/><g transform="translate(385 '+y+') scale(.73)" stroke="'+colors[j]+'" fill="none" stroke-width="2">'+icon[j]+'</g><text x="403" y="'+(y-2)+'" font-weight="700">'+name+'</text><text x="528" y="'+(y-2)+'" font-weight="700" text-anchor="end">'+fmt(v*100,1)+'%</text><text x="403" y="'+(y+14)+'" font-size="10.5" fill="#617266">'+group+"Group cumulative "+fmt(gsum,3)+" portion</text></g>";
  }).join('');
  return "<svg class=\"mk-flow\" viewBox=\"0 0 558 211\" role=\"group\" aria-label=\"Customer "+label+" of marketing spend goes to emails, push notifications and coupons\"><rect width=\"558\" height=\"211\" rx=\"14\" fill=\"#e8eae1\"/><path d=\"M0 166q132-15 280 7t278-26v64H0z\" fill=\"#d7dfd0\"/><g stroke=\"#cad3c6\" stroke-width=\".9\"><path d=\"M0 179h556m-556 19h558M42 172l-13 40m121-39-8 39m140-38 3 38m129-44 11 44\"/></g><rect x=\"16\" y=\"48\" width=\"151\" height=\"116\" rx=\"13\" fill=\"#fefdf5\" stroke=\"#9aaf9e\"/>"+person+"<text x=\"91\" y=\"69\" font-size=\"11\" text-anchor=\"middle\" fill=\"#546c60\">customer group "+group+"</text><text x=\"88\" y=\"151\" text-anchor=\"middle\" font-weight=\"700\">Customer "+label+'</text><circle cx="167" cy="105" r="5" fill="#355a4e"/>'+lines+'</svg>';
 }
 function updateMotion(host,t){
  const svg=host.querySelector('.mk-flow');
  if(!svg)return;
  const curves=svg.querySelectorAll('.mk-flow-curve');
  for(const dot of svg.querySelectorAll('.mk-dot')){
   const j=Number(dot.dataset.channel),s=(t/2.35+.12+j*.23)%1;
   const pt=curves[j].getPointAtLength(s*curves[j].getTotalLength());
   dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);
  }
 }
 function controls(state){
  const idx=state.client,cid=data.clients[idx];
  const list=Object.entries(data.groups).map(([key,customers])=>'<div class="mk-cohort"><strong>'+key+" Group</strong><div>"+customers.map(client=>{
   const k=data.clients.indexOf(client);
   return '<button type="button" data-mk-client="'+k+'" aria-pressed="'+(idx===k)+'"><span>'+client+'</span><i class="mk-distribution"></i></button>';
  }).join('')+'</div></div>').join('');
  const book="<div class=\"mk-portfolio\"><h3>Channel share of all customers</h3><div class=\"mk-key\">"+names.map((name,i)=>'<span style="--swatch:'+colors[i]+'">'+name+'</span>').join('')+"<span style=\"--swatch:#dde3d9\">Not assigned</span></div><div class=\"mk-customers\" role=\"group\" aria-label=\"Select a customer to view channel share\">"+list+'</div><p class="mk-portfolio-note"></p></div>';
  return "<div class=\"mk-body\"><div class=\"mk-left\"><div class=\"mk-diagram\"></div><p class=\"mk-hint\">Click on the channel card to try out 100%, Drag the slider to split shares.</p><div class=\"mk-edit\"><div><h3>adjust "+cid+" share</h3><span data-mk-remaining></span></div>"+
   names.map((n,j)=>'<label class="mk-slider"><span>'+n+'</span><input type="range" min="0" max="100" step="0.1" data-mk-slider="'+j+'" aria-label="'+cid+' '+n+"Allocation percentage\" style=\"--ink:"+colors[j]+"\"><output></output><small>unit income "+fmt(data.revenue[idx*3+j],3)+'</small></label>').join('')+
   '</div></div><div class="mk-right"><div class="mk-readout"></div>'+book+'<div class="mk-budget"></div></div></div>';
 }
 function resultSummary(result){
  const delta=result.value-data.objective;
  return "<div class=\"mk-kpi\"><span>12 Estimated total revenue for customers</span><strong>"+fmt(result.value,5)+"</strong><small>Example solution "+fmt(data.objective,5)+" · change "+(delta>tol?'+':'')+fmt(delta,5)+'</small></div>'+
   '<strong class="mk-state '+(result.broken.length?'mk-bad':'mk-ok')+'">'+(result.broken.length?"violate "+result.broken.length+" item constraint":"The solution is feasible")+'</strong>';
 }
 function renderRules(host,result){
  const groups=[...new Set(result.rules.map(r=>r.family))];
  const details=host.querySelector('.mk-budget');
  const prior=details.querySelector('details')?.open||false;
  const selected=details.querySelector('select')?.value||"Violations take priority";
  const fmtRule=r=>'<tr class="'+(r.slack< -tol?'mk-invalid':'')+'"><td>'+r.label+'</td><td>'+fmt(r.value,4)+'</td><td>'+r.op+' '+fmt(r.bound,4)+'</td></tr>';
  const rules=selected==="Violations take priority"?(result.broken.length?result.broken:result.rules.slice().sort((a,b)=>a.slack-b.slack).slice(0,4)):result.rules.filter(r=>r.family===selected);
  const top=result.broken.slice().sort((a,b)=>a.slack-b.slack)[0];
  const explanation=top?top.label+" current "+fmt(top.value,4)+", request "+top.op+' '+fmt(top.bound,4)+'。':"Customer group channel quotas, budgets, inter-group equity and individual shares are all met.";
  details.innerHTML='<p class="mk-check-note">'+explanation+'</p><div class="mk-families">'+groups.map(g=>{
   const n=result.rules.filter(r=>r.family===g&&r.slack< -tol).length;return '<span class="'+(n?'mk-issue':'')+'">'+g+' '+(n?'×'+n:'✓')+'</span>';
  }).join('')+'</div><details'+(prior?' open':'')+"><summary>Check constraint values</summary><label>show <select data-mk-rules>"+["Violations take priority",...groups].map(k=>'<option'+(k===selected?' selected':'')+'>'+k+'</option>').join('')+"</select></label><table><thead><tr><th>Conditions</th><th>current</th><th>limit</th></tr></thead><tbody>"+rules.map(fmtRule).join('')+'</tbody></table></details>';
 }
 function paint(host,state){
  host.querySelector('.mk-diagram').innerHTML=scene(state);
  updateMotion(host,host.sceneTime||0);
  const row=state.x.slice(state.client*3,state.client*3+3);
  host.querySelectorAll('[data-mk-slider]').forEach((el,j)=>{
   el.value=String(row[j]*100);el.parentElement.querySelector('output').value=fmt(row[j]*100,2)+'%';
  });
  const sum=row.reduce((a,b)=>a+b,0);
  host.querySelector('[data-mk-remaining]').textContent="Not assigned "+fmt(Math.max(0,1-sum)*100,2)+'%';
  const result=score(state.x);
  host.querySelector('.mk-readout').innerHTML=resultSummary(result);
  host.querySelectorAll('[data-mk-client]').forEach(b=>{
   const i=Number(b.dataset.mkClient)*3,changed=state.x.slice(i,i+3).some((v,j)=>Math.abs(v-data.recorded[i+j])>tol);
   const recent=(state.recent||[]).includes(i/3);
   b.classList.toggle('mk-changed',changed);b.classList.toggle('mk-reallocated',recent);
   const shares=state.x.slice(i,i+3);
   const allocation=shares.map((v,j)=>names[j]+' '+fmt(v*100,1)+'%').join('，');
   const readable="Customer "+data.clients[i/3]+'，'+allocation+(recent?", this joint debugging change":changed?", different from the example solution":'');
   b.setAttribute('aria-label',readable);b.title=readable;
   b.querySelector('.mk-distribution').innerHTML=shares.map((v,j)=>'<i style="width:'+Math.max(0,v*100)+'%;background:'+colors[j]+'"></i>').join('');
  });
  const count=(state.recent||[]).length;
  host.querySelector('.mk-portfolio-note').textContent=count?"stroked "+count+" Customers changed their shares during this joint survey.":"Dot customers can adjust the share; dots indicate differences from the example solution.";
  renderRules(host,result);
  host.querySelector('.mk-status').textContent=state.message;
 }
 function mount(host,onInteract,index=0,onSelectStep){
  let state=states.get(host);
  if(!state){state={x:data.recorded.slice(),client:index,message:"Try \"modify this customer only\" first, then lock this customer and redistribute the shares to others."};states.set(host,state);}
  state.client=index;
  const layout=()=>{
   host.innerHTML="<section class=\"mk-lab\" aria-label=\"Customer and marketing channel allocation operation desk\"><header><h2>Marketing channel launch platform</h2><p>Assign 12 The distribution share of each customer is divided among the three channels to increase overall revenue while meeting customer group quotas, budgets and fairness requirements. Shares per customer can be found at 0% to 100% Continuous adjustment between.</p></header>"+
    controls(state)+"<div class=\"mk-actions\"><button type=\"button\" data-mk-action=\"example\">Only change this customer</button><button type=\"button\" data-mk-action=\"repair\">Lock this customer and coordinate with others 11 people</button><button type=\"button\" data-mk-action=\"greedy\">Everyone chooses the highest profit</button><button type=\"button\" data-mk-action=\"reset\">Restore instance solution</button></div><p class=\"mk-status\" role=\"status\"></p></section>";
   paint(host,state);
  };
  layout();
  host.sceneFrame=seconds=>updateMotion(host,seconds);
  host.previewDecision=opt=>{
   state.x=data.recorded.slice();state.recent=[];
   if(opt){
    const choice=window.ORTOPIA_REPLAY_LOGIC.P0045[state.client].comparison.options[opt];
    const j=data.channels.indexOf(choice.channel);
    if(j>=0){state.x.splice(state.client*3,3,...names.map((_,k)=>Number(k===j)));}
   }
   state.message=opt?"The control allocation has been loaded, and other customers maintain the instance solution.":"Viewing the example solution in the data file.";
   paint(host,state);
  };
  host.marketingSnapshot=()=>({client:data.clients[state.client],x:state.x.slice(),value:dot(data.revenue,state.x),violations:score(state.x).broken.length});
  const region=host.querySelector('.mk-lab');
  region.onclick=event=>{
   const channel=event.target.closest('[data-mk-channel]');
   if(channel){
    onInteract?.();const j=Number(channel.dataset.mkChannel);
    state.x.splice(state.client*3,3,...names.map((_,k)=>Number(k===j)));state.recent=[];
    state.message="Already "+data.clients[state.client]+" All shares of"+names[j]+'。';
    paint(host,state);host.querySelector('[data-mk-channel="'+j+'"]').focus({preventScroll:true});return;
   }
   const button=event.target.closest('button');
   if(!button)return;
   onInteract?.();
   if(button.hasAttribute('data-mk-client')){
    const next=Number(button.dataset.mkClient);
    if(next!==state.client){
     if(onSelectStep){onSelectStep(next);return;}
     mount(host,onInteract,next,onSelectStep);
    }
    return;
   }
   const action=button.dataset.mkAction,idx=state.client;state.recent=[];
   if(action==='example'){
    state.x=data.recorded.slice();state.x.splice(idx*3,3,...data.trials[idx].shares);
    state.message="Starting from the example solution, only change "+data.clients[idx]+" Allocation for one person. Please check the customer group constraints and try joint debugging again.";
   }else if(action==='repair'){
    const before=state.x.slice();let x;
    try{x=repair(before,idx);}catch(e){state.message="Numerical calculations failed to verify a valid solution and the current assignment has been retained.";paint(host,state);return;}
    if(!x){state.message="After locking these shares, the global constraint has no feasible solution. Please adjust the customer's share first before joint debugging.";}
    else{
     const changed=data.clients.filter((v,k)=>k!==idx&&x.slice(k*3,k*3+3).some((t,j)=>Math.abs(t-before[k*3+j])>tol));
     state.x=x;state.recent=changed.map(id=>data.clients.indexOf(id));
     state.message="locked "+data.clients[idx]+", re-maximizing returns according to the original linear model."+(changed.length?"adjusted "+changed.length+" Person:"+changed.join('、')+'。':"The remaining customers are already feasible optimal allocations.");
    }
   }else if(action==='greedy'){
    state.x.fill(0);
    data.clients.forEach((_,k)=>{const v=data.revenue.slice(k*3,k*3+3);state.x[k*3+v.indexOf(Math.max(...v))]=1;});
    state.message="Each person only chooses the channel with the highest personal unit income. Check the total revenue of the activity and the customer group constraints, and then decide whether this kind of investment can be implemented.";
   }else if(action==='reset'){
    state.x=data.recorded.slice();state.message="The instance solution that passed the verification has been restored.";
   }
   paint(host,state);
  };
  region.onkeydown=event=>{
   if(event.target.hasAttribute('data-mk-channel') && (event.key==='Enter'||event.key===' ')){
    event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));
   }
  };
  region.oninput=event=>{
   const input=event.target;if(!input.matches('[data-mk-slider]'))return;
   onInteract?.();
   state.recent=[];
   const offset=state.client*3,j=Number(input.dataset.mkSlider),value=Number(input.value)/100;
   const others=[0,1,2].filter(k=>k!==j);
   const available=1-value,sum=others.reduce((s,k)=>s+state.x[offset+k],0);
   if(sum>available+1e-12)others.forEach(k=>state.x[offset+k]*=available/sum);
   state.x[offset+j]=value;
   state.message="Modified "+data.clients[state.client]+". When the total share exceeds 100%, the other two items are reduced according to the original proportion; they can be left blank after the share is reduced.";
   paint(host,state);
  };
  region.onchange=event=>{if(event.target.matches('[data-mk-rules]')){onInteract?.();renderRules(host,score(state.x));host.querySelector('[data-mk-rules]').focus({preventScroll:true});}};
 }
 return {mount};
})();
