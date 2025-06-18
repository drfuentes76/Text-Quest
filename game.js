// Simplified JS: only essential pieces for UI without command line
const qs=(q)=>document.querySelector(q);
const output=qs('#output');const actionsBar=qs('#actions');const spellBar=qs('#spell-buttons');const npcBar=qs('#npc-buttons');
const createScreen=qs('#create-screen');const gameScreen=qs('#game-screen');const heroName=qs('#hero-name');const startBtn=qs('#start-btn');
const classBtns=[...document.querySelectorAll('#class-buttons button')];

const log=(m)=>{output.textContent+=m+"\n";output.scrollTop=output.scrollHeight;};

// Minimal player state to demonstrate
let chosenClass='', playerMade=false;
heroName.oninput=()=>startBtn.disabled=!(heroName.value.trim()&&chosenClass);
classBtns.forEach(b=>b.onclick=()=>{classBtns.forEach(x=>x.classList.remove('active'));b.classList.add('active');chosenClass=b.dataset.class;startBtn.disabled=!(heroName.value.trim());});
startBtn.onclick=()=>{playerMade=true;createScreen.hidden=true;gameScreen.hidden=false;log(`Welcome ${heroName.value} the ${chosenClass}! Press Look to begin.`);};

actionsBar.onclick=(e)=>{if(e.target.tagName==='BUTTON'){log('> '+e.target.textContent);}};
