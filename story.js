// Story and state are independent of the map renderer. Odds stay inside this module.
// 엔딩 화면 문구: 백틱(`) 안에서 Enter로 줄을 바꾸면 화면에도 그대로 반영됩니다.
export const endingMessage = {
  title: `감사합니다.`,
  anniversary: `10월 4일은 산제이와 샤르만의 기념일이에요.`,
  dedication: `모두 축하해주셔서 감사합니다 :) (선감사)
  언젠가 저의 앤캐들을 모두 등장시키는 게임을 완성시키는 그 날까지... 베이베이`
};

export const paths = {
  start: ['forest', 'road'], forest: ['start', 'ridge', 'camp'],
  ridge: ['forest', 'camp', 'gate'], camp: ['forest', 'ridge', 'road', 'gate'],
  road: ['start', 'camp', 'gate'], gate: ['ridge', 'camp', 'road', 'castle'], castle: ['gate']
};
export const placeNames = {start:'출발점',forest:'숲길',ridge:'늑대등 고개',camp:'숲가 쉼터',road:'큰길',gate:'성문',castle:'성 안'};
const descriptions = {
  start:'숲으로 들어가는 좁은 길과 수레바퀴 자국이 남은 큰길이 갈라진다.\n북쪽에는 서릿돌 성이 있다.',
  forest:'나뭇가지 사이로 빛이 가늘게 스며든다.\n길은 늑대등 고개와 숲가 쉼터로 이어진다.',
  ridge:'눈 덮인 바위 너머로 차가운 바람이 불어온다.\n멀리 서릿돌 성의 돌벽이 보인다.',
  camp:'길이 만나는 곳에 작은 쉼터가 있다.\n모닥불 곁에서 잠시 발을 녹일 수 있겠다.',
  road:'수레바퀴 자국을 따라 북쪽으로 큰길이 뻗어 있다.\n품 안의 서신은 무사하다.',
  gate:'서릿돌 성의 문이 열려 있다.\n돌벽 너머에서 사람들의 목소리가 들려온다.',
  castle:'서릿돌 성의 뜰에 도착했다.'
};

export function normalizeName(value) {
  return Array.from(String(value ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim()).slice(0,20).join('') || '당신';
}
export function withParticle(name, pair='은/는') {
  const last = [...String(name).normalize('NFC')].reverse().find(c => /[가-힣]/.test(c));
  const tail = last ? (last.charCodeAt(0)-0xac00)%28 : 0;
  const [closed,open] = pair.split('/');
  return name + (pair==='으로/로' ? (tail && tail!==8 ? closed : open) : (tail ? closed : open));
}

export function createStory({random=Math.random}={}) {
  let state, view, actions, queue, revision=0;
  const has = name => state.allies.includes(name);
  const player = pair => withParticle(state.name,pair);
  const option = (id,label,run) => ({id,label,run});
  function show(id,text,choices=[],{title=placeNames[state.location],travel=false,input=false}={}) {
    state.canMove=travel && !state.ended && !state.delivered;
    actions=new Map(choices.map(c=>[c.id,c.run]));
    view={id,revision:++revision,title,text,choices:choices.map(({id,label})=>({id,label})),input};
  }
  function note(id,text,next=advance,title) {
    show(id,text,[option('continue','계속한다',next)],{title});
  }
  function advance() {
    const next=queue.shift();
    if(next) next(); else rest();
  }
  function reset() {
    state={name:'당신',location:'start',allies:[],met:[],visited:['start'],canMove:false,started:false,
      delivered:false,ended:false,outcome:null,ending:null,food:1,injured:false,
      banditPlan:random()<.45?'forest':'ridge',banditMet:false,banditResolved:false,lamented:false,
      wolfDone:false,poetHeard:false,poetRumor:false,birthdayHeard:false,gateSeen:false,shipmentHeard:false,castleParty:null};
    queue=[];
    show('name','험준한 모라크 산맥을 겨우 넘어 북부에 이르렀다.\n겨울성까지 이제 얼마 남지 않았다.',[
      option('begin','여정을 시작한다',value=>{
        state.name=normalizeName(value);state.started=true;
        show('intro',`${player('은/는')} 선리치의 대공, 서부 연안의 칸을 섬기는 기사의 종자다.\n함께 떠났던 기사는 사막에서 목숨을 잃었다.\n콰스에서 구한 길잡이에게 기사의 말과 재산을 내주고, 이제 은화 몇 푼과 마른 빵 한 조각만 남았다.\n\n품 안에는 대공의 인장이 찍힌 서신이 있다.\n수신인은 북부의 주인 아미르 칸. 봉인된 내용은 알지 못한다.\n서릿돌 성에 서신을 전달하고 기사의 죽음을 알려야 한다.`,[
          option('depart','서신을 품에 넣고 길을 나선다',()=>rest())
        ]);
      })
    ],{input:true});
  }
  function rest() {
    const choices=[];
    if(state.location==='start') {
      choices.push(option('letter','서신을 확인한다',()=>note('letter','서부의 칸, 선리치 대공의 인장이 봉랍에 남아 있다.\n아미르 칸에게 보내는 서신이다.\n봉인은 훼손되지 않았다.',rest)));
      choices.push(option('knight','함께 떠났던 기사를 떠올린다',()=>note('knight','그날 밤, 기사는 술에 취해 있었다.\n갑작스러운 비명에 달려갔지만 어둠 속에서는 그를 해친 것이 전갈인지, 뱀인지, 독거미인지 알 수 없었다.\n해독제는 있었다. 하지만 무엇을 해야 할지 판단하지 못한 채 밤이 지나갔다.\n이제 그의 죽음을 알릴 사람도, 임무를 마칠 사람도 당신뿐이다.',rest)));
    }
    if(state.location==='camp') {
      if(!state.poetHeard) choices.push(option('poet','모닥불 곁의 남자를 살핀다',poet));
      else if(!state.poetRumor && state.food) choices.push(option('share','시인에게 남은 빵을 나누어 준다',rumor));
      if(has('산제이')&&has('샤르만')&&!state.birthdayHeard) choices.push(option('birthday','두 사람과 모닥불 곁에서 쉬어 간다',birthday));
    }
    let text=descriptions[state.location];
    if(state.location==='camp'&&!state.poetHeard) text+='\n남루한 옷차림의 남자가 불 곁에 웅크리고 앉아 있다.';
    if(state.injured) text+='\n샤르만은 다친 팔을 감싸고 걸음을 맞춘다.';
    show('travel',text,choices,{travel:true});
  }
  function recruit(name) {
    state.met.push(name);
    const forest=name==='샤르만'&&state.location==='forest';
    const text=forest
      ? '나무 사이에서 한 청년이 모습을 드러낸다. 잘 살펴보면 청년보다는 소년에 가까운 듯 하다.\n“성으로 가려고요?”\n서신의 인장을 본 그의 눈길이 잠시 머문다.\n“제가 길을 알아요. 같이 가시죠.”\n그는 자신을 샤르만이라고 소개한다.\n어디선가 들어본 듯한 감각이 스치지만, 정확한 것은 떠오르지 않는다.'
      : name==='산제이'
        ? (state.location==='ridge'
          ? (has('샤르만')?'고개 입구의 바위 곁에 검을 찬 청년이 서 있다.\n“산제이! 거기서 뭐하는 거야?” 샤르만이 먼저 그를 부른다. 목소리에 약간 짜증이 묻어있는 것 같다\n“성으로 가나? 나도 그쪽인데.”\n그는 자신을 산제이라고 소개한다.\n“이 고개에선 혼자 걷지 않는 게 좋아.”\n샤르만이 폼 잡지 말라는 둥의 잔소리를 늘어놓지만 익숙한 듯 무시한다.':'고개 입구의 바위 곁에 검을 찬 청년이 서 있다.\n“성으로 가나? 나도 그쪽인데.”\n그는 자신을 산제이라고 소개한다.\n“이 고개에선 혼자 걷지 않는 게 좋아.”')
          : (has('샤르만')?'모닥불 곁에 검을 찬 청년이 서 있다.\n“산제이! 거기서 뭐하는 거야?” 샤르만이 먼저 그를 부른다. 목소리에 약간 짜증이 묻어있는 것 같다.\n“성으로 가나? 나도 그쪽인데.”\n그는 자신을 산제이라고 소개한다.\n“불을 더 쬐다 갈 생각이 아니라면, 함께 가지.”':'모닥불 곁에 검을 찬 청년이 서 있다.\n“성으로 가나? 나도 그쪽인데.”\n그는 자신을 산제이라고 소개한다.\n“불을 더 쬐다 갈 생각이 아니라면, 함께 가지.”'))
        : (has('산제이')?'쉼터에 먼저 와 있던 청년이 고개를 든다.\n“산제이, 어디 갔다 오는 거야? 한참 찾았잖아.”\n그는 곧 당신에게도 인사를 건넨다.\n그는 자신을 샤르만이라고 소개한다.\n어디선가 들어본 듯한 감각이 스치지만, 정확한 것은 떠오르지 않는다.':'쉼터에 먼저 와 있던 청년이 고개를 든다.\n“성으로 가는 길인가요?”\n“저도 마침 돌아가려던 참인데, 같이 가시죠.”\n그는 자신을 샤르만이라고 소개한다.\n어디선가 들어본 듯한 감각이 스치지만, 정확한 것은 떠오르지 않는다.');
    show('meet-'+name,text,[
      option('join',`${withParticle(name,'과/와')} 함께 간다`,()=>{
        state.allies.push(name);
        note('joined',name==='산제이'?'산제이가 일행에 합류했다.\n“뒤처지지 마.”':'샤르만이 일행에 합류했다.\n“오는 길에 무슨 일이 있었던 거예요?”');
      }),
      option('decline',state.allies.length>0?'정중하게 거절한다.':'혼자서도 괜찮다고 답한다',()=>note('declined',name==='산제이'?'산제이는 더 권하지 않는다.\n“그럼 성에서 보자.”':'샤르만은 더 권하지 않는다.\n“그럼 몸을 조심하세요. 이 근처에는 아직도 노략질을 일삼는 자들이 남아있어서요.”'))
    ]);
  }
  function bandit() {
    state.banditMet=true;
    const terrain={road:'수레바퀴 자국을 따라 걷던 중',forest:'나무가 빽빽한 굽이에 이르자',ridge:'고개의 바위 사이를 지나려는 순간',camp:'쉼터 밖 숲으로 이어지는 길목에서'}[state.location]||'성으로 가는 길목에서';
    banditMenu(`${terrain}, 낡은 칼을 든 사내가 길을 막는다.\n“가진 것 전부 내려놔. 얌전히 두고 가면 목숨은 붙여 줄 테니.”\n그의 시선이 허리춤과 짐을 훑는다.`);
  }
  function companionOptions(lastChance=false) {
    const choices=[];
    if(has('산제이')&&has('샤르만')) choices.push(option('both','산제이와 샤르만에게 함께 붙잡자고 한다',()=>attempt(.9,
      '산제이가 칼을 쳐 내는 사이, 샤르만이 사내의 퇴로를 막는다.\n둘 사이에 갇힌 도적은 마침내 무기를 놓는다.\n“알았어, 알았다고! 그냥 보내 줘!”',lastChance)));
    if(has('산제이')) choices.push(option('sanjay','산제이에게 도움을 청한다',()=>banditSafe('산제이의 검이 짧게 움직인다.\n도적의 칼이 땅에 떨어지고, 목덜미에는 서늘한 날이 닿는다.\n“다음엔 상대부터 보고 덤벼.”\n산제이가 비켜서자 도적은 칼도 줍지 못하고 달아난다.')));
    if(has('샤르만')) choices.push(option('sharman','샤르만에게 도움을 청한다',()=>{
      if(random()<.5) banditSafe('샤르만이 옆으로 파고들어 도적의 손목을 움켜쥔다.\n곧이어 주먹이 날아들자, 사내는 비틀거리며 주저앉는다.\n“남의 주머니 말고 다른 먹고살 길을 찾아보세요.”');
      else {state.injured=true;banditSafe('샤르만이 도적을 밀쳐 내는 순간, 칼끝이 그의 팔을 스친다.\n그는 이를 악물고 다시 주먹을 뻗는다.\n사내가 주춤하는 사이 둘은 길을 벗어난다.\n서신은 지켰지만, 샤르만의 팔에서 피가 배어 나온다.\n샤르만은 아무렇지 않은 듯 낡은 천으로 상처를 동여맨다.');}
    }));
    return choices;
  }
  function banditMenu(text='도적은 아직 길을 비키지 않는다.\n칼끝이 천천히 당신을 따라 움직인다.') {
    const choices=[];
    if(!state.lamented) choices.push(option('lament','지금까지 겪은 불운을 구구절절 늘어놓는다',lament));
    choices.push(option('seal','선리치 대공의 인장을 보이며 위협한다',()=>attempt(state.lamented?.8:.25,
      '봉랍의 인장을 확인한 도적이 얼굴을 찌푸린다.\n“그 몇 푼 때문에 귀족한테 찍힐 생각은 없어.”\n칼을 내린 그가 옆으로 물러선다.')));
    if(state.allies.length) choices.push(option('help','동행인에게 도움을 청한다',()=>show('bandit-help','도적의 시선이 동행인에게로 옮겨 간다.',[
      ...companionOptions(),option('back','직접 해결할 방법을 찾는다',()=>banditMenu())
    ],{title:'길을 막은 도적'})));
    choices.push(option('flee','틈을 보아 달아난다',()=>attempt(.6,'도적이 발을 옮기는 순간 달리기 시작한다.\n뒤에서 욕설이 들려왔지만, 쫓아오는 발소리는 곧 멀어졌다.')));
    choices.push(option('other','다른 방법을 찾는다',()=>show('bandit-other','도적의 칼과 주변 지형을 번갈아 살핀다.',[
      option('hide','수풀과 바위 사이로 몸을 숨긴다',()=>attempt(.65,'사내의 시야를 벗어나 낮게 몸을 숨긴다.\n한참을 서성이던 도적이 다른 길로 사라진다.')),
      option('persuade','싸울 이유가 없다고 설득한다',()=>attempt(.35,'“우리 둘 다 피 볼 일은 없잖아.”\n긴 침묵 끝에 사내가 귀찮다는 듯 손을 내젓는다.')),
      option('beg','무릎을 꿇고 살려 달라고 빈다',()=>attempt(.3,'“에이, 재수 없게.”\n도적은 얼굴을 찡그리더니 물러가라는 손짓을 한다.')),
      option('ambush','빈틈을 노려 기습한다',()=>attempt(.25,'사내가 고개를 돌리는 순간 전력으로 들이받는다.\n바닥에 쓰러진 그가 일어나기 전에 길을 벗어난다.')),
      option('fight','정면으로 맞선다',()=>attempt(.2,'떨리는 팔로 공격을 받아 낸다.\n몇 번의 위태로운 공방 끝에 사내가 먼저 뒷걸음질 친다.')),
      option('back','다시 생각한다',()=>banditMenu())
    ],{title:'길을 막은 도적'})));
    show('bandit',text,choices,{title:'길을 막은 도적'});
  }
  function lament() {
    state.lamented=true;
    show('lament',`“하..., 뭐 같네 진짜. 야, 들어봐.\n내가 모시던 기사는 사막을 건너다가 죽었어.\n그리고 나는 혼자 남아서 산맥을 건너겠답시고 \n콰스의 길잡이에게 말도, 가지고 있던 금화도 전부 털렸지.\n이제 돌아갈 길에 쓸 돈도 없는데 날 죽여서 뭘 할 건데?”\n\n${player('은/는')} 숨도 고르지 않고 말을 쏟아 낸다.\n사내의 표정이 차츰 떨떠름해진다.`,[
      option('continue','도적의 반응을 살핀다',()=>random()<.35
        ?banditSafe('“그만해라. 듣고 있으니 내 신세까지 처량해지네.”\n도적이 칼을 거두며 고개를 젓는다.\n“가. 가진 것도 없는 놈 붙들어 봐야 뭐 하겠어.”')
        :banditMenu('“그래서? 빵 한 조각이라도 가지고 있다면 내놔.”\n사내가 다시 칼을 들이민다.\n처음보다는 기세가 꺾였지만, 아직 물러설 생각은 없어 보인다.'))
    ],{title:'끝없는 신세 한탄'});
  }
  function attempt(chance,success,lastChance=false) {
    if(random()<chance) banditSafe(success);
    else if(lastChance) fail('도적에게 붙잡혔다','마지막 빈틈을 놓쳤다.\n도적은 짐을 낚아채고 당신을 길 밖으로 밀쳐 낸다.\n봉인된 서신도 그의 손에 넘어갔다.');
    else lastStand();
  }
  function lastStand() {
    show('last-chance','뜻대로 되지 않았다.\n칼날이 바로 앞을 스친다. 더 망설일 시간이 없다.',[
      option('escape','마지막 힘을 다해 달아난다',()=>attempt(.55,'넘어질 듯 달려 사내의 손에서 벗어났다.\n품 안을 더듬자 봉인된 서신이 만져진다.',true)),
      ...companionOptions(true),
      option('surrender','짐을 내주고 목숨을 구한다',()=>fail('빼앗긴 서신','사내는 은화와 함께 서신까지 가져갔다.\n목숨은 건졌지만 맡은 임무는 완수하지 못했다.\n괜찮다. 어차피 대수롭지 않은 내용일 것이다.'))
    ],{title:'칼끝 앞에서'});
  }
  function banditSafe(text) {
    state.banditResolved=true;
    note('bandit-safe',text+'\n\n서신은 무사하다. 다시 길을 갈 수 있다.',advance,'도적을 벗어나');
  }
  function wolves() {
    state.wolfDone=true;
    const text='가까운 곳에서 낮은 울음소리가 들린다.\n눈 덮인 바위 사이로 회색 등이 하나둘 모습을 드러낸다.\n늑대들이 길을 에워싼다.';
    if(has('산제이')) show('wolves',text+'\n산제이가 검집에 손을 얹고 일행의 앞을 막는다.\n“뛰지 마. 내 뒤로 와.”',[
      option('follow','산제이의 지시에 따른다',()=>note('wolves-safe','산제이는 몸을 낮추고 가장 가까운 늑대를 노려본다.\n앞으로 내디딘 발과 번뜩이는 칼날에 놈이 뒤로 물러난다.\n일행은 등을 보이지 않은 채 바위 쪽으로 천천히 움직인다.\n울음소리가 멀어진 뒤에야 산제이가 검을 거둔다.'))
    ],{title:'늑대등 고개의 울음'});
    else show('wolves',text+'\n한 사람이 막아 낼 수 있는 수가 아니다.'+(has('샤르만')?'\n샤르만이 낮게 속삭인다.\n“쉿. 움직이지 마. 아직 우릴 다 보진 못했어.”':''),[
      option('hide','바위 틈으로 몸을 숨긴다',()=>random()<.22
        ?note('wolves-hidden','바위 틈에 몸을 밀어 넣고 숨을 죽인다.\n축축한 콧김이 가까워졌다가 멀어진다.\n얼마나 지났을까. 마침내 발소리가 끊겼다.\n굳은 다리를 펴고 조심스럽게 길을 빠져나간다.')
        :wolfDeath()),
      option('run','고개 아래로 달아난다',wolfDeath),
      option('fight','늑대와 맞선다',wolfDeath)
    ],{title:'늑대등 고개의 울음'});
  }
  function wolfDeath() {fail('눈 속에 남은 서신','뒤에서 뛰어드는 무게에 몸이 무너진다.\n늑대 울음과 함께 의식이 멀어진다.\n서신은 끝내 성에 도착하지 못했다.','death');}
  function fail(title,text,outcome='failure') {
    state.ended=true;state.outcome=outcome;queue=[];
    show('failure',text,[option('restart','다시 여정을 시작한다',reset)],{title});
  }
  function poet() {
    state.poetHeard=true;
    show('poet','남루한 옷차림의 남자가 불 곁에서 손을 비빈다.\n그가 낮게 읊조리는 말에 가락이 실려 있다.\n떠돌이 시인인 듯하다.\n“긴 길을 왔소?”\n“발을 쉬는 동안 옛이야기 하나 듣겠소?”\n“용들이 하늘을 지배하던 시절, 한 왕자가 매음굴의 금발 사내를 사랑했다오.”\n“형제들이 차례로 죽어 그 왕자가 왕이 되었지.”\n“그러더니 애인을 성으로 불러들였어.”',[
      option('continue','이야기를 더 듣는다',()=>show('poet-king',(has('샤르만')?(has('산제이')?'“왕은 살인을 일삼고, 전쟁까지 일으킬 뻔했다오.”\n“끝내 제 용과 함께 바다에 가라앉았지.”\n“사람들은 그를 미친 왕이라 불렀소.”\n시인은 마치 직접 보았다는 듯 두 팔을 벌린다.\n\n샤르만이 낮게 중얼거린다. \n“책에서는 못 본 이야기인데.”\n산제이는 아무 말 없이 꺼져 가는 모닥불을 뒤적인다.':'“왕은 살인을 일삼고, 전쟁까지 일으킬 뻔했다오.”\n“끝내 제 용과 함께 바다에 가라앉았지.”\n“사람들은 그를 미친 왕이라 불렀소.”\n시인은 마치 직접 보았다는 듯 두 팔을 벌린다.\n\n샤르만이 낮게 중얼거린다.\n“책에서는 못 본 이야기인데.”'):(has('산제이')?'“왕은 살인을 일삼고, 전쟁까지 일으킬 뻔했다오.”\n“끝내 제 용과 함께 바다에 가라앉았지.”\n“사람들은 그를 미친 왕이라 불렀소.”\n시인은 마치 직접 보았다는 듯 두 팔을 벌린다.\n\n산제이는 아무 말 없이 꺼져 가는 모닥불을 뒤적인다.':'“왕은 살인을 일삼고, 전쟁까지 일으킬 뻔했다오.”\n“끝내 제 용과 함께 바다에 가라앉았지.”\n“사람들은 그를 미친 왕이라 불렀소.”\n시인은 마치 직접 보았다는 듯 두 팔을 벌린다.')),[
        ...(state.food?[option('share','남은 빵을 나누어 준다',rumor)]:[]),option('leave','이야기에 감사를 표한다',rest)
      ],{title:'옛 왕의 이야기'}))
    ],{title:'떠돌이 시인'});
  }
  function rumor() {
    if(!state.food||state.poetRumor) return rest();
    state.food--;state.poetRumor=true;
    note('poet-rumor',(has('샤르만')?(has('산제이')?'시인은 빵을 받아 들고 잠시 말을 멈춘다.\n“고맙소. 그럼 이것도 들려줘야겠군.”\n그가 목소리를 낮춘다.\n“사실 둘이 몰래 혼인 서약을 맺었다는 말도 있소.”\n“서로 너무 사랑해서 말이오. 뭐, 떠도는 소문이지만.”\n\n샤르만이 불빛을 내려다본다.\n“그랬다면…… 두 사람에게는 다른 이름의 이야기였겠군요.”\n산제이는 여전히 말이 없다. \n그의 손끝에서 불씨가 조금 살아난다.':'시인은 빵을 받아 들고 잠시 말을 멈춘다.\n“고맙소. 그럼 이것도 들려줘야겠군.”\n그가 목소리를 낮춘다.\n“사실 둘이 몰래 혼인 서약을 맺었다는 말도 있소.”\n“서로 너무 사랑해서 말이오. 뭐, 떠도는 소문이지만.”\n\n샤르만이 불빛을 내려다본다.\n“그랬다면…… 두 사람에게는 다른 이름의 이야기였겠군요.”'):(has('산제이')?'시인은 빵을 받아 들고 잠시 말을 멈춘다.\n“고맙소. 그럼 이것도 들려줘야겠군.”\n그가 목소리를 낮춘다.\n“사실 둘이 몰래 혼인 서약을 맺었다는 말도 있소.”\n“서로 너무 사랑해서 말이오. 뭐, 떠도는 소문이지만.”\n\n산제이는 여전히 말이 없다.\n그의 손끝에서 불씨가 조금 살아난다.':'시인은 빵을 받아 들고 잠시 말을 멈춘다.\n“고맙소. 그럼 이것도 들려줘야겠군.”\n그가 목소리를 낮춘다.\n“사실 둘이 몰래 혼인 서약을 맺었다는 말도 있소.”\n“서로 너무 사랑해서 말이오. 뭐, 떠도는 소문이지만.”')),rest,'불 곁에서 들은 소문');
  }
  function birthday() {
    state.birthdayHeard=true;
    note('birthday','샤르만이 모닥불 건너편의 산제이를 빤히 바라본다.\n“도대체 얼마나 대단한 걸 준비하길래 이렇게 뜸을 들여?”\n산제이가 코웃음을 친다.\n“받고 너무 감동 받아서 울지나 마.”\n“종종 네가 나보다 세 달 일찍 태어났다는 사실을 믿을 수가 없어.”\n\n산제이는 대꾸 대신 불 속으로 잔가지를 하나 던진다.',rest,'아직 받지 못한 선물');
  }
  function gate() {
    state.gateSeen=true;
    show('gate-strangers','성문 앞에서 노인과 어린아이가 걸어 나온다.\n노인의 목에 걸린 사슬이 그가 학사임을 알려 준다.\n어째서인지 오래 눈을 맞추고 싶지 않은 인상이다.',[
      option('talk','학사와 아이에게 말을 건다',()=>note('charlie',(has('샤르만')?(has('산제이')?'“찰리, 인사해야지.”\n학사의 말에 아이가 고개를 든다.\n"안녕하세요..."\n아이와 눈을 맞추고 웃어준 샤르만이 이내 굽혔던 허리를 편다.\n산제이는 다소 무정하게까지 들리는 어투로 말한다.\n“아버지나 형님이 새로운 학사를 들인다는 소식은 못 들었는데.\n거기에 어린애가 딸린 영감이라는 말은 더더욱.”\n\n학사는 태연하게 웃는다.\n“잠시 들렀다가 떠나려던 참입니다.”\n그는 더 설명하지 않고 아이를 데리고 큰길 쪽으로 사라진다.':'“찰리, 인사해야지.”\n학사의 말에 아이가 고개를 든다.\n"안녕하세요..."\n아이와 눈을 맞추고 웃어준 샤르만이 이내 굽혔던 허리를 편다.\n“올드 타운에서 오셨나요?”\n\n학사는 태연하게 웃는다.\n“잠시 들렀다가 떠나려던 참입니다.”\n그는 더 설명하지 않고 아이를 데리고 큰길 쪽으로 사라진다.'):(has('산제이')?'“찰리, 인사해야지.”\n학사의 말에 아이가 고개를 든다.\n산제이가 무감한 목소리로 입을 연다.\n“아버지나 형님이 새로운 학사를 들인다는 소식은 못 들었는데. 거기에 어린애가 딸린 영감이라는 말은 더더욱.”\n\n학사는 태연하게 웃는다.\n“잠시 들렀다가 떠나려던 참입니다.”\n그는 더 설명하지 않고 아이를 데리고 큰길 쪽으로 사라진다.':'“찰리, 인사해야지.”\n학사의 말에 아이가 고개를 든다.\n\n“이 성에 계시는 분입니까?”\n\n학사는 태연하게 웃는다.\n“잠시 들렀다가 떠나려던 참입니다.”\n그는 더 설명하지 않고 아이를 데리고 큰길 쪽으로 사라진다.')),advance,'학사와 아이')),
      option('pass','길을 비켜 주고 성문으로 향한다',()=>note('gate-passed','학사는 아이의 손을 이끌고 지나간다.\n두 사람의 발소리가 큰길 쪽으로 멀어진다.'))
    ]);
  }
  function castle() {
    state.castleParty=[...state.allies];
    let text;
    if(has('산제이')&&has('샤르만')) text='뜰로 들어서자 늑대만한 개가 뛰어나온다.\n“윈터!”\n샤르만이 몸을 숙이자 윈터가 그와 산제이 사이를 정신없이 오간다.\n\n개를 쫓아 나온 성의 학사가 숨을 고른다.\n“전하께서는 조금 전 사냥을 나가셨습니다.”\n산제이가 당신 쪽으로 돌아선다.\n“그렇다는데. 서신은 내가 아버지께 전하지.”\n그제야 당신은 당신의 동행인이 정복왕의 둘째 아들이었다는 사실을 깨닫는다.';
    else if(has('샤르만')) text='샤르만이 뜰을 가로질러 당신을 안내한다.\n검을 손질하던 청년이 고개를 든다.\n“산제이, 선리치에서 온 사람이야. 아버님께 서신을 가져왔대.”\n산제이는 인장을 확인하고 고개를 끄덕인다.\n“아버지는 사냥을 나가셨어. 내가 대신 전해 주지.”';
    else if(has('산제이')) text='산제이가 뜰에서 걸음을 멈춘다.\n“아버지가 돌아오시면 내가 서신을 전하지.”\n그제야 당신은 당신의 동행인이 정복왕의 둘째 아들이었다는 사실을 깨닫는다.\n\n그 때 건물 안에서 다른 청년이 모습을 드러낸다.\n그는 눈매가 동그랗고 체격이 왜소하여 소년에 가깝게 보인다.\n“산제이, 누구…… 어?”\n그의 시선이 품에서 꺼낸 서신에 머문다.';
    else text='당신은 뜰을 지나려다 말다툼하던 두 청년과 마주친다.\n“서재에만 박혀 있지 말고 검술 수업에도 좀 나와.”\n“나와서 너한테 잔소리나 들으라고?”\n\n사정을 설명하자 마른 체형의 소년이 먼저 인사한다.\n“샤르만입니다. 어머니께서 보내셨다고요."\n당신은 고향 선리치의 둘째 공자이자,\n두 가문의 결속을 위해 겨울에게로 보내진 소년을 향해 허리 숙여 공손히 인사한다.\n"이쪽은 서릿돌 성의 둘째 왕자 산제이에요.”\n산제이가 도통 속을 알 수 없는 얼굴로 손을 내민다.\n“아버지께 온 편지라고? 내가 전해 주지.”';
    show('castle-letter',text,[
      ...(!state.shipmentHeard?[option('shipment','선리치에서 보낸 물자에 관해 듣는다',()=>{
        state.shipmentHeard=true;
        note('shipment','산제이가 입을 연다.\n“얼마 전에 선리치의 대공께서 아드님의 명명일을 축하하시며 선물과 물자를 보내셨지.”\n“하지만 도중에 일부가 약탈당했어. 아버지가 성을 비운 사이에 형님이 정리하셨는데... ...”\n샤르만이 말을 받는다.\n“아직 없어진 물건 중에 확인할 게 남았다고 하시더니, 그 일로 보내신 편지일지도 모르겠네요.”\n\n서신의 봉인은 여전히 닫혀 있다.',castle,'선리치에서 온 소식');
      })]:[]),
      option('deliver','기사의 죽음을 알리고 산제이에게 서신을 맡긴다',deliver)
    ]);
  }
  function deliver() {
    state.delivered=true;state.outcome='success';
    show('success',`${player('은/는')} 기사가 사막에서 죽었다는 소식을 전하고 봉인된 서신을 건넨다.\n산제이가 서신을 받아 품 안에 넣는다.\n“서신도, 그 소식도 아버지께 전하겠다.”\n\n서신 전달 임무를 완수했다.\n\n“아버지가 돌아오실 때까지 머물러도 돼.”\n샤르만도 산제이의 제안을 거든다. \n“돌아가기 전에 잠깐 쉬어요. 먼 길 오셨으니.”`,[
      option('stay','성에 머물며 피로를 푼다',()=>epilogue('stay')),
      option('leave','호의에 감사하고 성을 떠난다',()=>epilogue('leave'))
    ],{title:'임무 성공 · 서신 전달'});
  }
  function epilogue(choice) {
    state.ended=true;state.ending=choice;
    show('ending',choice==='stay'
      ? '샤르만의 안내를 따라 따뜻한 방으로 들어간다.\n산제이는 서신을 챙겨 뜰을 가로질러 간다.\n\n오늘만큼은 더 걸을 필요가 없다.\n서신은 맡길 이의 손에 도착했다.'
      : '두 사람에게 감사를 표하고 성문을 나선다.\n\n품 안은 가벼워졌고, 걸음에도 조금 힘이 돌아온다.\n\n돌아갈 길은 남았지만, 맡은 임무는 끝났다.',[
      option('restart','다른 길로 다시 시작한다',reset)
    ],{title:choice==='stay'?'임무 성공 · 성에 머물다':'임무 성공 · 다시 길 위로'});
  }
  function requestMove(id) {
    if(!state.canMove||!paths[state.location]?.includes(id)) return false;
    // A late encounter happens on the wooded path out of camp, before the gate.
    if(id==='gate'&&!state.banditMet) {queue=[];bandit();return false;}
    state.canMove=false;
    return true;
  }
  function arrive(id) {
    state.location=id;
    if(!state.visited.includes(id)) state.visited.push(id);
    queue=[];
    if(id==='forest'&&!state.met.includes('샤르만')) queue.push(()=>recruit('샤르만'));
    if(id==='ridge'&&!state.met.includes('산제이')) queue.push(()=>recruit('산제이'));
    if(id==='camp') {
      const missing=['산제이','샤르만'].filter(name=>!state.met.includes(name));
      if(missing.length) {const name=missing.length===1?missing[0]:missing[Math.floor(random()*missing.length)];queue.push(()=>recruit(name));}
    }
    if(!state.banditMet&&(id==='road'||id==='ridge'||id===state.banditPlan)) queue.push(bandit);
    if(id==='ridge'&&!state.wolfDone) queue.push(wolves);
    if(id==='gate'&&!state.gateSeen) queue.push(gate);
    if(id==='castle') queue.push(castle);
    advance();
  }
  reset();
  return {
    get state(){return {...state,allies:[...state.allies],met:[...state.met],visited:[...state.visited]};},
    get view(){return {...view,choices:view.choices.map(c=>({...c}))};},
    choose(id,value,expectedRevision=view.revision){
      if(expectedRevision!==view.revision) return false;
      const run=actions.get(id); if(!run) return false;
      run(value);return true;
    },
    requestMove,arrive,reset
  };
}
