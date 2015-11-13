'use strict';

// cmd util to fetch data with query method:
//node src/fetch.js output.csv "dbnsfp.ensembl.transcriptid:ENST00000225927  AND snpeff.ann.gene_name:naglu AND _exists_:dbnsfp" "dbnsfp" 10000 0 csv
var fs = require('fs');
var mv = require('../public/index');
var filename = process.argv[2];

var got = mv.query(process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7]); //Promised
got.then(function (res) {
  fs.writeFile(filename, res);
}).catch(
// Rejected promise
function (reason) {
  console.log('error', reason);
});