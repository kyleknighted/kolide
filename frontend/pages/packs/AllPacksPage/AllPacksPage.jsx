import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { filter, find, get, includes, isEqual, noop, pull } from 'lodash';
import { push } from 'react-router-redux';

import Button from 'components/buttons/Button';
import entityGetter from 'redux/utilities/entityGetter';
import Icon from 'components/icons/Icon';
import InputField from 'components/forms/fields/InputField';
import NumberPill from 'components/NumberPill';
import packActions from 'redux/nodes/entities/packs/actions';
import PackDetailsSidePanel from 'components/side_panels/PackDetailsSidePanel';
import PackInfoSidePanel from 'components/side_panels/PackInfoSidePanel';
import packInterface from 'interfaces/pack';
import PacksList from 'components/packs/PacksList';
import paths from 'router/paths';
import { renderFlash } from 'redux/nodes/notifications/actions';
import scheduledQueryActions from 'redux/nodes/entities/scheduled_queries/actions';
import scheduledQueryInterface from 'interfaces/scheduled_query';

const baseClass = 'all-packs-page';

export class AllPacksPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    packs: PropTypes.arrayOf(packInterface),
    selectedPack: packInterface,
    selectedScheduledQueries: PropTypes.arrayOf(scheduledQueryInterface),
  }

  static defaultProps = {
    dispatch: noop,
  };

  constructor (props) {
    super(props);

    this.state = {
      allPacksChecked: false,
      checkedPackIDs: [],
      packFilter: '',
    };
  }

  componentWillMount() {
    const { dispatch, selectedPack } = this.props;

    dispatch(packActions.loadAll());

    if (selectedPack) {
      this.getScheduledQueriesForPack(selectedPack);
    }

    return false;
  }

  componentWillReceiveProps ({ selectedPack }) {
    if (!isEqual(this.props.selectedPack, selectedPack)) {
      this.getScheduledQueriesForPack(selectedPack);
    }

    return false;
  }

  onBulkAction = (actionType) => {
    return (evt) => {
      evt.preventDefault();

      const { checkedPackIDs } = this.state;
      const { dispatch, packs } = this.props;
      const { destroy, update } = packActions;

      const promises = checkedPackIDs.map((packID) => {
        const pack = find(packs, { id: packID });
        const disabled = actionType === 'disable';

        if (actionType === 'delete') {
          return dispatch(destroy(pack));
        }

        return dispatch(update(pack, { disabled }));
      });

      return Promise.all(promises)
        .then(() => {
          if (actionType === 'delete') {
            dispatch(renderFlash('success', 'Packs successfully deleted.'));
          }

          return false;
        })
        .catch(() => dispatch(renderFlash('error', 'Something went wrong.')));
    };
  }

  onCheckAllPacks = (shouldCheck) => {
    if (shouldCheck) {
      const packs = this.getPacks();
      const checkedPackIDs = packs.map(pack => pack.id);

      this.setState({ allPacksChecked: true, checkedPackIDs });

      return false;
    }

    this.setState({ allPacksChecked: false, checkedPackIDs: [] });

    return false;
  }

  onCheckPack = (checked, id) => {
    const { checkedPackIDs } = this.state;
    const newCheckedPackIDs = checked ? checkedPackIDs.concat(id) : pull(checkedPackIDs, id);

    this.setState({ allPacksChecked: false, checkedPackIDs: newCheckedPackIDs });

    return false;
  }

  onFilterPacks = (packFilter) => {
    this.setState({ packFilter });

    return false;
  }

  onSelectPack = (selectedPack) => {
    const { dispatch } = this.props;
    const locationObject = {
      pathname: '/packs/manage',
      query: { selectedPack: selectedPack.id },
    };

    dispatch(push(locationObject));

    return false;
  }

  onUpdateSelectedPack = (pack, updatedAttrs) => {
    const { dispatch } = this.props;
    const { update } = packActions;

    return dispatch(update(pack, updatedAttrs));
  }

  getPacks = () => {
    const { packFilter } = this.state;
    const { packs } = this.props;

    if (!packFilter) {
      return packs;
    }

    const lowerPackFilter = packFilter.toLowerCase();

    return filter(packs, (pack) => {
      if (!pack.name) {
        return false;
      }

      const lowerPackName = pack.name.toLowerCase();

      return includes(lowerPackName, lowerPackFilter);
    });
  }

  getScheduledQueriesForPack = (pack) => {
    const { dispatch } = this.props;
    const { loadAll } = scheduledQueryActions;

    if (!pack) {
      return false;
    }

    dispatch(loadAll(pack));

    return false;
  }

  goToNewPackPage = () => {
    const { dispatch } = this.props;
    const { NEW_PACK } = paths;

    dispatch(push(NEW_PACK));

    return false;
  }

  renderCTAs = () => {
    const { goToNewPackPage, onBulkAction } = this;
    const btnClass = `${baseClass}__bulk-action-btn`;
    const checkedPackCount = this.state.checkedPackIDs.length;

    if (checkedPackCount) {
      const packText = checkedPackCount === 1 ? 'Pack' : 'Packs';

      return (
        <div>
          <p className={`${baseClass}__pack-count`}>{checkedPackCount} {packText} Selected</p>
          <Button
            className={`${btnClass} ${btnClass}--disable`}
            onClick={onBulkAction('disable')}
            variant="unstyled"
          >
            <Icon name="offline" /> Disable
          </Button>
          <Button
            className={`${btnClass} ${btnClass}--enable`}
            onClick={onBulkAction('enable')}
            variant="unstyled"
          >
            <Icon name="success-check" /> Enable
          </Button>
          <Button
            className={`${btnClass} ${btnClass}--delete`}
            onClick={onBulkAction('delete')}
            variant="unstyled"
          >
            <Icon name="delete-cloud" /> Delete
          </Button>
        </div>
      );
    }

    return (
      <Button variant="brand" onClick={goToNewPackPage}>CREATE NEW PACK</Button>
    );
  }

  renderSidePanel = () => {
    const { onUpdateSelectedPack } = this;
    const { selectedPack, selectedScheduledQueries } = this.props;

    if (!selectedPack) {
      return <PackInfoSidePanel />;
    }

    return (
      <PackDetailsSidePanel
        onUpdateSelectedPack={onUpdateSelectedPack}
        pack={selectedPack}
        scheduledQueries={selectedScheduledQueries}
      />
    );
  }

  render () {
    const { allPacksChecked, checkedPackIDs, packFilter } = this.state;
    const {
      getPacks,
      onCheckAllPacks,
      onCheckPack,
      onSelectPack,
      onFilterPacks,
      renderCTAs,
      renderSidePanel,
    } = this;
    const { selectedPack } = this.props;
    const packs = getPacks();
    const packsCount = packs.length;

    return (
      <div className={`${baseClass} has-sidebar`}>
        <div className={`${baseClass}__wrapper body-wrap`}>
          <h1 className={`${baseClass}__title`}>
            <NumberPill number={packsCount} /> Query Packs
          </h1>
          <div className={`${baseClass}__search-create-section`}>
            <InputField
              name="pack-filter"
              onChange={onFilterPacks}
              placeholder="Search Packs"
              value={packFilter}
            />
            {renderCTAs()}
          </div>
          <PacksList
            allPacksChecked={allPacksChecked}
            checkedPackIDs={checkedPackIDs}
            className={`${baseClass}__table`}
            onCheckAllPacks={onCheckAllPacks}
            onCheckPack={onCheckPack}
            onSelectPack={onSelectPack}
            packs={packs}
            selectedPack={selectedPack}
          />
        </div>
        {renderSidePanel()}
      </div>
    );
  }
}

const mapStateToProps = (state, { location }) => {
  const packEntities = entityGetter(state).get('packs');
  const scheduledQueryEntities = entityGetter(state).get('scheduled_queries');
  const { entities: packs } = packEntities;
  const selectedPackID = get(location, 'query.selectedPack');
  const selectedPack = selectedPackID && packEntities.findBy({ id: selectedPackID });
  const selectedScheduledQueries = selectedPack && scheduledQueryEntities.where({ pack_id: selectedPack.id });

  return { packs, selectedPack, selectedScheduledQueries };
};

export default connect(mapStateToProps)(AllPacksPage);
