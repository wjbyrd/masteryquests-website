from pathlib import Path
import json

path=Path('audit_tools/econ_rpg/game/games/the-long-run/index.html')
s=path.read_text(encoding='utf-8')

def vehicle(kind,width,wheels):
    grid=[list(' '*width) for _ in range(12)]
    def run(y,left,right,color):
        for x in range(left,right+1): grid[y][x]=color
    def panel(y,left,right,inside):
        run(y,left,right,'O')
        if right-left>1:run(y,left+1,right-1,inside)
    if kind!='truck':
        if kind=='compact':
            roof=[(7,13),(6,14),(5,15),(4,16)];end=22;glass=[(7,8),(10,12)];seam=10
        else:
            roof=[(8,17),(7,18),(6,19),(5,20)];end=26;glass=[(8,11),(13,16)];seam=13
        run(0,*roof[0],'O')
        for y in range(1,4):panel(y,*roof[y],'B')
        for a,b in glass:run(2,a,b,'W');run(3,a,b,'G')
        panel(4,1,end-1,'B');panel(5,1,end,'B');panel(6,1,end,'B');panel(7,1,end,'D');run(8,2,end-1,'O')
        grid[5][2]='R';grid[5][end-1]='H';grid[6][seam]='D';grid[6][seam+1]='K'
        run(4,5,end-3,'L');grid[4][seam]='B';grid[7][2]='K';grid[7][end-1]='K'
    else:
        run(0,1,17,'O')
        for y in range(1,7):panel(y,1,17,'E')
        run(1,3,15,'W');run(3,4,14,'L');run(4,4,14,'L');run(6,2,16,'K')
        for y in range(2,6):panel(y,19,26+min(y-2,2),'B')
        run(3,22,25,'W');run(4,22,26,'G');grid[5][21]='K'
        panel(6,1,29,'B');grid[6][2]='R';grid[6][28]='H'
        panel(7,1,29,'D');run(8,2,29,'O');grid[7][2]='K';grid[7][28]='K'
        for y in range(2,6):grid[y][3]='K'
    for x in wheels:
        for y in range(8,12):run(y,x,x+3,'T')
        grid[9][x+1]='K';grid[10][x+2]='K'
    first=[''.join(row) for row in grid]
    for x in wheels:
        grid[9][x+1]='T';grid[10][x+2]='T';grid[9][x+2]='K';grid[10][x+1]='K'
    return [first,[''.join(row) for row in grid]]

legs=[['  PPPP   ','  PP PP  ',' PP  PP  ',' PP   P  ',' OOO  OO '],
      ['  PPPP   ','   PPP   ','   PPP   ','   P P   ','   O OO  '],
      ['  PPPP   ','  PP PP  ','  PP  PP ','  P   PP ',' OO  OOO ']]
person_head=['   FFF   ','  FFFFF  ','  FSSS   ','  FSSOS  ','   SS    ']
worker_head=['   YYY   ','  YHYYY  ',' YYYYYYY ','  SSSOS  ','   SS    ']
person_torso=[['  OCCO   ',' OCCACO  ',' SCCCOS  ','  CCOSS  ','  FFFF   '],
              ['  OCCO   ',' OCCACO  ',' SCCACS  ','  CCCC   ','  FFFF   '],
              ['  OCCO   ',' OCCACO  ',' SSCCCS  ',' SSCCO   ','  FFFF   ']]
worker_torso=[['  OYYO   ',' OYCHYO  ',' SYHHYS  ','  YCYSS  ','  FFFF   '],
              ['  OYYO   ',' OYCHYO  ',' SYHHYS  ','  YCCY   ','  FFFF   '],
              ['  OYYO   ',' OYCHYO  ',' SYHHYS  ',' SSYCY   ','  FFFF   ']]
frames={
 'compact':vehicle('compact',24,[4,17]),'sedan':vehicle('sedan',28,[5,21]),'truck':vehicle('truck',31,[5,24]),
 'pedestrian':[person_head+person_torso[i]+legs[i] for i in range(3)],
 'worker':[worker_head+worker_torso[i]+legs[i] for i in range(3)]
}
expected={'compact':(24,12),'sedan':(28,12),'truck':(31,12),'pedestrian':(9,15),'worker':(9,15)}
for name,variants in frames.items():
    width,height=expected[name]
    assert all(len(frame)==height and all(len(row)==width for row in frame) for frame in variants),name

block="""// Native-resolution actor art: matrix dimensions are the sprite scale (no resampling).
// Placement preserves the previous foot/road contact points as the silhouettes grow.
const SPRITE_PLACEMENT={compact:{x:0,y:-1},sedan:{x:0,y:-1},truck:{x:0,y:-1},pedestrian:{x:-1,y:-3},worker:{x:-1,y:-3}};
const SPRITE_WALK={sequence:[0,1,2,1],idleFrame:1};
const sprites={
"""
for name,variants in frames.items():
    block+=f'  {name}:{{frames:[\n'
    for f,frame in enumerate(variants):
        block+='    [\n'+',\n'.join('      '+json.dumps(row) for row in frame)+'\n    ]'+(',' if f<len(variants)-1 else '')+'\n'
    block+='  ]},\n'
a=s.index('// Actual pixel matrices.');b=s.index('  smoke:{frames:',a)
s=s[:a]+block+s[b:]
a=s.index('// A second wheel frame,');b=s.index('const PIXEL_PATHS=',a)
s=s[:a]+s[b:]
s=s.replace("C:TOWN_PALETTE.sea,P:TOWN_PALETTE.slate", "C:TOWN_PALETTE.sea,A:TOWN_PALETTE.paper,P:TOWN_PALETTE.slate")
s=s.replace('personGap:9,vehicleGap:38','personGap:11,vehicleGap:38')
s=s.replace('upperRoad:[[-28,149],[480,149]],lowerRoad:[[480,163],[-28,163]]','upperRoad:[[-34,149],[480,149]],lowerRoad:[[480,163],[-34,163]]')
s=s.replace("const shirtColors=[TOWN_PALETTE.teal,TOWN_PALETTE.brick,TOWN_PALETTE.leaf,TOWN_PALETTE.purple,TOWN_PALETTE.sand];", "const shirtColors=[TOWN_PALETTE.teal,TOWN_PALETTE.brick,TOWN_PALETTE.leaf,TOWN_PALETTE.purple,TOWN_PALETTE.sand];\n  const shirtHighlights=[TOWN_PALETTE.sky,TOWN_PALETTE.skin,TOWN_PALETTE.lightGrass,TOWN_PALETTE.steel,TOWN_PALETTE.sun];")
s=s.replace('C:shirtColors[variant%shirtColors.length],S:', 'C:shirtColors[variant%shirtColors.length],A:shirtHighlights[variant%shirtHighlights.length],S:')
s=s.replace("const image=spriteImage(type,frame,variant);ctx.save();ctx.translate(Math.round(x),Math.round(y));", "const image=spriteImage(type,frame,variant),offset=SPRITE_PLACEMENT[type]||{x:0,y:0};ctx.save();ctx.translate(Math.round(x)+offset.x,Math.round(y)+offset.y);")
s=s.replace("speed:0,frame:0,spriteType:'pedestrian'", "speed:0,frame:SPRITE_WALK.idleFrame,spriteType:'pedestrian'")
s=s.replace('distance:(laneIndex+.35)*508/laneCount','distance:(laneIndex+.35)*pathLength(PIXEL_PATHS[path])/laneCount')
s=s.replace('fixedPerson(163+i*9,236,i+3)', 'fixedPerson(160+i*11,236,i+3)')
s=s.replace('locate(object);object.frame=Math.floor(time*(isVehicle(object)?PIXEL_POLISH.wheelFrameRate:PIXEL_POLISH.walkFrameRate)+object.index)%2;', 'locate(object);const phase=Math.floor(time*(isVehicle(object)?PIXEL_POLISH.wheelFrameRate:PIXEL_POLISH.walkFrameRate)+object.index);object.frame=isVehicle(object)?phase%2:SPRITE_WALK.sequence[phase%SPRITE_WALK.sequence.length];')
s=s.replace('object.idle?0:object.frame','object.idle?SPRITE_WALK.idleFrame:object.frame')
path.write_text(s,encoding='utf-8')
for name,size in expected.items():print(name,size,'frames:',len(frames[name]))
