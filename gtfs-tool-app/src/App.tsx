import { useEffect, useState } from 'react'
import { toKml } from "gtfs-tool";
import './App.css'

function App() {
  const [kml, setKml] = useState<string | undefined>(undefined)
  const [buf, setBuf] = useState<ArrayBuffer | undefined>(undefined);
  const [err, setErr] = useState<string | undefined>();
  ;
  useEffect(() => {
    async function getKml() {
      if (buf != undefined) {
        try {
          const kml = await toKml(buf);
          console.log(kml);
          setKml(kml);

          const kmlBlob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
          const url = window.URL.createObjectURL(kmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "gtfs_converter_output.kml";

          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();
          a.remove();  //afterwards we remove the element again
        } catch (e) {
          console.log(e);
          setErr(JSON.stringify(e))
        }
      }
    }

    getKml()
  }, [buf]);

  const handleFileUpload = async (files: FileList) => {
    if (files[0] != null) {
      const file = files[0];
      const buffer = await file.arrayBuffer();
      setBuf(buffer);
    }
  }

  return (
    <>
      <h1>GTFS to KML Converter</h1>
      <div className="card">
        <input type="file" onChange={e => e.target.files != null ? handleFileUpload(e.target.files) : undefined} />
        {kml != null && <div> {kml}</div>}
        {err != null && <div>{err}</div>}
      </div>

    </>
  )
}

export default App
