'use strict';
/**
 * Kado - Module system for Enterprise Grade applications.
 * Copyright © 2015-2019 NULLIVEX LLC. All rights reserved.
 * Kado <support@kado.org>
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const K = require('../index')
const path = require('path')
const Sequelize = require('sequelize')

let config = K.config

let inst


/**
 * Create the Sequelze instance
 * @return {Sequelize}
 */
let createInst = () => {
  //configure the instance for connection
  let benchmark = config.db.sequelize.benchmark || false
  let slowQueryTime = config.db.sequelize.slowQueryTime || 10000
  let skipTable = config.db.sequelize.skipLoggingTable || []
  if(config.dev){
    benchmark = true
    slowQueryTime = 1000
  }
  let inst = new Sequelize(
    config.db.sequelize.name,
    config.db.sequelize.user,
    config.db.sequelize.password,
    {
      host: config.db.sequelize.host,
      port: config.db.sequelize.port,
      dialect: config.db.sequelize.dialect || 'mysql',
      operatorsAliases: Sequelize.Op,
      benchmark: benchmark,
      logging: (sql,time,info) => {
        //if the user setup their own function just use that
        if('function' === typeof config.db.sequelize.logging){
          config.db.sequelize.logging(sql,time)
        } else if(true === config.dev) {
          if(time instanceof Object){
            info = time
            time = 'n/a '
          }
          if(!info) info = {}
          //skip session queries
          let skip = false
          if(info.tableNames){
            info.tableNames.forEach((t)=>{
              if(-1 < skipTable.indexOf(t)) skip = true
            })
          }
          if(!info.tableNames && info.instance &&
            -1 < skipTable.indexOf(info.instance._modelOptions.name.plural)){
            skip = true
          }
          if(!info.tableNames && !info.instance && info.type === 'BULKDELETE'){
            skipTable.forEach((t)=>{
              if(-1 < sql.indexOf(t)) skip = true
            })
          }
          //dont show the test query
          if(sql === 'Executed (default): SELECT 1+1 AS result'){
            skip = true
          }
          //skip logging query if needed
          if(skip) return
          //log query
          K.log.debug('SQL Query took ' + time + 'ms: ' + sql)
        } else if(!(time instanceof Object) && slowQueryTime > time){
          K.log.warn('SLOW QUERY took ' + time + 'ms: ' + sql)
        }
      }
    }
  )
  //finally connect to the database
  inst.doConnect = function(opts){
    if(!opts) opts = {}
    if(!opts.sync) opts.sync = false
    if(!opts.syncForce) opts.syncForce = false
    let that = this
    return that.authenticate().then(() => {
      if(opts.sync) return that.sync({force: opts.syncForce})
    })
  }
  inst._loadedModels = []
  inst.doImport = (modelFile) => {
    let modelName = path.basename(modelFile)
    modelName = modelName.replace(path.extname(modelName),'')
    if(-1 < inst._loadedModels.indexOf(modelName)){
      if(process.env.DEBUG && process.env.DEBUG.match(/sequelize/i)){
        console.trace('Duplicate model load attempted on ' + modelName)
      }
      return inst.models[modelName]
    }
    inst._loadedModels.push(modelName)
    inst.import(modelFile)
    if(!inst.models[modelName]){
      throw new Error(modelName + ' not found, loading failed')
    }
    return inst.models[modelName]
  }
  inst._relate = {
    custom: (onDelete,onUpdate,opts)=>{
      let o = new K.ObjectManage({onDelete: onDelete, onUpdate: onUpdate})
      o.$load(opts)
      return o.$strip()
    },
    cascade: (opts)=>{return inst._relate.custom('CASCADE','CASCADE',opts)},
    setNull: (opts)=>{return inst._relate.custom('SET NULL','SET NULL',opts)},
    noAction: (opts)=>{return inst._relate.custom('NO ACTION','NO ACTION',opts)}
  }
  return inst
}


/**
 * Export the singleton
 * @return {Sequelize}
 */
module.exports = () => {
  if(inst) return inst
  inst = createInst()
  return inst
}
