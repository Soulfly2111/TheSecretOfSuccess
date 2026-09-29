const assert=require('node:assert/strict'),A=require('./act1-engine'),W=require('./act1-world'),M=require('./movement');W.install(M);
let s=A.restore({room:'corridor',inventory:['brochure'],flags:{technicalOpen:true,introDone:true}},null,Object.keys(W.rooms));
assert.equal(s.room,'corridor');assert(!s.flags.cleaningLightOn);assert(s.flags.technicalOpen);assert(A.visible(s,'lightSwitch'));assert(A.visible(s,'lobbyExit'));assert(!A.visible(s,'scrubber'));
assert.match(A.act(s,'Benutze','scrubber'),/Dunkeln/);assert.match(A.act(s,'Schau an','brochure'),/Black Hole/);
A.act(s,'Mach an','lightSwitch');assert(s.flags.cleaningLightOn);assert(A.visible(s,'scrubber'));s=A.restore(JSON.parse(JSON.stringify(s)),null,Object.keys(W.rooms));assert(s.flags.cleaningLightOn);A.act(s,'Mach aus','lightSwitch');assert(!s.flags.cleaningLightOn);A.act(s,'Benutze','lightSwitch');assert(s.flags.cleaningLightOn);A.act(s,'Benutze','lightSwitch');assert(!s.flags.cleaningLightOn);
assert.deepEqual(s.inventory,['brochure']);assert(M.walkable('corridor',M.create('corridor')));console.log('PASS cleaning: migration, dark gating, inventory reading, toggles and save roundtrip');
