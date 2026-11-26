/* On-road DeeP control of two mixed-vehicle subsystems, medium/I001. */
(() => {
'use strict';
const W = 900, H = 340;
const lead = {label:"Pilot car",base:'#a5612d',light:'#efd1a4',dark:'#65391c'};
const cav = {label:"Connected car",base:'#156558',light:'#bef0d1',dark:'#11463e'};
const human = {label:"Manual car",base:'#45658d',light:'#cbdceb',dark:'#263d57'};
const clamp = (x,a,b) => Math.max(a, Math.min(b,x));
const lerp = (a,b,f) => a+(b-a)*f;
const signed = (x,n) => (x>0?'+':'')+x.toFixed(n);
function line(c,x,y,x2,y2,color,width=1){
  c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function label(c,s,x,y,color,size,weight=600,align='left'){
  c.font=weight+' '+size+'px "Microsoft YaHei",system-ui,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);
}
function poly(c,vertices,color){
  c.beginPath();vertices.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();
}
function capsule(c,x,y,w,h,r,color){
  c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();
}
function sedan(c,x,y,paint,kind,selected) {
  c.save();c.translate(x,y);
  if(selected){
    const bloom=c.createRadialGradient(0,0,15,0,0,38);
    bloom.addColorStop(0,'#b1ffab77');bloom.addColorStop(1,'#bbffcc00');
    c.fillStyle=bloom;c.fillRect(-39,-39,78,78);
  }
  const w=kind===1?42:kind===2?35:39,h=kind===1?17:15;
  c.shadowColor='rgba(20,28,28,.50)';c.shadowBlur=2;c.shadowOffsetX=3;c.shadowOffsetY=3;
  const shell=c.createLinearGradient(0,-h/2,0,h/2);
  shell.addColorStop(0,paint.dark);shell.addColorStop(.13,paint.base);shell.addColorStop(.46,paint.light);
  shell.addColorStop(.72,paint.base);shell.addColorStop(1,paint.dark);
  capsule(c,-w/2,-h/2,w,h,[5,6,6,5],shell);
  c.shadowBlur=0;c.shadowOffsetY=0;c.shadowOffsetX=0;
  for(const side of [-1,1]){
    capsule(c,-12,side*h/2-1,5,2,1,'#1d2525');capsule(c,8,side*h/2-1,6,2,1,'#1d2525');
    line(c,5,side*5,6.8,side*9,paint.dark,1.8);
  }
  poly(c,[[-12,-5],[-9,-6],[-9,6],[-12,5]],'#4a626a');
  const glazing=c.createLinearGradient(2,-6,8,6);glazing.addColorStop(0,'#d2e6e6');glazing.addColorStop(.45,'#719497');glazing.addColorStop(1,'#374c56');
  poly(c,[[4,-6],[9,-5],[9,5],[4,6]],glazing);
  capsule(c,-8,-5.8,11.2,11.6,2,paint.base);line(c,-7,-4.4,2,-4.4,paint.light,.8);
  for(const side of [-1,1]){line(c,w/2-2,side*5.6,w/2,side*3,'#ffeccd',1.7);line(c,-w/2+1,side*5.5,-w/2+1,side*3,'#ed755e',1.7);}
  if(selected){
    const v=26;for(const side of [-1,1]){
      line(c,side*v,-11,side*v,-5,'#c7f5a1',1.5);line(c,side*v,-11,side*(v-5),-11,'#c7f5a1',1.5);
      line(c,side*v,11,side*v,5,'#c7f5a1',1.5);line(c,side*v,11,side*(v-5),11,'#c7f5a1',1.5);
    }
  }
  c.restore();
}
let asphalt;
function grain(){
  if(asphalt)return asphalt;
  const texture=document.createElement('canvas');texture.width=texture.height=128;
  const cx=texture.getContext('2d'),pixels=cx.createImageData(128,128);
  let seed=10442;
  for(let k=0;k<pixels.data.length;k+=4){
    seed=(1664525*seed+1013904223)>>>0;
    const v=(seed>>>27)*3+65;
    pixels.data[k]=v;pixels.data[k+1]=v+1;pixels.data[k+2]=v;pixels.data[k+3]=74;
  }
  cx.putImageData(pixels,0,0);asphalt=texture;return texture;
}
function road(c,travel,lane,t){
    c.fillStyle='#c9c7b6';c.fillRect(0,0,W,H);
    const firstBlock=Math.floor(travel/160);
    for(let i=firstBlock-1;i<firstBlock+8;i++){
      const x=i*160-travel,roof=(i%2===0?'#b5a58d':'#aab4ae');
      c.shadowColor='#313d3f55';c.shadowOffsetX=6;c.shadowOffsetY=8;c.shadowBlur=3;
      capsule(c,x,0,103,58,2,roof);c.shadowOffsetX=0;c.shadowOffsetY=0;c.shadowBlur=0;
      c.strokeStyle='#e4dbcb';c.lineWidth=2;c.strokeRect(x+3,2,97,52);
      if(i%3===0){
        const roofTiles=c.createLinearGradient(x,0,x+50,24);
        roofTiles.addColorStop(0,'#ae8065');roofTiles.addColorStop(.51,'#b68b6d');roofTiles.addColorStop(.52,'#946e58');roofTiles.addColorStop(1,'#aa7c61');
        capsule(c,x+2,1,99,50,1,roofTiles);
        for(let h=4;h<=48;h+=4)line(c,x+4,h,x+98,h,'#86634955',.7);
      }else if(i%3===1){
        for(let row=0;row<2;row++)for(let col=0;col<4;col++){
          const xx=x+51+col*10,yy=5+row*13;capsule(c,xx,yy,9,12,1,'#5b7585');
          line(c,xx+2,yy+2,xx+7,yy+8,'#89a2ad');
        }
      }
      for(let j=0;j<2;j++){
        capsule(c,x+9+j*20,18,15,9,1,'#9b9e94');
        for(let k=0;k<3;k++)line(c,x+10+j*20,20+2*k,x+23+j*20,20+2*k,'#687874');
      }
      for(let j=0;j<3;j++){
        line(c,x+5+j*19,65,x+5+j*19,79,'#f5f2db',1.5);
        capsule(c,x+8+j*19,67,9,10,1,j%2?'#afa588':'#6a7475');
      }
      for(let j=0;j<2;j++){
        const x0=x+124+j*13,y0=55-j*17;
        const g=c.createRadialGradient(x0-6,y0-7,2,x0,y0,17);
        g.addColorStop(0,'#8ba974');g.addColorStop(.6,'#6f895e');g.addColorStop(1,'#4b6048');
        c.fillStyle=g;c.beginPath();c.arc(x0,y0,16,0,Math.PI*2);c.fill();
      }
    }
    c.fillStyle='#d7d1c4';c.fillRect(0,lane-91,W,166);
    c.fillStyle='#686d68';c.fillRect(0,lane-77,W,148);
    const paving=c.createLinearGradient(0,lane-74,0,lane+64);
    paving.addColorStop(0,'#535b5c');paving.addColorStop(.45,'#737a78');paving.addColorStop(1,'#596264');
    c.fillStyle=paving;c.fillRect(0,lane-75,W,142);
    c.save();c.beginPath();c.rect(0,lane-75,W,142);c.clip();
    for(let x=-128-travel%128;x<W;x+=128)for(let y=lane-75;y<lane+67;y+=128)c.drawImage(grain(),x,y);
    c.restore();
    for(let x=-70-travel%82;x<W;x+=82){
      line(c,x,lane-90,x+8,lane-80,'#b7b6ae');
      line(c,x,lane+66,x+8,lane+75,'#b5b7aa');
    }
    c.fillStyle='#d9cd9a';c.fillRect(0,lane-19,W,1.4);c.fillRect(0,lane-15,W,1.4);
    for(let x=-60-travel%65;x<W;x+=65){
      c.fillStyle='#d8dcce';c.fillRect(x,lane+20,27,1.4);c.fillRect(x,lane-45,27,1.4);
    }
    for(let x=34-travel%310;x<W;x+=310){
      // Painted lane arrows give a fixed-world reference for body displacement.
      poly(c,[[x-11,lane-52],[x-19,lane-48],[x-11,lane-44],[x-11,lane-47],[x+9,lane-47],[x+9,lane-49],[x-11,lane-49]],'#d6d6ca');
    }
    // Shop awnings and a slow-moving pedestrian are street context only.
    for(let j=firstBlock-1;j<firstBlock+8;j++){
      const bx=j*160-travel;
      if(j%3===0){
        for(let h=0;h<6;h++)capsule(c,bx+h*6+20,56,6.3,9,1,h%2?'#c8886e':'#eedac0');
      }
      const px=bx+110+(j%2?1:-1)*t*3,py=lane-90+(j%2?3:0);
      capsule(c,px-2,py-1,5.8,4,2.3,j%2?'#694f55':'#637d9d');
      capsule(c,px+.5,py,2.3,2.3,1.15,'#b79b80');
    }
}
function instrument(c,x,name,value,sub,width,accent){
  label(c,name,x,276,'#aec2bc',13,550);
  label(c,value,x,304,accent,22,650);
  label(c,sub,x,327,'#d1dfd8',13,450);
  if(width)line(c,x+width,267,x+width,326,'#405659');
}
function draw(canvas,id,s,d,context={}){
  const c=canvas.getContext('2d'),mode=context.mode??0,focus=context.focus===1?1:0;
  const records=mode===1?d.history:mode===2?[d.forecast[0],d.trial]:d.forecast;
  const index=clamp(s.t/d.dt,0,records.length-1),j=Math.min(records.length-2,Math.floor(index)),alpha=index-j;
  // The archive contains measurements and a single future set point. Interpolation
  // only animates the transition, and the planned input stays at its archived value.
  const values=[0,1].map(k=>records[j][k].map((n,i)=>lerp(n,records[j+1][k][i],alpha)));
  const group=values[focus],goal=mode===1?group:records.at(-1)[focus];
  // The lead and HDVs use their observed/predicted velocities. Each CAV's
  // offset from its predecessor uses that CAV's own measured spacing error.
  function distance(k,column){
    let sum=0;
    for(let h=0;h<j;h++)sum+=(records[h][k][column]+records[h+1][k][column])*.5;
    const start=records[j][k][column],end=lerp(start,records[j+1][k][column],alpha);
    return d.base*s.t+d.dt*(sum+alpha*(start+end)*.5);
  }
  const y=177,zoom=8.15,travel=distance(0,0),h1=-2*d.base-records[0][0][3]+distance(0,2);
  const h2=-4*d.base-records[0][0][3]-records[0][1][3]+distance(1,2);
  const points=[travel,travel-d.base-values[0][3],h1,h1-d.base-values[1][3],h2];
  // Hold the camera for the short online prediction and track long road tests.
  const shift=mode===1?Math.min(travel*.7,4):travel;
  const xs=points.map(x=>W/2+(x-travel+2*d.base+shift)*zoom);
  const selected=1+2*focus, colors=[lead,cav,human,cav,human], names=["Pilot car","Netlink 1","Manual 1","Internet connection 2","Artificial 2"];
  c.save();c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  road(c,(travel-shift)*zoom,y,s.t);
  const phase=mode===1?0:Math.min(2,Math.floor(index*3));
  if(mode!==1){
    const titles=["Observe the speed of your own vehicle and the vehicle ahead","Two sets of synchronization speed predictions","Send the acceleration of this step"];
    capsule(c,12,12,162,42,8,'#153c36ed');
    label(c,"Single step process slow playback",22,29,'#bad4bc',11,550);
    label(c,titles[phase],22,47,'#f7f6df',14,650);
    for(let k=0;k<3;k++)capsule(c,131+11*k,20,7,4,2,k<=phase?'#b3dc91':'#4c685e');
    // Faded silhouettes identify the starting pose of the same five vehicles.
    const origins=[0,-d.base-records[0][0][3],-2*d.base-records[0][0][3],
      -3*d.base-records[0][0][3]-records[0][1][3],-4*d.base-records[0][0][3]-records[0][1][3]];
    c.strokeStyle='#e1e6da99';c.lineWidth=1;c.setLineDash([3,3]);
    for(const x of origins){
      const sx=W/2+(x+2*d.base)*zoom;
      c.beginPath();c.roundRect(sx-18,y-7.5,36,15,6);c.stroke();
    }
    c.setLineDash([]);
  }
  if(phase===0){
    // Range scan towards the selected CAV's predecessor.
    const rear=xs[selected]+20,front=xs[selected-1]-20;
    const grad=c.createLinearGradient(rear,0,front,0);
    grad.addColorStop(0,'#caeea904');grad.addColorStop(1,'#d3ef9560');
    poly(c,[[rear,y-1],[front,y-8],[front,y+8],[rear,y+1]],grad);
    const u=mode===1?(s.t*2)%1:(index*3)%1;
    line(c,lerp(rear,front,u),y-6,lerp(rear,front,u),y+6,'#d7f6ae',2);
  }
  // The common velocity prediction is transmitted from the upstream subsystem
  // (car 2 is its trailing HDV) into the downstream subsystem (CAV 2).
  const tx=xs[2],rx=xs[3];
  c.save();c.strokeStyle='#fff6cc';c.lineWidth=1.9;c.setLineDash([4,4]);c.beginPath();
  c.moveTo(tx,y+12);c.bezierCurveTo(tx,y+66,rx,y+66,rx,y+12);c.stroke();c.setLineDash([]);
  const f=mode===1?(s.t*2)%1:clamp(index*3-1,0,1),inv=1-f;
  const packetX=inv*inv*inv*tx+3*inv*inv*f*tx+3*inv*f*f*rx+f*f*f*rx;
  const packetY=(inv**3+f**3)*(y+12)+(3*inv*f)*(y+66);
  capsule(c,packetX-3,packetY-3,6,6,3,'#ffdc72');c.restore();
  if(mode!==1 && phase===2){
    const a1=records.at(-1)[0][4], px=xs[1],end=px+112*clamp(a1,-1,1);
    const yy=y+28,fill=mode===2?'#ffc57f':'#c2e9a8';
    line(c,px,yy,end,yy,fill,4);
    if(Math.abs(end-px)>6)poly(c,[[end+4,yy],[end-3,yy-4],[end-3,yy+4]],fill);
    capsule(c,px-58,y+37,116,20,6,'#2a342ee8');
    label(c,signed(a1,4)+' m/s²',px,y+51,fill,13,650,'center');
  }
  for(let k=0;k<xs.length;k++){
    const x=xs[k],selectedCar=k===selected,chipY=y-43;
    line(c,x,chipY+15,x,y-12,selectedCar?'#dcf5ac':'#efeddd',1);
    capsule(c,x-23,chipY-3,46,20,7,selectedCar?'#cbe8a9':'#213332df');
    label(c,names[k],x,chipY+12,selectedCar?'#274c38':'#fffdf3',13,600,'center');
    sedan(c,x,y,colors[k],k===1||k===3?1:k===4?2:0,selectedCar);
  }
  const rear=xs[selected],front=xs[selected-1],gy=y-57;
  line(c,rear,gy,front,gy,'#c9f2c4',2.2);
  for(const x of [rear,front])line(c,x,gy-3,x,gy+4,'#c9f2c4',2.2);
  const gap=d.base+group[3],mid=(rear+front)/2;
  capsule(c,mid-40,gy-23,80,20,6,'#12352fe8');label(c,gap.toFixed(4)+' m',mid,gy-9,'#eff8e7',13,650,'center');
  const wx=(tx+rx)/2;
  capsule(c,wx-86,y+42,172,20,6,'#2c3329e8');
  label(c,"Sharing the speed of the vehicle in front "+(d.base+values[0][2]).toFixed(3)+' m/s',wx,y+56,'#ffe6a7',12.5,550,'center');
  c.fillStyle='#152a2bf5';c.fillRect(0,252,W,88);
  instrument(c,22,"Netlink "+(focus+1)+(mode===1?" · Drive test control":" · Selected acceleration"),
    signed(goal[4],5)+' m/s²',mode===1?"0.25 second sample": "Acts on a single 0.25 second prediction step",235,'#d7f2b6');
  // A micro scale shows the genuine centimetre-scale gap error, without
  // visually inflating the physical spacing between vehicle bodies.
  const gapCm=group[3]*100,gx=408,gw=128,r=mode===1?5:2;
  label(c,"Relative to 20 m equilibrium spacing",280,276,'#aec2bc',13,550);
  label(c,signed(gapCm,3)+' cm',280,303,'#f4eedf',19,650);
  const cy=317;line(c,gx-gw,cy,gx+gw,cy,'#6b8e86',2);
  for(let t=-2;t<=2;t++)line(c,gx+t*gw/2,cy-3,gx+t*gw/2,cy+3,t===0?'#eef5d2':'#829c92');
  const pointer=gx+clamp(gapCm/r,-1,1)*gw;
  poly(c,[[pointer-4,cy-8],[pointer+4,cy-8],[pointer,cy-1]],'#d4ef9c');
  label(c,'−'+r,gx-gw,335,'#c6d8ce',11,500,'center');label(c,'0',gx,335,'#c6d8ce',11,500,'center');label(c,'+'+r,gx+gw,335,'#c6d8ce',11,500,'center');
  line(c,570,267,570,326,'#405659');
  if(mode===1){
    instrument(c,598,"Measured samples",Math.min(Math.floor(index)+1,records.length)+' / '+records.length,"Offline historical fragments · For observation only",0,'#ffdda3');
  }else{
    const objective=d.costs[mode===2?1:0], plan=records.at(-1);
    const effort=plan.reduce((total,row)=>total+row[4]*row[4],0);
    label(c,"Two groups of vehicles · Predicted target values",598,276,'#aec2bc',13,550);
    label(c,objective.toFixed(6),598,302,'#ffdda3',22,650);
    const px=598,py=310,bw=267,bh=5;
    capsule(c,px,py,bw,bh,2,'#365353');
    c.fillStyle='#86b0ae';c.fillRect(px,py,bw*(objective-effort)/d.costs[1],bh);
    c.fillStyle='#efa964';c.fillRect(px+bw*(objective-effort)/d.costs[1],py,bw*effort/d.costs[1],bh);
    label(c,"acceleration cost "+effort.toFixed(5)+"  · Archive total value "+d.costs[0].toFixed(5),px,332,'#dae1d6',12,500);
  }
  c.restore();
}
window.ORTOPIA_MIXED={draw};
})();
