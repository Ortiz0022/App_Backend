import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

type VoluntarioRow = {
  tipo: 'INDIVIDUAL' | 'ORGANIZACION' | string
  identificacion: string
  nombre: string
  telefono: string
  email: string
  estado: 'ACTIVO' | 'INACTIVO' | string
}

@Injectable()
export class VoluntariosListadoPdfService {
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    table: {
      headerBg: '#F8F9F3',
      row: '#FFFFFF',
      rowAlt: '#FFFFFF',
      headerText: '#5B732E',
      text: '#111827',
    },
    chipEstado: {
      activo: { bg: '#E6EDC8', text: '#5A7018' },
      inactivo: { bg: '#F7E9E6', text: '#8C3A33' },
      other: { bg: '#EEF2F7', text: '#334155' },
    },
  }

  private readonly LOGO_URL =
    'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png'

  private readonly FOOTER_SPACE = 22

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

  private addHeader(doc: PDFDoc, subtitleLeft: string, logoBuffer?: Buffer) {
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
        // mantener silencioso como en tus otros servicios
      }
    }

    doc.font('Helvetica-Bold').fontSize(16).fillColor(this.UI.ink)
    doc.text('CÁMARA DE GANADEROS', textX, titleY, { align: 'left' })

    doc.font('Helvetica').fontSize(10).fillColor(this.UI.gray)
    doc.text(subtitleLeft, textX, subY, { align: 'left' })

    // fecha a la derecha (igual que Associate)
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

  private drawEstadoChip(doc: PDFDoc, x: number, y: number, textRaw: string, maxW: number) {
    const text = String(textRaw ?? '—').toUpperCase()

    const padX = 12
    const h = 22
    const r = 10

    doc.font('Helvetica-Bold').fontSize(9)

    const idealW = Math.ceil(doc.widthOfString(text) + padX * 2)
    const w = Math.max(56, Math.min(maxW, idealW))

    const theme =
      text === 'ACTIVO'
        ? this.UI.chipEstado.activo
        : text === 'INACTIVO'
          ? this.UI.chipEstado.inactivo
          : this.UI.chipEstado.other

    doc.roundedRect(x, y, w, h, r).fillColor(theme.bg).fill()
    doc.fillColor(theme.text).text(text, x + padX, y + 6, {
      width: w - padX * 2,
      align: 'center',
      ellipsis: true,
      lineBreak: false,
    })
  }

  private addStyledTable(
    doc: PDFDoc,
    columns: Array<{ title: string; w: number; align?: 'left' | 'right' | 'center' }>,
    rows: VoluntarioRow[],
  ) {
    const left = 50
    const right = doc.page.width - 50
    const avail = right - left

    // ===== Ajuste ancho columnas al avail (igual que Associate) =====
    const sumW = columns.reduce((s, c) => s + c.w, 0)
    const cols =
      sumW === avail
        ? columns
        : columns.map((c, i, arr) => {
            const scaled = Math.floor((c.w * avail) / sumW)
            if (i === arr.length - 1) {
              const acc = arr
                .slice(0, i)
                .reduce((s2, cc) => s2 + Math.floor((cc.w * avail) / sumW), 0)
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

    const headerH = 34
    const headerGap = 8
    const padX = 18
    const rowFontSize = 9
    const minRowH = 50

    const bottom = () => this.bottom(doc)

    const drawHeaderRow = (y: number) => {
      // ✅ encabezado redondeado (como pediste)
      doc
        .roundedRect(left, y, avail, headerH, 12)
        .fillColor(this.UI.table.headerBg)
        .strokeColor(this.UI.line)
        .lineWidth(1)
        .fillAndStroke()

      doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.table.headerText)
      cols.forEach((c, i) => {
        doc.text(c.title, xs[i] + padX, y + 12, {
          width: c.w - padX * 2,
          align: c.align ?? 'left',
        })
      })

      // línea inferior suave
      doc
        .moveTo(left, y + headerH)
        .lineTo(right, y + headerH)
        .strokeColor(this.UI.line)
        .lineWidth(1)
        .stroke()
    }

    // ===== altura de fila (similar a tu estilo, pero sin complicarlo) =====
    const measureRowH = (r: VoluntarioRow) => {
      doc.font('Helvetica').fontSize(rowFontSize)
      const hId = doc.heightOfString(String(r.identificacion ?? '—'), { width: cols[1].w - padX * 2 })
      const hNom = doc.heightOfString(String(r.nombre ?? '—'), { width: cols[2].w - padX * 2 })
      const hTel = doc.heightOfString(String(r.telefono ?? '—'), { width: cols[3].w - padX * 2 })
      const hEmail = doc.heightOfString(String(r.email ?? '—'), { width: cols[4].w - padX * 2 })
      const contentH = Math.max(hId, hNom, hTel, hEmail, 22)
      return Math.max(minRowH, Math.ceil(contentH + 24))
    }

    // ✅ NO exigimos que quepa toda la tabla, solo header + 1 fila (patrón sano)
    const firstRowH = rows.length ? measureRowH(rows[0]) : minRowH
    const neededToStart = headerH + headerGap + firstRowH + 10
    if (doc.y + neededToStart > bottom()) doc.addPage()

    // ===== Dibujo =====
    let y = doc.y
    drawHeaderRow(y)
    y += headerH + headerGap

    if (!rows.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#EF4444')
      doc.text('Sin resultados.', left, y + 6)
      doc.y = y + 40
      return
    }

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx]
      const rowH = measureRowH(r)

if (y + rowH > bottom()) {
  doc.addPage()
  y = doc.page.margins.top

  drawHeaderRow(y)
  y += headerH + headerGap
}

      // fondo fila
      doc.rect(left, y, avail, rowH).fillColor(this.UI.table.row).fill()

      // textos
      doc.font('Helvetica').fontSize(rowFontSize).fillColor(this.UI.table.text)
      const textY = y + 17

      doc.text(String(r.tipo ?? '—'), xs[0] + padX, textY, { width: cols[0].w - padX * 2, align: 'left' })
      doc.text(String(r.identificacion ?? '—'), xs[1] + padX, textY, { width: cols[1].w - padX * 2, align: 'left' })
      doc.text(String(r.nombre ?? '—'), xs[2] + padX, textY, { width: cols[2].w - padX * 2, align: 'left' })
      doc.text(String(r.telefono ?? '—'), xs[3] + padX, textY, { width: cols[3].w - padX * 2, align: 'left' })
      doc.text(String(r.email ?? '—'), xs[4] + padX, textY, { width: cols[4].w - padX * 2, align: 'left' })

      // chip estado centrado vertical
      const chipY = y + Math.floor((rowH - 22) / 2)
      const maxChipW = cols[5].w - padX * 2
      this.drawEstadoChip(doc, xs[5] + padX, chipY, r.estado, maxChipW)

      // línea separadora
      y += rowH
      doc
        .moveTo(left, y)
        .lineTo(right, y)
        .strokeColor(this.UI.line)
        .lineWidth(0.8)
        .stroke()
    }

    doc.y = y + 10
  }

  async generateVoluntariosListadoPDF(opts: { titulo?: string; rows: VoluntarioRow[] }): Promise<Buffer> {
    const { titulo = 'Listado de Voluntarios', rows } = opts

    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch {}

      const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (c) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // ✅ Header SOLO 1 vez (primera página)
      this.addHeader(doc, titulo, logoBuffer)

      this.addSectionTitle(doc, 'VOLUNTARIOS')

      // ✅ Tabla (repite solo header de tabla en páginas nuevas, sin header grande)
      this.addStyledTable(
        doc,
        [
          { title: 'TIPO', w: 220, align: 'left' },
          { title: 'IDENTIFICACIÓN', w: 220, align: 'left' },
          { title: 'NOMBRE', w: 320, align: 'left' },
          { title: 'TELÉFONO', w: 170, align: 'left' },
          { title: 'EMAIL', w: 250, align: 'left' },
          { title: 'ESTADO', w: 210, align: 'left' },
        ],
        rows ?? [],
      )

      // ✅ Footer final (y también se dibuja antes de cada salto)
      this.addFooter(doc)
      doc.end()
    })
  }
}
