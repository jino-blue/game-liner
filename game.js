(() => {
  'use strict';

  const UP=0, RIGHT=1, DOWN=2, LEFT=3;
  const DELTAS=[[-1,0],[0,1],[1,0],[0,-1]], OPP=[DOWN,LEFT,UP,RIGHT];
  const COLORS={green:'#79bd74',blue:'#7597bb',mixed:'#5c5c5c'};
  const $=selector=>document.querySelector(selector);
  const board=$('#board'),frame=$('#boardFrame'),stageLabel=$('#stageLabel'),homeButton=$('#homeButton'),gameScreen=$('#gameScreen'),homeScreen=$('#homeScreen'),homeStageList=$('#homeStageList'),resetProgressButton=$('#resetProgressButton'),resetModal=$('#resetModal'),resetNoButton=$('#resetNoButton'),resetYesButton=$('#resetYesButton');
  const moveCard=$('#moveCard'),moveGradeLabel=$('#moveGradeLabel'),moveUsed=$('#moveUsed'),moveTarget=$('#moveTarget');
  const startOverlay=$('#startOverlay'),restartButton=$('#restartButton');  const modal=$('#modal'),modalTitle=$('#modalTitle'),modalKicker=$('#modalKicker'),modalText=$('#modalText'),modalButton=$('#modalButton');

  // Test campaign: complexity rises from one route to colored crossings and split destinations.
  const STAGES=[
    {rows:3,cols:3,paths:[{color:'green',points:[[2,0],[1,0],[1,1],[1,2],[0,2]]}],specials:[{at:[1,1],type:'filter',color:'green'}],endpoints:[
      {at:[2,0],role:'start',color:'green',locked:true},{at:[0,2],role:'finish',color:'green',locked:true}
    ]},
    {rows:3,cols:4,paths:[{color:'blue',points:[[2,0],[2,1],[1,1],[1,2],[0,2],[0,3]]}],endpoints:[
      {at:[2,0],role:'start',color:'blue',locked:true},{at:[0,3],role:'finish',color:'blue',locked:true}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,0],[2,0],[2,1],[1,1],[0,1]]},
      {color:'blue',points:[[3,3],[2,3],[2,2],[1,2],[0,2]]}
    ],endpoints:[
      {at:[3,0],role:'start',color:'green',locked:false},{at:[0,1],role:'finish',color:'green',locked:true},
      {at:[3,3],role:'start',color:'blue',locked:true},{at:[0,2],role:'finish',color:'blue',locked:false}
    ]},
    {rows:5,cols:5,paths:[
      {color:'green',points:[[2,0],[2,1],[2,2],[2,3],[2,4]]},
      {color:'blue',points:[[0,2],[1,2],[2,2],[3,2],[4,2]]}
    ],specials:[{at:[2,2],type:'cross',target:0}],endpoints:[
      {at:[2,0],role:'start',color:'green',locked:false},{at:[2,4],role:'finish',color:'green',locked:true},
      {at:[0,2],role:'start',color:'blue',locked:true},{at:[4,2],role:'finish',color:'blue',locked:false}
    ]},
    {rows:5,cols:5,paths:[
      {color:'green',points:[[0,0],[0,1],[1,1],[1,2],[2,2],[2,3],[1,3],[1,4]]},
      {color:'blue',points:[[4,0],[3,0],[3,1],[2,1],[2,2],[3,2],[3,3],[4,3],[4,4]]}
    ],specials:[{at:[2,2],type:'dual',target:0}],endpoints:[
      {at:[0,0],role:'start',color:'green',locked:false},{at:[1,4],role:'finish',color:'green',locked:false},
      {at:[4,0],role:'start',color:'blue',locked:false},{at:[4,4],role:'finish',color:'blue',locked:false}
    ]},
    {rows:5,cols:5,paths:[
      {color:'green',points:[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]]},
      {color:'green',points:[[2,1],[2,2],[2,3],[1,3],[0,3]]}
    ],specials:[{at:[2,1],type:'tee',target:3}],endpoints:[
      {at:[4,0],role:'start',color:'green',locked:false},
      {at:[0,1],role:'finish',color:'green',locked:true},{at:[0,3],role:'finish',color:'green',locked:false}
    ]},
    {rows:5,cols:5,paths:[
      {color:'green',points:[[3,2],[2,2],[2,3],[1,3],[1,4]]},
      {color:'blue',points:[[0,1],[1,1],[1,2],[2,2],[2,1],[3,1],[3,0]]}
    ],specials:[{at:[2,2],type:'dual',target:1}],endpoints:[
      {at:[3,2],role:'start',color:'green',locked:false},{at:[1,4],role:'finish',color:'green',locked:true},
      {at:[0,1],role:'start',color:'blue',locked:true},{at:[3,0],role:'finish',color:'blue',locked:false}
    ]},
    {rows:5,cols:6,paths:[
      {color:'green',points:[[4,1],[3,1],[3,2],[3,3],[3,4],[2,4],[2,5]]},
      {color:'blue',points:[[1,3],[2,3],[3,3],[4,3],[4,4]]}
    ],specials:[{at:[3,3],type:'cross',target:0},{at:[3,2],type:'filter',color:'green'}],endpoints:[
      {at:[4,1],role:'start',color:'green',locked:false},{at:[2,5],role:'finish',color:'green',locked:true},
      {at:[1,3],role:'start',color:'blue',locked:false},{at:[4,4],role:'finish',color:'blue',locked:true}
    ]},
    {rows:6,cols:6,paths:[
      {color:'green',points:[[5,2],[4,2],[3,2],[2,2],[1,2],[1,1],[0,1]]},
      {color:'green',points:[[3,2],[3,3],[3,4],[2,4],[1,4],[0,4]]},
      {color:'blue',points:[[4,4],[3,4],[3,5]]}
    ],specials:[{at:[3,2],type:'tee',target:3},{at:[3,4],type:'dual',target:1},{at:[1,4],type:'filter',color:'green'}],endpoints:[
      {at:[5,2],role:'start',color:'green',locked:true},
      {at:[0,1],role:'finish',color:'green',locked:true},{at:[0,4],role:'finish',color:'green',locked:false},
      {at:[4,4],role:'start',color:'blue',locked:false},{at:[3,5],role:'finish',color:'blue',locked:true}
    ]},
    {rows:6,cols:6,paths:[
      {color:'green',points:[[5,1],[4,1],[4,2],[3,2],[2,2],[1,2],[1,1],[0,1]]},
      {color:'green',points:[[3,2],[3,3],[3,4],[2,4],[1,4],[0,4]]},
      {color:'blue',points:[[1,3],[2,3],[3,3],[4,3],[4,4],[5,4]]}
    ],specials:[{at:[3,2],type:'tee',target:3},{at:[3,3],type:'cross',target:0},{at:[1,4],type:'filter',color:'green'}],endpoints:[
      {at:[5,1],role:'start',color:'green',locked:true},
      {at:[0,1],role:'finish',color:'green',locked:true},{at:[0,4],role:'finish',color:'green',locked:false},
      {at:[1,3],role:'start',color:'blue',locked:false},{at:[5,4],role:'finish',color:'blue',locked:true}
    ]}
  ];
  const baseCampaign=STAGES.slice();
  const campaignOrder=[6,7,8,9,5,7,8,9,9,9,8,9,9,8,6,9,7,8,9,6];
  campaignOrder.forEach(source=>STAGES.push(JSON.parse(JSON.stringify(baseCampaign[source]))));
  const TEST_STAGE_COUNT=STAGES.length;
  // Keep stage order fixed during testing; only the layout inside each stage is randomized.
  const TEST_RANDOM_MODE=false;
  // Set false later to use each original stage layout as a fixed production puzzle.
  const TEST_LAYOUT_VARIANTS=true;
  const LAYOUT_VARIANTS=['identity','mirror-x','mirror-y','rotate-180'];
  const STAGE_TEMPLATES=STAGES.map(definition=>[definition]);

  // Dedicated 4×4 tutorial pools: each special rule can be tested in several genuinely different layouts.
  STAGE_TEMPLATES[3]=[
    {rows:4,cols:4,paths:[
      {color:'green',points:[[2,0],[1,0],[1,1],[1,2],[0,2]]},
      {color:'blue',points:[[0,1],[1,1],[2,1],[3,1]]}
    ],specials:[{at:[1,1],type:'cross'},{at:[2,1],type:'filter',color:'blue'}],endpoints:[
      {at:[2,0],role:'start',color:'green',locked:false},{at:[0,2],role:'finish',color:'green',locked:true},
      {at:[0,1],role:'start',color:'blue',locked:true},{at:[3,1],role:'finish',color:'blue',locked:false}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[1,0],[1,1],[1,2],[1,3]]},
      {color:'blue',points:[[0,1],[1,1],[2,1],[3,1]]}
    ],specials:[{at:[1,1],type:'cross'},{at:[1,2],type:'filter',color:'green'}],endpoints:[
      {at:[1,0],role:'start',color:'green',locked:true},{at:[1,3],role:'finish',color:'green',locked:false},
      {at:[0,1],role:'start',color:'blue',locked:false},{at:[3,1],role:'finish',color:'blue',locked:true}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[2,3],[1,3],[1,2],[1,1],[0,1]]},
      {color:'blue',points:[[0,2],[1,2],[2,2],[3,2]]}
    ],specials:[{at:[1,2],type:'cross'},{at:[2,2],type:'filter',color:'blue'}],endpoints:[
      {at:[2,3],role:'start',color:'green',locked:false},{at:[0,1],role:'finish',color:'green',locked:true},
      {at:[0,2],role:'start',color:'blue',locked:true},{at:[3,2],role:'finish',color:'blue',locked:false}
    ]}
  ];
  STAGE_TEMPLATES[4]=[
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,1],[2,1],[2,2],[1,2]]},
      {color:'blue',points:[[1,1],[2,1],[2,0]]}
    ],specials:[{at:[2,1],type:'dual'}],endpoints:[
      {at:[3,1],role:'start',color:'green',locked:false},{at:[1,2],role:'finish',color:'green',locked:true},
      {at:[1,1],role:'start',color:'blue',locked:true},{at:[2,0],role:'finish',color:'blue',locked:false}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[0,2],[1,2],[1,3],[2,3]]},
      {color:'blue',points:[[1,0],[1,1],[1,2],[2,2],[3,2]]}
    ],specials:[{at:[1,2],type:'dual'},{at:[2,2],type:'filter',color:'blue'}],endpoints:[
      {at:[0,2],role:'start',color:'green',locked:true},{at:[2,3],role:'finish',color:'green',locked:false},
      {at:[1,0],role:'start',color:'blue',locked:false},{at:[3,2],role:'finish',color:'blue',locked:true}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,2],[2,2],[2,3],[1,3]]},
      {color:'blue',points:[[1,2],[2,2],[2,1],[3,1]]}
    ],specials:[{at:[2,2],type:'dual'}],endpoints:[
      {at:[3,2],role:'start',color:'green',locked:false},{at:[1,3],role:'finish',color:'green',locked:true},
      {at:[1,2],role:'start',color:'blue',locked:true},{at:[3,1],role:'finish',color:'blue',locked:false}
    ]}
  ];
  STAGE_TEMPLATES[5]=[
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,1],[2,1],[1,1],[0,1]]},
      {color:'green',points:[[2,1],[2,2],[1,2],[0,2]]}
    ],specials:[{at:[2,1],type:'tee'},{at:[1,1],type:'filter',color:'green'}],endpoints:[
      {at:[3,1],role:'start',color:'green',locked:false},
      {at:[0,1],role:'finish',color:'green',locked:true},{at:[0,2],role:'finish',color:'green',locked:false}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,2],[2,2],[1,2],[0,2]]},
      {color:'green',points:[[1,2],[1,1],[0,1]]}
    ],specials:[{at:[1,2],type:'tee'},{at:[2,2],type:'filter',color:'green'}],endpoints:[
      {at:[3,2],role:'start',color:'green',locked:true},
      {at:[0,2],role:'finish',color:'green',locked:false},{at:[0,1],role:'finish',color:'green',locked:true}
    ]},
    {rows:4,cols:4,paths:[
      {color:'green',points:[[3,1],[2,1],[1,1],[1,0],[0,0]]},
      {color:'green',points:[[1,1],[1,2],[0,2]]}
    ],specials:[{at:[1,1],type:'tee'},{at:[2,1],type:'filter',color:'green'}],endpoints:[
      {at:[3,1],role:'start',color:'green',locked:false},
      {at:[0,0],role:'finish',color:'green',locked:true},{at:[0,2],role:'finish',color:'green',locked:false}
    ]}
  ];
  // 3×3에서도 하나의 색이 십자 지하차도의 두 독립 차선을 차례로 지나갈 수 있습니다.
  // 십자 내부에서 꺾는 것이 아니라, 바깥 타일을 통해 돌아와 다른 차선으로 진입하는 구조입니다.
  STAGE_TEMPLATES[0]=[
    STAGES[0],
    {rows:3,cols:3,paths:[
      {color:'green',points:[[1,0],[1,1],[1,2],[0,2],[0,1],[1,1],[2,1]]}
    ],specials:[{at:[1,1],type:'cross'}],endpoints:[
      {at:[1,0],role:'start',color:'green',locked:true},{at:[2,1],role:'finish',color:'green',locked:true}
    ]},
    {rows:3,cols:3,paths:[
      {color:'blue',points:[[2,0],[2,1],[1,1],[0,1],[0,2],[1,2],[1,1],[1,0]]}
    ],specials:[{at:[1,1],type:'cross'}],endpoints:[
      {at:[2,0],role:'start',color:'blue',locked:true},{at:[1,0],role:'finish',color:'blue',locked:true}
    ]}
  ];
  const lastLayoutByStage=Array(STAGES.length).fill(null);

  const STORAGE_KEY='line-puzzle-campaign-v1';
  const initialProgress=()=>({unlocked:1,current:0,results:{},solutions:{}});
  function loadProgress(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&Number.isInteger(saved.unlocked)&&saved.results)return {...initialProgress(),...saved};}catch(error){}return initialProgress();}
  function saveProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch(error){}}
  let progress=loadProgress();progress.unlocked=Math.min(TEST_STAGE_COUNT,Math.max(1,progress.unlocked));progress.current=Math.min(progress.unlocked-1,Math.max(0,progress.current));
  let game,timerId,startTimeout;
  const key=(index,direction)=>`${index}:${direction}`;
  const pointKey=([row,column])=>`${row},${column}`;
  const pad=value=>String(value).padStart(2,'0');
  const rotate=(dirs,amount)=>dirs.map(direction=>(direction+amount)%4);
  const same=(first,second)=>first.length===second.length&&first.every(value=>second.includes(value));
  const dirTo=([row,column],[nextRow,nextColumn])=>nextRow<row?UP:nextColumn>column?RIGHT:nextRow>row?DOWN:LEFT;
  const inside=(stage,row,column)=>row>=0&&row<stage.rows&&column>=0&&column<stage.cols?row*stage.cols+column:-1;

  function ports(tile){
    if(tile.type==='endpoint')return [tile.rotation];
    if(tile.type==='straight'||tile.type==='filter')return tile.rotation%2?[RIGHT,LEFT]:[UP,DOWN];
    if(tile.type==='corner')return rotate([UP,RIGHT],tile.rotation);
    if(tile.type==='tee')return rotate([LEFT,RIGHT,DOWN],tile.rotation);
    return [UP,RIGHT,DOWN,LEFT];
  }
  function targetFor(type,directions){
    if(type==='straight'||type==='filter')return same(directions,[UP,DOWN])?0:1;
    if(type==='corner')return [0,1,2,3].find(rotation=>same(rotate([UP,RIGHT],rotation),directions));
    if(type==='tee')return [0,1,2,3].find(rotation=>same(rotate([LEFT,RIGHT,DOWN],rotation),directions));
    return 0;
  }
  function exits(tile,incoming,color,ignoreTClaim=false){
    if(tile.type==='endpoint')return [];
    if(tile.type==='cross')return [OPP[incoming]];
    if(tile.type==='filter'&&tile.filterColor!==color)return [];
    if(tile.type==='dual'){
      const lanes=[rotate([UP,RIGHT],tile.rotation),rotate([LEFT,DOWN],tile.rotation)];
      const lane=lanes.find(candidate=>candidate.includes(incoming));
      return lane?lane.filter(direction=>direction!==incoming):[];
    }
    if(tile.type==='tee'&&!ignoreTClaim&&tile.claimedColor&&tile.claimedColor!==color)return [];
    return ports(tile).filter(direction=>direction!==incoming);
  }
  function neighbors(stage,index,direction,color,ignoreTClaim=false){
    const result=[],row=Math.floor(index/stage.cols),column=index%stage.cols;
    const [rowDelta,columnDelta]=DELTAS[direction],next=inside(stage,row+rowDelta,column+columnDelta);
    const nextTile=stage.tiles[next];
    if(next>=0&&ports(nextTile).includes(OPP[direction])&&(nextTile.type!=='filter'||nextTile.filterColor===color))result.push(key(next,OPP[direction]));
    exits(stage.tiles[index],direction,color,ignoreTClaim).forEach(exit=>result.push(key(index,exit)));
    return result;
  }
  // 성공 판정은 시작점에서만, 활성 색상 표시는 시작·도착 양쪽 끝점에서 탐색합니다.
  function traverseColor(stage,color,ignoreTClaim=false,fromAllEndpoints=false){
    const endpoints=stage.tiles.map((tile,index)=>tile.type==='endpoint'&&tile.color===color&&(fromAllEndpoints||tile.role==='start')?index:-1).filter(index=>index>=0);
    const visited=new Set(),queue=[];
    endpoints.forEach(index=>{const state=key(index,stage.tiles[index].rotation);visited.add(state);queue.push([index,stage.tiles[index].rotation]);});
    while(queue.length){
      const [index,direction]=queue.shift();
      neighbors(stage,index,direction,color,ignoreTClaim).forEach(next=>{
        if(!visited.has(next)){visited.add(next);queue.push(next.split(':').map(Number));}
      });
    }
    return visited;
  }
  // T교차로는 기존 색이 끊길 때만 다른 색으로 바뀝니다.
  function resolveConnections(stage){
    const raw={green:traverseColor(stage,'green',true,true),blue:traverseColor(stage,'blue',true,true)};
    stage.tiles.forEach((tile,index)=>{
      if(tile.type!=='tee')return;
      const candidates=['green','blue'].filter(color=>[...raw[color]].some(state=>Number(state.split(':')[0])===index));
      if(tile.claimedColor&&!candidates.includes(tile.claimedColor))tile.claimedColor=null;
      if(!tile.claimedColor&&candidates.length)tile.claimedColor=candidates[0];
    });
    // states는 클리어 판정용, visualStates는 양쪽 끝에서 이어진 길의 실시간 색상 표시용입니다.
    const states={green:traverseColor(stage,'green'),blue:traverseColor(stage,'blue')};
    const visualStates={green:traverseColor(stage,'green',false,true),blue:traverseColor(stage,'blue',false,true)};
    const colorsByTile=Array.from({length:stage.tiles.length},()=>new Set());
    Object.entries(visualStates).forEach(([color,portsSet])=>portsSet.forEach(state=>colorsByTile[Number(state.split(':')[0])].add(color)));
    // 시작 직후에는 끝점만 색상을 유지해, 미조작 블록이 Move를 쓴 것처럼 보이지 않게 합니다.
    if(!stage.hasPlayerMoved)colorsByTile.forEach(colors=>colors.clear());
    stage.tiles.forEach((tile,index)=>{if(tile.type==='endpoint')colorsByTile[index].add(tile.color);});
    return {states,visualStates,colorsByTile};
  }
  function isComplete(stage,connections){
    return stage.tiles.every((tile,index)=>tile.type!=='endpoint'||tile.role!=='finish'||connections.states[tile.color].has(key(index,tile.rotation)));
  }

  function transformPoint([row,column],definition,variant){
    if(variant==='mirror-x')return [row,definition.cols-1-column];
    if(variant==='mirror-y')return [definition.rows-1-row,column];
    if(variant==='rotate-180')return [definition.rows-1-row,definition.cols-1-column];
    return [row,column];
  }
  function transformedStage(definition,variant){
    if(variant==='identity')return definition;
    return {
      ...definition,
      paths:definition.paths.map(path=>({...path,points:path.points.map(point=>transformPoint(point,definition,variant))})),
      endpoints:definition.endpoints.map(endpoint=>({...endpoint,at:transformPoint(endpoint.at,definition,variant)})),
      specials:(definition.specials||[]).map(special=>({...special,at:transformPoint(special.at,definition,variant)}))
    };
  }
  function dualTargetFor(definition,at){
    const pairs=definition.paths.map(path=>{
      const position=path.points.findIndex(point=>point[0]===at[0]&&point[1]===at[1]);
      if(position<=0||position>=path.points.length-1)return null;
      return [dirTo(at,path.points[position-1]),dirTo(at,path.points[position+1])];
    }).filter(Boolean);
    for(let rotation=0;rotation<4;rotation++){
      const lanes=[rotate([UP,RIGHT],rotation),rotate([LEFT,DOWN],rotation)];
      if(pairs.every(pair=>lanes.some(lane=>same(lane,pair))))return rotation;
    }
    return 0;
  }
  function buildStage(index,variant='identity',templateIndex=0){
    const definition=transformedStage(STAGE_TEMPLATES[index][templateIndex],variant),edgeMap=new Map(),specialMap=new Map((definition.specials||[]).map(item=>[pointKey(item.at),item]));
    definition.paths.forEach(({points})=>{
      for(let step=0;step<points.length-1;step++){
        const first=pointKey(points[step]),second=pointKey(points[step+1]);
        if(!edgeMap.has(first))edgeMap.set(first,[]);if(!edgeMap.has(second))edgeMap.set(second,[]);
        edgeMap.get(first).push(dirTo(points[step],points[step+1]));edgeMap.get(second).push(dirTo(points[step+1],points[step]));
      }
    });
    const endpointMap=new Map(definition.endpoints.map(item=>[pointKey(item.at),item]));
    const tiles=Array.from({length:definition.rows*definition.cols},(_,index)=>{
      const row=Math.floor(index/definition.cols),column=index%definition.cols,point=pointKey([row,column]);
      const endpoint=endpointMap.get(point),special=specialMap.get(point),directions=edgeMap.get(point)||[];
      if(endpoint){
        const target=directions[0];return {type:'endpoint',role:endpoint.role,color:endpoint.color,locked:endpoint.locked,target,rotation:target,required:true,touched:false};
      }
      if(special){const target=special.type==='cross'?0:special.type==='tee'?targetFor('tee',directions):special.type==='filter'?targetFor('filter',directions):dualTargetFor(definition,special.at);return {type:special.type,target,rotation:target,required:true,touched:false,claimedColor:null,filterColor:special.color};}
      if(directions.length===2){
        const type=same(directions,[UP,DOWN])||same(directions,[LEFT,RIGHT])?'straight':'corner';
        const target=targetFor(type,directions);return {type,target,rotation:target,required:true,touched:false};
      }
      const type=Math.random()<.5?'straight':'corner',rotation=Math.floor(Math.random()*(type==='straight'?2:4));
      return {type,target:rotation,rotation,required:false,touched:false};
    });
    const stage={index,variant,templateIndex,rows:definition.rows,cols:definition.cols,tiles,moves:0,locked:true,animating:false,hasPlayerMoved:false};
    tiles.forEach(tile=>{
      if(tile.type==='cross')return;
      if(tile.type==='endpoint'){
        if(!tile.locked)tile.rotation=(tile.target+1+Math.floor(Math.random()*3))%4;
        return;
      }
      const span=tile.type==='straight'||tile.type==='filter'?2:4;
      if(tile.required)tile.rotation=(tile.target+1+Math.floor(Math.random()*(span-1)))%span;
    });
    tiles.forEach(tile=>{tile.origin=tile.rotation;});
    stage.perfectMoves=tiles.filter(tile=>tile.required&&tile.type!=='endpoint'&&tile.type!=='cross'&&tile.origin!==tile.target).length;
    // 생성 시 완료 상태가 되지 않도록 최소 한 개의 일반 경로 타일은 섞습니다.
    if(!stage.perfectMoves){const candidate=tiles.find(tile=>tile.required&&tile.type!=='endpoint'&&tile.type!=='cross');if(candidate){candidate.rotation=(candidate.target+1)%(candidate.type==='straight'||candidate.type==='filter'?2:4);candidate.origin=candidate.rotation;stage.perfectMoves=1;}}
    const movableCount=tiles.filter(tile=>tile.type!=='endpoint'&&tile.type!=='cross').length;
    // Perfect를 기준으로 한 번의 여유만 등급마다 주고, +3회부터는 실패가 됩니다.
    // 작은 보드에서도 모든 조작 가능 블록을 다 만지기 전에 실패하도록 상한을 둡니다.
    stage.maxMoves=Math.min(stage.perfectMoves+3,movableCount-1);
    stage.greatMoves=Math.min(stage.perfectMoves+1,stage.maxMoves);
    stage.goodMoves=Math.min(stage.perfectMoves+2,stage.maxMoves);
    if(stage.maxMoves<=stage.perfectMoves)throw new Error('Perfect 이후의 여유 Move를 만들 수 없습니다.');
    return stage;
  }
  // 아직 건드리지 않은 필수 타일 중 정답 방향과 다른 타일만 추가 Move가 필요합니다.
  // 2차선이 두 색으로 잠긴 경우에는 다른 길을 풀어 복구할 수 있으므로 이 판정만으로 실패시키지 않습니다.
  function hasNoRouteWithinMoves(stage){
    const lockedWrongDual=stage.tiles.some((tile,index)=>tile.type==='dual'&&tile.rotation!==tile.target&&stage.connections.colorsByTile[index].size>1);
    if(lockedWrongDual)return false;
    const requiredNewMoves=stage.tiles.reduce((count,tile)=>{
      if(!tile.required||tile.type==='endpoint'||tile.type==='cross'||tile.rotation===tile.target||tile.touched)return count;
      return count+1;
    },0);
    return stage.moves+requiredNewMoves>stage.maxMoves;
  }
  function chooseLayout(index){
    // Stage 1은 새 색상 필터 규칙을 확실히 체험하도록 전용 튜토리얼 배치를 사용합니다.
    if(index===0){
      const layouts=LAYOUT_VARIANTS.map(variant=>({templateIndex:0,variant,key:`0:${variant}`}));
      const candidates=layouts.filter(layout=>layout.key!==lastLayoutByStage[index]);
      return candidates[Math.floor(Math.random()*candidates.length)];
    }
    if(!TEST_LAYOUT_VARIANTS)return {templateIndex:0,variant:'identity',key:'0:identity'};
    const layouts=[];
    STAGE_TEMPLATES[index].forEach((_,templateIndex)=>LAYOUT_VARIANTS.forEach(variant=>layouts.push({templateIndex,variant,key:`${templateIndex}:${variant}`})));
    const candidates=layouts.filter(layout=>layout.key!==lastLayoutByStage[index]);
    return candidates[Math.floor(Math.random()*candidates.length)];
  }
  function createStage(index){
    const layout=chooseLayout(index);
    for(let attempt=0;attempt<80;attempt++){
      const stage=buildStage(index,layout.variant,layout.templateIndex),connections=resolveConnections(stage);
      if(isComplete(stage,connections))continue;
      if(stage.greatMoves<=stage.perfectMoves||stage.maxMoves<=stage.greatMoves)continue;
      stage.connections=connections;lastLayoutByStage[index]=layout.key;return stage;
    }
    throw new Error('유효한 테스트 스테이지를 만들지 못했습니다.');
  }

  function boardMetrics(){
    const width=Math.min(window.innerWidth-40,600),height=Math.max(180,window.innerHeight-300);
    const reference=Math.min(100,width/4,height/4),size=Math.max(28,Math.min(reference,width/game.cols,height/game.rows));
    return {width:size*game.cols,height:size*game.rows};
  }
  // 회전값과 화면 회전각을 분리합니다. 화면각은 누적해 270° → 360°도 항상 시계 방향으로 보이게 합니다.
  function angleFor(tile){return tile.type==='endpoint'?((tile.rotation-RIGHT+4)%4)*90:tile.type==='cross'?0:tile.rotation*90;}
  function displayAngle(tile){return Number.isFinite(tile.displayAngle)?tile.displayAngle:angleFor(tile);}
  function roadSvg(tile){
    let path='';
    if(tile.type==='straight')path='<path class="road-path" d="M50 -1V101"/>';
    else if(tile.type==='filter')path='<path class="road-path" d="M50 -1V101"/><circle class="filter-core" cx="50" cy="50" r="12"/>';
    else if(tile.type==='corner')path='<path class="road-path" d="M50 -1V50H101"/>';
    else if(tile.type==='tee')path='<path class="road-path" d="M-1 50H101M50 50V101"/>';
    else if(tile.type==='cross')path='<path class="road-path" d="M50 -1V101M-1 50H101"/>';
    else if(tile.type==='dual')path='<path class="road-path" d="M50 -1C50 25 75 50 101 50M-1 50C25 50 50 75 50 101"/>';
    // 시작/끝: 도로 위에 50% 크기의 흰색 사각 패널을 올리는 레이어 구조입니다.
    else path='<path class="road-path endpoint-path" d="M50 50H101"/><rect class="endpoint-core" x="25" y="25" width="50" height="50" rx="20"/>';
    return `<svg class="road-svg" viewBox="0 0 100 100" aria-hidden="true"><g class="road-shape" style="transform:rotate(${displayAngle(tile)}deg)">${path}</g></svg>`;
  }
  function dualLaneColors(tile,index,connections){
    const lanes=[rotate([UP,RIGHT],tile.rotation),rotate([LEFT,DOWN],tile.rotation)];
    return lanes.map(lane=>{
      const colors=['green','blue'].filter(color=>lane.some(direction=>connections.visualStates[color].has(key(index,direction))));
      return colors[0]||null;
    });
  }
  function dualGradientDirection(rotation){
    return ['to bottom left','to top left','to top right','to bottom right'][rotation%4];
  }
  function visualClass(tile,colors){
    if(tile.type==='endpoint')return `color-${tile.color}`;
    if(!colors.size)return tile.touched?'touched':'idle';
    // Different colors meeting on a normal road are an invalid start/end connection, not an active route.
    if(colors.size>1&&tile.type!=='cross'&&tile.type!=='dual')return 'touched';
    if((tile.type==='cross'||tile.type==='dual')&&colors.size>1)return tile.type==='dual'?'dual-mixed':'color-mixed';
    return `color-${[...colors][0]}`;
  }
  function render(){
    game.connections=resolveConnections(game);
    const metrics=boardMetrics();
    stageLabel.innerHTML=`<span class="stage-text">STAGE <span class="stage-number">${pad(game.index+1)}</span></span>`;
    restartButton.disabled=Boolean(game.viewer);
    const tileSize=metrics.width/game.cols,tileRadius=Math.round(Math.min(35,Math.max(15,tileSize*.35)));
    frame.style.width=`${metrics.width}px`;frame.style.height=`${metrics.height}px`;
    board.style.setProperty('--tile-radius',`${tileRadius}px`);
    board.style.gridTemplateColumns=`repeat(${game.cols},1fr)`;board.innerHTML='';
    game.tiles.forEach((tile,index)=>{
      const colors=game.connections.colorsByTile[index],button=document.createElement('button');
      const classes=['tile',tile.type,visualClass(tile,colors)];
      const dualLocked=tile.type==='dual'&&colors.size>1;
      if(tile.type==='endpoint')classes.push('endpoint');
      if(tile.type==='endpoint'&&tile.locked)classes.push('endpoint-locked');
      if(dualLocked)classes.push('lane-locked');
      if(!tile.locked&&tile.type!=='cross'&&!dualLocked)classes.push('rotatable');
      button.className=classes.join(' ');button.style.setProperty('--order',index);if(tile.type==='filter')button.style.setProperty('--filter-color',COLORS[tile.filterColor]);button.disabled=game.locked||tile.type==='cross';
      if(tile.type==='dual'&&colors.size>1){
        const [laneZero,laneOne]=dualLaneColors(tile,index,game.connections);
        // lane 0의 실제 통과 방향(예: 위→오른쪽)에 맞춰 대각 분할도 함께 회전합니다.
        button.style.setProperty('--dual-lane-zero',COLORS[laneZero]||COLORS.green);
        button.style.setProperty('--dual-lane-one',COLORS[laneOne]||COLORS.blue);
        button.style.setProperty('--dual-gradient-direction',dualGradientDirection(tile.rotation));
      }
      button.setAttribute('role','gridcell');button.setAttribute('aria-label',tile.type==='endpoint'?(tile.locked?'잠긴 ':'회전 가능한 ')+(tile.role==='start'?'시작점':'도착점'):tile.type==='tee'?'T교차로':tile.type==='dual'?'2차선':tile.type==='filter'?(tile.filterColor==='green'?'초록 필터':'파랑 필터'):'회전 타일');
      button.innerHTML=roadSvg(tile);
      if(tile.type==='endpoint'&&tile.locked){
        const lock=document.createElement('span');
        lock.className='endpoint-lock';lock.setAttribute('aria-hidden','true');
        // PNG는 마스크로 사용해 초록/파랑 타일 모두 해당 타일의 BG 색으로 표현합니다.
        lock.style.setProperty('--lock-color',COLORS[tile.color]);button.append(lock);
      }
      if(!button.disabled)button.addEventListener('click',()=>{
        if((tile.type==='endpoint'&&tile.locked)||dualLocked)lockedJiggle(index);
        else turn(index);
      });
      board.append(button);
    });
    renderMoveStatus();
  }
  function markerFor(){
    // 퍼펙트 제한을 초과한 순간부터는 실패 한도인 Max Moves만 안내합니다.
    return game.moves<=game.perfectMoves
      ? {name:'PERFECT MOVES',type:'perfect',limit:game.perfectMoves}
      : {name:'MAX MOVES',type:'max',limit:game.maxMoves};
  }
  function renderMoveStatus(){
    const marker=markerFor();
    moveCard.dataset.grade=marker.type;
    moveGradeLabel.textContent=marker.name;
    moveUsed.textContent=pad(game.moves);
    moveTarget.textContent=pad(marker.limit);
  }
  function lockedJiggle(index){
    if(game.locked)return;const element=board.children[index];element.classList.remove('locked-jiggle');void element.offsetWidth;element.classList.add('locked-jiggle');
  }
  function turn(index){
    if(game.locked||game.animating)return;
    const tile=game.tiles[index],isEndpoint=tile.type==='endpoint';
    if(tile.type==='cross'||(isEndpoint&&tile.locked))return;
    const currentColors=game.connections.colorsByTile[index];
    if(tile.type==='dual'&&currentColors.size>1){lockedJiggle(index);return;}
    if(!isEndpoint&&!tile.touched){if(game.moves>=game.maxMoves)return;tile.touched=true;game.moves++;}
    game.hasPlayerMoved=true;
    // 현재 화면각을 먼저 보존한 뒤 데이터 회전값을 바꿉니다.
    // 그래야 보이는 도로와 실제 연결 판정이 동일한 방향을 가리킵니다.
    const previousAngle=displayAngle(tile);
    const span=tile.type==='straight'||tile.type==='filter'?2:4;tile.rotation=(tile.rotation+1)%span;
    tile.displayAngle=previousAngle+90;
    game.animating=true;
    const element=board.children[index];element.querySelector('.road-shape').style.transform=`rotate(${tile.displayAngle}deg)`;
    setTimeout(()=>{
      game.animating=false;render();
      if(isComplete(game,game.connections))clearStage();
      else if(game.moves>=game.maxMoves)over('exhausted');
      else if(hasNoRouteWithinMoves(game))over('no-route');
    },245);
  }

  function showGame(){homeScreen.classList.remove('show');gameScreen.classList.remove('hidden');}
  function showHome(){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');startOverlay.classList.remove('show');resetModal.classList.remove('show');gameScreen.classList.add('hidden');homeScreen.classList.add('show');renderHome();requestAnimationFrame(()=>{const focus=homeStageList.querySelector('.current')||homeStageList.lastElementChild;if(focus)focus.scrollIntoView({block:'center'});});}
  function renderHome(){homeStageList.innerHTML='';for(let index=0;index<TEST_STAGE_COUNT;index++){const result=progress.results[index];const status=result==='Perfect'?'perfect':result?'clear':index===progress.current?'current':'locked';const button=document.createElement('button');button.type='button';button.className=`home-stage ${status}`;button.disabled=status==='locked';const number=pad(index+1);button.innerHTML=`<span>STAGE ${number}</span>${status==='perfect'?'<strong>PERFECT CLEAR!</strong>':status==='clear'?'<strong>CLEAR!</strong>':''}`;if(status==='perfect')button.addEventListener('click',()=>begin(index,{viewer:true}));else if(status==='clear'||status==='current')button.addEventListener('click',()=>begin(index));homeStageList.append(button);}}
  function begin(index,{viewer=false}={}){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');showGame();game=createStage(index,viewer?progress.solutions[index]:null);game.viewer=viewer;if(viewer){game.tiles.forEach(tile=>{tile.rotation=tile.target;tile.displayAngle=undefined;});game.hasPlayerMoved=true;game.locked=true;render();return;}if(!progress.results[index])progress.current=index;saveProgress();startOverlay.innerHTML='<span>PERFECT MOVES</span><strong>'+pad(game.perfectMoves)+'</strong>';render();startOverlay.classList.remove('show');void startOverlay.offsetWidth;startOverlay.classList.add('show');startTimeout=setTimeout(()=>{startOverlay.classList.remove('show');game.locked=false;render();},1000);}
  function clearGrade(){return game.moves<=game.perfectMoves?'Perfect':'Clear';}
  function clearStage(){game.locked=true;game.grade=clearGrade();progress.solutions[game.index]={templateIndex:game.templateIndex,variant:game.variant};progress.results[game.index]=game.grade==='Perfect'?'Perfect':(progress.results[game.index]||'Clear');if(game.grade==='Perfect')progress.results[game.index]='Perfect';progress.unlocked=Math.min(TEST_STAGE_COUNT,Math.max(progress.unlocked,game.index+2));progress.current=Math.min(TEST_STAGE_COUNT-1,game.index+1);saveProgress();clearInterval(timerId);render();[...board.children].forEach(tile=>tile.classList.add('clear-pop'));setTimeout(()=>showModal(true),420);}
  function over(reason){game.locked=true;clearInterval(timerId);showModal(false,reason);}
  function showModal(cleared,reason){
    if(cleared){const labels={Perfect:'PERFECT!',Clear:'CLEAR!'};modalKicker.textContent=game.grade.toUpperCase();modalTitle.textContent=labels[game.grade];modalText.textContent=`${pad(game.moves)} Moves · Perfect ${pad(game.perfectMoves)} Moves`;}
    else{modalKicker.textContent='TRY AGAIN';modalTitle.textContent='GAME OVER';modalText.textContent=reason==='no-route'?'남은 Move로 길을 완성할 수 없어요.':reason==='exhausted'?'Move limit reached.':'Try a different route.';}
    const nextIndex=Math.min(game.index+1,TEST_STAGE_COUNT-1);
    modalButton.textContent=cleared?(game.index===TEST_STAGE_COUNT-1?'HOME':'NEXT STAGE'):'RESTART';
    modalButton.onclick=()=>cleared&&game.index===TEST_STAGE_COUNT-1?showHome():begin(cleared?nextIndex:game.index);modal.classList.add('show');
  }
  homeButton.addEventListener('click',showHome);
  resetProgressButton.addEventListener('click',()=>resetModal.classList.add('show'));
  resetNoButton.addEventListener('click',()=>resetModal.classList.remove('show'));
  resetYesButton.addEventListener('click',()=>{progress=initialProgress();try{localStorage.removeItem(STORAGE_KEY);}catch(error){}saveProgress();resetModal.classList.remove('show');renderHome();});
  restartButton.addEventListener('click',()=>{if(game&&!game.viewer)begin(game.index);});
  window.addEventListener('resize',()=>{if(game&&!homeScreen.classList.contains('show'))render();});
  begin(progress.current);
})();
