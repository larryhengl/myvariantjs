import test from "tape";
import mv from "../public/index";
//import mv from "myvariant";

// getfields --------------------------

test("getfields without args", (t) => {
  let got = mv.getfields();   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'getfields returns an object response')
        t.equal(true, res.hasOwnProperty("cadd"),'response has the cadd field')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        //t.ok('Proper rejection is handled, with rejected promise: '+reason);
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("getfields with arg = cadd, gives one or many hits", (t) => {
  const SEARCH = "cadd";
  let got = mv.getfields(SEARCH);   //Promised
  t.ok('passing search term: '+SEARCH)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'getfields returns an object response')
        t.equal(true, res.hasOwnProperty(SEARCH),'response has the field: '+SEARCH)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        //t.ok('Proper rejection is handled, with rejected promise: '+reason);
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("getfields with arg = gene, gives many hits", (t) => {
  const SEARCH = "gene";
  let got = mv.getfields(SEARCH);   //Promised
  t.ok('passing search term: '+SEARCH)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'getfields returns an object response')
        t.equal(true, Object.keys(res).length > 0,'response has many fields for: '+SEARCH)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        //t.ok('Proper rejection is handled, with rejected promise: '+reason);
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("getfields with arg = cadd.chrom, gives one hit", (t) => {
  const SEARCH = "cadd.chrom";
  let got = mv.getfields(SEARCH);   //Promised
  t.ok('passing search term: '+SEARCH)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'getfields returns an object response')
        t.equal(true, Object.keys(res).length === 1,'response has one field for: '+SEARCH)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        //t.ok('Proper rejection is handled, with rejected promise: '+reason);
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("getfields with arg = nohits, gives no hits", (t) => {
  const SEARCH = "nohits";
  let got = mv.getfields(SEARCH);   //Promised
  t.ok('passing search term: '+SEARCH)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'getfields returns an object response')
        t.equal(false, res.hasOwnProperty(SEARCH),'response does not have the field: '+SEARCH)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        //t.ok('Proper rejection is handled, with rejected promise: '+reason);
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

// properly test service endpoint failures (Promise.reject):
//   svc not available
//   wrong url
// test for no hits


// check the metadata services
// http://myvariant.info/v1/api/#MyVariant.info-metadata-service-GET-Metadata-service
