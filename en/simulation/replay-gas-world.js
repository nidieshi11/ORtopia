/* Steady flow is simultaneous along all three connections. Moving markers trace
   the gas direction. Gauge needles and their green intervals use one scale. */
window.ORTOPIA_GAS_WORLD = (() => {
 'use strict';
 const W=1000,H=400,TAU=Math.PI*2;
 const X=[102,367,628,897],meterY=211,pipeY=298;
 const teal='#55e2bc',amber='#f7c46c',red='#fa8d7a',steel='#527274';
 const font='"Segoe UI","Microsoft YaHei",system-ui,sans-serif';
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
 function line(c,pts,color,width=1){
   c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
   c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();
 }
 function poly(c,points,color){
   c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
 }
 function oval(c,x,y,a,b,color){
   c.fillStyle=color;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();
 }
 function rect(c,x,y,w,h,col,r=0){
   c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
 }
 function label(c,s,x,y,size,color,weight=600,align='center'){
   c.font=weight+' '+size+'px '+font;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);
 }
 function gradient(c,y0,y1,stops){
   const g=c.createLinearGradient(0,y0,0,y1);for(const [at,col] of stops)g.addColorStop(at,col);return g;
 }
 function built(c,x,y,w,h,depth,palette){
   const [light,shadow,roof]=palette;
   rect(c,x,y-h,w,h,light);
   poly(c,[[x+w,y],[x+w+depth,y-depth*.42],[x+w+depth,y-h-depth*.42],[x+w,y-h]],shadow);
   poly(c,[[x,y-h],[x+depth,y-h-depth*.42],[x+w+depth,y-h-depth*.42],[x+w,y-h]],roof);
 }
 function birch(c,x,y,scale,tone){
   c.save();c.translate(x,y);c.scale(scale,scale);
   line(c,[[0,0],[0,-19]],'#686d59',2);
   oval(c,0,-20,5.4,11.5,tone);oval(c,-2,-15,3.8,7.5,tone);c.restore();
 }
 function house(c,x,y,w,h,wall,roof){
   built(c,x,y,w,h,7,[wall,'#97aaa0','#d1cbb1']);
   poly(c,[[x-3,y-h],[x+w*.48,y-h-12],[x+w+3,y-h]],roof);
   poly(c,[[x+w*.48,y-h-12],[x+w*.48+7,y-h-15],[x+w+10,y-h-3],[x+w+3,y-h]],'#647b75');
   rect(c,x+w*.66,y-h-9,3,7,'#796e60');
   for(let j=0;j<2;j++){
    rect(c,x+4+j*w*.45,y-h+5,w*.20,h*.27,'#496b6c');rect(c,x+5+j*w*.45,y-h+5,1,h*.27,'#e0d4b2');
   }
   rect(c,x+w*.43,y-8,w*.16,8,'#788579');
 }
 function supply(c){
   oval(c,125,159,113,10,'#73888040');
   built(c,15,155,179,5,16,['#b7bdac','#8d9f93','#d4d8c5']);
   for(const [x,y,k] of [[136,125,.77],[73,142,1]]){
    c.save();c.translate(x,y);c.scale(k,k);
    for(const xoff of [-20,19]){poly(c,[[xoff-2,-9],[xoff+2,-9],[xoff+4,0],[xoff-5,0]],steel);}
    rect(c,-36,-38,72,28,gradient(c,-38,-10,[[0,'#e5ebd7'],[.42,'#bbc9b8'],[1,'#789a94']]),13);
    for(const dx of [-17,17])line(c,[[dx,-36],[dx,-12]],'#8da8a2',2);
    line(c,[[-11,-40],[11,-40]],'#607f7a',2);rect(c,10,-44,3,6,'#568080');
    c.restore();
   }
   built(c,174,150,30,22,8,['#729795','#4c7777','#ccd6c2']);
   for(let j=0;j<5;j++)line(c,[[178,133+j*2.6],[194,133+j*2.6]],'#4b7273',1.15);
   line(c,[[92,139],[92,151],[103,155],[103,177]],'#53797a',6);
   line(c,[[92,139],[92,149],[104,154],[104,177]],'#d0cc99',3);
 }
 function district(c){
   for(let i=0;i<8;i++){const x=654+i*46,y=115+(i%3)*3;house(c,x,y,20,13,'#d3d1b6','#889580');}
   for(const [x,y,k] of [[759,142,1],[807,150,1.16],[926,145,1.12],[965,139,.85]]){
    c.save();c.translate(x,y);c.scale(k,k);house(c,0,0,25,20,'#ead7ba','#9b7865');c.restore();
   }
   built(c,861,155,45,24,11,['#809c95','#6a8782','#b7c5ad']);
   for(let j=0;j<3;j++)rect(c,865+j*10,137,6,6,'#526f70');
   line(c,[[889,154],[897,158],[897,176]],'#73857b',5);
 }
 function regulatorStation(c){
   // A small access cover over the buried fixed restriction, without an actuator.
   poly(c,[[465,152],[502,143],[537,149],[501,159]],'#9aab9d');
   built(c,479,152,35,6,7,['#a2b4a6','#7a938a','#cbd2bd']);
   for(const x of [471,499,526])line(c,[[x,147],[x,132]],'#7e8a74',1.8);
   line(c,[[471,132],[499,138],[526,131]],'#d8be83',2.8);
   line(c,[[471,139],[499,145],[526,138]],'#9d9f82',1.5);
 }
 function backdrop(c){
   rect(c,0,0,W,167,gradient(c,0,167,[[0,'#aac7cb'],[.56,'#e2ded0'],[1,'#f2d7ab']]));
   oval(c,698,45,22,22,'#f5e4bd');oval(c,698,45,16,16,'#f9edcf');
   poly(c,[[0,96],[0,54],[72,40],[134,54],[245,29],[347,67],[458,48],[508,65],[593,45],[683,71],[805,45],[863,62],[944,44],[1000,48],[1000,101]],'#9bb6b0');
   poly(c,[[0,112],[0,76],[66,70],[137,87],[218,70],[299,86],[400,68],[501,92],[592,69],[684,85],[761,62],[870,81],[944,71],[1000,80],[1000,117]],'#849f94');
   poly(c,[[0,97],[132,89],[255,101],[383,93],[498,101],[600,95],[723,100],[849,94],[1000,91],[1000,170],[0,170]],'#b8c6a7');
   for(let i=0;i<95;i++){
    const x=(i*97)%1038,y=91+(i*17)%12;birch(c,x,y,.27+(i%4)*.035,'#7d9b89');
   }
   // A service road winds along the same valley as the pipeline.
   const road=[[-5,144],[127,130],[262,143],[369,127],[513,129],[656,115],[790,125],[1008,114]];
   line(c,road,'#94aaa0',7);line(c,road,'#d7ceac',4);
   for(let n=0;n<33;n++){
    const x=(n*107+230)%1020,y=117+(n%4)*5;
    if((x>217&&x<460)||(x>600&&x<755))birch(c,x,y,.55+(n%4)*.14,n%3?'#769780':'#5b826f');
   }
   for(let i=0;i<12;i++){
    const x=235+i*45,y=153+(i%3)*2;
    rect(c,x,y-7,2,10,'#9a9c80');
    if(i<11)line(c,[[x,y-5],[x+45,153+(i+1)%3*2-5]],'#a1a68e',1);
   }
   supply(c);district(c);regulatorStation(c);
   const ground=[[0,165],[142,165],[221,169],[373,161],[531,163],[659,158],[808,164],[1000,160]];
   poly(c,[...ground,[1000,H],[0,H]],gradient(c,160,H,[[0,'#465556'],[.35,'#30464a'],[1,'#233b40']]));
   line(c,ground,'#839781',5);
   for(let j=0;j<5;j++){
    const a=180+j*46;
    line(c,[[0,a],[111,a-3],[218,a+3],[324,a-6],[427,a-2],[558,a+3],[686,a-4],[830,a+3],[1000,a]],'#8e9e9134',1+j%2);
   }
   for(let i=0;i<415;i++){
    const x=(i*7919)%1000,y=169+(i*104729)%232;
    line(c,[[x,y],[x+(i%4)+1,y-(i%2)]],i%3?'#91a39b28':'#c4be9d31',1);
   }
   for(const [x,lbl] of [[102,'Entrance gas supply station'],[496,'Fixed resistor'],[895,'User receiving station']]){
    rect(c,x-47,8,94,24,'#e9e8d5e8',4);label(c,lbl,x,20,14,'#344f4b');
   }
 }
 function gauge(c,x,index,value,bounds,selected,needleValue){
   const [lo,hi]=bounds,fail=value<lo-1e-7||value>hi+1e-7;
   const accent=fail?red:teal;
   rect(c,x-5,meterY+19,10,62,steel,2);
   rect(c,x-2,meterY+26,3,50,'#a1b8ac',1);
   if(selected||fail){oval(c,x,meterY,31,31,fail?'#ff8a686b':'#72cbb64a');}
   oval(c,x,meterY,26.5,26.5,'#1c3539');oval(c,x,meterY,24.8,24.8,'#9aaca0');oval(c,x,meterY,22.8,22.8,'#edf0d9');
   const angle=n=>Math.PI*(.78+1.44*clamp((n-50.25)/2.6,0,1));
   c.lineWidth=4;c.strokeStyle='#c7cec0';c.beginPath();c.arc(x,meterY,16,angle(50.25),angle(52.85));c.stroke();
   c.strokeStyle='#459b86';c.beginPath();c.arc(x,meterY,16,angle(lo),angle(hi));c.stroke();
   for(let j=0;j<11;j++){
    const a=angle(50.25+j*.26);line(c,[[x+Math.cos(a)*18,meterY+Math.sin(a)*18],[x+Math.cos(a)*20,meterY+Math.sin(a)*20]],'#526b63',1);
   }
   const a=angle(needleValue);
   line(c,[[x-Math.cos(a)*5,meterY-Math.sin(a)*5],[x+Math.cos(a)*15,meterY+Math.sin(a)*15]],fail?'#bd503f':'#263e40',2.3);
   oval(c,x,meterY,2.8,2.8,'#394d49');
   const numberWidth=c.gasNarrow?85:68;
   rect(c,x-numberWidth/2,meterY+21,numberWidth,c.gasNarrow?29:25,'#122f33',4);
   label(c,value.toFixed(3),x,meterY+34,c.gasNarrow?22:16,accent,700);
   if(fail)rect(c,x-40,meterY-47,80,20,'#803f38',5);
   label(c,'P'+index+(fail?(value<lo?'  low pressure':'  high pressure'):''),x,meterY-37,c.gasNarrow?17:13,fail?'#ffead8':'#e6eddf',650);
 }
 function pipe(c,x1,x2){
   rect(c,x1,pipeY-14,x2-x1,28,gradient(c,pipeY-14,pipeY+14,[[0,'#c1c7b4'],[.18,'#88aaa6'],[.5,'#587b80'],[1,'#3a525a']]),4);
   rect(c,x1,pipeY-8,x2-x1,16,'#173b42');
   for(let x=x1+30;x<x2-8;x+=73){
    rect(c,x,pipeY-15,4,6,'#9db3ab');rect(c,x,pipeY+8,4,7,'#749591');
   }
 }
 function constriction(c){
   const x=500;
   rect(c,x-37,pipeY-22,74,44,'#56696a',8);
   rect(c,x-32,pipeY-17,64,34,'#b9ac89',7);
   rect(c,x-32,pipeY-12,64,24,'#387279');
   const top=[[x-32,pipeY-12],[x-12,pipeY-12],[x-4,pipeY-3.8],[x+4,pipeY-3.8],[x+13,pipeY-12],[x+32,pipeY-12]];
   poly(c,[[x-32,pipeY-15],[x+32,pipeY-15],...top.slice().reverse()],'#b4a179');
   poly(c,[[x-32,pipeY+15],[x+32,pipeY+15],...top.slice().reverse().map(([a,b])=>[a,pipeY+(pipeY-b)])],'#99886a');
   for(const side of [-40,35]){
    rect(c,x+side,pipeY-24,6,48,'#9daea6',2);
    rect(c,x+side-1,pipeY-22,8,4,'#bcc7bc',2);rect(c,x+side-1,pipeY+18,8,4,'#728983',2);
   }
 }
 function markers(c,flow,t){
   const q=Math.abs(flow);
   if(q<1e-6)return;
   const dir=Math.sign(flow),gap=44;
   const off=((t*q*9*dir)%gap+gap)%gap;
   c.save();c.beginPath();c.rect(X[0],pipeY-8,X[3]-X[0],16);c.clip();
   line(c,[[X[0],pipeY],[X[3],pipeY]],'#237369',3);
   for(let x=X[0]-gap+off;x<X[3]+gap;x+=gap){
    const reduction=clamp(Math.abs(x-500)/13,.35,1);
    const y=pipeY,tip=x+dir*6,back=x-dir*4;
    const g=c.createLinearGradient(x-dir*22,y,x,y);g.addColorStop(0,'#75e4bd00');g.addColorStop(1,'#63d9bba8');
    line(c,[[x-dir*19,y],[x,y]],g,3*reduction+.6);
    line(c,[[back,y-3.3*reduction],[tip,y],[back,y+3.3*reduction]],'#b0f1ce',2.1);
   }
   c.restore();
 }
 function riser(c,x,dir,flow,t){
   // Cutaway of the buried vertical inlet/outlet sections. Both meters remain in series.
   const px=x-dir*40,top=151;
   line(c,[[x,top],[px,top],[px,pipeY-1],[x,pipeY-1]],'#92aaa0',11);
   line(c,[[x,top],[px,top],[px,pipeY-1],[x,pipeY-1]],'#274f54',6.5);
   const offset=(((t*flow*9*dir)%36)+36)%36;
   for(let y=top+offset;y<pipeY-3;y+=36){
    line(c,[[px,y-dir*2],[px,y+dir*2]],'#9be8c5',2.5);
   }
 }
 function dialWheel(c,x,y,t,flow){
   oval(c,x,y,9,9,'#1d3638');oval(c,x,y,7.5,7.5,'#648782');
   for(let j=0;j<5;j++){
    const a=t*flow*.38+j*TAU/5;line(c,[[x,y],[x+6*Math.cos(a),y+6*Math.sin(a)]],'#d0d9bf',1.5);
   }
   oval(c,x,y,2,2,'#f1d291');
 }
 function flowMeter(c,state,x,isExit,t){
   const q=state.flow,demand=state.demand;
   const fail=isExit&&(q<demand[0]-1e-7||q>demand[1]+1e-7);
   const shade=fail?red:teal;
   line(c,[[x,pipeY],[x,pipeY+17],[x+(isExit?24:-24),pipeY+27]],'#8aa9a0',3);
   const left=x-61;
   rect(c,left,pipeY+29,122,36,'#152f33',5);
   label(c,isExit?'receive':'feed in',left+11,pipeY+47,14,'#cedacc',600,'left');
   label(c,q.toFixed(2),left+85,pipeY+47,20,shade,700,'right');
   dialWheel(c,left+104,pipeY+46,t,q);
   if(fail){
    const s=q<demand[0]?'unmet need':'Exceeded receiving limit';
    rect(c,x-51,pipeY+69,102,20,'#704239',4);label(c,s,x,pipeY+79,13,'#ffe3d9');
   }
 }
 function create(canvas){
   canvas.width=W*1.5;canvas.height=H*1.5;
   const c=canvas.getContext('2d');c.scale(1.5,1.5);
   const back=document.createElement('canvas');back.width=canvas.width;back.height=canvas.height;
   const bg=back.getContext('2d');bg.scale(1.5,1.5);backdrop(bg);
   return (state,t=0,focus=3,needles=state.pressures)=>{
    c.gasNarrow=canvas.clientWidth>0&&canvas.clientWidth<600;
    c.drawImage(back,0,0,W,H);
    const pressure=state.pressures,flow=state.flow,bounds=state.flowBounds;
    const pipeError=flow<bounds[0]-1e-7||flow>bounds[1]+1e-7;
    riser(c,X[0],1,flow,t);riser(c,X[3],-1,flow,t);
    for(let i=0;i<3;i++){
     const x1=X[i],x2=X[i+1],active=focus===i;
     if(active||pipeError)rect(c,x1,pipeY-20,x2-x1,40,pipeError?'#a9604559':'#54d7b42d',14);
     pipe(c,x1,x2);
    }
    constriction(c);markers(c,flow,t);
    for(let i=0;i<X.length;i++){
     const x=X[i];
     gauge(c,x,i,pressure[i],state.pressureBounds[i],i===focus||i===focus+1,needles[i]);
     rect(c,x-4,pipeY-17,8,7,'#b6beb0',2);rect(c,x-4,pipeY+10,8,7,'#808f86',2);
    }
    for(let i=0;i<3;i++){
     const x=(X[i]+X[i+1])/2;
     rect(c,x-39,pipeY+32,78,23,focus===i?'#e0dbbd':'#354f52',5);
     label(c,'E'+i+'  '+(i===1?'Resistor':'pipe'),x,pipeY+44,13,focus===i?'#344546':'#dbe5d8',650);
    }
    flowMeter(c,state,X[0],false,t);flowMeter(c,state,X[3],true,t);
   };
 }
 return {create};
})();
