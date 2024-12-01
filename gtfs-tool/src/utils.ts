import JSZip from "jszip";
import simplify from "simplify-js";

// TODO switch to column names not positions

export const add = (a: number, b: number) => a + b;

const loadRoutes = (text: string) => {
    if (text == null) {
        console.log("Zzzz")
    }
    const rows = text.split("\n").map(line => line.split(","));
    const routes: { [routeName: string]: string } = {};

    for (let i = 1; i < rows.length; i++) {
        if (rows[i] != null && rows[i]![0] != null) {
            // console.log(rows[i])
            const [raw_route_id, agency_id, route_short_name, route_long_name] = rows[i]!;
            const route_id = raw_route_id!.replace(/["']/g, '');
            routes[route_id] = route_long_name!;
        }

    }
    return routes;
}

interface IShapePoint {
    shapeId: string;
    shapePtLat: string;
    shapePtLon: string;
    shapePtSequence: string;
}

const loadShapes = (text: string): IShapePoint[] => {
    const rows = text.split("\n").map(line => line.split(","));

    const data = [];
    for (let i = 1; i < rows.length; i++) { // Inizia da 1 per saltare l'intestazione
        const row = rows[i];
        // console.log(row)
        if (row != null && row.length > 4) {
            const [shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence] = row;
            // Rimuovi le virgolette da shape_pt_lat e shape_pt_lon
            const cleaned_lat = shape_pt_lat!.replace(/"/g, '');
            const cleaned_lon = shape_pt_lon!.replace(/"/g, '');

            const shapeId = shape_id!;
            const shapePtSequence = shape_pt_sequence!;
            const shapePtLat = cleaned_lat;
            const shapePtLon = cleaned_lon;

            data.push({
                shapeId,
                shapePtLat,
                shapePtLon,
                shapePtSequence,
            });
        }
    }
    return data;
}

const loadTrips = (text: string) => {
    const rows = text.split("\n").map(line => line.split(","));
    console.log(rows)

    const shapeToRouteMap: { [cleanedShapeId: string]: string } = {};

    for (let i = 1; i < rows.length; i++) {
        if (rows[i] != null && rows[i]?.length != null && rows[i]!.length > 6) {
            // console.log(rows[i])
            const [trip_id, route_id, service_id, trip_headsign, direction_id, block_id, shape_id] = rows[i]!;
            const cleanedRouteId = route_id!.replace(/["']/g, ''); // Rimuovi le virgolette
            if (shape_id !== undefined) {
                const cleanedShapeId = shape_id.replace(/["']/g, ''); // Rimuovi le virgolette
                if (cleanedShapeId !== undefined) {
                    // console.log("shape", shape_id, cleanedShapeId, "route", cleanedRouteId)
                    shapeToRouteMap[cleanedShapeId] = cleanedRouteId;
                }
            }
        }
    }
    console.log(shapeToRouteMap)
    return shapeToRouteMap;
}

const groupLinesByShapeId = (data: IShapePoint[]): { [shapeId: string]: IShapePoint[] } => {
    const groupedData: { [shapeId: string]: any[] } = {};

    data.forEach((row) => {
        const shapeId = row.shapeId;
        if (!groupedData[shapeId]) {
            groupedData[shapeId] = [];
        }

        groupedData[shapeId]!.push(row);
    });

    return groupedData;
}

const simplifyShape = (shapePoints: IShapePoint[]): IShapePoint[] => {
    const points = shapePoints.map(sp => {
        return { x: parseFloat(sp.shapePtLon), y: parseFloat(sp.shapePtLat) }
    });

    const simplifiedShape = simplify(points, .00003); // seems to work

    return simplifiedShape.map((ss, index) => {
        return { shapeId: shapePoints[0]!.shapeId, shapePtLon: ss.x.toString(), shapePtLat: ss.y.toString(), shapePtSequence: index.toString() }
    });
}

const encodeXML = (str: string) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export const toKml = async (zipBlob: ArrayBuffer): Promise<string> => {
    var jsZip = new JSZip();

    const data = await jsZip.loadAsync(zipBlob);
    if (data == undefined) {
        return "";
    }

    const routesFile = data.files["routes.txt"];
    const str = await routesFile?.async("string")!;
    const routes = loadRoutes(str);


    const shapesFile = data.files["shapes.txt"];
    const shapesStr = await shapesFile?.async("string")!;
    const shapes = loadShapes(shapesStr);
    // console.log(shapes);

    const tripsFile = data.files["trips.txt"];
    const tripsStr = await tripsFile?.async("string")!;
    const shapeToRouteMap = loadTrips(tripsStr);

    console.log(shapeToRouteMap)

    const groupedData = groupLinesByShapeId(shapes);

    // var progress = 0;
    var kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
        '\t<Document>\n';

    Object.entries(shapeToRouteMap).forEach(entry => {
        const shapeId = String(entry[0]).replace(/["']/g, '');
        const routeId = entry[1];
        // console.log(entry)
        const routeName = routes[routeId]!;
        // const groups = Object.values(groupedData);
        const shapePoints = groupedData[shapeId]!;
        const group = simplifyShape(shapePoints);
        // const group = groupedData[shapeId]!;
        // console.log(Object.keys(groupedData))
        if (group == null) {

            // console.log("null", shapeId)
            
            
            // console.log(groups)
        }
        else {
            // console.log(group[0] ?? "undef")
            kml += '\t\t<Placemark>\n' +
            `\t\t\t<name>${encodeXML(routeName + " (" + routeId + ")")}</name>\n` + // Aggiunge il nome come shape_id
            //     '<Style>' +
            //     '<LineStyle>' +
            //       '<color>7f00ff00</color>' +
            //       '<width>8</width>' +
            //     '</LineStyle>' +
            //   '</Style>' +
            '\t\t\t\t<LineString>\n' +
            '\t\t\t\t\t<coordinates>\n' +
            group.map(row => {
                if (row == null) {
                    // console.log("undefined")
                }
                return `\t\t\t\t\t\t\t${parseFloat(row.shapePtLon)},${parseFloat(row.shapePtLat)},0`
            }).join(' \n') + // must have trailing space
            '\t\t\t\t\t</coordinates>\n' +
            '\t\t\t\t</LineString>\n' +
            '\t\t</Placemark>\n';
        }

    })

    kml += '\t</Document>\n</kml>';

    return kml;

}