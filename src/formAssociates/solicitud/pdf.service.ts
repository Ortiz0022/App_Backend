import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Solicitud } from '../solicitud/entities/solicitud.entity';

@Injectable()
export class PdfService {
  async generateSolicitudPDF(solicitud: Solicitud): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CÁMARA DE GANADEROS', { align: 'center' })
        .fontSize(16)
        .text('Solicitud de Asociado', { align: 'center' })
        .moveDown();

      // Estado y fecha
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Estado: ${solicitud.estado}`, { align: 'right' })
        .text(`Fecha de solicitud: ${new Date(solicitud.createdAt).toLocaleDateString('es-CR')}`, { align: 'right' })
        .moveDown();

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

      // INFORMACIÓN PERSONAL
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('INFORMACIÓN PERSONAL')
        .moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      
      const persona = solicitud.persona;
      doc.text(`Cédula: ${persona.cedula}`);
      doc.text(`Nombre completo: ${persona.nombre} ${persona.apellido1} ${persona.apellido2}`);
      doc.text(`Fecha de nacimiento: ${new Date(persona.fechaNacimiento).toLocaleDateString('es-CR')}`);
      doc.text(`Teléfono: ${persona.telefono}`);
      doc.text(`Email: ${persona.email}`);
      if (persona.direccion) {
        doc.text(`Dirección: ${persona.direccion}`);
      }
      doc.moveDown();

      // NÚCLEO FAMILIAR
      if (solicitud.asociado?.nucleoFamiliar) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('NÚCLEO FAMILIAR')
          .moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        const nucleo = solicitud.asociado.nucleoFamiliar;
        doc.text(`Hombres: ${nucleo.nucleoHombres}`);
        doc.text(`Mujeres: ${nucleo.nucleoMujeres}`);
        doc.text(`Total: ${nucleo.nucleoTotal}`);
        doc.moveDown();
      }

      // DATOS DEL ASOCIADO
      if (solicitud.asociado) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('DATOS DEL ASOCIADO')
          .moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        const asociado = solicitud.asociado;
        doc.text(`Vive en finca: ${asociado.viveEnFinca ? 'Sí' : 'No'}`);
        if (asociado.marcaGanado) {
          doc.text(`Marca de ganado: ${asociado.marcaGanado}`);
        }
        if (asociado.CVO) {
          doc.text(`CVO: ${asociado.CVO}`);
        }
        doc.moveDown();
      }

      // DATOS DE LA FINCA
      if (solicitud.asociado?.fincas && solicitud.asociado.fincas.length > 0) {
        const finca = solicitud.asociado.fincas[0];
        
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('DATOS DE LA FINCA')
          .moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${finca.nombre || '—'}`);
        doc.text(`Área: ${finca.areaHa} hectáreas`);
        if (finca.numeroPlano) {
          doc.text(`Número de plano: ${finca.numeroPlano}`);
        }

        if (finca.geografia) {
          doc.text(`Ubicación: ${finca.geografia.provincia}, ${finca.geografia.canton}, ${finca.geografia.distrito}`);
          if (finca.geografia.caserio) {
            doc.text(`Caserío: ${finca.geografia.caserio}`);
          }
        }

        // Propietario
        if (finca.propietario?.persona) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').text('Propietario de la finca:');
          doc.font('Helvetica');
          const prop = finca.propietario.persona;
          doc.text(`${prop.nombre} ${prop.apellido1} ${prop.apellido2}`);
          doc.text(`Cédula: ${prop.cedula}`);
        }
        
        doc.moveDown();
      }

      // MOTIVO DE RECHAZO (si aplica)
      if (solicitud.estado === 'RECHAZADO' && solicitud.motivo) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('red')
          .text('MOTIVO DE RECHAZO')
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('black')
          .text(solicitud.motivo)
          .moveDown();
      }

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Generado el ${new Date().toLocaleString('es-CR')}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    });
  }
}