import Kolide from '../../../../kolide';
import reduxConfig from '../base/reduxConfig';
import schemas from '../base/schemas';

const { HOSTS: schema } = schemas;

export default reduxConfig({
  entityName: 'hosts',
  loadAllFunc: Kolide.getHosts,
  parseEntityFunc: (host) => {
    return { ...host, target_type: 'hosts' };
  },
  schema,
});
