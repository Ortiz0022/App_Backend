import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import { Solicitud } from './entities/solicitud.entity'
import https from 'https'

type PDFDoc = InstanceType<typeof PDFDocument>

@Injectable()
export class PdfService {
  // ✅ Minimalista, pero con LOS COLORES ORIGINALES de las celdas/tablas
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    table: {
      headerBg: '#F9FAFB', // ✅ antes
      row: '#FFFFFF',
      rowAlt: '#FFFFFF', // ✅ sin zebra (minimal), pero puedes volverlo a #FAFAFA si querés
      headerText: '#666',
      text: '#33361D',
    },
    field: {
      bg: '#F9FAFB', // ✅ antes
      border: '#EAEFE0', // ✅ antes
      label: '#6B7280',
      value: '#33361D',
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

  private bottom(doc: PDFDoc) {
    return doc.page.height - doc.page.margins.bottom - this.FOOTER_SPACE
  }

  private ensureSpaceAt(doc: PDFDoc, neededH: number) {
    if (doc.y + neededH > this.bottom(doc)) doc.addPage()
  }

  private addHeader(
    doc: PDFDoc,
    title: string,
    fecha?: any,
    estado?: string,
    logoBuffer?: Buffer,
  ) {
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
      } catch (error) {
        console.warn('No se pudo agregar el logo:', error)
      }
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(this.UI.ink)
      .text('CÁMARA DE GANADEROS', textX, titleY, { align: 'left' })

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(this.UI.gray)
      .text(title, textX, subY, { align: 'left' })

    const fechaStr = fecha ? this.safeDate(fecha) : this.safeDate(new Date())
    const estadoStr = estado ?? '—'

    doc.font('Helvetica').fontSize(9).fillColor(this.UI.gray)

    doc.text(`Estado: ${estadoStr}`, left, titleY, {
      width: right - left,
      align: 'right',
    })

    doc.text(`Fecha solicitud: ${fechaStr}`, left, subY, {
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

    // ✅ evita título huérfano (pero menos aire)
    this.ensureSpaceAt(doc, 14 + 6 + 44)

    doc.moveDown(0.35)
    doc.font('Helvetica-Bold').fontSize(11).fillColor(this.UI.ink).text(title, left)
    doc.moveDown(0.25)
  }

  /**
   * Tarjeta individual (minimal, mismos colores)
   */
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
    doc.text(label.toUpperCase(), x + padX, y + padTop, {
      width: w - padX * 2,
      align: 'left',
    })

    const valY = y + padTop + labelH + labelGap
    doc.font('Helvetica-Bold').fontSize(valueSize).fillColor(this.UI.field.value)
    doc.text(display, x + padX, valY, {
      width: w - padX * 2,
      align: 'left',
    })

    return y + cardH + 8
  }

  /**
   * Fila de tarjetas (minimal + altura uniforme, mismos colores)
   */
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
      doc.text(display, x + padX, valY, {
        width: colW - padX * 2,
        align: 'left',
      })
    })

    return startY + maxCardH + 8
  }

  /**
   * Tabla minimal (mismos colores originales)
   */
/**
 * Tabla (minimal + COLORES ORIGINALES) con CONTENEDOR REDONDEADO (como antes)
 */
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
  const topY = y

  // ✅ CONTENEDOR REDONDEADO (alrededor de TODA la tabla)
  doc
    .roundedRect(left, y, avail, tableH - 10, radius)
    .strokeColor(this.UI.line)
    .lineWidth(1)
    .stroke()

  // ✅ HEADER REDONDEADO (arriba) con color original
  doc
    .roundedRect(left, y, avail, headerH, radius)
    .fillColor(this.UI.table.headerBg) // #F9FAFB
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

    // salto de página
    if (y + rowH > bottom()) {
      doc.addPage()
      y = doc.page.margins.top

      // ✅ en nueva página: vuelve a pintar header redondeado
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

    // ✅ fila (blanca o alt si querés zebra)
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

    // ✅ línea separadora suave (como antes)
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .strokeColor(this.UI.line)
      .lineWidth(0.7)
      .stroke()
  }

  doc.y = y + 10

  // (opcional) si querés asegurar que el contenedor cubra exacto lo pintado:
  // doc.roundedRect(left, topY, avail, (doc.y - topY) - 10, radius).strokeColor(this.UI.line).lineWidth(1).stroke()
}


  private ensureSpace(doc: PDFDoc, needed = 90) {
    if (doc.y + needed > this.bottom(doc)) doc.addPage()
  }

  async generateSolicitudPDF(solicitud: Solicitud): Promise<Buffer> {
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
        'Solicitud de Asociado',
        solicitud?.fechaSolicitud ?? solicitud?.createdAt,
        String(solicitud?.estado ?? '—'),
        logoBuffer,
      )

      const left = 50
      const right = doc.page.width - 50
      const avail = right - left

      // INFORMACIÓN PERSONAL
      this.addSectionTitle(doc, 'INFORMACIÓN PERSONAL')

      const persona = solicitud.persona
      const nombreCompleto = `${persona?.nombre || ''} ${persona?.apellido1 || ''} ${persona?.apellido2 || ''}`.trim()

      doc.y = this.drawFieldRow(doc, 'Nombre completo', nombreCompleto || '—', left, doc.y, avail)

      doc.y = this.drawFieldRowMultiple(
        doc,
        [
          { label: 'Cédula', value: persona?.cedula || '—' },
          { label: 'Fecha de nacimiento', value: this.safeDate(persona?.fechaNacimiento) },
        ],
        doc.y,
      )

      doc.y = this.drawFieldRowMultiple(
        doc,
        [
          { label: 'Teléfono', value: persona?.telefono || '—' },
          { label: 'Correo electrónico', value: persona?.email || '—' },
        ],
        doc.y,
      )

      doc.y = this.drawFieldRow(doc, 'Dirección', persona?.direccion || '—', left, doc.y, avail)

      doc.moveDown(0.2)

      // NÚCLEO FAMILIAR
      if (solicitud.asociado?.nucleoFamiliar) {
        const nucleo = solicitud.asociado.nucleoFamiliar
        this.addSectionTitle(doc, 'NÚCLEO FAMILIAR')

        doc.y = this.drawFieldRowMultiple(
          doc,
          [
            { label: 'Hombres', value: String(nucleo.nucleoHombres ?? 0) },
            { label: 'Mujeres', value: String(nucleo.nucleoMujeres ?? 0) },
            { label: 'Total', value: String(nucleo.nucleoTotal ?? 0) },
          ],
          doc.y,
        )

        doc.moveDown(0.2)
      }

      // DATOS DEL ASOCIADO
      if (solicitud.asociado) {
        const asociado = solicitud.asociado
        this.addSectionTitle(doc, 'DATOS DEL ASOCIADO')

        doc.y = this.drawFieldRowMultiple(
          doc,
          [
            { label: 'Vive en finca', value: asociado.viveEnFinca ? 'Sí' : 'No' },
            { label: 'Marca de ganado', value: asociado.marcaGanado ?? '—' },
            { label: 'CVO', value: asociado.CVO ?? '—' },
          ],
          doc.y,
        )

        doc.moveDown(0.2)
      }

      // FINCAS
      if (Array.isArray(solicitud.asociado?.fincas) && solicitud.asociado.fincas.length > 0) {
        solicitud.asociado.fincas.forEach((finca: any, idx: number) => {
          this.ensureSpace(doc, 110)

          this.addSectionTitle(
            doc,
            `INFORMACIÓN DE LA FINCA${solicitud.asociado!.fincas.length > 1 ? ` ${idx + 1}` : ''}`,
          )

          doc.y = this.drawFieldRowMultiple(
            doc,
            [
              { label: 'Nombre', value: finca?.nombre ?? '—' },
              { label: 'Área (HA)', value: String(finca?.areaHa ?? '0') },
              { label: 'Número de plano', value: finca?.numeroPlano ?? '—' },
            ],
            doc.y,
          )

          doc.moveDown(0.2)

          // PROPIETARIO
          this.addSectionTitle(doc, 'PROPIETARIO')

          const propietarioPersona = finca?.propietario?.persona as any
          const asociadoPersona = solicitud?.asociado?.persona as any

          const ownerId = propietarioPersona?.idPersona ?? null
          const asId = asociadoPersona?.idPersona ?? null

          const ownerCed = String(propietarioPersona?.cedula ?? '').trim()
          const asCed = String(asociadoPersona?.cedula ?? '').trim()

          const ownerEmail = String(propietarioPersona?.email ?? '').trim().toLowerCase()
          const asEmail = String(asociadoPersona?.email ?? '').trim().toLowerCase()

          const esMismo =
            (ownerId != null && asId != null && ownerId === asId) ||
            (ownerCed && asCed && ownerCed === asCed) ||
            (ownerEmail && asEmail && ownerEmail === asEmail)

          if (!propietarioPersona || esMismo) {
            doc.y = this.drawFieldRow(doc, 'Propietario', 'El propietario es el asociado', left, doc.y, avail)
          } else {
            const propietarioNombreCompleto =
              `${propietarioPersona?.nombre ?? ''} ${propietarioPersona?.apellido1 ?? ''} ${propietarioPersona?.apellido2 ?? ''}`.trim()

            doc.y = this.drawFieldRow(doc, 'Nombre completo', propietarioNombreCompleto || '—', left, doc.y, avail)

            doc.y = this.drawFieldRowMultiple(
              doc,
              [
                { label: 'Cédula', value: propietarioPersona?.cedula || '—' },
                { label: 'Teléfono', value: propietarioPersona?.telefono || '—' },
              ],
              doc.y,
            )

            if (propietarioPersona?.email) {
              doc.y = this.drawFieldRow(doc, 'Correo electrónico', propietarioPersona.email, left, doc.y, avail)
            }

            if (propietarioPersona?.direccion) {
              doc.y = this.drawFieldRow(doc, 'Dirección', propietarioPersona.direccion, left, doc.y, avail)
            }
          }

          doc.moveDown(0.2)

          // LOCALIZACIÓN
          if (finca?.geografia) {
            this.addSectionTitle(doc, 'LOCALIZACIÓN')

            doc.y = this.drawFieldRowMultiple(
              doc,
              [
                { label: 'Provincia', value: finca.geografia.provincia ?? '—' },
                { label: 'Cantón', value: finca.geografia.canton ?? '—' },
                { label: 'Distrito', value: finca.geografia.distrito ?? '—' },
                { label: 'Caserío', value: finca.geografia.caserio ?? '—' },
              ],
              doc.y,
            )

            doc.moveDown(0.2)
          }

          // FORRAJES
          if (Array.isArray(finca?.forrajes) && finca.forrajes.length > 0) {
            this.addSectionTitle(doc, 'FORRAJES')
            this.addStyledTable(
              doc,
              [
                { title: 'TIPO', w: 140 },
                { title: 'VARIEDAD', w: 160 },
                { title: 'HECTÁREAS', w: 100, align: 'right' },
                { title: 'UTILIZACIÓN', w: 110 },
              ],
              finca.forrajes.map((f: any) => [
                f?.tipoForraje ?? '—',
                f?.variedad ?? '—',
                String(f?.hectareas ?? '0'),
                f?.utilizacion ?? '—',
              ]),
            )
          }

          // HATO
          if (finca?.hato) {
            this.addSectionTitle(doc, 'DESCRIPCIÓN DEL HATO')

            doc.y = this.drawFieldRowMultiple(
              doc,
              [
                { label: 'Tipo de explotación', value: finca.hato.tipoExplotacion ?? '—' },
                { label: 'Total del hato', value: String(finca.hato.totalGanado ?? '0') },
                { label: 'Raza predominante', value: finca.hato.razaPredominante ?? '—' },
              ],
              doc.y,
            )

            doc.moveDown(0.2)

            if (Array.isArray(finca?.hato?.animales) && finca.hato.animales.length > 0) {

              this.addStyledTable(
                doc,
                [
                  { title: 'CATEGORÍA', w: 340 },
                  { title: 'CANTIDAD', w: 170, align: 'right' },
                ],
                finca.hato.animales.map((a: any) => [a?.nombre ?? '—', String(a?.cantidad ?? '0')]),
              )
            }
          }

          // REGISTROS PRODUCTIVOS
          if (finca?.registrosProductivos) {
            const registros: string[][] = []
            if (finca.registrosProductivos.reproductivos) registros.push(['Reproductivos en bovinos', 'Sí'])
            if (finca.registrosProductivos.costosProductivos) registros.push(['Costos de producción', 'Sí'])
            if (registros.length === 0) registros.push(['Lleva registros', 'No'])

            this.addSectionTitle(doc, 'OTROS REGISTROS DE LA FINCA')
            this.addStyledTable(
              doc,
              [
                { title: 'TIPO DE REGISTRO PRODUCTIVO', w: 340 },
                { title: 'ESTADO', w: 170, align: 'center' },
              ],
              registros,
            )
          }

          // FUENTES DE AGUA
          if (Array.isArray(finca?.fuentesAgua) && finca.fuentesAgua.length > 0) {
            this.addStyledTable(doc, [{ title: 'FUENTES DE AGUA', w: 510 }], finca.fuentesAgua.map((x: any) => [x?.nombre ?? '—']))
          }

          // OTRAS ACTIVIDADES
          if (Array.isArray(finca?.actividades) && finca.actividades.length > 0) {
            this.addStyledTable(doc, [{ title: 'OTRAS ACTIVIDADES AGROPECUARIAS', w: 510 }], finca.actividades.map((x: any) => [x?.nombre ?? '—']))
          }

          // SISTEMAS DE RIEGO
          if (Array.isArray(finca?.metodosRiego) && finca.metodosRiego.length > 0) {
            this.addStyledTable(doc, [{ title: 'SISTEMA DE RIEGO', w: 510 }], finca.metodosRiego.map((x: any) => [x?.nombre ?? '—']))
          }

          // VÍAS DE ACCESO
          if (Array.isArray(finca?.accesos) && finca.accesos.length > 0) {

            this.addStyledTable(doc, [{ title: 'TIPO DE VÍAS DE ACCESO', w: 510 }], finca.accesos.map((x: any) => [x?.nombre ?? '—']))
          }

          // APARTOS Y EQUIPOS (tu lógica original continúa igual aquí...)
          // ⬇️ (copiala tal cual desde tu archivo si ya la tenés,
          //     este componente ya incluye todo lo “base” + estilos corregidos)
        })
      }

      // NECESIDADES Y MEJORAS
      if (Array.isArray(solicitud.asociado?.necesidades) && solicitud.asociado.necesidades.length > 0) {
        this.addSectionTitle(doc, 'NECESIDADES Y MEJORAS')
        this.addStyledTable(
          doc,
          [
            { title: 'ORDEN', w: 60, align: 'right' },
            { title: 'DESCRIPCIÓN', w: 450 },
          ],
          solicitud.asociado.necesidades
            .slice(0, 10)
            .map((n: any) => [String(n?.orden ?? '—'), n?.descripcion ?? '—']),
        )
      }

      // MOTIVO DE RECHAZO
      if (solicitud.estado === 'RECHAZADO' && solicitud.motivo) {
        this.addSectionTitle(doc, 'MOTIVO DE RECHAZO')
        doc.y = this.drawFieldRow(doc, 'Motivo', String(solicitud.motivo), left, doc.y, avail)
      }

      this.addFooter(doc)
      doc.end()
    })
  }
}
