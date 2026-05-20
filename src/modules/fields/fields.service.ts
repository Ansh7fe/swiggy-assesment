import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomFieldDto, SetCustomFieldValueDto } from './dto/fields.dto';

@Injectable()
export class FieldsService {
  constructor(private prisma: PrismaService) {}

  async createCustomField(projectId: string, dto: CreateCustomFieldDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project "${projectId}" does not exist.`);
    }

    if (dto.type === 'DROPDOWN' && (!dto.config || dto.config.length === 0)) {
      throw new BadRequestException(
        'Dropdown fields must configure a list of options in "config".',
      );
    }

    const configJson = dto.config ? JSON.stringify(dto.config) : '[]';

    return this.prisma.customField.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        config: configJson,
      },
    });
  }

  async setCustomFieldValue(issueId: string, dto: SetCustomFieldValueDto) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });
    if (!issue) {
      throw new NotFoundException(`Issue "${issueId}" does not exist.`);
    }

    const field = await this.prisma.customField.findUnique({
      where: { id: dto.fieldId },
    });
    if (!field) {
      throw new NotFoundException(
        `Custom Field "${dto.fieldId}" does not exist.`,
      );
    }

    if (field.projectId !== issue.projectId) {
      throw new BadRequestException(
        'Custom Field must belong to the same project as the issue.',
      );
    }

    if (field.type === 'DROPDOWN') {
      const allowed: string[] = JSON.parse(field.config as string);
      if (!allowed.includes(dto.value)) {
        throw new BadRequestException(
          `Invalid choice "${dto.value}". Allowed options are: ${allowed.join(', ')}`,
        );
      }
    }

    const valueJson = JSON.stringify(dto.value);

    return this.prisma.issueCustomFieldValue.upsert({
      where: {
        issueId_fieldId: {
          issueId,
          fieldId: dto.fieldId,
        },
      },
      update: { value: valueJson },
      create: {
        issueId,
        fieldId: dto.fieldId,
        value: valueJson,
      },
    });
  }

  async addWatcher(issueId: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });
    if (!issue) {
      throw new NotFoundException(`Issue "${issueId}" does not exist.`);
    }

    return this.prisma.watcher.upsert({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
      update: {},
      create: {
        issueId,
        userId,
      },
    });
  }

  async removeWatcher(issueId: string, userId: string) {
    const watcher = await this.prisma.watcher.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    if (!watcher) {
      return { message: 'User is not watching this issue.' };
    }

    await this.prisma.watcher.delete({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    return { message: 'Successfully unsubscribed from issue updates.' };
  }
}
