import test from "tape";
import mv from "../public/index";

// utils --------------------------

function isSet (fn) {
    var value;
    try {
        value = fn();
    } catch (e) {
        value = undefined;
    } finally {
        return value !== undefined;
    }
}


// passthru --------------------------

test("passthru without args", (t) => {
  let got = mv.passthru();
  t.equal(typeof got, "string", 'passthru returns a string response')
  t.equal(true, got==="invalid url",'response says invalid url when none supplied')
  t.end()
})

test("passthru with valid but incorrect url arg", (t) => {
  const URL = 'http://www.google.com';
  let got = mv.passthru(URL);
  t.ok('passing URL term: '+ URL)
  t.equal(typeof got, "string", 'passthru returns a string response')
  t.equal(got==="invalid url", true,'response says invalid url when wrong url supplied')
  t.end()
})

test("passthru with arg = URL, gives one hit, has only cadd.alt field", (t) => {
  const URL = 'http://myvariant.info/v1/variant/chr17:g.40690453T>G?fields=cadd.alt';
  let got = mv.passthru(URL);   //Promised
  t.ok('passing URL term: '+ URL)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'passthru returns an object response')
        t.equal(Array.isArray(res), false,'response is not an array (only has one hit)')
        t.equal(isSet(() => res.cadd.alt), true,'response has the cadd.alt field')
        t.equal(isSet(() => res.cadd.anc), false,'response does not have a sibling field, cadd.anc')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("passthru with arg = URL, gives 10 hits", (t) => {
  const URL = 'http://myvariant.info/v1/query?q=dbnsfp.genename:CDK?&fields=all&size=10&from=0';
  let got = mv.passthru(URL);   //Promised
  t.ok('passing URL term: '+ URL)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'passthru returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array. has size '+res.hits.length)
        t.equal(res.hits.length===10, true, 'response is an array with 10 hits (only has 10 records returned, size=10)')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("passthru with arg = URL, has many hits, returns only the cadd.alt and dbnsfp.genename fields", (t) => {
  const URL = 'http://myvariant.info/v1/query?q=dbnsfp.genename:CDK? AND _exists_:cadd&fields=cadd.alt,dbnsfp.genename&size=10000&from=0';
  let got = mv.passthru(URL);   //Promised
  t.ok('passing URL term: '+ URL)
  got
    .then(
      function(res) {
        let rec = res.hits[0];
        t.equal(typeof res, "object", 'passthru returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length>10, true, 'response is an array with "many" hits: '+res.hits.length)
        t.equal(isSet(() => rec.dbnsfp.genename), true,'response has the dbnsfp.genename  field')
        t.equal(isSet(() => rec.cadd.alt), true,'response has the cadd.alt field')
        t.equal(isSet(() => rec.cadd.anc), false,'response does not have a sibling field, cadd.anc')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("passthru with arg = URL, fake gene name, gives no hits", (t) => {
  const URL = 'http://myvariant.info/v1/query?q=dbnsfp.genename:CDK777';
  let got = mv.passthru(URL);   //Promised
  t.ok('passing URL term: '+ URL)
  got
    .then(
      function(res) {
        t.equal(typeof res, "object", 'passthru returns an object response')
        t.equal(res.hits.length===0, true, 'passthru with fake gene returns no hits')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

// properly test service endpoint failures (Promise.reject):
//   svc not available?
//   wrong url?
