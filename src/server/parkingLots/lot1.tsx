import {IParkingGraph} from "../../_types/graph/IParkingGraph";

export const lot = {
    "0": {
        x: 7,
        y: 6,
        edges: [
            {end: "1", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "19", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "1": {
        x: 7,
        y: 5,
        edges: [
            {end: "exit", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "2", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "2": {
        x: 7,
        y: 3,
        edges: [
            {end: "3", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "20", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "3": {
        x: 7,
        y: 0,
        edges: [
            {end: "4", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "21", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "4": {
        x: 7,
        y: -3,
        edges: [
            {end: "5", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "22", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "5": {
        x: 7,
        y: -6,
        edges: [
            {end: "6", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "23", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "6": {
        x: 7,
        y: -9,
        edges: [
            {end: "7", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "24", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "7": {
        x: 7,
        y: -12,
        edges: [
            {end: "8", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "25", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "8": {
        x: 7,
        y: -14,
        edges: [{end: "9", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "9": {
        x: 15,
        y: -14,
        edges: [{end: "10", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "10": {
        x: 15,
        y: -12,
        edges: [
            {end: "11", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "26", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "11": {
        x: 15,
        y: -9,
        edges: [
            {end: "12", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "27", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "12": {
        x: 15,
        y: -6,
        edges: [
            {end: "13", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "28", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "13": {
        x: 15,
        y: -3,
        edges: [
            {end: "14", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "29", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "14": {
        x: 15,
        y: 0,
        edges: [
            {end: "15", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "30", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "15": {
        x: 15,
        y: 3,
        edges: [
            {end: "16", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "31", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "16": {
        x: 15,
        y: 6,
        edges: [
            {end: "17", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "32", tags: ["carPath", "pedestrianPath", "botPath"]},
            {end: "stairs", tags: ["carPath", "pedestrianPath", "botPath"]},
        ],
    },
    "17": {
        x: 15,
        y: 8,
        edges: [{end: "18", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "18": {
        x: 7,
        y: 8,
        edges: [{end: "0", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "19": {
        x: 10,
        y: 6,
        tags: ["spot"],
        edges: [{end: "0", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "20": {
        x: 10,
        y: 3,
        tags: ["spot"],
        edges: [{end: "2", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "21": {
        x: 10,
        y: 0,
        tags: ["spot"],
        edges: [{end: "3", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "22": {
        x: 10,
        y: -3,
        tags: ["spot"],
        edges: [{end: "4", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "23": {
        x: 10,
        y: -6,
        tags: ["spot"],
        edges: [{end: "5", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "24": {
        x: 10,
        y: -9,
        tags: ["spot"],
        edges: [{end: "6", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "25": {
        x: 10,
        y: -12,
        tags: ["spot"],
        edges: [{end: "7", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "26": {
        x: 12,
        y: -12,
        tags: ["spot"],
        edges: [{end: "10", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "27": {
        x: 12,
        y: -9,
        tags: ["spot"],
        edges: [{end: "11", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "28": {
        x: 12,
        y: -6,
        tags: ["spot"],
        edges: [{end: "12", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "29": {
        x: 12,
        y: -3,
        tags: ["spot"],
        edges: [{end: "13", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "30": {
        x: 12,
        y: 0,
        tags: ["spot"],
        edges: [{end: "14", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "31": {
        x: 12,
        y: 3,
        tags: ["spot"],
        edges: [{end: "15", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    "32": {
        x: 12,
        y: 6,
        tags: ["spot"],
        edges: [{end: "16", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    entrance: {
        x: 0,
        y: 0,
        tags: ["entrance"],
        edges: [{end: "3", tags: ["carPath", "pedestrianPath", "botPath"]}],
    },
    exit: {x: 0, y: 5, tags: ["exit"], edges: []},
    stairs: {x: 17, y: 6, tags: ["pedestrianEntrance", "pedestrianExit"], edges: []},
} as IParkingGraph;
