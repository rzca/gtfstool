import { useEffect, useState } from 'react'
import * as gtfs from "gtfs-tool";
import './App.css'

function App() {
  const [kml, setKml] = useState<string | undefined>(undefined)
  const [buf, setBuf] = useState<ArrayBuffer | undefined>(undefined);
  ;
  useEffect(() => {
    async function getKml() {
      if (buf != undefined) {
        const kml = await gtfs.toKml(buf);
        console.log(kml);
        setKml(kml);
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

      <h1>GTFS to KML</h1>
      <div className="card">

        <input type="file" onChange={e => e.target.files != null ? handleFileUpload(e.target.files) : undefined} />
        <div>kml: {kml}</div>
      </div>

    </>
  )
}

export default App
