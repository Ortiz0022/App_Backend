import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

type SolicitudRow = {
  tipoSolicitante: 'INDIVIDUAL' | 'ORGANIZACION' | string
  solicitante: string
  identificacion: string
  email: string
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | string
  fecha: string | Date | null
}

@Injectable()
export class SolicitudesVoluntariadoPdfService {
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    table: {
      headerBg: '#F8F9F3',
      row: '#FFFFFF',
      rowAlt: '#FAFAFA',
      headerText: '#5B732E',
      text: '#33361D',
    },
  }

  private readonly LOGO_URL =
    'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png'

  private readonly FOOTER_SPACE = 22

  private safeDateCR(d?: any) {
    if (!d) return '—'
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return String(d)
    return dt.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  private asText(v: any): string {
    if (v === null || v === undefined) return '—'
    const s = String(v).trim()
    return s.length ? s : '—'
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

  private bottom(doc: PDFDoc) {
    return doc.page.height - doc.page.margins.bottom - this.FOOTER_SPACE
  }

  private addHeader(doc: PDFDoc, subtitle: string, logo?: Buffer) {
    const left = 50;
    const right = doc.page.width - 50;

    const headerTop = 32;

    const logoW = 38;
    const gap = 10;

    const titleY = headerTop + 6;
    const subY = titleY + 18;
    const textBlockH = 10 + 18;

    const logoX = left;
    const logoY = headerTop + (textBlockH - logoW) / 2 + 10;
    const textX = logo ? logoX + logoW + gap : left;

    if (logo) {
      try {
        doc.image(logo, logoX, logoY, { width: logoW });
      } catch {}
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.UI.ink)
      .text('CÁMARA DE GANADEROS', textX, titleY, { align: 'left' });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(this.UI.gray)
      .text(subtitle, textX, subY, { align: 'left' });

    doc.font('Helvetica').fontSize(9).fillColor(this.UI.gray);
    doc.text(`Generado: ${new Date().toLocaleString('es-CR')}`, left, titleY, {
      width: right - left,
      align: 'right',
    });

    const lineY = headerTop + textBlockH + 22;
    doc
      .moveTo(left, lineY)
      .lineTo(right, lineY)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .stroke();

    doc.y = lineY + 18;
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

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(this.UI.gray)
      .text(`Generado el ${new Date().toLocaleString('es-CR')}`, left, y, {
        width: right - left,
        align: 'center',
      })
  }

  private addSectionTitle(doc: PDFDoc, title: string) {
    const left = 50
    const y0 = doc.y

    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.UI.ink).text(title, left, y0, {
      lineBreak: false,
    })

    const h = doc.heightOfString(title, { width: doc.page.width - 100 })
    doc.y = y0 + h + 4
  }

  // ✅ Chips de estado (mismos colores del PDF de referencia)
  private drawStatusChip(doc: PDFDoc, x: number, y: number, rawText: string) {
    const text = String(rawText ?? '—').toUpperCase().trim() || '—'
    const padX = 10
    const h = 18
    const r = 9

    doc.font('Helvetica-Bold').fontSize(9)

    const w = Math.max(68, Math.ceil(doc.widthOfString(text) + padX * 2))

    let fill = '#FEF3C7'
    let ink = '#92400E'

    if (text === 'APROBADO') {
      fill = '#E6EDC8'
      ink = '#5A7018'
    } else if (text === 'RECHAZADO') {
      fill = '#F7E9E6'
      ink = '#8C3A33'
    } else if (text === 'PENDIENTE') {
      fill = '#FEF3C7'
      ink = '#92400E'
    }

    doc.roundedRect(x, y, w, h, r).fillColor(fill).fill()
    doc.fillColor(ink).text(text, x + padX, y + 5, {
      width: w - padX * 2,
      align: 'center',
    })

    return w
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
              const acc = arr
                .slice(0, i)
                .reduce((s, cc) => s + Math.floor((cc.w * avail) / sumW), 0)
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

    const radius = 14
    const headerH = 30
    const headerGap = 8
    const padX = 14
    const padY = 10

    const rowFontSize = 9
    const headerFontSize = 8.5

    const bottom = () => this.bottom(doc)

    const measureRowH = (row: any[]) => {
      doc.font('Helvetica').fontSize(rowFontSize)
      const hs = row.map((cell, i) =>
        doc.heightOfString(String(cell ?? '—'), {
          width: cols[i].w - padX * 2,
          align: (cols[i].align as any) ?? 'left',
        }),
      )
      const contentH = Math.max(...hs, 18) // ✅ 18 por chip
      return Math.max(40, Math.ceil(contentH + padY * 2))
    }

    const firstRowH = rows.length ? measureRowH(rows[0]) : 44
    const neededToStart = headerH + headerGap + firstRowH + 16
    if (doc.y + neededToStart > bottom()) doc.addPage()

    let y = doc.y + 6

    // ✅ Header con borde (se mantiene)
    doc
      .roundedRect(left, y, avail, headerH, radius)
      .fillColor(this.UI.table.headerBg)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .fillAndStroke()

    doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(this.UI.table.headerText)
    cols.forEach((c, i) => {
      doc.text(c.title, xs[i] + padX, y + 10, {
        width: c.w - padX * 2,
        align: (c.align as any) ?? 'left',
      })
    })

    y += headerH + headerGap

    if (!rows.length) {
      doc.font('Helvetica').fontSize(9).fillColor('#EF4444')
      doc.text('Sin datos.', left + padX, y + 10)
      doc.y = y + 36
      return
    }

    // índice de columna ESTADO (por title)
    const estadoIdx = cols.findIndex((c) => String(c.title).toUpperCase() === 'ESTADO')

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx]
      const rowH = measureRowH(row)

      if (y + rowH > bottom()) {
        doc.addPage()
        y = doc.page.margins.top

        const headerTop = y
        doc
          .roundedRect(left, headerTop, avail, headerH, radius)
          .fillColor(this.UI.table.headerBg)
          .strokeColor(this.UI.line)
          .lineWidth(1)
          .fillAndStroke()

        doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(this.UI.table.headerText)
        cols.forEach((c, i) => {
          doc.text(c.title, xs[i] + padX, headerTop + 10, {
            width: c.w - padX * 2,
            align: (c.align as any) ?? 'left',
          })
        })

        y = headerTop + headerH + headerGap
      }

      const bg = idx % 2 === 0 ? this.UI.table.row : this.UI.table.rowAlt
      doc.rect(left, y, avail, rowH).fillColor(bg).fill()

      // texto normal
      doc.font('Helvetica').fontSize(rowFontSize).fillColor(this.UI.table.text)

      row.forEach((cell, i) => {
        if (i === estadoIdx) return // ✅ acá dibujamos chip, no texto

        doc.text(String(cell ?? '—'), xs[i] + padX, y + padY, {
          width: cols[i].w - padX * 2,
          align: (cols[i].align as any) ?? 'left',
        })
      })

      // chip estado
      if (estadoIdx >= 0) {
        const chipH = 18
        const chipY = y + Math.floor((rowH - chipH) / 2)
        const chipX = xs[estadoIdx] + padX
        this.drawStatusChip(doc, chipX, chipY, row[estadoIdx])
      }

      y += rowH

      // separador suave
      doc
        .moveTo(left + 12, y)
        .lineTo(right - 12, y)
        .strokeColor(this.UI.line)
        .lineWidth(0.6)
        .stroke()
    }

    doc.y = y + 14
  }

  async generateListadoSolicitudesPDF(params: {
    titulo?: string
    tabActiva?: 'PENDIENTES' | 'APROBADOS'
    filtro?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'TODOS'
    estadoCard?: string
    rows: SolicitudRow[]
  }): Promise<Buffer> {
    const { titulo = 'Solicitudes de Voluntariado', rows } = params

    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch {}

      // ✅ PDF más ancho
      const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (c) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.addHeader(doc, titulo, logoBuffer)

      const tableRows = (rows || []).map((r) => [
        this.asText(String(r.tipoSolicitante || '').toUpperCase()),
        this.asText(r.solicitante),
        this.asText(r.identificacion),
        this.asText(r.email),
        this.asText(String(r.estado || '').toUpperCase()), // ← chip usa esto
        this.asText(this.safeDateCR(r.fecha)),
      ])

      this.addSectionTitle(doc, 'LISTADO DE SOLICITUDES')

      this.addStyledTable(
        doc,
        [
          { title: 'TIPO', w: 120, align: 'center' },
          { title: 'SOLICITANTE', w: 170, align: 'left' },
          { title: 'IDENTIFICACIÓN', w: 120, align: 'center' },
          { title: 'EMAIL', w: 180, align: 'left' },
          { title: 'ESTADO', w: 100, align: 'center' },
          { title: 'FECHA', w: 90, align: 'center' },
        ],
        tableRows,
      )

      this.addFooter(doc)
      doc.end()
    })
  }
}
