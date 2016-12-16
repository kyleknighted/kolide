import { PropTypes } from 'react';

export default PropTypes.shape({
  id: PropTypes.number.isRequired,
  interval: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  pack_id: PropTypes.number.isRequired,
  platform: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  query_id: PropTypes.number.isRequired,
  removed: PropTypes.bool.isRequired,
  snapshot: PropTypes.bool.isRequired,
});

