(() => {
  'use strict';
  const UP=0, RIGHT=1, DOWN=2, LEFT=3;
  const DELTAS=[[-1,0],[0,1],[1,0],[0,-1]], OPP=[DOWN,LEFT,UP,RIGHT];
  const $=(s)=>document.querySelector(s);
  const board=$('#board'), frame=$('#boardFrame'), stageLabel=$('#stageLabel'), gauge=$('#moveGauge');
  const timeValue=$('#timeValue'), startOverlay=$('#startOverlay');
  const modal=$('#modal'), modalTitle=$('#modalTitle'), modalKicker=$('#modalKicker'), modalText=$('#modalText'), modalButton=$('#modalButton');
  const STAGES=[
    {size:[3,3],path:[[0,0],[0,1],[1,1],[1,2],[2,2]]},
    {size:[3,4],path:[[0,0],[1,0],[1,1],[0,1],[0,2],[0,3],[1,3],[2,3]]},
    {size:[4,4],path:[[0,0],[0,1],[0,2],[1,2],[2,2],[2,1],[3,1],[3,2],[3,3]]},
    {size:[4,6],path:[[0,0],[1,0],[2,0],[2,1],[1,1],[1,2],[1,3],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5]]},
    {size:[5,5],advanced:true},
    {size:[4,6],advanced:true},
    {size:[5,5],advanced:true},
    {size:[5,6],advanced:true},
    {size:[6,6],advanced:true},
    {size:[6,8],advanced:true}
  ];
  // 초반에는 고정 통과 블록을 익히고, 후반에는 두 개가 동시에 경로를 강제합니다.
  // 1~6만 활성화한 테스트 캠페인입니다. 7~10 데이터는 이후 확장을 위해 보존합니다.
  const TEST_STAGE_COUNT=Math.min(6,STAGES.length);
  const MIN_PERFECT_BY_STAGE=[2,3,3,5,7,8,9,11,14,18];
  const ADVANCED_ROUTE_SHARE=.6;

  let game, timerId, startTimeout;
  const key=(i,d)=>`${i}:${d}`;
  const pointKey=([r,c])=>`${r},${c}`;
  const rotate=(dirs,n)=>dirs.map(d=>(d+n)%4);
  const same=(a,b)=>a.length===b.length&&a.every(v=>b.includes(v));
  const dirTo=([r,c],[nr,nc])=>nr<r?UP:nc>c?RIGHT:nr>r?DOWN:LEFT;
  const pad=(value)=>String(value).padStart(2,'0');

  function ports(tile){
    if(tile.type==='cross') return [UP,RIGHT,DOWN,LEFT];
    if(tile.type==='endpoint') return [tile.fixed];
    if(tile.type==='straight') return tile.rotation%2?[RIGHT,LEFT]:[UP,DOWN];
    return rotate([UP,RIGHT],tile.rotation);
  }
  function kind(dirs){return same(dirs,[UP,DOWN])||same(dirs,[RIGHT,LEFT])?'straight':'corner';}
  function targetFor(type,dirs){
    if(type==='straight') return same(dirs,[UP,DOWN])?0:1;
    return [0,1,2,3].find(turn=>same(rotate([UP,RIGHT],turn),dirs));
  }
  function inside(stage,r,c){return r>=0&&r<stage.rows&&c>=0&&c<stage.cols?r*stage.cols+c:-1;}
  function shuffle(values){
    for(let index=values.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[values[index],values[swap]]=[values[swap],values[index]];}
    return values;
  }
  function routeStats(path){
    let turns=0,longestStraight=1,streak=1,lastDirection=null;
    for(let index=1;index<path.length;index++){
      const direction=dirTo(path[index-1],path[index]);
      if(direction===lastDirection)streak++;
      else if(lastDirection!==null){turns++;streak=1;}
      longestStraight=Math.max(longestStraight,streak);lastDirection=direction;
    }
    return {turns,longestStraight,cornerRatio:turns/Math.max(1,path.length-2)};
  }
  // 후반 해법은 보드를 충분히 사용하되, 한 방향으로 길게 왕복하는 뱀 형태는 만들지 않습니다.
  function makeWindingRoute(rows,cols,index){
    const total=rows*cols,targetLength=Math.ceil(total*(index>=8?.8:.76));
    const maxStraight=index>=8?3:2,minCornerRatio=index>=7?.38:.33;
    const inner=Array.from({length:total},(_,cell)=>cell).filter(cell=>{
      const row=Math.floor(cell/cols),column=cell%cols;return row>0&&row<rows-1&&column>0&&column<cols-1;
    });
    for(let attempt=0;attempt<160;attempt++){
      const startPool=inner.length&&Math.random()<.8?inner:Array.from({length:total},(_,cell)=>cell);
      const start=startPool[Math.floor(Math.random()*startPool.length)],path=[[Math.floor(start/cols),start%cols]],used=new Set([start]);
      let searched=0;
      const extend=(lastDirection,streak,turns)=>{
        if(path.length===targetLength)return turns>=Math.ceil((targetLength-2)*minCornerRatio);
        if(++searched>18000)return false;
        const [row,column]=path[path.length-1],candidates=[];
        DELTAS.forEach(([rowDelta,columnDelta],direction)=>{
          const nextRow=row+rowDelta,nextColumn=column+columnDelta,next=nextRow*cols+nextColumn;
          if(nextRow<0||nextRow>=rows||nextColumn<0||nextColumn>=cols||used.has(next))return;
          const nextStreak=direction===lastDirection?streak+1:1;if(nextStreak>maxStraight)return;
          let exits=0;DELTAS.forEach(([nearRow,nearColumn])=>{const candidateRow=nextRow+nearRow,candidateColumn=nextColumn+nearColumn,candidate=candidateRow*cols+candidateColumn;if(candidateRow>=0&&candidateRow<rows&&candidateColumn>=0&&candidateColumn<cols&&!used.has(candidate))exits++;});
          if(path.length<targetLength-1&&!exits)return;
          // 방향을 꺾을 수 있는 후보를 조금 우선하되, 항상 무작위성을 남겨 둡니다.
          const turnsNext=turns+(lastDirection!==null&&direction!==lastDirection?1:0),turnRatio=turns/Math.max(1,path.length-2),turnBias=direction!==lastDirection?(turnRatio<.48?.16:-.18):0;
          candidates.push({next,nextRow,nextColumn,direction,nextStreak,turns:turnsNext,score:Math.random()+turnBias+Math.min(exits,3)*.08});
        });
        candidates.sort((first,second)=>second.score-first.score);
        for(const candidate of candidates){
          used.add(candidate.next);path.push([candidate.nextRow,candidate.nextColumn]);
          if(extend(candidate.direction,candidate.nextStreak,candidate.turns))return true;
          path.pop();used.delete(candidate.next);
        }
        return false;
      };
      if(extend(null,0,0)){
        const stats=routeStats(path);
        if(stats.longestStraight<=maxStraight&&stats.cornerRatio>=minCornerRatio&&stats.cornerRatio<=.64)return {path,stats};
      }
    }
    return null;
  }
  function advancedDefinition(template,index){
    const [rows,cols]=template.size;
    for(let attempt=0;attempt<40;attempt++){
      const route=makeWindingRoute(rows,cols,index);if(!route)continue;
      const straightTiles=[];
      for(let point=1;point<route.path.length-1;point++){
        if(dirTo(route.path[point-1],route.path[point])===dirTo(route.path[point],route.path[point+1]))straightTiles.push(route.path[point]);
      }
      // 십자 지하차도는 실제 경로가 곧게 통과하는 칸에만 둡니다.
      if(index>=5&&!straightTiles.length)continue;
      return {size:[rows,cols],path:route.path,cross:index>=5?[straightTiles[Math.floor(Math.random()*straightTiles.length)]]:[],routeStats:route.stats};
    }
    return null;
  }

  // 같은 단계에서도 대칭·전치·역순 변형으로 다른 퍼즐을 만듭니다.
  function randomVariant(template){
    const transposed=Math.random()<.5;
    let [rows,cols]=template.size;if(transposed)[rows,cols]=[cols,rows];
    const flipV=Math.random()<.5,flipH=Math.random()<.5;
    const transform=([sourceR,sourceC])=>{
      let r=sourceR,c=sourceC;if(transposed)[r,c]=[c,r];
      if(flipV)r=rows-1-r;if(flipH)c=cols-1-c;return [r,c];
    };
    const path=template.path.map(transform);if(Math.random()<.5)path.reverse();
    return {size:[rows,cols],path,cross:(template.cross||[]).map(transform)};
  }

  // 변형된 경로 중간을 잘라 시작점과 도착점도 보드 내부에 자연스럽게 배치합니다.
  function randomEndpointRoute(def,index){
    const fullPath=def.path,minimumRouteTiles=index>=4?Math.ceil(def.size[0]*def.size[1]*ADVANCED_ROUTE_SHARE):0,minimumSpan=Math.min(fullPath.length-1,Math.max(4,minimumRouteTiles-1,Math.ceil(fullPath.length*(index<3?.5:.62))));
    const allIndexes=fullPath.map((_,i)=>i);
    const innerIndexes=allIndexes.filter(i=>{const [r,c]=fullPath[i];return r>0&&r<def.size[0]-1&&c>0&&c<def.size[1]-1;});
    const startPool=innerIndexes.length?innerIndexes:allIndexes;
    for(let attempt=0;attempt<40;attempt++){
      const start=startPool[Math.floor(Math.random()*startPool.length)];
      const endPool=allIndexes.filter(end=>Math.abs(end-start)>=minimumSpan);
      if(!endPool.length)continue;
      const end=endPool[Math.floor(Math.random()*endPool.length)];
      const path=start<end?fullPath.slice(start,end+1):fullPath.slice(end,start+1).reverse();
      return {...def,path};
    }
    return def;
  }

  // 시작·도착점은 첫 화면에서 인접 타일과 바로 이어지지 않도록 생성합니다.
  function hasInitialEndpointConnection(stage){
    return stage.tiles.some((tile,index)=>{
      if(!tile.endpoint)return false;
      const row=Math.floor(index/stage.cols),column=index%stage.cols;
      return ports(tile).some(direction=>{
        const next=inside(stage,row+DELTAS[direction][0],column+DELTAS[direction][1]);
        return next>=0&&ports(stage.tiles[next]).includes(OPP[direction]);
      });
    });
  }

  function buildStage(index){
    const def=index>=4?advancedDefinition(STAGES[index],index):randomEndpointRoute(randomVariant(STAGES[index]),index);
    if(!def)return null;
    const [rows,cols]=def.size,pathMap=new Map(def.path.map((point,i)=>[pointKey(point),i]));
    const crosses=new Set((def.cross||[]).map(pointKey));
    const tiles=Array.from({length:rows*cols},(_,i)=>{
      const r=Math.floor(i/cols),c=i%cols,pathIndex=pathMap.get(`${r},${c}`);
      if(pathIndex!==undefined){
        const directions=[];
        if(pathIndex>0)directions.push(dirTo([r,c],def.path[pathIndex-1]));
        if(pathIndex<def.path.length-1)directions.push(dirTo([r,c],def.path[pathIndex+1]));
        if(pathIndex===0||pathIndex===def.path.length-1)return {type:'endpoint',endpoint:pathIndex===0?'start':'finish',fixed:directions[0],rotation:0,target:0,required:true};
        if(crosses.has(`${r},${c}`))return {type:'cross',rotation:0,target:0,required:true};
        const type=kind(directions),target=targetFor(type,directions);return {type,rotation:target,target,required:true};
      }
      const pick=(i*7+index*3)%11,type=index>=5&&pick===0?'cross':pick%2?'corner':'straight';
      return {type,rotation:0,target:0,required:false};
    });
    const stage={index,rows,cols,tiles,moves:0,maxMoves:0,perfectMoves:0,greatMoves:0,goodMoves:0,elapsed:0,locked:true,animating:false,routeStats:def.routeStats};
    tiles.forEach(tile=>{
      if(tile.endpoint||tile.type==='cross')return;
      const span=tile.type==='straight'?2:4;
      tile.rotation=(tile.target+1+Math.floor(Math.random()*(span-1)))%span;
    });
    tiles.forEach(tile=>{tile.origin=tile.rotation;tile.angle=tile.rotation;tile.touched=false;});
    return stage;
  }

  function createStage(index){
    // 고정·막힌 블록 배치와 난이도 조건을 모두 만족하는 랜덤 변형만 채택합니다.
    for(let attempt=0;attempt<600;attempt++){
      const stage=buildStage(index);
      if(!stage)continue;
      if(hasInitialEndpointConnection(stage)||isConnected(stage)||!validateSolution(stage))continue;
      stage.perfectMoves=minimumAdditionalMoves(stage);
      const movableCount=stage.tiles.filter(tile=>!tile.endpoint&&tile.type!=='cross').length;
      const routeShare=index>=4?Math.ceil(movableCount*ADVANCED_ROUTE_SHARE):0;
      if(!Number.isFinite(stage.perfectMoves)||stage.perfectMoves<MIN_PERFECT_BY_STAGE[index]||stage.perfectMoves<routeShare)continue;
      // Perfect는 실제 최적해이며, 최대 Move는 항상 전체 회전 가능 블록 수보다 작게 제한합니다.
      const gradeGrace=Math.max(2,Math.ceil(stage.perfectMoves*.25));
      // 막힌 블록도 조작 가능한 타일 수와 무브 상한에서 제외합니다.
      const moveCeiling=movableCount-1;
      // 모든 조작 타일을 쓰기 전에 Great와 Clear 선택지가 남도록 보장합니다.
      if(moveCeiling<=stage.perfectMoves+1)continue;
      stage.greatMoves=Math.min(stage.perfectMoves+gradeGrace,moveCeiling-1);
      stage.greatMoves=Math.max(stage.perfectMoves+1,stage.greatMoves);
      stage.goodMoves=Math.min(stage.greatMoves+gradeGrace,moveCeiling);
      stage.maxMoves=stage.goodMoves;
      // Perfect 이외에도 Great와 Clear 성공 구간이 반드시 존재하는 스테이지만 채택합니다.
      if(stage.greatMoves<=stage.perfectMoves||stage.maxMoves<=stage.greatMoves)continue;
      return stage;
    }
    throw new Error('유효한 랜덤 스테이지를 만들지 못했습니다.');
  }

  function validateSolution(stage){
    const prior=stage.tiles.map(tile=>tile.rotation);
    stage.tiles.forEach(tile=>{if(!tile.endpoint&&tile.type!=='cross')tile.rotation=tile.target;});
    const valid=isConnected(stage);stage.tiles.forEach((tile,i)=>tile.rotation=prior[i]);return valid;
  }

  // 이미 건드린 블록은 무료 회전, 처음 건드릴 블록은 Move 1을 사용한다고 보고 최소 Move를 계산합니다.
  // 첫 터치만 Move를 쓰므로, 목표 방향이 현재 상태와 다를 때만 추가 Move가 필요합니다.
  function additionalMoveCost(tile,incoming,outgoing){
    if(tile.type==='cross')return outgoing===OPP[incoming]?0:Infinity;
    if(tile.type==='straight'&&outgoing!==OPP[incoming])return Infinity;
    if(tile.type==='corner'&&outgoing===OPP[incoming])return Infinity;
    const desired=targetFor(tile.type,[incoming,outgoing]);
    return tile.touched||desired===tile.rotation?0:1;
  }
  function minimumAdditionalMoves(stage){
    const start=stage.tiles.findIndex(tile=>tile.endpoint==='start'),finish=stage.tiles.findIndex(tile=>tile.endpoint==='finish');
    const startTile=stage.tiles[start],finishTile=stage.tiles[finish];
    const startRow=Math.floor(start/stage.cols),startCol=start%stage.cols,[rowDelta,columnDelta]=DELTAS[startTile.fixed];
    const first=inside(stage,startRow+rowDelta,startCol+columnDelta);if(first<0)return Infinity;
    const initialKey=`${first}:${OPP[startTile.fixed]}`,queue=[{index:first,incoming:OPP[startTile.fixed],cost:0}],best=new Map([[initialKey,0]]);
    while(queue.length){
      queue.sort((firstState,secondState)=>firstState.cost-secondState.cost);const current=queue.shift(),stateKey=`${current.index}:${current.incoming}`;
      if(current.cost!==best.get(stateKey))continue;
      const tile=stage.tiles[current.index];
      if(current.index===finish){if(current.incoming===finishTile.fixed)return current.cost;continue;}
      if(tile.endpoint)continue;
      for(let outgoing=0;outgoing<4;outgoing++){
        if(outgoing===current.incoming)continue;
        const cost=additionalMoveCost(tile,current.incoming,outgoing);if(!Number.isFinite(cost))continue;
        const row=Math.floor(current.index/stage.cols),column=current.index%stage.cols;
        const next=inside(stage,row+DELTAS[outgoing][0],column+DELTAS[outgoing][1]);if(next<0)continue;
        const nextIncoming=OPP[outgoing],nextTile=stage.tiles[next];
        if(nextTile.endpoint&&!(nextTile.endpoint==='finish'&&nextIncoming===nextTile.fixed))continue;
        const nextCost=current.cost+cost,nextKey=`${next}:${nextIncoming}`;
        if(nextCost<(best.get(nextKey)??Infinity)){best.set(nextKey,nextCost);queue.push({index:next,incoming:nextIncoming,cost:nextCost});}
      }
    }
    return Infinity;
  }

  // 십자 지하차도는 진입한 방향의 반대편으로만 통과합니다.
  function exits(tile,incoming){return tile.type==='cross'?[OPP[incoming]]:ports(tile).filter(port=>port!==incoming);}
  function neighbors(stage,index,dir){
    const result=[],r=Math.floor(index/stage.cols),c=index%stage.cols,[dr,dc]=DELTAS[dir],next=inside(stage,r+dr,c+dc);
    if(next>=0&&ports(stage.tiles[next]).includes(OPP[dir]))result.push(key(next,OPP[dir]));
    exits(stage.tiles[index],dir).forEach(exit=>result.push(key(index,exit)));return result;
  }
  function traverse(stage,name){
    const endpoint=stage.tiles.findIndex(tile=>tile.endpoint===name),direction=stage.tiles[endpoint].fixed;
    const visited=new Set([key(endpoint,direction)]),queue=[[endpoint,direction]];
    while(queue.length){const [index,dir]=queue.shift();neighbors(stage,index,dir).forEach(next=>{if(!visited.has(next)){visited.add(next);queue.push(next.split(':').map(Number));}});}
    return visited;
  }
  function isConnected(stage){
    const finish=stage.tiles.findIndex(tile=>tile.endpoint==='finish');
    return traverse(stage,'start').has(key(finish,stage.tiles[finish].fixed));
  }
  function activeTiles(stage){const portsSet=new Set([...traverse(stage,'start'),...traverse(stage,'finish')]),tiles=new Set();portsSet.forEach(port=>tiles.add(Number(port.split(':')[0])));return tiles;}

  function boardMetrics(){
    const width=Math.min(window.innerWidth-40,600),height=Math.max(180,window.innerHeight-300);
    // 현재 화면에서 4×4가 가질 수 있는 타일 크기를 기준값으로 삼고, 큰 보드만 추가 축소합니다.
    const referenceTile=Math.min(100,width/4,height/4);
    const tileSize=Math.max(28,Math.min(referenceTile,width/game.cols,height/game.rows));
    return {tileSize,width:tileSize*game.cols,height:tileSize*game.rows};
  }
  function roadSvg(tile,angle){
    let path='';
    if(tile.type==='straight')path='<path class="road-path" d="M50 -1V101"/>';
    else if(tile.type==='corner')path='<path class="road-path" d="M50 -1V50H101"/>';
    else if(tile.type==='cross')path='<path class="road-path" d="M50 -1V101M-1 50H101"/>';
    else path='<path class="road-path endpoint-path" d="M101 50H56"/>';
    return `<svg class="road-svg" viewBox="0 0 100 100" aria-hidden="true"><g class="road-shape" style="transform:rotate(${angle}deg)">${path}</g></svg>`;
  }
  function render(){
    const metrics=boardMetrics(),active=activeTiles(game);
    stageLabel.textContent=`STAGE ${pad(game.index+1)}/${pad(TEST_STAGE_COUNT)}`;
    frame.style.width=`${metrics.width}px`;frame.style.height=`${metrics.height}px`;
    board.style.gridTemplateColumns=`repeat(${game.cols},1fr)`;board.innerHTML='';
    game.tiles.forEach((tile,index)=>{
      const button=document.createElement('button'),classes=['tile',tile.type];
      if(tile.endpoint)classes.push('endpoint');else if(tile.touched)classes.push('touched');
      if(active.has(index))classes.push('active');if(!tile.endpoint&&tile.type!=='cross')classes.push('rotatable');
      button.className=classes.join(' ');button.style.setProperty('--order',index);button.disabled=game.locked||tile.type==='cross';button.setAttribute('role','gridcell');button.setAttribute('aria-label',tile.endpoint?(tile.endpoint==='start'?'시작점, 고정 블록':'도착점, 고정 블록'):tile.type==='cross'?'십자 지하차도':'회전 타일');
      const angle=tile.type==='endpoint'?((tile.fixed-RIGHT+4)%4)*90:tile.type==='cross'?0:tile.angle*90;
      button.innerHTML=roadSvg(tile,angle);if(!button.disabled)button.addEventListener('click',()=>tile.endpoint?lockedJiggle(index):turn(index));board.append(button);
    });
    renderGauge();
  }
  function markerFor(){
    // 현재 도전 가능한 등급과 그 등급의 정확한 목표 Move를 게이지에 표시합니다.
    if(game.moves<=game.perfectMoves)return {name:`PERFECT ${pad(game.perfectMoves)}`,type:'perfect',limit:game.perfectMoves};
    if(game.moves<=game.greatMoves)return {name:`GREAT ${pad(game.greatMoves)}`,type:'great',limit:game.greatMoves};
    return {name:`CLEAR ${pad(game.goodMoves)}`,type:'clear',limit:game.goodMoves};
  }
  function renderGauge(){
    const marker=markerFor(),segments=Array.from({length:game.maxMoves},(_,index)=>`<span class="gauge-segment ${index<game.moves?'filled':''}"></span>`).join('');
    const left=Math.min(96,Math.max(4,marker.limit/game.maxMoves*100));
    gauge.innerHTML=`<p class="move-counter"><span class="used">${pad(game.moves)}</span><span class="slash">/</span><span class="total">${pad(game.maxMoves)}</span></p><div class="gauge-track"><div class="gauge-segments" style="--segments:${game.maxMoves}">${segments}</div><div class="gauge-marker ${marker.type}" style="left:${left}%"><span>${marker.name}</span></div></div>`;
  }
  function paintActive(){
    const active=activeTiles(game);[...board.children].forEach((element,index)=>element.classList.toggle('active',active.has(index)));
  }

  // 고정된 시작·도착점은 회전하지 않고, 잠긴 문처럼 짧게 덜컥거리는 피드백만 제공합니다.
  function lockedJiggle(index){
    if(game.locked)return;const tile=board.children[index];tile.classList.remove('locked-jiggle');void tile.offsetWidth;tile.classList.add('locked-jiggle');
  }

  function turn(index){
    if(game.locked||game.animating)return;const tile=game.tiles[index];if(tile.endpoint||tile.type==='cross')return;
    if(!tile.touched){if(game.moves>=game.maxMoves)return;tile.touched=true;game.moves++;}
    const span=tile.type==='straight'?2:4;tile.rotation=(tile.rotation+1)%span;tile.angle+=1;game.animating=true;
    const element=board.children[index];element.classList.remove('idle');element.classList.add('touched');element.querySelector('.road-shape').style.transform=`rotate(${tile.angle*90}deg)`;
    paintActive();renderGauge();
    setTimeout(()=>{
      game.animating=false;
      // 마지막 Move로 연결되면 성공을 우선하고, 연결되지 않았다면 즉시 실패합니다.
      if(isConnected(game))clearStage();
      else if(game.moves>=game.maxMoves)over('exhausted');
      else if(minimumAdditionalMoves(game)>game.maxMoves-game.moves)over('impossible');
      else render();
    },245);
  }

  function begin(index){
    clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');game=createStage(index);timeValue.textContent='00:00';startOverlay.innerHTML='<span>PERFECT MOVES</span><strong>'+pad(game.perfectMoves)+'</strong>';render();
    startOverlay.classList.remove('show');void startOverlay.offsetWidth;startOverlay.classList.add('show');
    startTimeout=setTimeout(()=>{startOverlay.classList.remove('show');game.locked=false;startTimer();render();},1000);
  }
  function startTimer(){const started=Date.now()-game.elapsed*1000;timerId=setInterval(()=>{game.elapsed=Math.floor((Date.now()-started)/1000);timeValue.textContent=formatTime(game.elapsed);},250);}
  function formatTime(seconds){return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`;}
  function clearGrade(){return game.moves<=game.perfectMoves?'Perfect':game.moves<=game.greatMoves?'Great':'Clear';}
  function clearStage(){game.locked=true;game.grade=clearGrade();clearInterval(timerId);render();[...board.children].forEach(tile=>tile.classList.add('clear-pop'));setTimeout(()=>showModal(true),420);}
  function over(reason){game.locked=true;clearInterval(timerId);showModal(false,reason);}
  function showModal(cleared,reason){
    if(cleared){const labels={Perfect:'PERFECT!',Great:'GREAT!',Clear:'CLEAR!'};modalKicker.textContent=game.grade.toUpperCase();modalTitle.textContent=labels[game.grade];modalText.textContent=`${pad(game.moves)} Moves · Perfect ${pad(game.perfectMoves)} Moves`;}
    else{modalKicker.textContent='TRY AGAIN';modalTitle.textContent='실패!';modalText.textContent=reason==='impossible'?'남은 Move로 선을 이을 수 없어요.':'Move를 모두 사용했어요.';}
    modalButton.textContent=cleared?(game.index===TEST_STAGE_COUNT-1?'PLAY AGAIN':'NEXT STAGE'):'RESTART';modalButton.onclick=()=>begin(cleared?(game.index+1)%TEST_STAGE_COUNT:game.index);modal.classList.add('show');
  }
  window.addEventListener('resize',()=>{if(game)render();});
  begin(0);
})();









