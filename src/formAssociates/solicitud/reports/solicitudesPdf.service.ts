import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import https from 'https';
import { SolicitudStatus } from '../dto/solicitud-status.enum';

type PDFDoc = InstanceType<typeof PDFDocument>;

@Injectable()
export class SolicitudesListPdfService {
  private readonly UI = {
    ink: '#33361D',
    gray: '#666',
    line: '#EAEFE0',
    softBg: '#F8F9F3',
    table: {
      headerBg: '#F8F9F3',
      headerText: '#5B732E',
      rowAlt: '#FAFAFA',
      text: '#33361D',
    },
  };

  private readonly LOGO_URL =
    'https://res.cloudinary.com/dyigmavwq/image/upload/v1760638578/logo-camara_fw64kt.png';

  private safeDate(d?: any) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(+dt)) return '—';
    return dt.toLocaleDateString('es-CR');
  }

  private async downloadLogo(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      https
        .get(this.LOGO_URL, (response) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        })
        .on('error', reject);
    });
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

  private addSectionTitle(doc: PDFDoc, title: string) {
    const left = 50;
    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(this.UI.ink).text(title, left);
    doc.moveDown(0.6);
  }

  private drawStatusChip(doc: PDFDoc, x: number, y: number, text: string) {
    const padX = 10;
    const h = 18;
    doc.font('Helvetica-Bold').fontSize(9);

    const w = doc.widthOfString(text) + padX * 2;

    let fill = '#FEF3C7'; // pendiente
    let ink = '#92400E';

    if (text === 'APROBADO') {
      fill = '#E6EDC8';
      ink = '#5A7018';
    } else if (text === 'RECHAZADO') {
      fill = '#F7E9E6';
      ink = '#8C3A33';
    }

    doc.roundedRect(x, y, w, h, 9).fillColor(fill).fill();
    doc.fillColor(ink).text(text, x + padX, y + 5, { width: w - padX * 2, align: 'center' });

    return w;
  }

  

  async generateSolicitudesListPDF(opts: {
    solicitudes: any[];
    filterText?: string;
  }): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      let logoBuffer: Buffer | undefined;
      try {
        logoBuffer = await this.downloadLogo();
      } catch {}

      const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.addHeader(doc, 'Listado de Solicitudes', logoBuffer);

      // “Filtro aplicado”
      if (opts.filterText?.trim()) {
        const left = 50;
        const right = doc.page.width - 50;

        const y = doc.y;
        doc.rect(left, y, right - left, 18).fillColor('#FAFAFA').fill();
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(this.UI.gray);
        doc.text(`Filtro aplicado: ${opts.filterText.trim()}`, left + 8, y + 5);
        doc.y = y + 26;
      }

      this.addSectionTitle(doc, 'SOLICITUDES');

      const left = 50;
      const right = doc.page.width - 50;
      const avail = right - left;

      // Header row
      const headerH = 28;

      // Column layout (similar a la foto)
      const cols = [
        { key: 'cedula', title: 'CÉDULA', w: 140 },
        { key: 'nombre', title: 'NOMBRE', w: 260 },
        { key: 'telefono', title: 'TELÉFONO', w: 140 },
        { key: 'email', title: 'EMAIL', w: 240 },
        { key: 'estado', title: 'ESTADO', w: 140 },
        { key: 'fecha', title: 'FECHA', w: 140 },
      ];

      // Ajustar ancho a avail
      const sumW = cols.reduce((s, c) => s + c.w, 0);
      const scale = avail / sumW;
      cols.forEach((c) => (c.w = Math.floor(c.w * scale)));
      const used = cols.slice(0, -1).reduce((s, c) => s + c.w, 0);
      cols[cols.length - 1].w = avail - used;

      // X positions
      const xs: number[] = [];
      let ax = left;
      for (const c of cols) {
        xs.push(ax);
        ax += c.w;
      }

      // ====== Medidas de celdas ======
      const paddingX = 14;
      const paddingY = 10; // ✅ más aire vertical para que no “choque” el texto
      const bodyFontSize = 10;
      const minRowH = 40; // ✅ altura mínima (como ya tenías)

      const bottom = () => doc.page.height - doc.page.margins.bottom - 24;

      const drawTableHeader = (topY: number) => {
        doc
          .roundedRect(left, topY, avail, headerH, 14)
          .fillColor(this.UI.table.headerBg)
          .strokeColor(this.UI.line)
          .lineWidth(1)
          .fillAndStroke();

        doc.font('Helvetica-Bold').fontSize(9).fillColor(this.UI.table.headerText);
        cols.forEach((c, i) => {
          doc.text(c.title, xs[i] + paddingX, topY + 9, {
            width: c.w - paddingX * 2,
            align: 'left',
          });
        });
      };

      // Contenedor redondeado (tarjeta)
      const tableTopY = doc.y;
      drawTableHeader(tableTopY);

      let y = tableTopY + headerH;

      const rows = Array.isArray(opts.solicitudes) ? opts.solicitudes : [];
      if (!rows.length) {
        doc.font('Helvetica').fontSize(10).fillColor('#EF4444');
        doc.text('Sin resultados.', left, y + 12);
        doc.end();
        return;
      }

      // ✅ calcula alto dinámico de fila (por wrap)
      const measureRowH = (values: {
        cedula: string;
        nombre: string;
        telefono: string;
        email: string;
        fecha: string;
      }) => {
        doc.font('Helvetica').fontSize(bodyFontSize);

        const hCed = doc.heightOfString(values.cedula || '—', { width: cols[0].w - paddingX * 2 });
        const hNom = doc.heightOfString(values.nombre || '—', { width: cols[1].w - paddingX * 2 });
        const hTel = doc.heightOfString(values.telefono || '—', { width: cols[2].w - paddingX * 2 });
        const hEmail = doc.heightOfString(values.email || '—', { width: cols[3].w - paddingX * 2 });
        const hFecha = doc.heightOfString(values.fecha || '—', { width: cols[5].w - paddingX * 2 });

        const contentH = Math.max(hCed, hNom, hTel, hEmail, hFecha, 18); // 18 por el chip aprox
        return Math.max(minRowH, Math.ceil(contentH + paddingY * 2));
      };

      const redrawOnNewPage = () => {
        doc.addPage();
        this.addHeader(doc, 'Listado de Solicitudes', logoBuffer);
        this.addSectionTitle(doc, 'SOLICITUDES');

        const newTop = doc.y;
        drawTableHeader(newTop);
        y = newTop + headerH;
      };

      rows.forEach((s, idx) => {
        const persona = s?.persona ?? {};
        const nombre = `${persona?.nombre ?? ''} ${persona?.apellido1 ?? ''} ${persona?.apellido2 ?? ''}`.trim();

        const cedula = String(persona?.cedula ?? '—');
        const telefono = String(persona?.telefono ?? '—');
        const email = String(persona?.email ?? '—');
        const estado = String(s?.estado ?? '—') as SolicitudStatus | string;
        const fecha = String(this.safeDate(s?.fechaSolicitud ?? s?.createdAt));

        const rowH = measureRowH({ cedula, nombre: nombre || '—', telefono, email, fecha });

        // nueva página si no cabe
        if (y + rowH > bottom()) {
          redrawOnNewPage();
        }

        // zebra
        if (idx % 2 === 1) {
          doc.rect(left, y, avail, rowH).fillColor(this.UI.table.rowAlt).fill();
        }

        // texto
        doc.font('Helvetica').fontSize(bodyFontSize).fillColor(this.UI.ink);

        const textY = y + paddingY; // ✅ top interno consistente

        doc.text(cedula, xs[0] + paddingX, textY, { width: cols[0].w - paddingX * 2 });
        doc.text(nombre || '—', xs[1] + paddingX, textY, { width: cols[1].w - paddingX * 2 });
        doc.text(telefono, xs[2] + paddingX, textY, { width: cols[2].w - paddingX * 2 });
        doc.text(email, xs[3] + paddingX, textY, { width: cols[3].w - paddingX * 2 });

        // chip estado (centrado verticalmente)
        const chipX = xs[4] + paddingX;
        const chipH = 18;
        const chipY = y + Math.floor((rowH - chipH) / 2);
        this.drawStatusChip(doc, chipX, chipY, estado);

        doc.text(fecha, xs[5] + paddingX, textY, { width: cols[5].w - paddingX * 2 });

        // línea separadora suave
        doc
          .moveTo(left + 12, y + rowH)
          .lineTo(right - 12, y + rowH)
          .strokeColor(this.UI.line)
          .lineWidth(0.8)
          .stroke();

        y += rowH;
      });

      // borde externo del contenedor (tarjeta)
      doc
        .roundedRect(left, tableTopY, avail, y - tableTopY, 14)
        .strokeColor(this.UI.line)
        .lineWidth(1)
        .stroke();

      doc.end();
    });
  }
}
