import { app } from './app.js'
import { config } from './config.js'
import { scheduleBillingJob } from './jobs/billing.js'

app.listen(config.port, () => {
  console.log(`Brightloop API listening on http://localhost:${config.port}`)
  scheduleBillingJob()
})
