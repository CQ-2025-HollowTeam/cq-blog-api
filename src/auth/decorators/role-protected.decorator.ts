import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { UserRoleGuard } from '../guards/user-role.guard';

export const META_ROLES = 'roles';

export function RoleProtected(...roles: Role[]) {
    return applyDecorators(
        SetMetadata(META_ROLES, roles),
        UseGuards(UserRoleGuard),
    );
}
