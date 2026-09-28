const assert=require('node:assert/strict'),A=require('./act1-engine'),W=require('./act1-world');
const rooms=Object.keys(W.rooms);let s=A.fresh();
assert(!A.visible(s,'keycard'));assert(!A.visible(s,'knife'));
const first=A.dialogue(s,'walter').map(l=>l.text).join(' ');assert(!/Toilette|WC|Fensterbank|Heizung/.test(first));assert(s.flags.walterAsked);assert.match(A.hint(s),/Frag Walter/);
assert.equal(A.options(s)[0].id,'lastSeen');assert.match(A.dialogue(s,'lastSeen')[0].text,/Toilette/);assert(s.flags.wcClue);assert.equal(A.options(s).length,3);
for(const field of ['walterAsked','wcClue'])assert(A.restore(s,null,rooms).flags[field]);
assert.match(A.act(s,'Nimm','keycard'),/keine/);assert(!s.inventory.includes('keycard'));
A.act(s,'Schau an','radiator');assert(A.visible(s,'keycard'));assert.match(A.act(s,'Nimm','keycard'),/Finger zu schmal/);
A.act(s,'Nimm','knife');assert(!s.inventory.includes('knife'));A.act(s,'Öffne','drawer');assert(A.visible(s,'knife'));A.act(s,'Schließe','drawer');assert(!A.visible(s,'knife'));A.act(s,'Öffne','drawer');A.act(s,'Nimm','knife');A.act(s,'Nimm','knife');assert.deepEqual(s.inventory,['knife']);assert(!A.visible(s,'knife'));
A.act(s,'Benutze','radiator','knife');assert(s.inventory.includes('keycard'));assert(!A.visible(s,'keycard'));s=A.restore(JSON.parse(JSON.stringify(s)),null,rooms);assert.deepEqual(s.inventory,['knife','keycard']);
A.act(s,'Gib','walter','keycard');assert(s.flags.cardReturned);assert.deepEqual(s.inventory,['knife']);assert.deepEqual(A.options(s),[]);assert(s.journal.some(t=>t.includes('empfiehlt')));const count=s.journal.length;A.act(s,'Gib','walter','keycard');assert.equal(s.journal.length,count);assert(!/Toilette/.test(A.dialogue(s,'walter')[0].text));
// Early knife / independent discovery / direct return all work without a dialogue prerequisite.
s=A.fresh();A.act(s,'Öffne','drawer');A.act(s,'Nimm','knife');A.act(s,'Benutze','radiator','knife');assert(!s.flags.cardTaken);A.act(s,'Schau an','radiator');A.act(s,'Benutze','keycard','knife');A.act(s,'Benutze','walter','keycard');assert(s.flags.cardReturned&&!s.flags.wcClue);
const old={room:'kitchen',inventory:['brochure'],flags:{kitchenOpen:true},journal:['original']},snapshot=JSON.stringify(old);const migrated=A.restore(old,null,rooms);assert.equal(migrated.room,'kitchen');assert(!migrated.flags.introDone);assert(migrated.flags.kitchenOpen);assert.equal(JSON.stringify(old),snapshot);
assert(!A.restore(null,{room:'lobby',inventory:['knife'],flags:{introDone:true,cardReturned:true}},rooms).flags.cardReturned);
console.log('PASS Walter: no first-dialogue spoiler, repeatable clue, visibility, knife gate, independent discovery, both return verbs, persistent flags/inventory/recommendation, old save isolation.');
