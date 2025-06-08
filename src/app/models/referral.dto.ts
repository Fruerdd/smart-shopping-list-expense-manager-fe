export enum ReferralStatusEnum {
  PENDING = 'PENDING',
  REGISTERED = 'REGISTERED',
  PURCHASED = 'PURCHASED',
}

export interface ReferralDTO {
  referrerId: string;
  referredUserId: string;
  status: ReferralStatusEnum;
  rewardEarned?: number;
}
