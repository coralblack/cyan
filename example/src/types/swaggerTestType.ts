/**
 * @description 사용자 권한을 정의하는 열거형
 * @example {
 *   "ADMIN": "ADMIN",
 *   "USER": "USER",
 *   "GUEST": "GUEST"
 * }
 */
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  GUEST = "GUEST",
}

/**
 * @description HTTP 응답 상태 코드를 정의하는 열거형
 * @example {
 *   "OK": 200,
 *   "CREATED": 201,
 *   "BAD_REQUEST": 400,
 *   "UNAUTHORIZED": 401,
 *   "NOT_FOUND": 404
 * }
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
}

/**
 * @description 기본 사용자 정보를 정의하는 인터페이스
 * @example {
 *   "id": "user_123",
 *   "email": "user@example.com",
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "age": 25,
 *   "isActive": true
 * }
 */
export interface BaseUser {
  id: string;
  email: string;
  createdAt: Date;
  age?: number;
  isActive: boolean;
}

/**
 * @description 페이지네이션된 결과를 위한 제네릭 인터페이스
 * @example {
 *   "items": [],
 *   "total": 100,
 *   "page": 1,
 *   "limit": 10,
 *   "hasMore": true
 * }
 */
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * @description 알림 전송 타입
 * @example "EMAIL" | "SMS" | "PUSH"
 */
export type NotificationType = "EMAIL" | "SMS" | "PUSH";

/**
 * @description 조직 정보를 정의하는 인터페이스
 * @example {
 *   "id": "org_123",
 *   "name": "Example Corp",
 *   "type": "COMPANY",
 *   "status": "ACTIVE",
 *   "address": {
 *     "street": "123 Main St",
 *     "city": "Seoul",
 *     "country": "KR",
 *     "postalCode": "12345"
 *   },
 *   "metadata": {
 *     "industry": "Technology",
 *     "size": "Enterprise"
 *   }
 * }
 */
export interface Organization {
  id: string;
  name: string;
  type: "COMPANY" | "NONPROFIT" | "GOVERNMENT";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  metadata?: Record<string, string>;
}

/**
 * @description 부서 정보를 정의하는 인터페이스
 * @example {
 *   "id": "dept_123",
 *   "name": "Engineering",
 *   "organization": {},
 *   "parentDepartment": null,
 *   "childDepartments": []
 * }
 */
export interface Department {
  id: string;
  name: string;
  organization: Organization;
  parentDepartment?: Department;
  childDepartments?: Department[];
}

/**
 * @description API 응답의 표준 형식을 정의하는 제네릭 인터페이스
 * @example {
 *   "success": true,
 *   "data": {},
 *   "timestamp": "2024-01-01T00:00:00Z"
 * }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: Date;
}

/**
 * @description 타임스탬프 정보를 포함하는 인터페이스
 * @example {
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-01T00:00:00Z",
 *   "deletedAt": null
 * }
 */
export interface TimeStamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * @description 감사 정보를 포함하는 인터페이스
 * @example {
 *   "createdBy": "user_123",
 *   "updatedBy": "user_456",
 *   "version": 1
 * }
 */
export interface AuditInfo {
  createdBy: string;
  updatedBy: string;
  version: number;
}

/**
 * @description TimeStamps와 AuditInfo를 결합한 타입
 */
export type AuditedEntity = TimeStamps & AuditInfo;

/**
 * @description 프로젝트 구조를 정의하는 인터페이스
 * @example {
 *   "id": "proj_123",
 *   "name": "Project X",
 *   "tasks": [
 *     {
 *       "id": "task_1",
 *       "title": "Implementation",
 *       "status": "IN_PROGRESS",
 *       "subtasks": [
 *         {
 *           "id": "subtask_1",
 *           "title": "Database Setup",
 *           "assignees": ["user_1", "user_2"],
 *           "priority": 1
 *         }
 *       ]
 *     }
 *   ],
 *   "members": [
 *     {
 *       "userId": "user_1",
 *       "role": "ADMIN",
 *       "permissions": ["READ", "WRITE", "DELETE"]
 *     }
 *   ]
 * }
 */
export interface ProjectStructure {
  id: string;
  name: string;
  tasks: {
    id: string;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    subtasks: {
      id: string;
      title: string;
      assignees: string[];
      priority: number;
    }[];
  }[];
  members: {
    userId: string;
    role: UserRole;
    permissions: string[];
  }[];
}

/**
 * @description 사용자 목록 조회 API 응답 타입
 */
export type GetUsersResponse = PaginationResponse<BaseUser>;
