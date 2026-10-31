import PDFDocument from 'pdfkit'

export const createInvoicePdf = async (invoice: {
  number: string
  invoiceDate: Date
  dueDate: Date
  total: number
  customerName: string
}) => {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(Buffer.from(chunk)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.fontSize(20).text('Brightloop Software', { align: 'left' })
    doc.moveDown()
    doc.fontSize(14).text(`Invoice ${invoice.number}`)
    doc.fontSize(10).text(`Customer: ${invoice.customerName}`)
    doc.text(`Invoice date: ${invoice.invoiceDate.toISOString().slice(0, 10)}`)
    doc.text(`Due date: ${invoice.dueDate.toISOString().slice(0, 10)}`)
    doc.moveDown()
    doc.fontSize(12).text(`Total: INR ${(invoice.total / 100).toFixed(2)}`)
    doc.end()
  })
}
