import { pipeline, env as transformersEnv } from '@xenova/transformers'

// Will Cache .cache/huggingface
transformersEnv.cacheDir = './.cache/huggingface'

let embeddingPipeline: any = null

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'
const EMBEDDING_DIMENSIONS = 384

// Get embedding pipeline => to reuse the pipeline
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('🔄 [Local Embedding] Loading model:', MODEL_NAME)
    console.log('⚠️  First run will download model (~23MB), please wait...')

    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
      // Options
      quantized: true, // Use quantized model for smaller size & faster inference
      progress_callback: (progress: any) => {
        if (progress.status === 'progress') {
          console.log(
            `📥 Downloading: ${progress.file} - ${Math.round(progress.progress)}%`,
          )
        }
      },
    })

    console.log('✅ [Local Embedding] Model loaded successfully!')
  }

  return embeddingPipeline
}

// Generate embedding for a single text
export async function generateEmbedding(text: string): Promise<Array<number>> {
  try {
    const pipeline = await getEmbeddingPipeline()

    const output = await pipeline(text, {
      pooling: 'mean', // Mean pooling strategy
      normalize: true, // Normalize embeddings
    })

    const embedding = Array.from(output.data)

    return embedding as Array<number>
  } catch (error) {
    console.error('❌ [Local Embedding] Error:', error)
    throw new Error('Gagal generate embedding secara lokal')
  }
}

// Generate embeddings for multiple texts (batch processing)
export async function generateEmbeddingsBatch(
  texts: Array<string>,
): Promise<Array<Array<number>>> {
  try {
    const pipeline = await getEmbeddingPipeline()

    const BATCH_SIZE = 32
    const results: Array<Array<number>> = []

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE)

      const outputs = await Promise.all(
        batch.map((text) =>
          pipeline(text, {
            pooling: 'mean',
            normalize: true,
          }),
        ),
      )

      const embeddings = outputs.map((output) => Array.from(output.data))
      results.push(...(embeddings as Array<Array<number>>))

      console.log(
        `✅ Processed ${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length} texts`,
      )
    }

    return results
  } catch (error) {
    console.error('❌ [Local Embedding] Batch error:', error)
    throw new Error('Gagal generate embeddings batch')
  }
}

// Calculate cosine similarity between two embeddings
export function cosineSimilarity(a: Array<number>, b: Array<number>): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Warm up the model to avoid first-request delay
export async function warmupEmbeddingModel() {
  console.log('🔥 [Local Embedding] Warming up model...')
  await generateEmbedding('warmup text')
  console.log('✅ [Local Embedding] Model ready!')
}

export { MODEL_NAME, EMBEDDING_DIMENSIONS }
