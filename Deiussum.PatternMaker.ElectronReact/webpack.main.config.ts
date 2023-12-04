import type { Configuration } from 'webpack';
// @ts-ignore
import path from 'path';

import { rules } from './webpack.rules';

rules.push(
  {
    test: /\.(ico|gif|png|jpg|jpeg|svg)$/i,
    type: 'asset/resource',
    include: [
      // @ts-ignore
      path.resolve(__dirname, "src/assets")
    ]

  }
)

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
