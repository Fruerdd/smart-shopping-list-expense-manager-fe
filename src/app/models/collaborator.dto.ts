export enum PermissionEnum {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

export interface CollaboratorDTO {
  userId: string;
  userName?: string;
  permission: PermissionEnum;
}
