import test from 'tape';
import converter from 'json-2-csv';
import flat from 'flat';
import mv from '../public/index';

// getvariants --------------------------
// TODO: add tests for...
// size parameter
// from parameter
test("get variants - without args", (t) => {
  let got = mv.getvariants();   //Promised

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


test("get variants - pass single string arg for a variant id: chr9:g.107620835G>A", (t) => {
  let got = mv.getvariants('chr9:g.107620835G>A');   //Promised

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


test("get variants - for a given variant id, chr9:g.107620835G>A, only show the genename field under dbnsfp", (t) => {
  let got = mv.getvariants('chr9:g.107620835G>A', {fields:'dbnsfp.genename'});   //Promised

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



test("get variants - pass incorrect formatted field list param when only showing the genename field under dbnsfp", (t) => {
  let got =  mv.getvariants('chr9:g.107620835G>A', 'dbnsfp.genename');   //Promised

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


test("get variants - for chr9:g.107620835G>A, only fetch the dbnsfp.genename and cadd fields", (t) => {
  let got = mv.getvariants('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd']});   //Promised

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


test("get variants - for chr9:g.107620835G>A, only fetch dbnsfp.genename and cadd.phred, in csv format", (t) => {
  let got = mv.getvariants('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd.phred'], format:'csv'});

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

// --- multiple variants ---------
test("get variants - pass string of variant ids: 'chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C'", (t) => {
  let got = mv.getvariants("chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C");

  got
    .then(
      function(res) {
        let ids = res.map(r => r._id);
        t.equal(typeof res, 'object', 'getvariants returns an object response')
        t.equal(ids.length, 3, 'response has 3 ids')
        t.deepEqual(ids, ['chr1:g.866422C>T','chr1:g.876664G>A','chr1:g.69635G>C'], 'response has the requested ids')
        t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("get variants - pass incorrect formatted id list param when only showing the genename field under dbnsfp", (t) => {
  let got =  mv.getvariants({ids:['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C']});

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

test("get variants - pass incorrect formatted field list param when only showing the genename field under dbnsfp", (t) => {
  let got =  mv.getvariants(['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], 'dbnsfp.genename');

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

test("get variants - for a given array of variant ids, ['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], only show the genename field under dbnsfp", (t) => {
  let got = mv.getvariants(['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], {fields:'dbnsfp.genename'});

  got
    .then(
      function(res) {
          let ids = res.map(r => r._id);
          let genes = res.filter(r => r.dbnsfp && r.dbnsfp.genename).map(r => r.dbnsfp.genename);
          let snpeffs = res.filter(r => r.snpeff);
          t.equal(typeof res, 'object', 'getvariants returns an object response')
          t.equal(ids.length, 3, 'response has 3 ids')
          t.deepEqual(ids, ['chr1:g.866422C>T','chr1:g.876664G>A','chr1:g.69635G>C'], 'response has the requested ids')
          t.equal(genes.length, 2, 'response has 2 genes')
          t.deepEqual(genes, ['SAMD11','OR4F5'], 'response has SAMD11 and OR4F5 gene names')
          t.equal(snpeffs.length, 0, 'response does not have the snpeff field, means no other fields fetched')
          t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})

test("get variants - for a given variant id, chr9:g.107620835G>A, only show the dbnsfp.genename and cadd fields", (t) => {
  let got = mv.getvariants('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd']});   //Promised

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

test("get variants - for a given array of variant ids, ['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], only show the genename field under dbnsfp", (t) => {
  let got = mv.getvariants(['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], {fields:['dbnsfp.genename', 'cadd']});

  got
    .then(
      function(res) {
          let ids = res.map(r => r._id);
          let genes = res.filter( r => r.dbnsfp && r.dbnsfp.genename).map(r => r.dbnsfp.genename);
          let cadds = res.filter( r => r.cadd && r.cadd.type).map(r => r.cadd.type);
          let snpeffs = res.filter(r => r.snpeff);
          t.equal(typeof res, 'object', 'getvariants returns an object response')
          t.equal(ids.length, 3, 'response has 3 ids')
          t.deepEqual(ids, ['chr1:g.866422C>T','chr1:g.876664G>A','chr1:g.69635G>C'], 'response has the requested ids')
          t.equal(genes.length, 2, 'response has 2 genes')
          t.deepEqual(genes, ['SAMD11','OR4F5'], 'response has SAMD11 and OR4F5 gene names')
          t.equal(cadds.length, 3, 'response has 3 cadd objects')
          t.deepEqual([...new Set(cadds)].length, 1, 'response has 1 unique cadd.type')
          t.deepEqual([...new Set(cadds)][0], 'SNV', 'response has 1 unique cadd.type value of "SNV"')
          t.equal(snpeffs.length, 0, 'response does not have the snpeff field, means no other fields fetched')
          t.end()
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})



test("get variants - for ['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], only showing dbnsfp.genename and cadd.phred, in csv format", (t) => {
  let got = mv.getvariants(['chr1:g.866422C>T', 'chr1:g.876664G>A', 'chr1:g.69635G>C'], {fields:['dbnsfp.genename', 'cadd.phred'], format:'csv'});
  got
    .then(
      function(res) {
        let opts = {"DELIMITER": {"FIELD": ",",WRAP: '"'}};
        converter.csv2json(res, (err,json) => {
          if (err) throw err;
          let ids = json.map(r => r._id.replace(',',''));
          let genes = json.filter( r => r.dbnsfp && r.dbnsfp.genename).map(r => r.dbnsfp.genename);
          let cadds = json.filter( r => r.cadd && r.cadd.phred).map(r => r.cadd.phred);
          let snpeffs = json.filter(r => r.snpeff);
          t.equal(typeof res, 'string', 'getvariants returns a csv string response')
          t.notEqual(res.length, 0, 'getvariants with csv format returns a string with a length')
          t.deepEqual(ids, ['chr1:g.866422C>T','chr1:g.876664G>A','chr1:g.69635G>C'], 'response has the requested ids')
          t.equal(genes.length, 2, 'response has 2 genes')
          t.deepEqual(genes, ['SAMD11','OR4F5'], 'response has SAMD11 and OR4F5 gene names')
          t.equal(cadds.length, 3, 'response has 3 cadd objects')
          t.deepEqual([...new Set(cadds)].length, 3, 'response has 3 unique cadd.phred values')
          t.equal(snpeffs.length, 0, 'response does not have the snpeff field, means no other fields fetched')
          t.end()
        },opts)
      })
    .catch(
      // Rejected promise
      function(reason) {
        t.fail('improper rejection is handled, with rejected promise: '+reason);
        t.end()
      })
})
