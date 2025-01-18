module.exports = {
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.minimize = false;
    }
    config.cache = false;
    return config;
  },
};