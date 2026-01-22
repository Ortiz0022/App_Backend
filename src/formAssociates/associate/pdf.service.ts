import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

@Injectable()
export class AssociatePdfService {
  // ✅ estilo igual al PdfService
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    table: {
      headerBg: '#F9FAFB',
      row: '#FFFFFF',
      rowAlt: '#FAFAFA',
      headerText: '#666',
      text: '#33361D',
    },
  }

  private readonly LOGO_URL =
    'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png'

  private readonly FOOTER_SPACE = 22

  private safeDate(d?: any) {
    if (!d) return '—'
    const dt = new Date(d)
    if (isNaN(+dt)) return String(d)
    return dt.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  private async downloadLogo(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      https
        .get(this.LOGO_URL, (response) => {
          const chunks: Buffer[] = []
          response.on('data', (chunk) => chunks.push(chunk))
          response.on('end', () => resolve(Buffer.concat(chunks)))
          response.on('error', reject)
        })
        .on('error', reject)
    })
  }

  // ✅ Acepta rows planos o entities con persona
  private normalize(a: any) {
    const p = a?.persona ?? {}

    const cedula = a?.cedula ?? p?.cedula ?? '—'
    const telefono = a?.telefono ?? p?.telefono ?? '—'
    const email = a?.email ?? p?.email ?? '—'

    const nombreCompleto =
      (a?.nombreCompleto ??
        `${p?.nombre ?? ''} ${p?.apellido1 ?? ''} ${p?.apellido2 ?? ''}`.trim()) || '—'

    const marcaGanado = a?.marcaGanado ?? '—'

    // estado puede venir como boolean del entity o ya convertido en texto
    const estadoBool =
      typeof a?.estado === 'boolean' ? a.estado : typeof a?.isActive === 'boolean' ? a.isActive : undefined

    const estadoTexto =
      typeof a?.estado === 'string'
        ? a.estado
        : estadoBool === undefined
          ? '—'
          : estadoBool
            ? 'Activo'
            : 'Inactivo'

    const createdAt = a?.createdAt ?? a?.fecha ?? p?.createdAt ?? null

    return { cedula, nombreCompleto, telefono, email, marcaGanado, estadoTexto, createdAt }
  }

  private addHeader(doc: PDFDoc, title: string, logoBuffer?: Buffer) {
    const left = 50
    const right = doc.page.width - 50

    const headerTop = 32
    const logoW = 38
    const gap = 10

    const titleY = headerTop + 6
    const subY = titleY + 18
    const textBlockH = 10 + 18

    const logoX = left
    const logoY = headerTop + (textBlockH - logoW) / 2 + 10
    const textX = logoBuffer ? logoX + logoW + gap : left

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, logoX, logoY, { width: logoW })
      } catch (e) {
        console.warn('No se pudo agregar el logo:', e)
      }
    }

    doc.font('Helvetica-Bold').fontSize(16).fillColor(this.UI.ink)
    doc.text('CÁMARA DE GANADEROS', textX, titleY, { align: 'left' })

    doc.font('Helvetica').fontSize(10).fillColor(this.UI.gray)
    doc.text(title, textX, subY, { align: 'left' })

    doc.font('Helvetica').fontSize(10).fillColor(this.UI.gray)
    doc.text(`Generado: ${new Date().toLocaleString('es-CR')}`, left, titleY, {
      width: right - left,
      align: 'right',
    })

    const lineY = headerTop + textBlockH + 22
    doc
      .moveTo(left, lineY)
      .lineTo(right, lineY)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .stroke()

    doc.y = lineY + 18
  }

  private addFooter(doc: PDFDoc) {
    const left = 50
    const right = doc.page.width - 50
    const y = doc.page.height - doc.page.margins.bottom - 14

    doc
      .moveTo(left, y - 8)
      .lineTo(right, y - 8)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .stroke()

    doc.font('Helvetica').fontSize(8).fillColor(this.UI.gray)
    doc.text(`Generado el ${new Date().toLocaleString('es-CR')}`, left, y, {
      width: right - left,
      align: 'center',
    })
  }

  private addSectionTitle(doc: PDFDoc, title: string) {
    const left = 50
    doc.moveDown(0.6)
    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.UI.ink).text(title, left)
    doc.moveDown(0.6)
  }

  private addStyledTable(
    doc: PDFDoc,
    columns: Array<{ title: string; w: number; align?: 'left' | 'right' | 'center' }>,
    rows: any[][],
  ) {
    const left = 50
    const right = doc.page.width - 50
    const avail = right - left

    const sumW = columns.reduce((s, c) => s + c.w, 0)
    const cols =
      sumW === avail
        ? columns
        : columns.map((c, i, arr) => {
            const scaled = Math.floor((c.w * avail) / sumW)
            if (i === arr.length - 1) {
              const acc = arr.slice(0, i).reduce((s2, cc) => s2 + Math.floor((cc.w * avail) / sumW), 0)
              return { ...c, w: avail - acc }
            }
            return { ...c, w: scaled }
          })

    const xs: number[] = []
    let acc = left
    for (const c of cols) {
      xs.push(acc)
      acc += c.w
    }

    const headerH = 28
    const headerGap = 6
    const paddingY = 6
    const rowFontSize = 9

    const bottom = () => doc.page.height - doc.page.margins.bottom - this.FOOTER_SPACE

    const measureRowH = (row: any[]) => {
      doc.font('Helvetica').fontSize(rowFontSize)
      const hs = row.map((cell, i) =>
        doc.heightOfString(String(cell ?? '—'), {
          width: cols[i].w - 20,
          align: (cols[i].align as any) ?? 'left',
        }),
      )
      return Math.max(...hs, 10) + paddingY * 2
    }

    const measureTableH = () => {
      let total = headerH + headerGap
      if (!rows.length) return total + 40
      for (const r of rows) total += measureRowH(r)
      total += 10
      return total
    }

    const tableH = measureTableH()
    if (doc.y + tableH > bottom()) doc.addPage()

    let y = doc.y

    doc
      .roundedRect(left, y, avail, headerH, 12)
      .fillColor(this.UI.table.headerBg)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .fillAndStroke()

    doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.table.headerText)
    cols.forEach((c, i) => {
      doc.text(c.title, xs[i] + 10, y + 9, {
        width: c.w - 20,
        align: c.align ?? 'left',
      })
    })

    y += headerH + headerGap

    if (!rows.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#EF4444')
      doc.text('Sin resultados.', left, y + 6)
      doc.y = y + 40
      return
    }

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx]
      const rowH = measureRowH(row)

      if (y + rowH > bottom()) {
        doc.addPage()
        y = doc.page.margins.top
      }

      doc.rect(left, y, avail, rowH).fillColor(idx % 2 === 0 ? this.UI.table.row : this.UI.table.rowAlt).fill()

      doc.font('Helvetica').fontSize(rowFontSize).fillColor(this.UI.table.text)
      row.forEach((cell, i) => {
        doc.text(String(cell ?? '—'), xs[i] + 10, y + paddingY, {
          width: cols[i].w - 20,
          align: (cols[i].align as any) ?? 'left',
        })
      })

      y += rowH
      doc.moveTo(left, y).lineTo(right, y).strokeColor(this.UI.line).lineWidth(0.5).stroke()
    }

    doc.y = y + 10
  }

  async generateAssociatesListPDF(opts: { associates: any[]; filterText?: string }): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch (e) {
        console.warn('⚠️ No se pudo descargar el logo:', e)
      }

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (c) => chunks.push(c as Buffer))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.addHeader(doc, 'Listado de Asociados', logoBuffer)

      this.addSectionTitle(doc, 'ASOCIADOS')

      // (opcional) filtro visual
      if (opts.filterText?.trim()) {
        const left = 50
        const right = doc.page.width - 50

        doc.rect(left, doc.y, right - left, 18).fillColor('#FAFAFA').fill()
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(this.UI.gray)
        doc.text(`Filtro aplicado: ${opts.filterText.trim()}`, left + 8, doc.y - 14)
        doc.moveDown(1.2)
      }

      this.addStyledTable(
        doc,
        [
          { title: 'CÉDULA', w: 95 },
          { title: 'NOMBRE', w: 190 },
          { title: 'TELÉFONO', w: 120 },
          { title: 'EMAIL', w: 210 },
          { title: 'MARCA GANADO', w: 140 },
          { title: 'ESTADO', w: 90, align: 'center' },
          { title: 'FECHA', w: 95, align: 'center' },
        ],
        (opts.associates ?? []).map((raw) => {
          const a = this.normalize(raw)
          return [
            a.cedula,
            a.nombreCompleto,
            a.telefono,
            a.email,
            a.marcaGanado,
            a.estadoTexto,
            this.safeDate(a.createdAt),
          ]
        }),
      )

      this.addFooter(doc)
      doc.end()
    })
  }
}
