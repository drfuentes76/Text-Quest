const qs=s=>document.querySelector(s);
const output=qs('#output');const actions=qs('#actions');const npcBar=qs('#npc-buttons');const spellBar=qs('#spell-buttons');
const createScr=qs('#create-screen');const gameScr=qs('#game-screen');const heroInput=qs('#hero-name');const startBtn=qs('#start-btn');
const classBtns=[...document.querySelectorAll('#class-buttons button')];
let chosenClass='',player;

const ZONES={Gate:{d:'You are at the Qeynos Gate.',n:['Guard'],x:{e:'Hills'}},Hills:{d:'Green hills stretch before you.',n:['Wolf'],x:{w:'Gate'}}};
const NPCS={Guard:{n:'City Guard',hp:15,atk:3},Wolf:{n:'Rabid Wolf',hp:12,atk:2}};
function log(t){output.textContent+=t+'\n';output.scrollTop=output.scrollHeight;}
function showZone(){const z=ZONES[player.zone];log(`-- ${player.zone} --\n${z.d}`);npcBar.innerHTML='';z.n.forEach(k=>{const b=document.createElement('button');b.textContent='Attack '+NPCS[k].n;b.onclick=()=>attack(k);npcBar.appendChild(b);});}
function attack(k){const m=NPCS[k];m.hp-=player.atk;log('You hit '+m.n);if(m.hp<=0){log(m.n+' defeated!');ZONES[player.zone].n=ZONES[player.zone].n.filter(x=>x!==k);npcBar.innerHTML='';}else{player.hp-=m.atk;log(m.n+' hits you.');}}
actions.onclick=e=>{if(e.target.tagName!=='BUTTON')return;const c=e.target.dataset.cmd;if(c==='look')showZone();if(c.startsWith('go')){const dir=c.split(' ')[1];const dest=ZONES[player.zone].x[dir[0]];if(dest){player.zone=dest;showZone();}else log("Can't go that way.");}};
classBtns.forEach(b=>b.onclick=()=>{classBtns.forEach(x=>x.classList.remove('active'));b.classList.add('active');chosenClass=b.dataset.class;startBtn.disabled=!heroInput.value.trim();});
heroInput.oninput=()=>startBtn.disabled=!heroInput.value.trim()||!chosenClass;
startBtn.onclick=()=>{player={name:heroInput.value,cls:chosenClass,zone:'Gate',hp:30,atk:5};createScr.hidden=true;gameScr.hidden=false;log(`Welcome ${player.name} the ${chosenClass}. Press Look.`);};
