import fs from 'node:fs';
import path from 'node:path';

import Showdown from 'showdown';
import nodemailer from 'nodemailer';

class EMail {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!
    }
  });

  static async sendTemplate(
    to: string,
    template: string,
    data: Record<string, string | number>
  ): Promise<void> {
    if (
      !fs.existsSync(path.join(process.cwd(), 'src', 'email', `${template}.md`))
    )
      throw new Error('Not Found');

    let tmplData = fs.readFileSync(
      path.join(process.cwd(), 'src', 'email', `${template}.md`),
      'utf8'
    );

    tmplData = EMail.replacePlaceholders(tmplData, data);

    const converter = new Showdown.Converter({ metadata: true });

    converter.setFlavor('github');

    const html = converter.makeHtml(tmplData);
    const meta = converter.getMetadata() as Record<string, string>;

    const from = '"VirtuEx" <no-reply@theclashfruit.me>';

    await EMail.transporter.sendMail({
      from,
      to,
      subject: meta.subject || 'No Subject',
      html,
      text: EMail.stripMetadata(tmplData)
    });
  }

  private static replacePlaceholders(
    str: string,
    data: Record<string, string | number>
  ): string {
    return str.replace(/{{(.*?)}}/g, (_, key) =>
      String(data[key.trim()] ?? `{{${key}}}`)
    );
  }

  private static stripMetadata(markdown: string): string {
    return markdown.replace(/^\s*---[\s\S]*?---\s*/m, '').trim();
  }
}

export default EMail;
