import test from 'tape';
import converter from 'json-2-csv';
import flat from 'flat';
import mv from '../public/index';

// utils --------------------------

function isSet (fn) {
    let value;
    try {
        value = fn();
    } catch (e) {
        value = undefined;
    } finally {
        return value !== undefined;
    }
}

// query --------------------------

test("query - without args", (t) => {
  let got = mv.query();   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper query arg", (t) => {
  let got = mv.query({});   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper options arg", (t) => {
  let got = mv.query('rs58991260',1);   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper (default) fields arg", (t) => {
  let got = mv.query('rs58991260',{fields:100});   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper (default) size arg", (t) => {
  let got = mv.query('rs58991260',{size:'a'});   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper (default) `from` arg", (t) => {
  let got = mv.query('rs58991260',{from:'a'});   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - without proper (default) format arg", (t) => {
  let got = mv.query('rs58991260',{format:'a'});   //Promised

  got
    .then(
      function(res) {
        t.fail('this should be handled by a properly rejected promise')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.ok(true,'proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})


test("query - pass single string arg for a rsid: rs7498665", (t) => {
  let got = mv.query('rs7498665');   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'getvariants returns an object response')
        t.equal(res.hits.length, 2, 'response has 2 hits for the given rsid')
        t.equal(res.hits[0]._id, 'chr16:g.28883241A>T', 'response has the variant id: '+res._id)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})


test("query - simple query, pass single string arg for an rsid: rs7498665, returns only the cadd.alt and dbnsfp.genename fields", (t) => {
  let got = mv.query('rs7498665',{fields:['cadd.alt','dbnsfp.genename']});   //Promised

  got
    .then(
      function(res) {
        let rec = res.hits[0];
        t.equal(typeof res, 'object', 'query returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length === 2, true, 'response is an array with 2 hits')
        t.equal(rec._id, 'chr16:g.28883241A>T', 'first hit has the variant id: '+rec._id)
        t.equal(isSet(() => rec.dbnsfp.genename), true,'response has the dbnsfp.genename  field')
        t.equal(isSet(() => rec.cadd.alt), true,'response has the cadd.alt field')
        t.equal(isSet(() => rec.cadd.anc), false,'response does not have a sibling field, cadd.anc')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})


test("query - fielded search, pass single string arg dbnsfp.genename:CDK2, returns all fields for multiple hits", (t) => {
  let got = mv.query('dbnsfp.genename:CDK2');   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'query returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length > 0, true, 'response is an array with many hits: '+res.hits.length)
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - fielded search, pass single string arg `dbnsfp.genename:CDK2`, returns only the vcf.position field for all 3 hits", (t) => {
  let got = mv.query('dbnsfp.genename:CDK2 AND vcf.position:56365014',{fields:['vcf.position']});   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'query returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length === 3, true, 'response is an array with 3 hits: '+res.hits.length)
        t.equal(isSet(() => res.hits[0].vcf.position), true,'1st response hit has the vcf.position field')
        t.equal(isSet(() => res.hits[0].cadd.anc), false,'response does not have the cadd.anc field')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - fielded search, pass single string arg `dbnsfp.genename:CDK2`, returns only the vcf.position field limited to 2 hits", (t) => {
  let got = mv.query('dbnsfp.genename:CDK2 AND vcf.position:56365014',{fields:['vcf.position'], size: 2});   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'query returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length === 2, true, 'response is an array with 2 hits: '+res.hits.length)
        t.equal(isSet(() => res.hits[0].vcf.position), true,'1st response hit has the vcf.position field')
        t.equal(isSet(() => res.hits[0].cadd.anc), false,'response does not have the cadd.anc field')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("query - fielded search, pass single string arg `dbnsfp.genename:CDK2`, returns only the vcf.position field limited to the 3rd hit", (t) => {
  let got = mv.query('dbnsfp.genename:CDK2 AND vcf.position:56365014',{fields:['vcf.position'], size: 1, from: 2});   //Promised

  got
    .then(
      function(res) {
        console.log(res)
        t.equal(typeof res, 'object', 'query returns an object response')
        t.equal(Array.isArray(res.hits), true, 'response is an array')
        t.equal(res.hits.length === 1, true, 'response is an array with 1 hit')
        t.equal(res.hits[0]._id === 'chr12:g.56365014G>A', true, 'response hit is variant chr12:g.56365014G>A')
        t.equal(isSet(() => res.hits[0].vcf.position), true,'1st response hit has the vcf.position field')
        t.equal(isSet(() => res.hits[0].cadd.anc), false,'response does not have the cadd.anc field')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})
