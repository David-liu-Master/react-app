import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import { ActionViewWrapper, BackLink } from './ActionView.style';
import { SwapIntro, SwapView, SwapSend } from '../Swap';
import { PoolIntro, PoolView, PoolStake, PoolCreate } from '../Pool';
import { TradeIntro, TradeView, TradeDetail } from '../Trade';
import ConnectView from '../ConnectView';
import StatsView from '../StatsView';
import FaqsView from '../FaqsView';
import NetworkView from '../NetworkView';
import TutorialView from '../TutorialView';

import walletActions from '../../redux/wallet/actions';

const { refreshBalance, refreshStake } = walletActions;

class ActionView extends Component {
  static propTypes = {
    type: PropTypes.string,
    view: PropTypes.string,
    info: PropTypes.string,
    user: PropTypes.object.isRequired,
    refreshBalance: PropTypes.func.isRequired,
    refreshStake: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    symbol: PropTypes.string,
  };

  static defaultProps = {
    type: '',
    view: 'view',
    info: '',
  };

  componentDidMount() {
    const { user, refreshBalance, refreshStake } = this.props;

    if (user && user.wallet) {
      const address = user.wallet;

      refreshBalance(address);
      refreshStake(address);
    }
  }

  getView = () => {
    const { type, view } = this.props;
    console.log('actionview type: ', type, view);
    if (type) {
      return `${type}-${view}`;
    }
  };

  renderBack = () => {
    const { view } = this.props;
    if (view === 'view') return '';

    const pageView = this.getView();
    let routing = '';

    if (
      pageView === 'connect-view' ||
      pageView === 'stats-view' ||
      pageView === 'faqs-view'
    ) {
      routing = '/swap';
    }
    if (pageView === 'swap-detail' || pageView === 'swap-send') {
      routing = '/swap';
    }
    if (pageView.includes('pools-')) {
      routing = '/pools';
    }
    if (pageView.includes('trade-')) {
      routing = '/trade';
    }
    return (
      <Link to={routing}>
        <BackLink>
          <Icon type="left" />
          <span>Back</span>
        </BackLink>
      </Link>
    );
  };

  render() {
    const { info, symbol } = this.props;
    const view = this.getView();
    console.log('View', view);

    return (
      <>
        {this.renderBack()}
        <ActionViewWrapper>
          {view === 'intro-swap' && <SwapIntro />}
          {view === 'intro-pools' && <PoolIntro />}
          {view === 'intro-trade' && <TradeIntro />}
          {view === 'tutorial' && <TutorialView />}
          {view === 'connect-view' && <ConnectView />}
          {view === 'stats-view' && <StatsView />}
          {view === 'faqs-view' && <FaqsView />}
          {view === 'network-view' && <NetworkView />}
          {view === 'swap-view' && <SwapView />}
          {view === 'swap-detail' && <SwapSend view="detail" info={info} />}
          {view === 'swap-send' && <SwapSend view="send" info={info} />}
          {view === 'pools-view' && <PoolView />}
          {view === 'pools-pool' && <PoolStake symbol={symbol} />}
          {view === 'pools-new' && <PoolCreate symbol={symbol} />}
          {view === 'trade-view' && <TradeView />}
          {view === 'trade-detail' && <TradeDetail symbol={symbol} />}
        </ActionViewWrapper>
      </>
    );
  }
}

export default compose(
  connect(
    state => ({
      user: state.Wallet.user,
    }),
    {
      refreshBalance,
      refreshStake,
    },
  ),
  withRouter,
)(ActionView);
