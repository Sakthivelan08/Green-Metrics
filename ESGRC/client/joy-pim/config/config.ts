import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
const config: IConfig = {
  treeShaking: true,
  hash: true,
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
      ]
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: false,
      dynamicImport: false,
      title: 'Green Metrics',
      dll: false,
      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
  define: {
    "APP_ENV": "dev",
    "API_ENDPOINT": "https://esgrc-product-app.azurewebsites.net",
    "THEME": { faveColor: 'blue' }, //objects are supported as well
  },
}

export default config;
