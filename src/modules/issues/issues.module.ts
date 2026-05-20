import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { ProjectsModule } from '../projects/projects.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [ProjectsModule, WorkflowModule],
  providers: [IssuesService],
  controllers: [IssuesController],
  exports: [IssuesService],
})
export class IssuesModule {}
