import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    closure: string;
    ctaLabel: string;
    href: string;
    template_name: "primary";

}


@Injectable()
export class MailService {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        let secure = false;
        try {
            secure = JSON.parse(process.env.SMTP_SECURE_FLAG);
        } catch (error) {
            Logger.warn("Please consider adding the SMTP_SECURE_FLAG variable to you .env file.", "MailService");
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }

        } as nodemailer.TransportOptions)
    }


    getHtml(params: SendEmailParams) {
        const baseURL = JSON.parse(process.env.DEV_ENVIRONMENT)
            ? "http://localhost:3000/"
            : "https://akkukachasma.com/";
        const href = `${baseURL}${params.href}`;

        // return href;
        const template = fs
            .readFileSync(`src/mail/templates/${params.template_name}.html`, {
                encoding: "utf-8",
            })
            .toString();

        const compiledTemplate = handlebars.compile(template);
        return compiledTemplate({
            subject: params.subject,
            body: params.body,
            closure: params.closure,
            ctaLabel: params.ctaLabel,
            href: href,
        });
    };

    async sendEmail(params: SendEmailParams) {
        const html = this.getHtml(params);

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.SMTP_EMAIL,
            to: params.to,
            subject: params.subject,
            html
        }

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw error;
        }
    }
}
