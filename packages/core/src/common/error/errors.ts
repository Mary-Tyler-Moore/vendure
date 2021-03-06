import { ID } from '@vendure/common/lib/shared-types';

import { coreEntitiesMap } from '../../entity/entities';
import { I18nError } from '../../i18n/i18n-error';

export class InternalServerError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'INTERNAL_SERVER_ERROR');
    }
}

export class UserInputError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'USER_INPUT_ERROR');
    }
}

export class IllegalOperationError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'ILLEGAL_OPERATION');
    }
}

export class UnauthorizedError extends I18nError {
    constructor() {
        super('error.unauthorized', {}, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends I18nError {
    constructor() {
        super('error.forbidden', {}, 'FORBIDDEN');
    }
}

export class NoValidChannelError extends I18nError {
    constructor() {
        super('error.no-valid-channel-specified', {}, 'NO_VALID_CHANNEL');
    }
}

export class ChannelNotFoundError extends I18nError {
    constructor(token: string) {
        super('error.channel-not-found', { token }, 'CHANNEL_NOT_FOUND');
    }
}

export class EntityNotFoundError extends I18nError {
    constructor(entityName: keyof typeof coreEntitiesMap, id: ID) {
        super('error.entity-with-id-not-found', { entityName, id }, 'ENTITY_NOT_FOUND');
    }
}

export class VerificationTokenError extends I18nError {
    constructor() {
        super('error.verification-token-not-recognized', {}, 'BAD_VERIFICATION_TOKEN');
    }
}

export class VerificationTokenExpiredError extends I18nError {
    constructor() {
        super('error.verification-token-has-expired', {}, 'EXPIRED_VERIFICATION_TOKEN');
    }
}

export class PasswordResetTokenError extends I18nError {
    constructor() {
        super('error.password-reset-token-not-recognized', {}, 'BAD_PASSWORD_RESET_TOKEN');
    }
}

export class PasswordResetTokenExpiredError extends I18nError {
    constructor() {
        super('error.password-reset-token-has-expired', {}, 'EXPIRED_PASSWORD_RESET_TOKEN');
    }
}

export class IdentifierChangeTokenError extends I18nError {
    constructor() {
        super('error.identifier-change-token-not-recognized', {}, 'EXPIRED_IDENTIFIER_CHANGE_TOKEN');
    }
}

export class IdentifierChangeTokenExpiredError extends I18nError {
    constructor() {
        super('error.identifier-change-token-has-expired', {}, 'EXPIRED_IDENTIFIER_CHANGE_TOKEN');
    }
}

export class NotVerifiedError extends I18nError {
    constructor() {
        super('error.email-address-not-verified', {}, 'NOT_VERIFIED');
    }
}

export class OrderItemsLimitError extends I18nError {
    constructor(maxItems: number) {
        super('error.order-items-limit-exceeded', { maxItems }, 'ORDER_ITEMS_LIMIT_EXCEEDED');
    }
}
