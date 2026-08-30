(function(root, factory){
  const library = factory();
  if(typeof module === 'object' && module.exports) module.exports = library;
  root.MQOfficialThemeLibrary = library;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const slots = {
    startBackground:{label:'Start Screen', group:'Scenes', required:true, aspectRatio:'16:9', fallback:'shell-start'},
    gameplayBackground:{label:'Game / Question Background', group:'Scenes', required:true, aspectRatio:'16:9', fallback:'shell-gameplay'},
    hallway1:{label:'Hallway 1', group:'Progression', required:true, aspectRatio:'16:9', fallback:'shell-hallway'},
    hallway2:{label:'Hallway 2', group:'Progression', required:true, aspectRatio:'16:9', fallback:'shell-hallway'},
    hallway3:{label:'Hallway 3', group:'Progression', required:true, aspectRatio:'16:9', fallback:'shell-hallway'},
    guideImage:{label:'Guide', group:'Characters', required:true, aspectRatio:'portrait-or-square', fallback:'shell-guide-symbol', expectedDefaultAsset:'./data/default-theme-assets/default-guide.webp'},
    boss1:{label:'Boss 1', group:'Characters', required:true, aspectRatio:'portrait-or-square', fallback:'shell-boss-symbol'},
    boss2:{label:'Boss 2', group:'Characters', required:true, aspectRatio:'portrait-or-square', fallback:'shell-boss-symbol'},
    boss3:{label:'Boss 3', group:'Characters', required:true, aspectRatio:'portrait-or-square', fallback:'shell-boss-symbol'},
    artifact1:{label:'Artifact 1', group:'Rewards', required:true, aspectRatio:'square', fallback:'shell-artifact-marker'},
    artifact2:{label:'Artifact 2', group:'Rewards', required:true, aspectRatio:'square', fallback:'shell-artifact-marker'},
    artifact3:{label:'Artifact 3', group:'Rewards', required:true, aspectRatio:'square', fallback:'shell-artifact-marker'},
    modeStandard:{label:'Mode Card - Standard Campaign', group:'Mode Cards', mode:'standard', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeTimed:{label:'Mode Card - Timed Trial', group:'Mode Cards', mode:'timed', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeExam:{label:'Mode Card - Exam Drill', group:'Mode Cards', mode:'exam', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeQuiz:{label:'Mode Card - Quiz', group:'Mode Cards', mode:'quiz', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeUnlimited:{label:'Mode Card - Unlimited Practice', group:'Mode Cards', mode:'unlimited', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeLegendary:{label:'Mode Card - Legendary', group:'Mode Cards', mode:'legendary', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeScore:{label:'Mode Card - Score Attack', group:'Mode Cards', mode:'score', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeTrialGraph:{label:'Mode Card - Trial by Graph', group:'Mode Cards', mode:'trialGraph', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeFadingFortune:{label:'Mode Card - Fading Fortune', group:'Mode Cards', mode:'fadingFortune', aspectRatio:'16:9', fallback:'shell-mode-symbol'},
    modeRiskReward:{label:'Mode Card - Risk & Reward', group:'Mode Cards', mode:'riskReward', aspectRatio:'16:9', fallback:'shell-mode-symbol'}
  };

  const assets = [];
  function add(id, label, sourceUrl, compatibleSlots, width, height, sizeBytes, sha256, metadata = {}){
    assets.push({
      id, label, category:'theme', sourceUrl, previewUrl:sourceUrl,
      compatibleSlots, width, height, sizeBytes, sha256, fileType:'image/webp',
      alt:metadata.alt || '', description:metadata.description || label,
      displayName:metadata.displayName || '', origin:metadata.origin || '',
      guideIdentity:metadata.guideIdentity || '',
      presentationMode:metadata.presentationMode || (compatibleSlots.some(slotId => slotId === 'guideImage' || /^boss[123]$/.test(slotId)) ? 'transparent-character' : ''),
      themeFamilies:metadata.themeFamilies || []
    });
  }

  const defaults = './data/default-theme-assets/';
  add('default-guide','Guide',defaults+'default-guide.webp',['guideImage'],1024,1536,108120,'f37a17ba7b84c39894d7a4bce700386d2b425bb2e2e31d165fbcc553683181ed',{alt:'The Guide, a calm and welcoming Mastery Quests companion',displayName:'The Guide',guideIdentity:'guide',origin:'Default Mastery Quest',presentationMode:'transparent-character',themeFamilies:['default']});
  add('default-boss-1','The Challenger',defaults+'default-boss-challenger.webp',['boss1'],1084,1451,204778,'5919b06e647d10383a4c51315fb5d4deda6c360ed9165927ad60adb72e9d8902',{alt:'The Challenger, first checkpoint guardian',displayName:'The Challenger',origin:'Default Mastery Quest',presentationMode:'transparent-character',themeFamilies:['default']});
  add('default-boss-2','The Enforcer',defaults+'default-boss-enforcer.webp',['boss2'],1086,1448,284358,'7711646bc16182c695446999a529507dccd89fd82dfc370ddb2ad99caa33fc63',{alt:'The Enforcer, second checkpoint guardian',displayName:'The Enforcer',origin:'Default Mastery Quest',presentationMode:'transparent-character',themeFamilies:['default']});
  add('default-boss-3','The Warden',defaults+'default-boss-warden.webp',['boss3'],1086,1448,250666,'b5a6f5858508c4d9b346134b7d3d7beddb4795d3aca7096ea1f2c4d10b363f32',{alt:'The Warden, final checkpoint guardian',displayName:'The Warden',origin:'Default Mastery Quest',presentationMode:'transparent-character',themeFamilies:['default']});

  const arcane = '../../play/micro-domains/labyrinth-of-choice/';
  add('arcane-start','Arcane Archive entrance',arcane+'start-screen-image.webp',['startBackground'],1448,1086,617998,'0dff35e8c640e00b71ed12e8c57aac43fe9f4a6336abd5f516d501692a5a9431',{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-gameplay','Arcane Archive chamber',arcane+'question_background_image.webp',['gameplayBackground'],1448,1086,310186,'3dc914e0fdaa3fff092b1c3d5b69758aafa33cc78f070ca49ff645ded94a39bc',{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-hall-1','Arcane hallway I',arcane+'hallway1.webp',['hallway1','hallway2','hallway3'],1448,1086,501310,'663763a7b8420630b52023b46243fe50b767f180a8630e01678079424e947ade',{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-hall-2','Arcane hallway II',arcane+'hallway2.webp',['hallway1','hallway2','hallway3'],1448,1086,412556,'c6d184656ed85d3fcc427fb0af9519618c85e80cbedd88fb422de8cae2f4e825',{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-hall-3','Arcane hallway III',arcane+'hallway3.webp',['hallway1','hallway2','hallway3'],1448,1086,535734,'1c05bbbe9d56d79bb4eadb3b51dcd76b969887d8adada3e887eb9a0d4f1d48de',{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-guide','The Archivist',arcane+'wizard.webp',['guideImage'],1254,1254,132350,'40c7f1ce97ec71de6d2141300929491f2cfe3f38dbca894ee2c98c74da540172',{alt:'The Archivist, an arcane guide',displayName:'The Archivist',guideIdentity:'archivist',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-boss-1','The Warden',arcane+'warden.webp',['boss1','boss2','boss3'],1254,1254,136942,'b74c42807c4a990c09def497cc82f3262d9f8acf9feabf80f72431a12e57db85',{alt:'The Warden',displayName:'The Warden',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-boss-2','The Decomposer',arcane+'decomposer.webp',['boss1','boss2','boss3'],1254,1254,177982,'848b08be1f9284b345508d0a2652ea09a508f8ea7513aec3b127f97d020051ec',{alt:'The Decomposer',displayName:'The Decomposer',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-boss-3','The Sovereign',arcane+'sovereign.webp',['boss1','boss2','boss3'],1254,1254,374830,'19df475c586f3fca4ae008a077a938c6b6bc3ae77b1d777e0e5320571b056186',{alt:'The Sovereign',displayName:'The Sovereign',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-artifact-1','Seal of Preferences',arcane+'seal_of_preferences.webp',['artifact1','artifact2','artifact3'],1254,1254,236616,'2c3d566b9b12e8f8f3de8f660d26bccc45ee4720fa19ff8aa804897411b8588f',{alt:'Seal of Preferences',displayName:'Seal of Preferences',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-artifact-2','Prism of Tradeoffs',arcane+'prism_of_tradeoffs.webp',['artifact1','artifact2','artifact3'],1254,1254,128870,'ad2458a35ca8604298444ccdbd031fbddd44e3453b8e7aa76464c34d93fb6d48',{alt:'Prism of Tradeoffs',displayName:'Prism of Tradeoffs',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  add('arcane-artifact-3','Scepter of Elasticity',arcane+'scepter_of_elasticity.webp',['artifact1','artifact2','artifact3'],1254,1254,118066,'c26e02bf15ea68152401d44e613dedd3a0c9bc0e1462746583f2224b5609b938',{alt:'Scepter of Elasticity',displayName:'Scepter of Elasticity',origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  const arcaneModes = [
    ['standard','Standard Campaign','mode_standard.webp',552504,'38169ff1c8969c00341c02bcc264ec6cd2f449e0c1def3eb8aa9a7c480960abd'],
    ['timed','Timed Trial','mode_timed.webp',595548,'3ee6d0873ab7be8717d65c9360256c77c13233932ed4993359c0b48ca32d51b2'],
    ['exam','Exam Drill','mode_exam.webp',618860,'f4a697cffd27facf18d52ff07f14aa224b82a5cc3a0da2b1d912d30367c8a320'],
    ['quiz','Quiz','mode_quiz.webp',627944,'985026d708458e6ef0053ba07b548b6985d329dbd32e4a8513b133fe6ccaed7c'],
    ['unlimited','Unlimited Practice','mode_unlimited.webp',566118,'3beada2accfc9d0b39d7ff79986db1c88d68c8de271a9596eb6ca6ed7f9bcafb'],
    ['legendary','Legendary','mode_legendary.webp',551712,'f8aeec4297a34df0cfe07657a6edb095adf907750a034f9996030a07eba7c148'],
    ['score','Score Attack','mode_score.webp',303084,'39b188dd5f4ca2ca5f7d491be08d9f4413cfa2f7b7c786d7b651b90b7086d268'],
    ['trialGraph','Trial by Graph','mode_graph.webp',608726,'b6d4fcdca0c603c8eb61d58d5c4de08c34b6ee38721cc4131aeff8584995837a'],
    ['fadingFortune','Fading Fortune','mode_fading.webp',687068,'4c5ccd565bf96beba8162c7bde186f1bca38a5b71f628d1a0e98729e43e79784'],
    ['riskReward','Risk & Reward','mode_risk.webp',640022,'3b61786dd7a62e1dc1969900bd2d977e78f8f04fb65e18694d4e3f3bb9cc4af4']
  ];
  const modeSlot = {standard:'modeStandard',timed:'modeTimed',exam:'modeExam',quiz:'modeQuiz',unlimited:'modeUnlimited',legendary:'modeLegendary',score:'modeScore',trialGraph:'modeTrialGraph',fadingFortune:'modeFadingFortune',riskReward:'modeRiskReward'};
  for(const [mode,label,file,size,hash] of arcaneModes){
    add('arcane-mode-'+mode,'Arcane '+label,arcane+file,[modeSlot[mode]],1672,941,size,hash,{origin:'Labyrinth of Choice',themeFamilies:['arcane-archive']});
  }

  const economic = '../../play/economic-realm/market-gate/';
  add('economic-guide','The Chancellor',economic+'chancellor.webp',['guideImage'],1086,1448,146328,'df576dd008c7353db4a5f6d4cc16b46d766e0ff6b99df6a255393ad8b7ee4cbb',{alt:'The Chancellor, an Economic Realm guide',displayName:'The Chancellor',guideIdentity:'chancellor',origin:'Economic Realm',themeFamilies:['market-citadel']});
  const economicModes = [
    ['standard','Standard Campaign','mode_standard.webp',900,520,156380,'ebba9fff124f76525e83023ef7ad3645cba04afd693ce59df47003428c8dc2cb'],
    ['timed','Timed Trial','mode_timed.webp',900,520,139248,'7f5722460235219d88ce8221f504cbf9f5c505d6703fcc13e2e1022e8097a2f9'],
    ['exam','Exam Drill','mode_exam.webp',900,520,155464,'2c9898b0feccb30852c68c7aa919ed0e606737c31f4588f6711c930bf776ca0e'],
    ['unlimited','Unlimited Practice','unlimited-mode.webp',1254,1254,822628,'b5f3ec0ec53b70123462a648998264c781b25f252279fedc48b37592c10fc7ab'],
    ['legendary','Legendary','mode_legendary.webp',900,520,157826,'90380766ea4fe7e520bd4f22ad929814c27e44369f543a060f404672c672a50c'],
    ['score','Score Attack','scoreattack.webp',1672,941,496596,'a434c5a0a6d8bd1580edefb1c49f4d3936b685e30f71ab7397e1e7f657113fb2']
  ];
  for(const [mode,label,file,width,height,size,hash] of economicModes){
    add('economic-mode-'+mode,'Economic Realm '+label,economic+file,[modeSlot[mode]],width,height,size,hash,{origin:'Economic Realm',themeFamilies:['market-citadel']});
  }

  const market = '../../play/economic-realm/market-gate/';
  add('market-start','Market Gate entrance',market+'start screen image.webp',['startBackground'],1672,941,784744,'393487865dc2bea151a40ba66338c84f341b9e0404c603af83630d84aecf7af9',{origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-gameplay','Market Gate chamber',market+'question_background_image.webp',['gameplayBackground'],1672,941,716792,'1cabe91dbd264c5fceb721f76248c0ad9b6e875daa86bad3f85b9b4a7287519b',{origin:'The Market Gate',themeFamilies:['market-citadel']});
  for(const [number,size,hash] of [[1,689572,'f79dbf8e126ec5353b90b147cca2de83787a6156333ac1d4c2b00e0938c9f09f'],[2,749356,'5b3958c7d3fc7819cafbf851dcd61b5545af0d8fdee2a6e746ebebf2cf1ed121'],[3,804294,'27d3a293a1b1035499e4ddbcd3ab3da2432f21601a75020018be58fea0649c77']]) add('market-hall-'+number,'Market hallway '+number,market+'hallway'+number+'.webp',['hallway1','hallway2','hallway3'],1672,941,size,hash,{origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-boss-1','The Keeper',market+'keeper.webp',['boss1','boss2','boss3'],1086,1448,445930,'fcfae670c044efb6215ad9b19a1179b9aa356ed38e151ae965cf6471f1309428',{alt:'The Keeper',displayName:'The Keeper',origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-boss-2','The Broker',market+'broker.webp',['boss1','boss2','boss3'],1086,1448,541700,'1e1d9ddb5b200490bc8187f094376d4d28d5a7257967897de728855901f516cb',{alt:'The Broker',displayName:'The Broker',origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-boss-3','The Magistrate',market+'magistrate.webp',['boss1','boss2','boss3'],1086,1448,310102,'9a01fb3e1cba4d74a9c282adf0b8a1bbe7ca783d3afba8d0a8321fe28481bed5',{alt:'The Magistrate',displayName:'The Magistrate',origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-artifact-1','Frontier Compass',market+'compass.webp',['artifact1','artifact2','artifact3'],1254,1254,321620,'404411cefb016dd681b5e498bb739656765c25b88afbdd68f474ea038538ab77',{alt:'Frontier Compass',displayName:'Frontier Compass',origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-artifact-2','Signal Lens',market+'lens.webp',['artifact1','artifact2','artifact3'],1254,1254,291034,'6114191d937f646c6a2c7a64bbb1e26ea8e409fea90330a329b4469366e1a772',{alt:'Signal Lens',displayName:'Signal Lens',origin:'The Market Gate',themeFamilies:['market-citadel']});
  add('market-artifact-3',"Magistrate's Scales",market+'scales.webp',['artifact1','artifact2','artifact3'],1254,1254,301392,'475917c179da12b09a3ac743e786d2f5e7a2d0a186028bf5a3368d91a28ecbb2',{alt:"Magistrate's Scales",displayName:"Magistrate's Scales",origin:'The Market Gate',themeFamilies:['market-citadel']});

  const directive = '../../play/managerial-intelligence-directorate/cost-directive/';
  add('directive-start','Cost Directive briefing room',directive+'start screen image.webp',['startBackground'],1672,941,320760,'a9aa8923dc383d8bab5f24470049e28b1a847d62970c279b7475a16593065483',{origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-gameplay','Cost Directive operations floor',directive+'question_background_image.webp',['gameplayBackground'],1672,941,219184,'04efa39a02aea1134a6f48e169f5121df6e2427728a58e5bcf3557641b808752',{origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  for(const [number,size,hash] of [[1,289390,'d2517ef26d3c5da1751aae62d0d1db1faa65e4e95643d6db46495738a5403299'],[2,289436,'2003bdbbd118419dcee6437122bf1773b853fe4e88cde950742255973e2ac190'],[3,309184,'2fe3a512c7d133c2a3d97942ec5f38a7cb0b4d298625702bad21efbe05d58817']]) add('directive-hall-'+number,'Directorate corridor '+number,directive+'hallway'+number+'.webp',['hallway1','hallway2','hallway3'],1672,941,size,hash,{origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-guide','The Principal',directive+'principal.webp',['guideImage'],1086,1448,86860,'b24aa6a77bbb0e91c630dece875a576d16cf1aeebffc72645c1c0cc66003a05f',{alt:'The Principal, your Directorate guide',displayName:'The Principal',guideIdentity:'principal',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-boss-1','The Analyst',directive+'analyst.webp',['boss1','boss2','boss3'],1086,1448,83840,'c11330e60817f451c5d76b1da95a33e1bb93271d37bd040d85681e36fc124af2',{alt:'The Analyst',displayName:'The Analyst',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-boss-2','The Manager',directive+'manager.webp',['boss1','boss2','boss3'],1086,1448,84032,'226bd46543c43c226ad4f6b7160eb8190fc931b296bf70d478f41cb7d29c9fba',{alt:'The Manager',displayName:'The Manager',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-boss-3','The Director',directive+'director.webp',['boss1','boss2','boss3'],1086,1448,99640,'441b052b7096391deece88fcdf91ed79ee4617ea9d1c76d95b73350ffad383b9',{alt:'The Director',displayName:'The Director',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-artifact-1','The Tradeoff Report',directive+'report.webp',['artifact1','artifact2','artifact3'],1254,1254,408830,'062d9d7314d39a4d6bd0af764033b4ce8db54d8092d1727b1c1bfccfd8ccb32b',{alt:'The Tradeoff Report',displayName:'The Tradeoff Report',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-artifact-2','The Marginal Ledger',directive+'ledger.webp',['artifact1','artifact2','artifact3'],1254,1254,355048,'62903be39a1c477c6b188e8f782646cda16f59c99ea4b660849f908ffe215d21',{alt:'The Marginal Ledger',displayName:'The Marginal Ledger',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  add('directive-artifact-3','The Strategic Scale Plan',directive+'plan.webp',['artifact1','artifact2','artifact3'],1254,1254,447392,'36b89483b11e96658fd9a2c402030c481e680ad2539b49a32cead84eb753ac00',{alt:'The Strategic Scale Plan',displayName:'The Strategic Scale Plan',origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  const directiveModes = [
    ['standard','Standard Campaign','mode_standard.webp',415496,'6bfced02354d4b06437804ee5bec99523a0efc93cda5116527878b139177a3c1'],
    ['timed','Timed Trial','mode_timed.webp',397430,'86b1f3473ef5e1e72ebc46985b7dcdeee1221281deea9de8ec3a41ced39d6693'],
    ['exam','Exam Drill','mode_exam.webp',331044,'43b3ad63c761241d938abf8951cb9410b511b90ce18578df62fde9086b5822bb'],
    ['quiz','Quiz','mode_quiz.webp',416988,'a0ac7cd3f00e5af8ca678e388d9173f9a0c0d4d7ce3deb0ba5c801731398da73'],
    ['unlimited','Unlimited Practice','mode_unlimited.webp',410426,'8d2d519b7c771791ca6bd0771d6115d89273aae34a54d4d6238f551fcd154501'],
    ['legendary','Legendary','mode_legendary.webp',389500,'2ed5582c29ad406e81e853902a9f1a75ff5eb3e81b6beb1fbd9300202703a364'],
    ['score','Score Attack','scoreattack.webp',366680,'09f4b867fe473c0635b891fd3522e4dc705b9293ffe8f1c1533ee6e577db0fef'],
    ['fadingFortune','Fading Fortune','mode_fading.webp',426984,'09c102eda6fc3bacba7a5289886929e35fe15bf1915a0da1be3f7a2760ed241a'],
    ['riskReward','Risk & Reward','mode_risk.webp',421930,'da37e146d426ca992c9e7c72e906675d8eb76e59ef1e6b582acc3af41de63240']
  ];
  for(const [mode,label,file,size,hash] of directiveModes){
    add('directive-mode-'+mode,'Cost Directive '+label,directive+file,[modeSlot[mode]],1672,941,size,hash,{origin:'Managerial Intelligence Directorate / Cost Directive',themeFamilies:['cost-directive']});
  }

  const arcaneValues = {
    startBackground:'arcane-start',gameplayBackground:'arcane-gameplay',hallway1:'arcane-hall-1',hallway2:'arcane-hall-2',hallway3:'arcane-hall-3',guideImage:'arcane-guide',boss1:'arcane-boss-1',boss2:'arcane-boss-2',boss3:'arcane-boss-3',artifact1:'arcane-artifact-1',artifact2:'arcane-artifact-2',artifact3:'arcane-artifact-3',
    modeStandard:'arcane-mode-standard',modeTimed:'arcane-mode-timed',modeExam:'arcane-mode-exam',modeQuiz:'arcane-mode-quiz',modeUnlimited:'arcane-mode-unlimited',modeLegendary:'arcane-mode-legendary',modeScore:'arcane-mode-score',modeTrialGraph:'arcane-mode-trialGraph',modeFadingFortune:'arcane-mode-fadingFortune',modeRiskReward:'arcane-mode-riskReward'
  };
  const economicModeValues = {modeStandard:'economic-mode-standard',modeTimed:'economic-mode-timed',modeExam:'economic-mode-exam',modeUnlimited:'economic-mode-unlimited',modeLegendary:'economic-mode-legendary',modeScore:'economic-mode-score'};
  const directiveValues = {
    startBackground:'directive-start',gameplayBackground:'directive-gameplay',hallway1:'directive-hall-1',hallway2:'directive-hall-2',hallway3:'directive-hall-3',guideImage:'directive-guide',boss1:'directive-boss-1',boss2:'directive-boss-2',boss3:'directive-boss-3',artifact1:'directive-artifact-1',artifact2:'directive-artifact-2',artifact3:'directive-artifact-3',
    modeStandard:'directive-mode-standard',modeTimed:'directive-mode-timed',modeExam:'directive-mode-exam',modeQuiz:'directive-mode-quiz',modeUnlimited:'directive-mode-unlimited',modeLegendary:'directive-mode-legendary',modeScore:'directive-mode-score',modeFadingFortune:'directive-mode-fadingFortune',modeRiskReward:'directive-mode-riskReward'
  };
  const presets = {
    default:{id:'default',label:'Default Mastery Quest',description:'A neutral Guide and three escalating checkpoint guardians for an unthemed Quest.',previewAssetId:'default-guide',guide:{identity:'guide',displayName:'The Guide'},values:{guideImage:'default-guide',boss1:'default-boss-1',boss2:'default-boss-2',boss3:'default-boss-3'}},
    'arcane-archive':{id:'arcane-archive',label:'Arcane Archive',description:'Mystic chambers led by the Archivist.',previewAssetId:'arcane-start',guide:{identity:'archivist',displayName:'The Archivist'},values:arcaneValues},
    'market-citadel':{id:'market-citadel',label:'Market Gate',description:'Marble market halls led by the Chancellor.',previewAssetId:'market-start',guide:{identity:'chancellor',displayName:'The Chancellor'},values:{startBackground:'market-start',gameplayBackground:'market-gameplay',hallway1:'market-hall-1',hallway2:'market-hall-2',hallway3:'market-hall-3',guideImage:'economic-guide',boss1:'market-boss-1',boss2:'market-boss-2',boss3:'market-boss-3',artifact1:'market-artifact-1',artifact2:'market-artifact-2',artifact3:'market-artifact-3',...economicModeValues}},
    'managerial-cost-directive':{id:'managerial-cost-directive',label:'Cost Directive',description:'A Managerial Intelligence Directorate briefing led by the Principal.',previewAssetId:'directive-start',guide:{identity:'principal',displayName:'The Principal'},values:directiveValues}
  };

  return Object.freeze({schemaVersion:'1.1.0',libraryVersion:'default-guide-polish-2026-08-30',defaultPresetId:'default',slots:Object.freeze(slots),assets:Object.freeze(assets),presets:Object.freeze(presets)});
});
