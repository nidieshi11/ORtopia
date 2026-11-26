(() => {
'use strict';
const model = {"prices":[5.126777914237156,3.0713471003489596,4.376789426860091,3.226863575803699,4.453435041986437,5.240038363531216,2.8389986150855986,3.129723383642333],"runCost":[0.893001363636261,0.6382734739831037,0.6291344399715266,0.541515216140411,0.3794820239927374,0.5959625307987941,0.8704512093821468,0.583818597485444],"xs":[[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16],[0,4,8,12,16]],"ys":[[0.0,4.272350793582965,9.460205328647993,15.563563605195084,22.58242562322424],[0.0,4.892564341628823,10.833535327892392,17.82291295879071,25.860697234323776],[0.0,4.611117218412406,10.210330983627468,16.797641295645192,24.37304815446557],[0.0,4.98641674582531,11.041351365756043,18.1648038597922,26.35677422793378],[0.0,4.5702776381580374,10.119900484492797,16.64886853900428,24.157181801692484],[0.0,5.1671550955403545,11.441557711553642,18.823207848039864,27.312105504999014],[0.0,4.762497595686539,10.545530390448763,17.349098384286677,25.173201577200274],[0.0,5.2654084079758245,11.659118617660752,19.18113062905479,27.831444442157924]],"base":[9.191000771312845,7.431632751293526,8.873604041390198,7.114236021370879,8.873604041390198,7.114236021371083,5.354868001351763,3.5954999813324435],"stock":57.548681630812936,"lo":2.0,"hi":16,"ramp":1.7593680200193194,"transition":5,"startCost":2,"stopCost":1,"dt":1,"initialOn":1,"initialMW":7.431632751293526,"plans":{"11000000":[6.75936802,5.0,0.0,0.0,0.0,0.0,0.0,0.0],"11000001":[6.75936802,5.0,0.0,0.0,0.0,0.0,0.0,5.0],"11000011":[6.75936802,5.0,0.0,0.0,0.0,0.0,5.0,6.75936802],"11000110":[6.75936802,5.0,0.0,0.0,0.0,5.0,5.0,0.0],"11000111":[6.75936802,5.0,0.0,0.0,0.0,5.0,6.75936802,8.51873604],"11001100":[6.75936802,5.0,0.0,0.0,5.0,5.0,0.0,0.0],"11001110":[6.75936802,5.0,0.0,0.0,5.0,6.75936802,5.0,0.0],"11001111":[6.75936802,5.0,0.0,0.0,5.0,6.75936802,8.51873604,10.2781040601],"11100000":[8.51873604,6.75936802,5.0,0.0,0.0,0.0,0.0,0.0],"11100001":[8.51873604,6.75936802,5.0,0.0,0.0,0.0,0.0,5.0],"11100011":[8.51873604,6.75936802,5.0,0.0,0.0,0.0,5.0,6.75936802],"11100110":[8.51873604,6.75936802,5.0,0.0,0.0,5.0,5.0,0.0],"11100111":[8.51873604,6.75936802,5.0,0.0,0.0,5.0,6.75936802,8.51873604],"11110000":[9.1910007713,8.51873604,6.75936802,5.0,0.0,0.0,0.0,0.0],"11110001":[9.1910007713,8.51873604,6.75936802,5.0,0.0,0.0,0.0,5.0],"11110011":[9.1910007713,8.51873604,6.75936802,5.0,0.0,0.0,5.0,6.75936802],"11111000":[9.1910007713,10.2781040601,8.51873604,6.75936802,5.0,0.0,0.0,0.0],"11111001":[9.1910007713,10.2781040601,8.51873604,6.75936802,5.0,0.0,0.0,5.0],"11111100":[9.1910007713,10.9503687913,10.2781040601,8.51873604,6.75936802,5.0,0.0,0.0],"11111110":[9.1910007713,8.7734029265,10.5327709465,8.7734029265,8.51873604,6.75936802,5.0,0.0],"11111111":[9.1910007713,7.4316327513,8.8736040414,7.1142360214,8.8736040414,7.1142360214,5.3548680014,3.5954999813]},"rejected":{"00000000":[0,"Ramp-down limit prevents shutdown"],"00000001":[0,"Ramp-down limit prevents shutdown"],"00000010":[7,"Minimum uptime violated"],"00000011":[0,"Ramp-down limit prevents shutdown"],"00000100":[6,"Minimum uptime violated"],"00000101":[6,"Minimum uptime violated"],"00000110":[0,"Ramp-down limit prevents shutdown"],"00000111":[0,"Ramp-down limit prevents shutdown"],"00001000":[5,"Minimum uptime violated"],"00001001":[5,"Minimum uptime violated"],"00001010":[5,"Minimum uptime violated"],"00001011":[5,"Minimum uptime violated"],"00001100":[0,"Ramp-down limit prevents shutdown"],"00001101":[7,"Minimum downtime violated"],"00001110":[0,"Ramp-down limit prevents shutdown"],"00001111":[0,"Ramp-down limit prevents shutdown"],"00010000":[4,"Minimum uptime violated"],"00010001":[4,"Minimum uptime violated"],"00010010":[4,"Minimum uptime violated"],"00010011":[4,"Minimum uptime violated"],"00010100":[4,"Minimum uptime violated"],"00010101":[4,"Minimum uptime violated"],"00010110":[4,"Minimum uptime violated"],"00010111":[4,"Minimum uptime violated"],"00011000":[0,"Ramp-down limit prevents shutdown"],"00011001":[0,"Ramp-down limit prevents shutdown"],"00011010":[6,"Minimum downtime violated"],"00011011":[6,"Minimum downtime violated"],"00011100":[0,"Ramp-down limit prevents shutdown"],"00011101":[7,"Minimum downtime violated"],"00011110":[0,"Ramp-down limit prevents shutdown"],"00011111":[0,"Ramp-down limit prevents shutdown"],"00100000":[3,"Minimum uptime violated"],"00100001":[3,"Minimum uptime violated"],"00100010":[3,"Minimum uptime violated"],"00100011":[3,"Minimum uptime violated"],"00100100":[3,"Minimum uptime violated"],"00100101":[3,"Minimum uptime violated"],"00100110":[3,"Minimum uptime violated"],"00100111":[3,"Minimum uptime violated"],"00101000":[3,"Minimum uptime violated"],"00101001":[3,"Minimum uptime violated"],"00101010":[3,"Minimum uptime violated"],"00101011":[3,"Minimum uptime violated"],"00101100":[3,"Minimum uptime violated"],"00101101":[3,"Minimum uptime violated"],"00101110":[3,"Minimum uptime violated"],"00101111":[3,"Minimum uptime violated"],"00110000":[0,"Ramp-down limit prevents shutdown"],"00110001":[0,"Ramp-down limit prevents shutdown"],"00110010":[7,"Minimum uptime violated"],"00110011":[0,"Ramp-down limit prevents shutdown"],"00110100":[5,"Minimum downtime violated"],"00110101":[5,"Minimum downtime violated"],"00110110":[5,"Minimum downtime violated"],"00110111":[5,"Minimum downtime violated"],"00111000":[0,"Ramp-down limit prevents shutdown"],"00111001":[0,"Ramp-down limit prevents shutdown"],"00111010":[6,"Minimum downtime violated"],"00111011":[6,"Minimum downtime violated"],"00111100":[0,"Ramp-down limit prevents shutdown"],"00111101":[7,"Minimum downtime violated"],"00111110":[0,"Ramp-down limit prevents shutdown"],"00111111":[0,"Ramp-down limit prevents shutdown"],"01000000":[1,"Minimum downtime violated"],"01000001":[1,"Minimum downtime violated"],"01000010":[1,"Minimum downtime violated"],"01000011":[1,"Minimum downtime violated"],"01000100":[1,"Minimum downtime violated"],"01000101":[1,"Minimum downtime violated"],"01000110":[1,"Minimum downtime violated"],"01000111":[1,"Minimum downtime violated"],"01001000":[1,"Minimum downtime violated"],"01001001":[1,"Minimum downtime violated"],"01001010":[1,"Minimum downtime violated"],"01001011":[1,"Minimum downtime violated"],"01001100":[1,"Minimum downtime violated"],"01001101":[1,"Minimum downtime violated"],"01001110":[1,"Minimum downtime violated"],"01001111":[1,"Minimum downtime violated"],"01010000":[1,"Minimum downtime violated"],"01010001":[1,"Minimum downtime violated"],"01010010":[1,"Minimum downtime violated"],"01010011":[1,"Minimum downtime violated"],"01010100":[1,"Minimum downtime violated"],"01010101":[1,"Minimum downtime violated"],"01010110":[1,"Minimum downtime violated"],"01010111":[1,"Minimum downtime violated"],"01011000":[1,"Minimum downtime violated"],"01011001":[1,"Minimum downtime violated"],"01011010":[1,"Minimum downtime violated"],"01011011":[1,"Minimum downtime violated"],"01011100":[1,"Minimum downtime violated"],"01011101":[1,"Minimum downtime violated"],"01011110":[1,"Minimum downtime violated"],"01011111":[1,"Minimum downtime violated"],"01100000":[1,"Minimum downtime violated"],"01100001":[1,"Minimum downtime violated"],"01100010":[1,"Minimum downtime violated"],"01100011":[1,"Minimum downtime violated"],"01100100":[1,"Minimum downtime violated"],"01100101":[1,"Minimum downtime violated"],"01100110":[1,"Minimum downtime violated"],"01100111":[1,"Minimum downtime violated"],"01101000":[1,"Minimum downtime violated"],"01101001":[1,"Minimum downtime violated"],"01101010":[1,"Minimum downtime violated"],"01101011":[1,"Minimum downtime violated"],"01101100":[1,"Minimum downtime violated"],"01101101":[1,"Minimum downtime violated"],"01101110":[1,"Minimum downtime violated"],"01101111":[1,"Minimum downtime violated"],"01110000":[1,"Minimum downtime violated"],"01110001":[1,"Minimum downtime violated"],"01110010":[1,"Minimum downtime violated"],"01110011":[1,"Minimum downtime violated"],"01110100":[1,"Minimum downtime violated"],"01110101":[1,"Minimum downtime violated"],"01110110":[1,"Minimum downtime violated"],"01110111":[1,"Minimum downtime violated"],"01111000":[1,"Minimum downtime violated"],"01111001":[1,"Minimum downtime violated"],"01111010":[1,"Minimum downtime violated"],"01111011":[1,"Minimum downtime violated"],"01111100":[1,"Minimum downtime violated"],"01111101":[1,"Minimum downtime violated"],"01111110":[1,"Minimum downtime violated"],"01111111":[1,"Minimum downtime violated"],"10000000":[1,"Ramp-down limit prevents shutdown"],"10000001":[1,"Ramp-down limit prevents shutdown"],"10000010":[7,"Minimum uptime violated"],"10000011":[1,"Ramp-down limit prevents shutdown"],"10000100":[6,"Minimum uptime violated"],"10000101":[6,"Minimum uptime violated"],"10000110":[1,"Ramp-down limit prevents shutdown"],"10000111":[1,"Ramp-down limit prevents shutdown"],"10001000":[5,"Minimum uptime violated"],"10001001":[5,"Minimum uptime violated"],"10001010":[5,"Minimum uptime violated"],"10001011":[5,"Minimum uptime violated"],"10001100":[1,"Ramp-down limit prevents shutdown"],"10001101":[7,"Minimum downtime violated"],"10001110":[1,"Ramp-down limit prevents shutdown"],"10001111":[1,"Ramp-down limit prevents shutdown"],"10010000":[4,"Minimum uptime violated"],"10010001":[4,"Minimum uptime violated"],"10010010":[4,"Minimum uptime violated"],"10010011":[4,"Minimum uptime violated"],"10010100":[4,"Minimum uptime violated"],"10010101":[4,"Minimum uptime violated"],"10010110":[4,"Minimum uptime violated"],"10010111":[4,"Minimum uptime violated"],"10011000":[1,"Ramp-down limit prevents shutdown"],"10011001":[1,"Ramp-down limit prevents shutdown"],"10011010":[6,"Minimum downtime violated"],"10011011":[6,"Minimum downtime violated"],"10011100":[1,"Ramp-down limit prevents shutdown"],"10011101":[7,"Minimum downtime violated"],"10011110":[1,"Ramp-down limit prevents shutdown"],"10011111":[1,"Ramp-down limit prevents shutdown"],"10100000":[2,"Minimum downtime violated"],"10100001":[2,"Minimum downtime violated"],"10100010":[2,"Minimum downtime violated"],"10100011":[2,"Minimum downtime violated"],"10100100":[2,"Minimum downtime violated"],"10100101":[2,"Minimum downtime violated"],"10100110":[2,"Minimum downtime violated"],"10100111":[2,"Minimum downtime violated"],"10101000":[2,"Minimum downtime violated"],"10101001":[2,"Minimum downtime violated"],"10101010":[2,"Minimum downtime violated"],"10101011":[2,"Minimum downtime violated"],"10101100":[2,"Minimum downtime violated"],"10101101":[2,"Minimum downtime violated"],"10101110":[2,"Minimum downtime violated"],"10101111":[2,"Minimum downtime violated"],"10110000":[2,"Minimum downtime violated"],"10110001":[2,"Minimum downtime violated"],"10110010":[2,"Minimum downtime violated"],"10110011":[2,"Minimum downtime violated"],"10110100":[2,"Minimum downtime violated"],"10110101":[2,"Minimum downtime violated"],"10110110":[2,"Minimum downtime violated"],"10110111":[2,"Minimum downtime violated"],"10111000":[2,"Minimum downtime violated"],"10111001":[2,"Minimum downtime violated"],"10111010":[2,"Minimum downtime violated"],"10111011":[2,"Minimum downtime violated"],"10111100":[2,"Minimum downtime violated"],"10111101":[2,"Minimum downtime violated"],"10111110":[2,"Minimum downtime violated"],"10111111":[2,"Minimum downtime violated"],"11000010":[7,"Minimum uptime violated"],"11000100":[6,"Minimum uptime violated"],"11000101":[6,"Minimum uptime violated"],"11001000":[5,"Minimum uptime violated"],"11001001":[5,"Minimum uptime violated"],"11001010":[5,"Minimum uptime violated"],"11001011":[5,"Minimum uptime violated"],"11001101":[7,"Minimum downtime violated"],"11010000":[3,"Minimum downtime violated"],"11010001":[3,"Minimum downtime violated"],"11010010":[3,"Minimum downtime violated"],"11010011":[3,"Minimum downtime violated"],"11010100":[3,"Minimum downtime violated"],"11010101":[3,"Minimum downtime violated"],"11010110":[3,"Minimum downtime violated"],"11010111":[3,"Minimum downtime violated"],"11011000":[3,"Minimum downtime violated"],"11011001":[3,"Minimum downtime violated"],"11011010":[3,"Minimum downtime violated"],"11011011":[3,"Minimum downtime violated"],"11011100":[3,"Minimum downtime violated"],"11011101":[3,"Minimum downtime violated"],"11011110":[3,"Minimum downtime violated"],"11011111":[3,"Minimum downtime violated"],"11100010":[7,"Minimum uptime violated"],"11100100":[6,"Minimum uptime violated"],"11100101":[6,"Minimum uptime violated"],"11101000":[4,"Minimum downtime violated"],"11101001":[4,"Minimum downtime violated"],"11101010":[4,"Minimum downtime violated"],"11101011":[4,"Minimum downtime violated"],"11101100":[4,"Minimum downtime violated"],"11101101":[4,"Minimum downtime violated"],"11101110":[4,"Minimum downtime violated"],"11101111":[4,"Minimum downtime violated"],"11110010":[7,"Minimum uptime violated"],"11110100":[5,"Minimum downtime violated"],"11110101":[5,"Minimum downtime violated"],"11110110":[5,"Minimum downtime violated"],"11110111":[5,"Minimum downtime violated"],"11111010":[6,"Minimum downtime violated"],"11111011":[6,"Minimum downtime violated"],"11111101":[7,"Minimum downtime violated"]}};
// End of instance data
const drafts = new WeakMap();
const baseBits = '11111111';
const fmt = (v,n=2) => Number(v).toFixed(n);
const sum = values => values.reduce((s,x)=>s+x,0);
const clip = (v,a,b) => Math.max(a,Math.min(b,v));
function objective(bits, power) {
 let result = 0;
 for(let i=0;i<8;i++){
  const x=power[i], values=model.ys[i], knots=model.xs[i];
  const j=Math.min(knots.length-2,knots.slice(1).filter(k=>x>k).length);
  const cost=values[j]+(x-knots[j])*(values[j+1]-values[j])/(knots[j+1]-knots[j]);
  const on=+bits[i],prev=i?+bits[i-1]:model.initialOn;
  result+=cost*model.dt+on*model.runCost[i]+Math.max(0,on-prev)*model.startCost
          +Math.max(0,prev-on)*model.stopCost-model.prices[i]*x;
 }
 return result;
}
function inspect(bits, x) {
 let used=0;
 for(let i=0;i<8;i++){
  const bit=+bits[i], prev=i?+bits[i-1]:model.initialOn, previous=i?x[i-1]:model.initialMW;
  if(model.rejected[bits]?.[0]===i)return model.rejected[bits];
  if(x[i]<bit*model.lo-1e-6||x[i]>bit*model.hi+1e-6)return [i,'Output exceeds unit capacity'];
  if(x[i]-previous>(prev?model.ramp:model.transition)+1e-6)return [i,'Load increase too fast'];
  if(previous-x[i]>(bit?model.ramp:model.transition)+1e-6)return [i,bit?'Load reduction too fast':'The output before shutdown is too high'];
  used+=x[i];
  if(used>model.stock+1e-6)return [i,'Insufficient fuel credit'];
 }
 return null;
}
const fresh = () => ({bits:baseBits,x:[...model.base]});
function compare(i) {
 const result=fresh();
 if(i===1){result.x[1]+=.25;result.x[2]-=.25;}
 else if(i===2||i===3){result.x[3]+=.25;result.x[2]-=.25;}
 else if(i===4){result.x[3]+=.25;result.x[4]-=.25;}
 else result.x.fill(model.stock/8);
 return result;
}
function drawPlant(canvas, state, period, fault, t){
 const cssWidth=canvas.clientWidth;
 if(!cssWidth)return;
 const dpi=Math.min(devicePixelRatio||1,2);
 const w=Math.round(cssWidth*dpi), h=Math.round(w*330/900);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const c=canvas.getContext('2d'); c.setTransform(w/900,0,0,h/330,0,0);
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const circ=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const poly=(pts,fill,stroke,width=1)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}};
 const ring=(x,y,r,col,lw)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=lw;c.stroke();};
 const line=(x1,y1,x2,y2,col,lw=1)=>poly([[x1,y1],[x2,y2]],null,col,lw);
 const text=(str,x,y,size,col,align='left')=>{c.font='600 '+size+'px "Microsoft YaHei", sans-serif';c.textAlign=align;c.fillStyle=col;c.fillText(str,x,y);};
 const sky=c.createLinearGradient(0,0,0,330);sky.addColorStop(0,'#102936');sky.addColorStop(.62,'#557778');sky.addColorStop(1,'#20332f');rect(0,0,900,330,sky);
 const invalid=fault&&fault[0]<=period;
 const power=invalid?0:state.x[period];
 const lastValid=invalid?fault[0]:period;
 const before=sum(state.x.slice(0,lastValid));
 const frac=clip(t/6,0,1), left=clip(model.stock-before-power*frac,0,model.stock);
 const fuelFraction=left/model.stock, load=power/model.hi;
 const hot=power>1e-6;
 const phase=hot?t*(.3+1.7*load):0;
 // Distant ridge, raised roadway and city silhouettes give the entire path one physical location.
 circ(671,43,16,'#d8d6b3');
 poly([[0,92],[72,74],[149,80],[219,57],[259,68],[357,48],[395,54],[481,43],[536,62],[622,48],[680,68],[790,52],[900,78],[900,164],[0,164]],'#385458');
 poly([[0,108],[92,91],[168,111],[272,83],[354,92],[462,71],[538,96],[633,74],[735,95],[809,80],[900,99],[900,172],[0,172]],'#496665');
 for(let j=0;j<45;j++){const x=j*22, top=118-((j*17)%27);rect(x,top,10+j%10,156-top,'#405757');}
 rect(0,165,900,165,'#273c3c');rect(0,296,900,34,'#23312f');
 for(let j=0;j<11;j++)line(-60+j*100,329,115+j*100,241,'#344440',1);
 for(const y of [307,324])line(0,y,900,y,'#40504a');
 // Steel frame of the main hall.
 poly([[184,120],[235,83],[550,83],[601,118],[601,127],[184,127]],'#314c52','#8ba5a3',2);
 for(let i=0;i<7;i++){const x=201+i*56;poly([[x,119],[x+27,97],[x+52,119]],null,'#58757a',2);}
 rect(191,125,404,161,'#233c42');rect(195,136,398,13,'#304d54');
 for(let j=0;j<9;j++){const x=202+j*43;rect(x,150,33,36,'#456166');line(x,168,x+33,168,'#354e51',2);line(x+16,150,x+16,186,'#354e51',2);}
 for(const x of [193,394,590]){rect(x,127,5,164,'#607b7d');rect(x-4,285,13,5,'#718384');}
 // Feedstock bunker and its triangular discharge throat.
 rect(20,268,125,10,'#647776');
 for(const x of [37,112]){rect(x,154,6,116,'#738889');line(x,262,x+(x<80?63:-63),205,'#6b8383',3);}
 poly([[25,113],[139,113],[139,174],[94,216],[74,216],[25,174]],'#1b2e33','#a3b7ae',3);
 const bin=[[28,115],[136,115],[136,172],[93,212],[75,212],[28,173]];
 c.save();c.beginPath();bin.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 const fy=214-fuelFraction*94;
 poly([[20,fy+5],[53,fy-3],[77,fy+1],[103,fy-6],[142,fy],[142,221],[20,221]],'#ad7547');
 for(let j=0;j<130;j++){let y=fy+(j*47%100),x=25+(j*31%116);circ(x,y,1.4+(j%3)*.6,['#c8955f','#916444','#d4a174','#a2714a'][j%4]);}
 c.restore();
 for(const y of [128,143,158,173])line(26,y,36,y,'#d2d0b4',2);
 rect(70,213,30,7,'#82918a');
 // Cleated belt transporting actual fuel into the combustion chamber.
 poly([[38,241],[217,180],[223,191],[45,251]],'#192d31','#8ba19a',3);
 for(const [x,y] of [[45,245],[219,185]]){
  circ(x,y,5.4,'#a1a89c');circ(x,y,3.4,'#445e5b');
  line(x-3*Math.cos(phase*5),y-3*Math.sin(phase*5),x+3*Math.cos(phase*5),y+3*Math.sin(phase*5),'#c5c6a7',1.5);
 }
 for(const x of [52,111,166]){let y=243-(x-42)*.336;line(x,y+6,x-8,282,'#586f70',5);line(x,y+6,x+28,282,'#4b6365',3);}
 for(let i=0;i<22;i++){const u=((i/22+phase*.12)%1);const x=45+u*173,y=238-u*58;line(x,y,x+3,y+5,'#b3a280',2);}
 if(hot){for(let i=0;i<Math.ceil(4+load*10);i++){const u=(i/(Math.ceil(4+load*10))+phase*.12)%1;const x=80+u*140,y=224-u*46;poly([[x-4,y],[x-1,y-4],[x+3,y-3],[x+5,y]],'#c6925e');}}
 // Boiler with cutaway refractory face and a moving flame bed.
 rect(227,140,113,126,'#778887');rect(234,148,98,108,'#24373a');
 poly([[229,148],[239,160],[239,242],[230,255]],'#586d70');rect(244,166,82,78,'#342d2b');
 if(hot){const glow=c.createRadialGradient(285,229,3,285,213,50);glow.addColorStop(0,'#ffc977');glow.addColorStop(.5,'#cb653b');glow.addColorStop(1,'#492f2b');rect(244,166,82,78,glow);
 for(let j=0;j<12;j++){const x=243+j*6.8;const height=(14+44*load)*(1+.24*Math.sin(phase*8+j*1.7));poly([[x,240],[x+1,230],[x+4+Math.sin(phase*5+j)*4,242-height],[x+10,240]],j%2?'#f7a952':'#ffdc87');}}
 for(let j=0;j<7;j++){rect(242+j*13,244,7,4,'#c1a88b');}
 poly([[216,178],[224,178],[246,197],[246,208],[220,188]],'#7e8980','#b6b9a2',1.4);
 if(hot){for(let j=0;j<3;j++){
  const u=(phase*1.6+j/3)%1;
  circ(219+u*28,178+u*u*24,2.2,'#e0ac70');
  circ(84+Math.sin(j)*3,218+u*u*6,1.8,'#dba96d');
 }}
 rect(240,263,91,7,'#364c4d');rect(223,272,121,13,'#607470');
 rect(251,98,56,42,'#496267');rect(267,43,20,63,'#a38067');rect(265,38,24,8,'#b4a598');rect(267,56,20,7,'#d2b497');rect(267,73,20,6,'#d2b497');
 if(hot){for(let j=0;j<8;j++){const u=(phase*.17+j/8)%1;circ(277+u*40,37-u*38,3+u*9,'rgba(211,225,219,'+((1-u)*.22)+')');}}
 const steam=[[320,164],[350,164],[350,116],[443,116],[443,193]];
 c.lineJoin='round';c.lineCap='round';poly(steam,null,'#172c33',13);poly(steam,null,'#9baaaa',9);poly(steam,null,'#526f75',5);
 function dotPath(path,u,r,color){let total=0;const lens=[];for(let a=1;a<path.length;a++){const d=Math.hypot(path[a][0]-path[a-1][0],path[a][1]-path[a-1][1]);lens.push(d);total+=d;}let y=(u%1)*total;for(let j=0;j<lens.length;j++){if(y<=lens[j]){let f=y/lens[j];circ(path[j][0]+f*(path[j+1][0]-path[j][0]),path[j][1]+f*(path[j+1][1]-path[j][1]),r,color);return;}y-=lens[j];}}
 if(hot){for(let j=0;j<6;j++)dotPath(steam,j/6+phase*.35,2.4,'#f6da94');}
 // Section through the turbine casing. The real shaft visibly couples the turbine and generator.
 rect(403,259,168,14,'#6b7e77');rect(411,244,30,16,'#52676b');rect(503,243,40,17,'#52676b');
 rect(443,213,87,8,'#c1b189');
 circ(445,218,40,'#162c31');ring(445,218,36,'#95a9a3',5);circ(445,218,29,'#37545a');
 c.save();c.translate(445,218);c.rotate(hot?phase*3.6:0);
 for(let j=0;j<10;j++){c.rotate(Math.PI/5);poly([[3,-4],[23,-12],[29,-5],[15,3],[6,4]],'#bcc7b4','#849c96');}c.restore();circ(445,218,9,'#b58957');circ(445,218,3,'#c2cebe');
 rect(491,198,56,44,'#71867e');rect(491,205,56,28,'#466560');for(let j=0;j<8;j++)rect(494+j*7,200,3,38,'#82948a');circ(551,219,15,'#3c5451');circ(551,219,8,'#84978b');
 const wire=[[554,215],[579,215],[579,177],[634,177],[634,201],[671,201],[671,146],[755,146],[755,174],[798,174]];
 poly(wire,null,'#93aea9',3);if(hot){for(let j=0;j<Math.ceil(4+load*8);j++)dotPath(wire,j/Math.ceil(4+load*8)+phase*.23,2.8,'#a0ffe0');}
 // Substation insulators and a small urban feeder.
 rect(609,228,85,26,'#4f6966');rect(605,254,95,9,'#87978a');for(const x of [618,641,664]){rect(x,201,11,27,'#6f827d');for(let j=0;j<4;j++)rect(x-3,202+j*5,17,2.6,'#aec0b4');}
 for(let j=0;j<6;j++)rect(613+j*13,236,6,11,'#728980');
 for(let j=0;j<4;j++){const x=720+j*40,top=[193,164,180,144][j];rect(x,top,31,269-top,'#2b4548');rect(x-3,top-3,37,5,'#7c9290');
 for(let k=0;k<12;k++){const cx=x+5+(k%3)*8,cy=top+8+Math.floor(k/3)*12;rect(cx,cy,4,7,(hot&&k/14<load+.09)?'#f8d18c':'#496369');}}
 // Site signage belongs to the equipment and stays in place as the machinery responds.
 const plate=(x,y,str)=>{c.font='600 12px "Microsoft YaHei",sans-serif';const tw=c.measureText(str).width;rect(x-tw/2-6,y-13,tw+12,19,'#223538');text(str,x,y,12,'#edebd8','center');};
 if(cssWidth>500){plate(84,93,'fuel tank');plate(280,294,'Boiler');plate(481,291,'turbine generator');plate(651,282,'booster station');plate(814,290,'Electricity area');}
 if(invalid){rect(231,154,99,11,'#ae614a');}
 return left;
}

function mount(host,onInteract,index=0,onNode,replayAction){
 let st=drafts.get(host);
 if(!st){st=fresh();drafts.set(host,st);}
 const period=Math.max(0,Math.min(7,index));
 let alt=null, fault=null, frameTime=0;
 host.innerHTML='<section class="ff57"><div class="ff57-world"><canvas aria-label="Cross-section of a thermal power station: fuel enters the boiler on the conveyor belt, and the steam drives the turbine and is sent to the power consumption area through the booster station."></canvas><div class="ff57-hud"><div><span>No. <b data-slot></b> Period</span><strong data-mode57></strong></div><div><span>remaining fuel</span><strong data-stock></strong></div><div><span>Power generation</span><strong data-delivery></strong></div></div></div><div class="ff57-desk"><div class="ff57-bar"><strong>Eight-phase power generation plan</strong><span data-score></span></div><div class="ff57-rail" role="group" aria-label="Select scheduling period"></div><div class="ff57-keys"><i></i>contribute <b></b>Electricity price</div><div class="ff57-control"><button type="button" data-toggle></button><label>Current output <input data-throttle type="range" min="2" max="16" step=".05"><output data-set></output></label></div><div class="ff57-bottom"><strong data-feedback role="status"></strong><div class="ff57-buttons"><button type="button" data-policy="auto">Optimize output by starting and stopping</button><button type="button" data-policy="cut">Shutdown for the last two phases</button><button type="button" data-policy="equal">evenly distribute fuel</button><button type="button" data-policy="reset">Restore original solution</button></div></div></div></section>';
 const q=s=>host.querySelector(s);
 const breaker=document.createElement('button');
 breaker.type='button';breaker.className='ff57-switch';
 breaker.title='Switch the current unit start and stop';breaker.setAttribute('aria-label','Switch the current unit start and stop at the boiler site');
 q('.ff57-world').append(breaker);
 const canvas=q('canvas'),stock=q('[data-stock]'),delivery=q('[data-delivery]'),mode=q('[data-mode57]');
 q('[data-slot]').textContent=String(period+1);
 const rail=q('.ff57-rail');
 rail.innerHTML=model.prices.map((p,i)=>'<button type="button" data-t57="'+i+'" aria-pressed="'+(period===i)+'" aria-label="No. '+(i+1)+' period, electricity price '+fmt(p)+'"><span class="ff57-period">'+(i+1)+' Period</span><span class="ff57-chart"><i></i><b style="bottom:'+fmt(p/6*100,1)+'%"></b></span><span class="ff57-mw"></span></button>').join('');
 const current=()=>alt||st;
 function refresh(){
  const state=current();
  fault=inspect(state.bits,state.x);
  const score=objective(state.bits,state.x);
  q('[data-score]').textContent=fault?'The plan needs to be revised':'Net income for the eighth period '+fmt(-score);
  q('[data-feedback]').textContent=fault?'No. '+(fault[0]+1)+' period lock · '+fault[1]:'Feasible · Materials for eight phases '+fmt(sum(state.x))+' / '+fmt(model.stock);
  q('[data-feedback]').classList.toggle('fault',!!fault);
  host.querySelectorAll('[data-t57]').forEach((cell,i)=>{
   cell.querySelector('.ff57-chart i').style.height=(100*state.x[i]/model.hi)+'%';
   cell.querySelector('.ff57-mw').textContent=state.bits[i]==='0'?'Offline':fmt(state.x[i],1);
   cell.classList.toggle('is-off',state.bits[i]==='0');
   cell.classList.toggle('is-locked',fault?.[0]===i);
   cell.title='No. '+(i+1)+' Issue · Contribution '+fmt(state.x[i])+' MW · Electricity price '+fmt(model.prices[i]);
  });
  const on=state.bits[period]==='1';
  q('[data-toggle]').textContent=on?'Shut down this unit':'Start this unit';
  breaker.setAttribute('aria-pressed',String(on));breaker.textContent=on?'⏻ Offline':'⏻ Power on';
  const throttle=q('[data-throttle]');throttle.disabled=!on;throttle.value=state.x[period];
  q('[data-set]').textContent=fmt(state.x[period])+' MW';
  q('[data-policy="auto"]').disabled=!model.plans[state.bits];
  draw(frameTime);
 }
 function draw(t){
  frameTime=t;
  const state=current();
  const remaining=drawPlant(canvas,state,period,fault,t);
  if(remaining===undefined)return;
  const blocked=fault&&fault[0]<=period;
  mode.textContent=blocked?'Scheduling blocking':state.bits[period]==='1'?'Grid-connected power generation':'Unit stalled';
  stock.textContent=fmt(remaining,1);
  delivery.textContent=fmt(blocked?0:state.x[period],1)+' MW';
 }
 function edit(){onInteract?.();alt=null;}
 function apply(timeSlot){
  refresh();
  if(timeSlot!==undefined&&timeSlot!==period&&onNode)onNode(timeSlot);
  else replayAction?.();
 }
 rail.onclick=e=>{const cell=e.target.closest('[data-t57]');if(cell)onNode?.(+cell.dataset.t57);};
 q('[data-toggle]').onclick=()=>{
  edit();const bits=st.bits.split('');
  bits[period]=bits[period]==='1'?'0':'1';
  st.bits=bits.join('');
  if(model.plans[st.bits])st.x=[...model.plans[st.bits]];
  else st.x[period]=+bits[period]?model.lo:0;
  apply();
 };
 breaker.onclick=()=>q('[data-toggle]').click();
 const slider=q('[data-throttle]');
 slider.oninput=()=>{edit();st.x[period]=+slider.value;refresh();};
 slider.onchange=()=>apply();
 host.querySelectorAll('[data-policy]').forEach(b=>b.onclick=()=>{
  edit();
  switch(b.dataset.policy){
   case 'cut':st.bits='11111100';st.x=[...model.plans[st.bits]];apply(6);return;
   case 'equal':st.bits=baseBits;st.x=Array(8).fill(model.stock/8);break;
   case 'reset':Object.assign(st,fresh());break;
   case 'auto':if(model.plans[st.bits])st.x=[...model.plans[st.bits]];break;
  }
  apply();
 });
 host.previewDecision=opt=>{alt=opt?compare(period):null;refresh();};
 host.sceneFrame=draw;
 refresh();
}
window.ORTOPIA_FIELD_P0057={mount};
})();

