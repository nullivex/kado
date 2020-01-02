'use strict';
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
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
const runner = require('../lib/TestRunner').getInstance('Kado')
runner.suite('Connector',(it)=> {
  const { expect } = require('../lib/Validate')
  //const stretchfs = require('stretchfs-sdk')
  //const Prism = stretchfs.Prism
  const Prism = class {
    connect(){
      return Promise.resolve('cdn.stretchfs.com')
    }
  }
  const Connector = require('../lib/Connector')
  let connector = new Connector()
  it('should construct',() => {
    expect.isType('Connector',new Connector())
  })
  it('should accept a new connector',() => {
    expect.isType('Prism',connector.addConnector(
      'stretchfs',
      new Prism('test','test','localhost')
    ))
  })
  it('should have the new connector instance',()=>{
    expect.isType('Prism',connector.stretchfs)
  })
  it('should remove connector instance',()=>{
    expect.eq(connector.removeConnector('stretchfs'),'stretchfs')
  })
  it('should no longer have the connector handle',()=>{
    expect.eq(connector.stretchfs,undefined)
  })
  it('should accept a new connector instance',()=>{
    expect.isType('Prism',connector.addConnector(
      'stretchfs',
      new Prism('test','test','localhost')
    ))
  })
  it('should attempt connect and fail',()=>{
    return connector.connect('stretchfs')
      .then((result)=>{
        expect.eq(result,'cdn.stretchfs.com')
      })
  })
})
if(require.main === module) runner.execute().then(code => process.exit(code))
