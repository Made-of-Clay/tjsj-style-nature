/*
This is abandoned as I suck at debugging TSL currently.
Something about an undefined where a string.replace is
being attempted. Has entirely to do with my use of TSL.
*/
import { Color } from 'three';
import { Fn, positionGeometry, time, vec3 } from 'three/tsl';
import { NodeBuilder } from 'three/webgpu';

const defaults = {
    name: 'Caustics',
    position: positionGeometry,
    scale: 2,
    speed: 0,
    time: time,
    color: new Color(0x50a8c0),
    seed: 0,
};

// const cuasticsRaw = Fn((x) => {
const causticsRaw = Fn(([position, scale, speed, time, color, seed]: any[], _: NodeBuilder) => {
    console.log(position, scale, speed, time, color, seed);
    // const pos = position
    // .mul(exp(scale.sub(1)))
    // .add(seed)
    // .toVar();

    // const t = time
    // .mul(speed.sub(1).exp())
    // .add(vec3(0, (2 * Math.PI) / 3, (4 * Math.PI) / 3))
    // .sin();

    // const p = voronoi3(
    //     pos.add(vec3(voronoi(pos.add(t.xyz)), voronoi(pos.add(t.yzx)), voronoi(pos.add(t.zxy)))),
    // );
    // const p = pos;

    // const normalizedLength = p.length().div(Math.sqrt(3));

    // return normalizedLength.add(color.sub(0.5).mul(2));
    // return normalizedLength;
    return position;
}).setLayout({
    name: 'causticsRaw',
    type: 'vec3',
    inputs: [
        { name: 'position', type: 'vec3' },
        { name: 'scale', type: 'float' },
        { name: 'speed', type: 'float' },
        { name: 'time', type: 'float' },
        { name: 'color', type: 'vec3' },
        { name: 'seed', type: 'float' },
    ],
});

export function caustics(params: Partial<typeof defaults> = defaults) {
    const p = { ...defaults, ...params };
    return causticsRaw(
        p.position,
        p.scale,
        p.speed,
        p.time,
        vec3(p.color.r, p.color.g, p.color.b), // or colorNode(p.color)
        p.seed,
    );
}

caustics.defaults = defaults;
