import {IParkingGraph} from "../../_types/graph/IParkingGraph";

export const lot = {
    "0": {x: 7, y: 6, edges: [{end: "1"}, {end: "19"}]},
    "1": {x: 7, y: 5, edges: [{end: "exit"}, {end: "2"}]},
    "2": {x: 7, y: 3, edges: [{end: "3"}, {end: "20"}]},
    "3": {x: 7, y: 0, edges: [{end: "4"}, {end: "21"}]},
    "4": {x: 7, y: -3, edges: [{end: "5"}, {end: "22"}]},
    "5": {x: 7, y: -6, edges: [{end: "6"}, {end: "23"}]},
    "6": {x: 7, y: -9, edges: [{end: "7"}, {end: "24"}]},
    "7": {x: 7, y: -12, edges: [{end: "8"}, {end: "25"}]},
    "8": {x: 7, y: -14, edges: [{end: "9"}]},
    "9": {x: 15, y: -14, edges: [{end: "10"}]},
    "10": {x: 15, y: -12, edges: [{end: "11"}, {end: "26"}]},
    "11": {x: 15, y: -9, edges: [{end: "12"}, {end: "27"}]},
    "12": {x: 15, y: -6, edges: [{end: "13"}, {end: "28"}]},
    "13": {x: 15, y: -3, edges: [{end: "14"}, {end: "29"}]},
    "14": {x: 15, y: 0, edges: [{end: "15"}, {end: "30"}]},
    "15": {x: 15, y: 3, edges: [{end: "16"}, {end: "31"}]},
    "16": {x: 15, y: 6, edges: [{end: "17"}, {end: "32"}, {end: "stairs"}]},
    "17": {x: 15, y: 8, edges: [{end: "18"}]},
    "18": {x: 7, y: 8, edges: [{end: "0"}]},
    "19": {x: 10, y: 6, tags: ["spot"], edges: [{end: "0"}]},
    "20": {x: 10, y: 3, tags: ["spot"], edges: [{end: "2"}]},
    "21": {x: 10, y: 0, tags: ["spot"], edges: [{end: "3"}]},
    "22": {x: 10, y: -3, tags: ["spot"], edges: [{end: "4"}]},
    "23": {x: 10, y: -6, tags: ["spot"], edges: [{end: "5"}]},
    "24": {x: 10, y: -9, tags: ["spot"], edges: [{end: "6"}]},
    "25": {x: 10, y: -12, tags: ["spot"], edges: [{end: "7"}]},
    "26": {x: 12, y: -12, tags: ["spot"], edges: [{end: "10"}]},
    "27": {x: 12, y: -9, tags: ["spot"], edges: [{end: "11"}]},
    "28": {x: 12, y: -6, tags: ["spot"], edges: [{end: "12"}]},
    "29": {x: 12, y: -3, tags: ["spot"], edges: [{end: "13"}]},
    "30": {x: 12, y: 0, tags: ["spot"], edges: [{end: "14"}]},
    "31": {x: 12, y: 3, tags: ["spot"], edges: [{end: "15"}]},
    "32": {x: 12, y: 6, tags: ["spot"], edges: [{end: "16"}]},
    entrance: {x: 0, y: 0, tags: ["entrance"], edges: [{end: "3"}]},
    exit: {x: 0, y: 5, tags: ["exit"], edges: []},
    stairs: {x: 17, y: 6, tags: ["pedestrianEntrance", "pedestrianExit"], edges: []},
} as IParkingGraph;