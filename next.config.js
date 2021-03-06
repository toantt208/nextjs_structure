require('dotenv').config();

const path = require('path');
const Dotenv = require('dotenv-webpack');

const withCss = require('@zeit/next-css');

const webpackConf = {
  webpack(config, { isServer }) {
    config.plugins = config.plugins || [];

    // antd
    if (isServer) {
      const antStyles = /antd\/.*?\/style\/css.*?/;
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback();
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ];

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader',
      });
    }

    //  Alias path
    config.resolve.alias = {
      ...config.resolve.alias,
      src: path.resolve(__dirname, 'src'),
    };

    return config;
  },

  env: process.env.NODE_ENV !== 'production' && {
    ...new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: false,
    }).definitions,
  },
  publicRuntimeConfig: {
    ...process.env,
  },
  onDemandEntries: {
    websocketPort: process.env.DC_WEBSOCKET_PORT,
  },
};

module.exports = withCss(webpackConf);
