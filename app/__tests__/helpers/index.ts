import fs from "fs";
import path from "path";

export const getFixturePath = (dirname: string, filename: string) =>
  path.join(__dirname, "..", "..", "__fixtures__", dirname, filename);

export const getFixture = (dirname: string, filename: string) => {
  const fixturePath = getFixturePath(dirname, `${filename}.json`);
  const data = fs.readFileSync(fixturePath, "utf-8");

  return JSON.parse(data);
};
