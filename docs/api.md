

<!-- Start src/index.js -->

## _get

------------------------------------------------------------------
### Private fn to make the GET call. See the source.

```
// this callback is fired off when the Promise is resolved
let cb = (resp) => {
    return resp.body;
};

_get(params,cb);
```

### Params:

* **object** *[params]* - optional params to pass to caller.

### Return:

* **object** json

## _post

------------------------------------------------------------------
### Private fn to make the POST call. See the source.

### Params:

* **object** *[params]* - optional params to pass to caller.

### Return:

* **object** json

## passthru(url)

------------------------------------------------------------------
###  Passthru query specifiying input and output from a UI, passing in a fully valid service GET url.

Example calls:
```javascript
var mv = require('myvariantjs');
mv.passthru('http://myvariant.info/v1/variant/chr17:g.40690453T>G?fields=cadd')
```

### Params:

* **string** *url* - fully valid url for a GET service call.

### Return:

* **object** json

## getfields([search])

------------------------------------------------------------------
###  Return the field metadata available in variant objects.
#### This is a wrapper to the [Variant Fields](http://myvariant.info/v1/fields) service.

Example calls:
```javascript
var mv = require('myvariantjs');
mv.getfields()
mv.getfields('gene')
```

### Params:

* **string** *[search]* - optional case insensitive string to search for in available field names. Leaving this empty returns all fields.

### Return:

* **object** json

## getvariant(vid, [options])

------------------------------------------------------------------
###  Return the variant object for the given HGVS-based variant id.
#### This is a wrapper for a GET query of "/variant/{hgvsid}" service.

Example endpoint:
* GET [http://myvariant.info/v1/variant/chr16:g.28883241A>G](http://myvariant.info/v1/variant/chr16:g.28883241A>G)

Example calls:
```javascript
var mv = require('myvariantjs');
mv.getvariant('chr9:g.107620835G>A')
mv.getvariant('chr9:g.107620835G>A', {fields:'dbnsfp.genename'})
mv.getvariant('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd.phred']})
mv.getvariant('chr9:g.107620835G>A', {fields:'all'})
mv.getvariant('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd.phred'], from: 0, format:'csv'})
mv.getvariant('chr9:g.107620835G>A', {format:'tsv'})
```

> *Notes:*
> * The supported field names passed to the *fields* parameter can be found from any full variant object (without *fields*, or *fields="all"*).
> * Field name supports dot notation for nested data structure as well, e.g. you can pass "dbnsfp.genename" or "cadd.phred".
> * output formats "table" and "tsv" are the same.
> * _API Note: optional params are pased in via named options object_

### Params:

* **string** *vid* - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
* **object** *[options]* - optional params are pased in via named options object: 
 * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 * [from] - {number} when paging use `from` as the row offset. Default = 0.
 * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".

### Return:

* **object|string** json or string

## getvariants(vids, [options])

------------------------------------------------------------------
### Make variant queries in batch for a list of HGVS name-based ids
####  Return the list of variant annotation objects for the given list of hgvs-base variant ids.
#### This is a wrapper for POST query of "/variant" service.

Example endpoint:
* POST [http://myvariant.info/v1/variant/](http://myvariant.info/v1/variant/)
  * form-data: {ids="chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", fields="dbnsfp.genename,cadd.phred"}

Example calls:
```javascript
var mv = require('myvariantjs');
mv.getvariants("chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C")  // string of delimited ids
mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"])  // array of ids
mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:'cadd.phred'})
mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:'dbnsfp.genename', format:'csv'})
mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:['dbnsfp.genename', 'cadd.phred'], size: 5000, format:'table'})
mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:['dbnsfp.genename', 'cadd.phred'], size: 10000, from: 0, format:'tsv'})
```

> *Notes:*
> * The supported field names passed to the *fields* parameter can be found from any full variant object (without *fields*, or *fields="all"*).
> * Field name supports dot notation for nested data structure as well, e.g. you can pass "dbnsfp.genename" or "cadd.phred".
> * output formats "table" and "tsv" are the same.
> * _API Note: optional params are pased in via named options object_

### Params:

* **string|array** *vids* - string of comma delimited hgvs-formatted variant ids, eg. "chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", or array of ids, eg. ["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"],
* **object** *[options]* - optional params are pased in via named options object: 
 * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 * [from] - {number} when paging use `from` as the row offset. Default = 0.
 * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".

### Return:

* **object|string** json or string

## query(query, [options])

------------------------------------------------------------------
###  Return a variant query result.
#### This is a wrapper for GET query of "/query?q={query}" service.

##### Service API [here](http://docs.myvariant.info/en/latest/doc/variant_query_service.html#query-parameters)

<br>
Example endpoints:
 * GET [http://myvariant.info/v1/query?q=chr1:69000-70000](http://myvariant.info/v1/query?q=chr1:69000-70000)
 * GET [http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10](http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10)

Example calls:
```javascript
var mv = require('myvariantjs');
// var mv = require('./public/index');
mv.query("chr1:69000-70000", {fields:'dbnsfp.genename'})
mv.query("dbsnp.rsid:rs58991260", {fields:'dbnsfp'})
mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", , {fields:'dbnsfp.polyphen2.hdiv'})
mv.query("snpeff.ann.gene_name:naglu", {fields:["snpeff.ann.gene_name","dbnsfp"], size:10, format:"csv"})
```

Paging
```
q=cdk*&size=50                     first 50 hits
q=cdk*&size=50&from=50             the next 50 hits
```

Range queries
```
q=dbnsfp.polyphen2.hdiv.score:>0.99
q=dbnsfp.polyphen2.hdiv.score:>=0.99
q=exac.af:<0.00001
q=exac.af:<=0.00001

q=exac.ac.ac_adj:[76640 TO 80000]        # bounded (including 76640 and 80000)
q=exac.ac.ac_adj:{76640 TO 80000}        # unbounded
```

Wildcard queries
```
q=cdk*
q=dbnsfp.genename:CDK?
q=dbnsfp.genename:CDK*
```

> *Notes:*
> * The combination of “size” and “from” parameters can be used to get paging for large queries.
> * Wildcard characters “*” and ”?” are supported in either simple queries or fielded queries.
> * _API Note: optional params are pased in via named options object_

### Params:

* **string** *query* - case insensitive string to search.
* **object** *[options]* - optional params are pased in via named options object: 
 * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 * [from] - {number} when paging use `from` as the row offset. Default = 0.
 * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".

### Return:

* **object|string** json or string

## querymany(query, [options])

------------------------------------------------------------------
###  Return the batch query result.
#### This is a wrapper for POST query of "/query" service.

Example calls:
```javascript
var mv = require('myvariantjs');
mv.querymany('chr1:g.218631822G>A, chr11:g.66397320A>G'])
mv.querymany(['RCV000083620', 'RCV000083611', 'RCV000083584'], {scopes:'clinvar.rcv_accession'})
mv.querymany(['COSM1362966', 'COSM990046', 'COSM1392449'], {scopes:['dbsnp.rsid', 'cosmic.cosmic_id'], fields:['dbsnp','cosmic']})
```

> *Notes:*
> * _API Note: optional params are pased in via named options object_

### Params:

* **string** *query* - csv formatted search terms.
* **object** *[options]* - optional params are pased in via named options object: 
 * [scopes] - {string|array} string or array of field names to scope the search to
 * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 * [from] - {number} when paging use `from` as the row offset. Default = 0.
 * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".

### Return:

* **object|string** json or string

<!-- End src/index.js -->

