import { useEffect, useState } from 'react'
import * as gtfs from "gtfs-tool";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
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

  // const readFile = ()

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <input type="file" onChange={e => e.target.files != null ? handleFileUpload(e.target.files) : undefined} />
        <div>kml: {kml}</div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
