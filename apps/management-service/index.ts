import express from 'express';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.delete('/api/links/:short_code', async (req, res) => {
  const { short_code } = req.params;
  res.status(501).json({ 
    error: 'Not implemented yet',
    service: 'management-service',
    short_code
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'management-service' });
});

app.listen(PORT, () => {
  console.log(`🗑️  Management Service listening on port ${PORT}`);
});
