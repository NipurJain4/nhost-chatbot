import { NhostClient } from '@nhost/nhost-js'

const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'local',
  region: import.meta.env.VITE_NHOST_REGION || 'us-east-1'
})

export { nhost }