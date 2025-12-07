import { GoogleGenerativeAI } from '@google/generative-ai'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee'
import { env } from '@/env'

const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY)

export async function generateEmbedding(content: string) {
  const model = genAI.getGenerativeModel({
    model: 'text-embedding-004',
  })
  const result = await model.embedContent(content)
  const embedding = result.embedding
  return embedding.values
}

export async function generateResponse({
  question,
  context,
  conversationHistory = '',
}: {
  question: string
  context: string
  conversationHistory?: string
}) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `Anda adalah asisten AI untuk sistem HRIS (Human Resource Information System).
Tugas Anda adalah menjawab pertanyaan tentang data karyawan berdasarkan konteks yang diberikan.

ATURAN FORMAT OUTPUT:
1. Gunakan format Markdown untuk struktur yang lebih baik
2. Gunakan heading (##, ###) untuk bagian penting
3. Gunakan bullet points (-) atau numbering (1., 2.) untuk list
4. Gunakan **bold** untuk menekankan informasi penting
5. Gunakan tabel jika data cocok untuk format tabel
6. Gunakan code block (\`\`\`) untuk data yang perlu ditampilkan dengan jelas
7. Gunakan line breaks untuk memisahkan paragraf

ATURAN KONTEN:
1. Jawab berdasarkan informasi dalam KONTEKS yang diberikan
2. Jika ada RIWAYAT PERCAKAPAN, gunakan untuk memahami konteks pertanyaan saat ini
3. Jika pertanyaan menggunakan referensi (seperti "gajinya", "dia", "nya", "karyawan tersebut", "tersebut"), 
   gunakan informasi dari RIWAYAT PERCAKAPAN untuk memahami siapa yang dimaksud
4. Jika konteks berisi STATISTIK KARYAWAN, gunakan data tersebut untuk menjawab pertanyaan tentang jumlah/total
5. Berikan jawaban yang akurat, jelas, dan terstruktur
6. Sertakan detail relevan seperti nama lengkap, posisi, department, dll
7. Jika ada angka (gaji, jumlah karyawan), tampilkan dengan format yang mudah dibaca
8. Gunakan Bahasa Indonesia yang profesional tapi tetap ramah
9. Jika ditanya tentang jumlah/statistik, gunakan data dari STATISTIK KARYAWAN jika tersedia
10. Format angka rupiah dengan "Rp" dan gunakan separator titik (.)
11. Jika konteks berisi data karyawan individual, gunakan untuk menjawab pertanyaan spesifik tentang karyawan
12. JANGAN meminta klarifikasi jika informasi sudah jelas dari RIWAYAT PERCAKAPAN

CONTOH FORMAT JAWABAN:
## Ringkasan
Total karyawan di perusahaan adalah **15 orang**, terdiri dari:
- **12 karyawan aktif**
- **3 karyawan tidak aktif**

## Detail Karyawan IT
Terdapat 3 karyawan di department IT:
1. **John Doe** - Software Engineer
2. **Jane Smith** - DevOps Engineer
3. **Bob Johnson** - QA Engineer

## Total Gaji
Total gaji pokok karyawan full-time adalah **Rp 25.000.000**

HINDARI:
- Mengatakan "Informasi tidak tersedia" jika ada data STATISTIK KARYAWAN di konteks
- Jawaban yang tidak jelas atau ambigu
- Menambahkan informasi yang tidak ada di konteks
- Memberikan asumsi tanpa data`,
    })

    const prompt = `${
      conversationHistory
        ? `RIWAYAT PERCAKAPAN:
${conversationHistory}

`
        : ''
    }KONTEKS DATA KARYAWAN:
${context}

PERTANYAAN USER: ${question}

${
  conversationHistory
    ? `CATATAN: Pertanyaan di atas mungkin menggunakan referensi (seperti "gajinya", "dia", "nya", "tersebut"). 
Gunakan RIWAYAT PERCAKAPAN di atas untuk memahami konteks dan siapa yang dimaksud dalam pertanyaan.
Jika informasi sudah jelas dari riwayat percakapan, jawab langsung tanpa meminta klarifikasi.

`
    : ''
}Jawab pertanyaan berdasarkan konteks di atas dengan jelas dan akurat.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error generating response:', error)
    throw new Error('Gagal generate response dari AI')
  }
}

export function formatEmployeeForEmbedding(employee: EmployeeDetail) {
  const parts = [
    `Employee ID: ${employee.employeeId}`,
    `Nama Lengkap: ${employee.firstName} ${employee.lastName}`,
    `Email: ${employee.email}`,
  ]

  if (employee.phone) {
    parts.push(`No. Telepon: ${employee.phone}`)
  }

  if (employee.address) {
    parts.push(`Alamat: ${employee.address}`)
  }

  if (employee.city) {
    parts.push(`Kota: ${employee.city}`)
  }

  if (employee.dateOfBirth) {
    parts.push(`Tanggal Lahir: ${employee.dateOfBirth}`)
  }

  if (employee.gender) {
    parts.push(
      `Jenis Kelamin: ${employee.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}`,
    )
  }

  parts.push(`Status Employment: ${employee.status}`)
  parts.push(`Tipe Employment: ${employee.employmentType}`)
  parts.push(
    `Gaji Pokok: Rp ${new Intl.NumberFormat('id-ID').format(employee.baseSalary)}`,
  )

  const hireYear = employee.hireDate.getFullYear()
  const hireMonth = employee.hireDate.toLocaleDateString('id-ID', {
    month: 'long',
  })
  parts.push(
    `Tanggal Bergabung: ${employee.hireDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} (Tahun ${hireYear}, Bulan ${hireMonth})`,
  )

  if (employee.maritalStatus) {
    const statusMap = {
      SINGLE: 'Belum Menikah',
      MARRIED: 'Menikah',
      DIVORCED: 'Cerai',
      WIDOWED: 'Janda/Duda',
    }
    parts.push(
      `Status Pernikahan: ${statusMap[employee.maritalStatus as keyof typeof statusMap] || employee.maritalStatus}`,
    )
  }

  if (employee.city) {
    parts.push(`Kota: ${employee.city}`)
  }

  if (employee.address) {
    parts.push(`Alamat: ${employee.address}`)
  }

  return parts.join('\n')
}
