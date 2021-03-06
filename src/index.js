require("babel-polyfill");
import superagent from 'superagent';
import flat from 'flat';
import jsonexport from 'jsonexport';

/**
 * ------------------------------------------------------------------
 * ### Private fn to make the GET call. See the source.
 *
 *```
 * // this callback is fired off when the Promise is resolved
 * let cb = (resp) => {
 *     return resp.body;
 * };
 *
 * _get(params,cb);
 *```
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
 * ### Private fn to make the POST call. See the source.
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
 * ###  Passthru query specifiying input and output from a UI, passing in a fully valid service GET url.
 *
 *
 * Example calls:
 * ```javascript
 * var mv = require('myvariantjs');
 * mv.passthru('http://myvariant.info/v1/variant/chr17:g.40690453T>G?fields=cadd')
 * ```
 *
 *
 * @name passthru
 * @param {string} url - fully valid url for a GET service call.
 * @return {object} json
 * @api public
 */
  passthru(url) {
    if (!url || url.indexOf(this.url) === -1) return "invalid url";

    let params = {};
    params.url = url;

    // this callback is fired off when the Promise is resolved
    let cb = (resp) => {
        return resp.body;
    };

    return _get(params,cb);
  },


/**
 * ------------------------------------------------------------------
 * ###  Return the field metadata available in variant objects.
 * #### This is a wrapper to the [Variant Fields](http://myvariant.info/v1/fields) service.
 *
 *
 * Example calls:
 * ```javascript
 * var mv = require('myvariantjs');
 * mv.getfields()
 * mv.getfields('gene')
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
 * * GET [http://myvariant.info/v1/variant/chr16:g.28883241A>G](http://myvariant.info/v1/variant/chr16:g.28883241A>G)
 *
 *
 * Example calls:
 * ```javascript
 * var mv = require('myvariantjs');
 * mv.getvariant('chr9:g.107620835G>A')
 * mv.getvariant('chr9:g.107620835G>A', {fields:'dbnsfp.genename'})
 * mv.getvariant('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd.phred']})
 * mv.getvariant('chr9:g.107620835G>A', {fields:'all'})
 * mv.getvariant('chr9:g.107620835G>A', {fields:['dbnsfp.genename', 'cadd.phred'], from: 0, format:'csv'})
 * mv.getvariant('chr9:g.107620835G>A', {format:'tsv'})
 * ```
 *
 * > *Notes:*
 * > * The supported field names passed to the *fields* parameter can be found from any full variant object (without *fields*, or *fields="all"*).
 * > * Field name supports dot notation for nested data structure as well, e.g. you can pass "dbnsfp.genename" or "cadd.phred".
 * > * output formats "table" and "tsv" are the same.
 * > * _API Note: optional params are pased in via named options object_
 *
 * @name getvariant
 * @param {string} vid - variantid; hgvs-formatted variant id, e.g. chr9:g.107620835G>A
 * @param {object} [options] - optional params are pased in via named options object:
 *
 *  * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 *  * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 *  * [from] - {number} when paging use `from` as the row offset. Default = 0.
 *  * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
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
 * * POST [http://myvariant.info/v1/variant/](http://myvariant.info/v1/variant/)
 *   * form-data: {ids="chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", fields="dbnsfp.genename,cadd.phred"}
 *
 * Example calls:
 * ```javascript
 * var mv = require('myvariantjs');
 * mv.getvariants("chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C")  // string of delimited ids
 * mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"])  // array of ids
 * mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:'cadd.phred'})
 * mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:'dbnsfp.genename', format:'csv'})
 * mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:['dbnsfp.genename', 'cadd.phred'], size: 5000, format:'table'})
 * mv.getvariants(["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"], {fields:['dbnsfp.genename', 'cadd.phred'], size: 10000, from: 0, format:'tsv'})
 * ```
 *
 *
 * > *Notes:*
 * > * The supported field names passed to the *fields* parameter can be found from any full variant object (without *fields*, or *fields="all"*).
 * > * Field name supports dot notation for nested data structure as well, e.g. you can pass "dbnsfp.genename" or "cadd.phred".
 * > * output formats "table" and "tsv" are the same.
 * > * _API Note: optional params are pased in via named options object_
 *
 *
 * @name getvariants
 * @param {string|array} vids - string of comma delimited hgvs-formatted variant ids, eg. "chr1:g.866422C>T,chr1:g.876664G>A,chr1:g.69635G>C", or array of ids, eg. ["chr1:g.866422C>T", "chr1:g.876664G>A","chr1:g.69635G>C"],
 * @param {object} [options] - optional params are pased in via named options object:
 *
 *  * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 *  * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 *  * [from] - {number} when paging use `from` as the row offset. Default = 0.
 *  * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".
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
 * <br>
 * Example endpoints:
 *  * GET [http://myvariant.info/v1/query?q=chr1:69000-70000](http://myvariant.info/v1/query?q=chr1:69000-70000)
 *  * GET [http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10](http://myvariant.info/v1/query?q=snpeff.ann.hgvs_p:p.Ala681Val AND snpeff.ann.gene_name:NAGLU&size=10)
 *
 *
 * Example calls:
 * ```javascript
 * var mv = require('myvariantjs');
 * // var mv = require('./public/index');
 * mv.query("chr1:69000-70000", {fields:'dbnsfp.genename'})
 * mv.query("dbsnp.rsid:rs58991260", {fields:'dbnsfp'})
 * mv.query("snpeff.ann.gene_name:cdk2 AND dbnsfp.polyphen2.hdiv.pred:D", , {fields:'dbnsfp.polyphen2.hdiv'})
 * mv.query("snpeff.ann.gene_name:naglu", {fields:["snpeff.ann.gene_name","dbnsfp"], size:10, format:"csv"})
 * ```
 *
 * Paging
 * ```
 * q=cdk*&size=50                     first 50 hits
 * q=cdk*&size=50&from=50             the next 50 hits
 * ```
 *
 * Range queries
 * ```
 * q=dbnsfp.polyphen2.hdiv.score:>0.99
 * q=dbnsfp.polyphen2.hdiv.score:>=0.99
 * q=exac.af:<0.00001
 * q=exac.af:<=0.00001
 *
 * q=exac.ac.ac_adj:[76640 TO 80000]        # bounded (including 76640 and 80000)
 * q=exac.ac.ac_adj:{76640 TO 80000}        # unbounded
 * ```
 *
 * Wildcard queries
 * ```
 * q=cdk*
 * q=dbnsfp.genename:CDK?
 * q=dbnsfp.genename:CDK*
 * ```
 *
 * > *Notes:*
 * > * The combination of “size” and “from” parameters can be used to get paging for large queries.
 * > * Wildcard characters “*” and ”?” are supported in either simple queries or fielded queries.
 * > * _API Note: optional params are pased in via named options object_
 *
 * @name query
 * @param {string} query - case insensitive string to search.
 * @param {object} [options] - optional params are pased in via named options object:
 *
 *  * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 *  * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 *  * [from] - {number} when paging use `from` as the row offset. Default = 0.
 *  * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 *
 */
  query(query, options) {
    if (!query) return Promise.reject("no query terms supplied");
    if (typeof query !== 'string') return Promise.reject("query terms should be string formatted");
    if (options && typeof options !== 'object') return Promise.reject("options must be passed in via the options object");
    let opts = Object.assign({
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    // check the opts args
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");

    let flds;
    let q = {};

    // set the formatted query string
    q.q = query;

    // set the fields param
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
    const path = 'query';
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
 * var mv = require('myvariantjs');
 * mv.querymany('chr1:g.218631822G>A, chr11:g.66397320A>G'])
 * mv.querymany(['RCV000083620', 'RCV000083611', 'RCV000083584'], {scopes:'clinvar.rcv_accession'})
 * mv.querymany(['COSM1362966', 'COSM990046', 'COSM1392449'], {scopes:['dbsnp.rsid', 'cosmic.cosmic_id'], fields:['dbsnp','cosmic']})
 * ```
 *
 * > *Notes:*
 * > * _API Note: optional params are pased in via named options object_
 *
 * @name querymany
 * @param {string} query - csv formatted search terms.
 * @param {object} [options] - optional params are pased in via named options object:
 *
 *  * [scopes] - {string|array} string or array of field names to scope the search to
 *  * [fields] - {string|array} fields to return, a list or a comma-separated string. If not provided or *fields="all"*, all available fields are returned. See [here](http://docs.myvariant.info/en/latest/doc/data.html#available-fields) for all available fields.
 *  * [size] - {number} boost the response size from the default 1000 given by the service api. Default = 10000.
 *  * [from] - {number} when paging use `from` as the row offset. Default = 0.
 *  * [format] - {string} output formats: "json", "csv", "tsv", "table".  Default = "json".
 * @return {object|string} json or string
 * @api public
 * ---
 *
 */
  querymany(query, options) {
    if (!query) return Promise.reject("no query terms supplied");
    if (options && typeof options !== 'object') return Promise.reject("options must be passed in via the options object");
    let opts = Object.assign({
      scopes: [],
      fields:'all',
      size: 10000,
      from: 0,
      format: 'json'
    }, options);

    // check the opts args
    if (!opts.scopes || (typeof opts.scopes !== 'string' && !Array.isArray(opts.scopes))) return Promise.reject("no scopes fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  querymany(['rs58991260', 'rs2500'], {scopes:'dbsnp.rsid'}) ");
    if (!opts.fields || (typeof opts.fields !== 'string' && !Array.isArray(opts.fields))) return Promise.reject("no fields supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {fields:'dbnsfp.genename'}) ");
    if (!opts.size || (typeof opts.size !== 'number')) return Promise.reject("no size parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {size: 100}) ");
    if (typeof opts.from === "undefined" || (typeof opts.from !== 'number')) return Promise.reject("no `from` parameter supplied or defined by default. likely due to incorrect parameter value. try a signature like:  query('chr1:69000-70000', {from: 5}) ");
    if (!opts.format || ['json','csv','tsv','table','flat'].indexOf(opts.format) === -1) return Promise.reject("no format supplied or defined by default. likely due to incorrect parameter value. try a signature like:   query('chr1:69000-70000', {format: 'json'}) ");

    const path = 'query/';
    let params = {};
    params.url = this.url + path;
    params.query = {};

    if (typeof query === "string") {
      params.query.q = query;
    } else if (!Array.isArray(query)) {
      // for now, barf at objects
      return Promise.reject("error, wrong param type");
    } else if (Array.isArray(query)) {
      params.query.q = query.join(',');
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
