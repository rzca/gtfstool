import JSZip from "jszip";

export const add = (a: number, b: number) => a + b;

const loadRoutes = (text: string) => {
    const rows = text.split("\n").map(line => line.split(","));
    const routes: { [routeName: string]: string} = {};

    for (let i = 1; i < rows.length; i++) {
        if (rows[i] != null) {
            const [raw_route_id, agency_id, route_short_name, route_long_name] = rows[i]!;
            const route_id = raw_route_id!.replace(/["']/g, '');
            routes[route_id] = route_long_name!;
        }

    }
}

export const toKml = async (zipBlob: ArrayBuffer): Promise<string> => {
    var jsZip = new JSZip();

    const data = await jsZip.loadAsync(zipBlob);



    // const shapesInput = document.getElementById("shapesInput");

    // const routes = await loadRoutesFile();
    //         const shapeToRouteMap = await loadTripsFile();
    //             const shapes = await loadShapesFile();

    // console.log(shapeToRouteMap);

    // const groupedData = groupLinesByShapeId(shapes);

    // // Divide i dati in gruppi di 10 o meno
    // const groups = Object.values(groupedData);
    // const maxGroupsPerFile = 3000;
    // const numFiles = Math.ceil(groups.length / maxGroupsPerFile);


    // var progress=0;

    // for (let i = 0; i < numFiles; i++) {
    //     const startIdx = i * maxGroupsPerFile;
    //     const endIdx = startIdx + maxGroupsPerFile;
    //     const fileGroups = groups.slice(startIdx, endIdx);

    var kml = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">' +
        '<Document>' +
        '<Folder>' +
        '<name>Linee</name>';

    // fileGroups.forEach(group => {
    // progress++;
    //shapesStatus.innerHTML = progress;
    // console.log(progress);
    // const shapeId = String(group[0].shape_id).replace(/["']/g, '');
    // const routeId = shapeToRouteMap[shapeId];

    // Cerca il nome nel file routes basato su shape_id
    // const routeName = routes[routeId];
    const points: { lat: number, lon: number }[] = [{ lat: 12, lon: 100 }, { lat: 12, lon: 101 }, { lat: 13, lon: 101 }];
    const route = { routeName: "route", points };

    //console.log(shapeId, routeId, routeName);

    kml += '<Placemark>' +
        `<name>${route.routeName}</name>` + // Aggiunge il nome come shape_id
        '<LineString>' +
        '<coordinates>' +
        // group.map(row => `${parseFloat(row.shape_pt_lon)},${parseFloat(row.shape_pt_lat)},0`).join(' ') +
        route.points.map(point => `${point.lon},${point.lat},0`).join(' ') +
        '</coordinates>' +
        '</LineString>' +
        '</Placemark>';



    kml += '</Folder></Document></kml>';

    return kml;
    // Creazione di un oggetto Blob per il file KML
    // const kmlBlob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });

    // Creazione di un nome file univoco
    // const fileNameKML = `output_${i + 1}.kml`;

    // Salvataggio del file KML usando FileSaver.js

    // saveAs(kmlBlob, fileNameKML);
}


