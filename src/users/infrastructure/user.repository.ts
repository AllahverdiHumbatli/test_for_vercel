import { ObjectId, WithId } from "mongodb";
import { IUser } from "../types/user.interface";
import { db } from "../../db";

export const usersRepository = {
  async create(user: IUser): Promise<string> {
    const newUser = await db
      .getCollections()
      .usersCollection.insertOne({ ...user });
    return newUser.insertedId.toString();
  },
  async delete(id: string): Promise<boolean> {
    const isDel = await db
      .getCollections()
      .usersCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<IUser> | null> {
    return db
      .getCollections()
      .usersCollection.findOne({ _id: new ObjectId(id) });
  },
  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<WithId<IUser> | null> {
    return db.getCollections().usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};
