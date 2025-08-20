import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '@auth/services/users.service';
import { User } from '@auth/schema/user.schema';
import { AuthGuardJwt } from '@auth/guards/auth-jwt.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('create')
  async createTestUser(@Body() userBody: User) {
    try {
      const user = await this.userService.createUser(userBody);
      return {
        success: true,
        message: 'User created successfully',
        user: user,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create user: ${error.message}`,
      };
    }
  }

  @Get()
  @UseGuards(AuthGuardJwt)
  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers();
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

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  async deleteUserById(@Param('id') id: string) {
    try {
      const result = await this.userService.deleteUser(id);

      return {
        success: true,
        message: `Deleted ${result.deletedCount} user(s)`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete user: ${error.message}`,
      };
    }
  }
}
