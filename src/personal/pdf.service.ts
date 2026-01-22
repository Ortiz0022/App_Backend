import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

@Injectable()
export class PersonalPdfService {
  // ✅ MISMO estilo que el de associates (solo agrego "field" para suavizar)
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
    field: {
      bg: '#F9FAFB',     // fondo suave del campo
      border: '#EAEFE0', // borde suave
      label: '#6B7280',  // label grisito
      value: '#33361D',  // valor fuerte
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
    doc.moveDown(0.5)
  }

  /**
   * ✅ CAMBIO PRINCIPAL:
   * Campo "suave" tipo tarjeta:
   * - etiqueta pequeña gris
   * - valor más oscuro y semi-bold
   * - fondo claro + borde + radius
   */
  private drawFieldRow(
    doc: PDFDoc,
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
  ) {
    const padX = 10
    const padTop = 8
    const padBottom = 10
    const labelGap = 3

    const labelSize = 8
    const valueSize = 10

    const display = value?.trim() ? value.trim() : '—'

    // medir alturas reales según wrapping
    doc.font('Helvetica').fontSize(labelSize)
    const labelH = doc.heightOfString(label.toUpperCase(), { width: w - padX * 2 })

    doc.font('Helvetica-Bold').fontSize(valueSize)
    const valueH = doc.heightOfString(display, { width: w - padX * 2 })

    const cardH = padTop + labelH + labelGap + valueH + padBottom

    // tarjeta (fondo + borde + radius)
    doc
      .roundedRect(x, y, w, cardH, 10)
      .fillColor(this.UI.field.bg)
      .strokeColor(this.UI.field.border)
      .lineWidth(1)
      .fillAndStroke()

    // label
    doc.font('Helvetica').fontSize(labelSize).fillColor(this.UI.field.label)
    doc.text(label.toUpperCase(), x + padX, y + padTop, {
      width: w - padX * 2,
      align: 'left',
    })

    // value (semi-bold)
    const valY = y + padTop + labelH + labelGap
    doc.font('Helvetica-Bold').fontSize(valueSize).fillColor(this.UI.field.value)
    doc.text(display, x + padX, valY, {
      width: w - padX * 2,
      align: 'left',
    })

    // espacio entre campos
    return y + cardH + 10
  }

  private normalize(person: any) {
    const name = person?.name ?? person?.nombre ?? ''
    const lastname1 = person?.lastname1 ?? person?.apellido1 ?? ''
    const lastname2 = person?.lastname2 ?? person?.apellido2 ?? ''

    const IDE = person?.IDE ?? person?.cedula ?? person?.identificacion ?? '—'
    const phone = person?.phone ?? person?.telefono ?? '—'
    const email = person?.email ?? '—'
    const direction = person?.direction ?? person?.direccion ?? '—'

    const occupation = person?.occupation ?? person?.puesto ?? '—'

    const isActive =
      typeof person?.isActive === 'boolean'
        ? person.isActive
        : typeof person?.estado === 'boolean'
          ? person.estado
          : undefined

    const estadoTexto =
      typeof person?.estado === 'string'
        ? person.estado
        : isActive === undefined
          ? '—'
          : isActive
            ? 'Activo'
            : 'Inactivo'

    const birthDate = person?.birthDate ?? person?.fechaNacimiento ?? null
    const startWorkDate = person?.startWorkDate ?? person?.fechaInicioLaboral ?? null
    const endWorkDate = person?.endWorkDate ?? person?.fechaSalida ?? null

    const fullName = `${name} ${lastname1} ${lastname2}`.trim() || '—'

    return {
      fullName,
      name,
      lastname1,
      lastname2,
      IDE,
      phone,
      email,
      direction,
      occupation,
      estadoTexto,
      isActive,
      birthDate,
      startWorkDate,
      endWorkDate,
    }
  }

  // ==========================================================
  // ✅ PDF INDIVIDUAL
  // ==========================================================
  async generatePersonalPDF(opts: { person: any }): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch (e) {
        console.warn('⚠️ No se pudo descargar el logo:', e)
      }

      const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (c) => chunks.push(c as Buffer))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const p = this.normalize(opts.person)

      this.addHeader(doc, 'Información del Personal', logoBuffer)

      this.addSectionTitle(doc, '1. INFORMACIÓN PERSONAL')

      const left = 50
      const right = doc.page.width - 50
      const avail = right - left
      const colGap = 18
      const colW = Math.floor((avail - colGap) / 2)

      // Nombre completo (full)
      doc.y = this.drawFieldRow(doc, 'Nombre completo', p.fullName, left, doc.y, avail)

      // Cédula / Fecha nacimiento
      const y1 = doc.y
      const yA = this.drawFieldRow(doc, 'Cédula', String(p.IDE ?? '—'), left, y1, colW)
      const yB = this.drawFieldRow(
        doc,
        'Fecha de nacimiento',
        this.safeDate(p.birthDate),
        left + colW + colGap,
        y1,
        colW,
      )
      doc.y = Math.max(yA, yB)

      // Teléfono / Email
      const y2 = doc.y
      const yC = this.drawFieldRow(doc, 'Teléfono', String(p.phone ?? '—'), left, y2, colW)
      const yD = this.drawFieldRow(
        doc,
        'Correo electrónico',
        String(p.email ?? '—'),
        left + colW + colGap,
        y2,
        colW,
      )
      doc.y = Math.max(yC, yD)

      // Dirección (full)
      doc.y = this.drawFieldRow(doc, 'Dirección', String(p.direction ?? '—'), left, doc.y, avail)

      doc.moveDown(0.4)

      this.addSectionTitle(doc, '2. INFORMACIÓN LABORAL')

      // Puesto (full)
      doc.y = this.drawFieldRow(doc, 'Puesto', String(p.occupation ?? '—'), left, doc.y, avail)

      // Estado / Fecha inicio
      const y3 = doc.y
      const yE = this.drawFieldRow(doc, 'Estado', String(p.estadoTexto ?? '—'), left, y3, colW)
      const yF = this.drawFieldRow(
        doc,
        'Fecha de inicio laboral',
        this.safeDate(p.startWorkDate),
        left + colW + colGap,
        y3,
        colW,
      )
      doc.y = Math.max(yE, yF)

      // Fecha de salida si aplica
      if (p.isActive === false && p.endWorkDate) {
        doc.y = this.drawFieldRow(doc, 'Fecha de salida', this.safeDate(p.endWorkDate), left, doc.y, colW)
      }

      this.addFooter(doc)
      doc.end()
    })
  }

  // ==========================================================
  // ✅ PDF LISTADO (tabla igual a associates)
  // ==========================================================
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

  async generatePersonalListPDF(opts: { people: any[]; filterText?: string }): Promise<Buffer> {
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

      this.addHeader(doc, 'Listado del Personal', logoBuffer)
      this.addSectionTitle(doc, 'PERSONAL')

      if (opts.filterText?.trim()) {
        const left = 50
        const right = doc.page.width - 50

        doc.rect(left, doc.y, right - left, 18).fillColor('#FAFAFA').fill()
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(this.UI.gray)
        doc.text(`Filtro aplicado: ${opts.filterText.trim()}`, left + 8, doc.y - 14)
        doc.moveDown(1.2)
      }

      const rows = (opts.people ?? []).map((raw) => {
        const p = this.normalize(raw)
        return [
          p.IDE,
          p.fullName,
          p.phone,
          p.email,
          p.occupation,
          p.estadoTexto,
          this.safeDate(p.startWorkDate),
        ]
      })

      this.addStyledTable(
        doc,
        [
          { title: 'CÉDULA', w: 95 },
          { title: 'NOMBRE', w: 190 },
          { title: 'TELÉFONO', w: 120 },
          { title: 'EMAIL', w: 210 },
          { title: 'PUESTO', w: 160 },
          { title: 'ESTADO', w: 90, align: 'center' },
          { title: 'INICIO', w: 95, align: 'center' },
        ],
        rows,
      )

      this.addFooter(doc)
      doc.end()
    })
  }
}
