/* 종합 테스트 하네스 — 난이도 정책(쉬움/보통/어려움) × 전 조합 + 영약(의뢰드랍/제련) 경로.
   검증: ① 난이도별 보상 ② 의뢰 성장 ③ 영약으로 1명 화경. 실행: node sim.cjs
   ───────────────────────────────────────────────────────────────────────────
   ★ 레버(아래 const) — 게임 수치와 맞춰 튜닝. [출시값] vs [화경경로 제안값]:
     EXP_STAGE          성 적립      [출시] 10/7/4/2   [화경] 10/9/8/6
     REXT 고경지         외공 벽      [출시] 절50·초65·화78  [화경] 48/56/62
     FATAL              재난 사망    [출시·현재] 0.2 (극험만 회당 ~23%)
     QK                 결투/큰의뢰 외공 [출시·현재] 20
     CRAFT_ALCHEMY_MIN  영약제련 임계 [화경] 45
   ※ 이 파일 현재값 = [화경경로 제안] 상태(무과금 화경 53% 검증). 출시 상태 보려면 위 [출시]로 교체.
   설계 목표: 무과금 최소 절정 / 조합(검특화+외공) 초절정 / 화경=초절정+신품무공서 7성+신품영약(운 드랍 또는 제련). */

const EFF={특화:1,상성:.6,보통:.35,미숙:.1,상극:.04}, BODY_EFF={특화:1,상성:.8,보통:.62,미숙:.35,상극:.18};
const BODY_AGE=a=>a<=12?6:a<=14?4:a<=16?2.4:a<=18?1.1:.55;
const RO=['none','samryu','iryu','ilryu','jeoljeong','chojeoljeong','hwagyeong'];
const RL={none:'미입문',samryu:'삼류',iryu:'이류',ilryu:'일류',jeoljeong:'절정',chojeoljeong:'초절정',hwagyeong:'화경'};
const RINT={none:0,samryu:0,iryu:100,ilryu:250,jeoljeong:500,chojeoljeong:850,hwagyeong:1300};
const REXT={none:0,samryu:10,iryu:20,ilryu:35,jeoljeong:48,chojeoljeong:56,hwagyeong:62}; // [화경경로] 고경지 외공 현실화(str보통 도달선), 영약이 마지막 도약 대신
const RSG={none:0,samryu:0,iryu:0,ilryu:0,jeoljeong:0,chojeoljeong:5,hwagyeong:7};
const RSC={none:0,samryu:3,iryu:4,ilryu:6,jeoljeong:7,chojeoljeong:8,hwagyeong:10};
const RLF={none:1,samryu:1,iryu:2,ilryu:3,jeoljeong:4,chojeoljeong:5,hwagyeong:6};
const WALL=['jeoljeong','chojeoljeong','hwagyeong'], ENL={iryu:{b:.3,p:.06},ilryu:{b:.22,p:.06},jeoljeong:{b:.15,p:.07},chojeoljeong:{b:.1,p:.05},hwagyeong:{b:.05,p:.05}};
const EXP_STAGE={introduction:10,small_completion:9,great_completion:8,ultimate:6}; // [화경경로] 성 적립 강화 — 순수수련으로도 신품 무공서 7성
const ri=r=>RO.indexOf(r),nextR=r=>ri(r)<6?RO[ri(r)+1]:null,isW=t=>WALL.includes(t);
const etns=s=>140+(Math.max(1,s)-1)*80,stage=s=>s>=10?'ultimate':s>=7?'great_completion':s>=4?'small_completion':'introduction';
const scap=g=>({novice:6,apprentice:7,master:9,grandmaster:10,legendary:10}[g]);
const gceil=g=>({novice:'ilryu',apprentice:'jeoljeong',master:'chojeoljeong',grandmaster:'hwagyeong',legendary:'hwagyeong'}[g]);
const glr=g=>({novice:'samryu',apprentice:'samryu',master:'iryu',grandmaster:'ilryu',legendary:'jeoljeong'}[g]);
const enl=(i,t)=>{const c=ENL[t]||{b:.15,p:.06};return Math.max(.02,Math.min(.95,c.b+Math.max(0,i)*c.p));};
const etn=l=>20+Math.max(0,l)*4+Math.floor(Math.max(0,l)/10)*40,scs=id=>id==='endurance'?18:100;
const smul=(s,m)=>{const r=s/(m||50);return r>=.5?1:r>=.3?.7:r>=.1?.4:0;};

const ARTS={
  'cheongpung-swordplay':{n:'청풍검법',school:'sword',grade:'apprentice',pr:[]},'baekun-fist':{n:'백운권법',school:'fist',grade:'apprentice',pr:[]},
  'unbo':{n:'운보',school:'lightness',grade:'novice',pr:[]},'cheongsim-gigong':{n:'청심기공',school:'qigong',grade:'novice',pr:[]},
  'hwasan-gicho-sword':{n:'화산기초검',school:'sword',grade:'novice',pr:[]},'yukhap-sword':{n:'육합검',school:'sword',grade:'apprentice',pr:[['hwasan-gicho-sword',3]]},
  'maehwa-sword':{n:'매화검법',school:'sword',grade:'master',pr:[['yukhap-sword',5]]},'jaha-sword':{n:'자하검법',school:'sword',grade:'master',pr:[['yukhap-sword',5]]},
  'isipsa-maehwa-sword':{n:'이십사수매화검',school:'sword',grade:'grandmaster',pr:[['maehwa-sword',6],['jaha-sword',4]]},
};
const SL=['hwasan-gicho-sword','yukhap-sword','maehwa-sword','jaha-sword','isipsa-maehwa-sword'];
const SS=[['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',6],['isipsa-maehwa-sword',10]];
const CHARS={
  jang:{n:'장철',ins:2,study:'knowledge',dom:'guard',eff:{fist:'상성',staff:'상성',strength:'특화',guarding:'특화',medicine:'미숙',scouting:'상극',alchemy:'상극'},learn:['baekun-fist'],seq:[['baekun-fist',10]]},
  jin:{n:'진소화',ins:3,study:'alchemy',dom:'medicine',eff:{medical:'특화',medicine:'특화',alchemy:'특화',scouting:'미숙',strength:'상극',guarding:'상극'},learn:['cheongsim-gigong'],seq:[['cheongsim-gigong',10]]},
  han:{n:'한바람',ins:3,study:'knowledge',dom:'scout',eff:{lightness:'특화',darkArts:'특화',sword:'상성',scouting:'특화',medicine:'미숙'},learn:SL.slice(0,3),seq:[['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',9]]},
  yun:{n:'윤소소',ins:4,study:'knowledge',dom:'duel',eff:{sword:'특화',lightness:'상성',qigong:'상성',knowledge:'특화',guarding:'상성'},learn:SL,seq:SS},
  cheongha:{n:'이청하',ins:4,study:'knowledge',dom:'assassin',eff:{sword:'특화',lightness:'특화',darkArts:'특화',scouting:'특화'},learn:SL,seq:SS},
  baek:{n:'백연',ins:5,study:'knowledge',dom:'medicine',eff:{qigong:'특화',medical:'상성',knowledge:'특화'},learn:['cheongsim-gigong'],seq:[['cheongsim-gigong',10]]},
};
const FREE=['jang','jin','han','yun','cheongha','baek'];
const DOMAIN_STAT={guard:'guarding',scout:'scouting',medicine:'medicine',assassin:'scouting',duel:null,grand:null};
const GR_RISK={menial:{inj:0,dth:0},minor:{inj:1,dth:0},normal:{inj:1,dth:0},dangerous:{inj:1,dth:0},extreme:{inj:1,dth:1}};
const GR_WK={menial:1,minor:1,normal:2,dangerous:3,extreme:4};
const QUESTS=[
  {id:'q-market',dom:'guard',gr:'menial',min:0,money:5,fame:1,rec:1},{id:'q-herb',dom:'medicine',gr:'menial',min:0,money:5,fame:1,rec:1},
  {id:'q-patrol',dom:'guard',gr:'minor',min:5,money:9,fame:2,rec:1},{id:'q-scout-v',dom:'scout',gr:'minor',min:5,money:9,fame:2,rec:1},
  {id:'q-escort',dom:'guard',gr:'normal',min:20,money:18,fame:4,rec:1},{id:'q-missing',dom:'scout',gr:'normal',min:20,money:16,fame:4,rec:1},
  {id:'q-clinic',dom:'medicine',gr:'normal',min:25,money:17,fame:5,rec:1},{id:'q-duel-ch',dom:'duel',gr:'normal',min:25,money:15,fame:6,rec:1},
  {id:'q-bandit',dom:'duel',gr:'dangerous',min:40,money:35,fame:8,rec:2},{id:'q-heuksa',dom:'scout',gr:'dangerous',min:40,money:30,fame:9,rec:2},
  {id:'q-caravan',dom:'guard',gr:'dangerous',min:40,money:38,fame:8,rec:2},{id:'q-antidote',dom:'medicine',gr:'dangerous',min:40,money:30,fame:7,rec:1},
  {id:'q-duel-m',dom:'duel',gr:'dangerous',min:45,money:32,fame:9,rec:1},{id:'q-assassin-c',dom:'assassin',gr:'dangerous',min:45,money:45,fame:7,rec:2},
  {id:'q-grand-cr',dom:'grand',gr:'dangerous',min:45,money:40,fame:10,rec:2},
  {id:'q-grand-meng',dom:'grand',gr:'extreme',min:65,money:70,fame:15,rec:3},{id:'q-hyeolsu',dom:'duel',gr:'extreme',min:65,money:80,fame:16,rec:3},
  {id:'q-grand-sapa',dom:'grand',gr:'extreme',min:65,money:75,fame:16,rec:3},{id:'q-assassin-b',dom:'assassin',gr:'extreme',min:65,money:85,fame:14,rec:2},
];
const POLICY={easy:['menial','minor','normal'],normal:['normal','dangerous'],hard:['dangerous','extreme']};
const OUT={full:{m:1,f:1,g:1},partial:{m:.6,f:.5,g:.6},crisis:{m:1,f:1,g:1},fail:{m:.1,f:0,g:.2},disaster:{m:0,f:0,g:0}};
const ELIXIR_DROP=0.08, CRAFT_ALCHEMY_MIN=45; // [화경경로] 영약제조 45+ 제자가 신품 영약 제련(특화 제자 15년 천착선)

function mk(id){const c=CHARS[id];const f=c.seq[0][0];return{id,n:c.n,ins:c.ins,study:c.study,dom:c.dom,eff:c.eff,learn:c.learn,seq:c.seq,
  realm:'samryu',internal:0,pity:0,stepIdx:0,arts:{[f]:{seong:1,exp:0}},main:f,stats:{endurance:{lv:5,exp:0}},maxStam:50,stam:50,stress:0,fatigue:0,seclusion:false,
  fame:0,status:'idle',until:0,quests:0,injuries:0};}
const eo=(d,k)=>EFF[d.eff[k]??'보통'],ms=d=>d.arts[d.main]?.seong??0,ceil=d=>gceil(ARTS[d.main].grade),sl=(d,s)=>d.stats[s]?.lv??0;
function addStat(d,st,e){const t=d.stats[st]??(d.stats[st]={lv:0,exp:0});const c=scs(st);t.exp+=e;while(t.lv<c&&t.exp>=etn(t.lv)){t.exp-=etn(t.lv);t.lv++;}if(t.lv>=c){t.lv=c;t.exp=0;}if(st==='endurance')d.maxStam=Math.max(10,t.lv*10);}
function gainSeong(d,e){const i=d.arts[d.main],a=ARTS[d.main],cap=Math.min(scap(a.grade),RSC[d.realm]);i.exp+=e*eo(d,a.school);while(i.seong<cap&&i.exp>=etns(i.seong)){i.exp-=etns(i.seong);i.seong++;}if(i.seong>=cap)i.exp=0;}
function tickArt(d,inten,pm){const i=d.arts[d.main],a=ARTS[d.main],cap=Math.min(scap(a.grade),RSC[d.realm]);const b=EXP_STAGE[stage(i.seong)],f=(i.exp/etns(i.seong))*100,p=f>=85?.2:f>=70?.5:1;i.exp+=b*eo(d,a.school)*p*inten*pm;while(i.seong<cap&&i.exp>=etns(i.seong)){i.exp-=etns(i.seong);i.seong++;}if(i.seong>=cap)i.exp=0;}
function realmTick(d,intent,pm,secl,sect){const eff=Math.max(0,pm);if(intent==='simbeop')d.internal+=10*eff;const c=ceil(d),ext=sl(d,'strength'),m=ms(d);
  for(;;){const t=nextR(d.realm);if(!t)break;if(ri(t)>ri(c))break;if(d.internal<RINT[t])break;if(ext<REXT[t])break;if(m<RSG[t])break;if(isW(t))break;d.realm=t;d.pity=0;}
  const wt=nextR(d.realm),aw=wt&&ri(wt)<=ri(c)&&d.internal>=RINT[wt]&&ext>=REXT[wt]&&m>=RSG[wt]&&isW(wt);
  if(aw&&secl){ if(wt==='hwagyeong'){ // 화경 = 대오(폐관 일일 굴림, 보장 없음 — 게임 GREAT_ENLIGHTENMENT 동기화 2026-06-12) + 영약
      if(sect.elixirs>0&&Math.random()<GE_SEC_BASE+GE_SEC_INS*d.ins){sect.elixirs--;d.realm=wt;d.pity=0;d.seclusion=false;} }
    else{const ch=enl(d.ins,wt)+d.pity*.05;if(d.pity+1>=12||Math.random()<ch){d.realm=wt;d.pity=0;d.seclusion=false;}else d.pity++;} }
  else if(aw)d.seclusion=true;}
// 대오(大悟) 상수 — 게임 data/realm.ts GREAT_ENLIGHTENMENT 와 동기(2026-06-12).
const GE_SEC_BASE=0.0001,GE_SEC_INS=0.00004,GE_Q_BASE=0.007,GE_Q_INS=0.0035;
// 화경 벽 도달 여부(세 기둥+천장) — 실전 대오 판정용.
function atHwaWall(d){const wt=nextR(d.realm);return wt==='hwagyeong'&&ri(wt)<=ri(ceil(d))&&d.internal>=RINT[wt]&&sl(d,'strength')>=REXT[wt]&&ms(d)>=RSG[wt];}
function planStep(d){for(const id of d.learn){if(d.arts[id])continue;const a=ARTS[id];if(ri(d.realm)<ri(glr(a.grade)))continue;if(!a.pr.every(([p,s])=>(d.arts[p]?.seong??0)>=s))continue;d.arts[id]={seong:Math.max(1,Math.min(RLF[d.realm],scap(a.grade),RSC[d.realm])),exp:0};}
  const[cur,u]=d.seq[d.stepIdx];if(d.stepIdx<d.seq.length-1){const nx=d.seq[d.stepIdx+1][0];if((d.arts[cur]?.seong??0)>=u&&d.arts[nx])d.stepIdx++;}const tg=d.seq[d.stepIdx][0];d.main=d.arts[tg]?tg:(d.arts[cur]?cur:d.main);}
function intent(d,age,dow){if(d.seclusion)return'seclusion';if(d.stam/d.maxStam<.25)return'rest';
  if(d.dom==='medicine'||d.dom==='scout')return['study','simbeop','study','chosik','study','endurance','study'][dow%7];
  const y=age<=16&&sl(d,'strength')<78;return y?['strength','chosik','strength','endurance','strength','chosik','simbeop'][dow%7]:['chosik','chosik','simbeop','chosik','strength','chosik','endurance'][dow%7];}
function day(d,age,dow,sect){const it=intent(d,age,dow);const sf=1-Math.min(.4,(d.stress/100)*.4),pm=smul(d.stam,d.maxStam)*(1-d.fatigue)*sf;
  let sd=0,td=0,lg=0,inten=0,gs=null,eb=0,body=false;
  if(it==='rest'){sd=50;td=-15;}else if(it==='seclusion'){sd=-15;td=5;inten=1.5;}else if(it==='simbeop'){sd=-10;td=5;}else if(it==='chosik'){sd=-10;td=5;inten=1;}
  else if(it==='strength'){sd=-14;td=7;gs='strength';eb=14;lg=.1;body=true;}else if(it==='endurance'){sd=-22;td=10;gs='endurance';eb=18;lg=.3;body=true;}else if(it==='study'){sd=-6;td=9;gs=d.study;eb=11;}
  d.stam=Math.max(0,Math.min(d.maxStam,d.stam+sd));d.stress=Math.max(0,Math.min(100,d.stress+td));if(d.stam<=0){d.stam=d.maxStam;d.fatigue=0;return;}
  if(gs&&eb>0&&pm>0){const tier=d.eff[gs]??'보통';const apt=body?BODY_EFF[tier]:EFF[tier],am=body?BODY_AGE(age):1;addStat(d,gs,Math.max(1,Math.round(eb*apt*am*pm)));}
  if((it==='chosik'||it==='seclusion')&&pm>0)tickArt(d,inten,pm);realmTick(d,it,pm,it==='seclusion',sect);d.fatigue=lg;}
const RW={none:.4,samryu:1,iryu:1.5,ilryu:2.2,jeoljeong:3.2,chojeoljeong:4.5,hwagyeong:6.5},GC={novice:1,apprentice:1.4,master:2,grandmaster:2.8,legendary:3.6};
function cr(d){const mi=d.arts[d.main],base=(mi?.seong??0)*10;const o=Object.keys(d.arts).filter(id=>id!==d.main).map(id=>Math.max(0,d.arts[id].seong-1)).sort((a,b)=>b-a);const w=[.5,.3,.2,.1];let b=0;o.forEach((x,i)=>b+=x*(w[i]??.05));return Math.round(base+Math.min(8,Math.max(0,ri(d.realm)-2)*2)+Math.min(15,b));}
const cap=(d,dom)=>{const st=DOMAIN_STAT[dom];return st?sl(d,st):cr(d);};
function pickQuest(d,allowed){const cap0=cap(d,d.dom);const cands=QUESTS.filter(q=>q.dom===d.dom&&allowed.includes(q.gr));let best=null;
  for(const q of cands){const need=(q.gr==='dangerous'||q.gr==='extreme')?q.min:q.min*.7;if(cap0>=need){if(!best||q.min>best.min)best=q;}}
  return best||cands.slice().sort((a,b)=>a.min-b.min)[0];}
function rollOut(party,q){const caps=party.map(d=>cap(d,q.dom)),avg=caps.reduce((a,b)=>a+b,0)/caps.length;let s=(avg-q.min)/Math.max(20,q.min)+(party.length/Math.max(1,q.rec)-1)*.4;s+=Math.max(0,caps.filter(c=>c>=q.min).length-1)*.12;s=Math.max(-1,Math.min(1.5,s));
  const r=Math.random(),rk=GR_RISK[q.gr];if(s>=.6)return r<.85?'full':'partial';if(s>=.2)return r<.5?'full':r<.85?'partial':rk.inj?'crisis':'partial';if(s>=-.2)return r<.35?'partial':r<.7?(rk.inj?'crisis':'partial'):'fail';if(r<.3)return'fail';if(r<.7)return rk.inj?'crisis':'fail';return rk.dth?'disaster':rk.inj?'crisis':'fail';}
function resolve(party,q,day,sect,tot){let o=rollOut(party,q);const age=10+Math.floor((day-1)/336);if(party.some(d=>sl(d,'medicine')>=30)){if(o==='disaster')o='crisis';else if(o==='crisis')o='partial';}
  const sc=OUT[o],st=DOMAIN_STAT[q.dom],mart=(q.dom==='duel'||q.dom==='grand');const vic=Math.floor(Math.random()*party.length);
  tot.money+=Math.round(q.money*sc.m);tot.fame+=Math.round(q.fame*sc.f*party.length);
  if(q.gr==='extreme'&&(o==='full'||o==='crisis')&&Math.random()<ELIXIR_DROP)sect.elixirs++;
  party.forEach((d,i)=>{d.quests++;if(sc.g>0){if(st)addStat(d,st,Math.max(1,Math.round(35*sc.g)));else if(mart){gainSeong(d,Math.max(1,Math.round(60*sc.g)));addStat(d,'strength',Math.max(1,Math.round(QK*sc.g*BODY_EFF[d.eff['strength']??'보통']*BODY_AGE(age))));
      // 실전 대오 — 결투·큰의뢰 생환 시 화경 벽 굴림(게임 attemptQuestEnlightenment 동기, 보장 없음).
      if(o!=='disaster'&&atHwaWall(d)&&sect.elixirs>0&&Math.random()<GE_Q_BASE+GE_Q_INS*d.ins){sect.elixirs--;d.realm='hwagyeong';d.pity=0;}
    }}d.fame=Math.min(100,d.fame+Math.round(q.fame*sc.f));
    if(o==='disaster'&&i===vic){ if(Math.random()<FATAL){d.status='dead';tot.deaths++;} else {d.status='injured';d.until=day+28;d.injuries++;} } // 재난→생존 굴림
    else if(o==='disaster'){d.status='injured';d.until=day+21;d.injuries++;}else if(o==='crisis'&&i===vic){d.status='injured';d.until=day+14;d.injuries++;}else d.status='idle';});}
let FATAL=0.2; // 재난 시 사망 확률(반영됨)
let QK=0; // 결투·큰의뢰 1회 외공 보강(스윕) — BODY_EFF 곱, 나이 무관(실전 단련)

function run(ids,policy,questOn){const ds=ids.map(mk);const sect={elixirs:0};const tot={money:0,fame:0,deaths:0};const allowed=POLICY[policy];let dow=0;const active=[];
  for(let year=1;year<=15;year++){const age=10+(year-1);
    for(let dn=1;dn<=336;dn++){const T=(year-1)*336+dn;
      for(let k=active.length-1;k>=0;k--)if(T>=active[k].due){resolve(active[k].party,active[k].q,T,sect,tot);active.splice(k,1);}
      for(const d of ds)if(d.status==='injured'&&T>=d.until)d.status='idle';
      if(((dn-1)%28)===0){ds.forEach(d=>{if(d.status!=='dead')planStep(d);});
        // 영약 제련 — 영약제조(alchemy) 70+ 제자가 idle이면 2년에 1개(설계 검증).
        for(const d of ds){if(d.status==='dead')continue;if(sl(d,'alchemy')>=CRAFT_ALCHEMY_MIN&&((year-1)*12+Math.floor((dn-1)/28))%24===0&&dn<=28)sect.elixirs++;}
        if(questOn)for(const d of ds){if(d.status!=='idle')continue;if(Math.random()>=.35)continue;const q=pickQuest(d,allowed);if(!q)continue;
          let party=[d];if((q.gr==='dangerous'||q.gr==='extreme')&&q.rec>1){const m=ds.filter(x=>x!==d&&x.status==='idle'&&(x.dom==='duel'||x.dom==='guard')).slice(0,q.rec-1);party=party.concat(m);}
          party.forEach(p=>p.status='questing');active.push({party,q,due:T+GR_WK[q.gr]*7});}
        continue;}
      ds.forEach(d=>{if(d.status==='idle')day(d,age,dow,sect);});dow++;
    }}
  return{ds,sect,tot};}

// ── 조합 전수 생성 (자유 6명 중 2~4명) ──
function combos(arr,lo,hi){const out=[];const rec=(start,cur)=>{if(cur.length>=lo&&cur.length<=hi)out.push([...cur]);if(cur.length>=hi)return;for(let i=start;i<arr.length;i++){cur.push(arr[i]);rec(i+1,cur);cur.pop();}};rec(0,[]);return out;}
const ALL=combos(FREE,2,4);

// ═══ 스윕: 재난→사망 확률(FATAL) 별 어려움 정책 회당 사망률 ═══
console.log('═══ FATAL 스윕 — 어려움(hard)만 전 조합('+ALL.length+'개) 회당 사망률 ═══');
const REPS=100; // 통계 룰(2026-06-12): 회차 단위 측정 기본 100회+ (docs/36 §통계 3룰)
for(const f of [1.0,0.35,0.3,0.25,0.2]){ FATAL=f; let nd=0,runs=0,deaths=0;
  for(let rep=0;rep<20;rep++)for(const combo of ALL){const{tot}=run(combo,'hard',true);runs++;if(tot.deaths>0)nd++;deaths+=tot.deaths;}
  console.log(`  FATAL ${f.toFixed(2)} → 회당 사망 ${Math.round(nd/runs*100)}% · 평균 사망자수 ${(deaths/runs).toFixed(2)} (n=${runs})`);
}
FATAL=0.2;

// ═══ 테스트 1&2: 난이도 정책별 집계 (전 조합) ═══
console.log('\n═══ 테스트 1&2: 난이도 정책 × 전 조합('+ALL.length+'개) 집계 ═══');
console.log('정책      | 평균자금 | 평균명성합 | 회당사망% | 경지분포(삼/이/일/절/초/화) | 의뢰완수평균');
for(const pol of ['easy','normal','hard']){
  let money=0,fame=0,deaths=0,runs=0,quests=0,nd=0;const realmCnt={};let chars=0;
  for(let rep=0;rep<2;rep++)for(const combo of ALL){const{ds,tot}=run(combo,pol,true);money+=tot.money;fame+=tot.fame;deaths+=tot.deaths;runs++;if(tot.deaths>0)nd++;
    for(const d of ds){chars++;quests+=d.quests;realmCnt[d.realm]=(realmCnt[d.realm]||0)+1;}}
  const rc=RO.slice(1).map(r=>realmCnt[r]||0);
  console.log(`${pol.padEnd(9)} | ${String(Math.round(money/runs)).padStart(7)} | ${String(Math.round(fame/runs)).padStart(9)} | ${String(Math.round(nd/runs*100)).padStart(8)} | ${rc.join('/').padStart(20)} | ${(quests/chars).toFixed(0)}`);
}

// ═══ 테스트 1 보강: 의뢰 등급별 단위 보상(완전성공) ═══
console.log('\n═══ 보상 vs 난이도 (등급별 대표 의뢰, 완전성공 기준) ═══');
for(const g of ['menial','minor','normal','dangerous','extreme']){const q=QUESTS.find(x=>x.gr===g);console.log(`  ${g.padEnd(10)} 자금 ${String(q.money).padStart(2)} · 명성 ${String(q.fame).padStart(2)} · minStat ${q.min} · 위험 ${GR_RISK[g].dth?'사망':GR_RISK[g].inj?'부상':'없음'}`);}

// ═══ 테스트 2: 결투·큰의뢰 외공 보강(QK) 스윕 — 윤소소(검수) 의뢰 ON 경지 회복 ═══
console.log(`\n═══ 테스트 2: 결투·큰의뢰 외공 보강(QK) — 윤소소 의뢰병행 외공/경지 (normal, ${REPS}회 평균) ═══`);
QK=0; { let ext=0,realm=0; for(let r=0;r<REPS;r++){const{ds}=run(['yun','cheongha','jin'],'normal',false);const y=ds[0];ext+=sl(y,'strength');realm+=ri(y.realm);} console.log(`  [의뢰 OFF 기준]      윤소소 평균 외공 ${(ext/REPS).toFixed(0)} · 경지지수 ${(realm/REPS).toFixed(1)} (절정=4·초절정=5)`); }
for(const qk of [0,15,20,30]){ QK=qk; let ext=0,realm=0,seong=0; for(let r=0;r<REPS;r++){const{ds}=run(['yun','cheongha','jin'],'normal',true);const y=ds[0];ext+=sl(y,'strength');realm+=ri(y.realm);seong+=ms(y);}
  console.log(`  [의뢰 ON · QK=${String(qk).padStart(2)}] 윤소소 평균 외공 ${(ext/REPS).toFixed(0)} · 경지지수 ${(realm/REPS).toFixed(1)} · 성 ${(seong/REPS).toFixed(1)}`); }
QK=20;

// ═══ 테스트 3: 영약으로 1명 화경 (무과금 — 제련 제자 진소화 + 검수 윤소소) ═══
console.log('\n═══ 테스트 3: 무과금 화경 경로 — 진소화(영약제련) + 윤소소(검수 수련집중) ═══');
console.log(`  화경 = 초절정 + 신품무공서 7성 + 대오(보장 없음) + 신품영약 복용. 진소화가 제련, 윤소소가 복용. ${REPS}회 통계:`);
{
  let hwa=0, choj=0, elixSum=0, alSum=0, extSum=0, seongSum=0;
  for(let r=0;r<REPS;r++){ const{ds,sect}=run(['jin','yun','jang'],'easy',false); // 화경 후보는 수련 집중(의뢰 OFF)
    const y=ds.find(d=>d.id==='yun'); elixSum+=sect.elixirs; alSum+=sl(ds[0],'alchemy'); extSum+=sl(y,'strength'); seongSum+=ms(y);
    if(y.realm==='hwagyeong')hwa++; else if(y.realm==='chojeoljeong')choj++; }
  console.log(`  진소화 영약제조 평균 ${(alSum/REPS).toFixed(0)} (제련임계 ${CRAFT_ALCHEMY_MIN}) · 회차당 잔여영약 평균 ${(elixSum/REPS).toFixed(1)}개`);
  console.log(`  윤소소 평균 외공 ${(extSum/REPS).toFixed(0)} · 평균 주력성 ${(seongSum/REPS).toFixed(1)}`);
  console.log(`  → [수련 집중·폐관만] 윤소소 화경: ${hwa}/${REPS}회 (${Math.round(hwa/REPS*100)}%) · 초절정 ${choj}/${REPS}회 — 앉아선 대오가 안 온다(소극 플레이 천장)`);
}
{ // 의뢰 병행 — 실전 대오가 주 무대(normal 정책). 대오 도입(2026-06-12) 후 무과금 화경의 정도(正道).
  let hwa=0, choj=0;
  for(let r=0;r<REPS;r++){ const{ds}=run(['jin','yun','jang'],'normal',true);
    const y=ds.find(d=>d.id==='yun');
    if(y.realm==='hwagyeong')hwa++; else if(y.realm==='chojeoljeong')choj++; }
  console.log(`  → [의뢰 병행·실전 대오] 윤소소 화경: ${hwa}/${REPS}회 (${Math.round(hwa/REPS*100)}%) · 초절정 ${choj}/${REPS}회 — 강호에서 깨닫는다`);
  console.log('  ※ 공식 시뮬은 근사 — 정책 프리셋이 "가끔 의뢰+수련+내공단"의 최적 중간을 못 잡아 화경 절대치가 과소.');
  console.log('    화경 도달률 정본 = 실코드 스윕(moderatesweep·factorysweep, docs/36). 이 테스트는 영약 제련·게이트 레버 검증용.');
}
// 표본 1회 상세
{ const{ds,sect}=run(['jin','yun','jang'],'easy',true);
  console.log('  [표본 1회]');
  for(const d of ds)console.log(`    ${d.n} ${RL[d.realm]} ${ARTS[d.main].n}${ms(d)}성 외공${sl(d,'strength')} 영약제조${sl(d,'alchemy')} 전투력${cr(d)}`);
  console.log(`    영약 잔량 ${sect.elixirs}`); }

// ═══ 조합 상세 — 대표 4조합 15년 최종 상태 (보통 정책, 의뢰 ON, 출시값) ═══
console.log('\n═══ 조합 상세 (보통 정책·의뢰 ON, 30회 중 1회 표본) ═══');
const COMBO_DETAIL=[
  ['jang','jin','yun','baek'],['cheongha','han','jin'],['yun','cheongha','jang'],['jang','jin','han','cheongha'],
];
function jobsOf(d){const out=[],seong=ms(d),school=ARTS[d.main].school,sw=['sword','fist','palm','staff','lightness','darkArts'].includes(school);
  if(sl(d,'medicine')>=80)out.push('신의');if(sl(d,'scouting')>=85)out.push('그림자');if(sl(d,'guarding')>=80)out.push('상단호위장');
  if(school==='sword'&&seong>=9)out.push('검성');if(school==='sword'&&seong>=7)out.push('이름난검객');
  if(sl(d,'guarding')>=55)out.push('표국주');if(sl(d,'scouting')>=55)out.push('밀정두목');if(sl(d,'medicine')>=55)out.push('강호의원');
  if(sw&&seong>=4)out.push('정파무사');if(sl(d,'medicine')>=30)out.push('마을의원');if(sl(d,'scouting')>=35)out.push('정탐꾼');
  return out.length?out.slice(0,2):['동네한량'];}
for(const combo of COMBO_DETAIL){const{ds,sect}=run(combo,'normal',true);
  console.log(`\n  ▶ ${combo.map(i=>CHARS[i].n).join(' · ')}`);
  for(const d of ds){const dead=d.status==='dead'?' ✝':'';
    console.log(`    ${d.n.padEnd(4)} ${RL[d.realm].padEnd(4)} ${ARTS[d.main].n}${ms(d)}성 | 외공${String(sl(d,'strength')).padStart(2)} 정탐${String(sl(d,'scouting')).padStart(2)} 호위${String(sl(d,'guarding')).padStart(2)} 의술${String(sl(d,'medicine')).padStart(2)} 영약${String(sl(d,'alchemy')).padStart(2)} | 명성${String(d.fame).padStart(3)} 전투력${String(cr(d)).padStart(3)} 의뢰${d.quests}회 부상${d.injuries}${dead} | ${jobsOf(d).join(',')}`);}
  if(sect.elixirs)console.log(`    (영약 ${sect.elixirs}개 보유)`);
}
