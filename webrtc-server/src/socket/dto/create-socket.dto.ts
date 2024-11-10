export class CreateSocketDto {
  // 房间 id
  public readonly roomId: string;
  // 呼叫对象 id
  public readonly userIds: string[];
}
