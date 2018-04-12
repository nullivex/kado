'use strict';
const K = require('../index')
const Sequelize = require('sequelize')

let config = K.config

let inst


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
let createInst = function(){
  //configure the instance for connection
  let inst = new Sequelize(
    config.db.sequelize.name,
    config.db.sequelize.user,
    config.db.sequelize.password,
    {
      host: config.db.sequelize.host,
      port: config.db.sequelize.port,
      dialect: config.db.sequelize.dialect || 'mysql',
      operatorsAliases: Sequelize.Op,
      logging: config.db.sequelize.logging || false
    }
  )
  //finally connect to the database
  inst.doConnect = function(){
    let that = this
    return that.authenticate().then(function(){return that.sync()})
  }
  return inst
}


/**
 * Export the singleton
 * @return {Sequelize}
 */
module.exports = function(){
  if(inst) return inst
  inst = createInst()
  return inst
}