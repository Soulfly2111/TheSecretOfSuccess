(function(root){
'use strict';
// One description drives both the rendered scene changes and regression checks.
function objects(state){const f=state.flags,has=id=>state.inventory.includes(id);return {
 manual:!has('manual'),key:!has('key'),coffee:has('coffee'),cup:!has('cup')&&!has('water')&&!has('coffee')&&!f.coffeeGiven,grounds:!!f.cupboard&&!has('grounds')&&!f.grounds,cupboardOpen:!!f.cupboard,coffeeReady:!!f.brewed&&!has('coffee')&&!f.coffeeGiven,rag:!has('rag'),
 toolboxOpen:!!f.toolbox,wrenchInBox:!!f.toolbox&&!has('wrench'),chestOpen:!!f.chest,
 hoodOpen:!!f.hood,tractorBelt:!f.beltTaken,engineBelt:!!f.belt
};}
const api={objects};if(typeof module!=='undefined')module.exports=api;else root.SceneState=api;
})(typeof window!=='undefined'?window:globalThis);
