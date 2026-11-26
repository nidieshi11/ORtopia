/* Instance-specific operator decisions and physical readbacks for public services and power systems. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS, A=window.ORTOPIA_PAINT;
const {scene,building,tree,person,car,crate,road,along,lerp}=A;
const ink='#22433f', mint='#368a77', ochre='#b27c40', red='#ae5744', blue='#517e92';
const clip=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const part=(f,a,b)=>clip((f-a)/(b-a));
const fmt=(v,d=4)=>Number((Math.abs(v)<.5*10**-d?0:v).toFixed(d)).toLocaleString('en-US',{maximumFractionDigits:d});
const marks=rows=>rows.map(([label,at])=>({label,at}));
const cases={
 P0026:['Switching one line at a substation','Check the discharged power flow from n0 to n1, disconnect the branch, and then read the meter at the opposite end.','Keep the line connected','Open the branch','switch','switch duty room','Line side isolation switch','n1 receiver table','The branch has merit','Archive Branch Road Plan','A single activated branch has zero active power after disconnection. Other outputs will not be re-adjusted.'],
 P0035:['Four five-minute energy bids from a vehicle battery','Accumulate the base power multiplied by the duration step by step, and observe the accumulated amount after skipping the third step.','Place all four bids','Skip the third bid','ev','Fleet power cabinet','Two-way charging pile','Parking area summary','Cumulative benchmark declared energy','Archive accumulated energy','The first four segments are five minutes each. Readings are time integrals of signed reference power and are not converted to battery charge.'],
 P0078:['Checking reserve capacity in hour four','The handover will be carried out as usual in the first two hours, and then you will choose whether to retain the backup declaration of the designated unit.','Keep the planned fleet reserve','Withdraw this unit’s reserve for two hours','reserve','Crew duty room','rotating spare train','Grid backup table','Team backup','hour by hour requirements','The reserves are accumulated one by one in the first four hours, and the output and reserve declarations of other units are maintained.'],
 P0104:['Generation adjustments after a network contingency','Follow the active power adjustment command of c0 working condition, compare the execution participation factor and lock the original setting.','Use the participation factor','Hold pre-contingency output','generation','Working condition dispatch room','g0 governor','b0 In-place telemetry','The unit is active','Archive response','Local regulation for a given operating condition. The original output force, participation factor and system adjustment quantity are taken from this example.'],
 P0165:['Should a new generator be paired with a line upgrade?','After the new unit arrives, choose whether to allow the line construction team to enter the site. Follow up to work stations to verify completed projects and investments.','Build the candidate generator','Also reinforce line de000','build','Material distribution warehouse','Candidate unit construction site','de000 line station','Cumulative investment','Archive investments','Add a line reinforcement for a given quote to the selected unit. Only investments are calculated, and post-disaster income is not extrapolated.'],
 P0168:['How generation responds to a demand change','Using two adjacent demand vertices of the instance, check whether unit 12 in the first period performs the feedback increment.','Follow the demand increment','Freeze this feedback term','feedback','Regional load collection station','Unit 12 control panel','First phase response measurement point','Active power increment','demand margin','Only the first load component is changed. The local response is calculated by multiplying the difference in readings of the two vertices by the archived affine coefficient.'],
 P0176:['Load and shunt losses at a grid bus','Select a generation plan in front of the local electricity meter to see if the supply can cover both the active load and the parallel conductance losses.','Include shunt losses','Supply only the metered load','shunt','Distribution area','Parallel branch','b0000 settlement statement','Plan to contribute','load plus loss','For the first bus of grid 0, the voltage amplitude is taken from the archived operating point; the local active power difference does not represent recalculation of the entire network.'],
 P0201:['Checking available supply before restoring load','Follow b1’s load recovery application. Check requisitions and supplies while other units and lines maintain current arrangements.','Maintain planned service','Request restoration of remaining load','service','local power supply station','Feeder quota cabinet','User electrical connection station','Apply for supply','Supply has been confirmed','Examples include load shedding. Applications that exceed the confirmed supply are waiting at the power connection station, and the applications are not counted as actual power delivery.'],
 P0209:['Delivering a power trade across the tie line','Select full or half delivery at the tie line delivery station and view the performance margin in the receiving area along the corridor.','Exchange six units','Exchange three units','tie','Area A Trading Seat','Cross-district contact line','Area B delivery station','Cross-region exchange volume','Archive exchange volume','Use the net injection and transmission upper limits of the two zones with equal amounts and different signs to compare individual delivery volumes and retain other declarations.'],
 P0210:['How reserves replace a generator that goes offline','In the given first exit condition, the backup machine is selected to supplement the output or only half.','Cover the planned shortfall','Deploy half the reserve','reserve','Working condition recording room','backup responder','Power supply balance meter','Reserve additional issuance','Exit the original output of the unit','The same given working conditions. The remaining distributed units are fixed, and the difference between the additional issuance and exit output is the remnant of this operation.'],
 P0436:['Battery energy after the first dispatch interval','From initial inventory along the inverter and fuel meter checks, choose whether to perform the first segment battery payout.','Follow the first-period schedule','Retain stored energy in period 1','battery','Energy storage control room','AA battery converter','End of period electricity meter','battery inventory','Archiving Ending Inventory','For the first period of the root node, the end-of-period value is calculated based on the time length of the instance and the inventory deduction variable; the control remains unexpended in the first period.'],
 P0438:['Adjusting reactive power after a contingency','Follow the bus reactive power setting to change from the normal value to the first given operating condition, and check the reactive power reading of the local unit.','Use the contingency setpoint','Keep normal reactive output','reactive','Reactive duty room','Excitation regulator','Bus reactive power meter','Reactive power setting','Archive reactive settings','Correct decoding of a bus for sparse conditions. This question is archived as a verified feasible solution. Local setting differences do not equal imbalances in the entire network.'],
 P0439:['A generator’s response to a regional contingency','When the common adjustment signal arrives, choose to follow or maintain the original value and look at the power meter of the same unit.','Apply the contingency response','Maintain normal output','turbine','Regional centralized control building','G1 speed regulating mechanism','G1 power meter','Unit active power MW','Archive output MW','A single given operating condition. Use the archived common regulation amount, unit participation coefficient and upper and lower output limits to restore the original engine response, and convert MW based on the system benchmark. The archived solution has been verified as feasible.']
};
function landscape(g,indoor=false){
 g.box(0,0,1240,610,indoor?'#e3dac7':'#cfdbc4');
 if(indoor){for(let x=0;x<1250;x+=48)g.line([[x,25],[x,595]],'#d5ccb8',1);for(let y=25;y<610;y+=48)g.line([[0,y],[1240,y]],'#d5ccb8',1);return;}
 g.poly([[0,80],[170,28],[277,76],[442,36],[558,89],[770,45],[921,64],[1108,36],[1240,53],[1240,126],[0,144]],'#a7bda7');
 g.line([[0,510],[220,475],[547,531],[803,505],[1054,490],[1240,526]],'#a7bba9',52);
 g.line([[0,510],[220,475],[547,531],[803,505],[1054,490],[1240,526]],'#83b1af',38);
 for(let j=0;j<21;j++)tree(g,(j*149+56)%1210,115+(j%4)*22,.65+(j%3)*.12);
}
function tower(g,x,y){g.line([[x-18,y],[x,y-83],[x+18,y],[x-11,y-27],[x+11,y-54],[x-7,y-54],[x+13,y-27],[x-18,y]],'#738981',3);g.line([[x-28,y-66],[x+28,y-66]],'#617b73',4);g.line([[x-19,y-80],[x+19,y-80]],'#617b73',3);}
function dial(g,x,y,val,target,span,label){
 const c=g.c,scale=Math.max(1e-8,span),angle=v=>Math.PI*(1.08+1.0*clip(.5+.45*(v-target)/scale));
 g.box(x-56,y-63,112,81,'#4f655f');g.box(x-52,y-59,104,70,'#f0ead5');
 for(let j=0;j<9;j++){const a=Math.PI*(1.08+j/8);g.line([[x+36*Math.cos(a),y-12+36*Math.sin(a)],[x+30*Math.cos(a),y-12+30*Math.sin(a)]],ink,2);}
 const a=angle(val);g.line([[x,y-12],[x+32*Math.cos(a),y-12+32*Math.sin(a)]],red,3);g.dot(x,y-12,3,ink);g.text(label,x,y+3,11);
}
function equipment(g,x,y,kind,power=1){
 if(['reserve','generation','turbine','feedback'].includes(kind)){
  g.box(x-62,y-45,125,44,'#829c8d');g.box(x-78,y-9,155,13,'#667a6e');
  for(let n=0;n<3;n++){g.dot(x-41+n*41,y-28,16,'#def0d8');g.dot(x-41+n*41,y-28,12,'#638174');for(let k=0;k<3;k++){const a=k*Math.PI*2/3+power;g.line([[x-41+n*41,y-28],[x-41+n*41+9*Math.cos(a),y-28+9*Math.sin(a)]],'#d7d8aa',3);}}
 }else if(['ev','battery'].includes(kind)){
  for(let j=0;j<3;j++){g.box(x-56+j*39,y-60,32,61,'#729686');g.box(x-50+j*39,y-53,20,31,'#d0dcc4');g.box(x-49+j*39,y-53+31*(1-power),18,31*power,'#59a788');}if(kind==='ev')car(g,x+85,y+18,-1,blue,'car');
 }else if(kind==='build'){g.box(x-48,y-39,103,40,'#7f9b88');for(let i=0;i<7;i++)g.box(x-41+i*13,y-32,4,23,'#4f6e66');}
 else if(['reactive','shunt','tie'].includes(kind)){
  for(let i=0;i<3;i++){const xx=x-44+44*i;g.box(xx-11,y-57,22,57,'#78978b');for(let j=0;j<7;j++)g.line([[xx-16,y-49+6*j],[xx+16,y-49+6*j]],'#b1b49d',3);}
 }else{for(const xx of [x-46,x+43]){g.box(xx-9,y-48,18,48,'#90a79c');for(let i=0;i<5;i++)g.box(xx-14,y-40+i*6,28,3,'#536f68');}g.line([[x-46,y-48],[x+40,y-48-30*(1-power)]],ochre,5);}
}
const positions={tie:[[153,372],[575,280],[1084,365]],battery:[[158,324],[616,391],[999,268]],ev:[[138,285],[598,365],[1044,326]],build:[[140,333],[571,303],[1050,380]],service:[[180,329],[580,380],[1032,280]],shunt:[[190,311],[660,358],[1030,310]],reactive:[[198,344],[640,285],[1018,368]]};
function receivingEquipment(g,kind,sites){
 const [a,b,z]=sites;
 if(['reserve','generation','turbine','feedback'].includes(kind)){
  // An operating hall with a pipe gallery behind the machine row.
  const [x,y]=b;g.box(x-108,y-113,210,73,'#c3cbb9');
  g.poly([[x-117,y-112],[x-86,y-133],[x+113,y-133],[x+104,y-112]],'#899e91');
  for(let j=0;j<5;j++){g.box(x-96+j*42,y-102,31,27,'#73979a');g.line([[x-81+j*42,y-102],[x-81+j*42,y-76]],'#c4d1b9',2);}
  for(let j=0;j<2;j++){
   const xx=x+97+j*20;g.line([[xx,y-49],[xx+14,y-49],[xx+14,y-92],[xx+40,y-92]],'#71897c',5);
  }
  if(kind==='feedback'||kind==='generation'){const xx=x+80;g.box(xx,y-26,42,30,'#607a70');g.box(xx+4,y-21,33,15,'#afc8b4');}
  if(kind==='turbine'){g.box(x+69,y-137,15,26,'#899a8a');g.box(x+67,y-141,19,5,'#597367');}
 }else if(kind==='switch'||kind==='reactive'||kind==='shunt'||kind==='tie'){
  const [x,y]=b;
  for(let bank=0;bank<3;bank++){const xx=x-106+bank*84;g.box(xx-8,y-19,17,19,'#7e9187');g.line([[xx,y-19],[xx,y-82]],'#828e81',4);for(let j=0;j<5;j++)g.box(xx-6,y-41-7*j,12,3,'#b3bba6');}
  g.line([[x-108,y-85],[x-26,y-72],[x+61,y-85]],'#647e72',2);
  if(kind==='shunt'||kind==='reactive')for(let j=0;j<3;j++){g.box(x+65+j*15,y-31,11,31,'#a5aba1');g.dot(x+71+j*15,y-31,5.5,'#84998c',3);}
 }else if(kind==='ev'||kind==='battery'){
  const [x,y]=b;
  g.poly([[x-95,y-77],[x-68,y-100],[x+98,y-100],[x+71,y-77]],'#5e7e84');
  g.line([[x-80,y-78],[x-80,y-7]],'#809487',4);g.line([[x+60,y-78],[x+60,y-10]],'#809487',4);
  for(let j=0;j<6;j++)g.line([[x-93+j*29,y-77],[x-67+j*29,y-100]],'#99b7b8',1.5);
 }else if(kind==='service'){
  const [x,y]=z;for(let j=0;j<3;j++){building(g,x-110+j*56,y+64,37,29,'','#c7b6a0');}
 }else if(kind==='build'){const [x,y]=z;g.box(x-142,y-13,43,12,ochre);g.line([[x-119,y-12],[x-139,y-47],[x-163,y-33]],ochre,7);g.dot(x-134,y,6,ink);g.dot(x-111,y,6,ink);}
}
function serviceGround(g,kind){
 // Surround the active service route with the places it connects to. Leave working aisles clear.
 const industrial=['switch','reserve','generation','feedback','tie','shunt','reactive','turbine','battery','build','ev'].includes(kind);
 const back=industrial?'#a7ada0':'#c4b19a';
 road(g,[[-30,180],[272,164],[515,191],[805,155],[1260,194]],18);
 for(let j=0;j<7;j++){const x=j*176+37,y=144+(j%3)*12;
  building(g,x,y,industrial?79:58,industrial?36:42,'',j%2?back:'#bdc3ad');
  if(industrial){g.box(x+13,y-45,9,18,'#929b91');g.box(x+37,y-39,15,5,'#8c9a91');}
  else{g.poly([[x-3,y-42],[x+30,y-62],[x+63,y-42]],'#aa8c79');tree(g,x+87,y+13,.73);}
 }
 for(let j=0;j<6;j++){const x=92+j*190;g.line([[x,486],[x,465],[x+12,459]],'#738a81',2);g.box(x+9,458,7,2,'#eaddbd');}
 if(industrial){
  for(let j=0;j<34;j++)g.line([[79+j*33,433],[79+j*33,419]],'#9aa999',1.5);
  g.line([[79,422],[1168,422]],'#a9b1a0',1);
 }else{
  for(let j=0;j<8;j++){const x=64+j*152;g.box(x,544,64,16,'#b2c19f');tree(g,x+23,555,.52);}
 }
}
function wallFixtures(g,type){
 for(let j=0;j<8;j++){const x=88+j*141;g.box(x,95,72,24,'#849b97');g.box(x+3,98,66,17,'#bad1c8');g.box(x+34,96,2,22,'#e9e8d7');}
 const factory=type==='factory';
 for(let j=0;j<6;j++){const x=120+j*195;g.box(x,478,65,7,'#a6a699');g.box(x+5,482,4,7,'#8a958b');g.box(x+56,482,4,7,'#8a958b');
  if(factory){for(let h=0;h<3;h++)crate(g,x+h*20,468,16,'#bf9b68');}
  else{g.box(x+30,465,6,12,'#83998a');g.dot(x+32,464,6,'#90aa8f');}
 }
}
function machine(g,x,y,stage){
 if(stage===0||stage===3){for(let j=0;j<2;j++){g.box(x-62,y-70+j*21,53,3,'#797c6d');for(let h=0;h<3;h++)crate(g,x-60+h*16,y-82+j*21,13,'#ac936e');}}
 else{
  g.box(x-48,y-88,76,40,'#829c91');g.box(x-43,y-84,60,25,'#587b75');g.box(x-38,y-80,45,17,'#b7ccc0');
  g.line([[x-35,y-79],[x-24,y-68],[x-12,y-75],[x-8,y-66]],'#d8b46a',3);g.box(x+32,y-83,18,32,'#8b9d8c');
  for(let j=0;j<3;j++)g.dot(x+40,y-77+7*j,2,j===1?ochre:'#c2d8bc');
 }
}
function gridMap(g,c,sites){
 const [, , , ,kind,src,mid,dst]=c;landscape(g);serviceGround(g,kind);const [a,b,z]=sites;
 const way=[a,[a[0]+157,a[1]],[b[0]-75,b[1]+38],b,[b[0]+168,b[1]],[z[0]-74,z[1]+24],z];
 road(g,way,25);building(g,a[0]-62,a[1]-18,123,66,src);
 g.poly([[b[0]-115,b[1]-64],[b[0]+104,b[1]-82],[b[0]+139,b[1]+18],[b[0]-90,b[1]+31]],'#c1beab');
 if(kind==='build'||kind==='tie'||kind==='switch'){for(let j=0;j<3;j++)tower(g,b[0]+135*j,b[1]-56-7*j);for(let j=0;j<2;j++)g.line([[b[0]+135*j,b[1]-125-7*j],[b[0]+72+135*j,b[1]-115-7*j],[b[0]+135*(j+1),b[1]-132-7*j]],'#67847a',1.8);}
 receivingEquipment(g,kind,sites);
 building(g,z[0]-55,z[1]+7,106,58,dst,'#b4c1a8');g.sign(mid,b[0],b[1]-108,ink);
}
for(const [id,c] of Object.entries(cases)){
 const [title,action,base,trial,kind,src,mid,dst,measure,reference,scope]=c;
 const sites=positions[kind]||[[160,330],[599,300],[1050,376]];
 labs[id]={batch:'remaining',title,action,choices:[base,trial],views:['Follow on-site shift handover','Facility Panorama'],duration:34,
  scope:scope+' The instruments, inspection routes and personnel in the figure are on-site illustrations; the marked time periods or working condition readings are from examples.',
  chapters:d=>marks(d.ticks.map((x,i)=>[x,[0,.26,.52,.81][i]])),
  frame(d,k,f){const ix=f<.26?0:f<.52?1:f<.81?2:3,v=d.values[k][ix],target=d.target[ix];
   return {ix,v,target,clock:d.ticks[ix],metrics:[[measure,fmt(v,6)],[reference,fmt(target,6)],['Difference from reference',fmt(v-target,6)],['current device',d.asset]]};},
  draw(canvas,s,d,k,f,view){const [a,b,z]=sites;const route=[a,[a[0]+157,a[1]],[b[0]-75,b[1]+38],b];const onward=[b,[b[0]+168,b[1]],[z[0]-74,z[1]+24],z];
   const pos=f<.52?along(route,part(f,.08,.44)):along(onward,part(f,.58,.88)),bad=s.ix>=2&&Math.abs(s.v-s.target)>1e-7;
   const span=Math.max(1e-6,...d.values.flat().map((v,j)=>Math.abs(v-d.target[j%4])));
   scene(canvas,id,g=>gridMap(g,c,sites),[pos[0],pos[1]-20],view,650,g=>{
    const power=kind==='switch'&&!s.v?0:1,scale=Math.max(1e-6,...d.values.flat().map(Math.abs));
    equipment(g,b[0],b[1]-21,kind,['reserve','generation','feedback','turbine'].includes(kind)?(s.v?f*38:0):kind==='ev'||kind==='battery'?clip(Math.abs(s.v)/scale):power);
    if(kind==='build'&&k&&s.ix>=2){tower(g,z[0]-87,z[1]-25);g.line([[z[0]-90,z[1]-73],[z[0]-74,z[1]-57]],ochre,7);}
    if(kind!=='build'){const flow=[ [b[0],b[1]-72],[b[0]+155,b[1]-82],[z[0]-65,z[1]-66],[z[0],z[1]-65] ];g.line(flow,'#71887b',2);if(Math.abs(s.v)>1e-8)for(let n=0;n<5;n++){const pt=along(flow,((s.v<0?1-f:f)*3+n/5)%1);g.dot(...pt,2.4+2*Math.min(1,Math.abs(s.v)/scale),bad?ochre:'#e4bd54');}}
    dial(g,z[0]+9,z[1]-62,s.v,s.target,span,measure);
    person(g,pos[0],pos[1]+7,f*100,mint,true);g.sign(s.ix===3?(bad?'Review the difference '+fmt(s.v-s.target,5):'Review '+fmt(s.v,5)):s.ix===2?mid:src,pos[0],pos[1]-44,bad?red:ink,13);
   });
  }};
}
const civic={
 P0006:['The final production release across two plants','Add one unit to the production of product 0 at f0 to see if the work station can receive orders under the full capacity.','Use the planned production quantity','Add one unit at f0','factory',['planning room','f0 production line','Finished product receiving area','f1 production line'],'Schedules for 1,999 other products from the same factory and another factory are fixed. Only the total production capacity of f0 is checked, and excess production is waited at the feed end.'],
 P0009:['The first supply delivery to a hurricane shelter','Select the load sent from center j0 to shelter i0 and follow it to the receiving table to count the gaps.','Dispatch the root-node allocation','Send half the first shipment','relief',['j0 distribution center','loading ramp','i0 shelter','Aid receiving area'],'The first delivery of the current root node, other deliveries remain unchanged. Compare only the implemented supply and demand of the i0 batch.'],
 P0018:['Two emergency bases serving the same call','Replace the dispatch base at demand point 2 and see which aircraft arrives first on the same proportion of routes.','Use the planned base','Dispatch from the other candidate base','drone',['adjacent base','local base','Help point 2','community support area'],'Use two candidate flight distances divided by the same flight speed to compare queue-free flight times. Departure preparation and handover are for presentation only and do not count towards flight time.'],
 P0023:['Who is still waiting when the clinic calls?','Advance the second patient to the first moment and observe how long the patient 36 waits.','Use the planned appointment times','Check in both patients together','clinic',['Clinic entrance','waiting area','Clinic','Leaving hospital passage'],'Everyone is present. The first six patients will be treated in the original order according to their respective guaranteed service hours; the actual consultation and waiting time will be calculated on a per-person basis.'],
 P0034:['The first delivery from a hydrogen plant to a filling station','Select the loading amount before departure and check the hydrogen amount at the station with the consumption at the station.','Use the planned allocation','Halve the first truckload','hydrogen',['Production point 0','loading dock','Hydrogen refueling station 0','Vehicle service bay'],'The first site is supplied solely by production point 0. Single station vacancies are compared between the original allotment and the fixed remaining allotment, and the driving paths are indicative.'],
 P0053:['Allocating the treatment network’s budget','In area c0, four consecutive phases of funding are observed. Starting from the third phase, the funding can be halved, and then the minimum funding requirements for the five outlets are checked.','Use planned funding','Halve funding for the last two periods','fund',['Regional budget office','Branch service desk','appropriation review seat','Primary treatment point'],'Multiply the number of facilities in the region by the instance’s per-facility minimum allocation for each time period. Only check the lower budget limit and allocated funds.'],
 P0172:['The first screening appointments, from registration to testing','Arrange the original or half of the screening volume among the first batch of unscreened people to see how many people enter the follow-up process and how many remain in the register.','Use planned first-period screening','Halve first-period appointments','screen',['community registration point','screening room','Inspection receiving station','Next batch waiting area'],'Take the risk group 0, the health status 0, and the relaxation model screening volume proxy V in the first month. The figures in the picture represent the number of models in a group. The rest of the service arrangements are retained, and only the agent volume of this batch is compared, and the health status is not re-deduce.'],
 P0181:['Two operations sharing one operating room','Exchange the order in which the two patients enter the operating room, and follow the first registrant to observe waiting, opening and recovery.','Use the scheduled order','Swap the two operations','surgery',['Preoperative registration','Surgery waiting area','Shared operating room','recovery area'],'In the scenario of the same operation duration, two operations are performed in the same selected operating room. Hold the duration, press the previous one before turning on the next one, and compare the local start time.'],
 P0322:['Which hospital should a relief vehicle visit after delivery?','Follow the vehicle from warehouse to r340 to unload, and then select the receiving hospital for the same batch of wounded.','Take the patient to hospital h2','Switch to hospital h','rescue',['salvage warehouse s','r340 Assisted point','Receiving hospital h2','Receiving hospital h'],'Extract the first region’s rescue trip and two legal medical arcs from the archive. Compare travel time locally; beds in other areas are not rearranged for alternative destinations.'],
 P0437:['How a pharmacy follows a discrete treatment schedule','Unnamed simulated medicine packets are distributed one by one along the nine meal periods of the original model. Skip the first arranged window and observe which registration slots are left blank.','Register each planned window','Skip the first scheduled window','med',['simulated pharmacy','Medication preparation station','Meal time registration desk','record keeping area'],'Replay only the mealtime binary variable for drug 1 in the fictional instance. The simulated medicine pack represents a single arrangement, and does not convert patient doses or deduce efficacy.']
};
const layouts={
 factory:[[152,322],[502,308],[1008,336],[518,461]],drone:[[178,206],[625,348],[1021,367],[1062,452]],
 relief:[[170,275],[405,362],[1005,298],[1031,414]],hydrogen:[[164,294],[499,355],[911,272],[1038,386]],
 clinic:[[135,377],[418,361],[746,273],[1054,392]],surgery:[[143,332],[430,395],[728,265],[1020,388]],
 fund:[[169,325],[475,355],[734,310],[1022,412]],screen:[[136,372],[474,317],[847,283],[827,424]],
 rescue:[[144,329],[563,377],[1042,234],[931,459]],med:[[186,257],[455,360],[754,328],[1043,367]]};
function places(type,d){
 const pts=layouts[type];if(type!=='drone')return pts;
 const [a,b,z,last]=pts,far=Math.hypot(a[0]-z[0],a[1]-z[1]),nominal=Math.hypot(b[0]-z[0],b[1]-z[1]);
 return [a,[z[0]+(b[0]-z[0])*far*d.ranges[1]/(nominal*d.ranges[0]),z[1]+(b[1]-z[1])*far*d.ranges[1]/(nominal*d.ranges[0])],z,last];
}
function civicStops(id,type,names,d,k){
 if(id==='P0018'){
  const branch=k?1-d.base:d.base,longest=Math.max(...d.ranges)/d.speed,arrival=.10+.76*d.ranges[branch]/d.speed/longest;
  return marks([[names[branch],0],['Flying over the river',(.10+arrival)/2],['ground response',arrival],['Delivery personnel to the community',arrival+.13]]);
 }
 if(id==='P0181'){
  const order=k?[...d.order].reverse():d.order,first=d.durations[order[0]],end=d.durations.reduce((a,b)=>a+b,0),horizon=end+.26;
  return marks([['The first patient enters the room',0],['The first patient is transferred out',first/horizon],['The second unit enters the operating room',(first+.18)/horizon],['Arrive at the recovery area at the end',(end+.22)/horizon]]);
 }
 return marks(names.map((name,j)=>[name,[.04,.31,.59,.87][j]]));
}
function pavement(g,a,b,w=22){road(g,[a,[(a[0]+b[0])/2,a[1]],[(a[0]+b[0])/2+25,b[1]],b],w);}
function stepRoad(a,b,f){return along([a,[(a[0]+b[0])/2,a[1]],[(a[0]+b[0])/2+25,b[1]],b],f);}
function seats(g,x,y,n=4){for(let j=0;j<n;j++){g.box(x+j*21,y-12,16,9,'#79978c');g.box(x+j*21,y-4,16,4,'#536e69');}}
function structure(g,type,pts,names){
 const inside=['clinic','surgery','screen','med','factory'].includes(type);landscape(g,inside);
 if(inside){
  g.box(46,70,1148,440,'#c2c4b5');g.box(55,77,1130,427,'#eeeadc');
  wallFixtures(g,type);g.box(55,320,1130,94,'#ddd7c5');g.line([[59,366],[1180,366]],'#d1c4a7',3);
  pts.forEach(([x,y],j)=>{const gx=x-78,gy=y-110;g.box(gx,gy,158,85,j===2?'#cdded2':'#dbcdb7');
   g.line([[gx,gy+87],[gx,gy],[gx+159,gy],[gx+159,gy+87],[gx+100,gy+87]],'#7c8d81',4);
   const isTheatre=type==='surgery'&&/surg|operating/i.test(names[j])&&!/wait/i.test(names[j]);
   if(isTheatre||type==='surgery'&&/recover/i.test(names[j])){
    // Outline the bed, bedding and working aisle; keep the stretcher corridor clear.
    g.box(x-47,y-72,62,29,'#8fb0a3');g.box(x-43,y-69,15,18,'#ede8d9');g.box(x-25,y-69,35,21,'#abc8b2');
    g.line([[x-42,y-42],[x-42,y-37]],'#627c74',3);g.line([[x+8,y-42],[x+8,y-37]],'#627c74',3);
    g.box(x+24,y-85,26,24,'#58736e');g.box(x+27,y-82,20,15,'#92b6ac');g.line([[x+28,y-74],[x+33,y-74],[x+35,y-79],[x+38,y-69],[x+41,y-75],[x+45,y-75]],'#e8edba',1.2);
    if(isTheatre){g.line([[x-47,y-104],[x-35,y-94],[x-18,y-94]],'#7f998f',3);g.dot(x-15,y-93,9,'#d1d8c5',4);}
   }else if(type==='factory'){machine(g,x,y,j);g.box(x-54,y-49,103,22,'#85968b');for(let n=0;n<8;n++)g.dot(x-45+13*n,y-26,4,'#576b65');}
   else if(type==='med'){for(let n=0;n<3;n++){g.box(x-52,y-82+n*20,104,5,'#938975');for(let h=0;h<5;h++)g.box(x-48+19*h,y-92+n*20,10,10,h%2?'#b5cdb9':'#e5c6a1');}}
   else if(j===1||j===3){seats(g,x-43,y-36,5);g.box(x-47,y-87,19,21,'#eee9d7');g.box(x-43,y-82,12,3,mint);
    if(type==='screen'){g.box(x+37,y-67,19,22,'#92afa5');g.box(x+44,y-82,4,16,'#507c75');}
   }
   else{g.box(x-49,y-55,100,24,'#a5b6ab');g.box(x-40,y-52,25,14,'#efe7cf');}
   g.sign(names[j],x,gy-14,ink,14);
  });
 }else{
  serviceGround(g,type);pts.slice(1).forEach((b,j)=>pavement(g,pts[type==='drone'?2:(type==='rescue'&&j===2?1:j)],b,22));
  if(type==='drone')g.line([[665,117],[738,243],[760,337],[812,457]],'#8cbbb4',49);
  pts.forEach(([x,y],j)=>{if(type==='drone'&&j<2){g.dot(x,y-6,49,'#adbbad',17);g.line([[x-15,y-5],[x+15,y-5]],'#f1ebcf',3);building(g,x-56,y-35,95,45,names[j]);}
   else if(type==='hydrogen'&&j<3){for(let n=0;n<3;n++){g.box(x-47+n*29,y-60,23,50,'#91aaa5');g.dot(x-35+n*29,y-58,11,'#b9cbc1',6);}g.sign(names[j],x,y-83);}
   else building(g,x-54,y-17,109,62,names[j],j===1?'#d9c899':'#b6c7b3');});
 }
}
function actor(xy,kind,label,color=mint,pace=0){return {xy,kind,label,color,pace};}
function batch(g,x,y,n,total){for(let j=0;j<Math.ceil(8*clip(n/(total||1))-.000001);j++)crate(g,x+(j%4)*12,y-Math.floor(j/4)*10,12);}
function people(g,x,y,count,capacity){const n=Math.ceil(8*clip(count/(capacity||1))-.000001);for(let a=0;a<n;a++)person(g,x+a%4*13,y+Math.floor(a/4)*13,a,['#b17d55','#638e8d','#a28869'][a%3]);}
function actorArt(g,o){
 const [x,y]=o.xy;if(o.kind==='truck'||o.kind==='ambulance'){car(g,x,y,1,o.kind==='ambulance'?'#e5e1cd':o.color);if(o.kind==='ambulance'){g.box(x-14,y-21,12,4,red);g.box(x-10,y-25,4,12,red);}}
 else if(o.kind==='drone'){g.line([[x-19,y-3],[x,y+2],[x+19,y-3]],ink,3);g.dot(x,y-1,7,ochre,4);for(const k of [-1,1]){g.dot(x+k*18,y-5,10,'#6b8e8b',2);g.box(x+k*17,y-8,2,6,'#677b77');}crate(g,x-5,y+1,10);}
 else if(o.kind==='stretcher'){person(g,x-22,y+4,o.pace,'#437b77');g.box(x-16,y-14,39,8,'#88aa95');g.dot(x+11,y-18,4,'#bf9775');g.line([[x-16,y-5],[x+20,y-5]],ink,2);for(let a of [-13,17])g.dot(x+a,y,3,ink);}
 else if(o.kind==='pallet'){crate(g,x-15,y-7,31,o.color);g.box(x-19,y+11,42,4,'#786c56');}
 else person(g,x,y,o.pace,o.color,o.kind==='courier');
 if(o.label)g.sign(o.label,x,y-38,o.color,12);
}
function scenario(id,d,k,f){
 const c=civic[id],type=c[4],pts=places(type,d),[a,b,z,last]=pts;let actors=[],focus,m=[],clock='',props=[];
 const add=(xy,kind,label,col,t=0)=>{actors.push(actor(xy,kind,label,col,t));return xy;};
 if(['P0006','P0009','P0034','P0172'].includes(id)){
  const factory=id==='P0006',screen=id==='P0172',q=d.amount,qty=k?(factory?q+1:q*.5):q;
  const actual=factory?Math.min(qty,d.limit-(d.booked-q)):qty;
  const p=stepRoad(a,b,part(f,.04,.33)),v=stepRoad(b,z,part(f,.40,.78)),land=stepRoad(z,last,part(f,.82,.97));
  const arrived=f>=.78?actual:0;clock=f<.33?'Registration and preparation':f<.40?'Work station handover':f<.78?'execution plan':'Receive review';
  const cargo=screen?'First batch screening':factory?'Products 0':id==='P0034'?'Hydrogen allocation':'The first batch of relief supplies';
  if(f<.38)focus=add(p,screen?'person':factory?'pallet':'courier',cargo,ochre,f*70);
  else if(f<.80)focus=add(v,screen?'person':factory?'pallet':'truck',cargo+' · '+fmt(actual,2),mint,f*70);
  else focus=add(f<.82?z:land,screen?'courier':factory?'pallet':'courier',screen?'Inspection and handover':factory?'Finished product registration':'receive signature',mint,f*60);
  if(factory){props.push(['boxes',a,f<.33?qty:Math.max(0,qty-actual),q+1],['boxes',z,arrived,q+1]);m=[['Product 0 Application',fmt(qty)],['Actually can be arranged',fmt(actual)],['Exceeding the total production capacity of the factory',fmt(Math.max(0,qty-q))]];if(k&&f>.36){add(b,'pallet','Excess 1 unit waiting',red);if(f>.79)focus=b;}}
  else if(screen){props.push(['people',a,d.available-arrived,d.available],['people',z,arrived,q]);m=[['First batch of screening places',fmt(qty)],['Submitted for inspection',fmt(arrived)],['The original quota for this batch has not been fulfilled',fmt(q-qty)]];if(k&&f>.8){focus=add(last,'person','Waiting for follow-up screening',red);}}
  else{props.push(['boxes',b,f<.38?qty:0,q],['boxes',z,arrived,q]);m=[['allocation amount',fmt(qty)],['Signed for',fmt(arrived)],['Demand gap for this batch',fmt(Math.max(0,d.need-arrived))]];if(k&&f>.84)focus=add(z,'person',id==='P0034'?'Insufficient supplies in the station':'Waiting for the remaining supplies',red);}
 }else if(id==='P0018'){
  const branch=k?1-d.base:d.base,from=branch?b:a,dt=d.ranges[branch]/d.speed,max=Math.max(...d.ranges)/d.speed;
  const t=max*part(f,.10,.86),u=clip(t/dt),pt=lerp(from,z,u);pt[1]-=Math.sin(u*Math.PI)*48;
  add(branch?a:b,'drone','standby base',blue);focus=add(pt,'drone',u<1?'Flying with bags':'Arrive at the help point',mint);
  if(u>=1-1e-9){const arrival=.10+.76*dt/max;focus=add(stepRoad(z,last,part(f,arrival,arrival+.13)),'courier','receptionist',ochre,f*65);}
  clock='After dispatch '+fmt(t,3);m=[['Departure distance',fmt(d.ranges[branch])],['No queue flight time',fmt(dt,6)],['Help point status',u>=1-1e-9?'Handed over':'Waiting to arrive']];
 }else if(id==='P0023'||id==='P0181'){
  const surgery=id==='P0181';let rows=[],t=0;
  if(surgery){let end=0;for(const j of (k?[...d.order].reverse():d.order)){rows.push([j+1,0,end,end+d.durations[j]]);end+=d.durations[j];}t=f*(end+.26);}
  else{let end=0;for(const [j,row] of d.visits.entries()){const arrival=k&&j===1?0:row[1],start=Math.max(arrival,end);end=start+row[2];rows.push([row[0],arrival,start,end]);}t=f*(end+.35);}
  for(const [n,arr,start,end] of rows){
   let pos,col,lab;if(t<arr){pos=[a[0]-n%5*9,a[1]+(n%3)*15];col=blue;lab='Not signed in';}
   else if(t<start){pos=stepRoad(a,[b[0]+(n%4)*14,b[1]],part(t,arr,Math.min(start,arr+.16)));col=ochre;lab='Waiting';}
   else if(t<end){pos=stepRoad(b,z,part(t,start,start+.18));col=mint;lab=surgery?'Start the stage':'See a doctor';}
   else{pos=stepRoad(z,[last[0]+(n%3)*14,last[1]],part(t,end,end+.22));col=blue;lab=surgery?'restore':'Leave the clinic';}
   const focal=surgery?n===1:n===rows[1][0];add(pos,surgery?'stretcher':'person',focal?(surgery?'surgery ':'Patient ')+n+' · '+lab:'',col,t*20);if(focal)focus=pos;
  }
  clock='model moment '+fmt(t,3);const row=surgery?rows.find(r=>r[0]===1):rows[1];m=[['currently waiting',String(rows.filter(r=>r[1]<=t&&r[2]>t).length)],['ended',String(rows.filter(r=>r[3]<=t).length)],[surgery?'Surgery 1 opening time':'36 patients waiting in total',fmt(surgery?row[2]:clip(t-row[1],0,row[2]-row[1]),6)]];
 }else if(id==='P0053'){
  const j=Math.min(3,Math.floor(f*4)),within=clip(4*f-j),budget=d.budget[j]*(k&&j>=2?.5:1),minimum=d.minimum[j]*d.facilities;
  const pos=stepRoad(j%2===0?a:last,b,part(within,0,.47)),to=budget+1e-7<minimum?z:last;
  focus=add(within<.47?pos:stepRoad(b,to,part(within,.47,.90)),'courier',budget<minimum?'Funding needs to be reviewed':'Funding Voucher '+(j+1),budget<minimum?red:mint,within*40);
  props.push(['boxes',last,budget,Math.max(...d.budget)]);clock='Funding No. '+(j+1)+' Period';m=[['Appropriations for this period',fmt(budget,6)],['Minimum limit of five outlets',fmt(minimum,6)],['Below minimum',fmt(Math.max(0,minimum-budget),6)]];
 }else if(id==='P0322'){
  const sec=k?d.legs[2]:d.legs[1],h=d.legs[0]+sec,t=f*(d.legs[0]+Math.max(...d.legs.slice(1))),to=k?last:z;
  const pos=t<d.legs[0]?stepRoad(a,b,t/d.legs[0]):stepRoad(b,to,(t-d.legs[0])/sec);
  focus=add(pos,'ambulance',t<d.legs[0]?'Send supplies to '+d.town:t<h?'transshipment '+d.people+' people':'The hospital has accepted',mint,f*60);
  props.push(['boxes',b,t>=d.legs[0]?d.aid:0,d.aid],['people',b,t<d.legs[0]?d.people:0,d.people],['people',to,t>=h?d.people:0,d.people]);
  clock='Travel time '+fmt(t,2);m=[['Material receipt',String(t>=d.legs[0]?d.aid:0)],['Number of people attending the hospital',String(t>=h?d.people:0)],['Travel time of this car',String(h)]];
 }else if(id==='P0437'){
  const n=d.slots.length,j=Math.min(n-1,Math.floor(f*n)),u=clip(f*n-j),bits=d.visits.slice(),first=bits.indexOf(1);if(k)bits[first]=0;
  const booked=bits[j],log=bits.slice(0,j).reduce((x,y)=>x+y,0)+(u>=.7?booked:0);
  const pt=u<.35?stepRoad(a,b,u/.35):stepRoad(b,booked?z:last,part(u,.35,.75));
  focus=add(pt,'courier',booked?'window '+d.slots[j]+' · Simulation package':'window '+d.slots[j]+' · Empty registration',booked?mint:ochre,f*65);
  for(let h=0;h<=j;h++)if(bits[h]&&(h<j||u>=.70))props.push(['tray',[last[0]-55+12*h,last[1]-19],1,1]);
  clock='Meal time index '+d.slots[j];m=[['The window arrangement',booked?'Have arrangements':'Leave blank'],['Number of registered arrangements',String(log)],['Total number of archive windows',String(d.visits.reduce((x,y)=>x+y,0))]];
 }
 return {clock,metrics:m,focus,actors,props};
}
for(const [id,c] of Object.entries(civic)){
 const [title,action,base,trial,type,names,scope]=c;
 labs[id]={batch:'remaining',title,action,choices:[base,trial],scope:scope+' The locations and characters are indicative.',duration:37,views:[type==='drone'?'Follow the first aid mission':'Follow the mission','Panorama of the place'],
  chapters:(d,k)=>civicStops(id,type,names,d,k),frame:(d,k,f)=>scenario(id,d,k,f),
  draw(canvas,s,d,k,f,view){scene(canvas,id,g=>structure(g,type,places(type,d),names),[s.focus[0],s.focus[1]-22],view,630,g=>{
    for(const [kind,[x,y],n,total] of s.props){if(kind==='people')people(g,x-44,y+14,n,total);else if(kind==='tray')crate(g,x,y,11);else batch(g,x-30,y+18,n,total);}
    for(const item of s.actors)actorArt(g,item);
  });}};
}
// The first collection keeps its audited schedules and objective evaluations.
const renew={
 P0069:['Which unit is the start-up command for the third shift finally sent to?','Follow the launch team','Power plants and urban loads',['control room','Unit 233','Unit 108','User-side delivery'],[0,.34,.67,.90]],
 P0079:['Which processing machine does workpiece j1 go from the stocking rack to?','Follow artifact j1','Workshop panorama',['The first batch of construction started','Extension work','Next batch handover','Finished product warehousing'],[0,.28,.58,.93]],
 P0087:['When did the third patient enter the operating department and the recovery room?','Follow patient 3','Panorama of the operating department',['handover','The second channel starts','The third station entered the room','The third station transfers out'],[0,.31,.6,.93]],
 P0464:['Handover of supplies from pre-disaster storage to assisted residents','Follow supplies and consignees','Panoramic view of rescue area',['Warehouse stocking','Post-disaster inventory','Available supplies for transfer','External procurement arrives'],[0,.27,.52,.82]],
 P0489:['After the old water is drained, how much water can each block receive that day?','Follow the flow and the water taker','Panorama of water station',['Release on the first day','The first batch of water','Inventory handover on the fifth day','High demand on the tenth day'],[.005,.062,.34,.815]]
};
function replayFirst(id,canvas,s,d,k,f,view){
 if(id==='P0079'){
  const plan=d.plans[k],src=[150,339],machines=[[580,245],[662,407]],depot=[1042,339],end=Math.max(...plan.finish);
  const get=(j)=>{const m=machines[plan.machine[j]],station=[m[0]+(j%3)*13-14,m[1]],start=plan.start[j],stop=plan.finish[j],t=s.t;
   if(t<start)return stepRoad([src[0]+j*13,src[1]], [station[0]-88,station[1]+15],part(t,Math.max(0,start-.8),start));
   if(t<stop){const move=part(t,start,start+Math.min(.28,(stop-start)*.22));return lerp([station[0]-88,station[1]+15],station,move);}
   return stepRoad(station,[depot[0]+j*12,depot[1]],part(t,stop,Math.min(end,stop+.5))||Number(t===end));};
  const focus=get(0);
  scene(canvas,id,g=>{structure(g,'factory',[src,...machines,depot],['Workpiece preparation','M1 Processing Station','M2 processing station','Finished product inventory']);},focus,view,594,g=>{
   for(let j=0;j<d.jobs.length;j++){const pos=get(j);actorArt(g,actor(pos,'pallet',d.jobs[j]+' · '+({wait:'Awaiting processing',run:'In process',done:'Completed'}[s.jobs[j]]),j===0?mint:ochre));}
   machines.forEach(([x,y],m)=>{const busy=s.jobs.some((v,j)=>v==='run'&&plan.machine[j]===m);g.dot(x+57,y-48,6,busy?'#e1b451':'#6a8c83');});
  });
 }else if(id==='P0087'){
  const ward=[[530,199],[680,315],[816,427]],lobby=[164,368],rec=[1045,326],t=s.t;
  const get=j=>{const st=s.starts[j],ed=s.ends[j],w=ward[j];if(t<st)return stepRoad([lobby[0],lobby[1]+j*16],[w[0]-70,w[1]+8],part(t,Math.max(0,st-3),st));
   if(t<ed)return lerp([w[0]-62,w[1]+8],w,part(t,st,st+.45));return stepRoad(w,[rec[0],rec[1]+j*16],part(t,ed,ed+1.7));};
  scene(canvas,id,g=>{structure(g,'surgery',[lobby,...ward,rec],['Waiting before surgery','Operating room one','Operating room two','Surgery room three','recovery area']);},get(2),view,640,g=>{
   ward.forEach(([x,y],j)=>{const at=get(j),busy=t>=s.starts[j]&&t<s.ends[j];actorArt(g,actor(at,'stretcher',j===2?'Patient 3· '+(busy?'During surgery':t<s.starts[j]?'Awaiting entry':'Recovering'):'',j===2?mint:blue,f*80));person(g,x+21,y-5,busy?f*60:0,'#537b86');g.dot(x+55,y-86,5,busy?ochre:'#7e9d83');});
  });
 }else if(id==='P0069'){
  const a=[150,345],b=[494,269],z=[692,365],city=[1039,341],unit=k===1?z:b;
  const pos=f<.66?stepRoad(a,[463,338],part(f,.08,.60)):f<.87?stepRoad([463,338],unit,part(f,.66,.79)):stepRoad(unit,city,part(f,.86,.97));
  scene(canvas,id,g=>{landscape(g);building(g,85,305,118,67,'load scheduling');building(g,989,292,104,67,'User power station');pavement(g,a,b);pavement(g,b,z);pavement(g,z,city);tower(g,839,259);},pos,view,665,g=>{
   for(const [n,pt] of [b,z].entries()){equipment(g,...pt,'generation',s.r[4][n]?f*70:0);g.sign('G'+d.unitIds[n]+' · '+fmt(s.r[5][n],2)+' MW',pt[0],pt[1]-73);}
   const deficit=s.short+s.spare>1e-7;dial(g,city[0],city[1]-40,s.r[2],d.demand[s.i]+d.reserve[s.i],Math.max(10,d.reserve[s.i]),'Power supply and backup');
   actorArt(g,actor(pos,'courier',s.i===2?(deficit?'Delivery difference pending':'The crew took over successfully'):'Start command handover',deficit?red:mint,f*60));
  });
 }else if(id==='P0464'){
  const wh=[178,293],vendor=[554,213],dst=[958,367],resident=[1088,427],empty=s.stock===0;
  const leg=s.i===2&&!empty?stepRoad(wh,dst,part(s.p,.02,.72)):s.i===3?stepRoad(vendor,dst,part(s.p,.02,.64)):wh;
  const focus=(empty&&s.i===2)||s.i===3&&s.p>.73?dst:leg;
  scene(canvas,id,g=>{structure(g,'relief',[wh,vendor,dst,resident],['Regional storage warehouse','Emergency purchasing station','Assistance collection point','Temporary resettlement area']);pavement(g,wh,dst);},focus,view,630,g=>{
   if(!empty)batch(g,wh[0]-22,wh[1]+12,Math.max(0,(s.i?s.surv:s.stock)-s.local),d.capacity);
   if(s.i===1){for(let j=0;j<18;j++){const x=wh[0]-64+j*8,y=wh[1]-88+(s.p*70+j*9)%60;g.line([[x,y],[x-5,y+10]],'#799fa6',2);}}
   if(s.i===2&&!empty||s.i===3)actorArt(g,actor(leg,'truck',s.i===2?'Warehouse storage materials':'Emergency purchase batch',mint));
   if(s.i===0||s.i===1)actorArt(g,actor(wh,'courier',empty?'Warehouse is not enabled':s.i===0?'Preset inventory':'Count the remaining',ochre));
   batch(g,dst[0]-30,dst[1]+12,s.local+s.ext,d.demand);people(g,dst[0],dst[1]+34,d.demand-s.local-s.ext,d.demand);
   if(s.i===3&&s.p>.66)actorArt(g,actor(stepRoad(dst,resident,part(s.p,.65,1)),'courier','Supplies received',mint,s.p*35));
   if(empty&&s.i===2||s.i===3&&s.p>.7)g.sign('Still to be supplied '+fmt(d.demand-s.local-s.ext,2),dst[0],dst[1]-56,red);
  });
 }else{
  const source=[158,211],tank=[529,304],homes=[[955,254],[1040,374],[928,444]],drain=[382,427],out=homes[s.i%3],u=s.phase;
  const feed=s.buy>0,draining=s.purge&&s.old>0,active=u<.22?(draining?lerp(tank,drain,part(u,0,.22)):tank):u<.54?(feed?lerp(source,tank,part(u,.22,.54)):tank):s.served>0?lerp(tank,out,part(u,.54,.88)):out;
  scene(canvas,id,g=>{landscape(g);building(g,70,193,140,65,'Water supply pump room');g.sign('Empty the recovery channel',drain[0],drain[1]+29);homes.forEach(([x,y],j)=>building(g,x-48,y-18,90,58,'Resident water points '+(j+1)));
   for(const path of [[source,tank],[tank,drain],...homes.map(p=>[tank,p])])g.line(path,'#879e93',14);
   g.box(tank[0]-61,tank[1]-98,122,100,'#576e68');g.box(tank[0]-56,tank[1]-94,112,90,'#deebdd');
  },active,view,610,g=>{
   const h=85*clip(s.volume/d.capacity);g.box(tank[0]-55,tank[1]-5-h,110,h,s.age>=2?'#79a79b':'#65aab0');g.sign('water storage '+fmt(s.volume,1),tank[0],tank[1]-118,ink);
   const path=u<.22?[tank,drain]:u<.54?[source,tank]:[tank,out];if((u<.22&&draining)||(u>=.22&&u<.54&&feed)||(u>=.54&&s.served>0)){for(let j=0;j<6;j++){const pt=lerp(path[0],path[1],(f*20+j/6)%1);g.dot(...pt,3,'#69bace');}}
   const shortage=s.need>s.served;
   if(shortage&&s.served>0&&u>.78){const leaving=actor([out[0]-18-62*part(u,.78,.98),out[1]+26],'courier','Received part of the water supply',mint,u*23);actorArt(g,leaving);}
   actorArt(g,actor([out[0]+part(u,.8,1)*(shortage?0:46),out[1]+10],'person',u>.7?(shortage?'Waiting for water':'Water has been collected today'):'water user today',shortage?red:mint,u*23));});
 }
}
for(const [id,[title,follow,overview,names,times]] of Object.entries(renew)){
 const original=labs[id];labs[id]={...original,batch:'lab20',title,views:[follow,overview],duration:43,
  chapters:(d,k)=>id==='P0087'?marks([['Waiting before surgery',0],['The third station entered the room',d.plans[k][0][2]/34],['shutdown time',d.close/34],['The third channel ends',Math.min(1,(d.plans[k][0][2]+d.durations[2])/34)]]):marks(names.map((x,i)=>[x,times[i]])),
  draw:(canvas,s,d,k,f,view)=>replayFirst(id,canvas,s,d,k,f,view)};
}
})();
