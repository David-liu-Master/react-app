import { get as _get } from 'lodash';

import {
  getStakeMemo,
  getCreateMemo,
  getWithdrawMemo,
} from '../../helpers/memoHelper';

import {
  getFixedNumber,
  getBaseNumberFormat,
  getTickerFormat,
  getUserFormat,
} from '../../helpers/stringHelper';

export const getPoolData = (from, poolInfo, runePrice) => {
  const tokenPrice = _get(poolInfo, 'priceRune', 0);
  const asset = from;
  const target = _get(poolInfo, 'asset.ticker', '');
  const symbol = _get(poolInfo, 'asset.symbol', '');
  const depth = Number(poolInfo.runeDepth);
  const volume24 = poolInfo.poolVolume24hr;
  const volumeAT = poolInfo.poolVolume;
  const transaction = Number(poolInfo.poolTxAverage * runePrice);

  const { poolROI: roiAT } = poolInfo;
  const liqFee = Number(poolInfo.poolFeeAverage * runePrice);

  const totalSwaps = poolInfo.swappersCount;
  const totalStakers = poolInfo.stakersCount;

  const depthValue = `$${getUserFormat(depth).toLocaleString()}`;
  const volume24Value = `$${getUserFormat(volume24)}`;
  const transactionValue = `$${getUserFormat(transaction)}`;
  const liqFeeValue = `${getUserFormat(liqFee)}%`;
  const roiAtValue = `${getUserFormat(roiAT)}% pa`;

  return {
    tokenPrice,
    asset,
    target,
    depth,
    volume24,
    volumeAT,
    transaction,
    liqFee,
    roiAT,
    totalSwaps,
    totalStakers,
    values: {
      pool: {
        asset,
        target,
      },
      target,
      symbol,
      depth: depthValue,
      volume24: volume24Value,
      transaction: transactionValue,
      liqFee: liqFeeValue,
      roiAT: roiAtValue,
    },
    raw: {
      depth: getUserFormat(depth),
      volume24: getUserFormat(volume24),
      transaction: getUserFormat(transaction),
      liqFee: getUserFormat(liqFee),
      roiAT: getUserFormat(roiAT),
    },
  };
};

export const getCalcResult = (
  tokenName,
  pools,
  poolAddress,
  rValue,
  runePrice,
  tValue,
) => {
  let R = 10000;
  let T = 10;
  const Pr = runePrice;
  const result = {};

  // CHANGELOG:
  /*
    balance_rune => runeStakedTotal
    balance_token => assetStakedTotal
    pool_units => poolUnits
  */
  Object.keys(pools).forEach(key => {
    const poolData = pools[key];
    const {
      runeStakedTotal,
      assetStakedTotal,
      poolUnits,
      asset: { symbol },
    } = poolData;

    if (symbol.toLowerCase() === tokenName.toLowerCase()) {
      R = Number(runeStakedTotal);
      T = Number(assetStakedTotal);
      result.ratio = R / T;
      result.poolAddress = poolAddress;
      result.symbolTo = symbol;
      result.poolUnits = poolUnits;
    }
  });

  const r = getBaseNumberFormat(rValue);
  const t = getBaseNumberFormat(tValue);

  const poolPrice = getFixedNumber((R / T) * runePrice);
  const newPrice = getFixedNumber((runePrice * (r + R)) / (t + T));
  const newDepth = getFixedNumber(runePrice * (1 + (r / R + t / T) / 2) * R);
  const share = getFixedNumber(((r / (r + R) + t / (t + T)) / 2) * 100);

  return {
    ...result,
    poolPrice,
    newPrice,
    newDepth,
    share,
    Pr,
    R,
    T,
  };
};

export const validateStake = (wallet, runeAmount, tokenAmount, data) => {
  const { poolAddress } = data;
  if (!wallet || !poolAddress || !runeAmount || !tokenAmount) {
    return false;
  }
  return true;
};

export const confirmStake = (
  Binance,
  wallet,
  runeAmount,
  tokenAmount,
  data,
) => {
  return new Promise((resolve, reject) => {
    console.log('confirm stake', wallet, runeAmount, tokenAmount, data);

    if (!validateStake(wallet, runeAmount, tokenAmount, data)) {
      return reject();
    }

    const { poolAddress, symbolTo } = data;

    const memo = getStakeMemo(symbolTo);
    console.log('memo: ', memo);

    const outputs = [
      {
        to: poolAddress,
        coins: [
          {
            denom: 'RUNE-A1F',
            amount: runeAmount.toFixed(8),
          },
          {
            denom: symbolTo,
            amount: tokenAmount.toFixed(8),
          },
        ],
      },
    ];

    Binance.multiSend(wallet, outputs, memo)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
};

export const getCreatePoolTokens = (assetData, pools) => {
  return assetData.filter(data => {
    let unique = true;

    if (getTickerFormat(data.asset) === 'rune') {
      return false;
    }

    pools.forEach(pool => {
      if (pool.symbol === data.asset) {
        unique = false;
      }
    });

    return unique;
  });
};

export const getCreatePoolCalc = (
  tokenName,
  poolAddress,
  rValue,
  runePrice,
  tValue,
) => {
  const Pr = runePrice;

  if (!poolAddress) {
    return {
      poolPrice: 0,
      depth: 0,
      share: 100,
    };
  }

  const r = rValue && getBaseNumberFormat(rValue);
  const t = getBaseNumberFormat(tValue);

  const poolPrice = tValue && getFixedNumber((r / t) * runePrice);
  const depth = getFixedNumber(runePrice * r);
  const share = 100;
  const tokenSymbol = tokenName;

  return {
    poolAddress,
    tokenSymbol,
    poolPrice,
    depth,
    share,
    Pr,
  };
};

export const confirmCreatePool = (
  Binance,
  wallet,
  runeAmount,
  tokenAmount,
  data,
) => {
  return new Promise((resolve, reject) => {
    console.log('confirm stake', wallet, runeAmount, tokenAmount, data);

    if (!validateStake(wallet, runeAmount, tokenAmount, data)) {
      return reject();
    }

    const { poolAddress, tokenSymbol } = data;

    const memo = getCreateMemo(tokenSymbol);
    console.log('memo: ', memo);

    const outputs = [
      {
        to: poolAddress,
        coins: [
          {
            denom: 'RUNE-A1F',
            amount: runeAmount.toFixed(8),
          },
          {
            denom: tokenSymbol,
            amount: tokenAmount.toFixed(8),
          },
        ],
      },
    ];

    Binance.multiSend(wallet, outputs, memo)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
};

export const confirmWithdraw = (
  Binance,
  wallet,
  poolAddress,
  symbol,
  percent,
) => {
  return new Promise((resolve, reject) => {
    console.log('confirm withdraw', wallet, percent);

    if (!wallet || !poolAddress) {
      return reject();
    }

    const memo = getWithdrawMemo(symbol, percent);
    console.log('memo: ', memo);

    const amount = 0.00000001;
    Binance.transfer(wallet, poolAddress, amount, 'BNB', memo)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
};

export const getTxType = tx => {
  const memo = tx.data.M;
  let txType = null;

  if (memo) {
    const str = memo.toLowerCase();

    const memoTypes = [
      {
        type: 'stake',
        memos: ['stake', 'st', '+'],
      },
      {
        type: 'withdraw',
        memos: ['withdraw', 'wd', '-'],
      },
    ];

    memoTypes.forEach(memoData => {
      const { type, memos } = memoData;
      let matched = false;

      memos.forEach(memoText => {
        if (str.includes(`${memoText}:`)) {
          matched = true;
        }
      });

      if (matched) {
        txType = type;
      }
    });
  }

  return txType;
};

export const parseTransfer = tx => {
  const txHash = tx.data.H;
  const txMemo = tx.data.M;
  const txFrom = tx.data.f;
  const txInfo = tx.data.t[0];
  const txTo = txInfo.o;
  const txData = txInfo.c;

  return {
    txHash,
    txMemo,
    txFrom,
    txTo,
    txData,
  };
};

export const stakedResult = (
  tx,
  fromAddr,
  toAddr,
  toToken,
  runeAmount,
  tokenAmount,
) => {
  const txType = getTxType(tx);

  console.log('tx type: ', txType);
  if (txType === 'stake') {
    const { txFrom, txTo, txData } = parseTransfer(tx);
    if (txFrom === fromAddr && txTo === toAddr && txData.length === 2) {
      let success = true;

      console.log('tx data: ', txData);

      txData.forEach(data => {
        const tickerFormat = getTickerFormat(data.a);
        if (tickerFormat === 'rune') {
          // compare rune amount from previous stake tx
          if (Number(data.A) !== runeAmount) {
            success = false;
          }
        }

        // compare token symbol and amount from previous stake tx
        if (tickerFormat !== 'rune' && data.a !== toToken) {
          if (Number(data.A) !== tokenAmount) {
            success = false;
          }
        }
      });

      return success;
    }
  }

  return null;
};
