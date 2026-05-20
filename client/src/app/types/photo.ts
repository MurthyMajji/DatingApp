export type Photo = {
  id: number;
  url: string;
  publicId?: string;
  memberId: string;
  isApproved: boolean;
  userName?: string;
};
