'use strict'
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
const Assert = require('../lib/Assert')
const Application = require('../lib/Application')
const app = new Application()
class Module {
  constructor () {
    this.name = 'foo'
  }
}
runner.suite('Application', (it) => {
  it('should instantiate', () => {
    Assert.isType('Application', new Application())
  })
  it('should set the name', () => {
    Assert.eq(app.setName('foo').name, 'foo')
  })
  it('should set the version', () => {
    Assert.eq(app.setVersion('1.2.3').version, '1.2.3')
  })
  it('should set the config', () => {
    Assert.eq(app.setConfig({ name: 'bar' }).config.get('name'), 'bar')
  })
  it('should add a module', () => {
    Assert.isType('Application', app.addModule(new Module()))
  })
  it('should get a module', () => {
    Assert.isType('Module', app.getModule('foo'))
  })
  it('should remove a module', () => {
    Assert.isType('Module', app.removeModule('foo'))
  })
  it('should load a library', () => {
    app.library.addPath(`${__dirname}/../lib`)
    const Asset = app.lib('Asset')
    Assert.isType('Asset', new Asset())
  })
  it('should start', async () => {
    const rv = await app.start()
    Assert.isType('undefined', rv)
    Assert.isType('string', app.INTERFACE_ROOT)
    Assert.isType('Asset', app.asset)
    Assert.isType('Cron', app.cron)
    Assert.isType('History', app.history)
    Assert.isType('Permission', app.permission)
    Assert.isType('Router', app.router)
    Assert.isType('Util', app.util)
  })
  it('should listen', async () => {
    const rv = await app.listen()
    Assert.isType('undefined', rv)
  })
  it('should stop', async () => {
    const rv = await app.stop()
    Assert.isType('undefined', rv)
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
