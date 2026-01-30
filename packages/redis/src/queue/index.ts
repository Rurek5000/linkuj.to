export const queueService = {
  async publish(stream: string, data: any): Promise<void> {},
  async consume(stream: string): Promise<any[]> {
    return [];
  }
};
