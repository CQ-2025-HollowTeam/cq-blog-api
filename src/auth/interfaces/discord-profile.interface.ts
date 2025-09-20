import { AuthStrategy } from '../enums/auth-strategy.enum';

export interface DiscordProfile {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
    email: string;
    provider: AuthStrategy.DISCORD;
}
