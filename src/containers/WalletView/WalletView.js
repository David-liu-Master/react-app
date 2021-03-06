import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sortBy as _sortBy } from 'lodash';

import { WalletViewWrapper } from './WalletView.style';
import Tabs from '../../components/uielements/tabs';
import Label from '../../components/uielements/label';
import Button from '../../components/uielements/button';
import CoinList from '../../components/uielements/coins/coinList';
import midgardActions from '../../redux/midgard/actions';
import { getPair, getTickerFormat } from '../../helpers/stringHelper';
import {
  AssetLoader,
  StakeLoader,
} from '../../components/utility/loaders/wallet';

const { getRunePrice, getPools } = midgardActions;

const { TabPane } = Tabs;

class WalletView extends Component {
  static propTypes = {
    user: PropTypes.object,
    page: PropTypes.string,
    view: PropTypes.string,
    info: PropTypes.string,
    status: PropTypes.string,
    assetData: PropTypes.array.isRequired,
    stakeData: PropTypes.array.isRequired,
    loadingAssets: PropTypes.bool.isRequired,
    loadingStakes: PropTypes.bool.isRequired,
    setAssetData: PropTypes.func.isRequired,
    setStakeData: PropTypes.func.isRequired,
    getPools: PropTypes.func.isRequired,
    getRunePrice: PropTypes.func.isRequired,
    assets: PropTypes.object.isRequired,
    runePrice: PropTypes.object,
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    page: '',
    view: '',
    info: '',
    status: '',
  };

  componentDidMount() {
    const { getPools, getRunePrice } = this.props;
    getPools();
    getRunePrice();
  }

  getAssetNameByIndex = index => {
    const { assetData } = this.props;
    const sortedAssets = _sortBy(assetData, ['asset']);

    return sortedAssets[index].asset || '';
  };

  getAssetIndexByName = asset => {
    const { assetData } = this.props;

    return assetData.find(data => data.asset === asset);
  };

  handleSelectAsset = key => {
    const newAssetName = this.getAssetNameByIndex(key);
    const ticker = getTickerFormat(newAssetName);

    const URL = `/swap/detail/${ticker}-rune`;
    this.props.history.push(URL);
  };

  handleSelectStake = key => {
    const { stakeData } = this.props;

    const selected = stakeData[key];
    const target = selected.target.toLowerCase();

    const URL = `/pool/${target}`;
    this.props.history.push(URL);
  };

  renderAssetTitle = () => {
    const { status, loadingAssets, assetData } = this.props;

    if (loadingAssets) {
      return <AssetLoader />;
    }

    if (status === 'connected' && assetData.length === 0) {
      return "Looks like you don't have anything in your wallet"; // eslint-disable-line quotes
    }

    if (status === 'connected') {
      return 'Tokens in your wallet:';
    }
    return 'Connect your wallet';
  };

  renderStakeTitle = () => {
    const { stakeData, loadingStakes } = this.props;

    if (loadingStakes) {
      return <StakeLoader />;
    }

    if (stakeData.length > 0) {
      return 'Your current stakes are:';
    }
    return 'You are currently not staked in any pool';
  };

  getSelectedAsset = pair => {
    const { page } = this.props;

    if (page === 'pool' || page === 'trade') {
      const { target } = pair;
      const targetIndex = this.getAssetIndexByName(target);

      return [targetIndex];
    }
    return [];
  };

  render() {
    const {
      info,
      user: { wallet },
      assetData,
      stakeData,
      assets,
      runePrice,
      loadingAssets,
      loadingStakes,
    } = this.props;
    const pair = getPair(info);
    const { source } = pair;
    const selectedAsset = this.getSelectedAsset(pair);
    const sourceIndex = this.getAssetIndexByName(source);
    const sortedAssets = _sortBy(assetData, ['asset']);

    return (
      <WalletViewWrapper data-test="wallet-view">
        <Tabs
          data-test="wallet-view-tabs"
          defaultActiveKey="assets"
          onChange={this.handleChangeTab}
          withBorder
        >
          <TabPane tab="assets" key="assets">
            <Label className="asset-title-label" weight="bold">
              {this.renderAssetTitle()}
            </Label>
            {!wallet && (
              <Link to="/connect">
                <Button color="success">CONNECT</Button>
              </Link>
            )}
            {!loadingAssets && (
              <CoinList
                data-test="wallet-asset-list"
                data={sortedAssets}
                value={sourceIndex}
                selected={selectedAsset}
                tokenInfo={assets}
                runePrice={runePrice}
                onSelect={this.handleSelectAsset}
              />
            )}
          </TabPane>
          <TabPane tab="stakes" key="stakes">
            <Label className="asset-title-label">
              {this.renderStakeTitle()}
            </Label>
            {!loadingStakes && (
              <CoinList
                data-test="wallet-stakes-list"
                data={stakeData}
                tokenInfo={assets}
                runePrice={runePrice}
                onSelect={this.handleSelectStake}
              />
            )}
          </TabPane>
        </Tabs>
      </WalletViewWrapper>
    );
  }
}

export default compose(
  connect(
    state => ({
      user: state.Wallet.user,
      assetData: state.Wallet.assetData,
      stakeData: state.Wallet.stakeData,
      loadingAssets: state.Wallet.loadingAssets,
      loadingStakes: state.Wallet.loadingStakes,
      assets: state.Midgard.assets,
      runePrice: state.Wallet.runePrice,
    }),
    {
      getPools,
      getRunePrice,
    },
  ),
  withRouter,
)(WalletView);
