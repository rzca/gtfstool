import JSZip from "jszip";
import simplify from "simplify-js";
import { csvParse } from "d3-dsv";
import { encodeXML } from "./utils";

interface IRoute {
    routeId: string;
    routeLongName: string;
    routeColor?: string
}

interface IShapePoint {
    shapeId: string;
    shapePtLat: number;
    shapePtLon: number;
    shapePtSequence: number;
}

const loadRoutes = (text: string): { [routeId: string]: IRoute } => {
    const agencyField = "agency_id";
    const routeIdField = "route_id";
    const routeShortNameField = "route_short_name";
    const routeLongNameField = "route_long_name";
    const routeTypeField = "route_type";
    const routeUrlField = "route_url";
    const routeColorField = "route_color";
    const routeTextColorField = "route_text_color";

    if (text == null) {
        console.log("Zzzz")
    }
    const routes: { [routeName: string]: IRoute } = {};

    const rs = csvParse(text);
    rs.forEach(r => {
        console.log(r)
        const routeId = r[routeIdField]?.replace(/["']/g, '');
        const routeLongName = r[routeLongNameField]?.replace(/["']/g, '');
        const routeColor = r[routeColorField]?.replace(/["']/g, '');

        if (routeId == null || routeLongName == null) {
            console.error("route_id or route_name cannot be undefined", r);
        }
        else {
            routes[routeId!] = { routeId, routeLongName, routeColor };
        }
    })
    return routes;
}

const loadShapes = (text: string): IShapePoint[] => {
    const shapeIdField = "shape_id";
    const shapePtLatField = "shape_pt_lat";
    const shapePtLonField = "shape_pt_lon";
    const shapePtSequenceField = "shape_pt_sequence";

    const rs = csvParse(text);
    const data: IShapePoint[] = [];
    rs.forEach(r => {
        const shapeId = r[shapeIdField];
        const shapePtLat = r[shapePtLatField]?.replace(/"/g, '');
        const shapePtLon = r[shapePtLonField]?.replace(/"/g, '');
        const shapePtSequence = r[shapePtSequenceField];

        if (shapeId == null || shapePtLat == null || shapePtLon == null || shapePtSequence == null) {
            console.error("cannot have undefined shapes", r)
        } else {
            data.push({
                shapeId,
                shapePtLat: parseFloat(shapePtLat),
                shapePtLon: parseFloat(shapePtLon),
                shapePtSequence: parseInt(shapePtSequence),
            });
        }
    })

    return data;
}

const loadTrips = (text: string) => {
    const routeIdField = "route_id";
    const shapeIdField = "shape_id";

    const rs = csvParse(text);

    const shapeToRouteMap: { [cleanedShapeId: string]: string } = {};

    rs.forEach(r => {
        const routeId = r[routeIdField]?.replace(/["']/g, '');
        const shapeId = r[shapeIdField]?.replace(/["']/g, '');
        if (routeId == null || shapeId == null) {
            console.error("cannot have null route_id or shape_id", r);
        } else {
            console.log("dd", routeId, shapeId)
            shapeToRouteMap[shapeId] = routeId;
        }
    })

    return shapeToRouteMap;
}

const groupLinesByShapeId = (data: IShapePoint[]): { [shapeId: string]: IShapePoint[] } => {
    const groupedData: { [shapeId: string]: IShapePoint[] } = {};

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
        return { x: sp.shapePtLon, y: sp.shapePtLat }
    });

    const simplifiedShape = simplify(points, .00003); // seems to work

    return simplifiedShape.map((ss, index) => {
        return { shapeId: shapePoints[0]!.shapeId, shapePtLon: ss.x, shapePtLat: ss.y, shapePtSequence: index }
    });
}


interface IKmlResponse {
    kml: string,
    // routes: {[routeId: string]: IRoute}
}

export const toKml = async (zipBlob: ArrayBuffer): Promise<IKmlResponse> => {
    var jsZip = new JSZip();

    const data = await jsZip.loadAsync(zipBlob);

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

    const groupedData = groupLinesByShapeId(shapes);

    var kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
        '\t<Document>\n';

    Object.entries(shapeToRouteMap).forEach(entry => {
        const shapeId = entry[0].replace(/["']/g, '');
        const routeId = entry[1];

        const routeInfo = routes[routeId];


        const shapePoints = groupedData[shapeId];

        // if there are no shapePoints for the specified shape, then do nothing
        if (shapePoints == null || routeInfo == null) {
        }
        else {
            const group = simplifyShape(shapePoints);

            const hexColorSixDigit = routeInfo?.routeColor?.replace("#", "");

            const colorString =
                '\t\t\t<Style>\n' +
                '\t\t\t\t<LineStyle>\n' +
                `\t\t\t\t\t<color>ff${hexColorSixDigit}</color>\n` +
                '\t\t\t\t\t<width>4</width>\n' +
                '\t\t\t\t</LineStyle>\n' +
                '\t\t\t</Style>\n';

            // console.log(group[0] ?? "undef")
            kml += '\t\t<Placemark>\n' +
                `\t\t\t<name>${encodeXML(routeInfo.routeLongName + " (" + routeInfo.routeId + ")")}</name>\n` +
                `${colorString != null ? colorString : ''}` +
                '\t\t\t\t<LineString>\n' +
                '\t\t\t\t\t<coordinates>\n' +
                group.map(row => {
                    return `\t\t\t\t\t\t\t${row.shapePtLon},${row.shapePtLat},0`
                }).join(' \n') + // must have trailing space
                '\n\t\t\t\t\t</coordinates>\n' +
                '\t\t\t\t</LineString>\n' +
                '\t\t</Placemark>\n';
        }

    })

    kml += '\t</Document>\n</kml>';

    return { kml };

}