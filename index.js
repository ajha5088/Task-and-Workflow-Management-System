const startApolloServer = require('./src/app');

const PORT = process.env.PORT || 4000;

startApolloServer().then(app => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
