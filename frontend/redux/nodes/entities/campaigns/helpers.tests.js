import expect from 'expect';

import helpers from './helpers';

const host = {
  hostname: 'jmeller-mbp.local',
  id: 1,
};
const campaign = {
  id: 4,
  query_id: 12,
  status: 0,
  user_id: 1,
};
const campaignWithResults = {
  ...campaign,
  hosts: [{ id: 2, hostname: 'some-machine' }],
  query_results: [
    { host: 'some-machine', feature: 'vendor', value: 'GenuineIntel' },
  ],
  totals: {
    count: 3,
    online: 2,
  },
};
const { destroyFunc, updateFunc } = helpers;
const resultSocketData = {
  type: 'result',
  data: {
    distributed_query_execution_id: 5,
    host,
    rows: [
      { feature: 'product_name', value: 'Intel Core' },
      { feature: 'family', value: '0600' },
    ],
  },
};
const totalsSocketData = {
  type: 'totals',
  data: {
    count: 5,
    online: 1,
  },
};

describe('campaign entity - helpers', () => {
  describe('#destroyFunc', () => {
    it('returns the campaign', (done) => {
      destroyFunc(campaign)
        .then((response) => {
          expect(response).toEqual(campaign);
          done();
        })
        .catch(done);
    });
  });

  describe('#updateFunc', () => {
    it('appends query results to the campaign when the campaign has query results', (done) => {
      updateFunc(campaignWithResults, resultSocketData)
        .then((response) => {
          expect(response.query_results).toEqual([
            ...campaignWithResults.query_results,
            { hostname: host.hostname, feature: 'product_name', value: 'Intel Core' },
            { hostname: host.hostname, feature: 'family', value: '0600' },
          ]);
          expect(response.hosts).toInclude(host);
          done();
        })
        .catch(done);
    });

    it('adds query results to the campaign when the campaign does not have query results', (done) => {
      updateFunc(campaign, resultSocketData)
        .then((response) => {
          expect(response.query_results).toEqual([
            { hostname: host.hostname, feature: 'product_name', value: 'Intel Core' },
            { hostname: host.hostname, feature: 'family', value: '0600' },
          ]);
          expect(response.hosts).toInclude(host);
          done();
        })
        .catch(done);
    });

    it('updates totals on the campaign when the campaign has totals', (done) => {
      updateFunc(campaignWithResults, totalsSocketData)
        .then((response) => {
          expect(response.totals).toEqual(totalsSocketData.data);
          done();
        })
        .catch(done);
    });

    it('adds totals to the campaign when the campaign does not have totals', (done) => {
      updateFunc(campaign, totalsSocketData)
        .then((response) => {
          expect(response.totals).toEqual(totalsSocketData.data);
          done();
        })
        .catch(done);
    });
  });
});
