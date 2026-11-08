import test from 'node:test';
import assert from 'node:assert/strict';
import {
 years,roads,trafficHours,trafficSampleDates,trafficCoverage,trafficRawRows,trafficCleaning,
 cleanTrafficRows,normalizeTrafficDate,normalizeTrafficRoad,trafficStarSchema,trafficDax,
 getTrafficView,createTrafficScenario,trafficScenario,trafficScenes,trafficStarts,trafficDuration,
} from '../reslot-react/src/traffic-scenario.ts';

test('traffic: six observed slots per fictional sample day, never annual totals',()=>{
 assert.match(trafficCoverage,/fictives/);
 assert.match(trafficCoverage,/jamais des totaux annuels/);
 assert.equal(trafficCleaning.facts.length,36);
 for(const year of years)for(const {id:road} of roads){
  const view=getTrafficView(year,road);
  assert.deepEqual(view.labels,[...trafficHours]);
  assert.equal(view.counts.length,6);
  assert.ok(view.counts.every(count=>count>0&&Number.isInteger(count)));
  const retained=trafficCleaning.facts.filter(row=>row.road===road&&row.date===trafficSampleDates[year]);
  assert.equal(retained.length,6);
  assert.equal(view.volume,retained.reduce((sum,row)=>sum+row.count,0));
  assert.equal(view.volume,view.counts.reduce((sum,count)=>sum+count,0));
  assert.equal(view.peak.count,Math.max(...view.counts));
  assert.equal(view.peak.label,view.labels[view.counts.indexOf(view.peak.count)]);
 }
 assert.notDeepEqual(getTrafficView(2024,'TR-A').counts,getTrafficView(2023,'TR-A').counts);
 assert.notDeepEqual(getTrafficView(2024,'TR-A').counts,getTrafficView(2024,'TR-B').counts);
});

test('traffic: normalization and audit retain missing values without imputing zero',()=>{
 assert.equal(normalizeTrafficDate('13/06/2023'),'2023-06-13');
 assert.equal(normalizeTrafficDate('29/02/2024'),'2024-02-29');
 assert.equal(normalizeTrafficDate('29/02/2023'),null);
 assert.equal(normalizeTrafficDate('31/02/2024'),null);
 assert.equal(normalizeTrafficRoad(' tr a '),'TR-A');
 assert.equal(normalizeTrafficRoad('B'),'TR-B');
 assert.equal(normalizeTrafficRoad('unknown'),null);
 assert.equal(trafficRawRows.length,40);
 assert.equal(trafficCleaning.audit.length,trafficRawRows.length);
 assert.deepEqual(trafficCleaning.issues.map(issue=>issue.status),['missing','anomaly','duplicate','invalid']);
 assert.equal(trafficCleaning.issues[0].raw.count,null);
 assert.ok(!trafficCleaning.facts.some(row=>row.sourceId==='DEMO-MANQUANT'));
 assert.ok(!trafficCleaning.facts.some(row=>row.sourceId==='DEMO-A-VERIFIER'));
 assert.equal(trafficCleaning.facts.filter(row=>row.road==='TR-A'&&row.date==='2022-06-14'&&row.hour==='07 h').length,1);
 const result=cleanTrafficRows([
  {sourceId:'absent',date:'11/06/2024',road:'A',hour:'18 h',count:null},
  {sourceId:'zero-observe',date:'11/06/2024',road:'A',hour:'18 h',count:0},
  {sourceId:'negative',date:'11/06/2024',road:'B',hour:'18 h',count:-2},
 ]);
 assert.equal(result.facts.length,1);
 assert.equal(result.facts[0].count,0,'a true observed zero remains valid; a missing observation does not become zero');
 assert.deepEqual(result.issues.map(issue=>issue.status),['missing','anomaly']);
});

test('traffic: star model has unique dimension keys and complete foreign keys',()=>{
 const {dates,routes,locations,facts,relationships}=trafficStarSchema;
 assert.equal(dates.length,1096);
 assert.equal(new Set(dates.map(row=>row.dateKey)).size,dates.length);
 assert.equal(dates[0].date,'2022-01-01');
 assert.equal(dates.at(-1).date,'2024-12-31');
 for(let index=1;index<dates.length;index++)assert.equal(Date.parse(dates[index].date)-Date.parse(dates[index-1].date),86400000);
 const dateKeys=new Set(dates.map(row=>row.dateKey));
 const routeKeys=new Set(routes.map(row=>row.routeKey));
 const locationKeys=new Set(locations.map(row=>row.locationKey));
 const grains=facts.map(fact=>`${fact.dateKey}|${fact.routeKey}|${fact.locationKey}|${fact.creneau}`);
 assert.equal(new Set(grains).size,facts.length);
 for(const fact of facts){
  assert.ok(dateKeys.has(fact.dateKey));assert.ok(routeKeys.has(fact.routeKey));assert.ok(locationKeys.has(fact.locationKey));
 }
 assert.equal(relationships.length,3);
 assert.ok(relationships.every(relationship=>relationship.cardinality==='1 → *'));
});

test('traffic: measurements are computed from matched coverage, with undefined first-year comparison',()=>{
 const view=getTrafficView(2024,'TR-A');
 assert.deepEqual(view.counts,[185,240,160,260,405,205]);
 assert.equal(view.volume,1455);
 assert.equal(view.previousVolume,1335);
 assert.equal(view.evolution,(1455-1335)/1335);
 assert.deepEqual(view.peak,{label:'18 h',count:405});
 assert.deepEqual(view.comparison,{peak:405,offPeak:160});
 assert.equal(getTrafficView(2022,'TR-A').previousVolume,null);
 assert.equal(getTrafficView(2022,'TR-A').evolution,null);
 assert.match(trafficDax.volume,/SUM\(FaitsTrafic\[NombreVehicules\]\)/);
 assert.match(trafficDax.previousVolume,/ALL\(Dates\)/);
 assert.match(trafficDax.previousVolume,/AnneeChoisie - 1/);
 assert.match(trafficDax.yearlyEvolution,/DIVIDE/);
 assert.match(trafficDax.peakComparison,/\[Volume 18 h démo\] - \[Volume 12 h démo\]/);
});

test('traffic: timeline ends coherently and each node participates',()=>{
 assert.equal(trafficScenario.id,'traffic');
 assert.equal(trafficScenes[0].duration,3);
 assert.equal(trafficDuration,63);
 assert.ok(trafficDuration>=55&&trafficDuration<=75);
 assert.equal(trafficStarts.at(-1)+trafficScenes.at(-1).duration,trafficDuration);
 const expected=['sources','cleaning','dimensions','facts','dax','dashboard','filters','peaks','insights'];
 assert.deepEqual(trafficScenario.stages.map(stage=>stage.id),expected);
 const ids=new Set(expected);
 for(const scene of trafficScenes){
  if(scene.node)assert.ok(ids.has(scene.node));
  if(scene.from)assert.ok(ids.has(scene.from));
 }
 assert.deepEqual(new Set(trafficScenes.map(scene=>scene.node).filter(Boolean)),ids);
 assert.equal(trafficScenes.at(-1).node,'insights');
 assert.match(trafficScenes.find(scene=>scene.node==='peaks').output,/aucune prédiction ni congestion établie/);
 assert.match(trafficScenes.at(-1).output,/capacité, les vitesses et une couverture plus large/);
 const firstYear=createTrafficScenario(2022,'TR-B');
 assert.match(firstYear.scenes.find(scene=>scene.title.includes('successives')).output,/indisponible/);
 assert.match(firstYear.scenes.at(-1).output,/Tronçon B/);
 assert.equal(firstYear.scenes.reduce((sum,scene)=>sum+scene.duration,0),trafficDuration);
 assert.deepEqual(firstYear.scenes.map(scene=>scene.node),trafficScenes.map(scene=>scene.node));
});
