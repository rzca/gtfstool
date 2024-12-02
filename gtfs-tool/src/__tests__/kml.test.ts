import { toKml } from "../kml";
import { expect, test } from 'vitest'
import { readFile, writeFile } from "fs/promises"

const minimalGtfsPath = `${__dirname}/test_data/minimal_gtfs.zip`;
const artGfsPath = `${__dirname}/test_data/art_gtfs.zip`;
const connectorGtfsPath = `${__dirname}/test_data/connector_gtfs.zip`;

test('minimalGtfs', async () => {
  const buf = await readFile(minimalGtfsPath);

  const res = await toKml(buf);

  await writeFile(`${__dirname}/test_outputs/minimal.kml`, res.kml);

  const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n\t<Document>\n\t\t<Placemark>\n\t\t\t<name>MAX Orange Brentwood/Saddletowne (303-20670)</name>\n\t\t\t<Style>\n\t\t\t\t<LineStyle>\n\t\t\t\t\t<color>ffff8000</color>\n\t\t\t\t\t<width>4</width>\n\t\t\t\t</LineStyle>\n\t\t\t</Style>\n\t\t\t\t<LineString>\n\t\t\t\t\t<coordinates>\n\t\t\t\t\t\t\t-114.132259,51.086506,0 \n\t\t\t\t\t\t\t-114.133205,51.086953,0 \n\t\t\t\t\t\t\t-114.133275,51.087029,0 \n\t\t\t\t\t\t\t-114.133356,51.087278,0 \n\t\t\t\t\t\t\t-114.132663,51.086937,0\n\t\t\t\t\t</coordinates>\n\t\t\t\t</LineString>\n\t\t</Placemark>\n\t</Document>\n</kml>";
  
  expect(res.kml).toBe(expected);
})

test('artGtfs', async () => {

  const buf = await readFile(artGfsPath)
  console.log(buf);

  const res = await toKml(buf);

  await writeFile(`${__dirname}/test_outputs/art.kml`, res.kml);
  // console.log(ss);

  // const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Folder><name>Linee</name><Placemark><name>undefined</name><LineString><coordinates>-77.11261,38.85662,0 -77.11269,38.85658,0 -77.112615,38.856485,0 -77.11254,38.85639,0 -77.1125,38.85633,0 -77.112422,38.856228,0 -77.112345,38.856125,0 -77.112267,38.856023,0 -77.11219,38.85592,0 -77.11199,38.85597,0 -77.11182,38.85603,";
  // expect(ss.startsWith(expected)).toBeTruthy();
})

test('connectorGtfs', async () => {
  const buf = await readFile(connectorGtfsPath);

  const res = await toKml(buf);

  await writeFile(`${__dirname}/test_outputs/connector.kml`, res.kml);

  // const expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><kml xmlns=\"http://www.opengis.net/kml/2.2\"><Document><Folder><name>Linee</name><Placemark><name>undefined</name><LineString><coordinates>-77.11261,38.85662,0 -77.11269,38.85658,0 -77.112615,38.856485,0 -77.11254,38.85639,0 -77.1125,38.85633,0 -77.112422,38.856228,0 -77.112345,38.856125,0 -77.112267,38.856023,0 -77.11219,38.85592,0 -77.11199,38.85597,0 -77.11182,38.85603,";
  // expect(ss.startsWith(expected)).toBeTruthy();
})