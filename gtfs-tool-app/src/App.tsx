import { useEffect, useMemo, useState } from 'react'
import { toKml } from "gtfs-tool";
import './App.css'
import { Callout, Card, FileInput, FormGroup } from '@blueprintjs/core';

function App() {
  const [buf, setBuf] = useState<ArrayBuffer | undefined>(undefined);
  const [err, setErr] = useState<string | undefined>();
  const [filename, setFilename] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const kmlFilename = useMemo(() => {
    const filenameWithoutExtension = filename != null ? filename.split('.')[0] : "gtfs_converter_output";
    return `${filenameWithoutExtension}.kml`
  }, [filename]);

  useEffect(() => {
    async function getKml() {
      if (buf != undefined) {
        try {
          const res = await toKml(buf);

          const kmlBlob = new Blob([res.kml], { type: "application/vnd.google-earth.kml+xml" });
          const url = window.URL.createObjectURL(kmlBlob);
          const a = document.createElement('a');

          a.href = url;
          a.download = kmlFilename;

          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();
          a.remove();  //afterwards we remove the element again
        } catch (e) {
          console.log(e);
          setErr(JSON.stringify(e))
        } finally {
          setIsLoading(false);
        }
      }
    }

    getKml()
  }, [buf]);

  const handleFileUpload = async (files: FileList) => {
    if (files[0] != null) {
      setIsLoading(true);
      setErr(undefined);
      setFilename(files[0].name);
      const file = files[0];
      const buffer = await file.arrayBuffer();
      setBuf(buffer);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>GTFS to KML Converter</h1>
        <p>This tool can convert <a href="https://gtfs.org/documentation/overview/">GTFS files</a> into <a href="https://pro.arcgis.com/en/pro-app/latest/help/data/kml/what-is-kml-.htm">KML files.</a></p>
        <p>The resulting KML file will display individual routes and can be uploaded to Google Earth or GIS software.</p>
        <p>The converter will simplify shapes if needed using <a href="https://mourner.github.io/simplify-js/">simplify-js</a>.</p>
        <p>Source code, npm package and documentation lives at <a href="https://github.com/rzca/gtfstool">github.com/rzca/gtfstool</a></p>
        <Card>
          <FormGroup
            label="GTFS file"
            labelFor="gtfs-file-input"
            labelInfo="(required)">
            <FileInput
              className="gtfs-file-input"
              text={filename ?? "Choose GTFS file..."}
              inputProps={{ accept: "application/zip" }}
              onInputChange={e => e.currentTarget.files != null ? handleFileUpload(e.currentTarget.files) : undefined} />
          </FormGroup>
          {filename != null && err == null && !isLoading && <Callout intent="success">Download of {kmlFilename} started</Callout>}
          {filename != null && err != null && !isLoading && <Callout intent="danger">KML conversion failed. {err}</Callout>}
        </Card>
      </div>

    </div>
  )
}

export default App
