import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '@auth/services/users.service';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

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
