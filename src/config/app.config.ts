export const AppConfiguration = () => ({
    environment: process.env.NODE_ENV || 'development',
    port: +process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
});
