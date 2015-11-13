import test from "tape";
import mv from "../public/index";

// myvariant object
test("myvariant object", (t) => {
  t.equal(typeof mv, 'object')
  t.equal(mv.hasOwnProperty('url'), true, 'myvariant object has url property')
  t.equal(mv.hasOwnProperty('validFormats') && Array.isArray(mv.validFormats), true, 'myvariant object has validFormats array')
  t.equal(mv.validFormats.length, 5, 'length of validFormats array is 5')
  t.deepEqual(mv.validFormats, ['json','csv','tsv','table','flat'], "myvariants is ['json','csv','tsv','table','flat'], serialized as:"+mv.validFormats.join())
  t.equal(mv.hasOwnProperty('passthru'), true, 'myvariant object has a passthru mthod')
  t.equal(mv.hasOwnProperty('getfields'), true, 'myvariant object has a getfields mthod')
  t.equal(mv.hasOwnProperty('getvariant'), true, 'myvariant object has a getvariant mthod')
  t.equal(mv.hasOwnProperty('getvariants'), true, 'myvariant object has a getvariants mthod')
  t.equal(mv.hasOwnProperty('query'), true, 'myvariant object has a query mthod')
  t.equal(mv.hasOwnProperty('querymany'), true, 'myvariant object has a querymany mthod')
  t.end()
})
