import { MutationLoginArgs, LoginResult } from '@vendure/common/lib/generated-types';
import { Request, Response } from 'express';

import { InternalServerError } from '../../../common/error/errors';
import { ConfigService } from '../../../config/config.service';
import { User } from '../../../entity/user/user.entity';
import { AuthService } from '../../../service/services/auth.service';
import { UserService } from '../../../service/services/user.service';
import { extractAuthToken } from '../../common/extract-auth-token';
import { RequestContext } from '../../common/request-context';
import { setAuthToken } from '../../common/set-auth-token';

export class BaseAuthResolver {
    constructor(
        protected authService: AuthService,
        protected userService: UserService,
        protected configService: ConfigService,
    ) {}

    /**
     * Attempts a login given the username and password of a user. If successful, returns
     * the user data and returns the token either in a cookie or in the response body.
     */
    async login(
        args: MutationLoginArgs,
        ctx: RequestContext,
        req: Request,
        res: Response,
    ): Promise<LoginResult> {
        return await this.createAuthenticatedSession(ctx, args, req, res);
    }

    async logout(ctx: RequestContext, req: Request, res: Response): Promise<boolean> {
        const token = extractAuthToken(req, this.configService.authOptions.tokenMethod);
        if (!token) {
            return false;
        }
        await this.authService.deleteSessionByToken(ctx, token);
        setAuthToken({
            req,
            res,
            authOptions: this.configService.authOptions,
            rememberMe: false,
            authToken: '',
        });
        return true;
    }

    /**
     * Returns information about the current authenticated user.
     */
    async me(ctx: RequestContext) {
        const userId = ctx.activeUserId;
        const user = userId && (await this.userService.getUserById(userId));
        return user ? this.publiclyAccessibleUser(user) : null;
    }

    /**
     * Creates an authenticated session and sets the session token.
     */
    protected async createAuthenticatedSession(
        ctx: RequestContext,
        args: MutationLoginArgs,
        req: Request,
        res: Response,
    ) {
        const session = await this.authService.authenticate(ctx, args.username, args.password);
        setAuthToken({
            req,
            res,
            authOptions: this.configService.authOptions,
            rememberMe: args.rememberMe || false,
            authToken: session.token,
        });
        return {
            user: this.publiclyAccessibleUser(session.user),
        };
    }

    /**
     * Updates the password of an existing User.
     */
    protected async updatePassword(
        ctx: RequestContext,
        currentPassword: string,
        newPassword: string,
    ): Promise<boolean> {
        const { activeUserId } = ctx;
        if (!activeUserId) {
            throw new InternalServerError(`error.no-active-user-id`);
        }
        return this.userService.updatePassword(activeUserId, currentPassword, newPassword);
    }

    /**
     * Exposes a subset of the User properties which we want to expose to the public API.
     */
    private publiclyAccessibleUser(user: User): any {
        return {
            id: user.id,
            identifier: user.identifier,
            channelTokens: this.getAvailableChannelTokens(user),
        };
    }

    private getAvailableChannelTokens(user: User): string[] {
        return user.roles.reduce((tokens, role) => role.channels.map(c => c.token), [] as string[]);
    }
}
