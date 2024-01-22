import mongoose, { Document, Model, Schema, Types } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import * as autopopulate from "mongoose-autopopulate";

type tel = { tel: string; owner?: string };
type Location = "" | "north" | "south" | "center" | "yosh" | "website";

export type Snif = {
  name?: String;
  tel: tel[];
  whatsapp?: tel[];
  email?: string[];
  location: Location;
  city: string;
  address: string;
};

export interface Orgs extends Document {
  catRefId: Types.ObjectId;
  subCatRefId: Types.ObjectId;
  org_name: string;
  desc?: string;
  web_link: string[];
  facebook_link: string[];
  linkedIn_link?: string[];
  instagram_link?: string[];
  email: string[];
  tel?: tel[];
  whatsapp?: tel[];
  location: Location;
  address?: String;
  snifim?: Snif[];
  active: Boolean;
}

const orgSchema = new Schema<Orgs>({
  catRefId: { type: Schema.Types.ObjectId, required: true, ref: "Categry", refPath: "KishuritForAll" },
  subCatRefId: { type: Schema.Types.ObjectId, required: true, ref: "SubCategory", refPath: "KishuritForAll" },
  org_name: { type: String, required: true },
  desc: { type: String, required: false },
  web_link: { type: [String], default: [] },
  facebook_link: { type: [String], default: [] },
  linkedIn_link: { type: [String], default: [] },
  instagram_link: { type: [String], default: [] },
  email: { type: [String], required: false },
  tel: [
    {
      type: [
        {
          tel: { type: String, required: true },
          owner: { type: String, required: false }, // optional owner field
        },
      ],
      required: false,
    },
  ],
  whatsapp: [
    {
      type: [
        {
          tel: { type: String, required: true },
          owner: { type: String, required: false }, // optional owner field
        },
      ],
      required: false,
    },
  ],
  location: {
    type: String,
    enum: ["", "north", "south", "center", "yosh", "website"],
    required: true,
  },
  address: { type: String },
  snifim: [
    {
      type: [
        {
          name: { type: String },
          tel: [
            {
              tel: { type: String, required: true },
              owner: { type: String }, // optional owner field
            },
          ],
          whatsapp: [
            {
              tel: { type: String, required: true },
              owner: { type: String }, // optional owner field
            },
          ],
          email: { type: [String] },
          location: {
            type: String,
            enum: ["north", "south", "center", "yosh", "website"],
            required: true,
          },
          city: { type: String, required: true },
          address: { type: String, required: true },
        },
      ],
      required: false,
    },
  ],
  active: { type: Boolean, required: true, default: false },
});

orgSchema.plugin(uniqueValidator, "Error, expected {PATH} to be unique.");
//orgSchema.plugin(autopopulate);

const orgsModel: Model<Orgs> = mongoose.model<Orgs>("orgs", orgSchema);

export default orgsModel;
