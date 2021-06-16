
import { axios } from 'axios'
import qs from 'qs'
const pendingRequest = new Map();

function generateReqKey(config) {
    const { method, url, params, data } = config;
    return [method, url, qs.stringify(params), qs.stringify(data)].join(
        "&"
    );
}

function addPendingRequest(config) {

const requestKey = generateReqKey(config);
config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
        if (!pendingRequest.has(requestKey)) {
            pendingRequest.set(requestKey, cancel);
        }
    });
}

function removePendingRequest(config) {
const requestKey = generateReqKey(config);
if (pendingRequest.has(requestKey)) {
    const cancel = pendingRequest.get(requestKey);
    cancel(requestKey);
    pendingRequest.delete(requestKey);
}
}

axios.interceptors.request.use(
    function (config) {
        removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求
        addPendingRequest(config); // 把当前请求添加到pendingRequest对象中
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        removePendingRequest(response.config); // 从pendingRequest对象中移除请求
        return response;
    },
    (error) => {
        removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求
        if (axios.isCancel(error)) {
            console.log("已取消的重复请求：" + error.message);
        } else {
        // 添加异常处理
        }
        return Promise.reject(error);
    }
);

async function sendRequest() {
console.dir(pendingRequest);
const response = await axios.get(
    "https://localhost:3000/api/1"
);
    console.log(response.data);
}
