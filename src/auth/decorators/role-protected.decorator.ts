import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Roles } from '../interfaces/roles.interface';
import { UserRoleGuard } from '../guards/user-role.guard';

export const META_ROLES = 'roles';

export function RoleProtected(...roles: Roles[]) {
    return applyDecorators(
        SetMetadata(META_ROLES, roles),
        UseGuards(UserRoleGuard),
    );
}
