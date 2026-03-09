import express from 'express';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'redirect-service' });
});

app.get('/:short_code', async (req, res) => {
  const { short_code } = req.params;
  res.status(501).json({ 
    error: 'Not implemented yet',
    service: 'redirect-service',
    short_code
  });
});

app.listen(PORT, () => {
  console.log(`🔀 Redirect Service listening on port ${PORT}`);
});
