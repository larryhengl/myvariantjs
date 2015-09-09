

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

## getvariant(vid, [fields], [format])

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
 mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'], 'csv')
 mv.getvariant('chr9:g.107620835G>A', null, 'tsv')
```

> *Notes*
>> The supported field names passed to the *fields* parameter can be found from
>> any full variant object (without *fields*, or *fields="all"*).
>
>> Field name supports dot notation for nested data structure as well,
>> e.g. you can pass "dbnsfp.genename" or "cadd.phred".

### Params:

* **string** *vid* - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
* **string|array** *[fields]* - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
* **string** *[format]* - convert json to given format. Supports json, csv, tsv, table (csv), flat. Default=json. Note: non-josn are flattened, and tsv=table=flat.

### Return:

* **object** json

## query(search)

------------------------------------------------------------------
###  Return a variant query result.
#### This is a wrapper for GET query of "/query?q={query}" service.

Example calls:
```javascript
 var mv = require('myvariantjs');
 mv.query("dbsnp.rsid:rs58991260", "dbsnp")
 mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", "dbnsfp.polyphen2.hdiv")
 mv.query("chr1:69000-70000", "cadd.phred")
```

### Params:

* **string** *search* - case insensitive string to search. ??

### Return:

* **object** json

superagent
      //.get('http://myvariant.info/v1/query?q=dbnsfp.genename:CDK2')
      .get(this.url + path)
      .query({ q: qry || term })
      .end(function(err, res){
        if (err) console.log('error fetching from service',err);
        else console.log(res.body.hits.length);
      });

## querymany(search)

------------------------------------------------------------------
###  Return the batch query result.
#### This is a wrapper for POST query of "/query" service.

Example calls:
```javascript
 var mv = require('myvariantjs');
 mv.query("dbsnp.rsid:rs58991260", "dbsnp")
 mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", "dbnsfp.polyphen2.hdiv")
 mv.query("chr1:69000-70000", "cadd.phred")
```

### Params:

* **string** *search* - case insensitive string to search. ??

### Return:

* **object** json

<!-- End src/index.js -->

