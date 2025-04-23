import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  webpack: (config, { dev, isServer }) => {
    // Configure font loading
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]',
      },
    });

    // Add MiniCssExtractPlugin in production
    if (!dev && !isServer) {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      config.module.rules.push({
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      });
      config.plugins.push(new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].css',
      }));
    }

    return config;
  },
};

export default nextConfig;
