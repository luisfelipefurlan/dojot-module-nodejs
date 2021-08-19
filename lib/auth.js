"use strict";
var axios = require("axios");
var defaultConfig = require("./config");
var logger = require("@dojot/dojot-module-logger").logger;

const TAG = { filename: "auth" };


/**
 * Generates a dummy token
 * @param {string} tenant Tenant to be used when creating the token
 */
function getManagementToken(tenant, config = defaultConfig) {
  const payload = {
    service: tenant,
    username: config.dojot.management.user
  };
  return (
    new Buffer("jwt schema").toString("base64") +
    "." +
    new Buffer(JSON.stringify(payload)).toString("base64") +
    "." +
    new Buffer("dummy signature").toString("base64")
  );
}

function getTenants(auth, config = defaultConfig) {
  const url = `${auth}/admin/tenants`;
  return new Promise((resolve, reject) => {
    let doIt = (counter) => {
      axios({
        url,
        method: "get",
        headers: {
          authorization: `Bearer ${getManagementToken(config.dojot.management.tenant)}`,
        }
      }).then((response) => {
        if ((typeof(response.data) !== "object") || !("tenants" in response.data)) {
          logger.error(`Auth returned something invalid: ${response.data}`, TAG);
          logger.error(`There's nothing Data Broker can do about it.`, TAG);
          reject(`Invalid message from Auth: ${response.data}`);
        }
        logger.info(`Tenants retrieved: ${response.data.tenants}.`, TAG);
        resolve(response.data.tenants);
      }).catch((error) => {
        logger.error(`Could not initialize tenancy consumer: ${error}.`, TAG);
        logger.debug(`Trying again in a few moments.`, TAG);
        counter--;
        logger.debug(`Remaining ${counter} time(s).`, TAG);
        if (counter > 0) {
          setTimeout(() => {
            doIt(counter);
          }, config.auth.timeoutSleep * 1000);
        } else {
          reject(`Could not reach Auth.`, TAG);
        }
      });
    };
    doIt(config.auth.connectionRetries);
  });
}

module.exports = { getManagementToken, getTenants };
