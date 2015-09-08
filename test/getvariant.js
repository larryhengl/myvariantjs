import test from 'tape';
import converter from 'json-2-csv';
import flat from 'flat';
import mv from '../public/index';

// getvariant --------------------------

test("get variant - without args", (t) => {
  let got = mv.getvariant();   //Promised

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


test("get variant - pass single string arg for a variant id: chr9:g.107620835G>A", (t) => {
  let got = mv.getvariant('chr9:g.107620835G>A');   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'getvariants returns an object response')
        t.equal(res._id, 'chr9:g.107620835G>A', 'response has the requested id')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})


test("get variant - for a given variant id, chr9:g.107620835G>A, only show the genename field under dbnsfp", (t) => {
  let got = mv.getvariant('chr9:g.107620835G>A', 'dbnsfp.genename');   //Promised

  got
    .then(
      function(res) {
          t.equal(typeof res, 'object', 'getvariants returns an object response')
          t.equal(res._id, 'chr9:g.107620835G>A', 'response has the requested id')
          t.equal(res.hasOwnProperty("dbnsfp") && res.dbnsfp.hasOwnProperty("genename"), true,'response has the dbnsfp.genename field')
          t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})



test("get variant - pass incorrect formatted field list param when only showing the genename field under dbnsfp", (t) => {
  let got =  mv.getvariant('chr9:g.107620835G>A', {fields:'dbnsfp.genename'});   //Promised

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


test("get variant - for a given variant id, chr9:g.107620835G>A, only show the dbnsfp.genename and cadd fields", (t) => {
  let got = mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd']);   //Promised

  got
    .then(
      function(res) {
        t.equal(typeof res, 'object', 'getvariants returns an object response')
        t.equal(res.hasOwnProperty('dbnsfp') && res.dbnsfp.hasOwnProperty('genename'), true,'response has the dbnsfp.genename field')
        t.equal(res.hasOwnProperty('cadd'), true, 'response has the cadd field')
        t.equal(res.hasOwnProperty('snpeff'), false, 'response does not have the snpeff field')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})


test("get variant chr9:g.107620835G>A, only showing dbnsfp.genename and cadd.phred, in csv format", (t) => {
  let got = mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'], 'csv');
  got
    .then(
      function(res) {
        let opts = {"DELIMITER": {"FIELD": ",",WRAP: '"'}};
        converter.csv2json(res, (err,j) => {
          let json = j[0];
          if (err) throw err;
          t.equal(typeof res, 'string', 'getvariants returns a csv string response')
          t.notEqual(res.length, 0, 'getvariants with csv format returns a string with a length')
          t.equal(json._id, 'chr9:g.107620835G>A', 'response has the requested id')
          t.equal(json.hasOwnProperty('dbnsfp') && json.dbnsfp.hasOwnProperty('genename'), true,'response has the dbnsfp.genename field')
          t.equal(json.hasOwnProperty('cadd') && json.cadd.hasOwnProperty('phred'), true, 'response has the cadd field')
          t.equal(json.hasOwnProperty('snpeff'), false, 'response does not have the snpeff field')
          t.end()
        },opts)
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('Proper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})
