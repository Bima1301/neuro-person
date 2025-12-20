import { seed } from './seed/index.js'

seed()
	.catch((e) => {
		console.error('❌ Error during seeding:', e)
		process.exit(1)
	})
