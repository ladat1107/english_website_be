// skip-response-interceptor.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const SKIP_INTERCEPTOR = 'SKIP_INTERCEPTOR';
export const SkipResponseInterceptor = () => SetMetadata(SKIP_INTERCEPTOR, true);