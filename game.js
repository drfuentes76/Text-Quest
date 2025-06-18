
/* Quick EverQuest‑inspired text RPG — single‑file, flat structure */
const DATA={zones:{'Qeynos Gates':{d:'You stand before the grand gates of Qeynos.',x:{e:'Qeynos Hills'},n:['Guard']},'Qeynos Hills':{d:'Rolling green hills dotted with willow trees.',x:{w:'Qeynos Gates',e:'Blackburrow'},n:['Wolf']},'Blackburrow':{d:'A dank cave populated by gnolls.',x:{w:'Qeynos Hills'},n:['Gnoll']}},npcs:{Guard:{n:'Guard Tomas',hp:30,atk:4,l:['ShortSword']},Wolf:{n:'Rabid Wolf',hp:20,atk:5,l:['WolfPelt']},Gnoll:{n:'Gnoll Scout',hp:35,atk:6,l:['GnollFang']}},items:{ShortSword:{n:'Rusty Short Sword',atk:3},WolfPelt:{n:'Wolf Pelt'},GnollFang:{n:'Gnoll Fang'},MythrilBlade:{n:'Mythril Blade',atk:8,r:1},ShadowmailArmor:{n:'Shadowmail Armor',def:6,r:1},EnchantStone:{n:'Enchanting Stone',r:1}},rare:['MythrilBlade','ShadowmailArmor','EnchantStone'],cls:{warrior:{hp:40,atk:5},cleric:{hp:28,atk:3},wizard:{hp:22,atk:7}},start:'Qeynos Gates'};
let S={made:false,name:'',cls:'',zone:DATA.start,hp:0,maxHp:0,atk:0,inv:[],log:[]};
const out=document.getElementById('output'),inp=document.getElementById('command-input'),form=document.getElementById('command-form'),bar=document.getElementById('actions');
const p=t=>{S.log.push(t);out.textContent=S.log.join('\n');out.scrollTop=out.scrollHeight;};
const cmd=(c)=>{const[q,...r]=c.trim().split(/\s+/);return[q.toLowerCase(),r];};
function intro(){p('*** TextQuest ***');p('Create hero: create <name> <class>');p('Classes: '+Object.keys(DATA.cls).join(', '));}
function createHero(n,c){c=c.toLowerCase();if(!DATA.cls[c]){p('Unknown class.');return;}const cl=DATA.cls[c];S={...S,made:true,name:n,cls:c,maxHp:cl.hp,hp:cl.hp,atk:cl.atk};p(`Welcome, ${S.name} the ${c}!`);look();}
function look(){const z=DATA.zones[S.zone];p(`\n-- ${S.zone} --\n${z.d}`);if(z.n.length)p('You see: '+z.n.map(k=>DATA.npcs[k].n).join(', '));p('Exits: '+Object.keys(z.x).join(', '));}
function move(d){const z=DATA.zones[S.zone];if(z.x[d]){S.zone=z.x[d];look();}else p("Can't go that way.");}
function loot(k){const n=DATA.npcs[k];let drops=[...n.l];if(Math.random()<0.05)drops.push(DATA.rare[Math.floor(Math.random()*DATA.rare.length)]);drops.forEach(it=>{S.inv.push(it);p('Looted '+DATA.items[it].n+'!');});}
function fight(t){const z=DATA.zones[S.zone],k=z.n.find(k=>DATA.npcs[k].n.toLowerCase().includes(t));if(!k){p('No such target.');return;}const m=DATA.npcs[k];m.hp-=S.atk;p('You hit '+m.n+' for '+S.atk);if(m.hp<=0){p(m.n+' defeated!');loot(k);z.n=z.n.filter(x=>x!==k);}else{S.hp-=m.atk;p(m.n+' hits you for '+m.atk+' (HP '+S.hp+'/'+S.maxHp+')');}if(S.hp<=0){p('You died...');S.hp=S.maxHp;S.zone=DATA.start;look();}}
function inv(){p(S.inv.length?'Inventory:\n'+S.inv.map(i=>'- '+DATA.items[i].n).join('\n'):'Inventory empty.');}
function help(){p('Commands: look | go <n/e/s/w> | attack <name> | inventory | help | create <name> <class>');}
function route(raw){const[v,r]=cmd(raw);if(!S.made&&v!=='create'&&v!=='help'){p('Create hero first.');return;}switch(v){case'create':if(r.length<2)p('Usage: create <name> <class>');else createHero(r[0],r[1]);break;case'look':look();break;case'go':move(r[0]);break;case'n':case'north':move('n');break;case's':case'south':move('s');break;case'e':case'east':move('e');break;case'w':case'west':move('w');break;case'attack':fight(r.join(' '));break;case'inventory':inv();break;case'help':help();break;default:p('Unknown command.');}localStorage.setItem('tq',JSON.stringify(S));}
window.addEventListener('load',()=>{try{const s=localStorage.getItem('tq');if(s)S=JSON.parse(s);}catch{}S.log=[];S.made?p('Welcome back, '+S.name+'!'):intro();if(S.made)look();});
form.addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(!v)return;p('> '+v);route(v);inp.value='';});
bar.addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){const c=e.target.getAttribute('data-cmd');p('> '+c);route(c);inp.focus();}});

