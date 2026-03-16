import express from 'express';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(express.json());

app.get('/api/analytics/:short_code', async (req, res) => {
  const { short_code } = req.params;
  const { range } = req.query;
  res.status(501).json({ 
    error: 'Not implemented yet',
    service: 'analytics-service',
    short_code,
    range
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service' });
});

app.listen(PORT, () => {
  console.log(`📊 Analytics Service listening on port ${PORT}`);
});
