import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import actions from './actions';
import {
  getMidgardURL,
  getHeaders,
  axiosRequest,
} from '../../helpers/apiHelper';

export function* getTransaction() {
  yield takeEvery(actions.GET_TRANSACTION_REQUEST, function*({ payload }) {
    const address = payload;
    const params = {
      method: 'get',
      url: getMidgardURL(`tx/${address}`),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getTransactionSuccess(data));
    } catch (error) {
      yield put(actions.getTransactionFailed(error));
    }
  });
}

export function* getStats() {
  yield takeEvery(actions.GET_STATS_REQUEST, function*() {
    const params = {
      method: 'get',
      url: getMidgardURL('stats'),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getStatsSuccess(data));
    } catch (error) {
      yield put(actions.getStatsFailed(error));
    }
  });
}

export function* getAssetInfo() {
  yield takeEvery(actions.GET_ASSET_INFO_REQUEST, function*({ payload }) {
    const params = {
      method: 'get',
      url: getMidgardURL(`assets/${payload}`),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getAssetInfoSuccess(data));
    } catch (error) {
      yield put(actions.getAssetInfoFailed(error));
    }
  });
}

export function* getPools() {
  yield takeEvery(actions.GET_POOLS_REQUEST, function*() {
    const params = {
      method: 'get',
      url: getMidgardURL('pools'),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield all(
        data.map(poolData => {
          const { chain, symbol } = poolData;
          const assetId = `${chain}.${symbol}`;

          return put(actions.getAssetInfo(assetId));
        }),
      );

      yield all(
        data.map(poolData => {
          const { chain, symbol } = poolData;
          const assetId = `${chain}.${symbol}`;

          return put(actions.getPoolData(assetId));
        }),
      );

      yield put(actions.getPoolsSuccess(data));
    } catch (error) {
      yield put(actions.getPoolsFailed(error));
    }
  });
}

export function* getPoolData() {
  yield takeEvery(actions.GET_POOL_DATA_REQUEST, function*({ payload }) {
    const params = {
      method: 'get',
      url: getMidgardURL(`pools/${payload}`),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getPoolDataSuccess(data));
    } catch (error) {
      yield put(actions.getPoolDataFailed(error));
    }
  });
}

export function* getStakers() {
  yield takeEvery(actions.GET_STAKERS_REQUEST, function*() {
    const params = {
      method: 'get',
      url: getMidgardURL('stakers'),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getStakersSuccess(data));
    } catch (error) {
      yield put(actions.getStakersFailed(error));
    }
  });
}

export function* getStakerData() {
  yield takeEvery(actions.GET_STAKER_DATA_REQUEST, function*({ payload }) {
    const params = {
      method: 'get',
      url: getMidgardURL(`stakers/${payload}`),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getStakerDataSuccess(data));
    } catch (error) {
      yield put(actions.getStakerDataFailed(error));
    }
  });
}

export function* getStakerPoolData() {
  yield takeEvery(actions.GET_STAKER_POOL_DATA_REQUEST, function*({ payload }) {
    const { address, asset } = payload;

    const params = {
      method: 'get',
      url: getMidgardURL(`stakers/${address}/${asset}`),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getStakerDataSuccess(data));
    } catch (error) {
      yield put(actions.getStakerDataFailed(error));
    }
  });
}

export function* getPoolAddress() {
  yield takeEvery(actions.GET_POOL_ADDRESSES_REQUEST, function*() {
    const params = {
      method: 'get',
      url: getMidgardURL('thorchain/pool_addresses'),
      headers: getHeaders(),
    };

    try {
      const { data } = yield call(axiosRequest, params);

      yield put(actions.getPoolAddressSuccess(data));
    } catch (error) {
      yield put(actions.getPoolAddressFailed(error));
    }
  });
}

export default function* rootSaga() {
  yield all([
    fork(getTransaction),
    fork(getStats),
    fork(getAssetInfo),
    fork(getPools),
    fork(getPoolData),
    fork(getStakers),
    fork(getStakerData),
    fork(getStakerPoolData),
    fork(getPoolAddress),
  ]);
}
