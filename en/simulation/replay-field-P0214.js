(() => {
'use strict';
const F=window.ORTOPIA_FIELD;
const {W,H,clamp,poly,line,ellipse,box,text,badge,tree,terrain,road,along,truck,person}=F;
const raw={"scenario_ids":["s0","s1","s2","s3"],"scenario_weights":[0.25,0.25,0.25,0.25],"scenario_maintenance_costs":[[7.268499339845507,10.36474216518254,11.0556206843059,10.584559594494872,7.468131132624268,10.7776645837207,12.288566127661896,7.487230695077961,9.15628147513884],[10.960426947545018,12.089657408899207,9.38256155000747,8.563638024068066,5.534198293463975,5.549849141145844,10.30911300789557,8.699491996146374,9.379140479124569],[11.065786863089581,5.214831234787483,11.116607930964967,10.412153292451613,6.55486953495873,5.064135324695243,6.451293286158642,10.938624341550975,10.076556282975705],[13.85973507375256,7.769578797424861,8.342199315154112,8.654026530254214,7.919919037615773,9.234016432739738,9.872428563434262,11.39242644087058,7.556311307709136]],"scenario_recourse_lower_bounds":[11.767351835703074,12.279171735096739,19.689391605699427,14.313833152656295],"optimality_cut_assignment_coefficients":[[2.761254564693901,0.0,0.0,0.0,2.761254564693901,0.0,2.761254564693901,0.0,0.0],[4.029983179974438,0.0,0.0,0.0,4.029983179974438,0.0,4.029983179974438,0.0,0.0],[3.8062176215429013,0.0,0.0,0.0,3.8062176215429013,0.0,3.8062176215429013,0.0,0.0],[3.8005438778309686,0.0,0.0,0.0,3.8005438778309686,0.0,3.8005438778309686,0.0,0.0]],"optimality_cut_rhs":[6.244842706315272,4.2192053751478635,12.076956362613625,6.712745396994358],"reliability_infeasible_schedules":[[{"h":"G1","t":1},{"h":"G2","t":1},{"h":"L1","t":2}],[{"h":"G1","t":1},{"h":"G2","t":1},{"h":"L1","t":3}],[{"h":"G1","t":1},{"h":"G2","t":2},{"h":"L1","t":2}],[{"h":"G1","t":1},{"h":"G2","t":2},{"h":"L1","t":3}],[{"h":"G1","t":1},{"h":"G2","t":3},{"h":"L1","t":2}],[{"h":"G1","t":1},{"h":"G2","t":3},{"h":"L1","t":3}],[{"h":"G1","t":2},{"h":"G2","t":1},{"h":"L1","t":1}],[{"h":"G1","t":2},{"h":"G2","t":1},{"h":"L1","t":2}],[{"h":"G1","t":2},{"h":"G2","t":1},{"h":"L1","t":3}],[{"h":"G1","t":2},{"h":"G2","t":2},{"h":"L1","t":1}],[{"h":"G1","t":2},{"h":"G2","t":2},{"h":"L1","t":2}],[{"h":"G1","t":2},{"h":"G2","t":2},{"h":"L1","t":3}],[{"h":"G1","t":2},{"h":"G2","t":3},{"h":"L1","t":1}],[{"h":"G1","t":2},{"h":"G2","t":3},{"h":"L1","t":2}],[{"h":"G1","t":2},{"h":"G2","t":3},{"h":"L1","t":3}],[{"h":"G1","t":3},{"h":"G2","t":1},{"h":"L1","t":1}],[{"h":"G1","t":3},{"h":"G2","t":1},{"h":"L1","t":2}],[{"h":"G1","t":3},{"h":"G2","t":1},{"h":"L1","t":3}],[{"h":"G1","t":3},{"h":"G2","t":2},{"h":"L1","t":1}],[{"h":"G1","t":3},{"h":"G2","t":2},{"h":"L1","t":2}],[{"h":"G1","t":3},{"h":"G2","t":2},{"h":"L1","t":3}],[{"h":"G1","t":3},{"h":"G2","t":3},{"h":"L1","t":1}],[{"h":"G1","t":3},{"h":"G2","t":3},{"h":"L1","t":2}],[{"h":"G1","t":3},{"h":"G2","t":3},{"h":"L1","t":3}]]};
const assets=['G1','G2','L1'],names=["Unit 1","Unit 2","power lines"],reference=[1,3,1];
const invalid=new Set(raw.reliability_infeasible_schedules.map(row=>assets.map(h=>row.find(v=>v.h===h).t).join('')));
const states=new WeakMap();
const sites=[[305,159],[608,149],[775,282]];
const routes=[
 [[138,330],[190,330],[247,279],[245,202],[285,178]],
 [[148,340],[212,340],[311,264],[482,264],[545,206],[585,173]],
 [[155,350],[221,350],[323,277],[491,277],[581,306],[738,306]]
];
const ink='#294846',green='#357767',orange='#dc8342';
function schedule(plan){
 const coords=plan.map((v,i)=>i*3+v-1);
 const costs=raw.scenario_ids.map((_,i)=>{
  const fixed=coords.reduce((a,k)=>a+raw.scenario_maintenance_costs[i][k],0);
  const cut=coords.reduce((a,k)=>a+raw.optimality_cut_assignment_coefficients[i][k],raw.optimality_cut_rhs[i]);
  return fixed+Math.max(raw.scenario_recourse_lower_bounds[i],cut);
 });
 return {valid:!invalid.has(plan.join('')),cost:costs.reduce((s,v,i)=>s+v*raw.scenario_weights[i],0),costs};
}
function fence(c,a,b,n){
 line(c,[a,b],'#929a88',2);line(c,[[a[0],a[1]-7],[b[0],b[1]-7]],'#9eac9c',1.5);
 for(let i=0;i<=n;i++){let x=a[0]+(b[0]-a[0])*i/n,y=a[1]+(b[1]-a[1])*i/n;line(c,[[x,y+3],[x,y-11]],'#798973',2)}
}
function tower(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,[[0,0],[48,9],[15,-6]],'#6074643b');
 for(const dir of [-1,1]){line(c,[[dir*20,0],[dir*10,-43],[dir*5,-94],[0,-109]],'#51645b',3.5);
 line(c,[[dir*19,-3],[-dir*10,-41],[dir*7,-63],[-dir*5,-84]],'#77877a',2.2)}
 for(const [w,h] of [[25,56],[31,78],[19,94]]){line(c,[[-w,-h],[0,-h-5],[w,-h]],'#52695f',3);for(const dir of [-1,1]){line(c,[[dir*w,-h],[dir*w,-h+8]],'#3d625f',2.5);for(let j=0;j<3;j++)line(c,[[dir*w-2,-h+3+j*2],[dir*w+2,-h+3+j*2]],'#818f86',1)}}
 c.restore();
}
function turbine(c,x,y,id,t,locked,opening){
 box(c,x-65,y+17,116,6,20,['#8fa195','#84958c','#cad1bf']);
 box(c,x-52,y+7,89,32,20,['#708f84','#496e64','#a4b8a4']);
 for(let i=0;i<6;i++){const x0=x-46+i*12;line(c,[[x0,y+3],[x0,y-19]],'#44675e',2)}
 box(c,x-47,y-24,70,9,17,['#76968b','#507766','#b3c7ae']);
 // The hinged housing moves back as the maintenance crew opens it.
 box(c,x-51,y-30-opening*12,64,7,16,['#6e8e80','#607e72','#aec0a7']);
 ellipse(c,x+38,y-17,24,25,'#405d56');ellipse(c,x+38,y-17,20.6,21.7,'#b6c9b7');ellipse(c,x+38,y-17,17.5,18.7,'#45645d');
 for(let j=0;j<6;j++){let a=j*Math.PI/3+(locked?0:t*4);let p=(r,th)=>[x+38+r*Math.cos(th),y-17+r*Math.sin(th)];poly(c,[p(3,a-.2),p(16,a-.27),p(16,a+.28),p(6,a+.45)],'#b4cebc')}
 ellipse(c,x+38,y-17,4.5,4.5,'#dbe4d0');ellipse(c,x-32,y-11,3,3,locked?orange:'#91db87');
 text(c,id,x-33,y-10,11,'#ecf2db');
}
function shop(c){box(c,38,313,115,42,27,['#81958a','#647d73','#c8cfb8']);box(c,35,273,119,5,27,['#59756c','#577165','#a3b5a1']);for(let i=0;i<3;i++){box(c,46+i*35,312,27,28,0,['#4e6861','#4e6861','#4e6861']);for(let j=0;j<4;j++)line(c,[[48+i*35,288+j*5],[70+i*35,288+j*5]],'#7f9988',1.6)}}
let base;
function backdrop(){
 if(base)return base;
 base=F.cachedWorld(c=>{
  terrain(c,214);
  poly(c,[[0,63],[160,36],[274,62],[365,46],[491,25],[593,42],[758,16],[940,42],[940,0],[0,0]],'#bfd0bb');
  for(let i=0;i<40;i++)tree(c,(i*113+18)%950,25+((i*37)%51),.5+(i%3)*.12);
  poly(c,[[17,230],[133,93],[691,59],[913,146],[873,330],[240,396],[25,349]],'#aab6a6');
  poly(c,[[29,229],[139,99],[689,65],[904,148],[866,324],[238,389],[33,345]],'#d5d9c8');
  for(let i=0;i<12;i++)line(c,[[84+i*60,120],[40+i*64,324]],'#a8b7a657',1);
  for(let i=0;i<6;i++)line(c,[[88,132+i*39],[847,119+i*32]],'#a8b7a657',1);
  road(c,[[0,401],[134,340],[218,340],[310,270],[489,270],[583,307],[940,302]],22);
  road(c,[[245,288],[245,204],[303,165]],17);road(c,[[485,270],[546,205],[606,160]],17);
  fence(c,[89,168],[141,103],7);fence(c,[141,103],[690,70],22);fence(c,[690,70],[887,142],9);
  shop(c);tower(c,870,109,.49);
  for(let i=0;i<2;i++){let y=164+i*97;box(c,39,y,34,17,11,['#819485','#5b786b','#bec9b4']);for(let j=0;j<3;j++)line(c,[[45+j*8,y-17],[45+j*8,y-22]],'#5a736c',3)}
  // Switchgear, insulators and the control building form the rear of the yard.
  box(c,391,111,62,18,14,['#81958a','#657f74','#b8c4ae']);
  for(let j=0;j<5;j++)box(c,397+j*11,105,7,5,0,['#44645d','#44645d','#44645d']);
  for(let j=0;j<4;j++){const xx=685+j*20,yy=103+j*.7;
   box(c,xx,yy,10,6,5,['#859687','#657e70','#b8c6b0']);
   line(c,[[xx+5,yy-6],[xx+5,yy-19]],'#667d70',2);
   for(let k=0;k<4;k++)line(c,[[xx+2,yy-8-k*3],[xx+8,yy-8-k*3]],'#6f8578',1.8);
  }
  for(let i=0;i<14;i++)tree(c,358+i*40,373+(i*15%30),.71);
 });return base;
}
function workFrame(c,state,step,sec){
 const t=clamp(sec/6),half=state.focusPeriod||(step===0?1:step===1?2:t<.5?1:2);
 const q=state.focusPeriod||step<2?t:(half===1?t*2:(t-.5)*2);
 backdrop()(c);
 const result=schedule(state.plan);
 for(let i=0;i<3;i++)if(state.plan[i]===half){
  line(c,routes[i],'#965720',5);line(c,routes[i],'#efd58f',2,[9,7]);
 }
 for(let i=0;i<2;i++){
  const active=state.plan[i]===half;
  turbine(c,...sites[i],assets[i],t*8,active&&q>=.52,active?clamp((q-.52)*6):0);
 }
 tower(c,sites[2][0],sites[2][1],1.02);
 for(const k of [-1,0,1]){
  c.beginPath();c.moveTo(868+k*12,70);c.quadraticCurveTo(824+k*10,160,775+k*28,206);c.strokeStyle='#596859';c.lineWidth=1.4;c.stroke();
 }
 for(let i=0;i<3;i++){
  const [x,y]=sites[i],active=state.plan[i]===half;
  if(active){
   const path=routes[i],f=clamp((q-.04)/.39),[cx,cy,angle]=along(path,f);
   truck(c,cx,cy,angle,orange,0,true);
   const end=path.at(-1),walking=clamp((q-.43)/.14);
   if(q>.43){const px=end[0]+(x-20-end[0])*walking,py=end[1]+(y+17-end[1])*walking;
    person(c,px,py,q*12,orange,walking>=1);
    if(walking>=1){line(c,[[px+1,py-10],[px+9,py-15+Math.sin(q*52)*3]],'#68797a',3);ellipse(c,px+9,py-15+Math.sin(q*52)*3,3,2,'#bec9bf')}
    if(i===2&&q>.54){
     const lift=clamp((q-.54)/.26),bx=end[0],by=end[1];let ex=bx+15+lift*15,ey=by-15-lift*65;
     line(c,[[bx,by],[bx-5,by-15-lift*24],[ex,ey]],'#805734',6);
     line(c,[[bx,by],[bx-5,by-15-lift*24],[ex,ey]],'#efaa55',3.3);
     person(c,ex+2,ey-1,q*8,orange,true);box(c,ex-6,ey+1,14,6,3,['#db8f46','#b77534','#f1c278']);
    }
    if(q>.54){for(let j=0;j<3;j++){let xx=x-49+j*26,yy=y+29;poly(c,[[xx,yy],[xx+3,yy-8],[xx+7,yy]],orange);line(c,[[xx+2,yy-3],[xx+5,yy-3]],'#f9e8b4',1.5)}}
   }
  }else{const p=routes[i][0];truck(c,p[0]-14,p[1]+2,0,'#bd9265',0,true)}
  if(!result.valid&&i!==1&&state.plan[i]!==1){
   c.strokeStyle='#af5542';c.lineWidth=2.5;c.setLineDash([7,5]);c.beginPath();c.ellipse(x,y+10,i===2?43:67,19,0,0,Math.PI*2);c.stroke();c.setLineDash([]);
   badge(c,"Missed the first phase of maintenance",x,y+(i===2?-110:-74),'#974a39','#fff9dd',13);
  }
  const label=names[i]+' '+assets[i]+'  ·  '+(state.plan[i]===3?"Suspended":"Period "+state.plan[i]+"");
  badge(c,label,x+(i===2?7:0),y+(i===2?65:55),state.asset===i?'#254d45':'#fbfbed',state.asset===i?'#fffde9':ink);
 }
 badge(c,"Maintenance team",98,372,'#f6f7e9',ink);
 const sub=step>=3?"  · Cost Scenarios"+(step-3):'';
 badge(c,"Period "+half+""+sub,step>=3?108:63,24,'#274f49','#fffff4',16);
 badge(c,!result.valid?"Reliability check failed":q<.43&&state.plan.includes(half)?"Team departure":q<.57&&state.plan.includes(half)?"On-site shutdown":"Maintenance in this period "+state.plan.filter(v=>v===half).length+" item",W-104,24,!result.valid?'#913d32':'#fdf9e8',!result.valid?'#fff6dc':ink,15);
}
function mount(host,onInteract,index,onNode,replayAction){
 let state=states.get(host);if(!state){state={plan:[...reference],asset:0};states.set(host,state)}
 state.focusPeriod=null;
 const ui=F.siteShell(host,'fp-maint',"Joint maintenance site. You can click on the device to select the maintenance cycle.","Click on the field equipment and then select the construction period.");
 const refresh=()=>{
  ui.control.innerHTML="<div class=\"fp-group\"><strong>Select equipment</strong>"+assets.map((a,i)=>'<button data-asset="'+i+'" aria-pressed="'+(state.asset===i)+'">'+a+'</button>').join('')+"</div><div class=\"fp-group\"><strong>arrange</strong>"+["Period 1","Period 2","Suspended during the period"].map((s,i)=>'<button data-period="'+(i+1)+'" aria-pressed="'+(state.plan[state.asset]===i+1)+'">'+s+'</button>').join('')+"</div><button data-reset>Restore original solution</button>";
  const r=schedule(state.plan);
  ui.result.dataset.error=String(!r.valid);ui.result.textContent=r.valid?"Feasible·Expected cost "+r.cost.toFixed(3):"Does not meet instance reliability requirements";
 };
 function pick(i){onInteract?.();state.asset=i;refresh();host.sceneFrame(host.sceneTime||0)}
 sites.forEach(([x,y],i)=>F.hotspot(ui.scene,"Choose"+names[i],x,y-10,()=>pick(i),130,100));
 ui.control.onclick=e=>{let b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-asset')){pick(+b.dataset.asset);return}
  if(b.hasAttribute('data-reset'))state.plan=[...reference];else state.plan[state.asset]=+b.dataset.period;
  refresh();
  const period=b.hasAttribute('data-reset')?1:state.plan[state.asset];
  state.focusPeriod=period<=2?period:(index===1?2:1);
  onInteract?.();if(replayAction)replayAction();else host.sceneFrame(0);
 };
 host.sceneFrame=sec=>workFrame(ui.c,state,index,sec);
 host.previewDecision=option=>{state.focusPeriod=null;state.plan=option===1?[1,1,1]:option===2?[1,2,1]:[...reference];refresh();host.sceneFrame(host.sceneTime||0)};
 refresh();host.sceneFrame(host.sceneTime||0);
}
window.ORTOPIA_FIELD_P0214={mount};
})();
