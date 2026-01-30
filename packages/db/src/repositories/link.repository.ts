import { db } from '../client';

export const linkRepository = {
  async create(data: any) {
    return db.link.create();
  },

  async findByShortCode(shortCode: string) {
    return db.link.findUnique();
  },

  async delete(shortCode: string) {
    return db.link.update();
  }
};
