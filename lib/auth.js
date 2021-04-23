"use strict";
var KcAdminClient = require('keycloak-admin').default
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

async function getTenants() {

  // return new Promise((resolve, reject) => {
try{
    // let doIt = async (counter) => {

    //   const kcAdminClient = new KcAdminClient(
    //     { baseUrl: defaultConfig.keycloak.basePath }
    //   );

    //   try {
    //     logger.debug('Authenticating in keycloak.', TAG);
    //     await kcAdminClient.auth(defaultConfig.keycloak.credentials);
    //     logger.debug('Listing tenants.', TAG);
    //     const realms = await kcAdminClient.realms.find();
    //     logger.info(`Tenants retrieved: ${realms.map(r => r.id)}.`, TAG);
    //     //return resolve(realms.map(r => r.id))
    //     return (realms.map(r => r.id))
    //   } catch (err) {
    //     logger.error(`Could not retrieve tenants: ${err.stack ||  err}.`, TAG);
    //     if (counter > 0) {
    //       counter--;
    //       logger.debug('Trying again in a few moments.', TAG);
    //       logger.debug(`Remaining ${counter} time(s).`, TAG);
    //       setTimeout(() => {
    //         doIt(counter);
    //       }, defaultConfig.keycloak.timeoutSleep * 1000);
    //     } else {
    //       // return reject(`keycloak admin: + ${err.stack || err}`)
    //       throw new Error(`keycloak admin: ${err.stack || err}`)
    //     }
    //   }
    // }

    //  return await doIt(defaultConfig.keycloak.connectionRetries)

    const counter = defaultConfig.keycloak.connectionRetries;
    const kcAdminClient = new KcAdminClient(
      { baseUrl: defaultConfig.keycloak.basePath }
    );
    try {
      logger.debug('Authenticating in keycloak.', TAG);
      await kcAdminClient.auth(defaultConfig.keycloak.credentials);
      logger.debug('Listing tenants.', TAG);
      const realms = await kcAdminClient.realms.find();
      logger.info(`Tenants retrieved: ${realms.map(r => r.id)}.`, TAG);
      //return resolve(realms.map(r => r.id))
      return (realms.map(r => r.id))
    } catch (err) {
      logger.error(`Could not retrieve tenants: ${err.stack ||  err}.`, TAG);
      if (counter > 0) {
        counter--;
        logger.debug('Trying again in a few moments.', TAG);
        logger.debug(`Remaining ${counter} time(s).`, TAG);
        setTimeout(() => {
          doIt(counter);
        }, defaultConfig.keycloak.timeoutSleep * 1000);
      } else {
        // return reject(`keycloak admin: + ${err.stack || err}`)
        throw new Error(`keycloak admin: ${err.stack || err}`)
      }
    }
  }catch(e){
    logger.debug(`Error:${err.stack || err}`, TAG);
    throw e;
   }
  // });
}

module.exports = { getManagementToken, getTenants };
