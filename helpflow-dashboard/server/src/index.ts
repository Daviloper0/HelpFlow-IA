import express from 'express';
import { config } from './config';
// Importing schema runs the CREATE TABLE statements on startup
import './db/schema';
import { docsRouter } from './routes/docs';
import { runnerRouter } from './routes/runner';
import { testsRouter } from './routes/tests';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/tests', testsRouter);
app.use('/api/tests', runnerRouter);
app.use('/api', docsRouter);

app.listen(config.port, () => {
  console.log(`Dashboard backend running on http://localhost:${config.port}`);
  console.log(`HelpFlow target: ${config.helpflowBaseUrl}`);
});
