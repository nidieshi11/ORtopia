/* Transit worlds use operating events and a separate illustrated geography.
   A run contains the place, visible carrier, cumulative measure and operating instant. */
(() => {
'use strict';
const labs=window.ORTOPIA_LABS;
const specs={
  "P0015": {"mode":"town","title":"Who takes the first booked pickup?","actor":"Trip 0","stops":["dispatch office","passenger door","destination station"],"choices":["Dispatch an in-house vehicle","Drop this single-route trip"],"measure":"Staffed routes","unit":"Article","scope":"In the w1 scenario, the coverage number is recalculated from the manned single-line and adjacent double-line trips. After removing the itinerary 0, fix other personnel and outsourcing arrangements.","clock":"Event"},
  "P0019": {"mode":"taxi","title":"Two idle drivers and the first ride request","actor":"first requester","stops":["neighborhood entrance","Car hailing area","trip end point"],"choices":["Recommend one idle driver","Make no recommendation"],"measure":"Return from this match","unit":"","scope":"Initially there is 2 name d000 driver. Fixed the event of the first request, the driver is available and the passenger has not yet left, and only this transaction will be calculated. ","clock":"Event"},
  "P0027": {"mode":"town","title":"Transferring passengers between three hubs","actor":"Travelers using arc 1","stops":["Travel starting point","h0 platform","h1 platform","destination"],"choices":["Keep the h0 → h1 service","Close this service"],"measure":"Trips disrupted","unit":"pen","scope":"Only demand entries using directed arc 1 in the archived itinerary are counted; the selected path is retained after closing the service.","clock":"Event"},
  "P0046": {"mode":"air","title":"Can a flight move into the early recovery window?","actor":"c5","stops":["aircraft seat","release point","Early window runway","Evening window runway","Arrive at the airport"],"choices":["Keep the late slot","Move to the full early window"],"measure":"Early-window requests","unit":"class","scope":"Morning window capacity 1700. Occupancy numbers are recalculated from all archived routes, and the window is changed individually for f5_late; other aircraft retain their original slots.","clock":"Event"},
  "P0047": {"mode":"town","title":"Will passenger 1 make the transfer?","actor":"Passenger 1","stops":["Pick-up station","transfer island","Delivery station 15"],"choices":["Wait for the feeder vehicle","Depart before the feeder arrives"],"measure":"Connection missed by","unit":"time units","scope":"Passenger 1 changes from the 2nd pick-up car to the 1st drop-off car. Instead, let the bus depart directly when it arrives at the island.","clock":"model moment"},
  "P0052": {"mode":"charge","title":"Battery sizing for a day on route 97","actor":"The first car on Route 97","stops":["Kashmere Gate","Mundka Station","Reserve review"],"choices":["Use a 300 kWh battery","Use a 200 kWh battery"],"measure":"Charge on arrival","unit":"kWh","scope":"The actual power consumption decreases according to the 8 segments, and the archived zero power supply is retained. The small battery plan stops at the departure station expected to be lower than the reserve line in the first section, and finally displays the estimated margin if the train still leaves.","clock":"trip segment"},
  "P0055": {"mode":"taxi","title":"Share a ride or serve the two bookings separately?","actor":"Electric carpool 1","stops":["Garage 0","Pick up point 1","Pick up point 2","Drop off point 41","Drop off point 42"],"choices":["Collect both before dropping off","Complete the first trip first"],"measure":"Distance on this leg","unit":"km","scope":"Use node coordinates to calculate the driving distance of the first two orders. The remaining orders, time-of-use electricity charges and complete operating targets are not included in this comparison.","clock":"Event"},
  "P0071": {"mode":"air","title":"Flight F23 through airspace sector S","actor":"Flight F23","stops":["Airport A","Route sector S","Airport B"],"choices":["Use the planned release time","Wait one more period at A"],"measure":"Arrival time at B","unit":"time period","scope":"The flight duration of each segment is maintained according to the archived A/S/B time, and the ground waiting of a single flight is compared; the alternative time has not been confirmed by the entire network capacity.","clock":"model period"},
  "P0080": {"mode":"air","title":"Should the first flight stay on the schedule?","actor":"Flight f0_0","stops":["Departure airport A","flight planning desk","Position to be restored","Passenger waiting area"],"choices":["Cancel all four flights in advance","Keep f0_0 until recovery"],"measure":"Cancellations in advance","unit":"class","scope":"Shows the first stage from scheduling to waiting or waiting for restoration. Retaining f0_0 does not guarantee final takeoff, and the second stage airport time window is still in effect.","clock":"Event"},
  "P0081": {"mode":"town","title":"Who will the three-seat shuttle pick up next?","actor":"V0 shuttle bus","stops":["B0 garage","R0_0","R0_1","Orbital station S"],"choices":["Collect both groups in order","Go straight to the station after group 1"],"measure":"Passengers delivered","unit":"people","scope":"V0 There are a total of three people in the two groups of reservations. The direct plan abandons the second group, and the indicator only counts the connections completed by this vehicle.","clock":"Event"},
  "P0111": {"mode":"taxi","title":"Which orders should appear on the driver menu?","actor":"Order O64","stops":["Dispatch desk","Driver’s order taking area","Passenger boarding point","Delivery location"],"choices":["Show both orders","Show the first order only"],"measure":"Probability of matching order 1","unit":"%","scope":"The D0 menu contains O64 and O82. The matching probability is recalculated using each order utility and rejection utility. The block demonstrates a path for the first transaction, and the probability is not certain that the transaction will be completed.","clock":"Event"},
  "P0114": {"mode":"charge","title":"Assign the next bus at the terminal","actor":"Vehicles waiting at the terminal","stops":["terminal yard","Departure inspection gate","Platform L1","L2 platform"],"choices":["Dispatch to L1","Reassign to L2"],"measure":"Buses assigned to L1","unit":"vehicles","scope":"Decoding Nk yields two lines of 43 and 42 vehicles respectively. For comparison, move one car from the first line to the second line, fix the rest of the allocation, and do not rearrange the charging positions.","clock":"Event"},
  "P0123": {"mode":"town","title":"Getting 13 off-route passengers to the station","actor":"First demand response class","stops":["Origin 1","Passenger area on the platform","Terminal 21"],"choices":["Dispatch the on-demand vehicle","Cancel this service without reassignment"],"measure":"Passengers served","unit":"people","scope":"Scenario 0. The departure, duration and passengers of the first responding flight are self-explanatory. When canceled, this group of passengers will continue to wait.","clock":"min"},
  "P0148": {"mode":"charge","title":"What if the first electric bus starts with less charge?","actor":"Electric bus No.0","stops":["Outbound location","Starting point of the first flight","The end of the first flight","Continue review"],"choices":["Use the planned starting charge","Start with only 20 kWh"],"measure":"Expected end-of-trip charge","unit":"kWh","scope":"The first trip traveled 34.7 km. The fixed vehicle, distance and driving power consumption is 27.76 kWh, only the initial power is changed, and the vehicle is stopped at the starting position when it is expected to be exhausted.","clock":"Event"},
  "P0151": {"mode":"rail","title":"How many cars should the first train take from depot A?","actor":"First bus from terminal A","stops":["A garage","Editing position","Platform A","Platform B"],"choices":["Dispatch two cars","Dispatch four cars"],"measure":"Seats on this train","unit":"seat","scope":"First shift time 1, 17 seats per session. Only the capacity provided by the trains is compared, and the subsequent garage inventory is not re-optimized.","clock":"Event"},
  "P0152": {"mode":"town","title":"Can seven shuttle vehicles serve every booking?","actor":"Last shuttle bus","stops":["Vehicle depot","Reservation stations along the line","Centralized pick-up and drop-off area","Return to drop off guests"],"choices":["Keep four seats per vehicle","Open only three seats per vehicle"],"measure":"Minimum passengers left behind","unit":"people","scope":"28 people correspond to 7 filing trips, with a maximum of 4 people per vehicle. The three stations are compared to calculate the lower bound of the capacity gap under a fixed number of trips; the aggregation station is shown.","clock":"Event"},
  "P0159": {"mode":"charge","title":"Fast-charging fleet assignment on line 1","actor":"E321 Team","stops":["With garage","Fast charging berth","Line 1 platform","Line network export"],"choices":["Dispatch all six E321 buses","Keep one bus at the depot"],"measure":"Total passenger capacity","unit":"people","scope":"Reference n_1_E321_1=6; Bicycle capacity 105 people. Compare and fix other car models and charging facilities. ","clock":"Event"},
  "P0173": {"mode":"charge","title":"Who gets the first charging slot after returning?","actor":"Flight 0→3 Electric bus","stops":["Depot","End point of class zero","End point of class 3","Garage Charging Shed"],"choices":["Plug in during segment 9","Skip segment 9"],"measure":"Grid charging power in segment 9","unit":"kW","scope":"Archive 0→3 continues, the returned power is 1.0; press the 9th segment power comparison of pDep. Other vehicles are secured electrically.","clock":"Event"},
  "P0179": {"mode":"air","title":"Cruise speed on a disrupted flight","actor":"First commercial segment","stops":["takeoff climb","cruise midpoint","Descending entrance"],"choices":["Use the planned cruise speed","Use the minimum permitted speed"],"measure":"Time spent cruising","unit":"min","scope":"Using the distance 376 of the first leg profile 72 versus cruise speed; excluding fixed non-cruise time, both options do not reallocate the aircraft.","clock":"Cruising minutes"},
  "P0190": {"mode":"signal","title":"How signal release times change the same queue","actor":"First car v1_1","stops":["Import lane","Stop line","conflict zone","Exit the intersection"],"choices":["Use the green window for lane 1","Use the other queue’s release time"],"measure":"Wait for release","unit":"time units","scope":"The arrival time of the first vehicle in the first lane and the second lane is the same. For comparison, the release window of the latter queue actually waiting for 437.0 is used for this vehicle, and the remaining queues are not rearranged.","clock":"model moment"},
  "P0195": {"mode":"railfreight","title":"Loading express cargo on a dedicated freight train","actor":"First scenario freight batch","stops":["Express delivery port","Origin loading area","Midway","Terminal"],"choices":["Run the dedicated train","Cancel the train without reloading"],"measure":"Freight on the dedicated train","unit":"units","scope":"The actual loading of each order of the third train in the first scenario is summed, and only the cargo volume of the special train is calculated. Leave in the staging area after cancellation.","clock":"Event"},
  "P0206": {"mode":"port","title":"Can a second ship enter an occupied berth?","actor":"The second arrival ship","stops":["anchorage","First berth import","Quayside loading and unloading surface","off-berth waters"],"choices":["Berth after the first ship leaves","Berth both ships at the same time"],"measure":"Overlap at the booked start","unit":"time period","scope":"Use two boats to file t, c. The operation of the first ship is fixed, and the conflict of early berthing is calculated based on the intersection length of the continuous intervals, without changing the loading and unloading sequence.","clock":"Berth time"},
  "P0270": {"mode":"town","title":"Can shuttle b9 accept another booking?","actor":"b9 Last group reservation holder","stops":["Reservation entrance","One stop queuing area","Second stop","Three-stop drop-off area"],"choices":["Board as planned","Add one person to the full shuttle"],"measure":"Seats required","unit":"seat","scope":"The original allocation of b9 for this round is 32 people, with a capacity of 32. The trial calculation is to insert one person who is not on the b9 list, the remaining reservations are fixed, and the excess passengers are left standing.","clock":"Event"},
  "P0274": {"mode":"charge","title":"Can bus0 return to the depot after job0?","actor":"bus0","stops":["parking lot entrance","job0 station","Return checkpoint","Garage"],"choices":["Depart fully charged","Charge for the outbound leg only"],"measure":"Projected charge after the return","unit":"energy unit","scope":"According to the two arcs of archive in0/out0, the energy consumption is 3 and 2 respectively. The negative number is the gap that is scheduled to be returned to the warehouse, and the actual vehicle is left at job0.","clock":"Event"},
  "P0348": {"mode":"charge","title":"Recharging between two waves of bus service","actor":"T1_1→T2_1","stops":["First wave of parking spaces","The end of the first wave","S1_1 charging position","Second wave of starting spaces"],"choices":["Recharge fully as planned","Pass the station without charging"],"measure":"Charge at second-wave departure","unit":"energy unit","scope":"The connection arc and empty driving power consumption of the original two waves of flights are fixed, and the power consumption before charging, after full charging, and when arriving at the second starting space is compared.","clock":"Event"},
  "P0353": {"mode":"railfreight","title":"Make room for freight on a high-speed passenger train","actor":"Goods Category 1","stops":["Origin receipt","Passenger vehicle loading area","Junction","Destination"],"choices":["Keep the freight allocation","Unload this batch without reassignment"],"measure":"Gross freight revenue","unit":"cost unit","scope":"Reads Passenger model versus Class1 2.0 tonne loadout with unit price of 48. Only the gross income of the batch is compared.","clock":"Event"},
  "P0360": {"mode":"rail","title":"Running time on the first metro segment","actor":"first train","stops":["first stop platform","interval midpoint","Second station platform"],"choices":["Use the planned adjustment","Keep the original running time"],"measure":"Cumulative running time","unit":"s","scope":"Compare the sum of plans, disturbances and operational adjustments for the first segment of the first train. Click the constant speed indicator in the interval; subsequent passengers’ waiting and regenerative power will not be extrapolated.","clock":"s"},
  "P0409": {"mode":"rail","title":"Release from depot L0 for the first service","actor":"L0 first train","stops":["d1 garage","Aup departure station","Bup arrival station"],"choices":["Depart on the minute timetable","Delay departure by one minute"],"measure":"Earliest arrival at Bup","unit":"min","scope":"Take the two arcs that connect the archives. When delaying, the time consumption of each segment is fixed; a lower bound for delayed arrival at the station is given, and conflicts with other trains are not rechecked.","clock":"min"},
  "P0412": {"mode":"rail","title":"Will the first train on line 1 take the first passenger group?","actor":"Scenario 1 First group of passengers","stops":["Entrance outside the station","First stop of Line 1","train boarding door","next stop"],"choices":["Stop and board passengers","Skip the stop"],"measure":"First group boarded","unit":"people","scope":"Take the first scene, the first line, the first class, the first stop boarding data 11. The shared departure index starts from [2, 4] Start; other passenger assignments fixed. ","clock":"Event"},
  "P0429": {"mode":"cycle","title":"Cycling from N0 to N3 after a route upgrade","actor":"N0→N3 cyclist","stops":["N0","N1","N2","N3"],"choices":["Use the upgraded N0 → N2 link","Detour via N1"],"measure":"Cumulative cycling time","unit":"time units","scope":"Extract the path N0→N2→N3 from archive y. Instead of walking the existing three sections, use the original t to add up section by section; only compare this OD.","clock":"Travel time"},
  "P0447": {"mode":"ticket","title":"Which fares should be open in the final period?","actor":"Passengers with remaining seats at the end of the period","stops":["Ticket counter","Quotation screen","Ticket exit","boarding bridge"],"choices":["Offer all three fares","Offer only the first fare"],"measure":"Expected final-period revenue","unit":"Amount","scope":"Decoding the archive menu for the last issue. The expected revenue is the arrival probability multiplied by the sum of the selection probability of each product and the ticket price; moving passengers represent the transaction path.","clock":"Event"},
  "P0450": {"mode":"ticket","title":"Which fares should be offered for the last seat?","actor":"One seat in stock","stops":["Inventory counter","fare menu","Ticket issuance review","boarding gate"],"choices":["Offer only the high fare","Offer both fares"],"measure":"Expected final-period revenue","unit":"Amount","scope":"Archived initial seat valuation 108.7065. Extract the partial comparison of one seat at the end and terminal value zero, and use the original arrival rate and the two quotation menus to recalculate the single-step expected return.","clock":"Event"},
  "P0451": {"mode":"taxi","title":"Should autonomous vehicle 0 leave now?","actor":"Customer 0","stops":["Order entry","curbside pick-up point","Ride section","delivery port"],"choices":["Dispatch vehicle 0","Leave the vehicle idle"],"measure":"Dispatch cost for this request","unit":"cost unit","scope":"Vehicle 0, original customer 0, local dispatch cost 11, customer waiting weight 22. This order has not been serviced when the allocation is cancelled; the fee is only included in the dispatch item.","clock":"Event"},
  "P0481": {"mode":"charge","title":"Charging a fleet with shared fast-charger power","actor":"Charging vehicle group at Station 5","stops":["vehicle entrance","Power access cabinet","Bus line at station 5","Exit the station area"],"choices":["Apply individual power limits","Share the station power rating"],"measure":"Fleet energy cost per cycle","unit":"cost unit","scope":"Take station No. 5 with archive minutes 24 to 34, and decode the charging power row by vehicle and time. Each minute reading corresponds to a two-minute dispatch grid, and the periodic electricity bill covers the entire fleet. Vehicle location indication. Vehicles that are not allocated the power of the station will not be displayed in the charging position.","clock":"Archive minutes"},
  "P0495": {"mode":"taxi","title":"Relocating idle vehicles after an order arrives","actor":"v0_001","stops":["Original parking spot","Scheduling notification area","inter-district road","Target area parking spot"],"choices":["adopt W_min=0 strategy","adopt W_min=1 strategy"],"measure":"Empty vehicle moves","unit":"times","scope":"Two archived trajectories using the same random arrival record and symbol direction. Track the first empty vehicle that is moved, and the end point lists the number of empty vehicle movement records for the entire sample.","clock":"Event"}
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const fmt=v=>Number(v.toFixed(4)).toString();
const ink='#284742', green='#307c68', orange='#c78441', indigo='#476b86', red='#ad584b';
const schema={
 town:[[90,395],[380,301],[732,366],[1110,265],[972,477]],
 taxi:[[100,415],[350,365],[615,225],[890,300],[1125,440]],
 charge:[[93,417],[361,324],[705,376],[1115,282],[948,490]],
 rail:[[98,429],[380,352],[734,333],[1094,268]],
 railfreight:[[85,415],[352,365],[734,337],[1105,282]],
 air:[[90,433],[387,338],[710,238],[1010,393],[1164,193]],
 port:[[90,444],[423,398],[750,356],[1100,463]],
 signal:[[90,382],[508,382],[638,351],[1090,351]],
 ticket:[[90,387],[386,341],[721,342],[1080,304]],
 cycle:[[83,417],[348,437],[682,245],[1097,300]]
};
function point(spec,index){
 if(spec.points)return spec.points[index];
 const base=schema[spec.mode][index];
 if(!spec.id)return base;
 const seed=Number(spec.id.slice(1));
 // Stations retain the case's declared topology, including branches and out-and-back paths.
 return [base[0]+(index&&base[0]<1100?Math.sin(seed+index*3)*35:0),base[1]+Math.sin(seed*.8+index*2.1)*27];
}
function lineBetween(spec,a,b){
 const start=point(spec,a),end=point(spec,b);
 if(a===b)return [start,end];
 if(['rail','railfreight','air','port','ticket','signal'].includes(spec.mode))return [start,end];
 const dx=end[0]-start[0],dy=end[1]-start[1];
 return [start,[start[0]+dx*.45,start[1]+dy*.23],[start[0]+dx*.67,end[1]-dy*.16],end];
}
function rails(g,points){
 g.line(points,'#938e7f',20);g.line(points,'#6a6c63',18,[3,8]);g.line(points,'#c9d0c6',10);g.line(points,'#73796e',6);
}
function platform(g,x,y,label){
 g.box(x-48,y-22,99,11,'#aba896');g.box(x-49,y-23,100,3,'#dbb966');
 g.box(x-36,y-66,4,43,'#6a8378');g.box(x+33,y-66,4,43,'#6a8378');
 g.poly([[x-54,y-63],[x-40,y-75],[x+55,y-75],[x+47,y-63]],'#62887a');g.sign(label,x,y-87,green,12);
}
function pumps(g,x,y){
 for(const xx of [x-23,x+18]){g.box(xx,y-42,16,39,'#ecdfbc');g.box(xx+3,y-37,11,13,'#49897e');g.line([[xx+14,y-30],[xx+21,y-24],[xx+21,y-9],[xx+14,y-7]],'#465e57',2);}
}
function tower(g,x,y){
 g.box(x-9,y-95,18,95,'#c5c2ac');g.poly([[x-19,y-106],[x+21,y-106],[x+13,y-88],[x-13,y-88]],'#587b80');g.box(x-21,y-110,43,5,'#78999b');g.line([[x,y-111],[x,y-127]],ink,2);
}
function crane(g,x,y){
 g.line([[x-35,y],[x-20,y-99],[x+33,y-99],[x+48,y]],'#b9884b',7);g.line([[x-41,y-102],[x+82,y-102]],'#e0b261',8);g.line([[x-30,y-102],[x+6,y-128],[x+79,y-102]],'#9a8054',3);g.line([[x+66,y-98],[x+66,y-48]],ink,2);g.box(x-15,y-104,25,15,'#719598');
}
function city(g,s){
 const art=window.ORTOPIA_PAINT;
 const port=s.mode==='port',airport=s.mode==='air',indoors=s.mode==='ticket';
 g.box(0,0,1240,610,indoors?'#ddd5ba':'#d9e6dc');
 if(indoors){
  g.box(0,110,1240,97,'#adc9d0');for(let x=0;x<1240;x+=58){g.box(x,109,6,98,'#ece4ce');g.line([[x,130],[x+45,112]],'#c2d9d9',3);}
  g.box(0,211,1240,399,'#d4cdba');for(let j=0;j<6;j++)g.line([[0,250+j*62],[1240,248+j*62]],'#c0b9a6',2);
  for(let x=30;x<1240;x+=160)g.line([[x,210],[x+86,610]],'#c4bba7',2);
 }else{
  g.poly([[0,157],[143,84],[288,145],[426,96],[585,135],[789,79],[981,125],[1082,98],[1240,136],[1240,225],[0,225]],'#b3c7b4');
  for(let j=0;j<31;j++){const x=j*46-15,h=27+j*29%68;g.box(x,181-h,33,h,'#a4bab3');for(let q=0;q<h/17-1;q++)for(let k=0;k<3;k++)g.box(x+3+k*9,187-h+q*16,5,7,'#d0dad0');}
  g.box(0,183,1240,430,port?'#80b6b1':airport?'#c2cca9':'#c3d1af');
  if(port){g.poly([[0,183],[1240,183],[1240,334],[0,427]],'#b6b5a1');for(let x=0;x<1240;x+=67){g.line([[x,461+x%42],[x+24,461+x%42]],'#a1cfbf',2);}}
  else if(airport){g.line([[-80,512],[1300,235]],'#a6afa0',52);g.line([[-80,512],[1300,235]],'#e9e2cb',3,[25,22]);tower(g,562,255);}
  else{
   g.line([[0,501],[273,488],[536,523],[869,478],[1280,489]],'#86b6af',s.mode==='cycle'?47:27);
   for(let j=0;j<10;j++){let x=17+j*128,y=238+(j*23)%32;if(j%3){art.building(g,x,y,54+j%2*17,24+j%4*7,'','#bdbca5');}else art.tree(g,x+20,y,.76);}
   for(let j=0;j<12;j++){const x=j*108,y=530+j*19%50;art.tree(g,x,y,.74);}
  }
 }
 if(s.mode==='signal'){art.road(g,[[563,130],[569,590]],55);for(let x=530;x<573;x+=8)g.line([[x,370],[x+1,390]],'#e1d7b8',4);}
}
function solarRoof(g,x,y){
 g.poly([[x-58,y-48],[x+52,y-48],[x+39,y-18],[x-69,y-18]],'#547180');
 for(let i=0;i<5;i++)g.line([[x-56+i*24,y-47],[x-68+i*24,y-19]],'#aec7c1',2);
 g.line([[x-62,y-32],[x+46,y-32]],'#adc5c8',2);
 for(let dx of [-50,33])g.line([[x+dx,y-18],[x+dx,y+11]],'#6e7e76',4);
}
function house(g,x,y,k){
 const A=window.ORTOPIA_PAINT;A.building(g,x,y,62,43,'',k?'#cbb39e':'#cec7aa');
 g.poly([[x-5,y-42],[x+27,y-64],[x+69,y-42]],k?'#ac795f':'#919d80');
 g.box(x+33,y-21,13,21,'#6c817d');g.box(x+7,y-16,15,10,'#819d93');
}
function hangar(g,x,y,name){
 g.poly([[x-60,y-24],[x-55,y-62],[x-25,y-81],[x+31,y-81],[x+61,y-63],[x+65,y-24]],'#b4bec1');
 g.box(x-60,y-59,125,59,'#bec3b3');g.box(x-46,y-46,94,46,'#6e837b');
 for(let dx=-45;dx<50;dx+=13)g.line([[x+dx,y-44],[x+dx,y-2]],'#899a8d',2);
 g.sign(name,x,y-63,indigo,12);
}
function placeDetails(g,s){
 const A=window.ORTOPIA_PAINT,p=s.stops.map((_,j)=>point(s,j)),[x,y]=p[1],last=p.at(-1);
 if(['P0015','P0047','P0019','P0081','P0055','P0123','P0270','P0152','P0451','P0495'].includes(s.id)){
  const o=p[0];for(let j=0;j<3;j++)house(g,o[0]+32+j*67,o[1]-39-j*12,j%2);
  if(['P0081','P0123','P0047','P0270'].includes(s.id)){
   rails(g,[[last[0]-200,last[1]-64],[last[0]+130,last[1]-82]]);
   train(g,last[0]+40,last[1]-72,green,2);
  }
 }
 if(['P0052','P0148','P0159','P0173','P0348','P0481','P0274','P0114'].includes(s.id)){
  const depot=p[s.id==='P0173'||s.id==='P0481'?2:0];hangar(g,depot[0]+64,depot[1]-52,'Vehicle maintenance warehouse');
  pumps(g,depot[0]-44,depot[1]-22);
  if(s.id==='P0173')solarRoof(g,p[3][0]-30,p[3][1]-63);
  if(s.id==='P0481'){for(let j=0;j<3;j++){solarRoof(g,p[2][0]-78+j*99,p[2][1]-55);pumps(g,p[2][0]-110+j*99,p[2][1]-43);}}
 }
 if(s.mode==='rail'){
  const q=p[0];hangar(g,q[0]+23,q[1]-62,s.id==='P0151'?'marshalling garage':'depot');
  for(let j=0;j<3;j++)rails(g,[[q[0]-90,q[1]-17-j*9],[q[0]+30,q[1]-20-j*9],[q[0]+117,q[1]+6]]);
 }
 if(s.mode==='air'){
  if(s.id==='P0179'||s.id==='P0071')for(let j=0;j<4;j++){const xx=111+326*j,yy=235+j%2*27;g.dot(xx,yy,29,'#eff0df',8);g.dot(xx+14,yy-7,17,'#eef0e3',10);}
  else hangar(g,p[0][0]+80,p[0][1]-65,'Flight operation base');
 }
 if(s.mode==='cycle'){
  for(let j=0;j<4;j++)A.tree(g,x-76+j*31,y-35,.8);g.line([[p[0][0],p[0][1]-10],[p[2][0],p[2][1]-12]],'#789e89',4,[11,10]);
 }
 if(s.id==='P0190'){const [x,y]=p[1];A.road(g,[[x+75,141],[x+74,540]],53);g.line([[x-2,y-28],[x+2,y+23]],'#eee4c9',4);}
}
function peopleAt(g,x,y,n,f=0){
 for(let j=0;j<n;j++)window.ORTOPIA_PAINT.person(g,x+11*(j%5),y-5*Math.floor(j/5),f*24+j*.3,j%2?orange:green);
}
function activity(g,s,d,st,k){
 const f=st.f,A=window.ORTOPIA_PAINT,id=s.id,p=s.stops.map((_,j)=>point(s,j)),[x,y]=st.pos;
 if(['P0052','P0148','P0274','P0348'].includes(id)){
  const mx=Math.max(1,...d.runs.flat().map(r=>r[2])),pct=clamp(st.value/mx),blocked=k&&st.holding&&st.j===d.runs[k].length-1;
  const n=id==='P0052'?(k?2:3):4;for(let j=0;j<n;j++){g.box(x-32+j*15,y-42,13,8,j/n<pct?'#6b9572':'#bd9672');g.box(x-29+j*15,y-44,7,2,'#959f89');}
  g.sign((blocked?'Insufficient reserves · ':'')+fmt(st.value)+' '+s.unit,x,y+30,blocked?red:'#305f5a',13);
  if(blocked){g.line([[x+42,y+9],[x+42,y-19]],ink,3);g.line([[x+35,y-18],[x+60,y-18]],red,5);}
 }
 if(id==='P0173'){
  const [xx,yy]=p[3];pumps(g,xx+47,yy+1);
  if(st.arrived&&st.next[0]===3&&!k){g.line([[xx+50,yy-28],[xx+36,yy-7],[xx+15,yy-13]],'#d9b85d',5);g.dot(xx+51,yy-27,7,'#c4de76');}
  g.sign(fmt(st.value)+' kW',x,y+23,st.value?green:'#786e60',14);
 }
 if(id==='P0159'){const a=p[0];if(k)vehicle(g,a[0]+36,a[1]-32,'b',1,0);g.sign(k?'1 vehicle left in storage':'6 cars out',a[0]+29,a[1]-63,k?orange:green,12);}
 if(id==='P0481'){
  const [xx,yy]=p[2],bay=bus=>xx-74+[0,1,6].indexOf(bus)*76;
  const current=new Set(st.sockets.map(row=>row[0]));
  for(const [bus,kw] of st.sockets){
   const bx=bay(bus);vehicle(g,bx,yy+28,'b',1,0);
   const cable=[[xx,yy-15],[bx-30,yy+12],[bx-17,yy+22]];g.line(cable,'#bc9744',4);
   for(let j=0;j<3;j++){const pos=A.along(cable,(f*(kw/600)*60+j/3)%1);g.dot(pos[0],pos[1],3.8,'#f8da76');}
   g.sign('Vehicle '+bus+' · '+fmt(kw)+' kW',bx,yy+47,green,10);
  }
  for(const [bus] of st.prior)if(!current.has(bus)&&st.slice<.32){const x=bay(bus)+st.slice*405;vehicle(g,x,yy+30+st.slice*60,'b',1,f);}
  for(const [bus] of st.upcoming)if(!current.has(bus)&&st.slice>.58){const u=clamp((st.slice-.58)/.42);vehicle(g,bay(bus)-(1-u)*148,yy+29+(1-u)*28,'b',1,f);}
  g.sign(fmt(st.delivered)+' kWh',xx,yy+80,indigo,14);
 }
 if(id==='P0055'||id==='P0081'){
  const idx=st.next[0],first=p[1],second=p[2];
  if(st.j===1&&!st.arrived)peopleAt(g,first[0]+8,first[1]-8,1);
  const picked=d.runs[k].slice(0,st.j+(st.arrived?1:0)).some(q=>q[0]===2);
  if(!picked)peopleAt(g,second[0]+4,second[1]-8,id==='P0081'?2:1);
  if(id==='P0081'&&idx===3&&st.arrived)peopleAt(g,x+30,y-14,k?1:3);
 }
 if(id==='P0015'||id==='P0451'||id==='P0019'){
  const stop=p[1];if(st.j===1&&!st.arrived)peopleAt(g,stop[0]-22,stop[1]-8,1);if(st.next[0]===p.length-1&&st.arrived&&!k)peopleAt(g,x+32,y-4,1);
 }
 if(id==='P0027'){if(k){g.line([[p[1][0]+22,p[1][1]-27],[p[1][0]+22,p[1][1]+6]],ink,4);g.line([[p[1][0]+11,p[1][1]-25],[p[1][0]+38,p[1][1]-25]],red,6);}
  else if(st.next[0]===2&&!st.arrived)peopleAt(g,p[2][0]-25,p[2][1]-16,3);}
 if(id==='P0111'){const z=p[1];g.box(z[0]-19,z[1]+12,47,21,'#e4d6b7');for(let j=0;j<(k?1:2);j++){g.box(z[0]-15+j*20,z[1]+15,17,14,j?indigo:green);g.text(j?'82':'64',z[0]-7+j*20,z[1]+22,9,'#fff');}}
 if(id==='P0123'||id==='P0270'||id==='P0152'){const stop=p[id==='P0152'?2:1];const count=st.next[0]===(id==='P0152'?2:1)&&!st.arrived?9:k&&st.holding?(id==='P0152'?7:id==='P0123'?13:1):0;peopleAt(g,stop[0]-36,stop[1]-9,count);}
 if(id==='P0190'){const [xx,yy]=p[1];for(let j=1;j<=4;j++){const lag=j*.07;const pos=A.lerp(p[0],p[1],clamp(st.f*3-lag));if(st.holding||st.j===1)A.car(g,pos[0]-j*47,pos[1]+21,1,j%2?indigo:orange,'car');}g.dot(xx+17,yy-87,4,st.holding?red:'#a3d17d');}
 if(id==='P0151'&&k&&st.next[0]===1){const z=p[1];train(g,z[0]-93,z[1]+9,indigo,2);g.sign('Two sections attached',z[0]-98,z[1]+32,indigo,12);}
 if(id==='P0412'){let n=k||st.j<2?11:Math.round(11*(1-st.q));peopleAt(g,p[1][0]-32,p[1][1]-14,Math.max(0,n));}
 if(['P0046','P0071'].includes(id)&&st.holding){const z=p[1];g.line([[z[0]+50,z[1]-21],[z[0]+51,z[1]+8]],ink,4);g.dot(z[0]+50,z[1]-24,7,red);}
 if(id==='P0080'){const z=p[3];peopleAt(g,z[0]-24,z[1]-8,k?2:6);g.sign(k?'1 shift to be resumed':'Pre-cancellation of 4 flights',z[0],z[1]+25,k?orange:red,12);}
 if(s.mode==='railfreight'){const n=k||st.j===1?4:0;for(let j=0;j<n;j++)A.crate(g,p[1][0]+j*13,p[1][1]+13,12);if(st.kind==='r')for(let j=0;j<3;j++)A.crate(g,x-14-j*20,y-18,14);}
 if(s.mode==='ticket'){
  const idx=st.next[0];if(idx===1||idx===2){let n=id==='P0447'?(k?1:3):(k?2:1);g.box(x+22,y-35,13*n+6,22,'#d6c7a7');for(let i=0;i<n;i++)g.box(x+25+i*13,y-33,11,18,[green,orange,indigo][i]);}
 }
}

function backdrop(g,s,d){
 const A=window.ORTOPIA_PAINT;
 city(g,s);
 placeDetails(g,s);
 const segments=new Set();
 for(const row of d.runs){for(let j=1;j<row.length;j++){
  const a=row[j-1][0],b=row[j][0],key=[a,b].sort().join();if(a===b||segments.has(key))continue;segments.add(key);
  const pts=lineBetween(s,a,b);
  if(['rail','railfreight'].includes(s.mode))rails(g,pts);
  else if(s.mode==='cycle'){g.line(pts,'#9faa88',20);g.line(pts,'#c8b886',14);g.line(pts,'#fff1b5',2,[14,12]);}
  else if(s.mode==='port')g.line(pts,'#b2cebc',2,[8,18]);
  else if(s.mode==='ticket')g.line(pts,'#bbab89',3,[7,12]);
  else if(s.mode!=='air')A.road(g,pts,s.mode==='signal'?46:32);
 }}
 s.stops.forEach((name,j)=>{
  const [x,y]=point(s,j),yy=y-16;
  if(s.mode==='ticket'){
   if(j===3){g.box(x-45,yy-24,105,14,'#8caaaa');g.line([[x+48,yy-12],[x+50,yy+4]],'#8d9587',5);g.sign(name,x,y-65);}
   else {g.box(x-41,yy-28,82,26,'#bdab8f');g.box(x-43,yy-33,85,6,'#598484');g.box(x+9,yy-53,27,19,'#4b6d73');g.sign(name,x,yy-70);}
  }else if(s.mode==='air'){
   if(/gate|stand|airport|clearance|release|planning|takeoff|take.off|boarding|departure lounge/i.test(name)) A.building(g,x-35,yy-9,78,48,name,'#c9c6b2','#9caeab');
   else{g.dot(x,yy,7,'#e6e1c4');g.sign(name,x,yy-45,indigo,12);}
  }else if(s.mode==='port'){
   if(j===2){crane(g,x-42,yy-16);for(let k=0;k<4;k++)A.crate(g,x-80+k*23,yy-14,17);}
   g.sign(name,x,yy-57,indigo,12);
  }else if(s.mode==='signal'){
   if(j===1){g.box(x+15,yy-56,4,53,ink);g.box(x+9,yy-78,17,30,ink);}g.sign(name,x-20,yy-97,indigo,12);
  }else if(s.mode==='railfreight'&&(j===0||j===1)){A.building(g,x-54,yy-16,105,62,name,'#c8c5ae');for(let n=0;n<4;n++)A.crate(g,x-49+n*25,yy-3,17);if(j===1)crane(g,x+49,yy-22);}
  else if(s.mode==='charge'&&/electric|charg|audit|review/i.test(name)){pumps(g,x,yy);g.sign(name,x,yy-68,green,12);}
  else if(['rail','railfreight','town','charge'].includes(s.mode)){platform(g,x,yy,name);}
  else if(s.mode==='cycle'){g.line([[x-6,yy],[x-6,yy-27]],ink,3);g.sign(name,x-6,yy-34);}
  else A.building(g,x-40,yy-7,76,50,name,'#c9b89d');
 });
}
function train(g,x,y,color,cars=1,direction=1){
 g.c.save();g.c.translate(x,y);g.c.scale(direction,1);
 for(let j=0;j<cars;j++){let a=-j*63;g.poly([[a-44,-6],[a-44,-30],[a-38,-35],[a+8,-35],[a+18,-25],[a+18,-6]],color);
  for(let i=0;i<4;i++)g.box(a-38+i*12,-28,9,10,'#c6ddd6');g.box(a-40,-12,54,3,'#e2b964');g.dot(a-30,-5,5,ink);g.dot(a+6,-5,5,ink);}
 g.c.restore();
}
function plane(g,x,y,dir=1){
 g.c.save();g.c.translate(x,y);g.c.scale(dir,1);g.dot(4,13,32,'#7e91825e',5);
 g.poly([[-35,-8],[-18,-7],[-3,-8],[-24,-30],[-15,-30],[14,-10],[34,-9],[43,-4],[36,0],[8,1],[-14,20],[-21,20],[-7,1],[-27,0]],'#e8ede1');
 g.poly([[-31,-8],[-35,-22],[-29,-22],[-16,-6]],'#468a8b');g.line([[-29,-4],[28,-4]],indigo,2);g.c.restore();
}
function boat(g,x,y){
 g.poly([[x-48,y-12],[x+43,y-12],[x+30,y+2],[x-33,y+2]],'#476979');g.box(x-31,y-34,17,22,'#e6debe');g.box(x-27,y-30,8,4,'#65878d');
 for(let k=0;k<3;k++)g.box(x-10+k*14,y-21,13,9,[orange,green,red][k]);
}
function bike(g,x,y,f){
 g.dot(x-9,y-6,6,ink);g.dot(x+10,y-6,6,ink);g.line([[x-9,y-6],[x-3,y-16],[x+3,y-7],[x+10,y-6],[x+6,y-18]],'#ddab59',3);
 g.line([[x-3,y-18],[x,y-27],[x+8,y-19]],green,5);g.dot(x+1,y-32,4,'#a77956');g.line([[x-2,y-17],[x+Math.sin(f*24)*5,y-8]],ink,2);
}
function vehicle(g,x,y,type,dir,f,passengers=1){
 const A=window.ORTOPIA_PAINT;
 if(type==='p'){for(let j=0;j<Math.min(4,passengers);j++)A.person(g,x+j*9-4,y-Math.floor(j/3)*5,f*27+j,j?orange:green);return;}
 if(type==='a'){plane(g,x,y,dir);return;}if(type==='s'){boat(g,x,y);return;}if(type==='y'){bike(g,x,y,f);return;}
 if(type==='k'){A.crate(g,x-15,y-12,25);return;}
 if(type==='r'||type==='R'){train(g,x,y,green,type==='R'?4:2,dir);return;}
 if(type==='b'||type==='v'){train(g,x,y,indigo,1,dir);return;}
 A.car(g,x,y,dir,type==='t'?orange:green,type==='t'?'van':'taxi');
}
function axis(d,s){
 const all=d.runs.flat(),min=Math.min(...all.map(r=>r[3])),max=Math.max(...all.map(r=>r[3]));
 return [min,max];
}
function playback(d,s,k,f){
 const rows=d.runs[k],sameClock=['s','Cruising minutes','Travel time','model period','Berth time'].includes(s.clock);
 const [begin,finish]=sameClock?axis(d,s):[rows[0][3],rows.at(-1)[3]];
 // Preserve an observable arrival and interchange even when a red phase lasts hundreds of seconds.
 const weights=rows.slice(1).map((r,j)=>Math.max(.65,Math.log1p(r[3]-rows[j][3]))),sum=weights.reduce((a,b)=>a+b,0);
 let u=clamp((f-.035)/.92),j=1,q=0,clock=begin+u*(finish-begin);
 if(sameClock){while(j<rows.length-1&&rows[j][3]<clock)j++;q=clamp((clock-rows[j-1][3])/(rows[j][3]-rows[j-1][3]||1));}
 else{let n=u*sum;while(j<rows.length-1&&n>weights[j-1])n-=weights[j++-1];q=clamp(n/weights[j-1]);clock=rows[j-1][3]+q*(rows[j][3]-rows[j-1][3]);}
 const prev=rows[j-1],next=rows[j],move=clamp((q-.09)/.79),route=lineBetween(s,prev[0],next[0]);
 const loc=window.ORTOPIA_PAINT.along(route,move);
 const holding=prev[0]===next[0],arrived=move>=1,kind=(q<.09?prev:next)[1];
 const continuous=['Cumulative cycling time','Cumulative running time','Time spent cruising','Distance on this leg','The battery capacity at the end of the first shift','Charge on arrival','Wait for release'].includes(s.measure);
 const val=continuous?prev[2]+move*(next[2]-prev[2]):(arrived?next[2]:prev[2]);
 if(s.id==='P0481'){
  const t=rows[0][3]+clamp((f-.035)/.92)*(rows.at(-1)[3]-rows[0][3]),idx=Math.min(rows.length-1,Math.floor((t-24+.0000001)/2)),row=rows[idx];
  const amps=row[4],cost=rows[0][2],sum=row=>row[4].reduce((n,x)=>n+x[1],0),total=rows.slice(0,idx).reduce((n,r)=>n+sum(r)/30,0)+sum(row)*(t-row[3])/60;
  return {pos:loc,kind,j,prev,next,holding,arrived,q,f,clock:'No. '+fmt(t)+' min',value:cost,
   sockets:amps,prior:idx?rows[idx-1][4]:[],upcoming:idx<rows.length-1?rows[idx+1][4]:[],slice:(t-row[3])/2,delivered:total,
   metrics:[['Received vehicle',amps.map(a=>'Vehicle '+a[0]).join(', ')||'None'],['Charging power of this site',fmt(sum(row))+' kW'],['Deliver power after 24 minutes',fmt(total)+' kWh'],[s.measure,fmt(cost)+' '+s.unit]]};
 }
 let note=holding?s.stops[next[0]]:arrived?s.stops[next[0]]:s.stops[prev[0]]+' → '+s.stops[next[0]];
 return {pos:loc,kind,j,prev,next,holding,arrived,q,f,clock:s.clock==='Event'?note:s.clock+' '+fmt(clock),metrics:[['Current location',note],[s.measure,fmt(val)+(s.unit?' '+s.unit:'')]],value:val};
}
function register(id,s){
 s.id=id;
 const action=s.choices.join(', or')+'. follow '+s.actor+' Inspect '+s.measure+'. ';
 labs[id]={batch:'remaining',title:s.title,scope:s.scope+' Site locations and walking routes not given are indicative.',choices:s.choices,
 action,views:['Follow '+s.actor,'Panoramic view of the field'],duration:39,
 chapters:(d,k)=>{if(id==='P0481')return [{at:0,label:'24 minutes · First shift takes over'},{at:.24,label:'26 points · Shared power'},{at:.79,label:'32 points · Distributing power'},{at:.98,label:'34 points · Toggle'}];const rs=d.runs[k];let keys=[{at:0,label:s.stops[rs[0][0]]}];let jlast=0;
 for(let frame=0;frame<=160;frame++){let f=frame/160,st=playback(d,s,k,f);if(st.arrived&&jlast<st.j){keys.push({at:f,label:s.stops[st.next[0]]});jlast=st.j;}}return keys;},
 frame:(d,k,f)=>playback(d,s,k,f),
 draw(canvas,st,d,k,f,view){
  const A=window.ORTOPIA_PAINT,here=st.pos,dir=point(s,st.next[0])[0]>=point(s,st.prev[0])[0]?1:-1;
  A.scene(canvas,id,g=>backdrop(g,s,d),[here[0],here[1]-34],view,610,g=>{
   if(s.mode==='signal'){const [x,y]=point(s,1);g.dot(x+17,y-87,4.4,st.holding?red:'#91d286');}
   if(s.mode==='ticket'){const [x,y]=point(s,1),n=id==='P0447'?(k?1:3):(k?2:1);for(let j=0;j<n;j++){g.box(x-37+j*23,y-52,21,13,k?orange:green);g.text('ticket',x-27+j*23,y-46,10,'#fff');}const apron=point(s,3),taxi=clamp((f-.945)/.055);plane(g,apron[0]+10+taxi*86,apron[1]+5-taxi*14);}
   if(s.mode==='charge'&&st.holding&&st.kind!=='p'){const [x,y]=here;g.line([[x-9,y-21],[x-22,y-17],[x-29,y-33]],'#50796b',2);}
   if(k&&st.kind==='p'&&st.holding&&['P0047','P0270','P0152'].includes(id)){
    // The tracked passenger stays on the pavement as the assigned or unavailable vehicle leaves.
    const offset=clamp(st.q*1.22)*210;vehicle(g,here[0]+offset,here[1]+21,'b',1,f);
   }
   if(id==='P0159'){
    const n=k?5:6,loc=k?window.ORTOPIA_PAINT.along([point(s,0),point(s,1),point(s,2),point(s,3)],f):here;
    for(let j=0;j<(k?n:n-1);j++)vehicle(g,loc[0]+(j%3-1)*65,loc[1]+24+Math.floor(j/3)*25,'b',dir,f);
   }
   if(s.mode==='port'){if(k)boat(g,point(s,2)[0],point(s,2)[1]);const x=point(s,2)[0]+23,y=point(s,2)[1]-83;let q=st.j===2?st.q:0;g.line([[x,y-36],[x,y-34+q*28]],ink,2);A.crate(g,x-10,y-34+q*28,19);}
   if(s.mode==='railfreight'&&st.kind==='k'&&st.next[0]>1){train(g,here[0]+55,here[1]+8,indigo,2);}
   if(id==='P0481'){/* Charging berths are drawn from actual powers below. */}
   else if(s.mode==='ticket'&&st.kind==='a'){if(f<.945)A.person(g,here[0],here[1],f*23,green);}
   else if(st.kind==='v'&&s.mode==='air')plane(g,here[0],here[1],dir);
   else if(id==='P0495'&&st.kind==='v')A.car(g,here[0],here[1],dir,green,'taxi');
   else vehicle(g,here[0],here[1],st.kind,dir,st.holding?0:f,['P0123','P0152','P0081','P0270','P0412'].includes(id)?3:1);
   if(s.mode==='charge'&&['kWh','energy unit','kW'].includes(s.unit)){
    const max=Math.max(1,...d.runs.flat().map(r=>r[2]));g.box(here[0]-23,here[1]+8,48,8,'#48615b');g.box(here[0]-21,here[1]+10,44*clamp(st.value/max),4,st.value<max*.17?'#d88853':'#a8d890');
   }
   activity(g,s,d,st,k);
   g.sign(s.actor,here[0],here[1]-53,st.holding&&k?red:green,12);
  });
 }};
}
Object.entries(specs).forEach(([id,s])=>register(id,s));
// Follow actual vehicles on the operational maps from the first decision collection.
function operationMap(g,s){
 city(g,s);
 if(s.mode==='air'){
  for(let j=0;j<s.points.length;j++){
   const [x,y]=s.points[j];window.ORTOPIA_PAINT.building(g,x-43,y+3,72,43,'terminal '+j,'#c3c0ab');
   g.dot(x+15,y+12,25,'#829790',10);g.text('H',x+15,y+11,15,'#fff');
  }
 }else{
  if(s.mode==='rail'){
   rails(g,s.points.slice(0,10));rails(g,s.points.slice(10));const [x,y]=s.points[9],[xx,yy]=s.points[10];
   g.line([[x+5,y],[xx-4,yy]],'#ab745c',8,[5,6]);g.sign('Zone blocking',(x+xx)/2,y+73,red,12);
  }else window.ORTOPIA_PAINT.road(g,s.points,34);
  s.points.forEach(([x,y],j)=>{if(s.mode==='town'||j===9||j===10||j%3===1)platform(g,x,y-18,s.stops[j]);else g.text(s.stops[j],x,y-25,10,ink);});
 }
}
function timetableWorld(id,labels){
 const old=labs[id],air=id==='P0161',metro=id==='P0092';
 const frame=old.frame;
 let layout;
 function map(d){
  if(layout)return layout;
  let points=[],stops=[];
  if(metro){
   const miles=[0];for(const segment of d.segments)miles.push(miles.at(-1)+segment);
   points=miles.map((x,j)=>[63+x/miles.at(-1)*1120,380-51*Math.sin(Math.PI*j/15)]);stops=d.names;
  }else if(air){points=d.nodes.map(([x,y])=>[105+x*62,468-(y-3)*46]);}
  else{points=Array.from({length:10},(_,j)=>[86+j*118,377-53*Math.sin(j*.69)]);stops=points.map((_,j)=>j+' station');}
  return layout={points,stops,mode:air?'air':metro?'rail':'town'};
 }
 function locate(s,d,k){
  const {points}=map(d),A=window.ORTOPIA_PAINT;
  if(metro){
   const station=k===2?9:10;
   const plan=d.scenarios[k],board=plan.platforms.find(e=>e[1]===station&&e[0]>=(k===2?7900:7700)),service=plan.trains.find(r=>r[0]===board[5]);
   const ev=s.trains.find(r=>r.id===board[5]);let pos=points[station],on=false,actor=d.names[station]+' Waiting passenger flow';
   if(ev){pos=A.lerp(points[ev.a],points[ev.b],ev.p);on=true;actor=ev.id+' times · Already boarded';}
   else if(s.t>service[3].at(-1)){pos=points[service[2].at(-1)];actor='Arrival '+d.names[service[2].at(-1)];}
   return {pos,on,actor,station,evt:board[0],amount:s.platforms[station===9?0:1].count};
  }
  if(air){
   const group=d.requests[0],fl=d.flights.find(x=>x[0]===group[7]&&x[1]===group[8]),a=points[group[0]],b=points[group[1]];
   const on=!k&&s.t>=fl[4]&&s.t<fl[5],done=!k&&s.t>=fl[5];const p=clamp((s.t-fl[4])/(fl[5]-fl[4]));
   let pos=on?A.lerp(a,b,p):done?[b[0]-32,b[1]+22]:[a[0]-31+clamp((s.t-group[2]+3)/3)*30,a[1]+14];
   return {pos,on,done,actor:s.status,evt:fl[4]};
  }
  const plan=d.scenarios[k],board=plan.board.find(z=>z[2]>=54&&z[3]>0),ride=plan.routes[board[0]-1],idx=19-d.station,bus=s.fleet.find(x=>x.id===board[0]),station=d.station;
  const mapBus=e=>{const n=Math.floor(e.where),next=Math.min(n+1,9);return A.lerp(points[n],points[next],e.where-n);};
  const on=!!bus&&s.t>=board[2],done=s.t>=ride.at(-1)[2],pos=done?points[0]:on?mapBus(bus):points[station];
  return {pos,on:on&&!done,done,actor:done?'Return to end point':on?board[0]+' bus passengers':station+' Passengers waiting at bus stop',evt:board[2],mapBus,station};
 }
 labs[id]={...old,batch:'lab20',title:labels[0],views:[labels[1],labels[2]],duration:42,
  scope:old.scope+' The default shot progresses as a designated group of passengers wait, board, and arrive. Actual road segments run according to instance timing. Characters are representatives of aggregated needs.',
  chapters(d,k){
   if(air){const r=d.requests[0],fl=d.flights.find(x=>x[0]===r[7]&&x[1]===r[8]);return [[0,'Terminal open'],[r[2]/d.end,'Threesome check in'],[fl[4]/d.end,'Verify flight'],[k?r[3]/d.end:fl[5]/d.end,k?'Takeoff window closes':'Arrive at field 0']].map(([at,label])=>({at,label}));}
   let probe=frame(d,k,0),e=locate(probe,d,k).evt,lo=metro?d.bounds[0]:36,hi=metro?d.bounds[1]:112;
   return [[0,'Waiting scene'],[clamp((e-lo-(metro?50:3))/(hi-lo)),'vehicle approaching'],[clamp((e-lo)/(hi-lo)),'Passengers on the platform'],[clamp((e-lo+(metro?135:7))/(hi-lo)),'Follow in the car']].map(([at,label])=>({at,label}));
  },
  draw(canvas,s,d,k,f,view){
   const A=window.ORTOPIA_PAINT,m=map(d),pts=m.points,follow=locate(s,d,k),here=follow.pos;
   A.scene(canvas,id,g=>operationMap(g,m),[here[0],here[1]-24],view,metro?540:625,g=>{
    if(metro){
     for(const e of s.trains){let pos=A.lerp(pts[e.a],pts[e.b],e.p);train(g,pos[0],pos[1]+(e.b>e.a?8:-3),e.agent?indigo:green,1,e.b>e.a?1:-1);}
     for(let i=0;i<2;i++){const [x,y]=pts[9+i],n=Math.min(15,Math.ceil(s.platforms[i].count/4));for(let j=0;j<n;j++)A.person(g,x-20+(j%6)*8,y-16-Math.floor(j/6)*6,0,j%2?orange:green);}
    }else if(air){
     for(const e of s.fleet){const p=e.fl?A.lerp(pts[e.a],pts[e.b],e.p):pts[e.a];plane(g,p[0]+12,p[1]-7,e.fl&&pts[e.b][0]<pts[e.a][0]?-1:1);}
     if(!follow.on)for(let j=0;j<3;j++)A.person(g,here[0]+j*10,here[1]+8,follow.done?f*20:0,j?green:orange);
    }else{
     for(const bus of s.fleet){const [x,y]=follow.mapBus(bus);vehicle(g,x,y+(bus.returning?2:16),'b',bus.returning?-1:1,f);}
     const [x,y]=pts[d.station],n=Math.min(17,s.queue);
     for(let j=0;j<n;j++)A.person(g,x+(j%7)*8-27,y-14-Math.floor(j/7)*7,0,j<s.booked?orange:green);
    }
    g.sign(follow.actor,here[0],here[1]-55,k&&!follow.on?indigo:green,13);
   });
  }
 };
}
timetableWorld('P0092',['After interrupting and turning back, which bus will passengers at the platform take?','Follow return travelers','London line panorama']);
timetableWorld('P0110',['Book a bus to pick up passengers from Station 7 and return to the main station','Follow returning passengers','Panorama along the bus']);
timetableWorld('P0161',['How do three passengers fly from airport 1 to airport 0?','Follow the trio','Panoramic view of landing field']);

})();
