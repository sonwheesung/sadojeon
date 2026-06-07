/* 훈련 + 의뢰 통합 15년 시뮬 — 제자 조합별. 게임 공식 복제(training·realm·quest).
   의뢰: 정탐·호위·의술 스탯(수련 불가) + 명성 + 무공 성 가속, 부상·사망 위험. 권고 밸런스(성완화 ON). */

const EFF = { 특화:1.0, 상성:0.6, 보통:0.35, 미숙:0.1, 상극:0.04 };
const BODY_EFF = { 특화:1.0, 상성:0.8, 보통:0.62, 미숙:0.35, 상극:0.18 };
const BODY_AGE_MUL = (a)=>a<=12?6:a<=14?4:a<=16?2.4:a<=18?1.1:0.55;
const REALM_ORDER=['none','samryu','iryu','ilryu','jeoljeong','chojeoljeong','hwagyeong'];
const RL={none:'미입문',samryu:'삼류',iryu:'이류',ilryu:'일류',jeoljeong:'절정',chojeoljeong:'초절정',hwagyeong:'화경'};
const RINT={none:0,samryu:0,iryu:100,ilryu:250,jeoljeong:500,chojeoljeong:850,hwagyeong:1300};
const REXT={none:0,samryu:10,iryu:20,ilryu:35,jeoljeong:50,chojeoljeong:65,hwagyeong:78};
const RSG={none:0,samryu:0,iryu:0,ilryu:0,jeoljeong:0,chojeoljeong:5,hwagyeong:7};
const RSC={none:0,samryu:3,iryu:4,ilryu:6,jeoljeong:7,chojeoljeong:8,hwagyeong:10};
const RLF={none:1,samryu:1,iryu:2,ilryu:3,jeoljeong:4,chojeoljeong:5,hwagyeong:6};
const WALL=['jeoljeong','chojeoljeong','hwagyeong'];
const ENL={iryu:{b:.3,p:.06},ilryu:{b:.22,p:.06},jeoljeong:{b:.15,p:.07},chojeoljeong:{b:.1,p:.05},hwagyeong:{b:.05,p:.05}};
const EXP_STAGE={introduction:10,small_completion:8,great_completion:6,ultimate:3}; // 성완화 ON
const ri=r=>REALM_ORDER.indexOf(r), nextR=r=>ri(r)<6?REALM_ORDER[ri(r)+1]:null, isWall=t=>WALL.includes(t);
const etns=s=>140+(Math.max(1,s)-1)*80, stage=s=>s>=10?'ultimate':s>=7?'great_completion':s>=4?'small_completion':'introduction';
const scap=g=>({novice:6,apprentice:7,master:9,grandmaster:10,legendary:10}[g]);
const gceil=g=>({novice:'ilryu',apprentice:'jeoljeong',master:'chojeoljeong',grandmaster:'hwagyeong',legendary:'hwagyeong'}[g]);
const glr=g=>({novice:'samryu',apprentice:'samryu',master:'iryu',grandmaster:'ilryu',legendary:'jeoljeong'}[g]);
const enl=(i,t)=>{const c=ENL[t]||{b:.15,p:.06};return Math.max(.02,Math.min(.95,c.b+Math.max(0,i)*c.p));};
const etn=l=>20+Math.max(0,l)*4+Math.floor(Math.max(0,l)/10)*40, scapStat=id=>id==='endurance'?18:100;
const smul=(s,m)=>{const r=s/(m||50);return r>=.5?1:r>=.3?.7:r>=.1?.4:0;};
const rnd=(lo,hi)=>lo+Math.floor(Math.random()*(hi-lo+1));

const ARTS={
  'cheongpung-swordplay':{n:'청풍검법',school:'sword',grade:'apprentice',pr:[]},
  'baekun-fist':{n:'백운권법',school:'fist',grade:'apprentice',pr:[]},
  'unbo':{n:'운보',school:'lightness',grade:'novice',pr:[]},
  'cheongsim-gigong':{n:'청심기공',school:'qigong',grade:'novice',pr:[]},
  'hwasan-gicho-sword':{n:'화산기초검',school:'sword',grade:'novice',pr:[]},
  'yukhap-sword':{n:'육합검',school:'sword',grade:'apprentice',pr:[['hwasan-gicho-sword',3]]},
  'maehwa-sword':{n:'매화검법',school:'sword',grade:'master',pr:[['yukhap-sword',5]]},
  'jaha-sword':{n:'자하검법',school:'sword',grade:'master',pr:[['yukhap-sword',5]]},
  'isipsa-maehwa-sword':{n:'이십사수매화검',school:'sword',grade:'grandmaster',pr:[['maehwa-sword',6],['jaha-sword',4]]},
};
const SWORD_LEARN=['hwasan-gicho-sword','yukhap-sword','maehwa-sword','jaha-sword','isipsa-maehwa-sword'];
const SWORD_SEQ=[['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',6],['isipsa-maehwa-sword',10]];

// 캐릭터 정의 — eff·insight·시작무공·빌드·의뢰 주 도메인.
const CHARS={
  jang:{n:'장철',ins:2,study:'knowledge',dom:'guard',
    eff:{fist:'상성',staff:'상성',medical:'상극',darkArts:'상극',strength:'특화',guarding:'특화',medicine:'미숙',scouting:'상극',alchemy:'상극'},
    learn:['baekun-fist'],seq:[['baekun-fist',10]]},
  jin:{n:'진소화',ins:3,study:'medicine',dom:'medicine',
    eff:{medical:'특화',fist:'미숙',sword:'상극',staff:'상극',darkArts:'상극',medicine:'특화',alchemy:'특화',scouting:'미숙',strength:'상극',guarding:'상극'},
    learn:['cheongsim-gigong'],seq:[['cheongsim-gigong',10]]},
  han:{n:'한바람',ins:3,study:'knowledge',dom:'scout',
    eff:{lightness:'특화',darkArts:'특화',sword:'상성',staff:'상성',medical:'상극',scouting:'특화',knowledge:'미숙',formation:'미숙',medicine:'미숙',alchemy:'상극'},
    learn:SWORD_LEARN.slice(0,3),seq:[['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',9]]},
  yun:{n:'윤소소',ins:4,study:'knowledge',dom:'duel',
    eff:{sword:'특화',lightness:'상성',qigong:'상성',darkArts:'상극',medical:'미숙',knowledge:'특화',formation:'특화',guarding:'상성',scouting:'미숙',medicine:'미숙'},
    learn:SWORD_LEARN,seq:SWORD_SEQ},
  cheongha:{n:'이청하',ins:4,study:'knowledge',dom:'assassin',
    eff:{sword:'특화',lightness:'특화',darkArts:'특화',staff:'상성',qigong:'상성',medical:'상극',scouting:'특화',guarding:'미숙',knowledge:'미숙',formation:'미숙',medicine:'상극',alchemy:'상극'},
    learn:SWORD_LEARN,seq:SWORD_SEQ},
  baek:{n:'백연',ins:5,study:'knowledge',dom:'medicine',
    eff:{qigong:'특화',medical:'상성',staff:'미숙',fist:'미숙',darkArts:'상극',knowledge:'특화',formation:'특화',scouting:'상극',guarding:'상극'},
    learn:['cheongsim-gigong'],seq:[['cheongsim-gigong',10]]},
  dokgo:{n:'독고연',ins:5,study:'knowledge',dom:'duel',
    eff:{sword:'특화',qigong:'상성',knowledge:'상성',strength:'보통'},
    learn:SWORD_LEARN,seq:SWORD_SEQ},
  gang:{n:'강무열',ins:2,study:'knowledge',dom:'duel',
    eff:{staff:'특화',fist:'상성',guarding:'상성',strength:'상성'},
    learn:['baekun-fist'],seq:[['baekun-fist',10]]},
  jinbaekho:{n:'진백호',ins:4,study:'knowledge',dom:'duel',
    eff:{sword:'특화',staff:'특화',fist:'특화',lightness:'특화',qigong:'특화',strength:'특화',scouting:'상성',guarding:'상성'},
    learn:SWORD_LEARN,seq:SWORD_SEQ},
};

// 의뢰 풀 (data/quests.ts 발췌) — domain·grade·minStat·fame·recommended.
const GRADE_RISK={menial:{inj:false,dth:false},minor:{inj:true,dth:false},normal:{inj:true,dth:false},dangerous:{inj:true,dth:false},extreme:{inj:true,dth:true}};
const DOMAIN_STAT={guard:'guarding',scout:'scouting',medicine:'medicine',assassin:'scouting',duel:null,grand:null};
const QUESTS=[
  {id:'q-market',dom:'guard',gr:'menial',min:0,fame:1,rec:1},
  {id:'q-herb',dom:'medicine',gr:'menial',min:0,fame:1,rec:1},
  {id:'q-patrol',dom:'guard',gr:'minor',min:5,fame:2,rec:1},
  {id:'q-scout-village',dom:'scout',gr:'minor',min:5,fame:2,rec:1},
  {id:'q-escort-merchant',dom:'guard',gr:'normal',min:20,fame:4,rec:1},
  {id:'q-find-missing',dom:'scout',gr:'normal',min:20,fame:4,rec:1},
  {id:'q-clinic',dom:'medicine',gr:'normal',min:25,fame:5,rec:1},
  {id:'q-duel-challenge',dom:'duel',gr:'normal',min:25,fame:6,rec:1},
  {id:'q-bandit',dom:'duel',gr:'dangerous',min:40,fame:8,rec:2},
  {id:'q-heuksa-scout',dom:'scout',gr:'dangerous',min:40,fame:9,rec:2},
  {id:'q-protect-caravan',dom:'guard',gr:'dangerous',min:40,fame:8,rec:2},
  {id:'q-antidote',dom:'medicine',gr:'dangerous',min:40,fame:7,rec:1},
  {id:'q-duel-master',dom:'duel',gr:'dangerous',min:45,fame:9,rec:1},
  {id:'q-assassin-contract',dom:'assassin',gr:'dangerous',min:45,fame:7,rec:2},
  {id:'q-grand-crisis',dom:'grand',gr:'dangerous',min:45,fame:10,rec:2},
  {id:'q-grand-meng',dom:'grand',gr:'extreme',min:65,fame:15,rec:3},
  {id:'q-hyeolsu',dom:'duel',gr:'extreme',min:65,fame:16,rec:3},
  {id:'q-grand-sapa',dom:'grand',gr:'extreme',min:65,fame:16,rec:3},
  {id:'q-assassin-big',dom:'assassin',gr:'extreme',min:65,fame:14,rec:2},
];
const OUT_SCALE={full:{m:1,f:1,g:1},partial:{m:.6,f:.5,g:.6},crisis:{m:1,f:1,g:1},fail:{m:.1,f:0,g:.2},disaster:{m:0,f:0,g:0}};

function mk(id){ const c=CHARS[id]; const first=c.seq[0][0];
  return {id,n:c.n,ins:c.ins,study:c.study,dom:c.dom,eff:c.eff,learn:c.learn,seq:c.seq,
    realm:'samryu',internal:0,pity:0,stepIdx:0,arts:{[first]:{seong:1,exp:0}},main:first,
    stats:{endurance:{lv:5,exp:0}},maxStam:50,stam:50,stress:0,fatigue:0,seclusion:false,
    fame:0,status:'idle',until:0,quests:0,injuries:0}; }
const eo=(d,k)=>EFF[d.eff[k]??'보통'], ms=d=>d.arts[d.main]?.seong??0, ceil=d=>gceil(ARTS[d.main].grade), sl=(d,s)=>d.stats[s]?.lv??0;
function addStat(d,st,e){const t=d.stats[st]??(d.stats[st]={lv:0,exp:0});const c=scapStat(st);t.exp+=e;
  while(t.lv<c&&t.exp>=etn(t.lv)){t.exp-=etn(t.lv);t.lv++;}if(t.lv>=c){t.lv=c;t.exp=0;}if(st==='endurance')d.maxStam=Math.max(10,t.lv*10);}
function gainSeong(d,e){const inst=d.arts[d.main],art=ARTS[d.main];const cap=Math.min(scap(art.grade),RSC[d.realm]);
  inst.exp+=e*eo(d,art.school); while(inst.seong<cap&&inst.exp>=etns(inst.seong)){inst.exp-=etns(inst.seong);inst.seong++;}if(inst.seong>=cap)inst.exp=0;}
function tickArt(d,inten,pm){const inst=d.arts[d.main],art=ARTS[d.main];const cap=Math.min(scap(art.grade),RSC[d.realm]);
  const b=EXP_STAGE[stage(inst.seong)],t=eo(d,art.school),f=(inst.exp/etns(inst.seong))*100;
  const p=f>=85?.2:f>=70?.5:1; inst.exp+=b*t*p*inten*pm;
  while(inst.seong<cap&&inst.exp>=etns(inst.seong)){inst.exp-=etns(inst.seong);inst.seong++;}if(inst.seong>=cap)inst.exp=0;}
function realmTick(d,intent,pm,secl){const eff=Math.max(0,pm); if(intent==='simbeop')d.internal+=10*eff;
  const c=ceil(d),ext=sl(d,'strength'),m=ms(d);
  for(;;){const t=nextR(d.realm);if(!t)break;if(ri(t)>ri(c))break;if(d.internal<RINT[t])break;if(ext<REXT[t])break;if(m<RSG[t])break;if(isWall(t))break;d.realm=t;d.pity=0;}
  const wt=nextR(d.realm),aw=wt&&ri(wt)<=ri(c)&&d.internal>=RINT[wt]&&ext>=REXT[wt]&&m>=RSG[wt]&&isWall(wt);
  if(aw&&secl){ if(wt==='hwagyeong'){/* 화경=영약(시뮬은 보유 가정) */ d.realm=wt;d.pity=0;d.seclusion=false; }
    else { const ch=enl(d.ins,wt)+d.pity*.05; if(d.pity+1>=12||Math.random()<ch){d.realm=wt;d.pity=0;d.seclusion=false;}else d.pity++; } }
  else if(aw) d.seclusion=true; }
function planStep(d){ for(const id of d.learn){if(d.arts[id])continue;const a=ARTS[id];
    if(ri(d.realm)<ri(glr(a.grade)))continue; if(!a.pr.every(([p,s])=>(d.arts[p]?.seong??0)>=s))continue;
    d.arts[id]={seong:Math.max(1,Math.min(RLF[d.realm],scap(a.grade),RSC[d.realm])),exp:0};}
  const[cur,until]=d.seq[d.stepIdx];
  if(d.stepIdx<d.seq.length-1){const nx=d.seq[d.stepIdx+1][0];if((d.arts[cur]?.seong??0)>=until&&d.arts[nx])d.stepIdx++;}
  const tg=d.seq[d.stepIdx][0]; d.main=d.arts[tg]?tg:(d.arts[cur]?cur:d.main); }

function intent(d,age,dow){ if(d.seclusion)return'seclusion'; if(d.stam/d.maxStam<.25)return'rest';
  if(d.dom==='medicine'||d.dom==='scout') // 비전투 위주 — 외공 약간만, study·심법
    return['study','simbeop','study','chosik','study','endurance','study'][dow%7];
  const young=age<=16&&sl(d,'strength')<78;
  return young?['strength','chosik','strength','endurance','strength','chosik','simbeop'][dow%7]
    :['chosik','chosik','simbeop','chosik','strength','chosik','endurance'][dow%7]; }
function day(d,age,dow){const it=intent(d,age,dow);const sf=1-Math.min(.4,(d.stress/100)*.4);
  const pm=smul(d.stam,d.maxStam)*(1-d.fatigue)*sf; let sd=0,td=0,lg=0,inten=0,gs=null,eb=0,body=false;
  if(it==='rest'){sd=50;td=-15;}else if(it==='seclusion'){sd=-15;td=5;inten=1.5;}
  else if(it==='simbeop'){sd=-10;td=5;}else if(it==='chosik'){sd=-10;td=5;inten=1;}
  else if(it==='strength'){sd=-14;td=7;gs='strength';eb=14;lg=.1;body=true;}
  else if(it==='endurance'){sd=-22;td=10;gs='endurance';eb=18;lg=.3;body=true;}
  else if(it==='study'){sd=-6;td=9;gs=d.study;eb=11;}
  d.stam=Math.max(0,Math.min(d.maxStam,d.stam+sd));d.stress=Math.max(0,Math.min(100,d.stress+td));
  if(d.stam<=0){d.stam=d.maxStam;d.fatigue=0;return;}
  if(gs&&eb>0&&pm>0){const tier=d.eff[gs]??'보통';const apt=body?BODY_EFF[tier]:EFF[tier];const am=body?BODY_AGE_MUL(age):1;addStat(d,gs,Math.max(1,Math.round(eb*apt*am*pm)));}
  if((it==='chosik'||it==='seclusion')&&pm>0)tickArt(d,inten,pm); realmTick(d,it,pm,it==='seclusion');d.fatigue=lg; }

const RW={none:.4,samryu:1,iryu:1.5,ilryu:2.2,jeoljeong:3.2,chojeoljeong:4.5,hwagyeong:6.5};
const GC={novice:1,apprentice:1.4,master:2,grandmaster:2.8,legendary:3.6};
function combatPower(d){const c=Object.keys(d.arts).map(id=>GC[ARTS[id].grade]*Math.max(0,d.arts[id].seong-1)).filter(x=>x>0).sort((a,b)=>b-a);
  const W=[1,.6,.4,.3,.2,.15,.1,.07];let s=0;c.forEach((x,i)=>s+=x*(W[i]??.05));return Math.round(RW[d.realm]*s*10);}
function combatRating(d){const mi=d.arts[d.main];const base=(mi?.seong??0)*10;
  const o=Object.keys(d.arts).filter(id=>id!==d.main).map(id=>Math.max(0,d.arts[id].seong-1)).sort((a,b)=>b-a);
  const w=[.5,.3,.2,.1];let br=0;o.forEach((x,i)=>br+=x*(w[i]??.05));br=Math.min(15,br);return Math.round(base+Math.min(8,Math.max(0,ri(d.realm)-2)*2)+br);}
function capability(d,dom){const st=DOMAIN_STAT[dom];return st?sl(d,st):combatRating(d);}

// ── 의뢰 파견·결산 ──────────────────────────────────────────────────────────
function pickQuest(d){ const cap0=capability(d,d.dom);
  // 위험·극험(부상·사망)은 자격 충분(cap≥min)할 때만, 그 외는 cap≥min*0.7. 사려깊은 사부.
  const cands=QUESTS.filter(q=>q.dom===d.dom);
  let best=null; for(const q of cands){ const need=(q.gr==='dangerous'||q.gr==='extreme')?q.min:q.min*0.7;
    if(cap0>=need){ if(!best||q.min>best.min)best=q; } }
  return best||cands.slice().sort((a,b)=>a.min-b.min)[0]; }
function rollOutcome(party,q){ const caps=party.map(d=>capability(d,q.dom));const avg=caps.reduce((a,b)=>a+b,0)/caps.length;
  let s=(avg-q.min)/Math.max(20,q.min)+(party.length/Math.max(1,q.rec)-1)*0.4;
  s+=Math.max(0,caps.filter(c=>c>=q.min).length-1)*0.12; s=Math.max(-1,Math.min(1.5,s));
  const r=Math.random(),risk=GRADE_RISK[q.gr];
  if(s>=.6)return r<.85?'full':'partial'; if(s>=.2)return r<.5?'full':r<.85?'partial':risk.inj?'crisis':'partial';
  if(s>=-.2)return r<.35?'partial':r<.7?(risk.inj?'crisis':'partial'):'fail'; if(r<.3)return'fail'; if(r<.7)return risk.inj?'crisis':'fail'; return risk.dth?'disaster':risk.inj?'crisis':'fail'; }
function resolveQuest(party,q,day,log){ let outcome=rollOutcome(party,q);
  const hasMedic=party.some(d=>sl(d,'medicine')>=30);
  if(hasMedic){if(outcome==='disaster')outcome='crisis';else if(outcome==='crisis')outcome='partial';}
  const sc=OUT_SCALE[outcome],st=DOMAIN_STAT[q.dom],martial=(q.dom==='duel'||q.dom==='grand');
  const victim=party.length?Math.floor(Math.random()*party.length):-1;
  party.forEach((d,i)=>{ d.quests++;
    if(sc.g>0){ if(st)addStat(d,st,Math.max(1,Math.round(35*sc.g))); else if(martial)gainSeong(d,Math.max(1,Math.round(60*sc.g))); }
    d.fame=Math.min(100,d.fame+Math.round(q.fame*sc.f));
    if(outcome==='disaster'&&i===victim){d.status='dead';log.push(`✝ ${d.n} 사망(${q.id})`);}
    else if(outcome==='disaster'){d.status='injured';d.until=day+21;d.injuries++;}
    else if(outcome==='crisis'&&i===victim){d.status='injured';d.until=day+14;d.injuries++;}
    else d.status='idle'; });
}

// ── 회차 실행 ───────────────────────────────────────────────────────────────
function runRun(ids){ const ds=ids.map(mk); const byId=Object.fromEntries(ds.map(d=>[d.id,d]));
  let dow=0; const log=[]; const active=[]; // {party, q, due}
  for(let year=1;year<=15;year++){ const age=10+(year-1);
    for(let dn=1;dn<=336;dn++){ const totalDay=(year-1)*336+dn;
      // 의뢰 결산
      for(let k=active.length-1;k>=0;k--){ if(totalDay>=active[k].due){ const a=active[k]; resolveQuest(a.party.filter(d=>d.status==='questing'||true),a.q,totalDay,log); active.splice(k,1); } }
      // 부상 회복
      for(const d of ds){ if(d.status==='injured'&&totalDay>=d.until)d.status='idle'; }
      if(((dn-1)%28)===0){ ds.forEach(d=>{if(d.status!=='dead')planStep(d);});
        // 월초 의뢰 파견 — idle 제자를 도메인 의뢰로(70%).
        for(const d of ds){ if(d.status!=='idle')continue; if(Math.random()>=.35)continue;
          const q=pickQuest(d); if(!q)continue;
          // 위험·극험 결투/큰의뢰는 동행(idle 전투형) 모아 파견.
          let party=[d];
          if((q.gr==='dangerous'||q.gr==='extreme')&&q.rec>1){
            const mates=ds.filter(x=>x!==d&&x.status==='idle'&&(x.dom==='duel'||x.dom==='guard'||x.dom==='medicine')).slice(0,q.rec-1);
            party=party.concat(mates); }
          party.forEach(p=>p.status='questing'); const wk={menial:1,minor:1,normal:2,dangerous:3,extreme:4}[q.gr];
          active.push({party,q,due:totalDay+wk*7}); }
        continue; }
      ds.forEach(d=>{ if(d.status==='idle')day(d,age,dow); }); dow++;
    } }
  return {ds,log}; }

function jobsOf(d){ const out=[]; const seong=ms(d),school=ARTS[d.main].school;
  const sw=['sword','fist','palm','staff','lightness','darkArts'].includes(school);
  if(sl(d,'medicine')>=80&&sl(d,'knowledge')>=70)out.push('신의');
  if(sl(d,'scouting')>=85)out.push('강호의 그림자');
  if(sl(d,'guarding')>=80)out.push('상단 호위장');
  if(school==='sword'&&seong>=9)out.push('검성');
  if(school==='sword'&&seong>=7)out.push('이름난 검객');
  if(sl(d,'guarding')>=55)out.push('표국주');
  if(sl(d,'scouting')>=55)out.push('밀정 두목');
  if(sl(d,'medicine')>=55)out.push('강호 의원');
  if(sw&&seong>=4)out.push('정파 무사');
  if(sl(d,'medicine')>=30)out.push('마을 의원');
  if(sl(d,'scouting')>=35)out.push('정탐꾼');
  return out.length?out.slice(0,3):['동네 한량']; }

const COMBOS=[
  ['jang','jin','yun','baek'],          // 균형 정파(호위·의술·검·도가)
  ['cheongha','han','dokgo'],            // 어둠·정탐·검(살수 결)
  ['yun','cheongha','jinbaekho'],        // 정예 검수(결제 포함)
  ['jang','gang','jin'],                 // 외공·도법·의술
];
for(const combo of COMBOS){ const {ds,log}=runRun(combo);
  console.log(`\n━━━ 조합: ${combo.map(i=>CHARS[i].n).join(' · ')} ━━━`);
  for(const d of ds){ const dead=d.status==='dead'?' ✝사망':'';
    console.log(`  ${d.n.padEnd(4)} | ${RL[d.realm].padEnd(4)} | 주력 ${ARTS[d.main].n}(${ms(d)}성) | 외공 ${String(sl(d,'strength')).padStart(2)} | 정탐 ${String(sl(d,'scouting')).padStart(2)} 호위 ${String(sl(d,'guarding')).padStart(2)} 의술 ${String(sl(d,'medicine')).padStart(2)} | 명성 ${String(d.fame).padStart(3)} | 의뢰 ${d.quests}회 부상 ${d.injuries}${dead}`);
    console.log(`        전투력 ${combatPower(d)} · 직업: ${jobsOf(d).join(', ')}`); }
  const deaths=log.filter(l=>l.startsWith('✝')); if(deaths.length)console.log('  ['+deaths.join(' / ')+']');
}
