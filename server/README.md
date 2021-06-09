# server
## Controller
### 请求参数校验
```bash
yarn add egg-validate
```
```js
// config/plugin.js
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
```