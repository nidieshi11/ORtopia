'use strict';
window.ORTOPIA_STUDIO=(()=>{
 const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 const sprite=new Image();let requested=false;
 function stroke(c,points,color,width){
  c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();
  points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 }
 function ellipse(c,x,y,rx,ry,color,angle=0){
  c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fill();
 }
 function person(c,x,y,scale,facing,phase,stride,work,assistant){
  const sway=Math.sin(phase),breathe=Math.sin(phase*.27)*.7;
  c.save();c.translate(x,y);c.scale(scale*facing,scale);
  ellipse(c,-8,1,25,4,'rgba(36,44,37,.20)',-.05);
  // The head, hips and planted feet are articulated separately from the swinging limbs.
  c.translate(0,breathe-Math.abs(Math.cos(phase))*1.6*stride);
  const leg=(side,back)=>{
   const a=Math.sin(phase+side),step=stride*17*a,lift=stride*Math.max(0,Math.cos(phase+side))*7;
   const knee=[step*.55+5,-21-lift],ankle=[step,-4-lift];
   stroke(c,[[-3,-42],knee,ankle],back?'#353e42':'#485359',8);
   stroke(c,[ankle,[ankle[0]+7,ankle[1]+1]],back?'#343433':'#635248',5);
  };
  leg(Math.PI,true);leg(0,false);
  const torso=c.createLinearGradient(-12,0,12,0);
  torso.addColorStop(0,assistant?'#9c6946':'#245c5c');torso.addColorStop(.5,assistant?'#d19565':'#438b81');torso.addColorStop(1,assistant?'#e6b38b':'#659d88');
  c.fillStyle=torso;c.beginPath();c.moveTo(-9,-79);c.quadraticCurveTo(3,-83,10,-74);c.lineTo(11,-43);c.quadraticCurveTo(-2,-39,-13,-43);c.closePath();c.fill();
  stroke(c,[[0,-78],[5,-64],[8,-67]],'#d9ded0',1.6);c.fillStyle='#ebe8d5';c.fillRect(4,-65,5,8);
  const elbow=[7-sway*stride*6,-58-4*work],hand=[10-sway*stride*12+10*work,-45-18*work];
  stroke(c,[[0,-75],elbow],assistant?'#bb8559':'#3c776d',8);stroke(c,[elbow,hand],'#c89172',5);
  c.save();c.translate(hand[0],hand[1]);c.rotate(-.15-work*.4);c.fillStyle='#846746';c.fillRect(-4,-7,13,17);c.fillStyle='#f4e7cb';c.fillRect(-3,-6,11,14);c.fillStyle='#477d72';c.fillRect(-1,-2,5,1.5);c.restore();
  stroke(c,[[0,-83],[0,-77]],'#b78262',6);ellipse(c,1,-91,9,12,'#c69776',-.07);
  ellipse(c,-1,-98,9,6,'#423d33',-.1);ellipse(c,-6,-93,4,8,'#423d33');
  if(assistant)ellipse(c,-10,-94,4.5,5,'#504237');
  stroke(c,[[8,-92],[11,-90],[9,-89]],'#bb856e',1.7);ellipse(c,7,-94,1.1,.8,'#403c37');c.restore();
 }
 function note(c,x,y,t){
  c.font='600 13px "Microsoft YaHei",sans-serif';const width=c.measureText(t).width+18;
  c.fillStyle='rgba(23,59,53,.9)';c.beginPath();c.roundRect(x-width/2,y-17,width,24,6);c.fill();c.fillStyle='#fff9e7';c.textAlign='center';c.fillText(t,x,y);
 }
 function ledger(c,steps,index,override){
  const x=598,y=30,w=376,rowH=24,inks=['#388068','#ba7243','#69638c'];
  c.save();c.fillStyle='rgba(249,249,233,.98)';c.beginPath();c.roundRect(x,y,w,373,10);c.fill();
  c.fillStyle='#23463a';c.textAlign='left';c.font='700 18px "Microsoft YaHei",sans-serif';
  c.fillText('Whole group allocation · One customer per line',x+18,y+30);
  ['Email','Push notification','Coupon'].forEach((label,k)=>{
   c.fillStyle=inks[k];c.fillRect(x+19+106*k,y+43,12,10);
   c.fillStyle='#365748';c.font='13px "Microsoft YaHei",sans-serif';c.fillText(label,x+37+106*k,y+53);
  });
  steps.forEach((entry,i)=>{
   const values=Object.fromEntries(entry.changes.map(change=>[change.id,change.value]));
   const client=entry.changes.find(change=>!['mail','push','voucher'].includes(change.id)).value;
   const top=y+69+i*rowH;
   if(index===i){c.fillStyle='#d1e8d3';c.fillRect(x+9,top-1,w-18,rowH-1);}
   c.fillStyle=index===i?'#184632':'#426152';c.font=(index===i?'bold ':'')+'15px sans-serif';
   c.fillText(client,x+23,top+15);
   let left=x+69;
   ['mail','push','voucher'].forEach((key,k)=>{
    const width=parseFloat(i===index && override ? override[key] : values[key])*2.82;
    c.fillStyle=inks[k];c.fillRect(left,top+3,width,12);left+=width;
   });
   if(i===3||i===7){c.strokeStyle='#b4c5b4';c.beginPath();c.moveTo(x+14,top+rowH-1);c.lineTo(x+w-14,top+rowH-1);c.stroke();}
  });c.restore();
 }
 function render(stage,data,index){
  const step=data.steps[index],m=Object.fromEntries(step.changes.map(c=>[c.id,c.value]));
  const personId=step.changes.find(c=>!['mail','push','voucher'].includes(c.id)).value;
  stage.innerHTML='<figure class="studio-world"><canvas class="studio-canvas" width="1600" height="900" role="img" aria-label="'+safe(step.title)+' Marketing Studio Demo"></canvas><figcaption>Expand verified activity allocation according to customers, with studio and personnel actions as a guide. </figcaption></figure>';
  const canvas=stage.querySelector('canvas'),c=canvas.getContext('2d');
  let alternate=null,choiceTitle='';
  function draw(time){
   c.setTransform(1.6,0,0,1.6,0,0);c.fillStyle='#d7cbb4';c.fillRect(0,0,1000,562.5);
   if(sprite.complete&&sprite.naturalWidth)c.drawImage(sprite,0,0,1000,562.5);
   // One allocation cycle: take the dossier to the terminal, prepare the mix, return to dispatch.
   const k=smooth(time/2.1)-smooth((time-4.2)/1.8),travel=(time>0&&time<2.1)||(time>4.2&&time<6);
   const busy=time>2.1&&time<4.2?(Math.sin((time-2.1)*6)+1)/2:0;
   const x=139+k*328,y=413-k*20;
   person(c,798,389,1.04,-1,time*2.1,0,.55+.28*Math.sin(time*2),true);
   person(c,x,y,1.26,time>4.2?-1:1,time*9.3,travel?Math.min(1,12*Math.abs(k),12*Math.abs(1-k)):0,busy,false);
   note(c,x,y-151,'Customer '+personId+' · Programmer');
   ledger(c,data.steps,index,alternate);
   if(alternate)note(c,785,422,'Compare · '+personId+' '+choiceTitle);
   const left=195,width=610,top=486;
   c.fillStyle='rgba(255,251,236,.96)';c.beginPath();c.roundRect(left,top,width,51,9);c.fill();
   const channels=[['mail','Email','#507f6a'],['push','Push notification','#9d663f'],['voucher','Coupon','#626a88']];
   channels.forEach(([key,name,ink],i)=>{
    const cx=left+16+i*199,pc=parseFloat((alternate||m)[key])||0;
    c.fillStyle='#25493b';c.textAlign='left';c.font='600 14px "Microsoft YaHei",sans-serif';c.fillText(name+'  '+(alternate||m)[key],cx,top+20);
    c.fillStyle='#dddccd';c.fillRect(cx,top+29,174,7);c.fillStyle=ink;c.fillRect(cx,top+29,174*pc/100,7);
   });
  }
  stage.sceneFrame=draw;
  stage.previewDecision=option=>{
   const compare=window.ORTOPIA_REPLAY_LOGIC.P0045[index].comparison.options[option];
   alternate=null;choiceTitle='';
   if(option && compare){
    const key=compare.channel;
    if(key){alternate={mail:'0%',push:'0%',voucher:'0%'};alternate[key]='100%';choiceTitle=compare.label;}
   }
   draw(stage.sceneTime||0);
  };
  draw(stage.sceneTime||0);
  if(!requested){requested=true;sprite.src='assets/replays/P0045/studio.webp';}
  if(!sprite.complete)sprite.addEventListener('load',()=>{if(canvas.isConnected)draw(stage.sceneTime||0);},{once:true});
 }
 return {supports:id=>id==='P0045',render};
})();
