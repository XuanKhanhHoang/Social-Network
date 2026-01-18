import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupService } from 'src/use-case/chat/create-group/create-group.service';
import { UpdateGroupService } from 'src/use-case/chat/update-group/update-group.service';
import { AddGroupMemberService } from 'src/use-case/chat/add-group-member/add-group-member.service';
import { KickGroupMemberService } from 'src/use-case/chat/kick-group-member/kick-group-member.service';
import { LeaveGroupService } from 'src/use-case/chat/leave-group/leave-group.service';
import { GetGroupMembersService } from 'src/use-case/chat/get-group-members/get-group-members.service';
import { AssignGroupAdminService } from 'src/use-case/chat/assign-group-admin/assign-group-admin.service';
import { DeleteGroupService } from 'src/use-case/chat/delete-group/delete-group.service';
import { AssignGroupAdminDto } from './dto/assign-group-admin.dto';

@Controller('chat/group')
export class GroupChatController {
  constructor(
    private readonly createGroupService: CreateGroupService,
    private readonly updateGroupService: UpdateGroupService,
    private readonly addGroupMemberService: AddGroupMemberService,
    private readonly kickGroupMemberService: KickGroupMemberService,
    private readonly leaveGroupService: LeaveGroupService,
    private readonly getGroupMembersService: GetGroupMembersService,
    private readonly assignGroupAdminService: AssignGroupAdminService,
    private readonly deleteGroupService: DeleteGroupService,
  ) {}

  @Post()
  async createGroup(@GetUserId() userId: string, @Body() dto: CreateGroupDto) {
    return this.createGroupService.execute({
      creatorId: userId,
      dto,
    });
  }

  @Patch(':id')
  async updateGroup(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.updateGroupService.execute({
      userId,
      conversationId,
      dto,
    });
  }

  @Get(':id/members')
  async getGroupMembers(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.getGroupMembersService.execute({
      userId,
      conversationId,
    });
  }

  @Post(':id/members')
  async addGroupMembers(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
    @Body() dto: AddGroupMemberDto,
  ) {
    return this.addGroupMemberService.execute({
      userId,
      conversationId,
      dto,
    });
  }

  @Delete(':id/members/:memberId')
  async kickGroupMember(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.kickGroupMemberService.execute({
      userId,
      conversationId,
      memberId,
    });
  }

  @Post(':id/leave')
  async leaveGroup(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.leaveGroupService.execute({
      userId,
      conversationId,
    });
  }

  @Patch(':id/owner')
  async assignGroupAdmin(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
    @Body() dto: AssignGroupAdminDto,
  ) {
    return this.assignGroupAdminService.execute({
      userId,
      conversationId,
      dto,
    });
  }

  @Delete(':id')
  async deleteGroup(
    @GetUserId() userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.deleteGroupService.execute({
      userId,
      conversationId,
    });
  }
}
