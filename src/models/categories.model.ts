import mongoose, { Schema, Document, Model, Collection, Connection } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
export interface Category extends Document {
  name: string;
  desc: string;
}

export const categoriesSchema: Schema<Category> = new Schema<Category>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  desc: {
    type: String,
    required: true,
    unique: true,
  },
});

categoriesSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique.",
});

const CategoriesModel = (connection: Connection): Model<Category> => {
  return connection.model<Category>("Category", categoriesSchema);
};


export default CategoriesModel;
