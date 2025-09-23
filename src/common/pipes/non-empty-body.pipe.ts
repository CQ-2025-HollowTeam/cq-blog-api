import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NonEmptyBodyPipe implements PipeTransform {
    transform(value: any) {
        if (
            value == null ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        ) {
            throw new BadRequestException('Request body cannot be empty');
        }
        return value;
    }
}
