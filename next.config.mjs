import { testSelectionRule } from '@variance-authority/sense/journal';

// The build change: every module of the product, server and page alike, takes the probes.
export default {
  webpack(config) {
    config.module.rules.push(
      testSelectionRule({
        placement: 'before-transforms',
        include: (file) => /\/(app|lib)\/[^/]+\.tsx?$/.test(file) && !file.includes('/node_modules/'),
      }),
    );
    return config;
  },
};
