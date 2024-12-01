import { toKml } from "../utils";
import { expect, test } from 'vitest'
import { readFile } from "fs/promises"

test('toKml', async () => {

  const buf = await readFile(`${__dirname}/google_transit.zip`)
  console.log(buf);

  const ss = await toKml(buf);
  console.log(ss);
  expect(ss).toBe("sdf");
})