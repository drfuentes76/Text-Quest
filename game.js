
/* === Static Data === */
const DATA = {
  zones: {
    'Qeynos Gates': { d:'You stand before the grand gates of Qeynos.', x:{e:'Qeynos Hills'}, n:['Guard'] },
    'Qeynos Hills': { d:'Rolling green hills dotted with willow trees.', x:{w:'Qeynos Gates',e:'Blackburrow'}, n:['Wolf'] },
    'Blackburrow': { d:'A dank cave populated by gnolls.', x:{w:'Qeynos Hills'}, n:['Gnoll'] }
  },
  npcs: {
    Guard:{ n:'Guard Tomas',hp:30,atk:4,l:['ShortSword'] },
    Wolf:{ n:'Rabid Wolf',hp:20,atk:5,l:['WolfPelt'] },
    Gnoll:{ n:'Gnoll Scout',hp:35,atk:6,l:['GnollFang'] }
  },
  items:{
    ShortSword:{ n:'Rusty Short Sword',atk:3 },
    WolfPelt:{ n:'Wolf Pelt' },
    GnollFang:{ n:'Gnoll Fang' },
    MythrilBlade:{ n:'Mythril Blade',atk:8,r:1 }
  },
  rare:['MythrilBlade'],
  cls:{ warrior:{hp:40,atk:5}, cleric:{hp:28,atk:3}, wizard:{hp:22,atk:7} },
  start:'Qeynos Gates'
};

/* === DOM === */
const createScreen = document.getElementById('create-screen');
const gameScreen   = document.getElementById('game-screen');
const nameInput    = document.getElementById('hero-name');
const classBtns    = [...document.querySelectorAll('#class-buttons button')];
const startBtn     = document.getElementById('start-btn');

const out=document.getElementById('output');
const inp=document.getElementById('command-input');
const form=document.getElementById('command-form');
const bar=document.getElementById('actions');
const npcButtons=document.getElementById('npc-buttons');

/* === State === */
let S={made:false,name:'',cls:'',zone:DATA.start,hp:0,maxHp:0,atk:0,inv:[],log:[]};

/* === UI helpers === */
const p=t=>{ S.log.push(t); out.textContent=S.log.join('\n'); out.scrollTop=out.scrollHeight; };
const refreshNPCButtons = () => {
  npcButtons.innerHTML='';
  const z=DATA.zones[S.zone];
  z.n.forEach(k=>{
    const btn=document.createElement('button');
    btn.textContent='Attack '+DATA.npcs[k].n;
    btn.addEventListener('click',()=>{ route('attack '+DATA.npcs[k].n.toLowerCase()); });
    npcButtons.appendChild(btn);
  });
};

/* === Creation logic === */
let chosenClass='';
classBtns.forEach(b=>{
  b.addEventListener('click',()=>{ chosenClass=b.dataset.class; classBtns.forEach(x=>x.disabled=false); b.disabled=true; checkReady(); });
});
nameInput.addEventListener('input',checkReady);
function checkReady(){ startBtn.disabled=!(nameInput.value.trim()&&chosenClass); }
startBtn.addEventListener('click',()=>{
  createHero(nameInput.value.trim(),chosenClass);
  createScreen.hidden=true;
  gameScreen.hidden=false;
});

/* === Game mechanics === */
function createHero(n,c){
  const cls=DATA.cls[c];
  S={...S,made:true,name:n,cls:c,maxHp:cls.hp,hp:cls.hp,atk:cls.atk};
  p(`Welcome, ${S.name} the ${c}!`);
  look();
}

function look(){
  const z=DATA.zones[S.zone];
  p(`\n-- ${S.zone} --\n${z.d}`);
  if(z.n.length)p('You see: '+z.n.map(k=>DATA.npcs[k].n).join(', '));
  p('Exits: '+Object.keys(z.x).join(', '));
  refreshNPCButtons();
}
function move(d){ const z=DATA.zones[S.zone]; if(z.x[d]){S.zone=z.x[d]; look();} else p("Can't go that way.");}
function loot(k){
  const n=DATA.npcs[k]; let drops=[...n.l]; if(Math.random()<0.05)drops.push(DATA.rare[Math.floor(Math.random()*DATA.rare.length)]);
  drops.forEach(i=>{S.inv.push(i);p('Looted '+DATA.items[i].n+'!');});
}
function fight(t){
  const z=DATA.zones[S.zone],key=z.n.find(k=>DATA.npcs[k].n.toLowerCase().includes(t));
  if(!key){p('No such target.');return;}
  const m=DATA.npcs[key]; m.hp-=S.atk; p('You hit '+m.n+' for '+S.atk);
  if(m.hp<=0){p(m.n+' defeated!'); loot(key); z.n=z.n.filter(x=>x!==key);} else{S.hp-=m.atk;p(m.n+' hits you for '+m.atk+' (HP '+S.hp+'/'+S.maxHp+')');}
  if(S.hp<=0){p('You died...'); S.hp=S.maxHp; S.zone=DATA.start; look();}
  refreshNPCButtons();
}
function inv(){p(S.inv.length?'Inventory:\n'+S.inv.map(i=>'- '+DATA.items[i].n).join('\n'):'Inventory empty.');}
function help(){p('Commands: look | go n/e/s/w | attack <name> | inventory | help');}

function route(raw){
  const [v,...r]=raw.trim().split(/\s+/);const t=r.join(' ');
  switch(v){
    case'look':look();break;
    case'go':move(r[0]);break;
    case'n':case'north':move('n');break;case's':case'south':move('s');break;case'e':case'east':move('e');break;case'w':case'west':move('w');break;
    case'attack':fight(t);break;
    case'inventory':inv();break;
    case'help':help();break;
    default:p('Unknown command.'); }
}

/* === Event Hooks === */
form.addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(!v)return;p('> '+v);route(v);inp.value='';});
bar.addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){const c=e.target.getAttribute('data-cmd');p('> '+c);route(c);inp.focus();}});

/* === First load: hide game, show create === */
createScreen.hidden=false; gameScreen.hidden=true;

