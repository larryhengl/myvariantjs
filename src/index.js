import superagent from 'superagent';
import flat from 'flat';
import jsonexport from 'jsonexport';

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
 *  mv.getvariant('chr9:g.107620835G>A', ['dbnsfp.genename', 'cadd.phred'], null, 0, 'csv')
 *  mv.getvariant('chr9:g.107620835G>A', null, null, null, 'tsv')
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
 * API Note: optional params are pased in via named options object
 * @name getvariant
 * @param {string} vid - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api
 * @param {number} [from] - when paging use `from` as the row offset
 * @param {number} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object} json
 * @api public
 * ---
 *
 */
  getvariant(vid, options) {
    if (options && typeof options !== 'object') return Promise.reject("options ,ust be passed in via the options object");
    let opts = Object.assign({
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    // check args
    if (!vid) return Promise.reject("no variant id supplied");
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");


    const path = 'variant/'+vid;
    let flds;
    let q = {};
    if (opts.fields) {
      if (typeof opts.fields === 'string') {
        q.fields = opts.fields;
      }
      if (Array.isArray(opts.fields)) {
        q.fields = opts.fields.join();
      }
    }

    q.size = opts.size;
    q.from = opts.from;

    // make get call to the request url for the given query id, adding fields param if user supplied
    let params = {};
    params.url = this.url + path;
    params.query = q;

    // this callback is fired off when the Get Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (opts.format !== 'json') {
            let options = {};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].indexOf(opts.format)>-1) options.rowDelimiter = '\t';

            jsonexport(data, options, (err, csv) => {
                if(err) return console.log(err);
                resolve(csv);
            });

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
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], "dbnsfp.genename", null, null, "csv")
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], 5000, null, "table")
 *  mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], ["dbnsfp.genename", "cadd.phred"], 10000, 0, "tsv")
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
 * API Note: optional params are pased in via named options object
 * @name getvariants
 * @param {string|array} vids - string of comma delimited hgvs-formatted variant ids, eg. "chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", or array of ids, eg. ["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"],
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api. Default = 10000.
 * @param {number} [from] - when paging use `from` as the row offset. Default = 0.
 * @param {number} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 *
 */
  getvariants(vids, options) {
    if (options && typeof options !== 'object') return Promise.reject("options must be passed in via the options object");
    let opts = Object.assign({
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    const path = 'variant/';
    let params = {};
    params.url = this.url + path;
    params.query = {};

    // check the args
    if (!vids) return Promise.reject("no variant ids supplied");
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");

    if (typeof vids === "string") {
      let arrVids = vids.split(',');
      if (arrVids.length === 1) {
        // call the getvariant method for making single Get call
        return this.getvariant(arrVids[0],opts);
      } else {
        params.query.ids = vids;
      }
    } else if (!Array.isArray(vids)) {
      // for now, barf at objects
      return Promise.reject("error, wrong param type");
    } else if (Array.isArray(vids)) {
      params.query.ids = vids.join(',');
    }

    if (opts.fields) {
      if (typeof opts.fields === 'string') {
        params.query.fields = opts.fields;
      }
      if (Array.isArray(opts.fields)) {
        params.query.fields = opts.fields.join();
      }
    }

    // size & from not part of getvariants service api. left here for consistency. sorta.
    //params.query.size = opts.size;
    //params.query.from = opts.from;

    // this callback is fired off when the Post Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (opts.format !== 'json') {
            let opters = {};
            let data = !Array.isArray(resp.body) ? [resp.body] : resp.body;
            if (['tsv','table','flat'].indexOf(opts.format)>-1) opters.rowDelimiter = '\t';

            jsonexport(data, opters, (err, csv) => {
                if(err) return console.log(err);
                resolve(csv);
            });

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
 *  var mv = require('./public/index');
 *  mv.query("chr1:69000-70000", "cadd.phred")
 *  mv.query("dbsnp.rsid:rs58991260", "dbsnp")
 *  mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", "dbnsfp.polyphen2.hdiv")
 *  mv.query("snpeff.ann.gene_name:naglu", ["snpeff.ann.gene_name","dbnsfp"], 10, null, "csv")
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
 * API Note: optional params are pased in via named options object
 * @name query
 * @param {string} search - case insensitive string to search.
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api
 * @param {number} [from] - when paging use `from` as the row offset
 * @param {string} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 */
  query(query, options) {
    if (options && typeof options !== 'object') return Promise.reject("options ,ust be passed in via the options object");
    let opts = Object.assign({
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    // check the args
    if (!query) return Promise.reject("no query terms supplied");
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");

    let flds;
    let q = {};

    // set the formatted query string
    q.q = query;

    // set the fields param
    if (fields) {
      if (typeof fields === 'string') {
        q.fields = fields;
      }
      if (Array.isArray(fields)) {
        q.fields = fields.join();
      }
    }

    q.size = isize;
    q.from = ifrom;

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
            let opts = {};
            let data = !Array.isArray(resp.body.hits) ? [resp.body.hits] : resp.body.hits;
            if (['tsv','table','flat'].indexOf(format)>-1) opts.rowDelimiter = '\t';

            jsonexport(data, opts, function(err, csv){
                if(err) return console.log(err);
                resolve(csv);
            });

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
 * API Note: optional params are pased in via named options object
 * @name querymany
 * @param {string} q - csv formatted search terms
 * @param {string|array} [scopes] - string or array of field names to scope the search to
 * @param {string|array} [fields] - fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 * @param {number} [size] - boost the response size from the default 1000 given by the service api
 * @param {number} [from] - when paging use `from` as the row offset
 * @param {string} [format] - output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 *
 */
  querymany(q, options) {
    if (options && typeof options !== 'object') return Promise.reject("options ,ust be passed in via the options object");
    let opts = Object.assign({
      scopes: [],
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    // check the args
    if (!q) return Promise.reject("no query terms supplied");
    if (!opts.scopes || (typeof opts.scopes !== 'string' && !Array.isArray(opts.scopes))) return Promise.reject("no scopes fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  querymany(['rs58991260', 'rs2500'], {scopes:'dbsnp.rsid'}) ");
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");

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

    if (opts.scopes) {
      if (typeof opts.scopes === 'string') {
        params.query.scopes = opts.scopes;
      }
      if (Array.isArray(opts.scopes)) {
        params.query.scopes = opts.scopes.join();
      }
    }

    if (opts.fields) {
      if (typeof opts.fields === 'string') {
        params.query.fields = opts.fields;
      }
      if (Array.isArray(opts.fields)) {
        params.query.fields = opts.fields.join();
      }
    }

    params.query.size = opts.size;
    params.query.from = opts.from;

    // this callback is fired off when the Post Promise is resolved
    async function cb(resp) {
      const convert = () => {
        return new Promise((resolve,reject) => {
          // check for format type. if != json (the default) then convert accordingly
          if (format !== 'json') {
            let options = {};
            let data = !Array.isArray(resp.body.hits) ? [resp.body.hits] : resp.body.hits;
            if (['tsv','table','flat'].indexOf(opts.format)>-1) options.rowDelimiter = '\t';

            jsonexport(data, options, function(err, csv){
                if(err) return console.log(err);
                resolve(csv);
            });

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
