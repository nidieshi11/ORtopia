/* Geometry and drawing routines used by the two interactive instance worlds. */
(() => {
'use strict';
const W=940,H=414;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function poly(c,pts,fill,stroke,width=1){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}
}
function line(c,pts,col,width=1,dash=[]){
 c.save();c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.setLineDash(dash);c.stroke();c.restore();
}
function ellipse(c,x,y,rx,ry,col){
 c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function box(c,x,y,w,h,d,colors){
 const [front,side,top]=colors;
 poly(c,[[x,y],[x+w,y],[x+w,y-h],[x,y-h]],front);
 poly(c,[[x+w,y],[x+w+d,y-d*.55],[x+w+d,y-d*.55-h],[x+w,y-h]],side);
 poly(c,[[x,y-h],[x+d,y-d*.55-h],[x+w+d,y-d*.55-h],[x+w,y-h]],top);
}
function text(c,s,x,y,size=14,color='#213c3d',align='left',bold=600){
 c.font=bold+' '+size+'px "Segoe UI","Microsoft YaHei",sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);
}
function badge(c,s,x,y,bg='#fafff4',fg='#243a38',sze=14){
 c.font='650 '+sze+'px "Segoe UI","Microsoft YaHei",sans-serif';
 const w=c.measureText(s).width+16;
 const center=clamp(x,w/2+2,W-w/2-2);
 c.fillStyle=bg;c.beginPath();c.roundRect(center-w/2,y-10,w,21,5);c.fill();text(c,s,center,y+1,sze,fg,'center',650);
}
function tree(c,x,y,s=1){
 c.save();c.translate(x,y);c.scale(s,s);ellipse(c,4,2,15,4,'#45735c28');
 line(c,[[0,0],[0,-16]],'#786a52',3);ellipse(c,1,-19,10,14,'#638f71');ellipse(c,-4,-21,8,10,'#7ba780');ellipse(c,-3,-27,6,8,'#99b48a');c.restore();
}
function terrain(c,seed){
 const g=c.createLinearGradient(0,0,600,H);g.addColorStop(0,'#e1e7d5');g.addColorStop(.55,'#d4deca');g.addColorStop(1,'#cedaca');c.fillStyle=g;c.fillRect(0,0,W,H);
 let s=seed;const rand=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<420;i++){let x=rand()*W,y=rand()*H;line(c,[[x,y],[x+rand()*5+1,y-1]],i%3?'#58795624':'#fff6dc75',1)}
}
function road(c,pts,width=16,striped=true){
 line(c,pts,'#879386',width+4);line(c,pts,'#e9e6d7',width+2);line(c,pts,'#a7aaaa',width-1);
 if(striped)line(c,pts,'#fff7d7',1.7,[9,9]);
}
function along(pts,t){
 let lens=pts.slice(1).map(([x,y],i)=>Math.hypot(x-pts[i][0],y-pts[i][1]));
 let d=clamp(t)*lens.reduce((a,b)=>a+b,0);
 for(let i=0;i<lens.length;i++){if(d<=lens[i]||i===lens.length-1){const [x,y]=pts[i],[xx,yy]=pts[i+1];return [x+(xx-x)*d/lens[i],y+(yy-y)*d/lens[i],Math.atan2(yy-y,xx-x)]}d-=lens[i]}
}
function truck(c,x,y,angle,color,load=0,rescue=false){
 c.save();c.translate(x,y);c.rotate(angle);ellipse(c,0,3,22,9,'#34474940');
 for(let dx of [-13,10])for(let dy of [-7,7]){c.fillStyle='#313e41';c.fillRect(dx-3,dy-2,6,4)}
 c.fillStyle='#43585a';c.fillRect(-19,-7,38,14);
 c.fillStyle=color;c.fillRect(-19,-8,24,15);c.fillStyle='#e3e5db';c.fillRect(6,-7,11,14);
 c.fillStyle='#476873';c.fillRect(12,-5,4,10);c.fillStyle='#ffe8a6';c.fillRect(17,-6,2,3);c.fillRect(17,3,2,3);
 if(rescue){c.fillStyle='#ffdf7c';c.fillRect(8,-2,3,4);line(c,[[-15,0],[1,0]],'#fff3cf',2)}
 else {for(let i=0;i<Math.ceil(6*clamp(load));i++){c.fillStyle=i%2?'#dac299':'#e8d9a8';c.fillRect(-17+Math.floor(i/2)*7,-6+(i%2)*6,5,5)}}
 c.restore();
}
function person(c,x,y,t,coat='#c3703f',working=false){
 let a=Math.sin(t*6);ellipse(c,x+1,y+2,5,2,'#45584b33');
 line(c,[[x-1,y-6],[x-2-a*1.7,y]],'#344b51',2.2);line(c,[[x+1,y-6],[x+2+a*1.7,y]],'#344b51',2.2);
 line(c,[[x,y-12],[x,y-6]],coat,5);line(c,[[x+1,y-10],[x+4,y-(working?11+a*3:6)]],coat,2);
 ellipse(c,x,y-15,3,3.1,'#a87559');ellipse(c,x,y-16.5,3.7,1.7,'#ffdb8b');
}
function siteShell(host,kind,label,help){
 host.innerHTML='<section class="fp-lab '+kind+'"><div class="fp-world"><canvas width="'+W*1.5+'" height="'+H*1.5+'" aria-label="'+label+'"></canvas></div><div class="fp-control"></div><div class="fp-foot"><span>'+help+'</span><output></output></div></section>';
 const scene=host.querySelector('.fp-world'),canvas=scene.querySelector('canvas'),c=canvas.getContext('2d');
 c.scale(1.5,1.5);return {c,scene,canvas,control:host.querySelector('.fp-control'),result:host.querySelector('output')};
}
function hotspot(scene,label,x,y,click,width=120,height=67){
 const b=document.createElement('button');b.type='button';b.className='fp-hot';b.title=b.ariaLabel=label;
 Object.assign(b.style,{left:(x/W*100)+'%',top:(y/H*100)+'%',width:width/W*100+'%',height:height/H*100+'%'});b.onclick=click;scene.append(b);return b;
}
function cachedWorld(paint){let canvas=document.createElement('canvas');canvas.width=W*1.5;canvas.height=H*1.5;let c=canvas.getContext('2d');c.scale(1.5,1.5);paint(c);return ctx=>ctx.drawImage(canvas,0,0,W,H)}
window.ORTOPIA_FIELD={W,H,clamp,poly,line,ellipse,box,text,badge,tree,terrain,road,along,truck,person,siteShell,hotspot,cachedWorld};
})();
