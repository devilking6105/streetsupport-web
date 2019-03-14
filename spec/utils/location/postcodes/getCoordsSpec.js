/* global describe, beforeEach, afterEach, it, expect */

import sinon from 'sinon'

const { getCoords } = require('../../../../src/js/location/postcodes')
const ajax = require('../../../../src/js/get-api-data')
const storage = require('../../../../src/js/storage')

const postcodeData = {
  'result': {
    'postcode': '08005',
    'longitude': -74.22289999999998,
    'latitude': 39.7532
  }
}

const outcodeData = {
  'result': {
    'outcode': '08757',
    'longitude': -74.19799999999998,
    'latitude': 39.9537
  }
}

describe('postcodes - get coords', () => {
  let ajaxGetStub,
    successParameter,
    storageSetStub

  const success = (result) => {
    successParameter = result
  }
  const failure = () => {}

  beforeEach(() => {
    successParameter = null
    ajaxGetStub = sinon.stub(ajax, 'data')
    storageSetStub = sinon.stub(storage, 'set')
  })

  afterEach(() => {
    ajax.data.restore()
    storage.set.restore()
  })

  describe('- full postcode', () => {
    beforeEach(() => {
      ajaxGetStub.returns({
        then: function (success) {
          success({
            status: 'ok',
            data: postcodeData
          })
        }
      })
      sinon.stub(storage, 'get').returns(null) // no cached info

      getCoords(postcodeData.result.postcode, success, failure)
    })

    afterEach(() => {
      storage.get.restore()
    })

    it('- should call postcodes api', () => {
      const url = ajaxGetStub.getCalls()[0].args[0]
      expect(url).toEqual(`https://api.postcodes.io/postcodes/${postcodeData.result.postcode}`)
    })

    it('- should save associated postcode data against cleaned postcode key', () => {
      const postcodeKey = storageSetStub.getCalls()[0].args[0]
      expect(postcodeKey).toEqual('M12HX')
    })

    it('- should save associated postcode data fields', () => {
      const postcodeDataSaved = storageSetStub.getCalls()[0].args[1]
      expect(postcodeDataSaved).toEqual(postcodeData.result)
    })

    it('- should call success callback with result', () => {
      expect(successParameter).toEqual(postcodeData.result)
    })
  })

  describe('- partial postcode (outcode)', () => {
    beforeEach(() => {
      ajaxGetStub.returns({
        then: function (success) {
          success({
            status: 'ok',
            data: outcodeData
          })
        }
      })
      sinon.stub(storage, 'get').returns(null) // no cached info
      getCoords(outcodeData.result.outcode, success, failure)
    })

    afterEach(() => {
      storage.get.restore()
    })

    it('- should call outcodes api', () => {
      const url = ajaxGetStub.getCalls()[0].args[0]
      expect(url).toEqual(`https://api.postcodes.io/outcodes/${outcodeData.result.outcode}`)
    })

    it('- should save associated postcode data against cleaned postcode key', () => {
      const postcodeKey = storageSetStub.getCalls()[0].args[0]
      expect(postcodeKey).toEqual(outcodeData.result.outcode)
    })

    it('- should save associated postcode data fields', () => {
      const postcodeDataSaved = storageSetStub.getCalls()[0].args[1]
      expect(postcodeDataSaved.postcode).toEqual(outcodeData.result.outcode)
      expect(postcodeDataSaved.latitude).toEqual(outcodeData.result.latitude)
      expect(postcodeDataSaved.longitude).toEqual(outcodeData.result.longitude)
    })

    it('- should call success callback with result', () => {
      expect(successParameter.postcode).toEqual(outcodeData.result.outcode)
      expect(successParameter.latitude).toEqual(outcodeData.result.latitude)
      expect(successParameter.longitude).toEqual(outcodeData.result.longitude)
    })
  })
})
