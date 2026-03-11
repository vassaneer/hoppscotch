import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenService } from './access-token.service';
import { CreateAccessTokenDto } from './dto/create-access-token.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import * as E from 'fp-ts/Either';
import { throwHTTPErr } from 'src/utils';
import { GqlUser } from 'src/decorators/gql-user.decorator';
import { AuthUser } from 'src/types/AuthUser';
import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';
import { PATAuthGuard } from 'src/guards/rest-pat-auth.guard';
import { AccessTokenInterceptor } from 'src/interceptors/access-token.interceptor';
import { TeamEnvironmentsService } from 'src/team-environments/team-environments.service';
import { TeamCollectionService } from 'src/team-collection/team-collection.service';
import { TeamService } from 'src/team/team.service';
import { ACCESS_TOKENS_INVALID_DATA_ID } from 'src/errors';
import { createCLIErrorResponse } from './helper';

@UseGuards(ThrottlerBehindProxyGuard)
@Controller({ path: 'access-tokens', version: '1' })
export class AccessTokenController {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly teamCollectionService: TeamCollectionService,
    private readonly teamEnvironmentsService: TeamEnvironmentsService,
    private readonly teamService: TeamService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPAT(
    @GqlUser() user: AuthUser,
    @Body() createAccessTokenDto: CreateAccessTokenDto,
  ) {
    const result = await this.accessTokenService.createPAT(
      createAccessTokenDto,
      user,
    );
    if (E.isLeft(result)) throwHTTPErr(result.left);
    return result.right;
  }

  @Delete('revoke')
  @UseGuards(JwtAuthGuard)
  async deletePAT(@GqlUser() user: AuthUser, @Query('id') id: string) {
    if (!id) {
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );
    }

    const result = await this.accessTokenService.deletePAT(id, user.uid);

    if (E.isLeft(result)) throwHTTPErr(result.left);
    return result.right;
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async listAllUserPAT(
    @GqlUser() user: AuthUser,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.accessTokenService.listAllUserPAT(
      user.uid,
      offset,
      limit,
    );
  }

  @Get('collection/:id')
  @UseGuards(PATAuthGuard)
  @UseInterceptors(AccessTokenInterceptor)
  async fetchCollection(@GqlUser() user: AuthUser, @Param('id') id: string) {
    const res = await this.teamCollectionService.getCollectionForCLI(
      id,
      user.uid,
    );

    if (E.isLeft(res))
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );
    return res.right;
  }

  @Get('environment/:id')
  @UseGuards(PATAuthGuard)
  @UseInterceptors(AccessTokenInterceptor)
  async fetchEnvironment(@GqlUser() user: AuthUser, @Param('id') id: string) {
    const res = await this.teamEnvironmentsService.getTeamEnvironmentForCLI(
      id,
      user.uid,
    );

    if (E.isLeft(res))
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );
    return res.right;
  }

  @Get('collections/:teamId')
  @UseGuards(PATAuthGuard)
  @UseInterceptors(AccessTokenInterceptor)
  async listCollections(
    @GqlUser() user: AuthUser,
    @Param('teamId') teamId: string,
  ) {
    const teamMember = await this.teamService.getTeamMember(
      teamId,
      user.uid,
    );
    if (!teamMember)
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );

    const collections =
      await this.teamCollectionService.getTeamRootCollections(
        teamId,
        null,
        100,
      );

    return collections;
  }

  @Get('environments/:teamId')
  @UseGuards(PATAuthGuard)
  @UseInterceptors(AccessTokenInterceptor)
  async listEnvironments(
    @GqlUser() user: AuthUser,
    @Param('teamId') teamId: string,
  ) {
    const teamMember = await this.teamService.getTeamMember(
      teamId,
      user.uid,
    );
    if (!teamMember)
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );

    const environments =
      await this.teamEnvironmentsService.fetchAllTeamEnvironments(teamId);

    return environments;
  }

  @Get('collection/:id/folders')
  @UseGuards(PATAuthGuard)
  @UseInterceptors(AccessTokenInterceptor)
  async listFolders(
    @GqlUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const res = await this.teamCollectionService.getCollectionForCLI(
      id,
      user.uid,
    );

    if (E.isLeft(res))
      throw new BadRequestException(
        createCLIErrorResponse(ACCESS_TOKENS_INVALID_DATA_ID),
      );

    const folders =
      await this.teamCollectionService.getChildrenOfCollection(id, null, 100);

    return folders;
  }
}
