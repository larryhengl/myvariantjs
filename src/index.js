import superagent from 'superagent';
import flat from 'flat';
import converter from 'json-2-csv';

/**
 * ------------------------------------------------------------------
 * ### Private fn to make the GET call.
 * @name _get
 * @param {object} [params] - optional params to pass to caller.
 * @return {object} json
 * @api private
 */
async function _get(params,cb) {
  const fetcher = () => {
    return new Promise((resolve, reject) => {
      superagent
        .get(params.url)
        .query(params.query)
        .end((error, resp) => {
          error ? reject('error fetching from service: '+error) : resolve(cb(resp));
        });
    });
  };
  return await fetcher();
};


/**
 * ------------------------------------------------------------------
 * ### Private fn to make the POST call.
 * @name _post
 * @param {object} [params] - optional params to pass to caller.
 * @return {object} json
 * @api private
 */
async function _post(params,cb) {
  const fetcher = () => {
    return new Promise((resolve, reject) => {
      superagent
        .post(params.url)
        .type('form')
        .send(params.query)
        .end((error, resp) => {
          error ? reject('error fetching from service: '+error) : resolve(cb(resp));
        });
    });
  };
  return await fetcher();
};



export default {
  url: 'http://myvariant.info/v1/',
  validFormats: ['json','csv','tsv','table','flat'],

/**
 * ------------------------------------------------------------------
 * ###  Return the field metadata available in variant objects.
 * #### This is a wrapper to the [Variant Fields](http://myvariant.info/v1/fields) service.
 *
 *
 * Example calls:
 * ```javascript
 *  var mv = require('myvariantjs');
 *  mv.getfields()
 *  mv.getfields('gene')
 * ```
 *
 *
 * @name getfields
 * @param {string} [search] - optional case insensitive string to search for in available field names. Leaving this empty returns all fields.
 * @return {object} json
 * @api public
 */
  getfields(search) {
    let params = {};
    params.url = this.url + 'metadata/fields';

    // this callback is fired off when the Promise is resolved
    let cb = (resp) => {
      let keyz = Object.keys(resp.body);
      if (search && keyz.length) {
        let srch = search.toLowerCase();
        let flds = {};
        keyz.filter(k => k.indexOf(srch) >= 0).map(k => flds[k] = resp.body[k]);
        return flds;
      } else {
        return resp.body;
      }
    };

    return _get(params,cb);
  },


/**
 * ------------------------------------------------------------------
 * ###  Return the variant object for the given HGVS-based variant id.
 * #### This is a wrapper for a GET query of "/variant/{hgvsid}" service.
 *
 * Example endpoint:
 *   GET
 *   http://myvariant.info/v1/variant/chr16:g.28883241A>G
 *
 *
 * Example calls:
 * ```javascript
 *  var mv = require('myvariantjs');
 *  mv.getvariant('chr9:g.107620835G>A')
 *  mv.getvariant('chr9:g.107620835G>A', 'dbnsfp.genename')
 *  mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'])
 *  mv.getvariant('chr9:g.107620835G>A', 'all')
 *  mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'], 'csv')
 *  mv.getvariant('chr9:g.107620835G>A', null, 'tsv')
 * ```
 *
 *
 * > *Notes*
 * >> The supported field names passed to the *fields* parameter can be found from
 * >> any full variant object (without *fields*, or *fields="all"*).
 * >
 * >> Field name supports dot notation for nested data structure as well,
 * >> e.g. you can pass "dbnsfp.genename" or "cadd.phred".
 *
 *
 * @name getvariant
 * @param {string} vid - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {string} [format] - convert json to given format. Supports json, csv, tsv, table (csv), flat. Default=json. Note: non-josn are flattened, and tsv=table=flat.
 * @return {object} json
 * @api public
 * ---
 *
 */
  getvariant(vid, fields = 'all', format = 'json') {
    if (!vid) return Promise.reject("no variant id supplied");
    if (!fields || (typeof fields !== 'string' && !Array.isArray(fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  getvariant('chr9:g.107620835G>A', 'dbnsfp.genename') ");
    if (!format || !this.validFormats.includes(format)) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   mv.getvariant('chr9:g.107620835G>A', 'all', 'json') ");

    const path = 'variant/'+vid;
    let flds;
    let q = {};
    if (fields) {
      if (typeof fields === 'string') {
        q.fields = fields;
      }
      if (Array.isArray(fields)) {
        q.fields = fields.join();
      }
    }

    // make get call to the request url for the given query id, adding fields param if user supplied
    let params = {};
    params.url = this.url + path;
    params.query = q;

    // this callback is fired off when the Get Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (format !== 'json') {
            let opts = {DELIMITER: {FIELD: ",", WRAP: '"'}};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].includes(format)) opts.DELIMITER.FIELD = '\t';
            converter.json2csv(data, (err, csv) => {
              if (err) reject(err); //throw err;
              resolve(csv);
            }, opts);
          } else {
            resolve(resp.body);
          }
        });
      };

      return await convert();
    };

    return _get(params,cb);
  },


/**
 * ------------------------------------------------------------------
 * ### Make variant queries in batch for a list of HGVS name-based ids
 * ####  Return the list of variant annotation objects for the given list of hgvs-base variant ids.
 * #### This is a wrapper for POST query of "/variant" service.
 *
 * Example endpoint:
 *   POST
 *   http://myvariant.info/v1/variant/
 *    form-data: {ids="chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C",
 *                fields="dbnsfp.genename,cadd.phred"}
 *
 * Example calls:
 * ```javascript
 *  var mv = require('myvariantjs');
 *  mv.getvariants("chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C")  // string of delimited ids
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"])  // array of ids
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], "cadd.phred")
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], "dbnsfp.genename", "csv")
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], "table")
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], "tsv")
 * ```
 *
 *
 * > *Notes*
 * >> The supported field names passed to the *fields* parameter can be found from
 * >> any full variant object (without *fields*, or *fields="all"*).
 * >
 * >> Field name supports dot notation for nested data structure as well,
 * >> e.g. you can pass "dbnsfp.genename" or "cadd.phred".
 * >
 * >> output formats "table" and "tsv" are the same.
 *
 *
 * @name getvariants
 * @param {string|array} vids - string of comma delimited hgvs-formatted variant ids, eg. "chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", or array of ids, eg. ["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"],
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api
 * @param {number} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 *
 */
  getvariants(vids, fields = 'all', format = 'json') {
    const path = 'variant/';
    let params = {};
    params.url = this.url + path;
    params.query = {};

    if (!vids) return Promise.reject("no variant ids supplied");
    if (!fields || (typeof fields !== 'string' && !Array.isArray(fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  getvariant('chr9:g.107620835G>A', 'dbnsfp.genename') ");
    if (!format || !this.validFormats.includes(format)) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   mv.getvariant('chr9:g.107620835G>A', 'all', 'json') ");

    // vids = "chr1:g.876664G>A,chr1:g.69635G>C"
    if (typeof vids === "string") {
      let arrVids = vids.split(',');
      if (arrVids.length === 1) {
        // call the getvariant method for making single Get call
        return this.getvariant(arrVids[0],fields,format);
      } else {
        params.query.ids = vids;
      }
    } else if (!Array.isArray(vids)) {
      // for now, barf at objects
      return Promise.reject("error, wrong param type");
    } else if (Array.isArray(vids)) {
      params.query.ids = vids.join(',');
    }

    if (fields) {
      if (typeof fields === 'string') {
        params.query.fields = fields;
      }
      if (Array.isArray(fields)) {
        params.query.fields = fields.join();
      }
    }

    // this callback is fired off when the Post Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (format !== 'json') {
            let opts = {CHECK_SCHEMA_DIFFERENCES: false, DELIMITER: {FIELD: ",", WRAP: '"'}};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].includes(format)) opts.DELIMITER.FIELD = '\t';
            converter.json2csv(data, (err, csv) => {
              if (err) reject(err); //throw err;
              resolve(csv);
            }, opts);
          } else {
            resolve(resp.body);
          }
        });
      };

      return await convert();
    };

    return _post(params,cb);
  },


/**
 * ------------------------------------------------------------------
 * ###  Return a variant query result.
 * #### This is a wrapper for GET query of "/query?q={query}" service.
 *
 * ##### Service API [here](http://docs.myvariant.info/en/latest/doc/variant_query_service.html#query-parameters)
 *
 *
 * Example endpoints:
 *   GET http://myvariant.info/v1/query?q=chr1:69000-70000
 *   GET http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10
 *
 *
 * Example calls:
 * ```javascript
 *  var mv = require('myvariantjs');
 *  mv.query("chr1:69000-70000", "cadd.phred")
 *  mv.query("dbsnp.rsid:rs58991260", "dbsnp")
 *  mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", "dbnsfp.polyphen2.hdiv")
 * ```
 *
 *  **_note: The combination of “size” and “from” parameters can be used to get paging for large queries:_**
 * ```
 *   q=cdk*&size=50                     first 50 hits
 *   q=cdk*&size=50&from=50             the next 50 hits
 * ```
 *
 * **_Range queries_**
 * ```
 *   q=dbnsfp.polyphen2.hdiv.score:>0.99
 *   q=dbnsfp.polyphen2.hdiv.score:>=0.99
 *   q=exac.af:<0.00001
 *   q=exac.af:<=0.00001
 *
 *   q=exac.ac.ac_adj:[76640 TO 80000]        # bounded (including 76640 and 80000)
 *   q=exac.ac.ac_adj:{76640 TO 80000}        # unbounded
 * ```
 *
 * **_Wildcard queries_**
 * **_note: wildcard character “*” or ”?” is supported in either simple queries or fielded queries:_**
 * ```
 *   q=cdk*
 *   q=dbnsfp.genename:CDK?
 *   q=dbnsfp.genename:CDK*
 * ```
 *
 *
 * @name query
 * @param {string} search - case insensitive string to search.
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api
 * @param {number} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 */
  query(query, fields = 'all', size = 10000, from = 0, format = 'json') {
    // check the args
    if (!fields || (typeof fields !== 'string' && !Array.isArray(fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', 'dbnsfp.genename', null, null, null) ");
    if (!size || (typeof size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', null, 100, null, null) ");
    if (typeof from === "undefined" || (typeof from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', null, null, 5, null) ");
    if (!format || !this.validFormats.includes(format)) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', null, null, null, 'json') ");

    let flds;
    let q = {};

    // set the formatted query string
    q.q = query;
    q.size = size;

    // set the fields param
    if (fields) {
      if (typeof fields === 'string') {
        q.fields = fields;
      }
      if (Array.isArray(fields)) {
        q.fields = fields.join();
      }
    }

    // make get call to the request url for the given query id, adding fields param if user supplied
    const path = 'query';
    let params = {};
    params.url = this.url + path;
    params.query = q;

    // this callback is fired off when the Get Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (format !== 'json') {
            let opts = {DELIMITER: {FIELD: ",", WRAP: '"'}};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].includes(format)) opts.DELIMITER.FIELD = '\t';
            converter.json2csv(data, (err, csv) => {
              if (err) reject(err); //throw err;
              resolve(csv);
            }, opts);
          } else {
            resolve(resp.body);
          }
        });
      };

      return await convert();
    };

    return _get(params,cb);
  },


/**
 * ------------------------------------------------------------------
 * ###  Return the batch query result.
 * #### This is a wrapper for POST query of "/query" service.
 *
 *
 * Example calls:
 * ```javascript
 *  var mv = require('myvariantjs');
 *  mv.querymany(['rs58991260', 'rs2500'], 'dbsnp.rsid')
 *  mv.querymany(['RCV000083620', 'RCV000083611', 'RCV000083584'], 'clinvar.rcv_accession')
 *  mv.querymany(['COSM1362966', 'COSM990046', 'COSM1392449'], ['dbsnp.rsid', 'cosmic.cosmic_id'], ['dbsnp','cosmic'])
 * ```
 *
 *
 * @name querymany
 * @param {string} q - csv formatted search terms
 * @param {string|array} [scopes] - string or array of field names to scope the search to
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @api public
 * ---
 *
 */
  querymany(q, scopes=[], fields='all', format='json') {
    if (!q) return Promise.reject("no query terms supplied");
    if (!scopes || (typeof scopes !== 'string' && !Array.isArray(scopes))) return Promise.reject("no scopes fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  querymany(['rs58991260', 'rs2500'], 'dbsnp.rsid') ");
    if (!fields || (typeof fields !== 'string' && !Array.isArray(fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  querymany(['COSM1362966', 'COSM990046', 'COSM1392449'], 'cosmic.cosmic_id', 'cosmic') ");

    const path = 'query/';
    let params = {};
    params.url = this.url + path;
    params.query = {};

    if (typeof q === "string") {
      params.query.q = q;
    } else if (!Array.isArray(q)) {
      // for now, barf at objects
      return Promise.reject("error, wrong param type");
    } else if (Array.isArray(q)) {
      params.query.q = q.join(',');
    }

    if (scopes) {
      if (typeof scopes === 'string') {
        params.query.scopes = scopes;
      }
      if (Array.isArray(scopes)) {
        params.query.scopes = scopes.join();
      }
    }

    if (fields) {
      if (typeof fields === 'string') {
        params.query.fields = fields;
      }
      if (Array.isArray(fields)) {
        params.query.fields = fields.join();
      }
    }

    // this callback is fired off when the Post Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (format !== 'json') {
            let opts = {CHECK_SCHEMA_DIFFERENCES: false, DELIMITER: {FIELD: ",", WRAP: '"'}};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].includes(format)) opts.DELIMITER.FIELD = '\t';
            converter.json2csv(data, (err, csv) => {
              if (err) reject(err); //throw err;
              resolve(csv);
            }, opts);
          } else {
            resolve(resp.body);
          }
        });
      };

      return await convert();
    };

    return _post(params,cb);
  },

}
