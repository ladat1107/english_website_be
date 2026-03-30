import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ClassScheduleMailContext, SendMailOptions } from './mail.interface';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        const mailConfig = this.configService.get('mail');

        this.transporter = nodemailer.createTransport({
            host: mailConfig.host,
            port: mailConfig.port,
            secure: false,
            auth: {
                user: mailConfig.user,
                pass: mailConfig.pass,
            },
        });
    }

    async sendMail(options: SendMailOptions): Promise<void> {
        try {
            let htmlContent = options.html;

            if (options.template) {
                htmlContent = this.compileTemplate(
                    options.template,
                    options.context || {},
                );
            }

            await this.transporter.sendMail({
                from: this.configService.get('mail.from'),
                to: options.to,
                subject: options.subject,
                html: htmlContent,
            });

            this.logger.log(`Email sent to ${options.to}`);
        } catch (error) {
            this.logger.error(`Failed to send email`, error.stack);
            throw error;
        }
    }

    private compileTemplate(templateName: string, context: any): string {
        const templatePath = path.join(
            __dirname,
            'templates',
            `${templateName}.hbs`,
        );

        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(templateSource);

        return compiledTemplate(context);
    }
    // Gửi thông báo lịch học
    async sendClassScheduleMail(
        to: string,
        context: ClassScheduleMailContext,
    ) {
        await this.sendMail({
            to,
            subject: 'Khailingo - Thông báo lịch học mới',
            template: 'class-schedule',
            context: {
                ...context,
                frontendUrl: this.configService.get('app.clientUrl'),
                zaloGroupUrl: this.configService.get<string>('app.zaloGroupUrl'),
            },
        });
    }
}