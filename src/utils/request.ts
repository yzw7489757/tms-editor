import axios from 'axios';

// 重试次数
// axios.defaults.retry = 4;
// axios.defaults.retryDelay = 1000;

// 配置切换路由取消请求,
// const CancelToken = axios.CancelToken
// const source = CancelToken.source()
// store.dispatch('ChangeRequestToken', source)

// 创建axios实例
const service = axios.create({
  baseURL: process.env.REQUEST_BASE_URL,
  timeout: 30000,
  // cancelToken: source.token
});

// request拦截器
service.interceptors.request.use((config) => {
  // config.cancelToken = store.getters.source.token
  if (sessionStorage.getItem('token')) {
    config.headers.token = sessionStorage.getItem('token'); // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config;
}, (error) => {
  // Do something with request error
  console.log(error); // for debug
  Promise.reject(error);
});

// respone拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === -3 || res.code === -2 || res.code === -4 || res.code === 4029) {
      window.sessionStorage.removeItem('token');
      return Promise.reject(res.message);
    }
    if (res.code !== 200) {
      return Promise.reject(res.message);
    }
    return response.data;
  },
  (error) => {
    const { config } = error;
    if (error.response && error.response.status === 500) {
      if (error.response.data.status === 4029) {
        window.sessionStorage.removeItem('token');
      }
    }
    //  If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) {
      if (error.message) {
        // 没有重试的请求
      }
      return Promise.reject(error);
    }

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;

    //  Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
      // '请求失败，重新请求中...',
      return Promise.reject(error);
    }
    config.__retryCount += 1;

    // Create new promise to handle exponential backoff
    const backoff = new Promise(((resolve) => {
      // console.log('Re-request Num:', config.__retryCount)
      setTimeout(() => {
        resolve();
      }, config.retryDelay || 1);
    }));

    // Return the promise in which recalls axios to retry the request
    return backoff.then(() => service(config));
  },
);

export default service;
