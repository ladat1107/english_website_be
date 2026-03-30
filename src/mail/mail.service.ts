import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    TransactionalEmailsApi,
    TransactionalEmailsApiApiKeys,
    SendSmtpEmail,
} from '@getbrevo/brevo';

import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

import { GradingAssignmentMailContext, SendMailOptions } from './mail.interface';

/**
 * MailService chịu trách nhiệm gửi email thông qua Brevo API
 */
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    private readonly brevoClient: TransactionalEmailsApi;
    private mailConfig: any;
    constructor(private configService: ConfigService) {
        this.mailConfig = this.configService.get('mail');
        /**
         * Khởi tạo Brevo client
         */
        this.brevoClient = new TransactionalEmailsApi();

        const apiKey = this.mailConfig.brevoApiKey;

        if (!apiKey) {
            this.logger.error('Brevo API key is not configured');
            throw new Error('Brevo API key is not configured');
        }

        this.brevoClient.setApiKey(
            TransactionalEmailsApiApiKeys.apiKey,
            apiKey,
        );
    }

    /**
     * Hàm gửi email
     */
    async sendMail(data: SendMailOptions) {
        try {
            let htmlContent = data.html;

            /**
             * Nếu có template thì compile template
             */
            if (data.template) {
                htmlContent = this.compileTemplate(
                    data.template,
                    data.context || {},
                );
            }

            const email = new SendSmtpEmail();

            email.to = [{ email: data.to }];

            email.subject = data.subject;

            email.htmlContent = htmlContent;

            email.sender = {
                name: this.mailConfig.senderName,
                email: this.mailConfig.senderEmail,
            };

            /**
             * Gửi email qua Brevo
             */
            await this.brevoClient.sendTransacEmail(email);

            this.logger.log(`Email sent to ${data.to}`);
        } catch (error) {
            this.logger.error('Send email failed', error);
            throw error;
        }
    }

    /**
     * Compile template handlebars
     */
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

    // Gửi thông báo cho admin khi có học viên nộp bài
    async sendGradingAssignmentMail(context: GradingAssignmentMailContext) {
        const adminEmail = this.configService.get('app.khailingoEmail');
        if (!adminEmail) {
            this.logger.error('Admin email is not configured');
            throw new Error('Admin email is not configured');
        }
        await this.sendMail({
            to: adminEmail,
            subject: 'Khailingo - Thông báo có bài tập mới cần chấm',
            template: 'grading-assignment',
            context: {
                ...context,                
                frontendUrl: this.configService.get('app.clientUrl'),
            },
        });
    }
}