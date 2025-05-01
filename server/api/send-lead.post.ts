// ~/server/api/send-lead.ts
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import sgMail from '@sendgrid/mail'
import { defineEventHandler, readBody, createError, H3Event } from 'h3' // Removed sendError as createError is sufficient
import { useRuntimeConfig } from '#imports' // Ensure useRuntimeConfig is imported

// Base schema for required fields
const baseSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Correo electrónico no válido'),
  producto: z.string().min(1, 'El producto es obligatorio'),
});

// Schema to allow any additional fields (dynamic ones)
const fullSchema = baseSchema.catchall(z.any()); // Allows any other properties

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig(event); // Pass event to useRuntimeConfig in Nitro
  const body = await readBody(event);

  // Validate the full structure (base + dynamic fields)
  const parsed = fullSchema.safeParse(body);

  // Check if base required fields are present and valid
  if (!parsed.success || !baseSchema.safeParse(body).success) {
      // Log the specific Zod error for debugging
      console.error('❌ Invalid form data:', parsed.success ? 'Base schema failed' : parsed.error.issues);
      throw createError({ // Use throw createError for proper error handling in Nitro
          statusCode: 400,
          statusMessage: 'Datos del formulario no válidos. Revisa los campos obligatorios.',
          // Optionally include more detailed error info in development
          // data: process.env.NODE_ENV === 'development' ? parsed.error?.issues : undefined
      });
  }

  // Use the full data (including dynamic fields) from the parsed result
  const allData = parsed.data;

  const apiKey = config.sendgridApiKey;
  // Access public runtime config if defined there, otherwise fallback to private
  const fromEmail = config.public?.sendgridFromEmail || config.sendgridFromEmail;
  const toEmail = config.public?.sendgridToEmail || config.sendgridToEmail;

  if (!apiKey || !fromEmail || !toEmail) {
    console.error('❌ Configuración de SendGrid incompleta. Verifica sendgridApiKey, sendgridFromEmail, sendgridToEmail en tu runtimeConfig.');
    throw createError({ statusCode: 500, statusMessage: 'Falta configuración de email' });
  }

  sgMail.setApiKey(apiKey);

  // --- Generate HTML using ALL data from the parsed body ---
  const htmlBody = Object.entries(allData)
    .filter(([key]) => key !== undefined && allData[key] !== undefined && allData[key] !== null && allData[key] !== '') // Optional: Filter out empty/null fields
    .map(([key, value]) => {
       // Simple capitalization for display label
       const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `<p><strong>${formattedKey}:</strong> ${String(value)}</p>`;
    })
    .join('\n');

  try {
    await sgMail.send({
      to: toEmail,
      from: {
        name: 'Web Reprodisseny', // Optional: Add a name
        email: fromEmail
      },
      replyTo: allData.email, // Set reply-to to the user's email
      subject: `Nueva solicitud de "${allData.producto}" por ${allData.nombre}`, // More descriptive subject
      html: `<h2>Nueva solicitud de información</h2>\n${htmlBody}`,
    });
  } catch (err: any) {
    console.error('❌ Error al enviar email con SendGrid:', err.response?.body || err);
    throw createError({ statusCode: 500, statusMessage: 'Error interno al enviar el correo.' });
  }

  // --- Guardar localmente como respaldo (using ALL data) ---
  try {
    // Adjust path relative to the server directory if needed, or use absolute paths
    const leadsDir = path.resolve(process.cwd(), '.output', 'data'); // Example: Save within .output (adjust as needed)
    const leadsPath = path.join(leadsDir, 'leads.json');
    let leads = [];

    try {
      // Ensure directory exists before reading/writing
      await fs.mkdir(leadsDir, { recursive: true });
      const file = await fs.readFile(leadsPath, 'utf8');
      leads = JSON.parse(file);
      if (!Array.isArray(leads)) leads = []; // Ensure it's an array
    } catch (readError: any) {
       // If file doesn't exist or is invalid JSON, start with empty array
      if (readError.code !== 'ENOENT') {
          console.warn(`⚠️ Error reading leads file (${leadsPath}), starting fresh:`, readError);
      }
      leads = [];
    }

    // Push the full data object
    leads.push({ ...allData, fecha: new Date().toISOString() });

    await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
    console.log(`✅ Lead backup saved to ${leadsPath}`);
  } catch (backupError) {
    console.error('⚠️ Error crítico al guardar backup del lead:', backupError);
    // Decide if this error should prevent success response (maybe not, email was sent)
  }

  return { success: true, message: 'Solicitud enviada correctamente.' };
});