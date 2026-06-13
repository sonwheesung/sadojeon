/* 헤드리스 15년 양육 시뮬 v2 — 밸런스 검증.
   목표: 무과금 최소 절정, 조합 최적화 시 초절정/화경.
   레버: ① 외공(근력·체력) 단련에 나이 보정(어릴 때 강함) ② 무공서 트리 등반(화산 검) ③ 적응형 일과. */

// ── 튜닝 레버(여기를 바꿔가며 검증) ─────────────────────────────────────────
// 외공(근골)은 무공 갈래보다 노력 의존 — 재능 페널티 압축(상극도 0 아님), 나이 보정으로 어릴 때 강함.
const BODY_EFF = { 특화:1.0, 상성:0.8, 보통:0.62, 미숙:0.35, 상극:0.18 }; // 출시값(Part A)
const BODY_AGE_MUL = (age) => age<=12?6.0 : age<=14?4.0 : age<=16?2.4 : age<=18?1.1 : 0.55; // 외공 나이 보정
const STRENGTH_EXP_BASE = 14; // 기마자세 expBase (기존 12)
const ENDURANCE_EXP_BASE = 18; // 암벽 (기존 16)

// ── 상수(게임 데이터 복제) ──────────────────────────────────────────────────
const EFF = { 특화:1.0, 상성:0.6, 보통:0.35, 미숙:0.1, 상극:0.04 };
const REALM_ORDER = ['none','samryu','iryu','ilryu','jeoljeong','chojeoljeong','hwagyeong'];
const REALM_LABEL = { none:'미입문',samryu:'삼류',iryu:'이류',ilryu:'일류',jeoljeong:'절정',chojeoljeong:'초절정',hwagyeong:'화경' };
// ⚠️ 정통 페이싱 재밸런스(2026-06-14)로 요구치 동기화. 단 이 공식 sim은 내공 일일적립(코드 10→2.5)·실전
//    의뢰 내공 적립(QUEST_INTERNAL_PER_WEEK)을 아직 반영 안 함 — 경지 도달 속도는 근사. 정본은 헤드리스(실코드).
const REALM_INTERNAL_REQ = { none:0,samryu:0,iryu:260,ilryu:520,jeoljeong:870,chojeoljeong:1050,hwagyeong:1300 };
const REALM_EXTERNAL_REQ = { none:0,samryu:10,iryu:20,ilryu:35,jeoljeong:48,chojeoljeong:58,hwagyeong:68 }; // [레버] 고경지 외공 하향(무과금 화경 가능케)
const REALM_SEONG_GATE   = { none:0,samryu:0,iryu:0,ilryu:0,jeoljeong:0,chojeoljeong:5,hwagyeong:7 };
const REALM_SEONG_CAP    = { none:0,samryu:3,iryu:4,ilryu:6,jeoljeong:7,chojeoljeong:8,hwagyeong:10 };
const REALM_LEARN_FLOOR  = { none:1,samryu:1,iryu:2,ilryu:3,jeoljeong:4,chojeoljeong:5,hwagyeong:6 };
const WALL_TARGETS = ['jeoljeong','chojeoljeong','hwagyeong'];
const ENL_BASE = { iryu:{b:0.3,p:0.06}, ilryu:{b:0.22,p:0.06}, jeoljeong:{b:0.15,p:0.07}, chojeoljeong:{b:0.1,p:0.05}, hwagyeong:{b:0.05,p:0.05} };
const PITY_STEP=0.05, PITY_GUARANTEE=12;
const PLATEAU = { FIRST_START:70, FIRST_MUL:0.5, SECOND_START:85, SECOND_MUL:0.2 };
const EXP_BASE_BY_STAGE = { introduction:10, small_completion:8, great_completion:6, ultimate:3 }; // [레버] 고단계 성 적립 완화(원본 7/4/2)

const ri = (r)=>REALM_ORDER.indexOf(r);
const nextRealm = (r)=> (ri(r)>=0 && ri(r)<REALM_ORDER.length-1) ? REALM_ORDER[ri(r)+1] : null;
const isWall = (t)=>WALL_TARGETS.includes(t);
const expToNextSeong = (s)=>140+(Math.max(1,s)-1)*80;
const seongToStage = (s)=>s>=10?'ultimate':s>=7?'great_completion':s>=4?'small_completion':'introduction';
const seongCap = (g)=>({novice:6,apprentice:7,master:9,grandmaster:10,legendary:10}[g]);
const gradeCeiling = (g)=>({novice:'ilryu',apprentice:'jeoljeong',master:'chojeoljeong',grandmaster:'hwagyeong',legendary:'hwagyeong'}[g]);
const gradeLearnRealm = (g)=>({novice:'samryu',apprentice:'samryu',master:'iryu',grandmaster:'ilryu',legendary:'jeoljeong'}[g]);
const enlChance = (ins,t)=>{const c=ENL_BASE[t]||{b:0.15,p:0.06};return Math.max(0.02,Math.min(0.95,c.b+Math.max(0,ins)*c.p));};
const expToNext = (lv)=>20+Math.max(0,lv)*4+Math.floor(Math.max(0,lv)/10)*40;
const statCap = (id)=>id==='endurance'?18:100;
const staminaMul = (st,max)=>{const r=st/(max||50);return r>=0.5?1.0:r>=0.3?0.7:r>=0.1?0.4:0.0;};

const ARTS = {
  'cheongpung-swordplay':{name:'청풍검법',school:'sword',grade:'apprentice',path:'jeong',prereq:[]},
  'baekun-fist':{name:'백운권법',school:'fist',grade:'apprentice',path:'jeong',prereq:[]},
  'unbo':{name:'운보',school:'lightness',grade:'novice',path:'jung',prereq:[]},
  'cheongsim-gigong':{name:'청심기공',school:'qigong',grade:'novice',path:'jeong',prereq:[]},
  'hwasan-gicho-sword':{name:'화산기초검',school:'sword',grade:'novice',path:'jeong',prereq:[]},
  'yukhap-sword':{name:'육합검',school:'sword',grade:'apprentice',path:'jeong',prereq:[['hwasan-gicho-sword',3]]},
  'maehwa-sword':{name:'매화검법',school:'sword',grade:'master',path:'jeong',prereq:[['yukhap-sword',5]]},
  'jaha-sword':{name:'자하검법',school:'sword',grade:'master',path:'jeong',prereq:[['yukhap-sword',5]]},
  'isipsa-maehwa-sword':{name:'이십사수매화검',school:'sword',grade:'grandmaster',path:'jeong',prereq:[['maehwa-sword',6],['jaha-sword',4]]},
};
const SWORD_TREE = ['hwasan-gicho-sword','yukhap-sword','maehwa-sword','jaha-sword','isipsa-maehwa-sword'];

// 시드 6명 + 양육 빌드(learn=확보할 무공 / seq=주력 단련 순서[무공,목표성]).
const SWORD_SEQ = [['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',6],['isipsa-maehwa-sword',10]]; // jaha 는 자동학습(절정 floor=4)
const SEEDS = [
  { id:'jang', name:'장철', insight:2, focus:'fighter', study:'knowledge',
    eff:{ fist:'상성',staff:'상성',medical:'상극',darkArts:'상극',strength:'특화',guarding:'특화',medicine:'미숙',scouting:'상극',alchemy:'상극' },
    learn:['baekun-fist'], seq:[['baekun-fist',10]] },          // 권법 중품 → 절정 천장(외공 특화)
  { id:'jin', name:'진소화', insight:3, focus:'scholar', study:'medicine',
    eff:{ medical:'특화',fist:'미숙',sword:'상극',staff:'상극',darkArts:'상극',medicine:'특화',alchemy:'특화',scouting:'미숙',strength:'상극',guarding:'상극' },
    learn:['cheongsim-gigong'], seq:[['cheongsim-gigong',10]] },
  { id:'han', name:'한바람', insight:3, focus:'fighter', study:'knowledge',
    eff:{ lightness:'특화',darkArts:'특화',sword:'상성',staff:'상성',medical:'상극',scouting:'특화',knowledge:'미숙',formation:'미숙',medicine:'미숙',alchemy:'상극' },
    learn:SWORD_TREE.slice(0,3), seq:[['hwasan-gicho-sword',3],['yukhap-sword',5],['maehwa-sword',9]] }, // 검 상성 → 초절정 천장
  { id:'yun', name:'윤소소', insight:4, focus:'fighter', study:'knowledge',
    eff:{ sword:'특화',lightness:'상성',qigong:'상성',darkArts:'상극',medical:'미숙',knowledge:'특화',formation:'특화',guarding:'상성',scouting:'미숙',medicine:'미숙' },
    learn:SWORD_TREE, seq:SWORD_SEQ },                          // 검 특화 → 화경 천장
  { id:'cheongha', name:'이청하', insight:4, focus:'fighter', study:'knowledge',
    eff:{ sword:'특화',lightness:'특화',darkArts:'특화',staff:'상성',qigong:'상성',medical:'상극',scouting:'특화',guarding:'미숙',knowledge:'미숙',formation:'미숙',medicine:'상극',alchemy:'상극' },
    learn:SWORD_TREE, seq:SWORD_SEQ },
  { id:'baek', name:'백연', insight:5, focus:'scholar', study:'knowledge',
    eff:{ qigong:'특화',medical:'상성',staff:'미숙',fist:'미숙',darkArts:'상극',knowledge:'특화',formation:'특화',scouting:'상극',guarding:'상극' },
    learn:['cheongsim-gigong'], seq:[['cheongsim-gigong',10]] },
  // 결제 캐릭터 — 검·외공 둘 다 특화(화경 빌드 검증용). docs/28 §7.
  { id:'jinbaekho', name:'진백호', insight:4, focus:'fighter', study:'knowledge',
    eff:{ sword:'특화',staff:'특화',fist:'특화',lightness:'특화',qigong:'특화',strength:'특화',scouting:'상성',guarding:'상성' },
    learn:SWORD_TREE, seq:SWORD_SEQ },
];
const STUDY_EXP = { knowledge:11, medicine:11, alchemy:10, formation:12, etiquette:10 };

function mk(seed){ const first=seed.seq[0][0]; return { ...seed, realm:'samryu', internal:0, pity:0, stepIdx:0,
  arts:{ [first]:{seong:1,exp:0} }, main:first,
  stats:{ endurance:{lv:5,exp:0} }, maxStam:50, stam:50, stress:0, fatigue:0, seclusion:false }; }
const effOf=(d,k)=>EFF[d.eff[k]??'보통'];
const mainSeong=(d)=>d.arts[d.main]?.seong??0;
const ceilingOf=(d)=>gradeCeiling(ARTS[d.main].grade);
const statLv=(d,s)=>d.stats[s]?.lv??0;

function addStatExp(d,stat,exp){ const t=d.stats[stat]??(d.stats[stat]={lv:0,exp:0}); const cap=statCap(stat); t.exp+=exp;
  while(t.lv<cap&&t.exp>=expToNext(t.lv)){t.exp-=expToNext(t.lv);t.lv++;} if(t.lv>=cap){t.lv=cap;t.exp=0;}
  if(stat==='endurance') d.maxStam=Math.max(10,t.lv*10); }

function tickArt(d,intensity,pm){ const inst=d.arts[d.main],art=ARTS[d.main];
  const cap=Math.min(seongCap(art.grade),REALM_SEONG_CAP[d.realm]);
  const base=EXP_BASE_BY_STAGE[seongToStage(inst.seong)], tMul=effOf(d,art.school);
  const frac=(inst.exp/expToNextSeong(inst.seong))*100;
  const pMul=frac>=PLATEAU.SECOND_START?PLATEAU.SECOND_MUL:frac>=PLATEAU.FIRST_START?PLATEAU.FIRST_MUL:1.0;
  inst.exp+=base*tMul*pMul*intensity*pm;
  while(inst.seong<cap&&inst.exp>=expToNextSeong(inst.seong)){inst.exp-=expToNextSeong(inst.seong);inst.seong++;}
  if(inst.seong>=cap) inst.exp=0; }

function realmTick(d,intent,pm,secl){ const eff=Math.max(0,pm);
  if(intent==='simbeop') d.internal+=10*eff;
  const ceiling=ceilingOf(d), external=statLv(d,'strength'), ms=mainSeong(d);
  for(;;){ const t=nextRealm(d.realm); if(!t)break;
    if(ri(t)>ri(ceiling))break; if(d.internal<REALM_INTERNAL_REQ[t])break;
    if(external<REALM_EXTERNAL_REQ[t])break; if(ms<REALM_SEONG_GATE[t])break;
    if(isWall(t))break; d.realm=t; d.pity=0; }
  const wt=nextRealm(d.realm);
  const atWall=wt&&ri(wt)<=ri(ceiling)&&d.internal>=REALM_INTERNAL_REQ[wt]&&external>=REALM_EXTERNAL_REQ[wt]&&ms>=REALM_SEONG_GATE[wt]&&isWall(wt);
  if(atWall){ if(secl){ const ch=enlChance(d.insight,wt)+d.pity*PITY_STEP;
      if(d.pity+1>=PITY_GUARANTEE||Math.random()<ch){d.realm=wt;d.pity=0;d.seclusion=false;} else d.pity++;
    } else d.seclusion=true; } }

// 빌드 등반 — learn 무공을 선행/경지 충족 시 학습(자하 자동 포함), 주력은 seq 단계 순서로.
function planStep(d){
  for(const id of d.learn){ if(d.arts[id])continue; const art=ARTS[id];
    if(ri(d.realm)<ri(gradeLearnRealm(art.grade)))continue;
    if(!art.prereq.every(([pid,ps])=>(d.arts[pid]?.seong??0)>=ps))continue;
    const floor=REALM_LEARN_FLOOR[d.realm];
    d.arts[id]={seong:Math.max(1,Math.min(floor,seongCap(art.grade),REALM_SEONG_CAP[d.realm])),exp:0}; }
  // 현재 단계 무공이 목표 성 도달 + 다음 단계 무공 학습됨 → 다음 단계로.
  const [curArt,until]=d.seq[d.stepIdx];
  if(d.stepIdx<d.seq.length-1){ const nextArt=d.seq[d.stepIdx+1][0];
    if((d.arts[curArt]?.seong??0)>=until && d.arts[nextArt]) d.stepIdx++; }
  const tgt=d.seq[d.stepIdx][0];
  d.main = d.arts[tgt] ? tgt : (d.arts[curArt] ? curArt : d.main); }

// 적응형 일과 — 어릴 땐 외공(근골) 위주, 자라선 무공·내공·깨달음.
function intentFor(d,age,dow){ if(d.seclusion) return 'seclusion';
  if(d.stam/d.maxStam<0.25) return 'rest';
  if(d.focus==='scholar') return ['study','simbeop','study','chosik','study','endurance','study'][dow%7];
  // 균형 — 어릴 땐 외공 비중↑(근골), 자라선 무공 성↑. 외공·성 둘 다 챙김.
  const young = age<=16 && statLv(d,'strength') < 70;
  return young
    ? ['strength','chosik','strength','endurance','strength','chosik','simbeop'][dow%7]
    : ['chosik','chosik','strength','chosik','simbeop','chosik','endurance'][dow%7]; }

function day(d,age,dow){ const intent=intentFor(d,age,dow);
  const sf=1-Math.min(0.4,(d.stress/100)*0.4);
  const pm=staminaMul(d.stam,d.maxStam)*(1-d.fatigue)*sf;
  let sd=0,td=0,ling=0,inten=0,gstat=null,ebase=0,body=false;
  if(intent==='rest'){sd=50;td=-15;}
  else if(intent==='seclusion'){sd=-15;td=5;inten=1.5;}
  else if(intent==='simbeop'){sd=-10;td=5;}
  else if(intent==='chosik'){sd=-10;td=5;inten=1.0;}
  else if(intent==='strength'){sd=-14;td=7;gstat='strength';ebase=STRENGTH_EXP_BASE;ling=0.1;body=true;}
  else if(intent==='endurance'){sd=-22;td=10;gstat='endurance';ebase=ENDURANCE_EXP_BASE;ling=0.3;body=true;}
  else if(intent==='study'){sd=-6;td=9;gstat=d.study;ebase=STUDY_EXP[d.study];}
  d.stam=Math.max(0,Math.min(d.maxStam,d.stam+sd)); d.stress=Math.max(0,Math.min(100,d.stress+td));
  if(d.stam<=0){d.stam=d.maxStam;d.fatigue=0;return;}
  if(gstat&&ebase>0&&pm>0){
    const tier = d.eff[gstat]??'보통';
    const apt = body ? BODY_EFF[tier] : EFF[tier];        // ★ 외공은 압축 효율
    const ageMul = body ? BODY_AGE_MUL(age) : 1.0;        // ★ 외공 나이 보정
    addStatExp(d,gstat,Math.max(1,Math.round(ebase*apt*ageMul*pm))); }
  if((intent==='chosik'||intent==='seclusion')&&pm>0) tickArt(d,inten,pm);
  realmTick(d,intent,pm,intent==='seclusion'); d.fatigue=ling; }

// 전투력
const REALM_WEIGHT={none:0.4,samryu:1.0,iryu:1.5,ilryu:2.2,jeoljeong:3.2,chojeoljeong:4.5,hwagyeong:6.5};
const GRADE_COEF={novice:1.0,apprentice:1.4,master:2.0,grandmaster:2.8,legendary:3.6};
function combatPower(d){ const c=Object.keys(d.arts).map(id=>GRADE_COEF[ARTS[id].grade]*Math.max(0,d.arts[id].seong-1)).filter(x=>x>0).sort((a,b)=>b-a);
  const RW=[1.0,0.6,0.4,0.3,0.2,0.15,0.1,0.07]; let s=0; c.forEach((x,i)=>s+=x*(RW[i]??0.05)); return Math.round(REALM_WEIGHT[d.realm]*s*10); }

// 실행
const ds=SEEDS.map(mk); const YEARS=15, DPY=336; const snapAt=new Set([4,8,12,15]); const snaps={};
let dow=0;
for(let year=1;year<=YEARS;year++){ const age=10+(year-1);
  for(let dn=1;dn<=DPY;dn++){ if(((dn-1)%28)===0){ds.forEach(planStep);continue;} ds.forEach(d=>day(d,age,dow)); dow++; }
  if(snapAt.has(year)) snaps[year]=ds.map(d=>({name:d.name,age,realm:REALM_LABEL[d.realm],main:ARTS[d.main].name,seong:mainSeong(d),str:statLv(d,'strength'),internal:Math.round(d.internal),cp:combatPower(d)}));
}
for(const y of [4,8,12,15]){ console.log(`\n━━━ ${y}년차 (나이 ${10+y-1}세) ━━━`);
  snaps[y].forEach(s=>console.log(`  ${s.name.padEnd(4)} | ${s.realm.padEnd(4)} | 주력 ${s.main}(${s.seong}성) | 외공 ${String(s.str).padStart(3)} | 내공 ${String(s.internal).padStart(4)} | 전투력 ${String(s.cp).padStart(4)}`)); }
console.log('\n최종 경지:', ds.map(d=>`${d.name} ${REALM_LABEL[d.realm]}`).join(' / '));
