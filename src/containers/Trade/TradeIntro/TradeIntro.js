import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Icon } from 'antd';

import { ContentWrapper } from './TradeIntro.style';
import Label from '../../../components/uielements/label';
import Button from '../../../components/uielements/button';

import {
  userAvatarIcon,
  orbGreenIcon,
  arrowTwoIcon,
  marketIcon,
} from '../../../components/icons';

class TradeIntro extends Component {
  render() {
    return (
      <ContentWrapper>
        <Row className="trade-content-text">
          <Col span="8">
            <Label size="normal" weight="bold" color="normal">
              TRADE
            </Label>
            <Label size="small" color="dark">
              Pool prices are always calculated based on the ratio of assets in
              the pool.
            </Label>
            <Label size="small" color="dark">
              Assets are always priced against the BNB in the pool.
            </Label>
            <Label size="small" color="dark">
              Pool prices change when people swap assets, or when the wider
              market price moves.
            </Label>
          </Col>
        </Row>
        <Row className="rune-diagram-wrapper">
          <Col className="rune-diagrams" span={15}>
            <div className="rune-diagram-pool">
              <Label size="big" weight="bold">
                POOL
              </Label>
              <img src={orbGreenIcon} alt="orb-green" />
              <Label size="big" weight="bold">
                $1.00
              </Label>
            </div>
            <img src={arrowTwoIcon} alt="arrow-two" />
            <img src={userAvatarIcon} alt="user-avatar" />
            <img src={arrowTwoIcon} alt="arrow-two" />
            <div className="rune-diagram-market">
              <Label size="big" weight="bold">
                MARKET
              </Label>
              <img src={marketIcon} alt="market" />
              <Label size="big" weight="bold">
                $1.20
              </Label>
            </div>
          </Col>
          <Col span={7} offset={2}>
            <Label size="small" color="dark">
              If the <strong>POOL PRICE</strong> is different to{' '}
              <strong>MARKET PRICE</strong> - this is your opportunity to trade.
            </Label>

            <Label size="small" color="dark">
              You can buy cheap assets at a <strong>DISCOUNT</strong> or sell
              them at a <strong>PREMIUM</strong> to the market.
            </Label>

            <Label size="small" color="dark">
              The first to trade wins the opportunity.
            </Label>
          </Col>
        </Row>
        <Row className="bottom-nav-button">
          <Link to="/introduction/pools">
            <Button color="primary" typevalue="ghost">
              back
            </Button>
          </Link>
          <Link to="/connect">
            <Button color="primary" typevalue="outline">
              start
              <Icon type="arrow-right" />
            </Button>
          </Link>
        </Row>
      </ContentWrapper>
    );
  }
}

export default TradeIntro;
