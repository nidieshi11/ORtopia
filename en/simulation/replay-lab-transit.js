/* Instance-derived transit, flight and parcel dispatch replays. Coordinates below are
 * presentation coordinates unless converted directly from a field-scene geometry. */
(() => {
  'use strict';
  const labs = window.ORTOPIA_LABS;
  const W = 900, H = 360;
  const ink = '#163441', muted = '#4c6770', green = '#007a69', mint = '#67d4a6', gold = '#f3bc59', red = '#ca5943';
  const clamp = x => Math.max(0, Math.min(1, x));
  const interp = (a, b, p) => a + (b - a) * clamp(p);
  const pos = (t, a, b) => b <= a ? Number(t >= b) : clamp((t - a) / (b - a));
  const last = (list, test) => { for (let i = list.length - 1; i >= 0; i--) if (test(list[i])) return list[i]; };
  const fixed = (v, n = 1) => v.toFixed(n);
  function stage(canvas, bg) {
    const c = canvas.getContext('2d');
    c.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    c.globalAlpha = 1;
    c.lineCap = 'round'; c.lineJoin = 'round';
    rect(c, 0, 0, W, H, bg);
    return c;
  }
  function rect(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(x, y, w, h); }
  function round(c, x, y, w, h, r, color) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = color; c.fill(); }
  function path(c, points, color, width = 2, fill = false) {
    c.beginPath(); points.forEach(([x, y], j) => j ? c.lineTo(x, y) : c.moveTo(x, y));
    if (fill) { c.closePath(); c.fillStyle = color; c.fill(); } else { c.strokeStyle = color; c.lineWidth = width; c.stroke(); }
  }
  function line(c, x, y, xx, yy, color, width = 2) { path(c, [[x, y], [xx, yy]], color, width); }
  function circ(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, 2*Math.PI); c.fillStyle = color; c.fill(); }
  function words(c, s, x, y, size = 13, color = ink, weight = 500, align = 'left') {
    c.font = weight + ' ' + size + 'px "Microsoft YaHei","Noto Sans SC",sans-serif'; c.fillStyle = color;
    c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y);
  }
  function silhouette(c, x, y, scale, coat) {
    c.save(); c.translate(x,y); c.scale(scale,scale);
    circ(c,0,-14,3,'#b78067'); round(c,-3,-11,6,8,2,coat);
    line(c,-1,-4,-2,0,ink,2); line(c,1,-4,3,0,ink,2); c.restore();
  }
  function city(c, horizon, tint, h = 1) {
    for (let i=0;i<24;i++) {
      const x=i*42-20, hei=(12+((i*23+13)%44))*h;
      rect(c,x,horizon-hei,27+(i%3)*5,hei,tint);
      for (let j=0;j<4;j++) if (hei>j*10+8)
        for (let q=0;q<3;q++) rect(c,x+4+q*7,horizon-hei+5+j*10,3,3,'#ffffff55');
    }
  }
  function clock(t, offset = 0) {
    const s = Math.floor(t + offset);
    return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join(':');
  }
  function marker(c, text, x, y, bg = ink) {
    const width = 14 + [...String(text)].reduce((v,k)=>v+(/[\x00-\x7F]/.test(k)?7:13),0);
    round(c,x,y,width,22,5,bg); words(c,text,x+7,y+11,12,'#fff',650);
  }

  labs.P0092 = {
    title:"Victoria Line interruption and turnaround", action:"Select the return departure interval on both sides",
    choices:["200 / 300 seconds · Archive","200 / 200 seconds","350 / 300 seconds"],
    scope:"The picture below captures the return operation of the London Underground after disruption. Stations are arranged according to line mileage, and platform panels are updated according to departure events. Costs cover the entire solution period.",
    frame(d,k,f) {
      const plan=d.scenarios[k], t=interp(...d.bounds,f);
      const trains=[];
      plan.trains.forEach(([id,agent,stations,times])=>{
        if(t<times[0] || t>times[times.length-1]) return;
        let j=0; while(j<times.length-2 && t>times[j+1]) j++;
        // The archived event times include 25 seconds of dwell at each intermediate station.
        const departure=times[j]+(j===0?0:25);
        trains.push({id,agent,a:stations[j],b:stations[j+1],p:pos(t,departure,times[j+1])});
      });
      const platforms=[9,10].map(s=>{
        const rows=plan.platforms.filter(e=>e[1]===s), before=last(rows,e=>e[0]<=t), next=rows.find(e=>e[0]>t);
        const flow=d.flows[s===9?0:1],since=before?before[0]:d.flowStart;
        const arrivals=flow.rates.reduce((n,r,j)=>{const lo=d.flowStart+60*j;return n+r*Math.max(0,Math.min(t,lo+60)-Math.max(since,lo))/60;},0);
        return {before,next,count:(before?before[3]:flow.initial)+arrivals};
      });
      return {t,trains,platforms,clock:clock(t,18000),metrics:[["Online return train",String(trains.length)],["Passenger waiting cost for the entire journey",'£'+fixed(plan.wait,2)],["total cost",'£'+fixed(plan.cost,2)]]};
    },
    draw(canvas,s,d) {
      const c=stage(canvas,'#e7eee9'); city(c,75,'#bbd0c7',.74);
      rect(c,0,75,900,148,'#213b45');
      const ds=[0]; d.segments.forEach(v=>ds.push(ds[ds.length-1]+v));
      const xs=ds.map(v=>35+829*v/ds[15]);
      round(c,xs[9]+5,91,xs[10]-xs[9]-10,110,6,'#503f41');
      for(let x=xs[9]+12;x<xs[10]-12;x+=14) line(c,x,185,x+12,169,'#946b60',3);
      words(c,"Blocked section",(xs[9]+xs[10])/2,104,12,'#ffd6bc',650,'center');
      [133,157].forEach(y=>{
        line(c,xs[0],y,xs[9],y,'#99c5b7',4);line(c,xs[10],y,xs[15],y,'#99c5b7',4);
        xs.forEach((x,i)=>{if(i<15 && i!==9) for(let q=x+8;q<xs[i+1];q+=9)line(c,q,y-4,q,y+4,'#75938d',1);});
      });
      xs.forEach((x,i)=>{circ(c,x,145,5,'#eef4e5');words(c,d.names[i],x,188+(i%2)*13,10,'#ceebe3',600,'center');});
      s.trains.forEach(n=>{
        const x=interp(xs[n.a],xs[n.b],n.p),dir=n.b>n.a?1:-1,y=dir>0?133:157;
        round(c,x-11,y-7,22,10,4,n.agent?gold:mint);
        for(let j=-7;j<=4;j+=5) rect(c,x+j,y-5,3,3,ink);
        circ(c,x+9*dir,y,1.5,'#fff');
      });
      marker(c,'VICTORIA  LINE',18,15);
      s.platforms.forEach(({before,next,count},idx)=>{
        const x=idx?456:18,station=idx?'HAI':'KSX';
        round(c,x,233,425,111,8,'#f9f7ee'); words(c,station+"  Return to the platform",x+14,252,15,ink,700);
        const near=before && s.t-before[0]<20;
        // The close-up collapses fractional OD demand into one figure per five passenger-equivalents.
        const qty = count + (near?before[4]*(1-pos(s.t,before[0],before[0]+20)):0);
        const n=Math.min(18,Math.ceil(qty/5));
        round(c,x+13,268,398,47,4,'#e0e4d6');
        for(let q=0;q<7;q++)line(c,x+21+q*61,271,x+21+q*61,307,'#c9cec1',2);
        const approach=next&&next[0]-s.t<24;
        if(near||approach){
          c.save();c.beginPath();c.rect(x+14,270,396,41);c.clip();
          const dx=near?pos(s.t,before[0],before[0]+20)*180:0;
          round(c,x+229+dx,279,Math.max(0,166-dx*.8),27,6,'#4c7274');
          for(let win=0;win<6;win++)if(x+238+dx+win*22<x+392)round(c,x+238+dx+win*22,283,14,9,2,'#cbe0d5');
          c.restore();
        }
        line(c,x+14,313,x+411,313,'#d9ac5e',3);
        for(let j=0;j<n;j++) silhouette(c,x+26+(j%12)*17+(near?pos(s.t,before[0],before[0]+20)*45:0),308-Math.floor(j/12)*15,.78,j%3?green:'#c17849');
        words(c,"Waiting "+fixed(count)+" Visitors"+(before?"   · Boarding to work "+fixed(before[4]):''),x+14,329,12,muted);
        words(c,next?("Get off work "+clock(next[0],18000)):'',x+410,252,12,green,650,'right');
      });
    }
  };
  labs.P0110 = {
    title:"Make an appointment for bus pick-up at the station",action:"Select the first departure time",choices:["Minute 0 · Archive","Minute 2","6th minute"],
    scope:"Observe pick-up at return stop 7 from minutes 36 to 112. Gold passengers have made reservations and green passengers are waiting on site. The number of people boarding the bus will be calculated based on the actual list when the bus departs. Comprehensive targets are calculated across the board.",
    frame(d,k,f) {
      const a=d.scenarios[k], t=interp(36,112,f);
      const prior=a.board.filter(z=>z[2]<=t), board=prior.reduce((n,z)=>n+z[3],0), reserved=prior.reduce((n,z)=>n+z[4],0);
      const arrived=d.arrivals.filter(z=>z[0]<=t), booked=arrived.filter(z=>z[1]).length-reserved, queue=arrived.length-board;
      const ride=a.routes.map((r,i)=>({id:i+1,rows:r,stop:r[19-d.station],visit:19-d.station}))
        .reduce((best,q)=>!best || Math.abs((q.stop[1]+q.stop[2])/2-t)<Math.abs((best.stop[1]+best.stop[2])/2-t)?q:best,null);
      const {stop,rows,visit}=ride, before=rows[visit-1], after=rows[visit+1];
      const x=t<stop[1]?interp(-110,489,pos(t,before[2],stop[1])): t<=stop[2]?489:interp(489,1060,pos(t,stop[2],after[1]));
      const row=a.board.find(e=>e[0]===ride.id), loading=t>=stop[1] && t<stop[2];
      const fleet=a.routes.flatMap((r,i)=>{
        if(t<r[0][1]||t>r[r.length-1][2])return [];
        let j=r.findIndex(z=>z[2]>=t);if(j<0)j=r.length-1;
        const where=j&&t<r[j][1]?interp(r[j-1][0],r[j][0],pos(t,r[j-1][2],r[j][1])):r[j][0];
        return [{where,returning:j>=10,id:i+1}];
      });
      return {t,x,ride,row,loading,queue,booked,fleet,clock:fixed(t,1)+" min",metrics:[["Waiting at the platform",queue+" people"],["Total waiting time",fixed(a.wait,1)+" Person·Min"],["Comprehensive goals",fixed(a.cost,5)]]};
    },
    draw(canvas,s,d) {
      const c=stage(canvas,'#d9edf1');city(c,96,'#a7c5c6');rect(c,0,96,900,78,'#abcbb6');
      line(c,0,115,900,115,'#6e9f8a',3);rect(c,0,174,900,88,'#dedbcc');rect(c,0,257,900,9,'#f8f4df');rect(c,0,266,900,94,'#657b83');
      for(let j=0;j<10;j++)rect(c,j*108,335,49,3,'#d4dddd');
      // Street shelter, seated bench and stop flag.
      round(c,270,109,236,13,3,'#396e6b');rect(c,279,122,7,115,'#4b7d79');rect(c,490,122,7,115,'#4b7d79');
      rect(c,289,124,197,79,'#d4e5dd');line(c,341,125,341,201,'#90b3a7',2);
      rect(c,304,201,94,6,'#a9794e');[310,388].forEach(x=>rect(c,x,207,4,26,ink));rect(c,536,98,5,149,'#466867');
      round(c,521,94,36,34,5,green);words(c,'7',539,111,19,'white',700,'center');
      marker(c,"Return platform 07",20,16);words(c,"Already booked",750,24,13,ink);circ(c,737,23,5,'#db9a37');circ(c,810,23,5,green);words(c,"On site",822,24);
      const n=Math.min(36,s.queue);
      for(let j=n-1;j>=0;j--) {
        const b=j<s.booked, xx=454-(j%18)*18, yy=244-Math.floor(j/18)*20;
        const shift=s.loading && j<s.row[3]?pos(s.t,s.ride.stop[1],s.ride.stop[2]):0;
        silhouette(c,interp(xx,538,shift),interp(yy,258,shift),1.15,b?'#db9a37':green);
      }
      if(s.x>-90 && s.x<1000){
        const x=s.x-83,y=219; round(c,x,y,165,53,11,'#e8f1db');rect(c,x+3,y+32,159,13,green);
        for(let j=0;j<6;j++)round(c,x+9+j*23,y+7,18,17,2,'#486c79');
        round(c,x+121,y+24,17,27,2,s.loading?ink:'#779f91');[29,137].forEach(dx=>{circ(c,x+dx,y+51,10,ink);circ(c,x+dx,y+51,4,'#87a09c');});
        words(c,'V'+s.row[1],x+12,y+38,10,'#fff',650);
      }
      const msg=s.loading?"Boarding · Current class "+s.row[3]+" people among whom reservations are made "+s.row[4]+" people":"Trip "+s.ride.id+" · Scheduled departure "+fixed(s.ride.stop[2],1)+" min";
      marker(c,msg,19,302);
      round(c,486,284,398,63,8,'#eef0df');
      words(c,"All flights in transit",499,299,12,ink,650);
      line(c,504,321,860,321,'#a6b8a8',2);
      for(let j=0;j<10;j++){const x=504+j*356/9;circ(c,x,321,j===d.station?4:2,j===d.station?'#a37634':muted);}
      s.fleet.forEach(v=>{const x=504+v.where*356/9,y=v.returning?326:312;round(c,x-6,y-3,12,6,2,v.id===s.ride.id?'#ab772a':green);});
      words(c,'0',504,339,9,muted,500,'center'); words(c,'7',504+7*356/9,339,10,muted,650,'center'); words(c,'9',860,339,9,muted,500,'center');
    }
  };

  function aircraft(c,x,y,angle,shade,time,freight=false) {
    c.save(); c.translate(x,y); c.rotate(angle);
    if(freight){
      line(c,-10,-5,10,5,ink,2);line(c,-10,5,10,-5,ink,2);
      for(const a of [-1,1])for(const b of [-1,1]){
        circ(c,a*10,b*6,4,'#41595e');const r=(time*5+a*b)%6.28;
        line(c,a*10-Math.cos(r)*5,b*6-Math.sin(r)*2,a*10+Math.cos(r)*5,b*6+Math.sin(r)*2,'#b8ebe5',1.8);
      }
      round(c,-6,-4,13,8,3,shade);
    }else{
      path(c,[[-10,-2],[-2,-2],[0,-10],[3,-11],[4,-2],[12,-1],[14,1],[4,3],[3,10],[0,10],[-2,3],[-10,4]],shade,1,true);
      line(c,4,0,9,0,ink,2);[[-1,-8],[0,8],[-8,-2]].forEach(([a,b])=>line(c,a-4,b,a+4,b,'#60888d',1.3));
    }
    c.restore();
  }
  labs.P0161 = {
    title:"Airshare rides and boarding time limits", action:"Assignment of return trip to the trio at Field 1",
    choices:["Take off at 24.8 minutes · Archive","Rescheduled to flight 27.6 minutes"],
    scope:"Beginning with the first takeoff at minute 12.2, observe four aircraft performing eight flight segments in the archive. After switching the return trip of the trio, the service revenue and non-service penalty will be re-accounted according to the application time, latest departure, seat and flight list.",
    frame(d,k,f) {
      const t=interp(d.flights.reduce((first,flight)=>Math.min(first,flight[4]),d.end),d.end,f), group=d.requests[0];
      const assigned=d.requests.map((r,i)=>{
        const fl=d.flights.find(a=>a[0]===(i===0&&k?2:r[7]) && a[1]===r[8]);
        return fl && fl[2]===r[0] && fl[3]===r[1] && fl[4]>=r[2] && fl[4]<=r[3] && r[4]<=d.seats ? fl : null;
      });
      const seats=(fl)=>assigned.reduce((v,a,i)=>v+(fl===a?d.requests[i][4]:0),0);
      const profit=assigned.reduce((v,fl,i)=>v+(fl?d.requests[i][5]:-d.requests[i][6]),-d.expense);
      const taken=assigned.reduce((v,fl,i)=>v+(fl && fl[5]<=t?d.requests[i][4]:0),0);
      const fleet=[0,1,2,3].map(id=>{
        const flights=d.flights.filter(x=>x[0]===id);
        const active=flights.find(x=>x[4]<=t&&t<x[5]), done=last(flights,x=>x[5]<=t);
        return active?{id,fl:active,a:active[2],b:active[3],p:pos(t,active[4],active[5]),count:seats(active)}:
          {id,a:done?done[3]:flights[0][2],p:0,count:0};
      });
      const status=t<group[2]?"Not yet reported":assigned[0]&&t>=assigned[0][5]?"Arrived":assigned[0]&&t>=assigned[0][4]?"Fly to field 0":t>group[3]?"Exceeded latest departure time":"Waiting at Airport 1";
      return {t,fleet,status,clock:fixed(t)+" min",metrics:[["threesome",status],["Passengers delivered",taken+" people"],["Program net benefit",fixed(profit,2)]]};
    },
    draw(canvas,s,d,k) {
      const c=stage(canvas,'#e4eee7'), map=d.nodes.map(([x,y])=>[68+x*33,242-(y-3)*29]);
      // The landing pads follow the coordinates of the instance. Blocks provide visual scale.
      for(let j=0;j<4;j++)for(let i=0;i<10;i++){
        const x=i*64-8,y=55+j*67;round(c,x,y,48,42,4,(i+j)%3?'#d0ded0':'#b5cfba');
        if((i+2*j)%4) {rect(c,x+8,y+8,22,20,'#b3c3bb');rect(c,x+8,y+6,22,17,'#cad3c7');}
      }
      for(let i=1;i<5;i++){const [x,y]=map[i];line(c,...map[0],x,y,'#a1b6ae',1.6);}
      marker(c,"Urban low-altitude routes",16,13);
      d.flights.filter(fl=>fl[4]<=s.t && s.t<fl[5]).forEach(fl=>{line(c,...map[fl[2]],...map[fl[3]],fl[0]===(k?2:1)?green:'#8a9da2',3);});
      map.forEach(([x,y],i)=>{
        circ(c,x+3,y+4,18,'#bac8bf');circ(c,x,y,18,'#57766f');circ(c,x,y,13,'#e4eadb');circ(c,x,y,11,'#789187');words(c,'H',x,y,15,'#fff',700,'center');words(c,'PAD '+i,x,y+28,11,ink,650,'center');
      });
      s.fleet.forEach(v=>{
        const a=map[v.a],b=v.fl?map[v.b]:a,offset=v.fl?0:(v.id-1.5)*8;
        const x=interp(a[0],b[0],v.p)+offset,y=interp(a[1],b[1],v.p)+(v.fl?-9:-15-(v.id%2)*6);
        aircraft(c,x,y,v.fl?Math.atan2(b[1]-a[1],b[0]-a[0]):-.1,v.count?green:'#667f90',s.t);
        if(v.fl)words(c,'V'+v.id+' · '+v.count+"people",x,y-16,10,ink,650,'center');
      });
      round(c,647,17,236,327,12,'#fbf9f0');words(c,"1 departure gate",665,42,19,ink,720);
      words(c,"Three people traveling together  ·  destination PAD 0",665,68,12,muted);
      rect(c,663,96,204,69,'#d3e5e0');for(let j=0;j<4;j++)rect(c,663+j*56,96,3,68,'#96aca4');
      rect(c,663,165,204,8,'#365d58');round(c,679,182,78,6,3,'#b78c62');rect(c,686,188,3,12,ink);rect(c,748,188,3,12,ink);
      if(/waiting.*airport/i.test(s.status) || (/exceed|too late/i.test(s.status) && s.t<28)){
        for(let j=0;j<3;j++)silhouette(c,695+j*20,211,1.55,/exceed|too late/i.test(s.status)?red:green);
      }
      marker(c,s.status,663,221,/exceed|too late/i.test(s.status)?red:green);
      words(c,"16.1 points for registration and 26.1 points for deadline",665,265,13);
      line(c,679,292,852,292,'#c5cec6',4);
      const u=t=>interp(679,852,pos(t,16.1,30));
      line(c,u(26.1),282,u(26.1),302,red,2);circ(c,u(k?27.6:24.8),292,5,k?red:green);circ(c,u(s.t),292,3,ink);
      words(c,"Selected return departure  "+(k?'27.6':'24.8')+" min",665,321,13,muted,600);
    }
  };

  labs.P0408 = {
    title:"Drone express delivery between cabinets",action:"Select the access sequence after completing the first cabinet area",
    choices:["Visit the cabinet area · archive in sequence","Swap the 2nd and 3rd cabinet areas"],
    scope:"The same work machine performs 101 moves. The main picture shows the kilometer-level air flight between areas, and the close-up view is based on the actual distance between cabinets. The first 1950 seconds are played in slow motion, then accelerated to completion.",
    frame(d,k,f) {
      const plan=d.scenarios[k],end=plan.steps[plan.steps.length-1][6],t=f<.74?interp(0,1950,f/.74):interp(1950,end,(f-.74)/.26);
      const row=plan.steps.find(r=>r[6]>t)||plan.steps[plan.steps.length-1], [a,b,id,start,dep,arr,finish]=row;
      const p=pos(t,dep,arr), x=interp(d.coords[a][0],d.coords[b][0],p), y=interp(d.coords[a][1],d.coords[b][1],p);
      const done=plan.steps.filter(s=>s[2]&&s[6]<=t).length;
      const phase=t>=end?"Complete":!id?"Flying around":t<dep?"loading":t<arr?"cargo flight":"unloading";
      const empty=plan.steps.filter(s=>!s[2]).reduce((v,r)=>v+Math.hypot(d.coords[r[0]][0]-d.coords[r[1]][0],d.coords[r[0]][1]-d.coords[r[1]][1])*pos(t,r[4],r[5]),0);
      return {t,a,b,id,x,y,p,phase,done,stageP:phase==="loading"?pos(t,start,dep):phase==="unloading"?pos(t,arr,finish):p,clock:clock(t),metrics:[["Moved",done+' / 101'],["Total empty flights",fixed(empty,2)+' km'],["The plan always comes up empty",fixed(plan.empty,2)+' km']]};
    },
    draw(canvas,s,d) {
      const c=stage(canvas,'#e3ede0'), ext=d.coords[d.coords.length-1][0],sx=x=>36+829*x/ext;
      marker(c,"Express locker corridor · Kilometer scale",16,12);
      path(c,[[0,101],[160,66],[334,98],[490,61],[650,83],[786,49],[900,72],[900,149],[0,149]],'#b9d0b6',1,true);
      const clusters=[...new Set(d.coords.map(q=>q[0]))];line(c,35,106,866,106,'#8da79c',3);
      clusters.forEach((v,j)=>{const x=sx(v);round(c,x-3,101,7,11,1,'#65867b');if(j<4 || j%4===0)words(c,'C'+(j+1),x,129,10,muted,600,'center');});
      if(!s.id)line(c,sx(d.coords[s.a][0]),104,sx(s.x),104,'#e9a93f',4);
      aircraft(c,sx(s.x),84,0,s.id?green:gold,s.t,true);
      rect(c,0,150,900,210,'#faf6e8');words(c,s.id?"Cabinet area enlargement · Meter scale":"Inter-regional air flight·kilometer scale",20,174,16,ink,700);
      const location=d.coords[s.a][0], xx = y=>158+y*57000;
      if(s.id){
        const nodes=d.coords.map((v,i)=>[...v,i]).filter(q=>q[0]===location);
        line(c,45,312,858,312,'#d2d7bf',3);
        nodes.forEach(([cx,y,id])=>{
          const x=xx(y);round(c,x-17,267,34,43,3,id===s.a?'#71a49a':id===s.b?'#d6a458':'#a4afa1');
          for(let j=0;j<4;j++){rect(c,x-13+(j%2)*14,271+Math.floor(j/2)*16,12,13,'#eff0d9');rect(c,x-5+(j%2)*14,277+Math.floor(j/2)*16,2,1,ink);}
          words(c,'L'+id,x,331,11,ink,650,'center');
        });
        const x=xx(s.y), z=s.phase==="loading"?interp(266,224,s.stageP):s.phase==="unloading"?interp(224,266,s.stageP):224;
        aircraft(c,x,211,0,green,s.t,true);if(s.phase!=="Complete"){line(c,x,217,x,z,'#8f846b',1.6);rect(c,x-5,z,10,8,'#c78546');}
        words(c,"Task "+s.id+'  ·  L'+s.a+' → L'+s.b,872,175,13,muted,600,'right');
      }else{
        const a=clusters.indexOf(d.coords[s.a][0])+1,b=clusters.indexOf(d.coords[s.b][0])+1;
        line(c,132,263,774,263,'#c5c9af',3);const x=interp(132,774,s.p),y=260-39*Math.sin(s.p*Math.PI);
        for(const [sx,j] of [[132,a],[774,b]]){round(c,sx-30,256,60,39,3,'#7f9d8c');rect(c,sx-22,267,44,14,'#bfccb5');words(c,"Cabinet area C"+j,sx,317,13,ink,650,'center');}
        aircraft(c,x,y,0,gold,s.t,true);words(c,fixed(Math.abs(d.coords[s.a][0]-d.coords[s.b][0]),2)+' km',449,290,14,muted,600,'center');
      }
      marker(c,s.phase,765,204,s.id?green:'#aa772b');
    }
  };

})();
