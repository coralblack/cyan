import { Get, Post, Put, Delete } from "../../../dist/router";
import { BaseController } from "./Base.controller";
import { QueryParam, BodyParam, PathParam } from "../../../dist/router";
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiModel } from "../../../dist/swagger";
import { UserRole, Department, ProjectStructure, AuditedEntity, GetUsersResponse } from "src/types/swaggerTestType";

// DTO Models
@ApiModel({
  description: "Create user request model",
})
export class CreateUserDto {
  @ApiProperty({
    description: "User's email address",
    example: "user@example.com",
    required: true,
  })
  email: string;

  @ApiProperty({
    description: "User's full name",
    example: "John Doe",
    required: true,
  })
  name: string;

  @ApiProperty({
    description: "User's age",
    example: 25,
    required: false,
  })
  age?: number;
}

@ApiModel({
  description: "User response model",
})
export class UserResponse {
  @ApiProperty({
    description: "Unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User's email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User's full name",
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    description: "Account creation date",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt: Date;
}

@ApiTags({
  name: "Users & Organizations",
  description: "User and organization management endpoints",
})
export class SwaggerController extends BaseController {
  @Get("users")
  @ApiOperation({
    summary: "Get paginated users",
    description: "Retrieves a paginated list of users with optional role filtering",
  })
  @ApiResponse(200, {
    description: "Users retrieved successfully",
    type: "GetUsersResponse",
  })
  async getUsers(
    @QueryParam("page", { type: Number, required: false }) page: number,
    @QueryParam("limit", { type: Number, required: false }) limit: number,
    @QueryParam("role", { type: "ENUM", enum: UserRole, required: false }) role?: UserRole,
    @QueryParam("search", { type: String, required: false }) search?: string
  ): Promise<GetUsersResponse> {
    return null;
  }

  @Get("users/:id")
  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieves detailed information about a specific user",
  })
  @ApiResponse(200, { description: "User found successfully", type: UserResponse })
  @ApiResponse(404, { description: "User not found" })
  async getUserById(@PathParam("id", { type: BigInt, required: true }) id: string): Promise<UserResponse> {
    return null;
  }

  @Post("users")
  @ApiOperation({
    summary: "Create new user",
    description: "Creates a new user with the provided information",
  })
  @ApiResponse(201, { description: "User created successfully", type: UserResponse })
  @ApiResponse(400, { description: "Invalid input" })
  async createUser(@BodyParam("user", { type: CreateUserDto, required: true }) user: CreateUserDto): Promise<UserResponse> {
    return null;
  }

  @Put("users/:id")
  @ApiOperation({
    summary: "Update user",
    description: "Updates an existing user's information",
  })
  @ApiResponse(200, { description: "User updated successfully", type: UserResponse })
  @ApiResponse(404, { description: "User not found" })
  async updateUser(
    @PathParam("id", { type: BigInt, required: true }) id: string,
    @BodyParam("user", { type: CreateUserDto, required: true }) user: CreateUserDto
  ): Promise<UserResponse> {
    return null;
  }

  @Delete("users/:id")
  @ApiOperation({
    summary: "Delete user",
    description: "Removes a user from the system",
  })
  @ApiResponse(204, { description: "User deleted successfully" })
  @ApiResponse(404, { description: "User not found" })
  async deleteUser(@PathParam("id", { type: BigInt, required: true }) id: string): Promise<void> {
    return;
  }

  @Post("organizations/:orgId/departments")
  @ApiOperation({
    summary: "Create department",
    description: "Creates a new department in specified organization",
  })
  @ApiResponse(201, { description: "Department created successfully", type: "Department" })
  @ApiResponse(400, { description: "Invalid input" })
  async createDepartment(
    @PathParam("orgId", { type: BigInt, required: true }) orgId: string,
    @BodyParam("department", { required: true }) department: Department
  ): Promise<Department> {
    return null;
  }

  @Put("projects/:projectId")
  @ApiOperation({
    summary: "Update project structure",
    description: "Updates an existing project structure",
  })
  @ApiResponse(200, { description: "Project updated successfully", type: "ProjectStructure" })
  async updateProject(
    @PathParam("projectId", { required: true }) projectId: string,
    @BodyParam("project", { required: true }) project: ProjectStructure
  ): Promise<ProjectStructure & AuditedEntity> {
    return null;
  }
}
