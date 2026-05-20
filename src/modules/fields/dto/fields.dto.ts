import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export enum CustomFieldType {
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN',
}

export class CreateCustomFieldDto {
  @ApiProperty({
    example: 'SDE Level Required',
    description: 'Name of the custom field',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    enum: CustomFieldType,
    example: 'DROPDOWN',
    description: 'Field type classification',
  })
  @IsEnum(CustomFieldType)
  @IsNotEmpty()
  type!: CustomFieldType;

  @ApiProperty({
    example: ['SDE-1', 'SDE-2', 'SDE-3'],
    description: 'Dropdown options config (mandatory for DROPDOWN)',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  config?: string[];
}

export class SetCustomFieldValueDto {
  @ApiProperty({
    example: 'uuid-custom-field-id',
    description: 'ID of the custom field',
  })
  @IsString()
  @IsNotEmpty()
  fieldId!: string;

  @ApiProperty({
    example: 'SDE-1',
    description: 'Value to record for the issue custom field',
  })
  @IsNotEmpty()
  value!: any;
}
