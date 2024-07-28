// eslint-disable-next-line no-undef
module.exports = {
    apps: [
        {
            name: 'nexus',
            script: './dist/index.js',
            screenX: 0,
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
}
