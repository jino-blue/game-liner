(() => {
  'use strict';

  const UP=0, RIGHT=1, DOWN=2, LEFT=3;
  const DELTAS=[[-1,0],[0,1],[1,0],[0,-1]], OPP=[DOWN,LEFT,UP,RIGHT];
  const COLORS={green:'#79bd74',blue:'#7597bb',red:'#d76767',mixed:'#84796e'};
  const PATH_COLORS=['green','blue','red'];
  const $=selector=>document.querySelector(selector);
  const board=$('#board'),frame=$('#boardFrame'),stageLabel=$('#stageLabel'),homeButton=$('#homeButton'),gameScreen=$('#gameScreen'),homeScreen=$('#homeScreen'),homeStageList=$('#homeStageList'),resetProgressButton=$('#resetProgressButton'),resetModal=$('#resetModal'),resetNoButton=$('#resetNoButton'),resetYesButton=$('#resetYesButton'),adminModeButton=$('#adminModeButton');
  const moveCard=$('#moveCard'),moveGradeLabel=$('#moveGradeLabel'),moveUsed=$('#moveUsed'),moveTarget=$('#moveTarget');
  const startOverlay=$('#startOverlay'),restartButton=$('#restartButton');  const modal=$('#modal'),modalTitle=$('#modalTitle'),modalKicker=$('#modalKicker'),modalStars=$('#modalStars'),modalText=$('#modalText'),modalButton=$('#modalButton');
  const episodeTitle=$('#episodeTitle'),episodeSubtitle=$('#episodeSubtitle'),episodePrevButton=$('#episodePrevButton'),episodeNextButton=$('#episodeNextButton');
  const designScreen=$('#designScreen'),designTestButton=$('#designTestButton'),designBackButton=$('#designBackButton');
  const designContent=$('#designContent');
  const stageTestScreen=$('#stageTestScreen'),stageTestButton=$('#stageTestButton'),stageTestBackButton=$('#stageTestBackButton'),stageTestContent=$('#stageTestContent');

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
  // Stage 11~30: compact branching puzzles. No long straight-line labor.
  const copyStage=stage=>JSON.parse(JSON.stringify(stage));
  const baseCampaign=STAGES.slice();
  const makeCompactBranch=(color,finishCount,filterCount=0)=>{
    const rows=4,cols=6,spineRow=2,start=[3,0],columns=Array.from({length:finishCount},(_,index)=>index+1),trunk=[start,[spineRow,0]];
    const paths=columns.map(column=>{const spine=Array.from({length:column},(_,offset)=>[spineRow,offset+1]);return {color,points:[...trunk,...spine,[1,column],[0,column]]};});
    const specials=columns.slice(0,-1).map(column=>({at:[spineRow,column],type:'tee'}));
    for(let index=0;index<Math.min(filterCount,columns.length);index++)specials.push({at:[1,columns[index]],type:'filter',color});
    return {rows,cols,paths,specials,endpoints:[{at:start,role:'start',color,locked:true},...columns.map(column=>({at:[0,column],role:'finish',color,locked:column%2===0}))]};
  };
  // Three-color layouts are deliberately compact: the challenge comes from choosing
  // which colored route claims each junction, never from a long snake of straights.
  const makeTriCross=(colors=['green','blue','red'])=>{
    const [primary,secondary,tertiary]=colors;
    // Three full routes: the primary route crosses twice and reaches the far
    // corner; no color is allowed to end as a three-tile filler line.
    return {rows:6,cols:6,paths:[
      {color:primary,points:[[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[3,5],[4,5],[5,5]]},
      {color:secondary,points:[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]]},
      {color:secondary,points:[[3,3],[3,4],[4,4],[5,4]]},
      {color:tertiary,points:[[4,0],[4,1],[4,2],[3,2],[2,2],[1,2],[0,2]]}
    ],specials:[{at:[2,2],type:'cross'},{at:[2,3],type:'cross'},{at:[3,3],type:'tee'}],endpoints:[
      {at:[0,0],role:'start',color:primary},{at:[5,5],role:'finish',color:primary},
      {at:[0,3],role:'start',color:secondary},{at:[5,3],role:'finish',color:secondary},{at:[5,4],role:'finish',color:secondary},
      {at:[4,0],role:'start',color:tertiary},{at:[0,2],role:'finish',color:tertiary}
    ]};
  };  const makeTriDual=(colors=['green','blue','red'])=>{
    const [primary,secondary,tertiary]=colors;
    // The dual tile carries two main routes while the third color takes its own
    // seven-tile crossing route; no short straight-line filler is left behind.
    return {rows:6,cols:6,paths:[
      {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
      {color:primary,points:[[1,3],[1,4],[0,4]]},
      {color:secondary,points:[[0,5],[1,5],[2,5],[3,5],[3,4],[3,3],[4,3],[5,3]]},
      {color:tertiary,points:[[0,0],[1,0],[2,0],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4]]}
    ],specials:[{at:[3,3],type:'dual'},{at:[2,3],type:'cross'},{at:[1,3],type:'tee'}],endpoints:[
      {at:[5,0],role:'start',color:primary},{at:[0,3],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
      {at:[0,5],role:'start',color:secondary},{at:[5,3],role:'finish',color:secondary},
      {at:[0,0],role:'start',color:tertiary},{at:[2,4],role:'finish',color:tertiary}
    ]};
  };  const makeTriBranch=(colors=['green','blue','red'])=>{
    const [primary,secondary,tertiary]=colors;
    return {rows:5,cols:7,paths:[
      {color:primary,points:[[4,0],[3,0],[2,0],[2,1],[1,1],[0,1]]},
      {color:primary,points:[[2,1],[2,2],[2,3],[1,3],[0,3]]},
      {color:primary,points:[[2,3],[2,4],[1,4],[0,4]]},
      {color:secondary,points:[[0,5],[1,5],[2,5],[3,5],[4,5]]},
      {color:tertiary,points:[[3,1],[3,2],[3,3],[3,4],[3,5],[3,6]]}
    ],specials:[{at:[2,1],type:'tee'},{at:[2,3],type:'tee'},{at:[3,5],type:'cross'},{at:[3,3],type:'filter',color:tertiary},{at:[1,1],type:'filter',color:primary},{at:[1,3],type:'filter',color:primary},{at:[1,4],type:'filter',color:primary},{at:[1,5],type:'filter',color:secondary},{at:[2,2],type:'filter',color:primary}],preAligned:[[2,0]],endpoints:[
      {at:[4,0],role:'start',color:primary,locked:true},{at:[0,1],role:'finish',color:primary,locked:false},{at:[0,3],role:'finish',color:primary,locked:true},{at:[0,4],role:'finish',color:primary,locked:false},
      {at:[0,5],role:'start',color:secondary,locked:false},{at:[4,5],role:'finish',color:secondary,locked:true},
      {at:[3,1],role:'start',color:tertiary,locked:true},{at:[3,6],role:'finish',color:tertiary,locked:false}
    ]};
  };
  // Compact puzzle families: each introduces a different decision shape instead
  // of extending a single line with more straight pieces.
  const makeSmallT=color=>({rows:3,cols:3,paths:[
    {color,points:[[2,0],[2,1],[1,1],[0,1],[0,0]]},
    {color,points:[[1,1],[1,2],[0,2]]}
  ],specials:[{at:[1,1],type:'tee'}],endpoints:[
    {at:[2,0],role:'start',color},{at:[0,0],role:'finish',color},{at:[0,2],role:'finish',color}
  ]});
  const makePTurn=color=>({rows:3,cols:3,paths:[
    {color,points:[[1,0],[1,1],[0,1],[0,2],[1,2],[1,1],[2,1]]}
  ],specials:[{at:[1,1],type:'pturn'}],endpoints:[{at:[1,0],role:'start',color},{at:[2,1],role:'finish',color}]});
  const makeTwinT=(primary,secondary,tertiary)=>({rows:5,cols:6,paths:[
    {color:primary,points:[[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,0],[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]]},
    {color:tertiary,points:[[4,5],[3,5],[3,4],[4,4],[4,3],[4,2]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[2,1],type:'cross'},{at:[2,3],type:'cross'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,0],role:'start',color:secondary},{at:[2,5],role:'finish',color:secondary},
    {at:[4,5],role:'start',color:tertiary},{at:[4,2],role:'finish',color:tertiary}
  ]});
  const makeTriHub=(primary,secondary,tertiary)=>({rows:5,cols:5,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2]]},
    {color:tertiary,points:[[0,4],[1,4],[1,3],[1,2],[1,1],[1,0]]}
  ],specials:[{at:[2,1],type:'tee'},{at:[2,2],type:'cross'},{at:[1,1],type:'cross'},{at:[1,2],type:'cross'},{at:[1,3],type:'cross'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary},
    {at:[0,4],role:'start',color:tertiary},{at:[1,0],role:'finish',color:tertiary}
  ]});
  const makeTriWeave=(primary,secondary,tertiary)=>({rows:5,cols:6,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[3,4],[2,4],[1,4],[0,4]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2]]},
    {color:tertiary,points:[[0,5],[1,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,2],type:'cross'},{at:[2,4],type:'cross'},{at:[2,2],type:'cross'},{at:[2,1],type:'cross'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary},
    {at:[0,5],role:'start',color:tertiary},{at:[2,0],role:'finish',color:tertiary}
  ]});
  // Internal-endpoint fork: only two starts sit on the edge; most goals are
  // embedded in the board so the player must read the whole junction area.
  const makeInteriorFork=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[3,2],[2,2],[1,2]]},
    {color:primary,points:[[2,2],[2,3],[1,3],[1,4]]},
    {color:secondary,points:[[1,1],[2,1],[3,1],[4,1],[4,2]]},
    {color:tertiary,points:[[1,5],[2,5],[3,5],[3,4],[4,4],[4,3]]}
  ],specials:[{at:[3,1],type:'cross'},{at:[2,2],type:'tee'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[1,2],role:'finish',color:primary},{at:[1,4],role:'finish',color:primary},
    {at:[1,1],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary},
    {at:[1,5],role:'start',color:tertiary},{at:[4,3],role:'finish',color:tertiary}
  ]});
  const makeCrossFork=(primary,secondary)=>({rows:4,cols:5,paths:[
    {color:primary,points:[[3,0],[2,0],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2]]}
  ],specials:[{at:[2,1],type:'tee'},{at:[2,2],type:'cross'}],endpoints:[
    {at:[3,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[3,2],role:'finish',color:secondary}
  ]});
  // Unique campaign variants: these are intentionally different route topologies,
  // not recolors or mirrored copies of earlier stages.
  const makeTriLadder=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:primary,points:[[3,3],[3,4],[2,4],[1,4],[0,4]]},
    {color:secondary,points:[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]},
    {color:tertiary,points:[[5,2],[4,2],[4,3],[4,4],[5,4]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,3],type:'tee'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
    {at:[0,5],role:'start',color:secondary},{at:[5,5],role:'finish',color:secondary},
    {at:[5,2],role:'start',color:tertiary},{at:[5,4],role:'finish',color:tertiary}
  ]});
  const makeOffsetDual=(primary,secondary,tertiary)=>({rows:5,cols:6,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[2,1],[2,2],[1,2],[0,2]]},
    {color:secondary,points:[[0,5],[1,5],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2]]},
    {color:tertiary,points:[[0,0],[1,0],[1,1],[1,2],[1,3],[0,3]]}
  ],specials:[{at:[2,2],type:'dual'},{at:[1,2],type:'cross'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},
    {at:[0,5],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary},
    {at:[0,0],role:'start',color:tertiary},{at:[0,3],role:'finish',color:tertiary}
  ]});
  const makePTurnCross=(primary,secondary)=>({rows:5,cols:5,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[2,1],[2,2],[1,2],[1,1],[0,1]]},
    {color:primary,points:[[1,2],[1,3],[0,3]]},
    {color:secondary,points:[[2,4],[2,3],[2,2],[3,2],[4,2]]}
  ],specials:[{at:[2,2],type:'pturn'},{at:[1,2],type:'tee'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[2,4],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary}
  ]});
  const makeBossMesh=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[0,5],[1,5],[2,5],[3,5],[3,4],[3,3],[3,2],[3,1],[3,0]]}
  ],specials:[{at:[2,1],type:'tee'},{at:[2,2],type:'cross'},{at:[3,2],type:'cross'},{at:[3,1],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[0,5],role:'start',color:tertiary},{at:[3,0],role:'finish',color:tertiary}
  ]});
  const makeCrossSpoke=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[5,5],[4,5],[4,4],[3,4],[3,5],[2,5],[1,5],[0,5]]}
  ],specials:[{at:[2,1],type:'tee'},{at:[2,2],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[5,5],role:'start',color:tertiary},{at:[0,5],role:'finish',color:tertiary}
  ]});
  const makeSpiralT=(primary,secondary)=>({rows:5,cols:5,paths:[
    {color:primary,points:[[4,0],[3,0],[2,0],[1,0],[1,1],[0,1]]},
    {color:primary,points:[[1,1],[1,2],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[4,4],[3,4],[3,3],[3,2],[3,1],[4,1]]}
  ],specials:[{at:[1,1],type:'tee'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[4,4],role:'start',color:secondary},{at:[4,1],role:'finish',color:secondary}
  ]});
  const makeCenterFork=(primary,secondary)=>({rows:5,cols:5,paths:[
    {color:primary,points:[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,2],type:'cross'}],endpoints:[
    {at:[4,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[4,2],role:'finish',color:secondary}
  ]});
  const makeOffsetBranch=(primary,secondary,tertiary)=>({rows:6,cols:5,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[5,4],[4,4],[3,4],[2,4],[1,4],[0,4]]},
    {color:tertiary,points:[[5,2],[4,2],[3,2],[2,2],[1,2],[0,2]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,2],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[5,4],role:'start',color:secondary},{at:[0,4],role:'finish',color:secondary},
    {at:[5,2],role:'start',color:tertiary},{at:[0,2],role:'finish',color:tertiary}
  ]});
  const makeMultiCross=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[0,5],[1,5],[1,4],[2,4],[2,5],[3,5],[4,5],[5,5]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,2],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[0,5],role:'start',color:tertiary},{at:[5,5],role:'finish',color:tertiary}
  ]});
  const makeBossPTurn=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[2,2],[1,2],[1,1],[0,1]]},
    {color:secondary,points:[[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[5,5],[4,5],[4,4],[3,4],[3,3],[4,3],[5,3]]}
  ],specials:[{at:[2,2],type:'pturn'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},
    {at:[2,5],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[5,5],role:'start',color:tertiary},{at:[5,3],role:'finish',color:tertiary}
  ]});  // Advanced-only replacements: 6×6, three colors, and multiple route decisions.
  const makeFinalCrown=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[4,2],[3,2],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4]]},
    {color:primary,points:[[4,4],[4,5],[3,5],[2,5],[1,5],[0,5]]},
    {color:secondary,points:[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]]},
    {color:tertiary,points:[[0,0],[1,0],[2,0],[2,1],[1,1],[0,1]]}
  ],specials:[{at:[4,2],type:'tee'},{at:[4,4],type:'tee'},{at:[4,3],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},{at:[0,5],role:'finish',color:primary},
    {at:[0,3],role:'start',color:secondary},{at:[5,3],role:'finish',color:secondary},
    {at:[0,0],role:'start',color:tertiary},{at:[0,1],role:'finish',color:tertiary}
  ]});
  const makeFinalSwitchboard=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[2,0],[2,1],[2,2],[2,3],[1,3],[1,2],[0,2]]},
    {color:primary,points:[[1,3],[1,4],[0,4]]},
    {color:secondary,points:[[2,5],[2,4],[2,3],[3,3],[4,3],[5,3]]},
    {color:tertiary,points:[[5,0],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]]}
  ],specials:[{at:[2,3],type:'pturn'},{at:[1,3],type:'tee'},{at:[4,3],type:'cross'}],endpoints:[
    {at:[2,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
    {at:[2,5],role:'start',color:secondary},{at:[5,3],role:'finish',color:secondary},
    {at:[5,0],role:'start',color:tertiary},{at:[4,5],role:'finish',color:tertiary}
  ]});  const makeAdvancedPTurnCross=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[2,2],[1,2],[1,1],[0,1]]},
    {color:primary,points:[[1,2],[1,3],[0,3]]},
    {color:secondary,points:[[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[5,5],[4,5],[4,4],[3,4],[3,5]]}
  ],specials:[{at:[2,2],type:'pturn'},{at:[1,2],type:'tee'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[2,5],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[5,5],role:'start',color:tertiary},{at:[3,5],role:'finish',color:tertiary}
  ]});
  const makeAdvancedSpiral=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[3,0],[2,0],[1,0],[1,1],[0,1]]},
    {color:primary,points:[[1,1],[1,2],[2,2],[2,3],[1,3],[0,3]]},
    {color:secondary,points:[[5,5],[4,5],[4,4],[4,3],[4,2],[4,1],[5,1]]},
    {color:tertiary,points:[[0,5],[1,5],[1,4],[2,4],[3,4],[3,3]]}
  ],specials:[{at:[1,1],type:'tee'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},
    {at:[5,5],role:'start',color:secondary},{at:[5,1],role:'finish',color:secondary},
    {at:[0,5],role:'start',color:tertiary},{at:[3,3],role:'finish',color:tertiary}
  ]});  const makeAdvancedTrident=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:primary,points:[[3,3],[3,4],[2,4],[1,4],[0,4]]},
    {color:secondary,points:[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]]},
    {color:tertiary,points:[[5,1],[4,1],[4,2],[5,2],[5,3],[4,3],[4,4],[5,4]]}
  ],specials:[{at:[3,1],type:'tee'},{at:[3,3],type:'tee'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
    {at:[0,5],role:'start',color:secondary},{at:[5,5],role:'finish',color:secondary},
    {at:[5,1],role:'start',color:tertiary},{at:[5,4],role:'finish',color:tertiary}
  ]});
  const makeDualTower=(primary,secondary,tertiary)=>({rows:6,cols:6,paths:[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[3,2],[2,2],[1,2],[0,2]]},
    {color:secondary,points:[[0,5],[1,5],[2,5],[3,5],[3,4],[3,3],[3,2],[4,2],[5,2]]},
    {color:tertiary,points:[[0,0],[1,0],[1,1],[1,2],[1,3],[0,3]]}
  ],specials:[{at:[3,2],type:'dual'},{at:[1,2],type:'cross'}],endpoints:[
    {at:[5,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},
    {at:[0,5],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},
    {at:[0,0],role:'start',color:tertiary},{at:[0,3],role:'finish',color:tertiary}
  ]});  // Super-hard campaign core: every color branches from one start to three goals.
  // The five placements use different board orientations and color routes so players
  // must re-read the junction order instead of memorising a previous solution.
  const makeSuperHard=(colors=['green','blue','red'],variant='identity')=>{
    const [primary,secondary,tertiary]=colors;
    const mapPoint=([row,column])=>{
      if(variant==='mirror-x')return [row,5-column];
      if(variant==='mirror-y')return [5-row,column];
      if(variant==='rotate-180')return [5-row,5-column];
      if(variant==='transpose')return [column,row];
      return [row,column];
    };
    const remap=items=>items.map(item=>({...item,at:item.at?mapPoint(item.at):undefined,points:item.points?item.points.map(mapPoint):undefined}));
    const definition={rows:6,cols:6,paths:[
      {color:primary,points:[[5,0],[4,0],[3,0]]},
      {color:primary,points:[[4,0],[4,1],[4,2],[5,2],[5,3],[5,4],[4,4]]},
      {color:primary,points:[[5,4],[5,5]]},
      {color:secondary,points:[[0,0],[1,0],[2,0]]},
      {color:secondary,points:[[1,0],[1,1],[1,2],[0,2]]},
      {color:secondary,points:[[1,2],[2,2]]},
      {color:tertiary,points:[[0,5],[1,5],[2,5]]},
      {color:tertiary,points:[[1,5],[1,4],[1,3],[2,3],[2,4]]},
      {color:tertiary,points:[[2,3],[3,3]]}
    ],specials:[
      {at:[4,0],type:'tee'},{at:[5,4],type:'tee'},
      {at:[1,0],type:'tee'},{at:[1,2],type:'tee'},
      {at:[1,5],type:'tee'},{at:[2,3],type:'tee'},
      {at:[4,1],type:'cross'},{at:[1,1],type:'cross'},{at:[1,4],type:'cross'},
      {at:[4,2],type:'dual'},{at:[1,3],type:'dual'}
    ],endpoints:[
      {at:[5,0],role:'start',color:primary},{at:[3,0],role:'finish',color:primary},{at:[4,4],role:'finish',color:primary},{at:[5,5],role:'finish',color:primary},
      {at:[0,0],role:'start',color:secondary},{at:[2,0],role:'finish',color:secondary},{at:[0,2],role:'finish',color:secondary},{at:[2,2],role:'finish',color:secondary},
      {at:[0,5],role:'start',color:tertiary},{at:[2,5],role:'finish',color:tertiary},{at:[2,4],role:'finish',color:tertiary},{at:[3,3],role:'finish',color:tertiary}
    ]};
    return {...definition,paths:remap(definition.paths).map(({at,...path})=>path),specials:remap(definition.specials),endpoints:remap(definition.endpoints)};
  };  // Stage 27 rebuild: every placed special is part of the solved route.
  const makePortComplete27=()=>({rows:6,cols:6,paths:[
    // Green crosses the centre horizontally and then branches across the right side.
    {color:'green',points:[[2,0],[2,1],[2,2],[2,3],[2,4],[1,4]]},
    {color:'green',points:[[2,4],[2,5],[1,5]]},
    {color:'green',points:[[2,5],[3,5]]},
    // Blue uses the same cross vertically before splitting into the lower board.
    {color:'blue',points:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[5,3],[4,3]]},
    {color:'blue',points:[[1,2],[1,1]]},
    {color:'blue',points:[[5,3],[5,4]]},
    // Red occupies a separate lower-left branch rather than surrounding the cross.
    {color:'red',points:[[5,0],[4,0],[3,0]]},
    {color:'red',points:[[4,0],[4,1],[3,1]]},
    {color:'red',points:[[4,1],[5,1]]}
  ],specials:[
    {at:[2,4],type:'tee'},{at:[2,5],type:'tee'},
    {at:[1,2],type:'tee'},{at:[5,3],type:'tee'},
    {at:[4,0],type:'tee'},{at:[4,1],type:'tee'},
    {at:[2,2],type:'cross'}
  ],endpoints:[
    {at:[2,0],role:'start',color:'green'},{at:[1,4],role:'finish',color:'green'},{at:[1,5],role:'finish',color:'green'},{at:[3,5],role:'finish',color:'green'},
    {at:[0,2],role:'start',color:'blue'},{at:[1,1],role:'finish',color:'blue'},{at:[4,3],role:'finish',color:'blue'},{at:[5,4],role:'finish',color:'blue'},
    {at:[5,0],role:'start',color:'red'},{at:[3,0],role:'finish',color:'red'},{at:[3,1],role:'finish',color:'red'},{at:[5,1],role:'finish',color:'red'}
  ]});

  // Stage 28: one shared cross, with each color branching into a separate board region.
  const makeDispersed28=()=>({rows:8,cols:8,paths:[
    {color:'green',points:[[3,0],[3,1],[3,2],[3,3],[3,4],[4,4],[5,4]]},
    {color:'green',points:[[3,4],[3,5],[3,6],[3,7]]},
    {color:'green',points:[[3,5],[4,5],[5,5]]},
    {color:'blue',points:[[0,3],[1,3],[2,3],[3,3],[4,3],[4,2],[4,1]]},
    {color:'blue',points:[[4,3],[5,3],[5,2],[5,1]]},
    {color:'blue',points:[[5,3],[6,3],[7,3]]},
    {color:'red',points:[[0,7],[1,7],[1,6],[0,6]]},
    {color:'red',points:[[1,6],[1,5],[1,4],[0,4]]},
    {color:'red',points:[[1,4],[2,4],[2,5],[2,6]]}
  ],specials:[
    {at:[3,3],type:'cross'},
    {at:[3,4],type:'tee'},{at:[3,5],type:'tee'},
    {at:[4,3],type:'tee'},{at:[5,3],type:'tee'},
    {at:[1,6],type:'tee'},{at:[1,4],type:'tee'}
  ],endpoints:[
    {at:[3,0],role:'start',color:'green'},{at:[5,4],role:'finish',color:'green'},{at:[3,7],role:'finish',color:'green'},{at:[5,5],role:'finish',color:'green'},
    {at:[0,3],role:'start',color:'blue'},{at:[4,1],role:'finish',color:'blue'},{at:[5,1],role:'finish',color:'blue'},{at:[7,3],role:'finish',color:'blue'},
    {at:[0,7],role:'start',color:'red'},{at:[0,6],role:'finish',color:'red'},{at:[0,4],role:'finish',color:'red'},{at:[2,6],role:'finish',color:'red'}
  ]});

  // Stage 29: the centre dual carries green (up-right) and blue (left-down) lanes.
  const makeDispersed29=()=>({rows:8,cols:8,paths:[
    {color:'green',points:[[0,3],[1,3],[2,3],[3,3],[3,4],[3,5],[2,5],[1,5]]},
    {color:'green',points:[[3,5],[3,6],[3,7]]},
    {color:'green',points:[[3,6],[4,6],[5,6]]},
    {color:'blue',points:[[3,0],[3,1],[3,2],[3,3],[4,3],[4,2],[4,1]]},
    {color:'blue',points:[[4,3],[5,3],[5,2],[5,1]]},
    {color:'blue',points:[[5,3],[5,4],[5,5]]},
    {color:'red',points:[[7,7],[6,7],[6,6],[7,6]]},
    {color:'red',points:[[6,6],[6,5],[7,5]]},
    {color:'red',points:[[6,5],[6,4],[6,3]]}
  ],specials:[
    {at:[3,3],type:'dual'},
    {at:[3,5],type:'tee'},{at:[3,6],type:'tee'},
    {at:[4,3],type:'tee'},{at:[5,3],type:'tee'},
    {at:[6,6],type:'tee'},{at:[6,5],type:'tee'}
  ],endpoints:[
    {at:[0,3],role:'start',color:'green'},{at:[1,5],role:'finish',color:'green'},{at:[3,7],role:'finish',color:'green'},{at:[5,6],role:'finish',color:'green'},
    {at:[3,0],role:'start',color:'blue'},{at:[4,1],role:'finish',color:'blue'},{at:[5,1],role:'finish',color:'blue'},{at:[5,5],role:'finish',color:'blue'},
    {at:[7,7],role:'start',color:'red'},{at:[7,6],role:'finish',color:'red'},{at:[7,5],role:'finish',color:'red'},{at:[6,3],role:'finish',color:'red'}
  ]});

  // Stage 30: two spaced crosses, each shared by different-colored axes.
  const makeDispersed30=()=>({rows:8,cols:8,paths:[
    {color:'green',points:[[2,0],[2,1],[2,2],[2,3],[2,4],[1,4],[0,4]]},
    {color:'green',points:[[2,4],[2,5],[2,6],[2,7]]},
    {color:'green',points:[[2,5],[3,5],[3,6],[4,6]]},
    {color:'blue',points:[[0,3],[1,3],[2,3],[3,3],[4,3],[4,4],[4,5],[5,5],[6,5],[7,5]]},
    {color:'blue',points:[[6,5],[6,4],[6,3],[6,2]]},
    {color:'blue',points:[[6,4],[7,4]]},
    {color:'red',points:[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7]]},
    {color:'red',points:[[5,2],[4,2],[3,2]]},
    {color:'red',points:[[5,6],[6,6],[7,6]]}
  ],specials:[
    {at:[2,3],type:'cross'},{at:[5,5],type:'cross'},
    {at:[2,4],type:'tee'},{at:[2,5],type:'tee'},
    {at:[6,5],type:'tee'},{at:[6,4],type:'tee'},
    {at:[5,2],type:'tee'},{at:[5,6],type:'tee'}
  ],endpoints:[
    {at:[2,0],role:'start',color:'green'},{at:[0,4],role:'finish',color:'green'},{at:[2,7],role:'finish',color:'green'},{at:[4,6],role:'finish',color:'green'},
    {at:[0,3],role:'start',color:'blue'},{at:[7,5],role:'finish',color:'blue'},{at:[6,2],role:'finish',color:'blue'},{at:[7,4],role:'finish',color:'blue'},
    {at:[5,0],role:'start',color:'red'},{at:[3,2],role:'finish',color:'red'},{at:[5,7],role:'finish',color:'red'},{at:[7,6],role:'finish',color:'red'}
  ]});

  // Stage 28: D3 is a genuine dual lane: green uses up→right, blue uses left→down.
  const makeLateDual28=()=>({rows:8,cols:8,paths:[
    {color:'green',points:[[0,3],[1,3],[2,3],[2,4],[2,5],[1,5],[0,5]]},
    {color:'green',points:[[2,5],[2,6],[2,7]]},
    {color:'green',points:[[2,6],[3,6],[4,6]]},
    {color:'blue',points:[[2,0],[2,1],[2,2],[2,3],[3,3],[4,3],[4,4],[4,5],[5,5],[6,5],[6,4],[6,3],[6,2]]},
    {color:'blue',points:[[6,4],[7,4]]},
    {color:'blue',points:[[6,5],[6,6],[6,7]]},
    {color:'red',points:[[5,0],[5,1],[5,2],[4,2],[3,2]]},
    {color:'red',points:[[5,2],[5,3],[5,4],[5,5],[5,6],[5,7]]},
    {color:'red',points:[[5,6],[6,6],[7,6]]}
  ],specials:[
    {at:[2,3],type:'dual'},
    {at:[2,5],type:'tee'},{at:[2,6],type:'tee'},
    {at:[5,5],type:'cross'},{at:[6,6],type:'cross'},
    {at:[6,5],type:'tee'},{at:[6,4],type:'tee'},
    {at:[5,2],type:'tee'},{at:[5,6],type:'tee'}
  ],endpoints:[
    {at:[0,3],role:'start',color:'green'},{at:[0,5],role:'finish',color:'green'},{at:[2,7],role:'finish',color:'green'},{at:[4,6],role:'finish',color:'green'},
    {at:[2,0],role:'start',color:'blue'},{at:[6,2],role:'finish',color:'blue'},{at:[7,4],role:'finish',color:'blue'},{at:[6,7],role:'finish',color:'blue'},
    {at:[5,0],role:'start',color:'red'},{at:[3,2],role:'finish',color:'red'},{at:[5,7],role:'finish',color:'red'},{at:[7,6],role:'finish',color:'red'}
  ]});

  // Re-orient a square network while preserving all solved port relationships.
  const orientSquareNetwork=(definition,turns=0,colorOrder=['green','blue','red'])=>{
    const size=definition.rows-1;
    const mapPoint=([row,column])=>{
      let nextRow=row,nextColumn=column;
      for(let turn=0;turn<turns;turn++)[nextRow,nextColumn]=[nextColumn,size-nextRow];
      return [nextRow,nextColumn];
    };
    const mapColor=color=>colorOrder[['green','blue','red'].indexOf(color)]||color;
    return {
      ...definition,
      paths:definition.paths.map(path=>({...path,color:mapColor(path.color),points:path.points.map(mapPoint)})),
      specials:definition.specials.map(special=>({...special,at:mapPoint(special.at)})),
      endpoints:definition.endpoints.map(endpoint=>({...endpoint,color:mapColor(endpoint.color),at:mapPoint(endpoint.at)}))
    };
  };

  const branchCampaign=[
    // Every stage uses a distinct topology; color changes alone are never used as a new puzzle.
    makeSmallT('green'), makePTurn('blue'), makeCrossFork('green','blue'), makeInteriorFork('green','blue','red'),
    makeTriHub('green','blue','red'), makeTriWeave('blue','red','green'), makeTriCross(['blue','green','red']), makeTriDual(['green','red','blue']),
    makeTriLadder('red','green','blue'), makeTwinT('blue','red','green'), makeAdvancedTrident('green','blue','red'), makeDualTower('blue','red','green'),
    makeAdvancedPTurnCross('red','blue','green'), makeBossMesh('green','blue','red'), makeCrossSpoke('blue','green','red'), makeSuperHard(['red','green','blue'],'identity'),
    makePortComplete27(), makeDispersed28(), makeDispersed29(), makeDispersed30()
  ];
  branchCampaign.forEach(stage=>STAGES.push(stage));
  const EPISODE_SIZE=20,EPISODE_COUNT=3,TEST_STAGE_COUNT=EPISODE_SIZE*EPISODE_COUNT;
  // Keep stage order fixed during testing; only the layout inside each stage is randomized.
  const TEST_RANDOM_MODE=false;
  // Set false later to use each original stage layout as a fixed production puzzle.
  const TEST_LAYOUT_VARIANTS=false;
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
  // Stage 08: compact, single-colour network. Nearly the whole board participates.
  const makeDenseSingle08=()=>({rows:4,cols:4,paths:[
    {color:'red',points:[[0,3],[1,3],[1,2],[1,1],[0,1]]},
    {color:'red',points:[[1,1],[2,1],[2,0],[3,0]]},
    {color:'red',points:[[2,1],[2,2],[3,2],[3,3]]}
  ],specials:[{at:[1,1],type:'tee'},{at:[2,1],type:'tee'}],endpoints:[
    {at:[0,3],role:'start',color:'red'},
    {at:[0,1],role:'finish',color:'red'},
    {at:[3,0],role:'finish',color:'red'},
    {at:[3,3],role:'finish',color:'red'}
  ]});

  // Stage 09: both lanes of the dual are required, and neither color can end as a short branch.
  const makeInterwoven09=()=>({rows:6,cols:6,paths:[
    {color:'green',points:[[0,3],[1,3],[2,3],[3,3],[3,4],[3,5],[2,5],[1,5]]},
    {color:'green',points:[[3,5],[4,5],[4,4]]},
    {color:'blue',points:[[3,0],[3,1],[3,2],[3,3],[4,3],[4,2],[4,1]]},
    {color:'blue',points:[[4,3],[5,3],[5,2],[5,1]]},
    {color:'blue',points:[[5,3],[5,4],[5,5]]}
  ],specials:[
    {at:[3,3],type:'dual'},
    {at:[3,5],type:'tee'},{at:[4,3],type:'tee'},{at:[5,3],type:'tee'}
  ],endpoints:[
    {at:[0,3],role:'start',color:'green'},{at:[1,5],role:'finish',color:'green'},{at:[4,4],role:'finish',color:'green'},
    {at:[3,0],role:'start',color:'blue'},{at:[4,1],role:'finish',color:'blue'},{at:[5,1],role:'finish',color:'blue'},{at:[5,5],role:'finish',color:'blue'}
  ]});

  // Stage 25: interwoven three-colour mesh. Green and blue occupy separate dual lanes.
  const makeInterwoven25=()=>({rows:7,cols:7,paths:[
    {color:'green',points:[[2,0],[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:'green',points:[[2,3],[2,4],[3,4],[4,4],[4,5],[3,5],[2,5]]},
    {color:'green',points:[[4,5],[4,6]]},
    {color:'blue',points:[[0,2],[1,2],[2,2],[3,2],[3,3]]},
    {color:'blue',points:[[3,2],[4,2],[4,3],[4,4],[5,4],[5,3],[5,2]]},
    {color:'blue',points:[[5,4],[5,5],[5,6]]},
    {color:'red',points:[[6,0],[5,0],[4,0],[4,1],[3,1]]},
    {color:'red',points:[[4,1],[5,1],[6,1]]},
  ],specials:[
    {at:[2,2],type:'cross'},
    {at:[2,3],type:'tee'},{at:[4,5],type:'tee'},
    {at:[3,2],type:'tee'},{at:[5,4],type:'tee'},
    {at:[4,4],type:'dual'},
    {at:[4,1],type:'tee'}
  ],endpoints:[
    {at:[2,0],role:'start',color:'green'},{at:[0,3],role:'finish',color:'green'},{at:[2,5],role:'finish',color:'green'},{at:[4,6],role:'finish',color:'green'},
    {at:[0,2],role:'start',color:'blue'},{at:[3,3],role:'finish',color:'blue'},{at:[5,2],role:'finish',color:'blue'},{at:[5,6],role:'finish',color:'blue'},
    {at:[6,0],role:'start',color:'red'},{at:[3,1],role:'finish',color:'red'},{at:[6,1],role:'finish',color:'red'}
  ]});

  // Stage 26 is a separate three-color network: no decorative cross or dual ports.
  const makeReference26=()=>({rows:7,cols:7,paths:[
    {color:'green',points:[[3,0],[3,1],[3,2],[3,3],[3,4],[2,4],[1,4]]},
    {color:'green',points:[[3,4],[3,5],[3,6]]},
    {color:'green',points:[[3,5],[4,5],[4,6],[5,6]]},
    {color:'blue',points:[[0,3],[1,3],[2,3],[3,3],[4,3],[4,2],[4,1]]},
    {color:'blue',points:[[4,3],[5,3],[5,2],[5,1]]},
    {color:'blue',points:[[5,3],[5,4],[5,5]]},
    {color:'red',points:[[0,0],[1,0],[1,1],[0,1]]},
    {color:'red',points:[[1,1],[2,1],[2,0]]},
    {color:'red',points:[[2,1],[2,2]]}
  ],specials:[
    {at:[3,3],type:'cross'},
    {at:[3,4],type:'tee'},{at:[3,5],type:'tee'},
    {at:[4,3],type:'tee'},{at:[5,3],type:'tee'},
    {at:[1,1],type:'tee'},{at:[2,1],type:'tee'}
  ],endpoints:[
    {at:[3,0],role:'start',color:'green'},{at:[1,4],role:'finish',color:'green'},{at:[3,6],role:'finish',color:'green'},{at:[5,6],role:'finish',color:'green'},
    {at:[0,3],role:'start',color:'blue'},{at:[4,1],role:'finish',color:'blue'},{at:[5,1],role:'finish',color:'blue'},{at:[5,5],role:'finish',color:'blue'},
    {at:[0,0],role:'start',color:'red'},{at:[0,1],role:'finish',color:'red'},{at:[2,0],role:'finish',color:'red'},{at:[2,2],role:'finish',color:'red'}
  ]});

  // Reframe the earlier campaign so all stages have a fresh, fixed layout and no legacy filter tile.
  const reframeStage=(definition,index)=>{
    const flipX=index%3===0,flipY=index%3===1;
    const mapPoint=([row,column])=>[flipY?definition.rows-1-row:row,flipX?definition.cols-1-column:column];
    const colorSets=[['green','blue','red'],['blue','red','green'],['red','green','blue']];
    const colors=colorSets[index%colorSets.length];
    const mapColor=color=>colors[['green','blue','red'].indexOf(color)]||color;
    return {
      ...definition,
      paths:definition.paths.map(path=>({...path,color:mapColor(path.color),points:path.points.map(mapPoint)})),
      endpoints:definition.endpoints.map(endpoint=>({...endpoint,color:mapColor(endpoint.color),at:mapPoint(endpoint.at)})),
      specials:(definition.specials||[]).filter(special=>special.type!=='filter').map(special=>({...special,color:special.color?mapColor(special.color):undefined,at:mapPoint(special.at)})),
      preAligned:(definition.preAligned||[]).map(mapPoint)
    };
  };
  const rebuiltCampaign=STAGES.map((definition,index)=>reframeStage(definition,index));
  // From stage 11 onward, routes deliberately share junction decisions instead of
  // resolving as isolated color branches. Difficulty grows by adding crossings,
  // then dual lanes, then multi-colour meshes.
  rebuiltCampaign[7]=makeDenseSingle08();
  rebuiltCampaign[8]=makeInterwoven09();
  rebuiltCampaign[10]=makeCrossFork('green','blue');
  rebuiltCampaign[11]=makeInteriorFork('blue','green','red');
  rebuiltCampaign[12]=makeTriHub('red','blue','green');
  rebuiltCampaign[13]=makeTriWeave('green','red','blue');
  rebuiltCampaign[14]=makeTriCross(['blue','green','red']);
  rebuiltCampaign[15]=makeTriDual(['red','blue','green']);
  rebuiltCampaign[16]=makeTwinT('green','blue','red');
  rebuiltCampaign[17]=makeAdvancedTrident('blue','red','green');
  rebuiltCampaign[18]=makeDualTower('red','green','blue');
  rebuiltCampaign[19]=makeAdvancedPTurnCross('green','blue','red');
  rebuiltCampaign[20]=makeBossMesh('blue','green','red');
  rebuiltCampaign[21]=makeCrossSpoke('red','blue','green');
  rebuiltCampaign[22]=makeTriLadder('blue','red','green');
  rebuiltCampaign[23]=makeOffsetDual('green','red','blue');
  // Late campaign: every colour spans the board; no colour-specific corner cluster.
  rebuiltCampaign[24]=orientSquareNetwork(makeDispersed30(),1,['blue','red','green']);
  rebuiltCampaign[25]=orientSquareNetwork(makeDispersed30(),2,['red','green','blue']);
  rebuiltCampaign[26]=orientSquareNetwork(makeDispersed30(),3,['green','red','blue']);
  rebuiltCampaign[27]=makeLateDual28();
  rebuiltCampaign[28]=makeDispersed29();
  rebuiltCampaign[29]=makeDispersed30();
  STAGES.splice(0,STAGES.length,...rebuiltCampaign);
  STAGE_TEMPLATES.splice(0,STAGE_TEMPLATES.length,...STAGES.map(definition=>[definition]));

  // Episodes are authored as distinct rulesets rather than one long mixed pool.
  // The junction list is derived from the actual route graph so a branch never
  // silently becomes a straight tile.
  const makeNetwork=(rows,cols,paths,endpoints,overrides=[])=>{
    const edges=new Map(),pointId=point=>`${point[0]},${point[1]}`;
    const direction=([row,col],[nextRow,nextCol])=>nextRow<row?UP:nextCol>col?RIGHT:nextRow>row?DOWN:LEFT;
    paths.forEach(({points})=>points.slice(0,-1).forEach((point,index)=>{
      const next=points[index+1],from=pointId(point),to=pointId(next);
      if(!edges.has(from))edges.set(from,new Set());if(!edges.has(to))edges.set(to,new Set());
      edges.get(from).add(direction(point,next));edges.get(to).add(direction(next,point));
    }));
    const endpointIds=new Set(endpoints.map(endpoint=>pointId(endpoint.at))),overrideMap=new Map(overrides.map(item=>[pointId(item.at),item.type]));
    const specials=[];
    edges.forEach((portsAtPoint,id)=>{
      if(endpointIds.has(id)||portsAtPoint.size<3)return;
      const [row,col]=id.split(',').map(Number),type=overrideMap.get(id)||(portsAtPoint.size===4?'cross':'tee');
      specials.push({at:[row,col],type});
    });
    overrides.forEach(item=>{const id=pointId(item.at);if(!specials.some(special=>pointId(special.at)===id)&&!endpointIds.has(id))specials.push({...item});});
    return {rows,cols,paths,endpoints,specials};
  };
  // Move one existing source to an actual junction in its own colour network.
  // The old source becomes a destination, so every port on the new source must
  // be solved; this turns the authored graph into a genuine pipe-game fork.
  const promoteStartToHub=(definition,desiredPorts,seed=0)=>{
    const id=point=>`${point[0]},${point[1]}`,endpoints=definition.endpoints.map(endpoint=>({...endpoint,at:[...endpoint.at]}));
    const starts=endpoints.filter(endpoint=>endpoint.role==='start');
    const endpointIds=new Set(endpoints.map(endpoint=>id(endpoint.at)));
    for(let offset=0;offset<starts.length;offset++){
      const source=starts[(seed+offset)%starts.length],edges=new Map(),points=new Map();
      const sharedIds=new Set(definition.paths.filter(path=>path.color!==source.color).flatMap(path=>path.points.map(id)));
      definition.paths.filter(path=>path.color===source.color).forEach(({points:pathPoints})=>pathPoints.slice(0,-1).forEach((point,index)=>{
        const next=pathPoints[index+1],from=id(point),to=id(next);
        if(!edges.has(from))edges.set(from,new Set());if(!edges.has(to))edges.set(to,new Set());
        edges.get(from).add(to);edges.get(to).add(from);points.set(from,point);points.set(to,next);
      }));
      const candidatesFor=ports=>[...edges].filter(([id,neighbors])=>!endpointIds.has(id)&&!sharedIds.has(id)&&neighbors.size===ports).map(([id])=>points.get(id));
      const candidates=candidatesFor(desiredPorts).length?candidatesFor(desiredPorts):desiredPorts>2?candidatesFor(2):[];
      if(!candidates.length)continue;
      const hub=candidates[seed%candidates.length],hubId=id(hub),sourceId=id(source.at);
      const updatedEndpoints=endpoints.map(endpoint=>id(endpoint.at)===sourceId?{...endpoint,role:'finish'}:endpoint);
      updatedEndpoints.push({at:[...hub],role:'start',color:source.color});
      return {...definition,endpoints:updatedEndpoints,specials:(definition.specials||[]).filter(special=>id(special.at)!==hubId)};
    }
    return definition;
  };
  const startPortCountForLevel=level=>level===1?1:level<=3?2:level<=8?(level%2?2:3):level<=14?(level%3===0?2:3):3;
  const applyStartProgression=(stages,stageOffset)=>stages.map((stage,index)=>promoteStartToHub(stage,startPortCountForLevel(index+1),stageOffset+index));
  // A repeated base puzzle must never be re-issued as a recolour.  This helper
  // turns it into a genuinely new network by adding a routed destination at a
  // non-endpoint port; makeNetwork then regenerates the required T/cross tiles.
  const withNetworkBranch=(definition,color,from,to)=>makeNetwork(
    definition.rows,definition.cols,
    [...definition.paths.map(path=>({color:path.color,points:path.points.map(point=>[...point])})),{color,points:[from,to]}],
    [...definition.endpoints.map(endpoint=>({at:[...endpoint.at],role:endpoint.role,color:endpoint.color})),{at:to,role:'finish',color}]
  );
  // Stage 02 / Level 10: two single-port starts, scattered goals, T choices,
  // and a shared cross. This is a pipe-network decision puzzle, not a long route.
  const makeStageTwoNetwork10=()=>makeNetwork(6,6,[
    {color:'green',points:[[3,0],[3,1],[2,1],[1,1],[0,1]]},
    {color:'green',points:[[3,1],[3,2],[3,3],[3,4],[4,4],[5,4]]},
    {color:'green',points:[[3,2],[4,2],[5,2]]},
    {color:'blue',points:[[0,3],[1,3],[1,4],[0,4]]},
    {color:'blue',points:[[1,3],[2,3],[3,3],[4,3],[5,3]]}
  ],[
    {at:[3,0],role:'start',color:'green'},{at:[0,1],role:'finish',color:'green'},{at:[5,4],role:'finish',color:'green'},{at:[5,2],role:'finish',color:'green'},
    {at:[0,3],role:'start',color:'blue'},{at:[0,4],role:'finish',color:'blue'},{at:[5,3],role:'finish',color:'blue'}
  ]);
  // Stage 02 / Level 13: destinations sit on three different board edges.
  // Both colours must turn through the middle instead of climbing long columns.
  const makeStageTwoNetwork13=()=>makeNetwork(6,6,[
    {color:'green',points:[[3,2],[2,2],[1,2],[1,1],[1,0],[0,0]]},
    {color:'green',points:[[3,2],[3,1],[4,1],[5,1]]},
    {color:'green',points:[[3,2],[3,3],[3,4],[4,4],[4,5]]},
    {color:'blue',points:[[2,5],[2,4],[2,3],[1,3],[0,3]]},
    {color:'blue',points:[[2,3],[3,3],[4,3],[4,2],[5,2]]}
  ],[
    {at:[3,2],role:'start',color:'green'},{at:[0,0],role:'finish',color:'green'},{at:[5,1],role:'finish',color:'green'},{at:[4,5],role:'finish',color:'green'},
    {at:[2,5],role:'start',color:'blue'},{at:[0,3],role:'finish',color:'blue'},{at:[5,2],role:'finish',color:'blue'}
  ]);
  const makeSingleEpisodeStage=(layout,color)=>{
    const paths=layout.paths.map(points=>({color,points})),pointId=point=>`${point[0]},${point[1]}`,edges=new Map(),pointsById=new Map();
    paths.forEach(({points})=>points.slice(0,-1).forEach((point,index)=>{
      const next=points[index+1],from=pointId(point),to=pointId(next);
      if(!edges.has(from))edges.set(from,new Set());if(!edges.has(to))edges.set(to,new Set());
      edges.get(from).add(to);edges.get(to).add(from);pointsById.set(from,point);pointsById.set(to,next);
    }));
    // Every terminal branch is a destination. This prevents a T branch from
    // ending in an invisible dead line (the issue found at Episode 01 Stage 09).
    const startId=pointId(layout.start),finishes=[...edges].filter(([id,neighbors])=>id!==startId&&neighbors.size===1).map(([id])=>pointsById.get(id));
    return makeNetwork(layout.rows,layout.cols,paths,[{at:layout.start,role:'start',color},...finishes.map(at=>({at,role:'finish',color}))]);
  };
  const singleLayouts=[
    {rows:3,cols:3,start:[2,0],finishes:[[0,1]],paths:[[[2,0],[1,0],[1,1],[0,1]]]},
    {rows:3,cols:5,start:[2,0],finishes:[[0,3]],paths:[[[2,0],[1,0],[1,1],[1,2],[1,3],[0,3]]]},
    {rows:4,cols:3,start:[3,2],finishes:[[0,1]],paths:[[[3,2],[2,2],[2,1],[1,1],[0,1]]]},
    {rows:4,cols:4,start:[3,0],finishes:[[0,1],[3,3]],paths:[[[3,0],[2,0],[2,1],[1,1],[0,1]],[[2,1],[2,2],[3,2],[3,3]]]},
    {rows:4,cols:5,start:[3,0],finishes:[[0,1],[0,4]],paths:[[[3,0],[2,0],[2,1],[1,1],[0,1]],[[2,1],[2,2],[2,3],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:4,start:[4,3],finishes:[[0,2],[0,0]],paths:[[[4,3],[3,3],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]]]},
    {rows:4,cols:5,start:[3,0],finishes:[[0,1],[0,3],[0,4]],paths:[[[3,0],[2,0],[2,1],[1,1],[0,1]],[[2,1],[2,2],[2,3],[1,3],[0,3]],[[2,3],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,1],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:4,start:[4,0],finishes:[[0,0],[0,2],[0,3]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,3],[2,3],[1,3],[0,3]],[[2,1],[2,0],[1,0],[0,0]]]},
    {rows:5,cols:5,start:[4,4],finishes:[[0,4],[0,2],[0,0]],paths:[[[4,4],[3,4],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,1],[2,1],[1,1],[0,1]],[[2,1],[2,0],[1,0],[0,0]],[[3,4],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,1],[0,3],[0,4],[0,0]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,2],[0,3]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,3],[2,3],[1,3],[0,3]],[[2,1],[2,0],[1,0],[0,0]]]},
    {rows:5,cols:5,start:[4,4],finishes:[[0,4],[0,3],[0,2],[0,0]],paths:[[[4,4],[3,4],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,1],[2,1],[1,1],[0,1]],[[2,1],[2,0],[1,0],[0,0]],[[3,4],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,2],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]],[[3,2],[2,2],[1,2],[0,2]]]},
    {rows:5,cols:5,start:[4,4],finishes:[[0,4],[0,3],[0,2],[0,1],[0,0]],paths:[[[4,4],[3,4],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,2],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,0],[2,0],[1,0],[0,0]],[[2,3],[2,4],[1,4],[0,4]],[[3,2],[2,2],[1,2],[0,2]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,2],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]],[[3,2],[2,2],[1,2],[0,2]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,2],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]]]},
    {rows:5,cols:5,start:[4,4],finishes:[[0,0],[0,1],[0,2],[0,3],[0,4]],paths:[[[4,4],[3,4],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,0],[2,0],[1,0],[0,0]],[[3,4],[2,4],[1,4],[0,4]]]},
    {rows:5,cols:5,start:[4,0],finishes:[[0,0],[0,1],[0,2],[0,3],[0,4]],paths:[[[4,0],[3,0],[3,1],[2,1],[1,1],[0,1]],[[3,1],[3,2],[2,2],[1,2],[0,2]],[[3,2],[3,3],[2,3],[1,3],[0,3]],[[3,3],[3,4],[2,4],[1,4],[0,4]],[[2,1],[2,0],[1,0],[0,0]]]},
  ];
  const makeTwoCrossMesh=(primary,secondary)=>makeNetwork(6,6,[
    {color:primary,points:[[5,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]]},
    {color:primary,points:[[3,3],[3,4],[2,4],[1,4],[0,4]]},
    {color:secondary,points:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]]},
    {color:secondary,points:[[5,5],[4,5],[4,4],[4,3],[4,2]]}
  ],[
    {at:[5,0],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[0,3],role:'finish',color:primary},{at:[0,4],role:'finish',color:primary},
    {at:[0,2],role:'start',color:secondary},{at:[5,2],role:'finish',color:secondary},{at:[5,5],role:'finish',color:secondary}
  ]);
  // Episode 01 starts with one-colour reading, then mixes two independent
  // colour networks. Starts and goals are deliberately spread through the
  // board instead of collecting at one edge.
  const makeEpisodeOnePairA=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,1],[4,2],[3,2],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[3,2],[3,3],[3,4],[2,4]]},
    {color:secondary,points:[[1,1],[2,1],[2,0],[1,0],[0,0]]},
    {color:secondary,points:[[2,1],[3,1],[3,0]]}
  ],[
    {at:[4,1],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[2,4],role:'finish',color:primary},
    {at:[1,1],role:'start',color:secondary},{at:[0,0],role:'finish',color:secondary},{at:[3,0],role:'finish',color:secondary}
  ]);
  const makeEpisodeOnePairB=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,2],[3,2],[3,1],[2,1],[1,1],[0,1]]},
    {color:primary,points:[[3,1],[3,0],[2,0]]},
    {color:secondary,points:[[1,3],[1,4],[2,4],[3,4],[4,4]]},
    {color:secondary,points:[[2,4],[2,3],[3,3],[4,3]]}
  ],[
    {at:[4,2],role:'start',color:primary},{at:[0,1],role:'finish',color:primary},{at:[2,0],role:'finish',color:primary},
    {at:[1,3],role:'start',color:secondary},{at:[4,4],role:'finish',color:secondary},{at:[4,3],role:'finish',color:secondary}
  ]);
  const makeEpisodeOnePairC=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[3,0],[3,1],[2,1],[1,1],[1,2],[0,2]]},
    {color:primary,points:[[2,1],[2,2],[2,3],[1,3]]},
    {color:secondary,points:[[4,4],[3,4],[3,3],[4,3]]},
    {color:secondary,points:[[3,3],[2,3],[2,4],[1,4],[0,4]]}
  ],[
    {at:[3,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[1,3],role:'finish',color:primary},
    {at:[4,4],role:'start',color:secondary},{at:[4,3],role:'finish',color:secondary},{at:[0,4],role:'finish',color:secondary}
  ]);
  const makeEpisodeOnePairD=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,1],[3,1],[2,1],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[2,1],[2,0],[1,0]]},
    {color:secondary,points:[[1,4],[2,4],[3,4],[3,3],[4,3]]},
    {color:secondary,points:[[3,3],[3,2],[4,2]]}
  ],[
    {at:[4,1],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[1,0],role:'finish',color:primary},
    {at:[1,4],role:'start',color:secondary},{at:[4,3],role:'finish',color:secondary},{at:[4,2],role:'finish',color:secondary}
  ]);
  const makeEpisodeOnePairE=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,3],[3,3],[3,2],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[3,2],[3,1],[2,1]]},
    {color:secondary,points:[[1,0],[2,0],[3,0],[4,0]]},
    {color:secondary,points:[[2,0],[2,1],[1,1],[0,1]]}
  ],[
    {at:[4,3],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[2,1],role:'finish',color:primary},
    {at:[1,0],role:'start',color:secondary},{at:[4,0],role:'finish',color:secondary},{at:[0,1],role:'finish',color:secondary}
  ]);
  const makeEpisodeOnePairF=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,0],[3,0],[3,1],[3,2],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[3,2],[3,3],[2,3]]},
    {color:secondary,points:[[0,4],[1,4],[1,3],[1,2],[1,1],[0,1]]},
    {color:secondary,points:[[1,1],[2,1],[2,0],[1,0]]}
  ],[
    {at:[4,0],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[2,3],role:'finish',color:primary},
    {at:[0,4],role:'start',color:secondary},{at:[0,1],role:'finish',color:secondary},{at:[1,0],role:'finish',color:secondary}
  ]);
  // Level 02 introduces the straight two-way source. When it is horizontal,
  // both neighboring cells (including C2) are active candidates.
  const makeEpisodeOneLevel02=()=>makeNetwork(3,5,[
    {color:'blue',points:[[1,1],[1,0],[0,0]]},
    {color:'blue',points:[[1,1],[1,2],[1,3],[2,3]]}
  ],[
    {at:[1,1],role:'start',color:'blue'},{at:[0,0],role:'finish',color:'blue'},{at:[2,3],role:'finish',color:'blue'}
  ]);
  const makeCenteredForkA=color=>makeNetwork(5,5,[
    {color,points:[[2,2],[3,2],[3,1],[2,1],[1,1],[0,1],[0,0]]},
    {color,points:[[3,1],[3,0],[4,0]]},
    {color,points:[[3,2],[3,3],[2,3],[1,3],[0,3],[0,4]]}
  ],[
    {at:[2,2],role:'start',color},{at:[0,0],role:'finish',color},{at:[4,0],role:'finish',color},{at:[0,4],role:'finish',color}
  ]);
  const makeCenteredForkB=color=>makeNetwork(5,5,[
    {color,points:[[2,2],[3,2],[3,1],[2,1],[1,1],[0,1],[0,0]]},
    {color,points:[[3,1],[3,0],[4,0]]},
    {color,points:[[3,2],[3,3],[4,3],[4,4]]}
  ],[
    {at:[2,2],role:'start',color},{at:[0,0],role:'finish',color},{at:[4,0],role:'finish',color},{at:[4,4],role:'finish',color}
  ]);
  const makeCenteredForkC=color=>makeNetwork(5,5,[
    {color,points:[[2,2],[3,2],[3,3],[4,3],[4,4]]},
    {color,points:[[3,3],[2,3],[1,3],[0,3]]},
    {color,points:[[3,2],[3,1],[4,1],[4,0]]}
  ],[
    {at:[2,2],role:'start',color},{at:[4,4],role:'finish',color},{at:[0,3],role:'finish',color},{at:[4,0],role:'finish',color}
  ]);
  const makeCenteredForkD=color=>makeNetwork(5,5,[
    {color,points:[[2,2],[1,2],[1,1],[0,1],[0,0]]},
    {color,points:[[1,1],[1,0],[2,0],[3,0],[4,0]]},
    {color,points:[[1,2],[1,3],[2,3],[3,3],[4,3],[4,4]]}
  ],[
    {at:[2,2],role:'start',color},{at:[0,0],role:'finish',color},{at:[4,0],role:'finish',color},{at:[4,4],role:'finish',color}
  ]);
  const makeEpisodeOneCrossA=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[4,2],[3,2],[2,2],[1,2],[0,2]]},
    {color:primary,points:[[3,2],[3,3],[4,3]]},
    {color:secondary,points:[[2,0],[2,1],[2,2],[2,3],[2,4]]},
    {color:secondary,points:[[2,3],[1,3],[0,3]]}
  ],[
    {at:[4,2],role:'start',color:primary},{at:[0,2],role:'finish',color:primary},{at:[4,3],role:'finish',color:primary},
    {at:[2,0],role:'start',color:secondary},{at:[2,4],role:'finish',color:secondary},{at:[0,3],role:'finish',color:secondary}
  ]);
  const makeEpisodeOneCrossB=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[3,0],[3,1],[2,1],[2,2],[2,3],[1,3],[0,3]]},
    {color:primary,points:[[2,1],[1,1],[0,1]]},
    {color:secondary,points:[[4,2],[3,2],[2,2],[1,2],[0,2]]},
    {color:secondary,points:[[3,2],[3,3],[4,3]]}
  ],[
    {at:[3,0],role:'start',color:primary},{at:[0,3],role:'finish',color:primary},{at:[0,1],role:'finish',color:primary},
    {at:[4,2],role:'start',color:secondary},{at:[0,2],role:'finish',color:secondary},{at:[4,3],role:'finish',color:secondary}
  ]);
  const makeEpisodeOneCrossC=(primary,secondary)=>makeNetwork(5,5,[
    {color:primary,points:[[0,2],[1,2],[2,2],[3,2],[4,2]]},
    {color:primary,points:[[3,2],[3,1],[4,1]]},
    {color:secondary,points:[[2,4],[2,3],[2,2],[2,1],[2,0]]},
    {color:secondary,points:[[2,1],[1,1],[0,1]]}
  ],[
    {at:[0,2],role:'start',color:primary},{at:[4,2],role:'finish',color:primary},{at:[4,1],role:'finish',color:primary},
    {at:[2,4],role:'start',color:secondary},{at:[2,0],role:'finish',color:secondary},{at:[0,1],role:'finish',color:secondary}
  ]);
  const episodeOneSingles=[
    ...singleLayouts.slice(0,4).map((layout,index)=>reframeStage(makeSingleEpisodeStage(layout,'green'),index)),
    reframeStage(makeCenteredForkA('green'),4),reframeStage(makeCenteredForkB('green'),5),reframeStage(makeCenteredForkC('green'),6),reframeStage(makeCenteredForkD('green'),7)
  ];
  const episodeOnePairSeeds=[
    makeEpisodeOnePairA('green','blue'),makeEpisodeOnePairB('blue','red'),makeEpisodeOnePairD('red','green'),makeEpisodeOneCrossA('green','blue'),
    withNetworkBranch(makeEpisodeOnePairB('blue','red'),'blue',[2,1],[2,2]),withNetworkBranch(makeEpisodeOnePairA('red','green'),'red',[2,2],[2,3]),makeEpisodeOneCrossB('green','red'),withNetworkBranch(makeEpisodeOnePairD('blue','green'),'blue',[1,2],[1,3]),
    withNetworkBranch(makeEpisodeOnePairA('red','blue'),'red',[1,2],[1,3]),makeEpisodeOneCrossC('green','blue'),withNetworkBranch(makeEpisodeOnePairB('blue','red'),'red',[1,4],[0,4]),withNetworkBranch(makeEpisodeOnePairA('green','red'),'green',[3,3],[2,3])
  ];
  const episodeOne=applyStartProgression([...episodeOneSingles,...episodeOnePairSeeds.map((stage,index)=>reframeStage(stage,index+8))],0);
  episodeOne[1]=makeEpisodeOneLevel02();
  const episodeTwoSeeds=[
    makeCrossFork('green','blue'),makeCenterFork('green','blue'),makeSpiralT('green','blue'),withNetworkBranch(makeCrossFork('blue','red'),'blue',[2,3],[3,3]),makeTwoCrossMesh('green','blue'),
    withNetworkBranch(makeTwoCrossMesh('green','blue'),'green',[1,4],[1,5]),makeCenterFork('blue','red'),withNetworkBranch(makeSpiralT('red','green'),'red',[2,0],[2,1]),withNetworkBranch(makeCrossFork('blue','green'),'blue',[1,1],[1,0]),withNetworkBranch(makeTwoCrossMesh('blue','red'),'blue',[2,4],[2,5]),
    withNetworkBranch(makeTwoCrossMesh('red','green'),'green',[4,4],[5,4]),withNetworkBranch(makeCenterFork('green','red'),'green',[2,1],[2,0]),withNetworkBranch(makeTwoCrossMesh('red','blue'),'red',[3,4],[3,5]),withNetworkBranch(makeSpiralT('blue','green'),'green',[3,3],[4,3]),withNetworkBranch(makeCrossFork('red','blue'),'red',[1,3],[1,4]),
    withNetworkBranch(makeTwoCrossMesh('blue','red'),'blue',[4,1],[5,1]),withNetworkBranch(makeTwoCrossMesh('green','red'),'green',[2,1],[2,0]),withNetworkBranch(makeCenterFork('red','green'),'red',[1,1],[1,0]),withNetworkBranch(makeTwoCrossMesh('blue','green'),'blue',[1,1],[1,0]),withNetworkBranch(makeTwoCrossMesh('green','blue'),'green',[3,4],[3,5])
  ];
  const episodeTwo=applyStartProgression(episodeTwoSeeds.map((stage,index)=>reframeStage(stage,index+20)),20);
  episodeTwo[9]=promoteStartToHub(makeStageTwoNetwork10(),startPortCountForLevel(10),29);
  episodeTwo[12]=makeStageTwoNetwork13();
  const episodeThreeSeeds=[
    baseCampaign[4],baseCampaign[6],makeOffsetDual('green','blue','red'),makeTriDual(['green','blue','red']),makeDualTower('blue','red','green'),
    makeInterwoven09(),makeAdvancedTrident('green','blue','red'),makeAdvancedPTurnCross('blue','red','green'),makeBossMesh('red','green','blue'),makeCrossSpoke('green','blue','red'),
    makeBossPTurn('blue','green','red'),makeFinalCrown('red','blue','green'),makeMultiCross('green','red','blue'),makeAdvancedSpiral('blue','red','green'),makePortComplete27(),
    makePortComplete27(),makeInterwoven25(),makeReference26(),makeTriLadder('green','red','blue'),makeFinalSwitchboard('red','green','blue')
  ];
  const makeFourWayStartFinal=()=>makeNetwork(7,7,[
    {color:'green',points:[[3,3],[2,3],[1,3],[0,3]]},{color:'green',points:[[3,3],[4,3],[5,3],[6,3]]},
    {color:'green',points:[[3,3],[3,2],[3,1],[3,0]]},{color:'green',points:[[3,3],[3,4],[3,5],[3,6]]},
    {color:'blue',points:[[0,0],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[0,5]]},{color:'blue',points:[[1,4],[2,4],[2,5],[2,6]]},
    {color:'red',points:[[6,0],[5,0],[5,1],[4,1],[4,2],[4,3],[4,4],[5,4],[6,4]]},{color:'red',points:[[4,4],[4,5],[5,5],[6,5]]}
  ],[
    {at:[3,3],role:'start',color:'green'},{at:[0,3],role:'finish',color:'green'},{at:[6,3],role:'finish',color:'green'},{at:[3,0],role:'finish',color:'green'},{at:[3,6],role:'finish',color:'green'},
    {at:[0,0],role:'start',color:'blue'},{at:[0,5],role:'finish',color:'blue'},{at:[2,6],role:'finish',color:'blue'},
    {at:[6,0],role:'start',color:'red'},{at:[6,4],role:'finish',color:'red'},{at:[6,5],role:'finish',color:'red'}
  ]);
  const episodeThree=applyStartProgression(episodeThreeSeeds.map((stage,index)=>reframeStage(stage,index+40)),40);
  episodeThree[19]=makeFourWayStartFinal();
  STAGES.splice(0,STAGES.length,...episodeOne,...episodeTwo,...episodeThree);
  STAGE_TEMPLATES.splice(0,STAGE_TEMPLATES.length,...STAGES.map(definition=>[definition]));

  // Independent board-size tests use the same stage builder and interaction rules
  // as the campaign, but never appear in the campaign's progress list.
  const TEST_SIZE_STAGE_INDEX=new Map();
  const makeSizeTestStage=(cols,rows)=>{
    const upPath=Array.from({length:rows},(_,offset)=>[rows-1-offset,0]);
    const acrossPath=Array.from({length:cols-1},(_,offset)=>[0,offset+1]);
    return {rows,cols,testLabel:`${cols}×${rows}`,paths:[{color:'green',points:[...upPath,...acrossPath]}],endpoints:[
      {at:[rows-1,0],role:'start',color:'green'},{at:[0,cols-1],role:'finish',color:'green'}
    ]};
  };
  for(let rows=3;rows<=8;rows++)for(let cols=3;cols<=8;cols++){
    const index=STAGES.length,definition=makeSizeTestStage(cols,rows);
    STAGES.push(definition);STAGE_TEMPLATES.push([definition]);TEST_SIZE_STAGE_INDEX.set(`${cols}x${rows}`,index);
  }

  const lastLayoutByStage=Array(STAGES.length).fill(null);

  const STORAGE_KEY='line-puzzle-campaign-v4',LEGACY_PROFILE_STORAGE_KEY='line-puzzle-player-profile-v1';
  const initialProgress=()=>({unlocked:1,current:0,results:{},solutions:{}});
  function loadProgress(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&Number.isInteger(saved.unlocked)&&saved.results){const {movesByStage,...campaign}=saved;return {...initialProgress(),...campaign};}}catch(error){}return initialProgress();}
  function saveProgress(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch(error){}}
  let progress=loadProgress();try{localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY);}catch(error){}progress.unlocked=Math.min(TEST_STAGE_COUNT,Math.max(1,progress.unlocked));progress.current=Math.min(progress.unlocked-1,Math.max(0,progress.current));
  // The GO tile is always the first level without a clear record.  Deriving it
  // from results also repairs saves made before replay-return handling existed.
  function syncProgressCursor(){
    const next=Array.from({length:TEST_STAGE_COUNT},(_,index)=>index).find(index=>!progress.results[index]);
    progress.current=next===undefined?TEST_STAGE_COUNT-1:next;
    progress.unlocked=next===undefined?TEST_STAGE_COUNT:Math.min(TEST_STAGE_COUNT,next+1);
  }
  syncProgressCursor();saveProgress();
let adminMode=false,adminEpisode=null,homeEpisode=null,homeToolsHoldTimer=null;
  let game,timerId,startTimeout;
  const key=(index,direction)=>`${index}:${direction}`;
  const pointKey=([row,column])=>`${row},${column}`;
  const pad=value=>String(value).padStart(2,'0');
  const rotate=(dirs,amount)=>dirs.map(direction=>(direction+amount)%4);
  const same=(first,second)=>first.length===second.length&&first.every(value=>second.includes(value));
  const dirTo=([row,column],[nextRow,nextColumn])=>nextRow<row?UP:nextColumn>column?RIGHT:nextRow>row?DOWN:LEFT;
  const inside=(stage,row,column)=>row>=0&&row<stage.rows&&column>=0&&column<stage.cols?row*stage.cols+column:-1;
  const SOURCE_PORTS={start2a:[LEFT,DOWN],start2b:[LEFT,RIGHT],start3:[LEFT,DOWN,RIGHT],start4:[UP,RIGHT,DOWN,LEFT]};
  const sourceShapeFor=directions=>{
    if(directions.length===4)return 'start4';
    if(directions.length===3)return 'start3';
    if(directions.length===2)return same(directions,[UP,DOWN])||same(directions,[LEFT,RIGHT])?'start2b':'start2a';
    return null;
  };
  const sourceTargetFor=(shape,directions)=>{
    if(shape==='start4')return 0;
    const span=shape==='start2b'?2:4;
    return Array.from({length:span},(_,rotation)=>rotation).find(rotation=>same(rotate(SOURCE_PORTS[shape],rotation),directions))??0;
  };
  const endpointPorts=tile=>tile.sourceShape?rotate(SOURCE_PORTS[tile.sourceShape],tile.rotation):[tile.rotation];
  const endpointRotationSpan=tile=>tile.sourceShape==='start2b'?2:tile.sourceShape==='start4'?1:4;

  function ports(tile){
    if(tile.type==='endpoint')return endpointPorts(tile);
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
    if(tile.type==='pturn'){const route={[LEFT]:UP,[UP]:LEFT,[RIGHT]:DOWN,[DOWN]:RIGHT};return [route[incoming]];}
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
    const canCarryRoute=nextTile&&((nextTile.type==='endpoint')||nextTile.type==='cross'||nextTile.touched||nextTile.primed||nextTile.preAligned);
    if(next>=0&&canCarryRoute&&ports(nextTile).includes(OPP[direction])&&(nextTile.type!=='filter'||nextTile.filterColor===color))result.push(key(next,OPP[direction]));
    exits(stage.tiles[index],direction,color,ignoreTClaim).forEach(exit=>result.push(key(index,exit)));
    return result;
  }
  // 성공 판정은 시작점에서만, 활성 색상 표시는 시작·도착 양쪽 끝점에서 탐색합니다.
  function traverseColor(stage,color,ignoreTClaim=false,fromAllEndpoints=false){
    const endpoints=stage.tiles.map((tile,index)=>tile.type==='endpoint'&&tile.color===color&&(fromAllEndpoints||tile.role==='start')?index:-1).filter(index=>index>=0);
    const visited=new Set(),queue=[];
    endpoints.forEach(index=>{
      endpointPorts(stage.tiles[index]).forEach(direction=>{
        const state=key(index,direction);visited.add(state);queue.push([index,direction]);
      });
    });
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
    // Both starts and finishes grow candidate routes. Completion still uses the
    // independent start-only state below, so a finish cannot clear itself.
    const raw={green:traverseColor(stage,'green',true,true),blue:traverseColor(stage,'blue',true,true),red:traverseColor(stage,'red',true,true)};
    stage.tiles.forEach((tile,index)=>{
      if(tile.type!=='tee')return;
      const candidates=PATH_COLORS.filter(color=>[...raw[color]].some(state=>Number(state.split(':')[0])===index));
      if(tile.claimedColor&&!candidates.includes(tile.claimedColor))tile.claimedColor=null;
      if(!tile.claimedColor&&candidates.length)tile.claimedColor=candidates[0];
    });
    // states는 클리어 판정용, visualStates는 양쪽 끝에서 이어진 길의 실시간 색상 표시용입니다.
    const startStates={green:traverseColor(stage,'green'),blue:traverseColor(stage,'blue'),red:traverseColor(stage,'red')};
    const states={green:traverseColor(stage,'green',false,true),blue:traverseColor(stage,'blue',false,true),red:traverseColor(stage,'red',false,true)};
    const visualStates=states;
    const colorsByTile=Array.from({length:stage.tiles.length},()=>new Set());
    Object.entries(visualStates).forEach(([color,portsSet])=>portsSet.forEach(state=>colorsByTile[Number(state.split(':')[0])].add(color)));
    // 시작 직후에는 끝점만 색상을 유지해, 미조작 블록이 Move를 쓴 것처럼 보이지 않게 합니다.
    stage.tiles.forEach((tile,index)=>{if(tile.type==='endpoint')colorsByTile[index].add(tile.color);});
    return {states,startStates,visualStates,colorsByTile};
  }
  function sourcePortReachesFinish(stage,color,startIndex,direction){
    const visited=new Set([key(startIndex,direction)]),queue=[[startIndex,direction]];
    while(queue.length){
      const [index,incoming]=queue.shift(),tile=stage.tiles[index];
      if(index!==startIndex&&tile.type==='endpoint'&&tile.role==='finish'&&tile.color===color)return true;
      neighbors(stage,index,incoming,color).forEach(next=>{if(!visited.has(next)){visited.add(next);queue.push(next.split(':').map(Number));}});
    }
    return false;
  }
  function sourcePortsComplete(stage,color=null){
    return stage.tiles.every((tile,index)=>tile.type!=='endpoint'||tile.role!=='start'||(color&&tile.color!==color)||endpointPorts(tile).every(direction=>sourcePortReachesFinish(stage,tile.color,index,direction)));
  }
  function isComplete(stage,connections){
    return stage.tiles.every((tile,index)=>tile.type!=='endpoint'||tile.role!=='finish'||connections.startStates[tile.color].has(key(index,tile.rotation)))&&sourcePortsComplete(stage);
  }
  function colorIsComplete(stage,connections,color){
    return stage.tiles.every((tile,index)=>tile.type!=='endpoint'||tile.role!=='finish'||tile.color!==color||connections.startStates[color].has(key(index,tile.rotation)))&&sourcePortsComplete(stage,color);
  }
  // Validates the *solved* graph, not just whether endpoints are connected.
  // A special tile passes only when every one of its intended ports is reached
  // from a start point in the actual solution.
  function validateSpecialUsage(stage){
    const snapshot=stage.tiles.map(tile=>({rotation:tile.rotation,touched:tile.touched,primed:tile.primed,claimedColor:tile.claimedColor,completedColor:tile.completedColor}));
    stage.tiles.forEach(tile=>{
      if(!tile.required)return;
      tile.rotation=tile.target;
      if(tile.type!=='endpoint'&&tile.type!=='cross'&&tile.type!=='pturn')tile.touched=true;
      tile.primed=true;
    });
    const connections=resolveConnections(stage),usedByTile=Array.from({length:stage.tiles.length},()=>new Set());
    PATH_COLORS.forEach(color=>connections.startStates[color].forEach(state=>{
      const [index,direction]=state.split(':').map(Number);
      usedByTile[index].add(direction);
    }));
    const routeTileCounts=Object.fromEntries(PATH_COLORS.map(color=>[color,new Set([...connections.startStates[color]].map(state=>Number(state.split(':')[0]))).size]));
    const shortRoutes=stage.index>=5?PATH_COLORS.filter(color=>routeTileCounts[color]>0&&routeTileCounts[color]<4):[];
    const unusedRequired=[],specials=[];
    stage.tiles.forEach((tile,index)=>{
      if(tile.required&&tile.type!=='endpoint'&&!usedByTile[index].size)unusedRequired.push(index);
      if(!['cross','dual','tee'].includes(tile.type))return;
      const requiredPorts=tile.type==='tee'?ports(tile):[UP,RIGHT,DOWN,LEFT];
      const usedPorts=[...usedByTile[index]].sort((a,b)=>a-b);
      const missingPorts=requiredPorts.filter(direction=>!usedByTile[index].has(direction));
      specials.push({index,type:tile.type,usedPorts,missingPorts,valid:!missingPorts.length});
    });
    const report={
      endpointComplete:isComplete(stage,connections),sourcePortsComplete:sourcePortsComplete(stage),
      unusedRequired,
      routeTileCounts,
      shortRoutes,
      specials,
      valid:isComplete(stage,connections)&&sourcePortsComplete(stage)&&!unusedRequired.length&&!shortRoutes.length&&specials.every(item=>item.valid)
    };
    stage.tiles.forEach((tile,index)=>Object.assign(tile,snapshot[index]));
    return report;
  }
  function validateCampaign(){
    return STAGES.map((_,index)=>{
      const stage=buildStage(index);
      return {stage:index+1,...validateSpecialUsage(stage)};
    });
  }  function updateCompletedColors(stage,connections){
    const pulse=[];
    PATH_COLORS.forEach(color=>{
      if(stage.completedColors.has(color)&&!colorIsComplete(stage,connections,color)){
        stage.completedColors.delete(color);
        stage.tiles.forEach(tile=>{if(tile.completedColor===color)tile.completedColor=null;});
      }
      if(stage.completedColors.has(color)||!colorIsComplete(stage,connections,color))return;
      stage.completedColors.add(color);
      connections.states[color].forEach(state=>{
        const index=Number(state.split(':')[0]),tile=stage.tiles[index];
        if(tile.type!=='endpoint')tile.completedColor=color;
        pulse.push(index);
      });
    });
    return pulse;
  }
  // A candidate is an untouched tile immediately next to a colored route. It is
  // visibly offered to the player, but it does not spend a move until rotated.
  function candidateTiles(stage,connections){
    const candidates=new Set();
    stage.tiles.forEach((tile,index)=>{
      if(tile.type==='endpoint'||tile.type==='cross'||tile.type==='pturn'||tile.touched||tile.primed||connections.colorsByTile[index].size)return;
      const row=Math.floor(index/stage.cols),column=index%stage.cols;
      const receivesFromStart=DELTAS.some(([dr,dc],direction)=>{
        const neighbor=inside(stage,row+dr,column+dc);
        if(neighbor<0)return false;
        // direction is from this candidate to its neighbor. The active route must
        // actually leave the neighbor toward this candidate, not merely sit beside it.
        const outward=OPP[direction];
        return PATH_COLORS.some(color=>connections.states[color].has(key(neighbor,outward)));
      });
      if(receivesFromStart)candidates.add(index);
    });
    return candidates;
  }
  function tileConnectsToActive(stage,index,connections){
    const tile=stage.tiles[index],row=Math.floor(index/stage.cols),column=index%stage.cols;
    return ports(tile).some(direction=>{
      const [dr,dc]=DELTAS[direction],neighbor=inside(stage,row+dr,column+dc);
      if(neighbor<0)return false;
      return PATH_COLORS.some(color=>connections.states[color].has(key(neighbor,OPP[direction])));
    });
  }
  function colorKeys(connections){return connections.colorsByTile.map(colors=>[...colors].sort().join('|'));}

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
    // 같은 레벨은 항상 같은 초기 타일 상태를 사용합니다.
    let seed=((index+1)*2654435761+templateIndex*1013904223+variant.length*374761393)>>>0;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const definition=transformedStage(STAGE_TEMPLATES[index][templateIndex],variant),edgeMap=new Map(),colorEdgeMap=new Map(),specialMap=new Map((definition.specials||[]).filter(item=>item.type!=='filter').map(item=>[pointKey(item.at),item])),preAligned=new Set((definition.preAligned||[]).map(pointKey));
    definition.paths.forEach(({color,points})=>{
      for(let step=0;step<points.length-1;step++){
        const first=pointKey(points[step]),second=pointKey(points[step+1]);
        if(!edgeMap.has(first))edgeMap.set(first,[]);if(!edgeMap.has(second))edgeMap.set(second,[]);
        edgeMap.get(first).push(dirTo(points[step],points[step+1]));edgeMap.get(second).push(dirTo(points[step+1],points[step]));
        const colorFirst=`${color}:${first}`,colorSecond=`${color}:${second}`;
        if(!colorEdgeMap.has(colorFirst))colorEdgeMap.set(colorFirst,[]);if(!colorEdgeMap.has(colorSecond))colorEdgeMap.set(colorSecond,[]);
        colorEdgeMap.get(colorFirst).push(dirTo(points[step],points[step+1]));colorEdgeMap.get(colorSecond).push(dirTo(points[step+1],points[step]));
      }
    });
    const endpointMap=new Map(definition.endpoints.map(item=>[pointKey(item.at),item]));
    const tiles=Array.from({length:definition.rows*definition.cols},(_,index)=>{
      const row=Math.floor(index/definition.cols),column=index%definition.cols,point=pointKey([row,column]);
      const endpoint=endpointMap.get(point),special=specialMap.get(point),directions=[...new Set(edgeMap.get(point)||[])];
      if(endpoint){
        const endpointDirections=[...new Set(colorEdgeMap.get(`${endpoint.color}:${point}`)||directions)],sourceShape=endpoint.role==='start'?sourceShapeFor(endpointDirections):null;
        const target=sourceShape?sourceTargetFor(sourceShape,endpointDirections):endpointDirections[0];
        return {type:'endpoint',role:endpoint.role,color:endpoint.color,locked:false,target,rotation:target,sourceShape,required:true,touched:false};
      }
      if(special){const target=(special.type==='cross'||special.type==='pturn')?0:special.type==='tee'?targetFor('tee',directions):special.type==='filter'?targetFor('filter',directions):dualTargetFor(definition,special.at);return {type:special.type,target,rotation:target,required:true,touched:special.type==='cross'||special.type==='pturn',claimedColor:null,filterColor:special.color};}
      if(directions.length===2){
        const type=same(directions,[UP,DOWN])||same(directions,[LEFT,RIGHT])?'straight':'corner';
        const target=targetFor(type,directions);return {type,target,rotation:target,required:true,touched:false};
      }
      const type=random()<.5?'straight':'corner',rotation=Math.floor(random()*(type==='straight'?2:4));
      return {type,target:rotation,rotation,required:false,touched:false};
    });
    tiles.forEach((tile,index)=>{const row=Math.floor(index/definition.cols),column=index%definition.cols;tile.preAligned=preAligned.has(pointKey([row,column]));});
    const stage={index,variant,templateIndex,testLabel:definition.testLabel||null,rows:definition.rows,cols:definition.cols,tiles,moves:0,locked:true,animating:false,hasPlayerMoved:false,completedColors:new Set(),candidateTiles:new Set(),candidateJustActivated:new Set(),colorKeys:[]};
    tiles.forEach(tile=>{
      if(tile.type==='cross'||tile.type==='pturn')return;
      if(tile.type==='endpoint'){
        tile.rotation=tile.role==='start'&&tile.sourceShape&&tile.sourceShape!=='start4'
          ?(tile.target+1+Math.floor(random()*(endpointRotationSpan(tile)-1)))%endpointRotationSpan(tile)
          :tile.role==='start'?tile.target:(tile.target+1+Math.floor(random()*3))%4;
        return;
      }
      const span=tile.type==='straight'||tile.type==='filter'?2:4;
      // Every non-prealigned required tile is exactly one clockwise turn away
      // from its solution. This keeps perfectMoves equal to actual minimum taps.
      if(tile.required&&!tile.preAligned)tile.rotation=(tile.target+span-1)%span;
    });
    tiles.forEach(tile=>{tile.origin=tile.rotation;});
    stage.perfectMoves=tiles.filter(tile=>tile.required&&tile.type!=='endpoint'&&tile.type!=='cross'&&tile.origin!==tile.target).length;
    // 생성 시 완료 상태가 되지 않도록 최소 한 개의 일반 경로 타일은 섞습니다.
    if(!stage.perfectMoves){const candidate=tiles.find(tile=>tile.required&&tile.type!=='endpoint'&&tile.type!=='cross');if(candidate){candidate.rotation=(candidate.target+1)%(candidate.type==='straight'||candidate.type==='filter'?2:4);candidate.origin=candidate.rotation;stage.perfectMoves=1;}}
    const movableCount=tiles.filter(tile=>tile.type!=='endpoint'&&tile.type!=='cross').length;
    // Perfect를 기준으로 한 번의 여유만 등급마다 주고, +3회부터는 실패가 됩니다.
    // 작은 보드에서도 모든 조작 가능 블록을 다 만지기 전에 실패하도록 상한을 둡니다.
    // Endpoint-adjacent tiles are candidates too, so compact boards may use every movable tile.
    const spareMoves=Math.max(1,movableCount-stage.perfectMoves);
    stage.maxMoves=stage.perfectMoves+Math.min(4,spareMoves);
    stage.greatMoves=Math.min(stage.perfectMoves+(index<3?2:1),stage.maxMoves);
    stage.goodMoves=stage.maxMoves;
    return stage;
  }
  // 아직 건드리지 않은 필수 타일 중 정답 방향과 다른 타일만 추가 Move가 필요합니다.
  // 2차선이 두 색으로 잠긴 경우에는 다른 길을 풀어 복구할 수 있으므로 이 판정만으로 실패시키지 않습니다.
  function hasNoRouteWithinMoves(stage){
    const requiredNewMoves=stage.tiles.reduce((count,tile)=>{
      if(!tile.required||tile.type==='endpoint'||tile.type==='cross'||tile.type==='pturn'||tile.rotation===tile.target||tile.touched)return count;
      return count+1;
    },0);
    return stage.moves+requiredNewMoves>stage.maxMoves;
  }
  function chooseLayout(index){
    if(!TEST_LAYOUT_VARIANTS)return {templateIndex:0,variant:'identity',key:'0:identity'};
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
      // Current UI evaluates only PERFECT and MAX MOVES. One valid extra move is enough. 
      if(stage.maxMoves<=stage.perfectMoves)continue;
      stage.solutionValidation=validateSpecialUsage(stage);
      if(!stage.solutionValidation.valid)console.warn("Stage ${index+1} has unused solution ports.",stage.solutionValidation);
      stage.connections=connections;
      stage.candidateTiles=candidateTiles(stage,connections);
      stage.candidateJustActivated=new Set(stage.candidateTiles);
      stage.colorKeys=colorKeys(connections);
      lastLayoutByStage[index]=layout.key;
      return stage;
    }
    throw new Error('유효한 테스트 스테이지를 만들지 못했습니다.');
  }

  function boardMetrics(){
    // The playable board must measure itself from the fixed 9:16 canvas, not
    // from the surrounding letterboxed browser viewport.
    const content=frame.closest('.game-content');
    const canvasWidth=content?.clientWidth||gameScreen.clientWidth||window.innerWidth;
    const canvasHeight=content?.clientHeight||gameScreen.clientHeight||window.innerHeight;
    const width=Math.min(Math.max(180,canvasWidth),600),height=Math.max(180,canvasHeight-40);
    const reference=Math.min(100,width/4,height/4),size=Math.max(28,Math.min(reference,width/game.cols,height/game.rows));
    return {width:size*game.cols,height:size*game.rows};
  }
  // 회전값과 화면 회전각을 분리합니다. 화면각은 누적해 270° → 360°도 항상 시계 방향으로 보이게 합니다.
  function angleFor(tile){return tile.type==='endpoint'?(tile.sourceShape?(tile.sourceShape==='start4'?0:tile.rotation*90):((tile.rotation-RIGHT+4)%4)*90):tile.type==='cross'?0:tile.rotation*90;}
  function displayAngle(tile){return Number.isFinite(tile.displayAngle)?tile.displayAngle:angleFor(tile);}
  function roadSvg(tile){
    let path='';
    if(tile.type==='straight')path='<path class="road-path" d="M50 -1V101"/>';
    else if(tile.type==='filter')path='<path class="road-path" d="M50 -1V101"/><circle class="filter-core" cx="50" cy="50" r="12"/>';
    else if(tile.type==='corner')path='<path class="road-path" d="M50 -1V50H101"/>';
    else if(tile.type==='tee')path='<path class="road-path" d="M-1 50H101M50 50V101"/>';
    else if(tile.type==='cross'||tile.type==='pturn')path='<path class="road-path" d="M50 -1V101M-1 50H101"/>';
    else if(tile.type==='dual')path='<path class="road-path" d="M50 -1C50 25 75 50 101 50M-1 50C25 50 50 75 50 101"/>';
    // 시작/끝: 도로 위에 50% 크기의 흰색 사각 패널을 올리는 레이어 구조입니다.
    else path='<path class="road-path endpoint-path" d="M50 50H101"/>'+'<rect class="endpoint-core" x="25" y="25" width="50" height="50" rx="20"/>';
    return `<svg class="road-svg" viewBox="0 0 100 100" aria-hidden="true"><g class="road-shape" style="transform:rotate(${displayAngle(tile)}deg)">${path}</g></svg>`;
  }
  function testTileArt(tile,index,colors,isCandidate){
    // The supplied 2-way PNG filenames are opposite to their visible ports:
    // 2_a is straight (left/right), while 2_b is corner (left/down).
    const lineByType={straight:'line_straight.png',filter:'line_straight.png',corner:'line_curve.png',tee:'line_t.png?v=v0-3-tee-resource-2',cross:'line_start_cross.png',pturn:'line_start_cross.png',dual:'line_two_line.png',endpoint:'line_start_end.png',start2a:'line_start_end_2_b.png',start2b:'line_start_end_2_a.png',start3:'line_start_end_3.png',start4:'line_start_end_4.png'};
    const blockByColor={green:'block_green.png',blue:'block_blue.png',red:'block_red.png'};
    const laneColors=tile.type==='dual'?dualLaneColors(tile,index,game.connections).filter(Boolean):[];
    const solidColor=tile.type==='endpoint'?tile.color:(laneColors[0]||[...colors][0]||tile.completedColor||null);
    const mixed=tile.type==='dual'&&laneColors.length===2&&laneColors[0]!==laneColors[1];
    // line_two_line의 이미지 레이어는 엔진의 두 차선과 좌우가 반대로 매핑됩니다.
    // 따라서 표시용 블록 색상은 논리 차선 순서를 뒤집어야 실제로 연결된 선의
    // 색상과 일치합니다. (예: Stage 07 C3)
    const displayLaneColors=[laneColors[1],laneColors[0]];
    const base=mixed
      ?`<img class="test-block-art test-dual-base" src="assets/${blockByColor[displayLaneColors[0]]}" alt=""><img class="test-block-art test-dual-cut" src="assets/${blockByColor[displayLaneColors[1]]}" alt=""><img class="test-block-art test-dual-bottom" src="assets/${blockByColor[displayLaneColors[1]]}" alt="">`
      :`<img class="test-block-art" src="assets/${tile.type==='cross'||tile.type==='pturn'?'block_black.png':blockByColor[solidColor]||'block_off.png'}" alt="">`;
    const light=isCandidate?'<img class="test-light-art" src="assets/block_off_light.png" alt="">':'';
    const lineOpacity=(solidColor||mixed||isCandidate||tile.type==='endpoint'||tile.type==='cross'||tile.type==='pturn')?'':' test-road-off';
    const startText=tile.type==='endpoint'&&tile.role==='start'?`<img class="test-start-art" src="assets/${tile.color}_text_start.png" alt="">`:'';
    // Image source-port conventions:
    // curve = left/down, start-end = left, straight = left/right,
    // two-line = left/down + up/right. These differ from legacy SVG bases.
    const artType=tile.type==='endpoint'&&tile.sourceShape?tile.sourceShape:tile.type;
    const roadAngle=tile.type==='endpoint'?(tile.sourceShape?(tile.sourceShape==='start4'?0:tile.rotation*90):((tile.rotation-LEFT+4)%4)*90)
      :tile.type==='straight'||tile.type==='filter'?((tile.rotation+1)%2)*90
      :tile.type==='corner'||tile.type==='dual'?((tile.rotation+2)%4)*90
      :tile.type==='tee'?tile.rotation*90
      :0;
    return `<span class="test-tile-art${mixed?` test-dual-${tile.rotation%2}`:''}">${base}${light}<img class="test-road-art${lineOpacity}" src="assets/${lineByType[artType]}" style="transform:rotate(${roadAngle}deg)" alt="">${startText}</span>`;
  }
  function dualLaneColors(tile,index,connections){
    const lanes=[rotate([UP,RIGHT],tile.rotation),rotate([LEFT,DOWN],tile.rotation)];
    return lanes.map(lane=>{
      const colors=PATH_COLORS.filter(color=>lane.some(direction=>connections.states[color].has(key(index,direction))));
      return colors[0]||null;
    });
  }
  function dualGradientDirection(rotation){
    return ['to bottom left','to top left','to top right','to bottom right'][rotation%4];
  }
  function visualClass(tile,colors){
    if(tile.type==='endpoint')return `color-${tile.color}`;
    if(tile.type==='cross'||tile.type==='pturn')return 'touched';
    if(!colors.size)return tile.touched?'touched':tile.completedColor?`color-${tile.completedColor}`:'idle';
    if(colors.size>1&&tile.type!=='dual')return 'touched';
    if(tile.type==='dual'&&colors.size>1)return 'dual-mixed';
    return `color-${[...colors][0]}`;
  }
  function backgroundForClass(tile,colors){
    if(tile.type==='cross'||tile.type==='pturn')return COLORS.mixed;
    if(!colors.size)return tile.touched?getComputedStyle(document.documentElement).getPropertyValue('--moved').trim()||'#e3cfb7':'#e7d8c6';
    if(colors.size>1)return COLORS.mixed;
    return COLORS[[...colors][0]];
  }
  function render(){
    game.connections=resolveConnections(game);
    const candidateBlinkDelay=-((Date.now()%500));
    const previousCandidates=game.candidateTiles||new Set(),nextCandidates=candidateTiles(game,game.connections);
    const justActivated=game.candidateJustActivated&&game.candidateJustActivated.size
      ?new Set(game.candidateJustActivated)
      :new Set([...nextCandidates].filter(index=>!previousCandidates.has(index)));
    const releasedCandidates=new Set([...previousCandidates].filter(index=>!nextCandidates.has(index)));
    game.candidateTiles=nextCandidates;game.candidateJustActivated=new Set();
    const previousColorKeys=game.colorKeys||[],nextColorKeys=colorKeys(game.connections),connectionTransitions=new Map();
    let transitionOrder=0;
    nextColorKeys.forEach((next,index)=>{
      const previous=previousColorKeys[index]||'';
      if(previous===next)return;
      if(next)connectionTransitions.set(index,{kind:'connection-enter',order:transitionOrder++,from:previous});
      else if(previous)connectionTransitions.set(index,{kind:'connection-release',order:transitionOrder++,from:previous});
    });
    game.colorKeys=nextColorKeys;
    const metrics=boardMetrics();
    const episodeStage=stageNumberInEpisode(game.index);
    stageLabel.innerHTML=game.testMode?`<span class="stage-text">TEST <span class="stage-number">${game.testLabel}</span></span>`:`<span class="stage-text">LEVEL <span class="stage-number">${pad(episodeStage)}</span></span>`;
    restartButton.disabled=Boolean(game.viewer);
    const tileSize=metrics.width/game.cols,tileRadius=Math.round(Math.min(35,Math.max(15,tileSize*.35)));
    frame.style.width=`${metrics.width}px`;frame.style.height=`${metrics.height}px`;
    board.style.setProperty('--tile-radius',`${tileRadius}px`);
    board.style.gridTemplateColumns=`repeat(${game.cols},1fr)`;board.innerHTML='';
    game.tiles.forEach((tile,index)=>{
      const colors=game.connections.colorsByTile[index],button=document.createElement('button');
      const isCandidate=game.candidateTiles.has(index);
      const isAllowed=tile.type==='endpoint'||tile.touched||tile.primed||colors.size>0||isCandidate;
      const classes=['tile',tile.type,visualClass(tile,colors)];
      classes.push('test-art-tile');
      if(tile.type==='endpoint')classes.push('endpoint');
      if(isCandidate){classes.push('candidate');button.style.setProperty('--candidate-blink-delay',`${candidateBlinkDelay}ms`);}
      if(isCandidate&&justActivated.has(index))classes.push('candidate-enter');
      const isCandidateRelease=releasedCandidates.has(index)&&!isCandidate&&!colors.size;
      if(isCandidateRelease)classes.push('candidate-release');
      if(tile.type!=='cross'&&tile.type!=='pturn'&&!(tile.type==='endpoint'&&tile.sourceShape==='start4')&&isAllowed)classes.push('rotatable');
      const transition=connectionTransitions.get(index);
      if(transition)classes.push(transition.kind);
      button.className=classes.join(' ');button.style.setProperty('--order',index);button.style.setProperty('--endpoint-color',COLORS[tile.color]||COLORS.green);button.style.zIndex=String(Math.floor(index/game.cols)+1);
      if(isCandidateRelease)button.style.setProperty('--candidate-release-to',backgroundForClass(tile,colors));
      if(transition){
        const fromColors=new Set((transition.from||'').split('|').filter(Boolean));
        button.style.setProperty('--sequence',transition.order);
        button.style.setProperty('--from-bg',backgroundForClass(tile,fromColors));
        button.style.setProperty('--to-bg',backgroundForClass(tile,colors));
      }
      button.disabled=game.locked||tile.type==='cross'||tile.type==='pturn'||(tile.type==='endpoint'&&tile.sourceShape==='start4');
      if(tile.type==='dual'&&colors.size>1){
        const [laneZero,laneOne]=dualLaneColors(tile,index,game.connections);
        button.style.setProperty('--dual-lane-zero',COLORS[laneZero]||COLORS.green);
        button.style.setProperty('--dual-lane-one',COLORS[laneOne]||COLORS.blue);
        button.style.setProperty('--dual-gradient-direction',dualGradientDirection(tile.rotation));
      }
      button.setAttribute('role','gridcell');
      button.setAttribute('aria-label',tile.type==='endpoint'?(tile.role==='start'?(tile.sourceShape?`Start ${endpointPorts(tile).length} way`:'Start'):'Finish'):tile.type==='tee'?'T junction':tile.type==='dual'?'Dual lane':tile.type==='cross'?'Cross junction':isCandidate?'Available route tile':'Route tile');
      button.innerHTML=testTileArt(tile,index,colors,isCandidate);
      if(!button.disabled)button.addEventListener('click',()=>turn(index));
      board.append(button);
    });
    renderMoveStatus();
  }
  function renderMoveStatus(){
    moveCard.dataset.grade='left';
    moveGradeLabel.textContent='LEFT MOVES';
    moveUsed.textContent=pad(Math.max(0,game.maxMoves-game.moves));
    moveTarget.textContent=pad(game.maxMoves);
  }
  function lockedJiggle(index){
    if(game.locked)return;const element=board.children[index];element.classList.remove('locked-jiggle');void element.offsetWidth;element.classList.add('locked-jiggle');
  }
  function turn(index){
    if(game.locked||game.animating)return;
    const tile=game.tiles[index],isEndpoint=tile.type==='endpoint';
    if(tile.type==='cross'||tile.type==='pturn'||(tile.type==='endpoint'&&tile.sourceShape==='start4'))return;
    const currentColors=game.connections.colorsByTile[index],isCandidate=game.candidateTiles.has(index);
    const isAllowed=isEndpoint||tile.touched||tile.primed||currentColors.size>0||isCandidate;
    if(!isAllowed){lockedJiggle(index);return;}
    // A correctly aligned candidate joins the route without rotating or using a move.
    if(!isEndpoint&&isCandidate&&!tile.touched&&!tile.primed&&tileConnectsToActive(game,index,game.connections)){
      tile.primed=true;game.hasPlayerMoved=true;
      game.connections=resolveConnections(game);
      const completedTiles=updateCompletedColors(game,game.connections);
      render();
      completedTiles.forEach(tileIndex=>board.children[tileIndex]?.classList.add('route-complete-pop'));
      if(isComplete(game,game.connections))clearStage();
      return;
    }
    if(!isEndpoint&&!tile.touched){
      if(game.moves>=game.maxMoves)return;
      tile.touched=true;game.moves++;
    }
    game.hasPlayerMoved=true;
    const span=tile.type==='endpoint'?endpointRotationSpan(tile):tile.type==='straight'||tile.type==='filter'?2:4;
    tile.rotation=(tile.rotation+1)%span;
    // Swap the route immediately. The tactile feedback is supplied by the tile
    // itself, so the player gets a crisp click without watching a mid-rotation.
    tile.displayAngle=undefined;
    game.connections=resolveConnections(game);
    const completedTiles=updateCompletedColors(game,game.connections);
    render();
    board.children[index]?.classList.add('turn-click');
    completedTiles.forEach(tileIndex=>board.children[tileIndex]?.classList.add('route-complete-pop'));
    if(game.moves>=game.maxMoves)over('exhausted');
    else if(isComplete(game,game.connections))clearStage();
    else if(hasNoRouteWithinMoves(game))over('no-route');
  }
  function showGame(){stageTestScreen.classList.remove('show');designScreen.classList.remove('show');homeScreen.classList.remove('show');gameScreen.classList.remove('hidden');}
  const episodeForStage=index=>Math.min(EPISODE_COUNT-1,Math.max(0,Math.floor(index/EPISODE_SIZE)));
  const stageNumberInEpisode=index=>index%EPISODE_SIZE+1;
  const visibleEpisode=()=>adminMode?(adminEpisode??episodeForStage(progress.current)):(homeEpisode??episodeForStage(progress.current));
  function showHome(episodeOverride=null){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');startOverlay.classList.remove('show');resetModal.classList.remove('show');stageTestScreen.classList.remove('show');designScreen.classList.remove('show');homeEpisode=Number.isInteger(episodeOverride)?episodeOverride:episodeForStage(progress.current);gameScreen.classList.add('hidden');homeScreen.classList.add('show');renderHome();requestAnimationFrame(()=>{const focus=homeStageList.querySelector('.current')||homeStageList.firstElementChild;if(focus)focus.scrollIntoView({block:'center'});});}
  function designCard(label,{block='block_off.png',line,text,off=false,light=false,dual=[]}={}){
    const bases=dual.length?dual.map((asset,index)=>`<img class="design-sample-block design-dual-layer design-dual-layer-${index}" src="assets/${asset}" alt="">`).join('')+`<img class="design-sample-block design-dual-bottom" src="assets/${dual[1]}" alt="">`:`<img class="design-sample-block" src="assets/${block}" alt="">`;
    const lightLayer=light?'<img class="design-sample-light" src="assets/block_off_light.png" alt="">':'';
    const lineLayer=line?`<img class="design-overlay design-line${off?' design-off-line':''}" src="assets/${line}" alt="">`:'';
    const textLayer=text?`<img class="design-overlay design-start-text" src="assets/${text}" alt="">`:'';
    return `<article class="design-card"><div class="design-sample">${bases}${lightLayer}${lineLayer}${textLayer}</div><p>${label}</p></article>`;
  }
  function designGroup(title,cards){return `<section class="design-group"><h2>${title}</h2><div class="design-gallery">${cards.join('')}</div></section>`;}
  function renderDesignPreview(){
    const colors=[['RED','block_red.png','red_text_start.png'],['GREEN','block_green.png','green_text_start.png'],['BLUE','block_blue.png','blue_text_start.png']];
    const colorGroups=colors.map(([name,block,text])=>designGroup(name,[
      designCard('START 1 WAY',{block,line:'line_start_end.png',text}),designCard('START 2 WAY / CORNER',{block,line:'line_start_end_2_b.png',text}),
      designCard('START 2 WAY / STRAIGHT',{block,line:'line_start_end_2_a.png',text}),designCard('START 3 WAY',{block,line:'line_start_end_3.png',text}),designCard('START 4 WAY',{block,line:'line_start_end_4.png',text}),designCard('END',{block,line:'line_start_end.png'}),
      designCard('STRAIGHT',{block,line:'line_straight.png'}),designCard('T JUNCTION',{block,line:'line_t.png?v=v0-3-tee-resource-2'}),designCard('CROSS',{block,line:'line_start_cross.png'}),
      designCard('TWO LINE',{block,line:'line_two_line.png'}),designCard('CURVE',{block,line:'line_curve.png'})
    ]));
    const offGroup=designGroup('INACTIVE',[designCard('STRAIGHT',{line:'line_straight.png',off:true}),designCard('T JUNCTION',{line:'line_t.png?v=v0-3-tee-resource-2',off:true}),designCard('CROSS',{line:'line_start_cross.png',off:true}),designCard('TWO LINE',{line:'line_two_line.png',off:true}),designCard('CURVE',{line:'line_curve.png',off:true})]);
    const blackGroup=designGroup('BLACK',[designCard('CROSS',{block:'block_black.png',line:'line_start_cross.png'})]);
    const dualGroup=designGroup('COLOR COMBINATION / TWO LINE',[
      designCard('RED + GREEN',{line:'line_two_line.png',dual:['block_red.png','block_green.png']}),
      designCard('RED + BLUE',{line:'line_two_line.png',dual:['block_red.png','block_blue.png']}),
      designCard('GREEN + BLUE',{line:'line_two_line.png',dual:['block_green.png','block_blue.png']}),
      designCard('ACTIVE CANDIDATE',{line:'line_curve.png',light:true})
    ]);
    designContent.innerHTML=`<p class="design-caption">PARENT BOTTOM-LEFT / CHILD CENTER / X 100 Y 112</p>${colorGroups.join('')}${offGroup}${blackGroup}${dualGroup}`;
  }
  function showDesign(){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');startOverlay.classList.remove('show');resetModal.classList.remove('show');gameScreen.classList.add('hidden');homeScreen.classList.remove('show');renderDesignPreview();designScreen.classList.add('show');}
  function renderStageTests(){
    const buttons=[];
    for(let rows=3;rows<=8;rows++)for(let cols=3;cols<=8;cols++)buttons.push(`<button type="button" class="stage-test-size" data-cols="${cols}" data-rows="${rows}">${cols}×${rows}</button>`);
    stageTestContent.innerHTML=`<div class="stage-test-grid">${buttons.join('')}</div>`;
    stageTestContent.querySelectorAll('.stage-test-size').forEach(button=>button.addEventListener('click',()=>beginSizeTest(Number(button.dataset.cols),Number(button.dataset.rows))));
  }
  function showStageTests(){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');startOverlay.classList.remove('show');resetModal.classList.remove('show');gameScreen.classList.add('hidden');homeScreen.classList.remove('show');designScreen.classList.remove('show');renderStageTests();stageTestScreen.classList.add('show');}
  function beginSizeTest(cols,rows){const index=TEST_SIZE_STAGE_INDEX.get(`${cols}x${rows}`);if(Number.isInteger(index))begin(index,{test:true});}
  const starsForGrade=grade=>({Clear:1,Great:2,Perfect:3}[grade]||0);
  const gradeForStars=stars=>({1:'Clear',2:'Great',3:'Perfect'}[stars]||null);
  const bestGrade=(existing,next)=>starsForGrade(next)>starsForGrade(existing)?next:(existing||next);
  function starsMarkup(stars,{animate=false,home=false}={}){
    const starPath='M50 8C52 8 54 10 55 13L62 31C63 33 65 34 67 34L86 35C90 35 91 40 88 43L73 57C71 58 71 60 72 62L77 81C78 85 73 88 70 86L52 76C51 75 49 75 48 76L30 86C27 88 22 85 23 81L28 62C29 60 29 58 27 57L12 43C9 40 10 35 14 35L33 34C35 34 37 33 38 31L45 13C46 10 48 8 50 8Z';
    return Array.from({length:stars},(_,index)=>`<svg class="${home?'home-star':'result-star'}${animate?' star-reveal':''}" style="--star-index:${index}" viewBox="0 0 100 100" aria-hidden="true"><path d="${starPath}"/></svg>`).join('');
  }
  function stageStarsMarkup(stars){
    return Array.from({length:stars},(_,index)=>`<img class="stage-star stage-star-${index+1}" src="assets/stage_icon_star.png" alt="">`).join('');
  }
  function setHomeToolsVisible(visible){homeScreen.classList.toggle('tools-visible',visible);}
  function clearHomeToolsHold(){if(homeToolsHoldTimer!==null){clearTimeout(homeToolsHoldTimer);homeToolsHoldTimer=null;}}
  function startHomeToolsHold(event){
    if(event.button!==undefined&&event.button!==0)return;
    if(event.target.closest?.('.home-stage,.home-tools,.reset-modal'))return;
    clearHomeToolsHold();
    homeToolsHoldTimer=setTimeout(()=>{setHomeToolsVisible(!homeScreen.classList.contains('tools-visible'));homeToolsHoldTimer=null;},3000);
  }
  function openHomeStage(index){
    if(!Number.isInteger(index)||index<0||index>=TEST_STAGE_COUNT)return;
    if(!adminMode&&episodeForStage(index)!==visibleEpisode())return;
    if(adminMode){begin(index);return;}
    const result=progress.results[index];
    // 퍼펙트(별 3개)는 스테이지 선택 화면에서 최종 완료 상태로 잠급니다.
    // 별 1~2개 클리어는 더 높은 등급에 도전할 수 있도록 재입장을 허용합니다.
    if(result==='Perfect')return;
    if(result==='Great'||result==='Clear')begin(index,{returnToStageSelect:true});
    else if(index===progress.current)begin(index);
  }
  function renderHome(){
    const episode=visibleEpisode(),start=episode*EPISODE_SIZE,end=start+EPISODE_SIZE;
    adminModeButton.textContent=adminMode?'BACK':'ADMIN';
    episodeTitle.innerHTML=`<span class="stage-title-word">STAGE</span><strong class="stage-title-number">${pad(episode+1)}</strong>`;episodeSubtitle.textContent='LEVEL 01–20';
    episodePrevButton.disabled=episode===0;episodeNextButton.disabled=episode===EPISODE_COUNT-1;
    homeStageList.innerHTML='';
    for(let index=start;index<end;index++){
      const result=progress.results[index],status=adminMode?'admin-current':result?result.toLowerCase():index===progress.current?'current':'locked';
      const isPerfectLocked=!adminMode&&result==='Perfect',button=document.createElement('button');
      button.type='button';button.className=`home-stage ${status}`;button.value=String(index);button.disabled=status==='locked'||isPerfectLocked;
      const number=pad(stageNumberInEpisode(index)),stars=starsForGrade(result),isPlayable=status==='current'||status==='admin-current',art=stars===3?'stage_btn_top_clear.png':result?'stage_btn_clear.png':isPlayable?'stage_btn_play.png':'stage_btn_dim.png';
      button.setAttribute('aria-label',`Episode ${episode+1}, stage ${number}${stars?`, ${stars} stars`:''}${isPerfectLocked?', perfect complete':''}`);
      button.innerHTML=`<img class="stage-button-art" src="assets/${art}" alt="">${stars?`<span class="stage-stars stage-stars-${stars}">${stageStarsMarkup(stars)}</span>`:''}${isPlayable?'<span class="stage-go">GO!</span>':''}<span class="home-stage-number">${number}</span>`;
      button.onclick=function(){openHomeStage(Number(this.value));};homeStageList.append(button);
    }
  }
  function begin(index,{viewer=false,test=false,returnToStageSelect=false}={}){clearInterval(timerId);clearTimeout(startTimeout);modal.classList.remove('show');const nextGame=createStage(index,viewer?progress.solutions[index]:null);game=nextGame;game.testMode=Boolean(test);game.returnToStageSelect=Boolean(returnToStageSelect);game.returnEpisode=game.returnToStageSelect?episodeForStage(index):null;showGame();game.viewer=viewer;if(viewer){game.tiles.forEach(tile=>{tile.rotation=tile.target;tile.displayAngle=undefined;if(tile.type!=='endpoint'&&tile.type!=='cross')tile.touched=true;});game.hasPlayerMoved=true;game.locked=true;render();return;}if(!test)saveProgress();startOverlay.innerHTML='<span>LEFT MOVES</span><strong>'+pad(game.maxMoves)+'</strong>';render();startOverlay.classList.remove('show');void startOverlay.offsetWidth;startOverlay.classList.add('show');startTimeout=setTimeout(()=>{startOverlay.classList.remove('show');game.locked=false;render();},1000);}
  function clearGrade(){return game.moves<=game.perfectMoves?'Perfect':game.moves<=game.greatMoves?'Great':'Clear';}
  function clearStage(){game.locked=true;game.grade=clearGrade();clearInterval(timerId);if(game.testMode){render();[...board.children].forEach(tile=>tile.classList.add('clear-pop'));setTimeout(()=>showModal(true),420);return;}progress.solutions[game.index]={templateIndex:game.templateIndex,variant:game.variant};progress.results[game.index]=bestGrade(progress.results[game.index],game.grade);syncProgressCursor();saveProgress();render();[...board.children].forEach(tile=>tile.classList.add('clear-pop'));setTimeout(()=>showModal(true),420);}
  function over(reason){game.locked=true;clearInterval(timerId);showModal(false,reason);}
  function showModal(cleared,reason){
    if(cleared){const labels={Perfect:'PERFECT!',Great:'GREAT!',Clear:'CLEAR!'};modalKicker.textContent=game.grade.toUpperCase();modalTitle.textContent=labels[game.grade];modalStars.innerHTML=starsMarkup(starsForGrade(game.grade),{animate:true});modalText.textContent=`${pad(game.moves)} Moves · Perfect ${pad(game.perfectMoves)} Moves`;}
    else{modalKicker.textContent='TRY AGAIN';modalTitle.textContent='GAME OVER';modalStars.innerHTML='';modalText.textContent=reason==='no-route'?'남은 Move로 길을 완성할 수 없어요.':reason==='exhausted'?'Move limit reached.':'Try a different route.';}
    if(game.testMode){modalButton.textContent=cleared?'BACK TO TESTS':'RESTART';modalButton.onclick=()=>cleared?showStageTests():begin(game.index,{test:true});modal.classList.add('show');return;}
    const nextIndex=Math.min(game.index+1,TEST_STAGE_COUNT-1),nextIsEpisode=game.index<TEST_STAGE_COUNT-1&&stageNumberInEpisode(game.index)===EPISODE_SIZE;
    modalButton.textContent=cleared?(game.returnToStageSelect?'STAGE SELECT':game.index===TEST_STAGE_COUNT-1?'HOME':nextIsEpisode?'NEXT EPISODE':'NEXT STAGE'):'RESTART';
    modalButton.onclick=()=>cleared&&game.returnToStageSelect?showHome(game.returnEpisode):cleared&&game.index===TEST_STAGE_COUNT-1?showHome():begin(cleared?nextIndex:game.index);modal.classList.add('show');
  }
  homeButton.addEventListener('click',showHome);
  designTestButton.addEventListener('click',showDesign);
  designBackButton.addEventListener('click',showHome);
  stageTestButton.addEventListener('click',showStageTests);
  stageTestBackButton.addEventListener('click',showHome);
  adminModeButton.addEventListener('click',()=>{adminMode=!adminMode;adminEpisode=adminMode?episodeForStage(progress.current):null;homeEpisode=adminMode?homeEpisode:episodeForStage(progress.current);renderHome();});
  episodePrevButton.addEventListener('click',()=>{if(adminMode&&adminEpisode>0){adminEpisode--;renderHome();}else if(!adminMode&&homeEpisode>0){homeEpisode--;renderHome();}});
  episodeNextButton.addEventListener('click',()=>{if(adminMode&&adminEpisode<EPISODE_COUNT-1){adminEpisode++;renderHome();}else if(!adminMode&&homeEpisode<EPISODE_COUNT-1){homeEpisode++;renderHome();}});
  resetProgressButton.addEventListener('click',()=>resetModal.classList.add('show'));
  resetNoButton.addEventListener('click',()=>resetModal.classList.remove('show'));
  resetYesButton.addEventListener('click',()=>{progress=initialProgress();try{localStorage.removeItem(STORAGE_KEY);}catch(error){}saveProgress();resetModal.classList.remove('show');renderHome();});
  homeScreen.addEventListener('pointerdown',startHomeToolsHold);
  ['pointerup','pointercancel','pointerleave'].forEach(type=>homeScreen.addEventListener(type,clearHomeToolsHold));
  restartButton.addEventListener('click',()=>{if(game&&!game.viewer)begin(game.index,{test:game.testMode});});
  window.addEventListener('resize',()=>{if(game&&!homeScreen.classList.contains('show'))render();});
  // Development-only audit hook: callable from the browser console when authoring stages.
  window.__linePuzzleValidateCampaign=validateCampaign;
  begin(progress.current);
})();
