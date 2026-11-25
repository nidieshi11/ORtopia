/* The same node dispatch drives the turbine, battery inventory, and metered power. */
window.ORTOPIA_ENERGY_WORLD=(()=>{
 'use strict';
 const {W,H,poly,line,ellipse,box,person,tree,terrain,road,along,clamp,cachedWorld}=window.ORTOPIA_FIELD;
 const tau=Math.PI*2;
 const colors={wind:'#1caaa3',thermal:'#e48142',battery:'#a6c12d',sale:'#3e84e2'};
 const routes={
  wind:[[150,185],[235,210],[274,187],[448,187],[512,225]],
  thermal:[[382,290],[416,308],[505,255],[512,225]],
  battery:[[512,225],[554,203],[554,170],[590,150]],
  sale:[[512,225],[607,278],[735,204],[777,228]]
 };
 const steel=['#56818a','#385967','#a4b8b3'], ivory=['#d4d2be','#9ba795','#f4ebd0'];
 function ground(c){
  terrain(c,78);
  poly(c,[[0,26],[141,7],[230,23],[330,0],[497,0],[615,22],[778,0],[940,0],[940,49],[0,80]],'#a9c3ab');
  poly(c,[[0,64],[194,39],[271,52],[413,39],[544,57],[661,38],[785,46],[940,25],[940,41],[790,64],[684,58],[537,76],[411,56],[270,69],[190,58],[0,89]],'#86adaa');
  for(let i=0;i<48;i++){const x=(i*113)%955,y=33+(i*17)%29;tree(c,x,y,.31+(i%3)*.09);}
  road(c,[[-35,286],[139,208],[314,315],[475,401],[531,427]],17);
  road(c,[[431,379],[604,283],[786,380],[950,293]],13);
  road(c,[[594,280],[670,237],[648,224]],10,false);
  for(const pts of [[[43,172],[146,115],[254,172],[151,232]],[[240,273],[352,205],[471,268],[351,345]],[[527,146],[586,112],[658,151],[597,188]],[[708,223],[789,176],[874,220],[800,268]]]){
   poly(c,pts,'#b0bbab','#95a499',2);
  }
 }
 const base=cachedWorld(ground);
 function turbine(c,x,y,k,time,wind){
  c.save();c.translate(x,y);c.scale(k,k);
  ellipse(c,9,3,23,5,'#455b532c');poly(c,[[-4,0],[-2,-70],[2,-70],[5,0]],'#eae5cf','#71928e');
  box(c,-6,-66,12,7,4,ivory);
  c.translate(0,-70); c.rotate(time*(.45+wind*.18)+x);
  for(let i=0;i<3;i++){c.rotate(tau/3);poly(c,[[0,1],[5,-8],[3,-24],[0,-46],[-2,-31],[-2,-6]],'#f5f1da','#759391');}
  ellipse(c,0,0,4,4,'#557a78');c.restore();
 }
 function conductor(c,path,mw,max,color,time){
  line(c,path,'#516567',7);line(c,path,'#9daea7',3.4);
  if(mw<.002)return;
  const width=1.4+3*clamp(mw/max);
  line(c,path,color,width);
  const count=Math.max(1,Math.ceil(9*mw/max));
  for(let i=0;i<count;i++){
   const f=(i/count+time*(.17+mw/max*.17))%1;
   const [x,y,a]=along(path,f);
   c.save();c.translate(x,y);c.rotate(a);
   line(c,[[-6,0],[2,0]],'#fffcdf',width+1);
   line(c,[[-2,-3],[2,0],[-2,3]],'#fffcdf',1.6);c.restore();
  }
 }
 function machine(c,d,t){
  const x=278,y=275;
  box(c,x+5,y+6,116,55,32,steel);
  for(let j=0;j<2;j++){
   const sx=x+23+72*j,sy=y-56;
   poly(c,[[sx-6,sy],[sx-4,sy-51],[sx+3,sy-51],[sx+6,sy]],'#bdb9a7','#75837d');
   c.fillStyle='#bb7655';c.fillRect(sx-4,sy-44,8,9);ellipse(c,sx-.5,sy-51,4.5,1.5,'#596767');
   if(d.gen>.01)for(let k=0;k<7;k++){
    const f=(k/7+t*(.16+d.gen*.009))%1;
    ellipse(c,sx+f*21,sy-54-f*35,3+7*f,2+5*f,'rgba(244,238,211,'+(.5*(1-f))+')');
   }
  }
  box(c,x-4,y+13,127,10,34,['#b8a88d','#8d9789','#d3d0b6']);
  c.fillStyle='#254448';c.fillRect(x+13,y-37,96,40);
  const wheel=(cx,cy,r)=>{
   ellipse(c,cx,cy,r+3,r+3,'#91a69e');ellipse(c,cx,cy,r,r,'#3c6166');
   c.save();c.translate(cx,cy);c.rotate(d.gen>.02?t*(1.7+d.gen*.52):0);
   for(let i=0;i<7;i++){c.rotate(tau/7);poly(c,[[1,0],[r*.7,-4],[r,1],[r*.68,4]],'#dae2cc');}
   c.restore();ellipse(c,cx,cy,3.7,3.7,'#d8a75e');
  };
  wheel(x+63,y-17,14);wheel(x+91,y-17,10);
  c.fillStyle='#293d3c';c.fillRect(x+18,y-32,24,31);
  if(d.gen>.02)for(let i=0;i<5;i++){
   const h=10+(i%2)*5+5*Math.sin(t*7+i*2)+d.gen*.3;
   poly(c,[[x+19+i*4,y-3],[x+20+i*4,y-h],[x+25+i*4,y-3]],i%2?'#ffc35b':'#e77d3d');
  }
  for(let j=0;j<4;j++)line(c,[[x+13+27*j,y-39],[x+13+27*j,y+3]],'#aebeb2',2);
  line(c,[[x+10,y-42],[x+112,y-42]],'#e0d0a0',3);
  ellipse(c,x+113,y-24,3.5,3.5,d.on?'#bfdf68':'#78857e');
  person(c,x+137,y+13,0,'#de9850',false);
 }
 function battery(c,d,prev,t,capacity){
  const soc=prev+(d.stored-prev)*clamp(t/6);
  for(let i=0;i<3;i++){
   const x=549+i*22,y=143+i*2;
   box(c,x,y,19,26,12,['#456c69','#345955','#cedcc3']);
   for(let j=0;j<5;j++){
    c.fillStyle=j+.4<clamp(soc/capacity)*5?'#bbda59':'#728981';
    c.fillRect(x+3,y-6-j*4,13,2.8);
   }
  }
 }
 function switchyard(c,d,t){
  for(let i=0;i<3;i++){
   const x=744+i*20,y=208+i*3;
   box(c,x,y,13,14,9,steel);
   for(let k=0;k<2;k++){
    line(c,[[x+4+k*7,y-14],[x+4+k*7,y-31]],'#536968',2);
    for(let h=0;h<3;h++)ellipse(c,x+4+k*7,y-20-h*3,3.2,1.3,'#a9bbc0');
   }
  }
  for(const [x,y] of [[822,219],[900,166]]){
   line(c,[[x-8,y],[x,y-68],[x+8,y]],'#50676a',2.5);
   line(c,[[x-4,y-31],[x+5,y-13],[x-7,y-9],[x+3,y-37]],'#74898a',1.5);
   line(c,[[x-14,y-46],[x+14,y-46]],'#5b7475',2.8);
  }
  for(let j=0;j<2;j++)line(c,[[809+j*23,174],[833+j*23,169],[858+j*23,148],[887+j*23,121]],'#667e7d',1.3);
  box(c,801,249,27,24,8,ivory);
  c.fillStyle='#254c51';c.fillRect(805,228,19,11);
  const active=Math.min(5,Math.round(5*clamp(d.sale/18)));
  for(let j=0;j<active;j++){c.fillStyle='#84d8bd';c.fillRect(807+j*3,236-j,2,1+j);}
 }
 function create(element){
  const canvas=document.createElement('canvas');canvas.width=W*1.5;canvas.height=H*1.5;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label','风机、火电炉、储能电池和并网变电站。流动箭头表示当前节点的功率方向和大小。');
  element.prepend(canvas);
  const c=canvas.getContext('2d');c.scale(1.5,1.5);
  return (d,previous,t,capacity)=>{
   c.clearRect(0,0,W,H);
   base(c);
   conductor(c,routes.wind,d.wind,8,colors.wind,t);
   conductor(c,routes.thermal,d.gen,16,colors.thermal,t);
   conductor(c,d.dis>d.ch?[...routes.battery].reverse():routes.battery,Math.abs(d.ch-d.dis),2.4,colors.battery,t);
   conductor(c,routes.sale,d.sale,20,colors.sale,t);
   turbine(c,118,152,.54,t,d.wind);turbine(c,183,149,.78,t,d.wind);turbine(c,135,181,1,t,d.wind);
   machine(c,d,t);battery(c,d,previous,t,capacity);switchyard(c,d,t);
   ellipse(c,512,225,12,7,'#567170');ellipse(c,512,222,9,5,'#e7ecce');
  };
 }
 return {create};
})();
