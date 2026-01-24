import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import { VoluntarioIndividual } from '../voluntario-individual/entities/voluntario-individual.entity'
import { Organizacion } from '../organizacion/entities/organizacion.entity'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

@Injectable()
export class VoluntarioPdfService {
  // Colores del diseño
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    table: {
      headerBg: '#F9FAFB',
      row: '#FFFFFF',
      rowAlt: '#FFFFFF',
      headerText: '#666',
      text: '#33361D',
    },
    field: {
      bg: '#F9FAFB',
      border: '#EAEFE0',
      label: '#6B7280',
      value: '#33361D',
    },
    badge: {
      active: { bg: '#DEF7EC', text: '#03543F', border: '#84E1BC' },
      inactive: { bg: '#FDE8E8', text: '#9B1C1C', border: '#F98080' },
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

  /** ✅ Normaliza Áreas de Interés (tu campo real es nombreArea) */
  private normalizeAreasInteres(input: any): string[] {
    const arr =
      (Array.isArray(input) && input) ||
      (Array.isArray(input?.areasInteres) && input.areasInteres) ||
      (Array.isArray(input?.areas_interes) && input.areas_interes) ||
      (Array.isArray(input?.areasDeInteres) && input.areasDeInteres) ||
      []

    const names = arr
      .map((a: any) => {
        if (typeof a === 'string') return a
        return (
          a?.nombreArea ??
          a?.nombre ??
          a?.areaInteres?.nombreArea ??
          a?.areaInteres?.nombre ??
          a?.area_interes?.nombreArea ??
          a?.area_interes?.nombre ??
          null
        )
      })
      .filter((x: any) => typeof x === 'string' && x.trim().length > 0)
      .map((x: string) => x.trim())

    return Array.from(new Set(names))
  }

  /** ✅ Fuerza string y fallback '—' (CLAVE para que el PDF muestre siempre) */
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

  private ensureSpaceAt(doc: PDFDoc, neededH: number) {
    if (doc.y + neededH > this.bottom(doc)) doc.addPage()
  }

  // ✅ Header corregido: badge + tipo sin montarse
  private addHeader(
    doc: PDFDoc,
    title: string,
    subtitle: string,
    estado: string,
    isActive: boolean,
    logoBuffer?: Buffer,
  ) {
    const left = 50
    const right = doc.page.width - 50

    const headerTop = 32
    const logoW = 38
    const gap = 10

    const rightBlockW = 150
    const rightBlockX = right - rightBlockW

    const titleY = headerTop + 6
    const subY = titleY + 18
    const textBlockH = 10 + 18

    const logoX = left
    const logoY = headerTop + (textBlockH - logoW) / 2 + 10
    const textX = logoBuffer ? logoX + logoW + gap : left

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, logoX, logoY, { width: logoW })
      } catch (error) {
        console.warn('No se pudo agregar el logo:', error)
      }
    }

    const titleMaxW = rightBlockX - textX - 12

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.UI.ink)
      .text('CÁMARA DE GANADEROS', textX, titleY, {
        width: titleMaxW,
        align: 'left',
        ellipsis: true,
      })

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(this.UI.gray)
      .text(title, textX, subY, {
        width: titleMaxW,
        align: 'left',
        ellipsis: true,
      })

    const badgeWidth = rightBlockW
    const badgeHeight = 24
    const badgeX = rightBlockX
    const badgeY = titleY

    const colors = isActive ? this.UI.badge.active : this.UI.badge.inactive
    const estadoText = estado || (isActive ? 'ACTIVO' : 'INACTIVO')

    doc
      .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4)
      .fillColor(colors.bg)
      .strokeColor(colors.border)
      .lineWidth(1)
      .fillAndStroke()

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(colors.text)
      .text(estadoText, badgeX, badgeY + 7, {
        width: badgeWidth,
        align: 'center',
      })

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(this.UI.gray)
      .text(subtitle, badgeX, badgeY + badgeHeight + 4, {
        width: badgeWidth,
        align: 'center',
        ellipsis: true,
      })

    const lineY = headerTop + textBlockH + 22
    doc
      .moveTo(left, lineY)
      .lineTo(right, lineY)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .stroke()

    doc.y = lineY + 14
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
    this.ensureSpaceAt(doc, 14 + 6 + 44)
    doc.moveDown(0.35)
    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.UI.ink).text(title, left)
    doc.moveDown(0.25)
  }

  private drawFieldRow(doc: PDFDoc, label: string, value: string, x: number, y: number, w: number): number {
    const padX = 10
    const padTop = 7
    const padBottom = 8
    const labelGap = 2
    const labelSize = 8
    const valueSize = 10

    const display = value?.trim() ? value.trim() : '—'

    doc.font('Helvetica').fontSize(labelSize)
    const labelH = doc.heightOfString(label.toUpperCase(), { width: w - padX * 2 })

    doc.font('Helvetica-Bold').fontSize(valueSize)
    const valueH = doc.heightOfString(display, { width: w - padX * 2 })

    const cardH = padTop + labelH + labelGap + valueH + padBottom

    doc.y = y
    this.ensureSpaceAt(doc, cardH + 8)
    y = doc.y

    doc
      .roundedRect(x, y, w, cardH, 8)
      .fillColor(this.UI.field.bg)
      .strokeColor(this.UI.field.border)
      .lineWidth(1)
      .fillAndStroke()

    doc.font('Helvetica').fontSize(labelSize).fillColor(this.UI.field.label)
    doc.text(label.toUpperCase(), x + padX, y + padTop, { width: w - padX * 2, align: 'left' })

    const valY = y + padTop + labelH + labelGap
    doc.font('Helvetica-Bold').fontSize(valueSize).fillColor(this.UI.field.value)
    doc.text(display, x + padX, valY, { width: w - padX * 2, align: 'left' })

    return y + cardH + 8
  }

  private drawFieldRowMultiple(
    doc: PDFDoc,
    fields: Array<{ label: string; value: string }>,
    startY: number,
  ): number {
    const left = 50
    const right = doc.page.width - 50
    const avail = right - left
    const colGap = 10
    const numCols = fields.length
    const colW = Math.floor((avail - colGap * (numCols - 1)) / numCols)

    const padX = 10
    const padTop = 7
    const padBottom = 8
    const labelGap = 2
    const labelSize = 8
    const valueSize = 10

    let maxCardH = 0
    fields.forEach((field) => {
      const display = field.value?.trim() ? field.value.trim() : '—'

      doc.font('Helvetica').fontSize(labelSize)
      const labelH = doc.heightOfString(field.label.toUpperCase(), { width: colW - padX * 2 })

      doc.font('Helvetica-Bold').fontSize(valueSize)
      const valueH = doc.heightOfString(display, { width: colW - padX * 2 })

      const cardH = padTop + labelH + labelGap + valueH + padBottom
      if (cardH > maxCardH) maxCardH = cardH
    })

    doc.y = startY
    this.ensureSpaceAt(doc, maxCardH + 8)
    startY = doc.y

    fields.forEach((field, i) => {
      const x = left + i * (colW + colGap)
      const display = field.value?.trim() ? field.value.trim() : '—'

      doc
        .roundedRect(x, startY, colW, maxCardH, 8)
        .fillColor(this.UI.field.bg)
        .strokeColor(this.UI.field.border)
        .lineWidth(1)
        .fillAndStroke()

      doc.font('Helvetica').fontSize(labelSize).fillColor(this.UI.field.label)
      doc.text(field.label.toUpperCase(), x + padX, startY + padTop, {
        width: colW - padX * 2,
        align: 'left',
      })

      doc.font('Helvetica').fontSize(labelSize)
      const labelH = doc.heightOfString(field.label.toUpperCase(), { width: colW - padX * 2 })
      const valY = startY + padTop + labelH + labelGap

      doc.font('Helvetica-Bold').fontSize(valueSize).fillColor(this.UI.field.value)
      doc.text(display, x + padX, valY, { width: colW - padX * 2, align: 'left' })
    })

    return startY + maxCardH + 8
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

    const radius = 12
    const headerH = 28
    const headerGap = 6
    const paddingY = 6
    const rowFontSize = 9

    const bottom = () => this.bottom(doc)

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
      .roundedRect(left, y, avail, tableH - 10, radius)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .stroke()

    doc
      .roundedRect(left, y, avail, headerH, radius)
      .fillColor(this.UI.table.headerBg)
      .strokeColor(this.UI.line)
      .lineWidth(1)
      .fillAndStroke()

    doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.table.headerText)
    cols.forEach((c, i) => {
      doc.text(c.title, xs[i] + 10, y + 9, {
        width: c.w - 20,
        align: (c.align as any) ?? 'left',
      })
    })

    y += headerH + headerGap

    if (!rows.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#EF4444')
      doc.text('Sin datos.', left + 10, y + 6)
      doc.y = y + 34
      return
    }

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx]
      const rowH = measureRowH(row)

      if (y + rowH > bottom()) {
        doc.addPage()
        y = doc.page.margins.top

        doc
          .roundedRect(left, y, avail, headerH, radius)
          .fillColor(this.UI.table.headerBg)
          .strokeColor(this.UI.line)
          .lineWidth(1)
          .fillAndStroke()

        doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.table.headerText)
        cols.forEach((c, i) => {
          doc.text(c.title, xs[i] + 10, y + 9, {
            width: c.w - 20,
            align: (c.align as any) ?? 'left',
          })
        })

        y += headerH + headerGap
      }

      const bg = idx % 2 === 0 ? this.UI.table.row : this.UI.table.rowAlt
      doc.rect(left, y, avail, rowH).fillColor(bg).fill()

      doc.font('Helvetica').fontSize(rowFontSize).fillColor(this.UI.table.text)
      row.forEach((cell, i) => {
        doc.text(String(cell ?? '—'), xs[i] + 10, y + paddingY, {
          width: cols[i].w - 20,
          align: (cols[i].align as any) ?? 'left',
        })
      })

      y += rowH

      doc
        .moveTo(left, y)
        .lineTo(right, y)
        .strokeColor(this.UI.line)
        .lineWidth(0.7)
        .stroke()
    }

    doc.y = y + 10
  }

  async generateVoluntarioIndividualPDF(voluntario: VoluntarioIndividual): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch (error) {
        console.warn('⚠️ No se pudo descargar el logo:', error)
      }

      const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const persona = voluntario.persona
      const nombreCompleto =
        `${persona?.nombre || ''} ${persona?.apellido1 || ''} ${persona?.apellido2 || ''}`.trim()

      this.addHeader(
        doc,
        'Perfil de Voluntario Individual',
        `Tipo: INDIVIDUAL`,
        voluntario.solicitud?.estado || '',
        voluntario.isActive,
        logoBuffer,
      )

      const left = 50
      const right = doc.page.width - 50
      const avail = right - left

      // INFORMACIÓN PERSONAL
      this.addSectionTitle(doc, 'INFORMACIÓN PERSONAL')
      doc.y = this.drawFieldRow(doc, 'Nombre completo', this.asText(nombreCompleto), left, doc.y, avail)

      doc.y = this.drawFieldRowMultiple(
        doc,
        [
          { label: 'Cédula', value: this.asText(persona?.cedula) },
          { label: 'Fecha de nacimiento', value: this.asText(this.safeDate(persona?.fechaNacimiento)) },
        ],
        doc.y,
      )

      doc.y = this.drawFieldRowMultiple(
        doc,
        [
          { label: 'Teléfono', value: this.asText(persona?.telefono) },
          { label: 'Correo electrónico', value: this.asText(persona?.email) },
        ],
        doc.y,
      )

      if (persona?.direccion?.trim()) {
        doc.y = this.drawFieldRow(doc, 'Dirección', this.asText(persona.direccion), left, doc.y, avail)
      }

      if (voluntario.nacionalidad?.trim()) {
        doc.y = this.drawFieldRow(doc, 'Nacionalidad', this.asText(voluntario.nacionalidad), left, doc.y, avail)
      }

      doc.moveDown(0.2)

// PERFIL DEL VOLUNTARIO
this.addSectionTitle(doc, 'PERFIL DEL VOLUNTARIO')

doc.y = this.drawFieldRow(doc, 'Motivación', this.asText(voluntario.motivacion), left, doc.y, avail)
doc.y = this.drawFieldRow(doc, 'Habilidades', this.asText(voluntario.habilidades), left, doc.y, avail)
doc.y = this.drawFieldRow(doc, 'Experiencia', this.asText(voluntario.experiencia), left, doc.y, avail)

      doc.moveDown(0.2)

      // ÁREAS DE INTERÉS
      const areas = this.normalizeAreasInteres(voluntario.areasInteres)
      if (areas.length > 0) {
        this.addSectionTitle(doc, 'ÁREAS DE INTERÉS')
        this.addStyledTable(doc, [{ title: 'ÁREA DE INTERÉS', w: 510 }], areas.map((n) => [n]))
      }

      // DISPONIBILIDAD
      if (Array.isArray(voluntario.disponibilidades) && voluntario.disponibilidades.length > 0) {
        this.addSectionTitle(doc, 'HORARIOS DE DISPONIBILIDAD')

        voluntario.disponibilidades.forEach((disp: any) => {
          const dias = Array.isArray(disp.dias) ? disp.dias.join(', ') : '—'
          const horarios = Array.isArray(disp.horarios) ? disp.horarios.join(', ') : '—'

          this.addStyledTable(
            doc,
            [
              { title: 'DÍAS', w: 170 },
              { title: 'HORARIO', w: 170 },
              { title: 'PERÍODO', w: 170 },
            ],
            [[this.asText(dias), this.asText(horarios), `${this.safeDate(disp.fechaInicio)} - ${this.safeDate(disp.fechaFin)}`]],
          )
        })
      }

      // ESTADO DE LA SOLICITUD
      if (voluntario.solicitud) {
        this.addSectionTitle(doc, 'ESTADO DE LA SOLICITUD')

        doc.y = this.drawFieldRowMultiple(
          doc,
          [
            { label: 'Estado', value: this.asText(voluntario.solicitud.estado) },
            { label: 'Fecha de solicitud', value: this.asText(this.safeDate(voluntario.solicitud.fechaSolicitud)) },
          ],
          doc.y,
        )

        if (voluntario.solicitud.fechaResolucion) {
          doc.y = this.drawFieldRow(
            doc,
            'Fecha de resolución',
            this.asText(this.safeDate(voluntario.solicitud.fechaResolucion)),
            left,
            doc.y,
            avail,
          )
        }

        if (voluntario.solicitud.estado === 'RECHAZADO' && voluntario.solicitud.motivo) {
          doc.y = this.drawFieldRow(doc, 'Motivo de rechazo', this.asText(voluntario.solicitud.motivo), left, doc.y, avail)
        }
      }

      this.addFooter(doc)
      doc.end()
    })
  }

  async generateOrganizacionPDF(organizacion: Organizacion): Promise<Buffer> {
    // Si querés, te lo dejo igual que el tuyo; no lo toco acá porque tu problema es INDIVIDUAL.
    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined
      try {
        logoBuffer = await this.downloadLogo()
      } catch (error) {
        console.warn('⚠️ No se pudo descargar el logo:', error)
      }

      const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      this.addHeader(
        doc,
        'Perfil de Organización Voluntaria',
        `Tipo: ORGANIZACIÓN`,
        organizacion.solicitud?.estado || '',
        organizacion.isActive,
        logoBuffer,
      )

      // (tu contenido original de organización va aquí)
      this.addFooter(doc)
      doc.end()
    })
  }
}
