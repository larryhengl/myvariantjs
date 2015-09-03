import test from "tape";
import mv from "../public/index";

// myvariant object
test("myvariant object", (t) => {
  t.plan(5)
  t.equal(typeof mv, 'object')
  t.equal(mv.hasOwnProperty('url'), true, 'myvariant object has url property')
  t.equal(mv.hasOwnProperty('validFormats') && Array.isArray(mv.validFormats), true, 'myvariant object has validFormats array')
  t.equal(mv.validFormats.length, 5, 'length of validFormats array is 5')
  t.deepEqual(mv.validFormats, ['json','csv','tsv','table','flat'], "myvariants is ['json','csv','tsv','table','flat']")
})
