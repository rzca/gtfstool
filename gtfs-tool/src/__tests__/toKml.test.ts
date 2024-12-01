import { toKml } from "../utils";
import { expect, test } from 'vitest'
import { readFile, writeFile } from "fs/promises"

const minimalGtfsPath = `${__dirname}/test_data/minimal_gtfs.zip`;
const artGfsPath = `${__dirname}/test_data/art_gtfs.zip`;
const connectorGtfsPath = `${__dirname}/test_data/connector_gtfs.zip`;

test('minimalGtfs', async () => {
  const buf = await readFile(minimalGtfsPath);
  console.log("buf", buf.length);

  const ss = await toKml(buf);
  console.log(ss)

  // await writeFile(`${__dirname}/minimal.kml`, ss);

  const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Folder><name>Linee</name><Placemark><name>undefined</name><LineString><coordinates>-77.11261,38.85662,0 -77.11269,38.85658,0 -77.112615,38.856485,0 -77.11254,38.85639,0 -77.1125,38.85633,0 -77.112422,38.856228,0 -77.112345,38.856125,0 -77.112267,38.856023,0 -77.11219,38.85592,0 -77.11199,38.85597,0 -77.11182,38.85603,";
  expect(ss.startsWith(expected)).toBeTruthy();
})

test('artGtfs', async () => {

  const buf = await readFile(artGfsPath)
  console.log(buf);

  // const ss = await toKml(buf);

  // await writeFile(`${__dirname}/art.kml`, ss);
  // console.log(ss);

  // const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Folder><name>Linee</name><Placemark><name>undefined</name><LineString><coordinates>-77.11261,38.85662,0 -77.11269,38.85658,0 -77.112615,38.856485,0 -77.11254,38.85639,0 -77.1125,38.85633,0 -77.112422,38.856228,0 -77.112345,38.856125,0 -77.112267,38.856023,0 -77.11219,38.85592,0 -77.11199,38.85597,0 -77.11182,38.85603,";
  // expect(ss.startsWith(expected)).toBeTruthy();
})

test('connectorGtfs', async () => {
  const buf = await readFile(connectorGtfsPath);

  // const ss = await toKml(buf);

  // await writeFile(`${__dirname}/connector.kml`, ss);

  // const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Folder><name>Linee</name><Placemark><name>undefined</name><LineString><coordinates>-77.11261,38.85662,0 -77.11269,38.85658,0 -77.112615,38.856485,0 -77.11254,38.85639,0 -77.1125,38.85633,0 -77.112422,38.856228,0 -77.112345,38.856125,0 -77.112267,38.856023,0 -77.11219,38.85592,0 -77.11199,38.85597,0 -77.11182,38.85603,";
  // expect(ss.startsWith(expected)).toBeTruthy();
})