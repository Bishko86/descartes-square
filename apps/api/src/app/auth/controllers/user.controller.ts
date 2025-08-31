import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { UsersService } from '@auth/services/users.service';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { IUserDto } from '@shared/src';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async getAllUsers() {
    try {
      const users = await this.userService.findAllUsers();
      return {
        success: true,
        message: `Found ${users.length} users`,
        users: users,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch users: ${error.message}`,
      };
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getCurrUser(@Req() req: Request): Promise<IUserDto> {
    const userId = req['user']['userId'];
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User with such email already in use');
    }
    const { username, email } = user;

    return { username, email };
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  async getUserById(@Param('id') id: string): Promise<IUserDto> {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new BadRequestException('User with such email already in use');
    }
    const { username, email } = user;

    return { username, email };
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteUserById(@Param('id') id: string) {
    try {
      const result = await this.userService.deleteUser(id);

      return {
        success: true,
        message: `Deleted ${result.id} user`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete user: ${error.message}`,
      };
    }
  }
}
