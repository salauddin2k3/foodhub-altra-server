import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`FoodHub Altra server running on port ${env.port}`);
});
