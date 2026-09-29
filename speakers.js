// Stable identities are independent of the names printed in dialogue strings.
const Speakers=(()=>{
 const entries={
  hero:['DU','#57A9FF'],uncle:['ONKEL','#FF6565'],walter:['WALTER','#FFE066'],
  mechanic:['KALLE','#76DB83'],reception:['EMPFANG','#59DCCB'],
  driver:['FAHRER','#FFA45B'],technician:['TECHNIKERIN','#B0E8BC'],
  officeStaff:['MITARBEITERIN','#BE95FF'],meetingStaff:['MITARBEITER','#FF94C8'],
  teamLeader:['TEAMLEITER','#FFD0A0'],copyStaff:['MITARBEITERIN','#E78BEF'],
  trainer:['TRAINER','#C6E66B'],breakStaff:['MITARBEITERIN','#D4C1FF']
 };
 const aliases={Du:'hero',Onkel:'uncle',Walter:'walter',Kalle:'mechanic',Empfang:'reception',intercom:'reception',Fahrer:'driver',Technikerin:'technician',Teamleiter:'teamLeader',Trainer:'trainer'};
 function resolve(id){return entries[id]?id:aliases[id]||'hero';}
 function get(id){const key=resolve(id),[name,color]=entries[key];return {id:key,name,color};}
 return {get,resolve,entries};
})();
