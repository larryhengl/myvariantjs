

<!-- Start src/index.js -->

## _get

------------------------------------------------------------------
### Private fn to make the GET call.

### Params:

* **object** *[params]* - optional params to pass to caller.

### Return:

* **object** json

## _post

------------------------------------------------------------------
### Private fn to make the POST call.

### Params:

* **object** *[params]* - optional params to pass to caller.

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

## getvariant(vid, [fields], [size], [from], [format])

------------------------------------------------------------------
###  Return the variant object for the given HGVS-based variant id.
#### This is a wrapper for a GET query of "/variant/{hgvsid}" service.

Example endpoint:
  GET
  http://myvariant.info/v1/variant/chr16:g.28883241A>G

Example calls:
```javascript
 var mv = require('myvariantjs');
 mv.getvariant('chr9:g.107620835G>A')
 mv.getvariant('chr9:g.107620835G>A', 'dbnsfp.genename')
 mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'])
 mv.getvariant('chr9:g.107620835G>A', 'all')
 mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'], null, 0, 'csv')
 mv.getvariant('chr9:g.107620835G>A', null, null, null, 'tsv')
```

> *Notes*
>> The supported field names passed to the *fields* parameter can be found from
>> any full variant object (without *fields*, or *fields="all"*).
>
>> Field name supports dot notation for nested data structure as well,
>> e.g. you can pass "dbnsfp.genename" or "cadd.phred".

API Note: optional params are pased in via named options object

### Params:

* **string** *vid* - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
* **string|array** *[fields]* - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
* **number** *[size]* - boost the response size from the default 1000 given by the service api
* **number** *[from]* - when paging use `from` as the row offset
* **number** *[format]* - output formats: "json", "csv", "tsv", "table". Default = "json".

### Return:

* **object** json

## getvariants(vids, [fields], [size], [from], [format])

------------------------------------------------------------------
### Make variant queries in batch for a list of HGVS name-based ids
####  Return the list of variant annotation objects for the given list of hgvs-base variant ids.
#### This is a wrapper for POST query of "/variant" service.

Example endpoint:
  POST
  http://myvariant.info/v1/variant/
   form-data: {ids="chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C",
               fields="dbnsfp.genename,cadd.phred"}

Example calls:
```javascript
 var mv = require('myvariantjs');
 mv.getvariants("chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C")  // string of delimited ids
 mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"])  // array of ids
 mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], "cadd.phred")
 mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], "dbnsfp.genename", null, null, "csv")
 mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], 5000, null, "table")
 mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], 10000, 0, "tsv")
```

> *Notes*
>> The supported field names passed to the *fields* parameter can be found from
>> any full variant object (without *fields*, or *fields="all"*).
>
>> Field name supports dot notation for nested data structure as well,
>> e.g. you can pass "dbnsfp.genename" or "cadd.phred".
>
>> output formats "table" and "tsv" are the same.

API Note: optional params are pased in via named options object

### Params:

* **string|array** *vids* - string of comma delimited hgvs-formatted variant ids, eg. "chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", or array of ids, eg. ["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"],
* **string|array** *[fields]* - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
* **number** *[size]* - boost the response size from the default 1000 given by the service api. Default = 10000.
* **number** *[from]* - when paging use `from` as the row offset. Default = 0.
* **number** *[format]* - output formats: "json", "csv", "tsv", "table". Default = "json".

### Return:

* **object|string** json or string

## query(search, [fields], [size], [from], [format])

------------------------------------------------------------------
###  Return a variant query result.
#### This is a wrapper for GET query of "/query?q={query}" service.

##### Service API [here](http://docs.myvariant.info/en/latest/doc/variant_query_service.html#query-parameters)

Example endpoints:
  GET http://myvariant.info/v1/query?q=chr1:69000-70000
  GET http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10

Example calls:
```javascript
 var mv = require('myvariantjs');
 var mv = require('./public/index');
 mv.query("chr1:69000-70000", "cadd.phred")
 mv.query("dbsnp.rsid:rs58991260", "dbsnp")
 mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", "dbnsfp.polyphen2.hdiv")
 mv.query("snpeff.ann.gene_name:naglu", ["snpeff.ann.gene_name","dbnsfp"], 10, null, "csv")
```

 **_note: The combination of “size” and “from” parameters can be used to get paging for large queries:_**
```
  q=cdk*&size=50                     first 50 hits
  q=cdk*&size=50&from=50             the next 50 hits
```

**_Range queries_**
```
  q=dbnsfp.polyphen2.hdiv.score:>0.99
  q=dbnsfp.polyphen2.hdiv.score:>=0.99
  q=exac.af:<0.00001
  q=exac.af:<=0.00001

  q=exac.ac.ac_adj:[76640 TO 80000]        # bounded (including 76640 and 80000)
  q=exac.ac.ac_adj:{76640 TO 80000}        # unbounded
```

**_Wildcard queries_**
**_note: wildcard character “*” or ”?” is supported in either simple queries or fielded queries:_**
```
  q=cdk*
  q=dbnsfp.genename:CDK?
  q=dbnsfp.genename:CDK*
```

API Note: optional params are pased in via named options object

### Params:

* **string** *search* - case insensitive string to search.
* **string|array** *[fields]* - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
* **number** *[size]* - boost the response size from the default 1000 given by the service api
* **number** *[from]* - when paging use `from` as the row offset
* **string** *[format]* - output formats: "json", "csv", "tsv", "table". Default = "json".

### Return:

* **object|string** json or string

## querymany(q, [scopes], [fields], [size], [from], [format])

------------------------------------------------------------------
###  Return the batch query result.
#### This is a wrapper for POST query of "/query" service.

Example calls:
```javascript
 var mv = require('myvariantjs');
 mv.querymany(['rs58991260', 'rs2500'], 'dbsnp.rsid')
 mv.querymany(['RCV000083620', 'RCV000083611', 'RCV000083584'], 'clinvar.rcv_accession')
 mv.querymany(['COSM1362966', 'COSM990046', 'COSM1392449'], ['dbsnp.rsid', 'cosmic.cosmic_id'], ['dbsnp','cosmic'])
```

API Note: optional params are pased in via named options object

### Params:

* **string** *q* - csv formatted search terms
* **string|array** *[scopes]* - string or array of field names to scope the search to
* **string|array** *[fields]* - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
* **number** *[size]* - boost the response size from the default 1000 given by the service api
* **number** *[from]* - when paging use `from` as the row offset
* **string** *[format]* - output formats: "json", "csv", "tsv", "table". Default = "json".

### Return:

* **object|string** json or string

<!-- End src/index.js -->

